import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { InputJsonValue, JsonObject, JsonValue } from '@prisma/client/runtime/library';
import { LlmClient } from 'src/shared/llm/llm.client';
import { AiPayloadSource, AiPlanResponseDto } from '../dto/ai-plan-response.dto';
import { AiProviderDto } from '../dto/ai-provider.dto';
import { AiReviewResponseDto } from '../dto/ai-review-response.dto';
import { CreateAiPlanRequestDto } from '../dto/create-ai-plan-request.dto';
import { CreateAiReviewRequestDto } from '../dto/create-ai-review-request.dto';
import { AiPlanRecord, AiRepository, AiReviewRecord } from '../repositories/ai.repository';

type AiPlanPayload = {
  calorieTargetKcal: number;
  meals: Array<{
    name: string;
    suggestion: string;
    kcal: number;
  }>;
  activity: {
    type: string;
    durationMin: number;
    intensity: 'low' | 'medium' | 'high';
  };
  topActions: string[];
  riskFlags: string[];
  summaryText: string;
};

type AiReviewPayload = {
  score: number;
  highlights: string[];
  gaps: string[];
  tomorrowFocus: string[];
  riskFlags: string[];
  summaryText: string;
};

type GeneratedPlan = {
  source: AiPayloadSource;
  payload: AiPlanPayload;
};

type GeneratedReview = {
  source: AiPayloadSource;
  payload: AiReviewPayload;
};

type CheckinCompletion = {
  weightCount: number;
  mealCount: number;
  activityCount: number;
  sleepCount: number;
};

const PLAN_DAILY_LIMIT = 3;
const PLAN_REFRESH_LIMIT = 2;
const REVIEW_DAILY_LIMIT = 2;
const MEDICAL_TERMS = ['诊断', '处方', '用药', '药物', '治疗', '病症'];

@Injectable()
export class AiService {
  constructor(
    private readonly aiRepository: AiRepository,
    private readonly llmClient: LlmClient,
  ) {}

  getProvider(): AiProviderDto {
    return { provider: this.llmClient.provider };
  }

  async createPlan(
    userId: bigint,
    payload: CreateAiPlanRequestDto,
  ): Promise<AiPlanResponseDto> {
    const date = this.normalizeDate(payload.date);
    this.ensureValidTimezone(payload.timezone);
    const forceRefresh = payload.forceRefresh ?? false;
    const planDate = this.parseDateOnly(date);

    const latestPlan = await this.aiRepository.findLatestPlanByDate(userId, planDate);
    if (!forceRefresh && latestPlan) {
      return this.toPlanResponse(latestPlan);
    }

    if (forceRefresh && latestPlan && latestPlan.refreshSeq >= PLAN_REFRESH_LIMIT) {
      this.throwAiRateLimit();
    }

    const planCount = await this.aiRepository.countPlansByDate(userId, planDate);
    if (planCount >= PLAN_DAILY_LIMIT) {
      this.throwAiRateLimit();
    }

    const generated = await this.buildPlanPayload(userId, date, planDate);
    const refreshSeq = forceRefresh ? (latestPlan?.refreshSeq ?? -1) + 1 : 0;

    const created = await this.aiRepository.createPlan({
      userId,
      planDate,
      refreshSeq: Math.max(0, refreshSeq),
      source: generated.source,
      payloadJson: this.toPlanJson(generated.payload),
    });

    return this.toPlanResponse(created);
  }

  async createReview(
    userId: bigint,
    payload: CreateAiReviewRequestDto,
  ): Promise<AiReviewResponseDto> {
    const date = this.normalizeDate(payload.date);
    this.ensureValidTimezone(payload.timezone);
    const reviewDate = this.parseDateOnly(date);

    const reviewCount = await this.aiRepository.countReviewsByDate(userId, reviewDate);
    if (reviewCount >= REVIEW_DAILY_LIMIT) {
      this.throwAiRateLimit();
    }

    const generated = await this.buildReviewPayload(userId, date, reviewDate);
    const created = await this.aiRepository.createReview({
      userId,
      reviewDate,
      source: generated.source,
      payloadJson: this.toReviewJson(generated.payload),
    });

    return this.toReviewResponse(created);
  }

