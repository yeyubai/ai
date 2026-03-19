'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LoaderCircle, MessageCircleMore, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isApiError } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { createCoachMessage, fetchCoachSession } from '../../api/coach.api';
import { CoachMarkdownMessage } from '../components/coach-markdown-message';
import type { CoachSession } from '../../types/coach.types';

function formatSessionTime(value: string): string {
  return new Date(value).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CoachChatSection({ sessionId }: { sessionId: string }) {
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const [session, setSession] = useState<CoachSession | null>(null);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!token || sessionStatus !== 'ready') {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const nextSession = await fetchCoachSession(sessionId);
        if (active) {
          setSession(nextSession);
          setError(null);
        }
      } catch {
        if (active) {
          setError('聊天记录加载失败，请稍后重试。');
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
  }, [sessionId, sessionStatus, token]);

  const chatMessages = useMemo(
    () => session?.messages.filter((message) => message.role === 'user' || message.role === 'assistant') ?? [],
    [session],
  );

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [chatMessages.length]);

  const handleSend = async () => {
    if (!session || !question.trim()) {
      return;
    }

    const userContent = question.trim();
    setQuestion('');
    setIsSending(true);
    setError(null);

    const optimisticMessage = {
      id: `local-${Date.now()}`,
      role: 'user' as const,
      content: userContent,
      createdAt: new Date().toISOString(),
    };

    setSession((current) =>
      current
        ? { ...current, messages: [...current.messages, optimisticMessage] }
        : current,
    );

    try {
      const reply = await createCoachMessage(session.sessionId, userContent);
      setSession((current) =>
        current
          ? {
              ...current,
              messages: [
                ...current.messages.filter((message) => message.id !== optimisticMessage.id),
                optimisticMessage,
                reply.message,
              ],
            }
          : current,
      );
    } catch (error) {
      setSession((current) =>
        current
          ? {
              ...current,
              messages: current.messages.filter((message) => message.id !== optimisticMessage.id),
            }
          : current,
      );

      if (isApiError(error) && error.code === 'COACH_CHAT_RATE_LIMIT') {
        setError('今天的追问次数已用完，请稍后再试。');
      } else {
        setError('发送失败，请稍后重试。');
      }
      setQuestion(userContent);
    } finally {
      setIsSending(false);
    }
  };

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="app-page space-y-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-[140px] rounded-[28px]" />
        <Skeleton className="h-[420px] rounded-[30px]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app-page">
        <Alert variant="destructive">
          <AlertDescription>{error ?? '当前会话暂时不可用。'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="app-page flex min-h-[calc(var(--app-viewport-height)-var(--app-tab-bar-offset))] flex-col space-y-4 px-4 pb-[calc(20px+var(--app-safe-area-bottom)+var(--native-keyboard-inset))] pt-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="glass-card border-none">
        <CardContent className="flex items-start gap-4 p-5">
          <Link
            href="/me/coach"
            aria-label="返回分析页"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-slate-700 shadow-sm transition hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <MessageCircleMore className="h-5 w-5 text-primary" />
              <p className="font-semibold text-slate-900">高级私教对话</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              基于 {formatSessionTime(session.updatedAt)} 这次体型分析继续提问。支持 Markdown 展示，长回答会自动排版。
            </p>
          </div>

          <Link
            href="/me/coach"
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border/70 bg-white px-3 text-sm font-medium text-slate-700"
          >
            <RefreshCcw className="h-4 w-4" />
            返回分析
          </Link>
        </CardContent>
      </Card>

      <Card className="glass-card flex min-h-0 flex-1 border-none">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          <div className="rounded-[24px] bg-cyan-50/70 p-4">
            <p className="text-[13px] font-medium text-cyan-700">本次分析摘要</p>
            <p className="mt-2 text-[15px] leading-7 text-slate-900">{session.analysisSummary.bodyTypeSummary}</p>
          </div>

          <div className="min-h-[220px] flex-1 space-y-3 overflow-y-auto pr-1">
            {chatMessages.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 px-4 py-6 text-sm leading-6 text-slate-500">
                还没有追问内容。你可以试试：
                <br />
                `我更适合先减脂还是先塑形？`
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'rounded-[24px] px-4 py-3 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.18)]',
                    message.role === 'assistant'
                      ? 'bg-white/82 text-slate-800'
                      : 'ml-10 bg-[linear-gradient(180deg,#24d3d4,#0faab7)] text-white',
                  )}
                >
                  {message.role === 'assistant' ? (
                    <CoachMarkdownMessage content={message.content} />
                  ) : (
                    <p className="text-sm leading-7">{message.content}</p>
                  )}
                </div>
              ))
            )}
            <div ref={messageEndRef} />
          </div>

          <div className="space-y-3 border-t border-white/40 pt-4">
            <Textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={4}
              placeholder="继续追问，例如：我应该先从腰腹训练开始，还是先提高日常活动量？"
              className="min-h-[112px] resize-none rounded-[22px] border-border/70 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus-visible:ring-primary/20"
            />

            <div className="flex justify-end">
              <Button
                type="button"
                className="rounded-2xl"
                onClick={() => void handleSend()}
                disabled={!question.trim() || isSending}
              >
                {isSending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    发送中...
                  </>
                ) : (
                  '发送'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
