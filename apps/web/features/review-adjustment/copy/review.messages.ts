import { commonMessages } from '@/shared/copy/common-messages';

export const reviewMessages = {
  overview: {
    loadFailed: `复盘准备状态加载失败，${commonMessages.retryLater}`,
    unavailable: '晚间复盘暂时不可用。',
  },
  generate: {
    failed: `复盘暂时不可用，${commonMessages.retryLater}`,
    notReady: '今天还缺少体重或运动记录，先补上至少一个核心动作再来生成复盘。',
  },
} as const;