  private async buildPlanPayload(
    userId: bigint,
    date: string,
    planDate: Date,
  ): Promise<GeneratedPlan> {
    const [activeCheckinDays, profile, latestWeight] = await Promise.all([
      this.aiRepository.countActiveCheckinDays(userId, {
        startDate: this.shiftDate(planDate, -6),
        endDate: planDate,
      }),
      this.aiRepository.findUserProfile(userId),
      this.aiRepository.findLatestWeight(userId, planDate),
    ]);

    const isDataInsufficient = activeCheckinDays < 3;
    const providerDisabled = this.llmClient.provider === 'disabled';
    const shouldUseFallback = isDataInsufficient || providerDisabled;

    const profileCurrentWeight = profile ? Number(profile.currentWeightKg) : null;
    const profileTargetWeight = profile ? Number(profile.targetWeightKg) : null;
    const latestWeightValue = latestWeight ? Number(latestWeight.weightKg) : null;

    const riskFlags: string[] = [];
    if (isDataInsufficient) {
      riskFlags.push('missing_logs');
    }
    if (!profile) {
      riskFlags.push('profile_incomplete');
    }
    if (providerDisabled) {
      riskFlags.push('model_unavailable');
    }

    const fallbackPayload = this.buildFallbackPlanPayload(riskFlags);
    if (shouldUseFallback) {
      return {
        source: 'fallback',
        payload: this.applyPlanSafetyGuard(fallbackPayload),
      };
    }

    const calorieTargetKcal = this.computeCalorieTarget(
      profileCurrentWeight,
      profileTargetWeight,
      latestWeightValue,
    );

    const breakfastKcal = Math.round(calorieTargetKcal * 0.28);
    const lunchKcal = Math.round(calorieTargetKcal * 0.38);
    const dinnerKcal = Math.round(calorieTargetKcal * 0.34);
    const activityDuration = activeCheckinDays >= 5 ? 45 : 35;

    const personalizedPayload: AiPlanPayload = {
      calorieTargetKcal,
      meals: [
        {
          name: 'breakfast',
          suggestion: '燕麦 + 鸡蛋 + 无糖酸奶',
          kcal: breakfastKcal,
        },
        {
          name: 'lunch',
          suggestion: '鸡胸肉 + 糙米 + 绿叶蔬菜',
          kcal: lunchKcal,
        },
        {
          name: 'dinner',
          suggestion: '清蒸鱼 + 杂粮 + 时蔬',
          kcal: dinnerKcal,
        },
      ],
      activity: {
        type: 'walk',
        durationMin: activityDuration,
        intensity: 'low',
      },
      topActions: [
        '午餐优先蛋白质和蔬菜，主食按拳头大小控制。',
        '晚饭后安排 20 分钟轻快步行。',
        '睡前 2 小时避免高糖零食。',
      ],
      riskFlags,
      summaryText: `今天目标热量约 ${calorieTargetKcal} kcal，保持稳定执行就会看到变化。`,
    };

    const guardedPayload = this.applyPlanSafetyGuard(personalizedPayload);
    return this.ensurePlanSchema(
      {
        source: 'model',
        payload: guardedPayload,
      },
      date,
    );
  }

