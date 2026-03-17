import { commonMessages } from '@/shared/copy/common-messages';

export const progressMessages = {
  loadFailed: `进度页加载失败，${commonMessages.retryLater}`,
  unavailable: '进度页暂时不可用。',
} as const;
