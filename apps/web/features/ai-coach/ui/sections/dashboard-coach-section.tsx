'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useCoachStore } from '../../model/coach.store';
import { getClientTimezone, getTodayDateString } from './coach-utils';

export function DashboardCoachSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const plan = useCoachStore((state) => state.plan);
  const planStatus = useCoachStore((state) => state.planStatus);
  const planError = useCoachStore((state) => state.planError);
  const planErrorCode = useCoachStore((state) => state.planErrorCode);
  const planTraceId = useCoachStore((state) => state.planTraceId);
  const planRefreshBlocked = useCoachStore((state) => state.planRefreshBlocked);
  const fetchPlan = useCoachStore((state) => state.fetchPlan);

  const timezone = useMemo(() => getClientTimezone(), []);
  const today = useMemo(() => getTodayDateString(timezone), [timezone]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    if (plan?.date === today) {
      return;
    }

    void fetchPlan({
      date: today,
      timezone,
      forceRefresh: false,
    }).then((success) => {
      if (success) {
        return;
      }

      if (useCoachStore.getState().planErrorCode === 'AUTH_EXPIRED') {
        logout();
        router.replace('/auth/login');
      }
    });
  }, [fetchPlan, logout, plan?.date, router, today, token, timezone]);

  const handleRefresh = async () => {
    if (planRefreshBlocked || isRefreshing || !token) {
      return;
    }

    setIsRefreshing(true);
    const success = await fetchPlan({
      date: today,
      timezone,
      forceRefresh: true,
    });
    setIsRefreshing(false);

    if (!success && useCoachStore.getState().planErrorCode === 'AUTH_EXPIRED') {
      logout();
      router.replace('/auth/login');
    }
  };

  const shouldShowLoading = planStatus === 'loading' && !plan;

  return (
    <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        RQ-003 / FE-3.2
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">今日 AI 计划</h1>
      <p className="mt-2 text-sm text-slate-600">
        先看计划，再去完成打卡，晚上回来做复盘更高效。
      </p>

      {shouldShowLoading ? (
        <div className="mt-6 animate-pulse space-y-3">
          <div className="h-5 w-40 rounded bg-slate-100" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-2/3 rounded bg-slate-100" />
        </div>
      ) : null}

      {!shouldShowLoading && plan ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-800">
              日期：{plan.date} · 目标热量：{plan.calorieTargetKcal} kcal
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={planRefreshBlocked || isRefreshing}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isRefreshing ? '刷新中...' : '手动刷新计划'}
            </button>
          </div>

          {plan.source === 'fallback' ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              当前为通用建议（fallback），建议先补齐最近打卡数据。
            </p>
          ) : null}

          <p className="mt-3 text-sm text-slate-700">{plan.summaryText}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {plan.topActions.map((action) => (
              <li key={action} className="rounded-xl bg-white px-3 py-2">
                {action}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!shouldShowLoading && !plan ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-600">
          先完成打卡，再生成今日计划。
        </div>
      ) : null}

      {planError ? <p className="mt-4 text-sm text-rose-600">{planError}</p> : null}
      {planTraceId ? <p className="mt-2 text-xs text-slate-500">traceId: {planTraceId}</p> : null}

      {planErrorCode === 'AI_RATE_LIMIT' ? (
        <p className="mt-2 text-xs text-amber-700">今日刷新已达上限，可直接查看计划详情。</p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/coach/plan"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
        >
          查看计划详情
        </Link>
        <Link
          href="/coach/review"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
        >
          进入晚间复盘
        </Link>
        <Link
          href="/checkins/weight"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
        >
          去体重打卡
        </Link>
        <Link
          href="/checkins/meal"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
        >
          去饮食打卡
        </Link>
      </div>
    </section>
  );
}
