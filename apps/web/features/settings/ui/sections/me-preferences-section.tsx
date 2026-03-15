'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { fetchSettings, updateSettings } from '../../api/me.api';
import type { UserSettings } from '../../types/settings.types';
import { MeDetailShell } from '../components/me-detail-shell';

export function MePreferencesSection() {
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || sessionStatus !== 'ready') {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const nextSettings = await fetchSettings();
        if (active) {
          setSettings(nextSettings);
        }
      } catch {
        if (active) {
          setError('页面设置加载失败，请稍后重试。');
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings) {
      return;
    }

    try {
      setIsSubmitting(true);
      const nextSettings = await updateSettings({
        diaryName: settings.diaryName,
        theme: settings.theme,
      });
      setSettings(nextSettings);
      setMessage('页面设置已保存。');
      setError(null);
    } catch {
      setError('保存页面设置失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="app-page space-y-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-[280px] rounded-[30px]" />
      </div>
    );
  }

  if (!settings) {
    return (
      <MeDetailShell title="日记与皮肤" description="调整你的日记名称和主题。">
        <Alert variant="destructive">
          <AlertDescription>{error ?? '页面设置暂时不可用。'}</AlertDescription>
        </Alert>
      </MeDetailShell>
    );
  }

  return (
    <MeDetailShell title="日记与皮肤" description="让你的日记页更像你自己。">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit}>
        <Card className="glass-card border-none">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Palette className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-900">页面风格</p>
            </div>

            <div className="space-y-2">
              <Label>日记名称</Label>
              <Input
                value={settings.diaryName}
                onChange={(event) =>
                  setSettings((current) =>
                    current ? { ...current, diaryName: event.target.value } : current,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>主题</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) =>
                  setSettings((current) =>
                    current ? { ...current, theme: value as UserSettings['theme'] } : current,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aqua-mist">焕新清爽</SelectItem>
                  <SelectItem value="sea-breeze">海盐薄雾</SelectItem>
                  <SelectItem value="paper-light">纸感浅色</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="rounded-2xl" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存页面设置'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </MeDetailShell>
  );
}
