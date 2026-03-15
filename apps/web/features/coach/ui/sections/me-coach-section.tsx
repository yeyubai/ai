'use client';

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ImagePlus,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isApiError } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { MeDetailShell } from '@/features/settings/ui/components/me-detail-shell';
import { createCoachAnalysis, fetchLatestCoachSession } from '../../api/coach.api';
import type { CoachSession } from '../../types/coach.types';

function formatSessionTime(value: string): string {
  return new Date(value).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AnalysisList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'neutral' | 'warm' | 'cool';
}) {
  const toneClass =
    tone === 'warm'
      ? 'bg-amber-50 text-amber-700'
      : tone === 'cool'
        ? 'bg-cyan-50 text-cyan-700'
        : 'bg-slate-50 text-slate-700';

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-semibold text-slate-900">{title}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={`${title}-${item}`}
            className={cn('rounded-2xl px-3 py-2 text-[13px] leading-6', toneClass)}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MeCoachSection() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [session, setSession] = useState<CoachSession | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!token || sessionStatus !== 'ready') {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await fetchLatestCoachSession();
        if (active) {
          setSession(result.session);
          setError(null);
        }
      } catch {
        if (active) {
          setError('高级私教加载失败，请稍后重试。');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [sessionStatus, token]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [selectedFile]);

  const hasReadySession = useMemo(
    () => Boolean(session && session.status === 'ready'),
    [session],
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
  };

  const handleOpenPicker = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('请先选择一张体型照片。');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const nextSession = await createCoachAnalysis(selectedFile);
      setSession(nextSession);
      setSelectedFile(null);
    } catch (error) {
      if (isApiError(error) && error.code === 'COACH_ANALYSIS_RATE_LIMIT') {
        setError('今天的分析次数已用完，请明天再试。');
      } else if (isApiError(error) && error.code === 'INVALID_PARAMS') {
        setError('图片上传失败，请重新选择一张清晰的照片。');
      } else {
        setError('体型分析失败，请稍后重试。');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenChat = () => {
    if (!session) {
      return;
    }
    router.push(`/me/coach/chat/${session.sessionId}`);
  };

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="app-page space-y-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-[220px] rounded-[30px]" />
        <Skeleton className="h-[280px] rounded-[30px]" />
      </div>
    );
  }

  return (
    <MeDetailShell title="高级私教" description="先做单次体型分析，再进入专用聊天页继续追问。">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="glass-card border-none">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">上传体型照</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                仅用于本次分析，不会长期保存原图。建议使用正面、站姿自然、光线清晰的全身照片。
              </p>
            </div>
          </div>

          {previewUrl ? (
            <div className="overflow-hidden rounded-[24px] border border-dashed border-primary/30 bg-cyan-50/70">
              <img src={previewUrl} alt="体型预览" className="h-[240px] w-full object-cover" />
            </div>
          ) : session ? (
            <div className="rounded-[24px] border border-dashed border-primary/25 bg-cyan-50/60 p-4 text-sm leading-6 text-slate-600">
              已载入最近一次分析：{formatSessionTime(session.updatedAt)}。如果想重新分析，可以重新选择一张图片。
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenPicker}
              className="flex w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-primary/30 bg-cyan-50/70 px-5 py-10 text-center transition hover:bg-cyan-50"
            >
              <ImagePlus className="h-8 w-8 text-primary" />
              <p className="mt-4 text-[15px] font-semibold text-slate-900">选择一张体型照片</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                支持拍照或相册选择，首版只分析单张图片。
              </p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap gap-3">
            <Button type="button" className="rounded-2xl" onClick={handleOpenPicker}>
              选择图片
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => void handleAnalyze()}
              disabled={!selectedFile || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  分析中...
                </>
              ) : (
                '开始分析'
              )}
            </Button>
            {session ? (
              <Button
                type="button"
                variant="ghost"
                className="rounded-2xl"
                onClick={handleOpenPicker}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                换图重分析
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {session ? (
        <Card className="glass-card border-none">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">分析结果</p>
                <p className="mt-1 text-sm text-slate-500">
                  {session.analysisSummary.confidenceNote}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-cyan-50/70 p-4">
              <p className="text-[13px] font-medium text-cyan-700">结论</p>
              <p className="mt-2 text-[15px] leading-7 text-slate-900">
                {session.analysisSummary.bodyTypeSummary}
              </p>
            </div>

            <AnalysisList title="主要观察点" items={session.analysisSummary.highlights} tone="cool" />
            <AnalysisList title="注意事项" items={session.analysisSummary.risks} tone="warm" />
            <AnalysisList title="建议动作" items={session.analysisSummary.actionSuggestions} tone="neutral" />

            <div className="rounded-[24px] border border-white/50 bg-white/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">继续追问</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    进入专用聊天页，继续问腰腹、体态、塑形顺序、训练节奏等问题。
                  </p>
                </div>
                <Button
                  type="button"
                  className="shrink-0 rounded-2xl"
                  onClick={handleOpenChat}
                  disabled={!hasReadySession}
                >
                  去聊天
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="rounded-[22px] bg-slate-50 px-4 py-3 text-[12px] leading-6 text-slate-500">
              {session.analysisSummary.disclaimer}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="glass-card border-none">
        <CardContent className="p-5">
          <p className="text-sm leading-6 text-slate-500">
            说明：当前页只负责上传和分析结果查看；长对话会进入独立聊天页，避免内容堆在底部影响阅读。
          </p>
        </CardContent>
      </Card>
    </MeDetailShell>
  );
}
