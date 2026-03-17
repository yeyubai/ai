export type AppError = {
  status: number | null;
  code: string;
  message: string;
  displayMessage: string;
  retryable: boolean;
  traceId?: string;
};