  private async buildReviewPayload(
    userId: bigint,
    date: string,
    reviewDate: Date,
  ): Promise<GeneratedReview> {
    const [activeCheckinDays, completion] = await Promise.all([
      this.aiRepository.countActiveCheckinDays(userId, {
        startDate: this.shiftDate(reviewDate, -6),
        endDate: reviewDate,
      }),
      this.aiRepository.countCheckinCompletionByDate(userId, reviewDate),
    ]);

    const isDataInsufficient = activeCheckinDays < 3;
    const providerDisabled = this.llmClient.provider === 'disabled';
    const shouldUseFallback = isDataInsufficient || providerDisabled;

    const riskFlags: string[] = [];
    if (isDataInsufficient) {
      riskFlags.push('missing_logs');
    }
    if (providerDisabled) {
      riskFlags.push('model_unavailable');
    }

    const fallbackPayload = this.buildFallbackReviewPayload(riskFlags);
    if (shouldUseFallback) {
      return {
        source: 'fallback',
        payload: this.applyReviewSafetyGuard(fallbackPayload),
      };
    }

    const completedItems = this.buildCompletedItems(completion);
    const missingItems = this.buildMissingItems(completion);
    const score = Math.min(98, 45 + completedItems.length * 12 + activeCheckinDays * 3);

    const reviewPayload: AiReviewPayload = {
      score,
      highlights:
        completedItems.length > 0
          ? completedItems.map((item) => `已完成${item}打卡。`)
          : ['今天你已经开始关注体重管理，这就是进步。'],
      gaps:
        missingItems.length > 0
          ? missingItems.map((item) => `${item}记录缺失，建议明天补齐。`)
          : ['四类打卡都已完成，执行完整度很好。'],
      tomorrowFocus:
        missingItems.length > 0
          ? [`优先完成${missingItems[0]}打卡。`, '保持三餐定时并减少夜宵。']
          : ['维持今天节奏并提高晚餐蔬菜占比。', '继续保持晚间轻度运动。'],
      riskFlags,
      summaryText:
        missingItems.length > 0
          ? '今天执行有基础，明天把缺失项补齐会更稳。'
          : '今天执行很稳定，继续保持节奏就好。',
    };

    const guardedPayload = this.applyReviewSafetyGuard(reviewPayload);
    return this.ensureReviewSchema(
      {
        source: 'model',
        payload: guardedPayload,
      },
      date,
    );
  }

  private toPlanResponse(record: AiPlanRecord): AiPlanResponseDto {
    const date = this.formatDateOnly(record.planDate);
    const payload = this.parsePlanPayload(record.payloadJson);
    const source = this.normalizeSource(record.source);

    if (!payload || !this.isValidPlanPayload(payload)) {
      const fallbackPayload = this.buildFallbackPlanPayload(['schema_invalid']);
      return {
        planId: `p_${record.id.toString()}`,
        date,
        calorieTargetKcal: fallbackPayload.calorieTargetKcal,
        meals: fallbackPayload.meals,
        activity: fallbackPayload.activity,
        topActions: fallbackPayload.topActions,
        riskFlags: fallbackPayload.riskFlags,
        summaryText: fallbackPayload.summaryText,
        source: 'fallback',
      };
    }

    return {
      planId: `p_${record.id.toString()}`,
      date,
      calorieTargetKcal: payload.calorieTargetKcal,
      meals: payload.meals,
      activity: payload.activity,
      topActions: payload.topActions,
      riskFlags: payload.riskFlags,
      summaryText: payload.summaryText,
      source,
    };
  }

  private toReviewResponse(record: AiReviewRecord): AiReviewResponseDto {
    const date = this.formatDateOnly(record.reviewDate);
    const payload = this.parseReviewPayload(record.payloadJson);
    const source = this.normalizeSource(record.source);

    if (!payload || !this.isValidReviewPayload(payload)) {
      const fallbackPayload = this.buildFallbackReviewPayload(['schema_invalid']);
      return {
        reviewId: `r_${record.id.toString()}`,
        date,
        score: fallbackPayload.score,
        highlights: fallbackPayload.highlights,
        gaps: fallbackPayload.gaps,
        tomorrowFocus: fallbackPayload.tomorrowFocus,
        riskFlags: fallbackPayload.riskFlags,
        summaryText: fallbackPayload.summaryText,
        source: 'fallback',
      };
    }

    return {
      reviewId: `r_${record.id.toString()}`,
      date,
      score: payload.score,
      highlights: payload.highlights,
      gaps: payload.gaps,
      tomorrowFocus: payload.tomorrowFocus,
      riskFlags: payload.riskFlags,
      summaryText: payload.summaryText,
      source,
    };
  }

