'use client';

import { create } from 'zustand';
import { isApiError } from '@/lib/api/types';
import { postAiPlan, postAiReview } from '../api/ai-coach.api';
import type {
  AiPlan,
  AiReview,
  FetchAiPlanPayload,
  FetchAiReviewPayload,
} from '../types/ai-coach.types';

type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

type CoachState = {
  plan: AiPlan | null;
  review: AiReview | null;
  planStatus: RequestStatus;
  reviewStatus: RequestStatus;
  planError: string | null;
  reviewError: string | null;
  planErrorCode: string | number | null;
  reviewErrorCode: string | number | null;
  planTraceId: string | null;
  reviewTraceId: string | null;
  planRefreshBlocked: boolean;
  fetchPlan: (payload: FetchAiPlanPayload) => Promise<boolean>;
  fetchReview: (payload: FetchAiReviewPayload) => Promise<boolean>;
  clearCoachErrors: () => void;
  resetPlanRefreshBlock: () => void;
};

function mapPlanError(code: string | number): string {
  if (code === 'INVALID_PARAMS') {
    return '计划请求参数不合法，请检查日期后重试。';
  }

  if (code === 'AI_RATE_LIMIT') {
    return '今日计划刷新次数已达上限，请明天再试。';
  }

  if (code === 'AUTH_EXPIRED') {
    return '登录状态已过期，请重新登录。';
  }

  return '计划生成失败，请稍后重试。';
}

function mapReviewError(code: string | number): string {
  if (code === 'INVALID_PARAMS') {
    return '复盘请求参数不合法，请检查日期后重试。';
  }

  if (code === 'AI_RATE_LIMIT') {
    return '今日复盘次数已达上限，请稍后再试。';
  }

  if (code === 'AUTH_EXPIRED') {
    return '登录状态已过期，请重新登录。';
  }

  return '复盘生成失败，请稍后重试。';
}

export const useCoachStore = create<CoachState>((set) => ({
  plan: null,
  review: null,
  planStatus: 'idle',
  reviewStatus: 'idle',
  planError: null,
  reviewError: null,
  planErrorCode: null,
  reviewErrorCode: null,
  planTraceId: null,
  reviewTraceId: null,
  planRefreshBlocked: false,

  fetchPlan: async (payload) => {
    set({
      planStatus: 'loading',
      planError: null,
      planErrorCode: null,
      planTraceId: null,
    });

    try {
      const plan = await postAiPlan(payload);
      set({
        plan,
        planStatus: 'success',
        planError: null,
        planErrorCode: null,
        planTraceId: null,
        planRefreshBlocked: false,
      });
      return true;
    } catch (error) {
      const code = isApiError(error) ? error.code : 'INTERNAL_ERROR';
      set({
        planStatus: 'error',
        planError: mapPlanError(code),
        planErrorCode: code,
        planTraceId: isApiError(error) ? error.traceId ?? null : null,
        planRefreshBlocked: code === 'AI_RATE_LIMIT',
      });
      return false;
    }
  },

  fetchReview: async (payload) => {
    set({
      reviewStatus: 'loading',
      reviewError: null,
      reviewErrorCode: null,
      reviewTraceId: null,
    });

    try {
      const review = await postAiReview(payload);
      set({
        review,
        reviewStatus: 'success',
        reviewError: null,
        reviewErrorCode: null,
        reviewTraceId: null,
      });
      return true;
    } catch (error) {
      const code = isApiError(error) ? error.code : 'INTERNAL_ERROR';
      set({
        reviewStatus: 'error',
        reviewError: mapReviewError(code),
        reviewErrorCode: code,
        reviewTraceId: isApiError(error) ? error.traceId ?? null : null,
      });
      return false;
    }
  },

  clearCoachErrors: () =>
    set({
      planError: null,
      reviewError: null,
      planErrorCode: null,
      reviewErrorCode: null,
      planTraceId: null,
      reviewTraceId: null,
    }),

  resetPlanRefreshBlock: () =>
    set({
      planRefreshBlocked: false,
    }),
}));
