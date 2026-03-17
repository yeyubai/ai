import type {
  UpdateUserProfilePayload,
  UserProfile,
} from '../types/settings.types';

export function createMeProfilePayload(
  profileDraft: UserProfile,
): UpdateUserProfilePayload {
  return {
    nickname: profileDraft.nickname ?? undefined,
    heightCm: profileDraft.heightCm ?? undefined,
    sex: profileDraft.sex ?? undefined,
    birthDate: profileDraft.birthDate ?? undefined,
    avatarUrl: profileDraft.avatarUrl ?? undefined,
  };
}