  private toPlanJson(payload: AiPlanPayload): InputJsonValue {
    return {
      calorieTargetKcal: payload.calorieTargetKcal,
      meals: payload.meals.map((meal) => ({
        name: meal.name,
        suggestion: meal.suggestion,
        kcal: meal.kcal,
      })),
      activity: {
        type: payload.activity.type,
        durationMin: payload.activity.durationMin,
        intensity: payload.activity.intensity,
      },
      topActions: [...payload.topActions],
      riskFlags: [...payload.riskFlags],
      summaryText: payload.summaryText,
    };
  }

  private toReviewJson(payload: AiReviewPayload): InputJsonValue {
    return {
      score: payload.score,
      highlights: [...payload.highlights],
      gaps: [...payload.gaps],
      tomorrowFocus: [...payload.tomorrowFocus],
      riskFlags: [...payload.riskFlags],
      summaryText: payload.summaryText,
    };
  }

  private ensurePlanSchema(generated: GeneratedPlan, date: string): GeneratedPlan {
    if (this.isValidPlanPayload(generated.payload)) {
      return generated;
    }

    return {
      source: 'fallback',
      payload: this.buildFallbackPlanPayload(['schema_invalid', `date_${date}`]),
    };
  }

  private ensureReviewSchema(generated: GeneratedReview, date: string): GeneratedReview {
    if (this.isValidReviewPayload(generated.payload)) {
      return generated;
    }

    return {
      source: 'fallback',
      payload: this.buildFallbackReviewPayload(['schema_invalid', `date_${date}`]),
    };
  }

  private buildFallbackPlanPayload(extraRiskFlags: string[]): AiPlanPayload {
    return {
      calorieTargetKcal: 1650,
      meals: [
        {
          name: 'breakfast',
          suggestion: '全麦主食 + 鸡蛋 + 牛奶',
          kcal: 420,
        },
        {
          name: 'lunch',
          suggestion: '高蛋白主菜 + 半碗主食 + 蔬菜',
          kcal: 620,
        },
        {
          name: 'dinner',
          suggestion: '清淡蛋白 + 蔬菜 + 少量主食',
          kcal: 610,
        },
      ],
      activity: {
        type: 'walk',
        durationMin: 30,
        intensity: 'low',
      },
      topActions: ['先完成四类打卡中的任意两项。', '晚餐后步行 20 分钟。'],
      riskFlags: this.uniqueArray(extraRiskFlags),
      summaryText: '当前为通用建议，连续记录三天后可生成更个性化计划。',
    };
  }

  private buildFallbackReviewPayload(extraRiskFlags: string[]): AiReviewPayload {
    return {
      score: 65,
      highlights: ['你已经在持续关注自己的状态。'],
      gaps: ['当前数据不足，复盘暂以通用建议输出。'],
      tomorrowFocus: ['明天优先完成三餐与运动打卡。', '保持固定睡眠时间。'],
      riskFlags: this.uniqueArray(extraRiskFlags),
      summaryText: '先把记录稳定下来，复盘会越来越精准。',
    };
  }

  private applyPlanSafetyGuard(payload: AiPlanPayload): AiPlanPayload {
    let guarded = false;
    const meals = payload.meals.map((meal) => {
      const sanitized = this.sanitizeMedicalText(meal.suggestion);
      guarded = guarded || sanitized.changed;
      return {
        ...meal,
        suggestion: sanitized.text,
      };
    });

    const topActions = payload.topActions.map((action) => {
      const sanitized = this.sanitizeMedicalText(action);
      guarded = guarded || sanitized.changed;
      return sanitized.text;
    });

    const summary = this.sanitizeMedicalText(payload.summaryText);
    guarded = guarded || summary.changed;

    const riskFlags = guarded
      ? this.uniqueArray([...payload.riskFlags, 'safety_guarded'])
      : payload.riskFlags;

    return {
      ...payload,
      meals,
      topActions,
      summaryText: summary.text,
      riskFlags,
    };
  }

