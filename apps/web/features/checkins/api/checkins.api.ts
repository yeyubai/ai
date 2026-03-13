import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  ActivityCheckinPayload,
  CheckinFeedItem,
  CheckinSubmission,
  MealCheckinPayload,
  SleepCheckinPayload,
  WeightCheckinPayload,
} from '../types/checkins.types';

type CheckinApiData = {
  checkinId: string;
  checkinType: 'weight' | 'meal' | 'activity' | 'sleep';
  checkinDate: string;
  isBackfill: boolean;
  createdAt: string;
};

function toSubmission(data: CheckinApiData): CheckinSubmission {
  return {
    submissionId: data.checkinId,
    checkinType: data.checkinType,
    checkinDate: data.checkinDate,
    isBackfillTag: data.isBackfill,
    createdAt: data.createdAt,
  };
}

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

async function postCheckin<TPayload>(path: string, payload: TPayload): Promise<CheckinSubmission> {
  const response = await apiClient.post<ApiResponse<CheckinApiData>>(path, payload, {
    headers: {
      'x-idempotency-key': createIdempotencyKey(),
    },
  });
  return toSubmission(response.data.data);
}

export function postWeightCheckin(payload: WeightCheckinPayload): Promise<CheckinSubmission> {
  return postCheckin('/checkins/weight', payload);
}

export function postMealCheckin(payload: MealCheckinPayload): Promise<CheckinSubmission> {
  return postCheckin('/checkins/meal', payload);
}

export function postActivityCheckin(payload: ActivityCheckinPayload): Promise<CheckinSubmission> {
  return postCheckin('/checkins/activity', payload);
}

export function postSleepCheckin(payload: SleepCheckinPayload): Promise<CheckinSubmission> {
  return postCheckin('/checkins/sleep', payload);
}

export async function fetchTodayCheckins(): Promise<CheckinFeedItem[]> {
  const response = await apiClient.get<ApiResponse<{ items: CheckinFeedItem[] }>>('/checkins/today');
  return response.data.data.items;
}

export async function fetchCheckinHistory(
  type: CheckinFeedItem['type'],
): Promise<CheckinFeedItem[]> {
  const response = await apiClient.get<ApiResponse<{ list: CheckinFeedItem[]; total: number }>>(
    '/checkins/history',
    {
      params: {
        type,
        page: 1,
        pageSize: 6,
      },
    },
  );
  return response.data.data.list;
}
