'use client';

import {
  type DependencyList,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { commonMessages } from '../copy/common-messages';
import type { AppError } from '../errors/app-error';
import { normalizeApiError } from '../errors/normalize-api-error';

type UseAsyncResourceOptions<TData> = {
  enabled?: boolean;
  fallbackMessage?: string;
  onSuccess?: (data: TData) => void;
  onError?: (error: AppError) => void;
};

export type AsyncResourceResult<TData> = {
  data: TData | null;
  error: AppError | null;
  isLoading: boolean;
  reload: () => Promise<void>;
};

export function useAsyncResource<TData>(
  loadResource: () => Promise<TData>,
  deps: DependencyList,
  options: UseAsyncResourceOptions<TData> = {},
): AsyncResourceResult<TData> {
  const {
    enabled = true,
    fallbackMessage = commonMessages.loadFailed,
    onSuccess,
    onError,
  } = options;
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const loadResourceRef = useRef(loadResource);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const fallbackMessageRef = useRef(fallbackMessage);

  useEffect(() => {
    loadResourceRef.current = loadResource;
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

  const execute = useCallback(async () => {
    if (!enabled) {
      return;
    }

    const requestId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const nextData = await loadResourceRef.current();

      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      setData(nextData);
      onSuccessRef.current?.(nextData);
    } catch (nextError) {
      const normalizedError = normalizeApiError(nextError, {
        fallbackDisplayMessage: fallbackMessageRef.current,
      });

      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      setError(normalizedError);
      onErrorRef.current?.(normalizedError);
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    void execute();
  }, [enabled, execute, ...deps]);

  const reload = useCallback(async () => {
    await execute();
  }, [execute]);

  return {
    data,
    error,
    isLoading,
    reload,
  };
}
