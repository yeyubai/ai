'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useCoachStore } from '../../model/coach.store';
import { getClientTimezone, getTodayDateString } from './coach-utils';

export function ReviewSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const review = useCoachStore((state) => state.review);
  const reviewStatus = useCoachStore((state) => state.reviewStatus);
  const reviewError = useCoachStore((state) => state.reviewError);
  const reviewTraceId = useCoachStore((state) => state.reviewTraceId);
  const fetchReview = useCoachStore((state) => state.fetchReview);

  const timezone = useMemo(() => getClientTimezone(), []);
  const today = useMemo(() => getTodayDateString(timezone), [timezone]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    if (review?.date === today) {
      return;
    }

    void fetchReview({
      date: today,
      timezone,
    }).then((success) => {
      if (success) {
        return;
      }

      if (useCoachStore.getState().reviewErrorCode === 'AUTH_EXPIRED') {
        logout();
        router.replace('/auth/login');
      }
    });
  }, [fetchReview, logout, review?.date, router, today, token, timezone]);

  const handleRetry = async () => {
    if (!token || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const success = await fetchReview({
      date: today,
      timezone,
    });
    setIsSubmitting(false);

    if (!success && useCoachStore.getState().reviewErrorCode === 'AUTH_EXPIRED') {
      logout();
      router.replace('/auth/login');
    }
  };

  const isLoading = reviewStatus === 'loading' && !review;

  return (
    <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        RQ-003 / FE-3.3
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">晚间复盘</h1>
      <p className="mt-2 text-sm text-slate-600">复盘今天执行情况，并确定明日重点。</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleRetry}
          disabled={isSubmitting}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? '生成中...' : '重新生成复盘'}
        </button>
        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
        >
          返回 Dashboard
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-6 animate-pulse space-y-3">
          <div className="h-5 w-40 rounded bg-slate-100" />
          <div className="h-16 w-full rounded bg-slate-100" />
          <div className="h-16 w-full rounded bg-slate-100" />
        </div>
      ) : null}

      {!isLoading && review ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-800">
              日期：{review.date} · 复盘分数：{review.score}
            </p>
            <p className="mt-2 text-sm text-slate-700">{review.summaryText}</p>
            {review.source === 'fallback' ? (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                当前为通用复盘建议，补齐近期记录可获得更精准结果。
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900">今天亮点</h2>
            <ul className="mt-3 space-y-2">
              {review.highlights.map((item) => (
                <li key={item} className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900">需要改进</h2>
            <ul className="mt-3 space-y-2">
              {review.gaps.map((item) => (
                <li key={item} className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900">明日重点</h2>
            <ul className="mt-3 space-y-2">
              {review.tomorrowFocus.map((item) => (
                <li key={item} className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {review.riskFlags.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-900">风险提示</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {review.riskFlags.map((flag) => (
                  <span
                    key={flag}
                    className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !review ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-600">
          暂无复盘数据，请先完成今天的打卡再试。
        </p>
      ) : null}

      {reviewError ? <p className="mt-4 text-sm text-rose-600">{reviewError}</p> : null}
      {reviewTraceId ? <p className="mt-2 text-xs text-slate-500">traceId: {reviewTraceId}</p> : null}
    </section>
  );
}
