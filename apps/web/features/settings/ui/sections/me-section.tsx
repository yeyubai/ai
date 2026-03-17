'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  Download,
  Palette,
  Share2,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEnsureSessionReady } from '@/features/auth/hooks/use-ensure-session-ready';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { PageSkeleton } from '@/shared/feedback/page-skeleton';
import { StatusAlert } from '@/shared/feedback/status-alert';
import { platformBridge, type PlatformAppInfo } from '@/lib/platform';
import { cn } from '@/lib/utils';
import { meMessages } from '../../copy/me.messages';
import {
  formatWeightByUnit,
  formatWeightNumberByUnit,
  getWeightUnitLabel,
} from '../../config/weight-unit';
import { useMeOverviewResource } from '../../hooks/use-me-overview-resource';
import { useRequestMeExportAction } from '../../hooks/use-request-me-export-action';

function SummaryLinkCard({
  href,
  icon,
  title,
  description,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="glass-card border-none transition-transform duration-200 hover:-translate-y-0.5">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-900">{title}</p>
              <span className="text-sm font-medium text-slate-400">{value}</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </CardContent>
      </Card>
    </Link>
  );
}

function MetricCell({
  label,
  value,
  unit,
  withDivider,
}: {
  label: string;
  value: string;
  unit?: string;
  withDivider?: boolean;
}) {
  return (
    <div className={cn('px-3', withDivider && 'border-l border-white/18 pl-5')}>
      <div className="flex items-end justify-center gap-2">
        <span className="text-[1.5rem] font-semibold leading-none tracking-[-0.03em] text-slate-950">
          {value}
        </span>
        {unit ? (
          <span className="pb-1 text-[12px] font-medium text-slate-500">{unit}</span>
        ) : null}
      </div>
      <p className="mt-2 whitespace-nowrap text-[12px] font-medium text-slate-600">
        {label}
      </p>
    </div>
  );
}

