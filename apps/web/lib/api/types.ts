export type ApiResponse<T> = {
  code: string | number;
  message: string;
  data: T;
  traceId?: string;
};

export type ApiError = {
  status: number;
  code: string | number;
  message: string;
  traceId?: string;
};

export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ApiError>;
  const isStatusNumber = typeof candidate.status === 'number';
  const isCodeValid =
    typeof candidate.code === 'string' || typeof candidate.code === 'number';
  const isMessageString = typeof candidate.message === 'string';

  return isStatusNumber && isCodeValid && isMessageString;
}