  private applyReviewSafetyGuard(payload: AiReviewPayload): AiReviewPayload {
    let guarded = false;

    const highlights = payload.highlights.map((item) => {
      const sanitized = this.sanitizeMedicalText(item);
      guarded = guarded || sanitized.changed;
      return sanitized.text;
    });

    const gaps = payload.gaps.map((item) => {
      const sanitized = this.sanitizeMedicalText(item);
      guarded = guarded || sanitized.changed;
      return sanitized.text;
    });

    const tomorrowFocus = payload.tomorrowFocus.map((item) => {
      const sanitized = this.sanitizeMedicalText(item);
      guarded = guarded || sanitized.changed;
      return sanitized.text;
    });

    const summary = this.sanitizeMedicalText(payload.summaryText);
    guarded = guarded || summary.changed;

    const riskFlags = guarded
      ? this.uniqueArray([...payload.riskFlags, 'safety_guarded'])
      : payload.riskFlags;

    return {
      ...payload,
      highlights,
      gaps,
      tomorrowFocus,
      summaryText: summary.text,
      riskFlags,
    };
  }

  private sanitizeMedicalText(value: string): { text: string; changed: boolean } {
    let result = value;
    let changed = false;

    for (const term of MEDICAL_TERMS) {
      if (!result.includes(term)) {
        continue;
      }

      result = result.replaceAll(term, '健康建议');
      changed = true;
    }

    return {
      text: result,
      changed,
    };
  }

  private isValidPlanPayload(payload: AiPlanPayload): boolean {
    const validMeals = payload.meals.every(
      (meal) =>
        typeof meal.name === 'string' &&
        meal.name.length > 0 &&
        typeof meal.suggestion === 'string' &&
        meal.suggestion.length > 0 &&
        Number.isFinite(meal.kcal) &&
        meal.kcal > 0,
    );

    const validActivity =
      typeof payload.activity.type === 'string' &&
      payload.activity.type.length > 0 &&
      Number.isFinite(payload.activity.durationMin) &&
      payload.activity.durationMin > 0;

    return (
      Number.isFinite(payload.calorieTargetKcal) &&
      payload.calorieTargetKcal > 0 &&
      payload.meals.length > 0 &&
      validMeals &&
      validActivity &&
      payload.topActions.length > 0 &&
      payload.summaryText.length > 0
    );
  }

  private isValidReviewPayload(payload: AiReviewPayload): boolean {
    return (
      Number.isFinite(payload.score) &&
      payload.score >= 0 &&
      payload.score <= 100 &&
      payload.highlights.length > 0 &&
      payload.gaps.length > 0 &&
      payload.tomorrowFocus.length > 0 &&
      payload.summaryText.length > 0
    );
  }

  private parsePlanPayload(value: JsonValue): AiPlanPayload | null {
    if (!this.isJsonObject(value)) {
      return null;
    }

    const rawMeals = value.meals;
    const rawActivity = value.activity;

    if (!Array.isArray(rawMeals) || !this.isJsonObject(rawActivity)) {
      return null;
    }

    const meals = rawMeals
      .map((meal) => (this.isJsonObject(meal) ? meal : null))
      .filter((meal): meal is JsonObject => meal !== null)
      .map((meal) => ({
        name: typeof meal.name === 'string' ? meal.name : '',
        suggestion: typeof meal.suggestion === 'string' ? meal.suggestion : '',
        kcal: typeof meal.kcal === 'number' ? meal.kcal : Number.NaN,
      }));

    const topActions = this.readStringArray(value.topActions);
    const riskFlags = this.readStringArray(value.riskFlags);

    const activityIntensity = rawActivity.intensity;
    const intensity =
      activityIntensity === 'low' ||
      activityIntensity === 'medium' ||
      activityIntensity === 'high'
        ? activityIntensity
        : 'low';

    return {
      calorieTargetKcal:
        typeof value.calorieTargetKcal === 'number'
          ? value.calorieTargetKcal
          : Number.NaN,
      meals,
      activity: {
        type: typeof rawActivity.type === 'string' ? rawActivity.type : '',
        durationMin:
          typeof rawActivity.durationMin === 'number'
            ? rawActivity.durationMin
            : Number.NaN,
        intensity,
      },
      topActions,
      riskFlags,
      summaryText: typeof value.summaryText === 'string' ? value.summaryText : '',
    };
  }

