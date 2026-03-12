export type ApiResponse<T> = {
  code: string | number;
  message: string;
  data: T;
  traceId?: string;
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
