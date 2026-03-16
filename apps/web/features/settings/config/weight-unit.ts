import type { WeightGoal } from '../types/settings.types';

const POUNDS_PER_KILOGRAM = 2.2046226218;

export type WeightUnit = WeightGoal['weightUnit'];

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function getWeightUnitLabel(unit: WeightUnit): string {
  return unit;
}

export function convertKgToWeightUnit(
  valueKg: number,
  unit: WeightUnit,
  digits = 2,
): number {
  if (unit === 'kg') {
    return roundTo(valueKg, digits);
  }

  return roundTo(valueKg * POUNDS_PER_KILOGRAM, digits);
}

export function convertWeightUnitToKg(
  value: number,
  unit: WeightUnit,
  digits = 2,
): number {
  if (unit === 'kg') {
    return roundTo(value, digits);
  }

  return roundTo(value / POUNDS_PER_KILOGRAM, digits);
}

export function formatWeightNumberByUnit(
  valueKg: number,
  unit: WeightUnit,
  digits = 2,
): string {
  return convertKgToWeightUnit(valueKg, unit, digits).toFixed(digits);
}

export function formatWeightByUnit(
  valueKg: number | null,
  unit: WeightUnit,
  digits = 2,
): string | null {
  if (valueKg === null) {
    return null;
  }

  return `${formatWeightNumberByUnit(valueKg, unit, digits)} ${getWeightUnitLabel(unit)}`;
}