  private parseReviewPayload(value: JsonValue): AiReviewPayload | null {
    if (!this.isJsonObject(value)) {
      return null;
    }

    return {
      score: typeof value.score === 'number' ? value.score : Number.NaN,
      highlights: this.readStringArray(value.highlights),
      gaps: this.readStringArray(value.gaps),
      tomorrowFocus: this.readStringArray(value.tomorrowFocus),
      riskFlags: this.readStringArray(value.riskFlags),
      summaryText: typeof value.summaryText === 'string' ? value.summaryText : '',
    };
  }

  private readStringArray(input: JsonValue | undefined): string[] {
    if (!Array.isArray(input)) {
      return [];
    }

    return input
      .map((item) => (typeof item === 'string' ? item : null))
      .filter((item): item is string => item !== null);
  }

  private isJsonObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private buildCompletedItems(completion: CheckinCompletion): string[] {
    const completed: string[] = [];
    if (completion.weightCount > 0) {
      completed.push('体重');
    }
    if (completion.mealCount > 0) {
      completed.push('饮食');
    }
    if (completion.activityCount > 0) {
      completed.push('运动');
    }
    if (completion.sleepCount > 0) {
      completed.push('睡眠');
    }
    return completed;
  }

  private buildMissingItems(completion: CheckinCompletion): string[] {
    const missing: string[] = [];
    if (completion.weightCount === 0) {
      missing.push('体重');
    }
    if (completion.mealCount === 0) {
      missing.push('饮食');
    }
    if (completion.activityCount === 0) {
      missing.push('运动');
    }
    if (completion.sleepCount === 0) {
      missing.push('睡眠');
    }
    return missing;
  }

  private computeCalorieTarget(
    profileCurrentWeight: number | null,
    profileTargetWeight: number | null,
    latestWeight: number | null,
  ): number {
    const baseWeight = latestWeight ?? profileCurrentWeight ?? 68;
    const targetWeight = profileTargetWeight ?? baseWeight - 5;
    const weightGap = Math.max(baseWeight - targetWeight, 0);
    const rawTarget = baseWeight * 22 - Math.min(weightGap * 35, 400);
    return this.clampNumber(Math.round(rawTarget), 1350, 2200);
  }

  private normalizeSource(source: string): AiPayloadSource {
    return source === 'model' ? 'model' : 'fallback';
  }

  private normalizeDate(value: string): string {
    const normalized = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const parsed = this.parseDateOnly(normalized);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    return normalized;
  }

  private ensureValidTimezone(value: string): void {
    const timezone = value.trim();
    if (timezone.length === 0) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
    } catch {
      throw new BadRequestException('INVALID_PARAMS');
    }
  }

  private parseDateOnly(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private formatDateOnly(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private shiftDate(baseDate: Date, dayOffset: number): Date {
    const shifted = new Date(baseDate);
    shifted.setUTCDate(shifted.getUTCDate() + dayOffset);
    return shifted;
  }

  private clampNumber(value: number, min: number, max: number): number {
    if (value < min) {
      return min;
    }

    if (value > max) {
      return max;
    }

    return value;
  }

  private uniqueArray(values: string[]): string[] {
    return Array.from(new Set(values));
  }

  private throwAiRateLimit(): never {
    throw new HttpException(
      {
        code: 'AI_RATE_LIMIT',
        message: 'AI_RATE_LIMIT',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
