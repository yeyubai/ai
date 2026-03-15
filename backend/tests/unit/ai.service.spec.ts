import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal, type JsonValue } from '@prisma/client/runtime/library';
import { LlmClient } from 'src/shared/llm/llm.client';
import { AiRepository } from 'src/modules/ai/repositories/ai.repository';
import { AiService } from 'src/modules/ai/services/ai.service';

type AiRepositoryMock = jest.Mocked<
  Pick<
    AiRepository,
    | 'findLatestPlanByDate'
    | 'countPlansByDate'
    | 'createPlan'
    | 'countReviewsByDate'
    | 'createReview'
    | 'countActiveCheckinDays'
    | 'findUserProfile'
    | 'findLatestWeight'
    | 'countCheckinCompletionByDate'
  >
>;

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function createAiRepositoryMock(): AiRepositoryMock {
  const createPlan: AiRepositoryMock['createPlan'] = jest
    .fn()
    .mockImplementation(async (payload) => ({
      id: 1n,
      planDate: payload.planDate,
      refreshSeq: payload.refreshSeq,
      payloadJson: payload.payloadJson as JsonValue,
      source: payload.source,
      createdAt: new Date(),
    }));

  const createReview: AiRepositoryMock['createReview'] = jest
    .fn()
    .mockImplementation(async (payload) => ({
      id: 2n,
      reviewDate: payload.reviewDate,
      payloadJson: payload.payloadJson as JsonValue,
      source: payload.source,
      createdAt: new Date(),
    }));

  return {
    findLatestPlanByDate: jest.fn().mockResolvedValue(null),
    countPlansByDate: jest.fn().mockResolvedValue(0),
    createPlan,
    countReviewsByDate: jest.fn().mockResolvedValue(0),
    createReview,
    countActiveCheckinDays: jest.fn().mockResolvedValue(4),
    findUserProfile: jest.fn().mockResolvedValue({
      currentWeightKg: new Decimal(72),
      targetWeightKg: new Decimal(65),
    }),
    findLatestWeight: jest.fn().mockResolvedValue({
      weightKg: new Decimal(71.2),
    }),
    countCheckinCompletionByDate: jest.fn().mockResolvedValue({
      weightCount: 1,
      mealCount: 1,
      activityCount: 1,
      sleepCount: 1,
    }),
  };
}

function createLlmClient(provider: string): LlmClient {
  return { provider } as LlmClient;
}

describe('AiService', () => {
  it('returns latest plan without creating when forceRefresh is false', async () => {
    const repository = createAiRepositoryMock();
    repository.findLatestPlanByDate.mockResolvedValue({
      id: 11n,
      planDate: new Date(`${getTodayDateString()}T00:00:00.000Z`),
      refreshSeq: 0,
      payloadJson: {
        calorieTargetKcal: 1600,
        meals: [{ name: 'breakfast', suggestion: 'oatmeal', kcal: 420 }],
        activity: { type: 'walk', durationMin: 30, intensity: 'low' },
        topActions: ['finish checkins'],
        riskFlags: [],
        summaryText: 'keep steady',
      },
      source: 'model',
      createdAt: new Date(),
    });

    const service = new AiService(
      repository as unknown as AiRepository,
      createLlmClient('dashscope'),
    );

    const result = await service.createPlan(1n, {
      date: getTodayDateString(),
      timezone: 'Asia/Shanghai',
      forceRefresh: false,
    });

    expect(result.planId).toBe('p_11');
    expect(result.source).toBe('model');
    expect(repository.createPlan).not.toHaveBeenCalled();
  });

  it('throws AI_RATE_LIMIT when force refresh exceeds limit', async () => {
    const repository = createAiRepositoryMock();
    repository.findLatestPlanByDate.mockResolvedValue({
      id: 21n,
      planDate: new Date(`${getTodayDateString()}T00:00:00.000Z`),
      refreshSeq: 2,
      payloadJson: {},
      source: 'model',
      createdAt: new Date(),
    });
    const service = new AiService(
      repository as unknown as AiRepository,
      createLlmClient('dashscope'),
    );

    await expect(
      service.createPlan(1n, {
        date: getTodayDateString(),
        timezone: 'Asia/Shanghai',
        forceRefresh: true,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });

  it('returns fallback plan when recent checkin data is insufficient', async () => {
    const repository = createAiRepositoryMock();
    repository.countActiveCheckinDays.mockResolvedValue(1);
    const service = new AiService(
      repository as unknown as AiRepository,
      createLlmClient('disabled'),
    );

    const result = await service.createPlan(1n, {
      date: getTodayDateString(),
      timezone: 'Asia/Shanghai',
      forceRefresh: true,
    });

    expect(result.source).toBe('fallback');
    expect(result.riskFlags).toContain('missing_logs');
  });

  it('throws AI_RATE_LIMIT when review request exceeds daily limit', async () => {
    const repository = createAiRepositoryMock();
    repository.countReviewsByDate.mockResolvedValue(2);
    const service = new AiService(
      repository as unknown as AiRepository,
      createLlmClient('dashscope'),
    );

    await expect(
      service.createReview(1n, {
        date: getTodayDateString(),
        timezone: 'Asia/Shanghai',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });
});
