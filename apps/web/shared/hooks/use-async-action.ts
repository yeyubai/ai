'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { commonMessages } from '../copy/common-messages';
import type { AppError } from '../errors/app-error';
import { normalizeApiError } from '../errors/normalize-api-error';

type UseAsyncActionOptions<TPayload, TResult> = {
  fallbackMessage?: string;
  onSuccess?: (result: TResult, payload: TPayload) => void;
  onError?: (error: AppError, payload: TPayload) => void;
};

export type AsyncActionResult<TPayload, TResult> = {
  run: (payload: TPayload) => Promise<TResult | null>;
  error: AppError | null;
  isPending: boolean;
  isSuccess: boolean;
  reset: () => void;
};

export function useAsyncAction<TPayload, TResult>(
  executeAction: (payload: TPayload) => Promise<TResult>,
  options: UseAsyncActionOptions<TPayload, TResult> = {},
): AsyncActionResult<TPayload, TResult> {
  const {
    fallbackMessage = commonMessages.saveFailed,
    onSuccess,
    onError,
  } = options;
  const [error, setError] = useState<AppError | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const mountedRef = useRef(true);
  const executeActionRef = useRef(executeAction);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const fallbackMessageRef = useRef(fallbackMessage);

  useEffect(() => {
    executeActionRef.current = executeAction;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    fallbackMessageRef.current = fallbackMessage;
  });

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(async (payload: TPayload) => {
    setIsPending(true);
    setIsSuccess(false);
    setError(null);

    try {
      const result = await executeActionRef.current(payload);

      if (!mountedRef.current) {
        return null;
      }

      setIsSuccess(true);
      onSuccessRef.current?.(result, payload);
      return result;
    } catch (nextError) {
      const normalizedError = normalizeApiError(nextError, {
        fallbackDisplayMessage: fallbackMessageRef.current,
      });

      if (!mountedRef.current) {
        return null;
      }

      setError(normalizedError);
      onErrorRef.current?.(normalizedError, payload);
      return null;
    } finally {
      if (mountedRef.current) {
        setIsPending(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsPending(false);
    setIsSuccess(false);
  }, []);

  return {
    run,
    error,
    isPending,
    isSuccess,
    reset,
  };
}
