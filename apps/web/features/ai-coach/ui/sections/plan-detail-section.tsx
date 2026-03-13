'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useCoachStore } from '../../model/coach.store';
import { getClientTimezone, getTodayDateString } from './coach-utils';

export function PlanDetailSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const plan = useCoachStore((state) => state.plan);
  const planStatus = useCoachStore((state) => state.planStatus);
  const planError = useCoachStore((state) => state.planError);
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
    if (!token || isRefreshing || planRefreshBlocked) {
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

  const isLoading = planStatus === 'loading' && !plan;

  return (
    <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        RQ-003 / FE-3.2
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">计划详情</h1>
      <p className="mt-2 text-sm text-slate-600">按计划执行并完成打卡，晚间复盘会更准确。</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={planRefreshBlocked || isRefreshing}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isRefreshing ? '刷新中...' : '手动刷新计划'}
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
          <div className="h-5 w-56 rounded bg-slate-100" />
          <div className="h-16 w-full rounded bg-slate-100" />
          <div className="h-16 w-full rounded bg-slate-100" />
          <div className="h-16 w-full rounded bg-slate-100" />
        </div>
      ) : null}

      {!isLoading && plan ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-800">
              日期：{plan.date} · 目标热量：{plan.calorieTargetKcal} kcal
            </p>
            <p className="mt-2 text-sm text-slate-700">{plan.summaryText}</p>
            {plan.source === 'fallback' ? (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                当前为通用建议，补齐近期打卡后建议会更个性化。
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900">三餐建议</h2>
            <ul className="mt-3 space-y-3">
              {plan.meals.map((meal) => (
                <li key={meal.name} className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-sm font-medium text-slate-800">
                    {meal.name} · {meal.kcal} kcal
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{meal.suggestion}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900">活动建议</h2>
            <p className="mt-2 text-sm text-slate-700">
              {plan.activity.type} · {plan.activity.durationMin} 分钟 · 强度 {plan.activity.intensity}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900">关键动作</h2>
            <ul className="mt-3 space-y-2">
              {plan.topActions.map((action) => (
                <li key={action} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {plan.riskFlags.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-900">风险提示</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.riskFlags.map((flag) => (
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

      {!isLoading && !plan ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-600">
          暂无计划数据，请先在 Dashboard 触发计划生成。
        </p>
      ) : null}

      {planError ? <p className="mt-4 text-sm text-rose-600">{planError}</p> : null}
      {planTraceId ? <p className="mt-2 text-xs text-slate-500">traceId: {planTraceId}</p> : null}
    </section>
  );
}
