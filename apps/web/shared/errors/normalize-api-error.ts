import { isApiError } from '@/lib/api/types';
import { commonMessages } from '../copy/common-messages';
import type { AppError } from './app-error';

type NormalizeApiErrorOptions = {
  fallbackDisplayMessage?: string;
};

function isNetworkLikeMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('network') || normalized.includes('timeout');
}

export function normalizeApiError(
  error: unknown,
  options: NormalizeApiErrorOptions = {},
): AppError {
  const fallbackDisplayMessage =
    options.fallbackDisplayMessage ?? commonMessages.unexpectedError;

  if (isApiError(error)) {
    const code = String(error.code);
    const message = error.message.trim();
    const isAuthExpired = error.status === 401 || code === 'AUTH_EXPIRED';
    const isNetworkError = isNetworkLikeMessage(message);
    const isGenericServerError = code === 'INTERNAL_ERROR' || error.status >= 500;

    return {
      status: error.status,
      code,
      message,
      displayMessage: isAuthExpired
        ? commonMessages.sessionExpired
        : isNetworkError
          ? commonMessages.networkError
          : message && !isGenericServerError
            ? message
            : fallbackDisplayMessage,
      retryable: isAuthExpired || isNetworkError || error.status >= 500,
      traceId: error.traceId,
    };
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    const isNetworkError = isNetworkLikeMessage(message);

    return {
      status: null,
      code: 'UNKNOWN_ERROR',
      message: message || commonMessages.unexpectedError,
      displayMessage: isNetworkError
        ? commonMessages.networkError
        : fallbackDisplayMessage,
      retryable: true,
    };
  }

  return {
    status: null,
    code: 'UNKNOWN_ERROR',
    message: commonMessages.unexpectedError,
    displayMessage: fallbackDisplayMessage,
    retryable: true,
  };
}
