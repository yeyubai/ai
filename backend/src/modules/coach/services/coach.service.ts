import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/db/prisma.service';
import { LlmClient } from 'src/shared/llm/llm.client';
import {
  getTodayInTimezone,
  parseDateOnly,
  shiftDateString,
} from 'src/shared/utils/date.utils';
import { CoachAnalysisSessionResponseDto } from '../dto/coach-analysis-session-response.dto';
import { CoachAnalysisSummaryDto } from '../dto/coach-analysis-summary.dto';
import { CoachChatMessageDto } from '../dto/coach-chat-message.dto';
import { CoachChatReplyResponseDto } from '../dto/coach-chat-reply-response.dto';
import { CoachLatestSessionResponseDto } from '../dto/coach-latest-session-response.dto';
import { CreateCoachMessageRequestDto } from '../dto/create-coach-message-request.dto';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

type StoredSession = {
  id: bigint;
  status: string;
  sourceType: string;
  analysisSummaryJson: unknown;
  createdAt: Date;
  updatedAt: Date;
  chatMessages: Array<{
    id: bigint;
    role: string;
    content: string;
    createdAt: Date;
  }>;
};

const ANALYSIS_DAILY_LIMIT = 3;
const CHAT_DAILY_LIMIT = 30;
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

@Injectable()
export class CoachService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llmClient: LlmClient,
  ) {}

  async getLatestSession(userId: bigint): Promise<CoachLatestSessionResponseDto> {
    const session = await this.prisma.coachAnalysisSession.findFirst({
      where: { userId, deletedAt: null },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      session: session ? this.toSessionDto(session) : null,
    };
  }

  async getSession(userId: bigint, sessionId: string): Promise<CoachAnalysisSessionResponseDto> {
    const id = this.parseSessionId(sessionId);
    const session = await this.prisma.coachAnalysisSession.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('INVALID_PARAMS');
    }

    return this.toSessionDto(session);
  }

  async analyzeBodyPhoto(
    userId: bigint,
    file: UploadedImageFile | undefined,
  ): Promise<CoachAnalysisSessionResponseDto> {
    this.ensureValidImage(file);
    await this.ensureAnalysisLimit(userId);

    const session = await this.prisma.coachAnalysisSession.create({
      data: {
        userId,
        status: 'processing',
        sourceType: 'body_photo',
        analysisSummaryJson: this.toInputJson(this.buildProcessingSummary()),
      },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    try {
      const summary = await this.generateAnalysisSummary(file as UploadedImageFile);
      const updated = await this.prisma.coachAnalysisSession.update({
        where: { id: session.id },
        data: {
          status: 'ready',
          analysisSummaryJson: this.toInputJson(summary),
        },
        include: {
          chatMessages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return this.toSessionDto(updated);
    } catch {
      const fallbackSummary = this.buildFallbackAnalysisSummary();
      const updated = await this.prisma.coachAnalysisSession.update({
        where: { id: session.id },
        data: {
          status: 'ready',
          analysisSummaryJson: this.toInputJson(fallbackSummary),
        },
        include: {
          chatMessages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return this.toSessionDto(updated);
    }
  }

  async createMessage(
    userId: bigint,
    sessionId: string,
    payload: CreateCoachMessageRequestDto,
  ): Promise<CoachChatReplyResponseDto> {
    const id = this.parseSessionId(sessionId);
    const session = await this.prisma.coachAnalysisSession.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('INVALID_PARAMS');
    }

    if (session.status !== 'ready') {
      throw new BadRequestException('INVALID_PARAMS');
    }

    await this.ensureChatLimit(userId);

    const userMessage = payload.content.trim();
    await this.prisma.coachChatMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: userMessage,
      },
    });

    const summary = this.normalizeAnalysisSummary(session.analysisSummaryJson);
    const history = session.chatMessages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-12)
      .map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: message.content,
      }));

    let replyText: string;
    try {
      replyText = await this.generateCoachReply(summary, history, userMessage);
    } catch {
      replyText = this.buildFallbackChatReply(summary);
    }

    const assistantMessage = await this.prisma.coachChatMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: replyText,
      },
    });

    await this.prisma.coachAnalysisSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    return {
      sessionId,
      message: this.toMessageDto(assistantMessage),
    };
  }

  private async ensureAnalysisLimit(userId: bigint): Promise<void> {
    const [startDate, endDate] = this.getTodayRange();
    const count = await this.prisma.coachAnalysisSession.count({
      where: {
        userId,
        deletedAt: null,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    if (count >= ANALYSIS_DAILY_LIMIT) {
      throw new HttpException('COACH_ANALYSIS_RATE_LIMIT', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private async ensureChatLimit(userId: bigint): Promise<void> {
    const [startDate, endDate] = this.getTodayRange();
    const count = await this.prisma.coachChatMessage.count({
      where: {
        role: 'user',
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        session: {
          userId,
          deletedAt: null,
        },
      },
    });

    if (count >= CHAT_DAILY_LIMIT) {
      throw new HttpException('COACH_CHAT_RATE_LIMIT', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private ensureValidImage(file: UploadedImageFile | undefined): void {
    if (!file) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('INVALID_PARAMS');
    }
  }

  private async generateAnalysisSummary(file: UploadedImageFile): Promise<CoachAnalysisSummaryDto> {
    if (!this.llmClient.isEnabled) {
      return this.buildFallbackAnalysisSummary();
    }

    const imageDataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const completion = await this.llmClient.createVisionJsonCompletion({
      systemPrompt: [
        '你是一名中文体型分析教练。',
        '你只能输出生活方式与塑形建议，严禁输出疾病诊断、药物建议、医疗判断。',
        '请只输出 JSON，不要输出 markdown 代码块。',
        'JSON 字段固定为：bodyTypeSummary, confidenceNote, highlights, risks, actionSuggestions, disclaimer。',
        'highlights、risks、actionSuggestions 都必须是 2 到 4 条简短中文数组。',
      ].join(' '),
      userPrompt: [
        '请基于这张体型照片做保守、友好的体型观察。',
        '重点关注脂肪分布、站姿与体态印象、优先改善方向。',
        '不要假装能做医学诊断，也不要对年龄、疾病、性别做确定性判断。',
      ].join(' '),
      imageDataUrl,
    });

    return this.normalizeAnalysisSummary(this.parseJsonObject(completion));
  }

  private async generateCoachReply(
    summary: CoachAnalysisSummaryDto,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string,
  ): Promise<string> {
    if (!this.llmClient.isEnabled) {
      return this.buildFallbackChatReply(summary);
    }

    const completion = await this.llmClient.createTextCompletion([
      {
        role: 'system',
        content: [
          '你是一名中文高级私教。',
          '用户已经完成一次体型分析，你需要基于本次分析结果继续追问。',
          '禁止医学诊断、疾病判断、药物或治疗建议。',
          '回答保持 3 到 5 句，尽量具体，优先给动作、频次、执行建议。',
          `分析结果：${JSON.stringify(summary)}`,
        ].join('\n'),
      },
      ...history,
      {
        role: 'user',
        content: userMessage,
      },
    ]);

    return completion.trim() || this.buildFallbackChatReply(summary);
  }

  private parseJsonObject(value: string): Record<string, unknown> {
    const normalized = value
      .trim()
      .replace(/^```json/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    return JSON.parse(normalized) as Record<string, unknown>;
  }

  private normalizeAnalysisSummary(value: unknown): CoachAnalysisSummaryDto {
    const source =
      typeof value === 'object' && value !== null
        ? (value as Record<string, unknown>)
        : {};

    return {
      bodyTypeSummary: this.readString(
        source.bodyTypeSummary,
        '当前照片适合做整体体型观察，建议优先关注腰腹线条、体态稳定和训练节奏。',
      ),
      confidenceNote: this.readString(
        source.confidenceNote,
        '本次分析基于单张照片的保守判断，仅供训练与生活方式参考。',
      ),
      highlights: this.readStringArray(source.highlights, [
        '体型观察更适合从整体围度和脂肪分布入手。',
        '建议配合体重、腰围和正侧面照片一起跟踪变化。',
      ]),
      risks: this.readStringArray(source.risks, [
        '单张照片容易受角度、光线和衣物影响。',
        '不要把本次结果当作医学诊断结论。',
      ]),
      actionSuggestions: this.readStringArray(source.actionSuggestions, [
        '每周固定拍一次同角度照片，和体重一起记录。',
        '先建立 3 到 4 次规律训练，再观察 2 周变化。',
        '优先改善久坐、熬夜和高热量加餐习惯。',
      ]),
      disclaimer: this.readString(
        source.disclaimer,
        '本结果仅提供体型观察与生活方式建议，不构成医疗意见。',
      ),
    };
  }

  private buildProcessingSummary(): CoachAnalysisSummaryDto {
    return {
      bodyTypeSummary: '正在生成体型分析...',
      confidenceNote: '系统正在处理上传图片。',
      highlights: [],
      risks: [],
      actionSuggestions: [],
      disclaimer: '分析完成后将展示正式结果。',
    };
  }

  private buildFallbackAnalysisSummary(): CoachAnalysisSummaryDto {
    return {
      bodyTypeSummary:
        '这张照片更适合做整体体型趋势观察，建议先关注腰腹变化、体态稳定和训练节奏。',
      confidenceNote: '本次结果采用保守兜底分析，适合作为生活方式调整参考。',
      highlights: [
        '适合配合体重与腰围一起观察，而不是只看单张照片。',
        '如果目标是改善线条，优先建立持续训练和饮食节奏。',
      ],
      risks: [
        '单张照片容易受到衣物、姿势和拍摄角度影响。',
        '本结果不提供疾病或医疗层面的判断。',
      ],
      actionSuggestions: [
        '每周固定一次同角度拍照，建立连续对比。',
        '本周先保证 3 次训练和 2 次快走，再看变化。',
        '把高热量零食和夜宵压到每周 1 到 2 次以内。',
      ],
      disclaimer: '本结果仅提供体型观察与生活方式建议，不构成医疗意见。',
    };
  }

  private buildFallbackChatReply(summary: CoachAnalysisSummaryDto): string {
    return [
      `先围绕“${summary.bodyTypeSummary}”这条主线去执行会更稳。`,
      '建议把注意力放在训练频率、日常活动量和饮食节奏三件事上，先保证连续两周不掉线。',
      '如果你愿意，可以继续追问腰腹、肩背或下肢哪一块更值得优先改善。',
    ].join('\n');
  }

  private getTodayRange(): [Date, Date] {
    const today = getTodayInTimezone();
    return [parseDateOnly(today), parseDateOnly(shiftDateString(today, 1))];
  }

  private parseSessionId(sessionId: string): bigint {
    try {
      return BigInt(sessionId);
    } catch {
      throw new NotFoundException('INVALID_PARAMS');
    }
  }

  private toSessionDto(session: StoredSession): CoachAnalysisSessionResponseDto {
    return {
      sessionId: session.id.toString(),
      status: session.status as 'processing' | 'ready' | 'failed',
      sourceType: session.sourceType as 'body_photo',
      analysisSummary: this.normalizeAnalysisSummary(session.analysisSummaryJson),
      messages: session.chatMessages.map((message) => this.toMessageDto(message)),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  private toMessageDto(message: {
    id: bigint;
    role: string;
    content: string;
    createdAt: Date;
  }): CoachChatMessageDto {
    return {
      id: message.id.toString(),
      role: message.role as 'user' | 'assistant' | 'system',
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    };
  }

  private readString(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim().length > 0
      ? value.trim()
      : fallback;
  }

  private readStringArray(value: unknown, fallback: string[]): string[] {
    if (!Array.isArray(value)) {
      return fallback;
    }

    const result = value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    return result.length > 0 ? result.slice(0, 4) : fallback;
  }

  private toInputJson(summary: CoachAnalysisSummaryDto): Prisma.InputJsonValue {
    return {
      bodyTypeSummary: summary.bodyTypeSummary,
      confidenceNote: summary.confidenceNote,
      highlights: summary.highlights,
      risks: summary.risks,
      actionSuggestions: summary.actionSuggestions,
      disclaimer: summary.disclaimer,
    };
  }
}
