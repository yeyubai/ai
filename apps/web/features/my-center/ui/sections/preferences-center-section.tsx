'use client';

import { useEffect, useState } from 'react';
import { Bell, Crown, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchMembershipStatus, fetchReminderSettings, fetchSettings, updateReminderSettings, updateSettings } from '../../api/my-center.api';
import type { AppSettings, MembershipStatus, ReminderSettings } from '../../types/my-center.types';

export function PreferencesCenterSection() {
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [reminders, setReminders] = useState<ReminderSettings | null>(null);
  const [settings, setSettingsState] = useState<AppSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([fetchMembershipStatus(), fetchReminderSettings(), fetchSettings()]).then(
      ([membershipData, reminderData, settingsData]) => {
        setMembership(membershipData);
        setReminders(reminderData);
        setSettingsState(settingsData);
      },
    );
  }, []);

  if (!membership || !reminders || !settings) {
    return <div className="h-96 rounded-3xl bg-card/60" />;
  }

  return (
    <div className="grid gap-4">
      <Card className="border-border/70 bg-card/92 backdrop-blur">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
          <Badge variant="secondary" className="w-fit">我的</Badge>
          <CardTitle className="flex items-center gap-2 text-3xl"><Crown className="h-6 w-6 text-primary" />会员与提醒</CardTitle>
          <CardDescription>这里承接会员价值解释、提醒设置和基础偏好，不抢首页主叙事。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
              <p className="text-sm text-muted-foreground">当前计划</p>
              <p className="mt-2 text-3xl font-semibold">{membership.plan === 'free' ? '免费基础版' : '会员增强版'}</p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>深度复盘：{membership.entitlements.deepReview ? '已解锁' : '未解锁'}</p>
                <p>周报洞察：{membership.entitlements.weeklyInsight ? '已解锁' : '未解锁'}</p>
                <p>强提醒：{membership.entitlements.strongReminder ? '已解锁' : '未解锁'}</p>
              </div>
              <div className="mt-4 rounded-2xl bg-muted/55 p-3 text-sm text-muted-foreground">
                {membership.upgradePrompts[0]?.headline}
              </div>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <p className="font-semibold">提醒策略</p>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="space-y-2">
                  <Label htmlFor="dailyMissionTimes">首页提醒时间</Label>
                  <Input id="dailyMissionTimes" value={reminders.dailyMissionReminderTimes.join(', ')} onChange={(event) => setReminders({ ...reminders, dailyMissionReminderTimes: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewReminderTime">复盘提醒时间</Label>
                  <Input id="reviewReminderTime" value={reminders.reviewReminderTime} onChange={(event) => setReminders({ ...reminders, reviewReminderTime: event.target.value })} />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox checked={reminders.strongReminderEnabled} onCheckedChange={(checked) => setReminders({ ...reminders, strongReminderEnabled: Boolean(checked) })} />
                  <p>强提醒（会员增强）</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
              <p className="font-semibold">基础偏好</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>单位</Label>
                  <Select value={settings.weightUnit} onValueChange={(value) => setSettingsState({ ...settings, weightUnit: value as 'kg' | 'lb' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">时区</Label>
                  <Input id="timezone" value={settings.timezone} onChange={(event) => setSettingsState({ ...settings, timezone: event.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="locale">语言</Label>
                  <Input id="locale" value={settings.locale} onChange={(event) => setSettingsState({ ...settings, locale: event.target.value })} />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button onClick={() => void updateReminderSettings(reminders).then(setReminders).then(() => setMessage('提醒设置已保存。')).catch(() => setMessage('当前会员等级不支持强提醒，或时间落入静默时段。'))}>
                  <Save className="h-4 w-4" />
                  保存提醒
                </Button>
                <Button variant="outline" onClick={() => void updateSettings(settings).then(setSettingsState).then(() => setMessage('基础偏好已保存。'))}>
                  保存偏好
                </Button>
              </div>
            </div>
            {message ? (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
