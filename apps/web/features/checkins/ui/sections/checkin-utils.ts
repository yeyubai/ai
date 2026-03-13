import { isApiError } from '@/lib/api/types';

export function getTodayDateString(): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${year}-${month}-${day}`;
}

export function getMinBackfillDate(today: string): string {
  const [year, month, day] = today.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day));
  shifted.setUTCDate(shifted.getUTCDate() - 7);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(shifted);
  const y = parts.find((part) => part.type === 'year')?.value ?? '';
  const m = parts.find((part) => part.type === 'month')?.value ?? '';
  const d = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${y}-${m}-${d}`;
}

export function getRateLimitMessage(seconds: number): string {
  return `提交过于频繁，请 ${seconds} 秒后重试。`;
}

export function mapCheckinErrorMessage(
  error: unknown,
  limitReachedMessage = '今日记录已达上限。',
): string {
  if (!isApiError(error)) {
    return '提交失败，请稍后重试。';
  }

  if (error.code === 'INVALID_PARAMS') {
    return '输入参数有误，请检查后重试。';
  }

  if (error.code === 'DUPLICATE_CHECKIN') {
    return '请勿重复提交同一条记录。';
  }

  if (error.code === 'CHECKIN_LIMIT_REACHED') {
    return limitReachedMessage;
  }

  if (error.code === 'CHECKIN_RATE_LIMIT') {
    return getRateLimitMessage(30);
  }

  return '提交失败，请稍后重试。';
}
