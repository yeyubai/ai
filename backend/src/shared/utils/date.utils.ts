export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000+08:00`);
}

export function formatDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function getTodayInTimezone(timeZone = 'Asia/Shanghai'): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
}

export function shiftDateString(dateString: string, offsetDays: number): string {
  const base = parseDateOnly(dateString);
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return formatDateOnly(base);
}

export function buildDateRange(dateString: string, length: number): string[] {
  return Array.from({ length }, (_, index) => shiftDateString(dateString, -(length - index - 1)));
}
