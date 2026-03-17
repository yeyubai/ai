const POUNDS_PER_KILOGRAM = 2.2046226218;

export type WeightUnit = 'kg' | 'lb';

function roundWeight(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function convertWeightValueToKg(
  value: number,
  unit: WeightUnit,
  digits = 2,
): number {
  if (unit === 'kg') {
    return roundWeight(value, digits);
  }

  return roundWeight(value / POUNDS_PER_KILOGRAM, digits);
}
