'use client';

import { type FormEvent, useMemo, useState } from 'react';
import { Target, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEnsureSessionReady } from '@/features/auth/hooks/use-ensure-session-ready';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { PageSkeleton } from '@/shared/feedback/page-skeleton';
import { StatusAlert } from '@/shared/feedback/status-alert';
import {
  getMeAccountLabel,
  meMessages,
} from '../../copy/me.messages';
import { getWeightUnitName } from '../../config/weight-unit';
import { useMeProfileDraftResource } from '../../hooks/use-me-profile-draft-resource';
import { useSaveMeProfileAction } from '../../hooks/use-save-me-profile-action';
import { useMeFormDraftStore } from '../../model/me-form-draft.store';
import { MeDetailShell } from '../components/me-detail-shell';
import { WheelNumberField } from '../components/wheel-number-field';

export function MeProfileSection() {
  useEnsureSessionReady();

  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const userRole = useAuthStore((state) => state.userRole);
  const ensureGuestSession = useAuthStore((state) => state.ensureGuestSession);
  const profile = useMeFormDraftStore((state) => state.profileDraft);
  const goal = useMeFormDraftStore((state) => state.goalDraft);
  const updateProfileDraft = useMeFormDraftStore((state) => state.updateProfileDraft);
  const [submitFeedback, setSubmitFeedback] = useState<{
    message: string | null;
    errorMessage: string | null;
  }>({
    message: null,
    errorMessage: null,
  });
  const profileResource = useMeProfileDraftResource({
    canLoad: Boolean(token) && sessionStatus === 'ready',
    ownerKey: token,
    sessionReady: sessionStatus === 'ready',
  });
  const saveProfileAction = useSaveMeProfileAction();

  const errorMessage = useMemo(() => {
    return (
      submitFeedback.errorMessage ??
      saveProfileAction.error?.displayMessage ??
      profileResource.error?.displayMessage ??
      null
    );
  }, [
    profileResource.error?.displayMessage,
    saveProfileAction.error?.displayMessage,
    submitFeedback.errorMessage,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || !goal) {
      return;
    }

    setSubmitFeedback({
      message: null,
      errorMessage: null,
    });

    const feedback = await saveProfileAction.run({
      profileDraft: profile,
      goalDraft: goal,
    });

    if (feedback) {
      setSubmitFeedback(feedback);
    }
  };

  if (sessionStatus === 'loading' || sessionStatus === 'idle' || profileResource.isLoading) {
    return (
      <PageSkeleton
        blocks={[
          'h-16 rounded-2xl',
          'h-[320px] rounded-[30px]',
          'h-[300px] rounded-[30px]',
        ]}
      />
    );
  }

  if (sessionStatus === 'error') {
    return (
      <MeDetailShell title="资料与目标">
        <div className="space-y-4">
          <StatusAlert
            variant="destructive"
            message="当前会话建立失败，请重试后再加载资料。"
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

  if (!profile || !goal) {
    return (
      <MeDetailShell title="资料与目标">
        <StatusAlert
          variant="destructive"
          message={errorMessage ?? meMessages.profile.unavailable}
        />
      </MeDetailShell>
    );
  }

  const weightUnit = goal.weightUnit;

  return (
    <MeDetailShell title="资料与目标">
      {errorMessage ? (
        <StatusAlert variant="destructive" message={errorMessage} />
      ) : null}
      {submitFeedback.message ? (
        <StatusAlert message={submitFeedback.message} />
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="glass-card border-none">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">基础资料</p>
                <p className="mt-1 text-[12px] text-slate-500">
                  用于计算 BMI，也会影响趋势解读。
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="me-account-type">账号</Label>
                <Input
                  id="me-account-type"
                  value={getMeAccountLabel(userRole)}
                  readOnly
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="me-profile-nickname">昵称</Label>
                <Input
                  id="me-profile-nickname"
                  value={profile.nickname ?? ''}
                  onChange={(event) =>
                    updateProfileDraft((current) => ({
                      ...current,
                      nickname: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <p
                  id="me-profile-height-label"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  身高（cm）
                </p>
                <WheelNumberField
                  field="profile-height"
                  value={profile.heightCm}
                  ariaLabelledBy="me-profile-height-label"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">体重目标</p>
                <p className="mt-1 text-[12px] text-slate-500">
                  当前体重、目标体重和单位放在一起调整。
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p
                  id="me-goal-start-weight-label"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  当前体重
                </p>
                <WheelNumberField
                  field="goal-start-weight"
                  value={goal.startWeightKg}
                  weightUnit={weightUnit}
                  ariaLabelledBy="me-goal-start-weight-label"
                />
              </div>
              <div className="space-y-2">
                <p
                  id="me-goal-target-weight-label"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  目标体重
                </p>
                <WheelNumberField
                  field="goal-target-weight"
                  value={goal.targetWeightKg}
                  weightUnit={weightUnit}
                  ariaLabelledBy="me-goal-target-weight-label"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="me-goal-weight-unit">单位</Label>
              <Input
                id="me-goal-weight-unit"
                value={`${getWeightUnitName(weightUnit)}（${weightUnit}）`}
                readOnly
                className="bg-slate-50"
              />
              <p className="text-[12px] text-slate-500">
                当前体重和目标体重会按这个单位显示，保存时统一换算到底层标准值。
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex">
          <Button
            type="submit"
            className="h-11 rounded-2xl px-6"
            disabled={saveProfileAction.isPending}
          >
            {saveProfileAction.isPending ? '保存中...' : '保存本页设置'}
          </Button>
        </div>
      </form>
    </MeDetailShell>
  );
}