export function MeSection() {
  useEnsureSessionReady();

  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const userRole = useAuthStore((state) => state.userRole);
  const logout = useAuthStore((state) => state.logout);
  const ensureGuestSession = useAuthStore((state) => state.ensureGuestSession);
  const [message, setMessage] = useState<string | null>(null);
  const [latestExportTaskId, setLatestExportTaskId] = useState<string | null>(null);
  const [appInfo, setAppInfo] = useState<PlatformAppInfo | null>(null);
  const overviewResource = useMeOverviewResource(
    Boolean(token) && sessionStatus === 'ready',
  );
  const exportAction = useRequestMeExportAction();

  useEffect(() => {
    let active = true;

    void platformBridge.getAppInfo().then((info) => {
      if (active) {
        setAppInfo(info);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const errorMessage = useMemo(() => {
    return (
      exportAction.error?.displayMessage ??
      overviewResource.error?.displayMessage ??
      null
    );
  }, [
    exportAction.error?.displayMessage,
    overviewResource.error?.displayMessage,
  ]);

  const handleExport = async () => {
    setMessage(null);
    const task = await exportAction.run(undefined);
    if (task) {
      setMessage(task.message);
      setLatestExportTaskId(task.taskId);
    }
  };

  const handleShareExport = async () => {
    if (!latestExportTaskId || !message) {
      return;
    }

    const shared = await platformBridge.share({
      title: 'AI Weight Coach 导出任务',
      text: `${message}\n任务 ID：${latestExportTaskId}`,
    });

    if (!shared) {
      setMessage('当前环境暂不支持系统分享，已保留导出任务信息。');
    }
  };

  if (sessionStatus === 'loading' || sessionStatus === 'idle' || overviewResource.isLoading) {
    return (
      <PageSkeleton
        blocks={[
          'h-[180px] rounded-[30px]',
          'h-[104px] rounded-[30px]',
          'h-[104px] rounded-[30px]',
        ]}
      />
    );
  }

  if (sessionStatus === 'error') {
    return (
      <div className="app-page space-y-4">
        <StatusAlert
          variant="destructive"
          message="当前会话建立失败，请重试。"
        />
        <Button
          type="button"
          className="w-fit rounded-2xl"
          onClick={() => void ensureGuestSession()}
        >
          重新建立会话
        </Button>
      </div>
    );
  }

  if (!overviewResource.data) {
    return (
      <div className="app-page">
        <StatusAlert
          variant="destructive"
          message={errorMessage ?? meMessages.overview.unavailable}
        />
      </div>
    );
  }

  const { profile, goal, settings, summary } = overviewResource.data;
  const weightUnit = settings.weightUnit;
  const displayName =
    profile.nickname?.trim() || (userRole === 'guest' ? '游客' : '体重用户');

  return (
    <div className="app-page space-y-4">
      {errorMessage ? (
        <StatusAlert variant="destructive" message={errorMessage} />
      ) : null}
      {message ? <StatusAlert message={message} /> : null}

      <Card className="overflow-hidden rounded-[30px] border border-white/55 bg-[linear-gradient(180deg,rgba(244,251,252,0.98),rgba(234,246,248,0.98))] shadow-[0_24px_60px_-34px_rgba(15,170,183,0.32)] backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[3px] border-cyan-900/55 bg-white/55 text-cyan-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
              <UserRound className="h-11 w-11" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-cyan-800/70">我的</p>
              <h1 className="mt-2 truncate text-[2.3rem] font-semibold leading-none text-slate-950">
                {displayName}
              </h1>
              <p className="mt-3 max-w-[18rem] text-[14px] leading-6 text-slate-600">
                {userRole === 'guest'
                  ? '当前以游客身份使用，登录后可同步本机记录与目标。'
                  : '在这里管理个人资料、目标设置与数据导出。'}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/50 bg-white/58 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            <div className="grid grid-cols-[1.1fr_1.05fr_1.25fr] text-center">
              <MetricCell label="记录天数" value={`${summary.recordDays}`} />
              <MetricCell
                label="体脂"
                value={summary.bodyFatPct?.toFixed(1) ?? '--'}
                unit={summary.bodyFatPct === null ? undefined : '%'}
                withDivider
              />
              <MetricCell
                label="体重变化"
                value={
                  summary.deltaFromStart === null
                    ? '--'
                    : formatWeightNumberByUnit(summary.deltaFromStart, weightUnit, 2)
                }
                unit={
                  summary.deltaFromStart === null
                    ? undefined
                    : getWeightUnitLabel(weightUnit)
                }
                withDivider
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <SummaryLinkCard
          href="/me/coach"
          icon={<Sparkles className="h-5 w-5" />}
          title="高级私教"
          value="图片分析"
          description="上传体型照，获得分析结果与后续追问建议。"
        />
        <SummaryLinkCard
          href="/me/profile"
          icon={<UserRound className="h-5 w-5" />}
          title="资料与目标"
          value={
            goal.targetWeightKg
              ? `目标 ${formatWeightByUnit(goal.targetWeightKg, weightUnit, 1)}`
              : '待完善'
          }
          description="集中维护昵称、身高与体重目标。"
        />
        <SummaryLinkCard
          href="/me/preferences"
          icon={<Palette className="h-5 w-5" />}
          title="日记与皮肤"
          value={settings.diaryName}
          description="调整日记名称和页面主题。"
        />
      </div>

      <Card className="glass-card border-none">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <p className="font-semibold text-slate-900">导出与账号</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {userRole === 'guest'
              ? '可创建导出任务，并在登录后同步当前设备上的记录。'
              : '可创建导出任务，并管理当前账号状态。'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => void handleExport()}
              className="rounded-2xl"
              disabled={exportAction.isPending}
            >
              {exportAction.isPending ? '创建中...' : '创建导出任务'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleShareExport()}
              className="rounded-2xl"
              disabled={!latestExportTaskId || !message}
            >
              <Share2 className="mr-2 h-4 w-4" />
              分享任务信息
            </Button>
            {userRole === 'guest' ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.assign('/auth/login')}
                className="rounded-2xl"
              >
                登录并同步游客数据
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => logout()}
                className="rounded-2xl"
              >
                退出登录
              </Button>
            )}
          </div>
          {appInfo ? (
            <p className="text-xs leading-5 text-slate-400">
              当前环境：{appInfo.isNative ? `${appInfo.platform} app` : 'web'}，版本{' '}
              {appInfo.version ?? '--'}
              {appInfo.build ? `（build ${appInfo.build}）` : ''}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
