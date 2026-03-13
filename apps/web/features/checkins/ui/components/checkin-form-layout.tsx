import type { FormEvent, ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  isBackfill: boolean;
  checkinDate: string;
  minDate: string;
  maxDate: string;
  isSubmitting: boolean;
  submitLabel: string;
  submitError: string | null;
  successMessage: string | null;
  traceId: string | null;
  onBackfillChange: (value: boolean) => void;
  onCheckinDateChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
};

export function CheckinFormLayout({
  title,
  description,
  isBackfill,
  checkinDate,
  minDate,
  maxDate,
  isSubmitting,
  submitLabel,
  submitError,
  successMessage,
  traceId,
  onBackfillChange,
  onCheckinDateChange,
  onSubmit,
  children,
}: Props) {
  return (
    <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>

      <div className="mt-4 rounded-xl bg-slate-50 px-3 py-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isBackfill}
            onChange={(event) => onBackfillChange(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
          />
          补录模式（最近 7 天）
        </label>

        <div className="mt-3">
          <label className="block text-sm text-slate-700">
            打卡日期
            <input
              type="date"
              value={checkinDate}
              min={minDate}
              max={maxDate}
              disabled={!isBackfill}
              onChange={(event) => onCheckinDateChange(event.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>
        </div>

        {isBackfill ? (
          <p className="mt-3 inline-flex rounded-lg bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
            当前为补录模式
          </p>
        ) : null}
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        {children}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? '提交中...' : submitLabel}
        </button>
      </form>

      {submitError ? <p className="mt-4 text-sm text-rose-600">{submitError}</p> : null}
      {successMessage ? <p className="mt-4 text-sm text-emerald-600">{successMessage}</p> : null}
      {traceId ? <p className="mt-2 text-xs text-slate-500">traceId: {traceId}</p> : null}
    </section>
  );
}
