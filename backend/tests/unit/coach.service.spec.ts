import { CoachService } from 'src/modules/coach/services/coach.service';
import { PrismaService } from 'src/shared/db/prisma.service';
import { LlmClient } from 'src/shared/llm/llm.client';

function createPrismaMock() {
  return {
    coachAnalysisSession: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({
        id: 1n,
        status: 'processing',
        sourceType: 'body_photo',
        analysisSummaryJson: {},
        createdAt: new Date('2026-03-15T00:00:00.000Z'),
        updatedAt: new Date('2026-03-15T00:00:00.000Z'),
        chatMessages: [],
      }),
      update: jest.fn().mockResolvedValue({
        id: 1n,
        status: 'ready',
        sourceType: 'body_photo',
        analysisSummaryJson: {
          bodyTypeSummary: '保守分析',
          confidenceNote: '兜底',
          highlights: ['重点 1'],
          risks: ['风险 1'],
          actionSuggestions: ['建议 1'],
          disclaimer: '免责声明',
        },
        createdAt: new Date('2026-03-15T00:00:00.000Z'),
        updatedAt: new Date('2026-03-15T00:01:00.000Z'),
        chatMessages: [],
      }),
      findFirst: jest.fn().mockResolvedValue({
        id: 2n,
        status: 'ready',
        sourceType: 'body_photo',
        analysisSummaryJson: {
          bodyTypeSummary: '测试结论',
          confidenceNote: '测试说明',
          highlights: ['重点 1'],
          risks: ['风险 1'],
          actionSuggestions: ['建议 1'],
          disclaimer: '免责声明',
        },
        createdAt: new Date('2026-03-15T00:00:00.000Z'),
        updatedAt: new Date('2026-03-15T00:02:00.000Z'),
        chatMessages: [],
      }),
    },
    coachChatMessage: {
      count: jest.fn().mockResolvedValue(0),
      create: jest
        .fn()
        .mockResolvedValueOnce({
          id: 10n,
          role: 'user',
          content: '腰腹怎么改善？',
          createdAt: new Date('2026-03-15T00:03:00.000Z'),
        })
        .mockResolvedValueOnce({
          id: 11n,
          role: 'assistant',
          content: '先保证一周 3 次训练，再配合步行和饮食节奏。',
          createdAt: new Date('2026-03-15T00:04:00.000Z'),
        }),
    },
  };
}

describe('CoachService', () => {
  it('falls back to built-in analysis when llm is disabled', async () => {
    const prisma = createPrismaMock();
    const llmClient = {
      isEnabled: false,
      createVisionJsonCompletion: jest.fn(),
      createTextCompletion: jest.fn(),
    } as unknown as LlmClient;
    const service = new CoachService(prisma as unknown as PrismaService, llmClient);

    const result = await service.analyzeBodyPhoto(1n, {
      buffer: Buffer.from('test'),
      mimetype: 'image/jpeg',
      size: 4,
      originalname: 'body.jpg',
    });

    expect(result.status).toBe('ready');
    expect(result.analysisSummary.bodyTypeSummary.length).toBeGreaterThan(0);
    expect(prisma.coachAnalysisSession.create).toHaveBeenCalledTimes(1);
    expect(prisma.coachAnalysisSession.update).toHaveBeenCalledTimes(1);
  });

  it('falls back to built-in reply when llm is disabled', async () => {
    const prisma = createPrismaMock();
    const llmClient = {
      isEnabled: false,
      createVisionJsonCompletion: jest.fn(),
      createTextCompletion: jest.fn(),
    } as unknown as LlmClient;
    const service = new CoachService(prisma as unknown as PrismaService, llmClient);

    const result = await service.createMessage(1n, '2', {
      content: '腰腹怎么改善？',
    });

    expect(result.sessionId).toBe('2');
    expect(result.message.role).toBe('assistant');
    expect(result.message.content.length).toBeGreaterThan(0);
    expect(prisma.coachChatMessage.create).toHaveBeenCalledTimes(2);
  });
});
