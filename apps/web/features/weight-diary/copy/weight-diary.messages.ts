import { commonMessages } from '@/shared/copy/common-messages';

export const weightDiaryMessages = {
  home: {
    loadFailed: `首页加载失败，${commonMessages.retryLater}`,
    unavailable: '首页暂时不可用。',
    saveFailed: `保存失败，${commonMessages.retryLater}`,
    invalidWeightRange: '体重需要在 20-300kg 之间。',
  },
} as const;
