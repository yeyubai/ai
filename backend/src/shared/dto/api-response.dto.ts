export type ApiResponse<T> = {
  code: string | number;
  message: string;
  data: T;
  traceId?: string;
};

export type ApiSuccessPayload<T> = {
  __apiSuccess: true;
  code?: string | number;
  message?: string;
  data: T;
};

export function buildApiResponse<T>(payload: {
  data: T;
  message?: string;
  traceId?: string;
  code?: string | number;
}): ApiResponse<T> {
  return {
    code: payload.code ?? 'OK',
    message: payload.message ?? 'success',
    data: payload.data,
    traceId: payload.traceId,
  };
}

export function apiSuccess<T>(
  data: T,
  options?: { code?: string | number; message?: string },
): ApiSuccessPayload<T> {
  return {
    __apiSuccess: true,
    code: options?.code,
    message: options?.message,
    data,
  };
}

export function isApiSuccessPayload<T>(value: unknown): value is ApiSuccessPayload<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__apiSuccess' in value &&
    (value as { __apiSuccess?: unknown }).__apiSuccess === true &&
    'data' in value
  );
}
