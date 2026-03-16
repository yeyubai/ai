'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  ME_NUMBER_PICKER_CONFIG,
  formatMeNumberPickerValue,
  type MeNumberPickerField,
} from '../../config/me-number-picker.config';

export function WheelNumberField({
  field,
  value,
}: {
  field: MeNumberPickerField;
  value: number | null;
}) {
  const config = ME_NUMBER_PICKER_CONFIG[field];

  return (
    <Link
      href={`/me/picker/${field}`}
      className="flex min-h-[3.35rem] w-full items-center justify-between gap-3 rounded-[20px] border border-cyan-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,252,252,0.98))] px-4 py-3 text-left shadow-[0_16px_32px_-28px_rgba(15,170,183,0.45)] transition duration-200 hover:border-cyan-200 hover:bg-white"
    >
      <span
        className={`text-[15px] font-semibold tracking-[-0.02em] ${
          value === null ? 'text-slate-400' : 'text-slate-900'
        }`}
      >
        {formatMeNumberPickerValue(config, value)}
      </span>

      <span className="flex items-center gap-1 text-[12px] font-medium text-slate-400">
        选择
        <ChevronRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
