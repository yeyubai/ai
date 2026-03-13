function parseDateParts(value: string): [number, number, number] | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map((item) => Number(item));
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  return [year, month, day];
}

export function isValidDateOnly(value: string): boolean {
  const parts = parseDateParts(value);
  if (!parts) {
    return false;
  }

  const [year, month, day] = parts;
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function parseDateOnly(value: string): Date {
  const parts = parseDateParts(value);
  if (!parts || !isValidDateOnly(value)) {
    throw new RangeError(`Invalid date-only value: ${value}`);
  }

  const [year, month, day] = parts;
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnly(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayInTimezone(timeZone = 'Asia/Shanghai'): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';

  return `${year}-${month}-${day}`;
}

export function shiftDateString(dateString: string, offsetDays: number): string {
  const base = parseDateOnly(dateString);
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return formatDateOnly(base);
}

export function buildDateRange(dateString: string, length: number): string[] {
  return Array.from({ length }, (_, index) =>
    shiftDateString(dateString, -(length - index - 1)),
  );
}
