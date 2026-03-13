import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { UserProfile, UpdateProfilePayload } from '@/features/profile/types/profile.types';

export type OnboardingAssessmentPayload = {
  goalWeeks: number;
  workRestPattern: string;
  activityBaseline: string;
  motivationPattern: string;
  dietPreference?: string;
};

export type OnboardingAssessmentResult = {
  assessmentId: string;
  recommendedDailyActions: string[];
  membershipState: {
    plan: 'free' | 'coach_plus';
    trialEligible: boolean;
  };
};

export type OnboardingCompleteResult = {
  homeRedirect: string;
  firstMissionDate: string;
};

export async function fetchProfile(): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/profile');
  return response.data.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const response = await apiClient.put<ApiResponse<UserProfile>>('/profile', payload);
  return response.data.data;
}

export async function createAssessment(
  payload: OnboardingAssessmentPayload,
): Promise<OnboardingAssessmentResult> {
  const response = await apiClient.post<ApiResponse<OnboardingAssessmentResult>>(
    '/onboarding/assessment',
    payload,
  );
  return response.data.data;
}

export async function completeOnboarding(): Promise<OnboardingCompleteResult> {
  const response = await apiClient.post<ApiResponse<OnboardingCompleteResult>>(
    '/onboarding/complete',
  );
  return response.data.data;
}
