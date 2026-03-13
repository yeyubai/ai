import {
  formatDateOnly,
  isValidDateOnly,
  parseDateOnly,
  shiftDateString,
} from 'src/shared/utils/date.utils';

describe('date.utils', () => {
  it('validates calendar dates strictly', () => {
    expect(isValidDateOnly('2026-02-28')).toBe(true);
    expect(isValidDateOnly('2026-02-29')).toBe(false);
    expect(isValidDateOnly('2024-02-29')).toBe(true);
    expect(isValidDateOnly('2026-02-31')).toBe(false);
  });

  it('parses and formats date-only values without day drift', () => {
    const parsed = parseDateOnly('2026-03-13');
    expect(formatDateOnly(parsed)).toBe('2026-03-13');
  });

  it('shifts date strings by UTC day boundaries', () => {
    expect(shiftDateString('2026-03-13', -7)).toBe('2026-03-06');
    expect(shiftDateString('2026-01-01', -1)).toBe('2025-12-31');
  });
});
