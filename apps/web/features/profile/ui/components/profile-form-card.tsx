import type { FormEvent } from 'react';

export type ProfileFormValues = {
  heightCm: string;
  currentWeightKg: string;
  targetWeightKg: string;
};

export type ProfileFormErrors = {
  heightCm: string | null;
  currentWeightKg: string | null;
  targetWeightKg: string | null;
};

type Props = {
  mode: 'onboarding' | 'settings';
  phone: string | null;
  values: ProfileFormValues;
  errors: ProfileFormErrors;
  submitError: string | null;
  successMessage: string | null;
  traceId: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onChange: (field: keyof ProfileFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function getTitle(mode: 'onboarding' | 'settings'): string {
  return mode === 'onboarding' ? '完善你的档案' : '编辑个人档案';
}

function getDescription(mode: 'onboarding' | 'settings'): string {
  return mode === 'onboarding'
    ? '首次使用需要先完成档案，帮助我们生成更准确的计划。'
    : '更新你的身高与体重目标，系统会基于新目标重算进度。';
}

function getSubmitLabel(mode: 'onboarding' | 'settings', isSubmitting: boolean): string {
  if (isSubmitting) {
    return '保存中...';
  }

  return mode === 'onboarding' ? '完成并继续' : '保存修改';
}

export function ProfileFormCard({
  mode,
  phone,
  values,
  errors,
  submitError,
  successMessage,
  traceId,
  isLoading,
  isSubmitting,
  onChange,
  onSubmit,
}: Props) {
  return (
    <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        RQ-001 / {mode === 'onboarding' ? 'FE-1.3' : 'FE-1.4'}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {getTitle(mode)}
      </h1>
      <p className="mt-2 text-sm text-slate-600">{getDescription(mode)}</p>
      {phone ? <p className="mt-2 text-xs text-slate-500">当前账号：{phone}</p> : null}

      {isLoading ? (
        <div className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          正在加载档案...
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">身高（cm）</span>
            <input
              value={values.heightCm}
              onChange={(event) => onChange('heightCm', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="120 - 220"
              inputMode="numeric"
              aria-invalid={errors.heightCm !== null}
            />
            {errors.heightCm ? <p className="mt-1 text-xs text-rose-600">{errors.heightCm}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">当前体重（kg）</span>
            <input
              value={values.currentWeightKg}
              onChange={(event) => onChange('currentWeightKg', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="30 - 250"
              inputMode="decimal"
              aria-invalid={errors.currentWeightKg !== null}
            />
            {errors.currentWeightKg ? (
              <p className="mt-1 text-xs text-rose-600">{errors.currentWeightKg}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">目标体重（kg）</span>
            <input
              value={values.targetWeightKg}
              onChange={(event) => onChange('targetWeightKg', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="需小于等于当前体重"
              inputMode="decimal"
              aria-invalid={errors.targetWeightKg !== null}
            />
            {errors.targetWeightKg ? (
              <p className="mt-1 text-xs text-rose-600">{errors.targetWeightKg}</p>
            ) : null}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {getSubmitLabel(mode, isSubmitting)}
          </button>
        </form>
      )}

      {submitError ? <p className="mt-4 text-sm text-rose-600">{submitError}</p> : null}
      {successMessage ? <p className="mt-4 text-sm text-emerald-600">{successMessage}</p> : null}
      {traceId ? <p className="mt-2 text-xs text-slate-500">traceId: {traceId}</p> : null}
    </section>
  );
}
