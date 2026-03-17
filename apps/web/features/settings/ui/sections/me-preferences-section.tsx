'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Palette } from 'lucide-react';
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
import { useEnsureSessionReady } from '@/features/auth/hooks/use-ensure-session-ready';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { PageSkeleton } from '@/shared/feedback/page-skeleton';
import { StatusAlert } from '@/shared/feedback/status-alert';
import { meMessages } from '../../copy/me.messages';
import { useMeSettingsResource } from '../../hooks/use-me-settings-resource';
import { useSaveMeSettingsAction } from '../../hooks/use-save-me-settings-action';
import type { UserSettings } from '../../types/settings.types';
import { MeDetailShell } from '../components/me-detail-shell';

export function MePreferencesSection() {
  useEnsureSessionReady();

  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const ensureGuestSession = useAuthStore((state) => state.ensureGuestSession);
  const [settingsDraft, setSettingsDraft] = useState<UserSettings | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const settingsResource = useMeSettingsResource(
    Boolean(token) && sessionStatus === 'ready',
  );
  const saveSettingsAction = useSaveMeSettingsAction();

  useEffect(() => {
    if (!settingsResource.data) {
      return;
    }

    setSettingsDraft(settingsResource.data);
  }, [settingsResource.data]);

  const errorMessage = useMemo(() => {
    return (
      saveSettingsAction.error?.displayMessage ??
      settingsResource.error?.displayMessage ??
      null
    );
  }, [
    saveSettingsAction.error?.displayMessage,
    settingsResource.error?.displayMessage,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settingsDraft) {
      return;
    }

    setSubmitMessage(null);

    const nextSettings = await saveSettingsAction.run(settingsDraft);
    if (nextSettings) {
      setSettingsDraft(nextSettings);
      setSubmitMessage(meMessages.preferences.saveSuccess);
    }
  };

  if (sessionStatus === 'loading' || sessionStatus === 'idle' || settingsResource.isLoading) {
    return (
      <PageSkeleton
        blocks={['h-16 rounded-2xl', 'h-[280px] rounded-[30px]']}
      />
    );
  }

  if (sessionStatus === 'error') {
    return (
      <MeDetailShell title="日记与皮肤" description="调整你的日记名称和主题。">
        <div className="space-y-4">
          <StatusAlert
            variant="destructive"
            message="当前会话建立失败，请重试后再加载页面设置。"
          />
          <Button
            type="button"
            className="w-fit rounded-2xl"
            onClick={() => void ensureGuestSession()}
          >
            重新建立会话
          </Button>
        </div>
      </MeDetailShell>
    );
  }

  if (!settingsDraft) {
    return (
      <MeDetailShell title="日记与皮肤" description="调整你的日记名称和主题。">
        <StatusAlert
          variant="destructive"
          message={errorMessage ?? meMessages.preferences.unavailable}
        />
      </MeDetailShell>
    );
  }

  return (
    <MeDetailShell title="日记与皮肤" description="让你的日记页更像你自己。">
      {errorMessage ? (
        <StatusAlert variant="destructive" message={errorMessage} />
      ) : null}
      {submitMessage ? <StatusAlert message={submitMessage} /> : null}

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
              <Label htmlFor="me-diary-name">日记名称</Label>
              <Input
                id="me-diary-name"
                value={settingsDraft.diaryName}
                onChange={(event) =>
                  setSettingsDraft((current) =>
                    current ? { ...current, diaryName: event.target.value } : current,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="me-theme-select">主题</Label>
              <Select
                value={settingsDraft.theme}
                onValueChange={(value) =>
                  setSettingsDraft((current) =>
                    current ? { ...current, theme: value as UserSettings['theme'] } : current,
                  )
                }
              >
                <SelectTrigger id="me-theme-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aqua-mist">焕新清爽</SelectItem>
                  <SelectItem value="sea-breeze">海盐薄雾</SelectItem>
                  <SelectItem value="paper-light">纸感浅色</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="rounded-2xl"
              disabled={saveSettingsAction.isPending}
            >
              {saveSettingsAction.isPending ? '保存中...' : '保存页面设置'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </MeDetailShell>
  );
}
