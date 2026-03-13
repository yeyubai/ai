import type { FormEvent } from 'react';

type Props = {
  phone: string;
  code: string;
  phoneError: string | null;
  codeError: string | null;
  submitError: string | null;
  traceId: string | null;
  isSubmitting: boolean;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginFormCard({
  phone,
  code,
  phoneError,
  codeError,
  submitError,
  traceId,
  isSubmitting,
  onPhoneChange,
  onCodeChange,
  onSubmit,
}: Props) {
  return (
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          AI Weight Coach
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">手机号登录</h1>
        <p className="mt-2 text-sm text-slate-600">请输入手机号和验证码（默认测试码 123456）。</p>
      </header>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">手机号</span>
          <input
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="例如 13800138000"
            autoComplete="tel"
            inputMode="numeric"
            maxLength={11}
            aria-invalid={phoneError !== null}
          />
          {phoneError ? <p className="mt-1 text-xs text-rose-600">{phoneError}</p> : null}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">验证码</span>
          <input
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="6 位数字"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            aria-invalid={codeError !== null}
          />
          {codeError ? <p className="mt-1 text-xs text-rose-600">{codeError}</p> : null}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? '登录中...' : '登录'}
        </button>
      </form>

      {submitError ? <p className="mt-4 text-sm text-rose-600">{submitError}</p> : null}
      {traceId ? <p className="mt-2 text-xs text-slate-500">traceId: {traceId}</p> : null}
    </section>
  );
}
