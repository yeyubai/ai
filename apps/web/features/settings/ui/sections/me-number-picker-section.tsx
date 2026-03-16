'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from '@ncdai/react-wheel-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ME_NUMBER_PICKER_CONFIG,
  type MeNumberPickerField,
} from '../../config/me-number-picker.config';
import { useMeFormDraftStore } from '../../model/me-form-draft.store';

const WHEEL_VISIBLE_COUNT = 12;
const WHEEL_ITEM_HEIGHT = 54;
const DIGITS = Array.from({ length: 10 }, (_, index) => index);
const wheelClassNames = {
  optionItem:
    'text-[17px] font-medium tracking-[-0.02em] text-slate-300 transition-colors duration-150 data-[disabled]:opacity-20',
  highlightWrapper:
    'mx-1 rounded-[20px] border border-cyan-100 bg-[#eefbfd] shadow-[0_10px_24px_-20px_rgba(15,170,183,0.42)]',
  highlightItem: 'text-[19px] font-semibold tracking-[-0.04em] text-slate-950',
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeInteger(value: number, min: number, max: number): number {
  return clamp(Math.round(value), Math.round(min), Math.round(max));
}

function normalizeDecimal(value: number, min: number, max: number): number {
  return Math.round(clamp(value, min, max) * 100) / 100;
}

function toScaledValue(mode: 'integer' | 'decimal', value: number): number {
  return mode === 'integer' ? Math.round(value) : Math.round(value * 100);
}

function fromScaledValue(mode: 'integer' | 'decimal', value: number): number {
  return mode === 'integer' ? value : value / 100;
}

function getDigitPlaces(mode: 'integer' | 'decimal'): number[] {
  return mode === 'integer' ? [100, 10, 1] : [10000, 1000, 100, 10, 1];
}

function getDigitLabels(mode: 'integer' | 'decimal'): string[] {
  return mode === 'integer'
    ? ['百', '十', '个']
    : ['百', '十', '个', '十分', '百分'];
}

function getDigits(value: number, places: number[]): number[] {
  return places.map((place) => Math.floor(value / place) % 10);
}

function buildDigitOptions(
  digits: number[],
  places: number[],
  index: number,
  minValue: number,
  maxValue: number,
): WheelPickerOption<number>[] {
  const prefix = digits
    .slice(0, index)
    .reduce((sum, digit, prefixIndex) => sum + digit * places[prefixIndex], 0);
  const place = places[index];
  const lowerMax = places
    .slice(index + 1)
    .reduce((sum, lowerPlace) => sum + lowerPlace * 9, 0);

  return DIGITS.filter((digit) => {
    const rangeMin = prefix + digit * place;
    const rangeMax = rangeMin + lowerMax;

    return rangeMax >= minValue && rangeMin <= maxValue;
  }).map((digit) => ({
    value: digit,
    label: digit,
    textValue: String(digit),
  }));
}

function resolveScaledValueWithDigit(
  currentValue: number,
  places: number[],
  index: number,
  digit: number,
  minValue: number,
  maxValue: number,
): number {
  const digits = getDigits(currentValue, places);
  const prefix = digits
    .slice(0, index)
    .reduce((sum, currentDigit, prefixIndex) => sum + currentDigit * places[prefixIndex], 0);
  const lowerCurrent = digits
    .slice(index + 1)
    .reduce(
      (sum, currentDigit, lowerIndex) =>
        sum + currentDigit * places[index + 1 + lowerIndex],
      0,
    );
  const place = places[index];
  const lowerMax = places
    .slice(index + 1)
    .reduce((sum, lowerPlace) => sum + lowerPlace * 9, 0);
  const rawValue = prefix + digit * place + lowerCurrent;
  const rangeMin = Math.max(minValue, prefix + digit * place);
  const rangeMax = Math.min(maxValue, prefix + digit * place + lowerMax);

  return clamp(rawValue, rangeMin, rangeMax);
}

function formatPreview(mode: 'integer' | 'decimal', value: number): string {
  return mode === 'integer' ? String(Math.round(value)) : value.toFixed(2);
}

function DigitColumn({
  value,
  onValueChange,
  options,
  className,
}: {
  value: number;
  onValueChange: (value: number) => void;
  options: WheelPickerOption<number>[];
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <WheelPickerWrapper>
        <WheelPicker
          value={value}
          options={options}
          onValueChange={onValueChange}
          visibleCount={WHEEL_VISIBLE_COUNT}
          optionItemHeight={WHEEL_ITEM_HEIGHT}
          classNames={wheelClassNames}
        />
      </WheelPickerWrapper>
    </div>
  );
}

export function MeNumberPickerSection({ field }: { field: MeNumberPickerField }) {
  const router = useRouter();
  const config = ME_NUMBER_PICKER_CONFIG[field];
  const profileDraft = useMeFormDraftStore((state) => state.profileDraft);
  const goalDraft = useMeFormDraftStore((state) => state.goalDraft);
  const updateProfileDraft = useMeFormDraftStore((state) => state.updateProfileDraft);
  const updateGoalDraft = useMeFormDraftStore((state) => state.updateGoalDraft);

  const currentValue = useMemo(() => {
    if (field === 'profile-height') {
      return profileDraft?.heightCm ?? null;
    }

    if (field === 'goal-start-weight') {
      return goalDraft?.startWeightKg ?? null;
    }

    return goalDraft?.targetWeightKg ?? null;
  }, [field, goalDraft, profileDraft]);

  const canApply = useMemo(() => {
    if (field === 'profile-height') {
      return profileDraft !== null;
    }

    return goalDraft !== null;
  }, [field, goalDraft, profileDraft]);

  const [draftValue, setDraftValue] = useState<number>(currentValue ?? config.fallbackValue);

  useEffect(() => {
    setDraftValue(currentValue ?? config.fallbackValue);
  }, [config.fallbackValue, currentValue]);

  const normalizedValue =
    config.mode === 'integer'
      ? normalizeInteger(draftValue, config.min, config.max)
      : normalizeDecimal(draftValue, config.min, config.max);
  const places = useMemo(() => getDigitPlaces(config.mode), [config.mode]);
  const labels = useMemo(() => getDigitLabels(config.mode), [config.mode]);
  const minScaled = useMemo(() => toScaledValue(config.mode, config.min), [config.min, config.mode]);
  const maxScaled = useMemo(() => toScaledValue(config.mode, config.max), [config.max, config.mode]);
  const scaledValue = useMemo(
    () => toScaledValue(config.mode, normalizedValue),
    [config.mode, normalizedValue],
  );
  const digits = useMemo(() => getDigits(scaledValue, places), [places, scaledValue]);
  const digitColumns = useMemo(
    () =>
      places.map((_, index) => ({
        label: labels[index],
        value: digits[index],
        options: buildDigitOptions(digits, places, index, minScaled, maxScaled),
        widthClass:
          config.mode === 'integer'
            ? 'w-[5rem]'
            : index < 3
              ? 'w-[3.7rem]'
              : 'w-[3.3rem]',
      })),
    [config.mode, digits, labels, maxScaled, minScaled, places],
  );

  const handleDigitChange = (index: number, nextDigit: number) => {
    const nextScaledValue = resolveScaledValueWithDigit(
      scaledValue,
      places,
      index,
      nextDigit,
      minScaled,
      maxScaled,
    );

    setDraftValue(fromScaledValue(config.mode, nextScaledValue));
  };

  const handleBack = () => {
    router.replace(config.returnTo);
  };

  const handleConfirm = () => {
    if (!canApply) {
      router.replace(config.returnTo);
      return;
    }

    if (field === 'profile-height') {
      updateProfileDraft((draft) => ({
        ...draft,
        heightCm: normalizedValue,
      }));
    } else if (field === 'goal-start-weight') {
      updateGoalDraft((draft) => ({
        ...draft,
        startWeightKg: normalizedValue,
      }));
    } else {
      updateGoalDraft((draft) => ({
        ...draft,
        targetWeightKg: normalizedValue,
      }));
    }

    router.replace(config.returnTo);
  };

  const displayValue = `${formatPreview(config.mode, normalizedValue)} ${config.unit}`;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--app-tab-bar-offset))] w-full max-w-md flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f8fcfd_100%)]">
      <header className="border-b border-slate-100/90 bg-white/88 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="返回"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="text-[16px] font-semibold text-slate-950">{config.title}</p>
            <div className="mt-2 inline-flex items-center rounded-full border border-cyan-100/80 bg-cyan-50/70 px-3 py-1 text-[12px] font-medium text-primary/80">
              {displayValue}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="min-w-[2.75rem] text-[15px] font-semibold text-primary transition hover:text-primary/80"
          >
            完成
          </button>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden px-5 py-10">
        <div className="pointer-events-none absolute left-[-3.5rem] top-[5.5rem] h-40 w-40 rounded-full bg-cyan-100/45 blur-3xl" />
        <div className="pointer-events-none absolute bottom-12 right-[-4rem] h-44 w-44 rounded-full bg-teal-100/35 blur-3xl" />
        {!canApply ? (
          <Alert variant="destructive">
            <AlertDescription>请从资料页或目标页进入选择器。</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex h-full flex-col justify-center">
          <div className="rounded-[34px] border border-cyan-100/80 bg-white/82 px-4 py-7 shadow-[0_24px_48px_-38px_rgba(15,170,183,0.4)] backdrop-blur-xl">
            <div className="flex items-center justify-center gap-2">
                {digitColumns.slice(0, 3).map((column, index) => (
                  <DigitColumn
                    key={`${field}-${column.label}-${index}`}
                    value={column.value}
                    onValueChange={(nextDigit) => handleDigitChange(index, nextDigit)}
                    options={column.options}
                    className={column.widthClass}
                  />
                ))}

                {config.mode === 'decimal' ? (
                  <>
                    <div className="pb-[1px] text-[1.9rem] font-semibold text-slate-300">.</div>
                    {digitColumns.slice(3).map((column, index) => (
                      <DigitColumn
                        key={`${field}-${column.label}-${index + 3}`}
                        value={column.value}
                        onValueChange={(nextDigit) => handleDigitChange(index + 3, nextDigit)}
                        options={column.options}
                        className={column.widthClass}
                      />
                    ))}
                  </>
                ) : null}
            </div>
          </div>

          <div className="mt-6 text-center text-[12px] text-slate-400">
            轻滑数字即可调整
          </div>
        </div>
      </div>
    </div>
  );
}
