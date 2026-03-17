import { commonMessages } from '@/shared/copy/common-messages';
import { normalizeApiError } from '@/shared/errors/normalize-api-error';

type MeUserRole = 'guest' | 'member' | null;

export const meMessages = {
  profile: {
    loadFailed: `资料页加载失败，${commonMessages.retryLater}`,
    unavailable: '资料页暂时不可用。',
    missingGoalWeights: '请先补齐当前体重和目标体重。',
    saveSuccess: '资料与目标已保存。',
    profileSaved: '基础资料已保存',
    goalSaved: '体重目标已保存',
  },
  preferences: {
    loadFailed: `页面设置加载失败，${commonMessages.retryLater}`,
    unavailable: '页面设置暂时不可用。',
    saveSuccess: '页面设置已保存。',
    saveFailed: `保存页面设置失败，${commonMessages.retryLater}`,
  },
  overview: {
    loadFailed: `我的页面加载失败，${commonMessages.retryLater}`,
    unavailable: '我的页面暂时不可用。',
    exportFailed: `创建导出任务失败，${commonMessages.retryLater}`,
  },
  accountLabels: {
    guest: '游客账号',
    member: '正式账号',
    unknown: '未知',
  },
} as const;

export function getMeAccountLabel(userRole: MeUserRole): string {
  if (userRole === 'guest') {
    return meMessages.accountLabels.guest;
  }

  if (userRole === 'member') {
    return meMessages.accountLabels.member;
  }

  return meMessages.accountLabels.unknown;
}

export function buildMeSaveErrorMessage(
  sectionLabel: string,
  error: unknown,
): string {
  const detail = normalizeApiError(error, {
    fallbackDisplayMessage: commonMessages.retryLater,
  }).displayMessage;

  return `${sectionLabel}保存失败：${detail}`;
}
