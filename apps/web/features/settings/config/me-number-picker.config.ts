export type MeNumberPickerMode = 'integer' | 'decimal';

export const ME_NUMBER_PICKER_FIELDS = [
  'profile-height',
  'goal-start-weight',
  'goal-target-weight',
] as const;

export type MeNumberPickerField = (typeof ME_NUMBER_PICKER_FIELDS)[number];

export type MeNumberPickerConfig = {
  title: string;
  description: string;
  unit: string;
  placeholder: string;
  min: number;
  max: number;
  fallbackValue: number;
  mode: MeNumberPickerMode;
  returnTo: '/me/profile' | '/me/goal';
  allowEmpty: boolean;
};

export const ME_NUMBER_PICKER_CONFIG: Record<
  MeNumberPickerField,
  MeNumberPickerConfig
> = {
  'profile-height': {
    title: '身高',
    description: '选择你的常用净身高，用来计算 BMI 等指标。',
    unit: 'cm',
    placeholder: '选择身高',
    min: 100,
    max: 260,
    fallbackValue: 170,
    mode: 'integer',
    returnTo: '/me/profile',
    allowEmpty: true,
  },
  'goal-start-weight': {
    title: '当前体重',
    description: '按位调整当前体重，保存后会作为趋势起点。',
    unit: 'kg',
    placeholder: '选择当前体重',
    min: 20,
    max: 300,
    fallbackValue: 60,
    mode: 'decimal',
    returnTo: '/me/profile',
    allowEmpty: false,
  },
  'goal-target-weight': {
    title: '目标体重',
    description: '按位调整目标体重，保存后会作为目标参考。',
    unit: 'kg',
    placeholder: '选择目标体重',
    min: 20,
    max: 300,
    fallbackValue: 55,
    mode: 'decimal',
    returnTo: '/me/profile',
    allowEmpty: false,
  },
};

export function isMeNumberPickerField(
  value: string,
): value is MeNumberPickerField {
  return ME_NUMBER_PICKER_FIELDS.includes(value as MeNumberPickerField);
}

export function formatMeNumberPickerValue(
  config: MeNumberPickerConfig,
  value: number | null,
): string {
  if (value === null) {
    return config.placeholder;
  }

  if (config.mode === 'integer') {
    return `${Math.round(value)} ${config.unit}`;
  }

  return `${value.toFixed(2)} ${config.unit}`;
}
