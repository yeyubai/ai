import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import type { StateStorage } from 'zustand/middleware';

export const AUTH_SESSION_STORAGE_KEY = 'auth-store';

export type StoredSession = {
  token: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  expiresAt: number | null;
  userStatus: string | null;
  userRole: string | null;
};

type LegacyPersistedSession = {
  state?: Partial<StoredSession> | null;
  version?: number;
};

type SessionStorageAdapter = {
  getSession: () => StoredSession | null | Promise<StoredSession | null>;
  saveSession: (session: StoredSession) => void | Promise<void>;
  clearSession: () => void | Promise<void>;
};

function logSecureStorageFailure(action: 'read' | 'write' | 'remove', error: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[session-storage] Native secure storage ${action} failed.`, error);
  }
}

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function isNativeSessionPlatform(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const capacitor = (window as Window & {
    Capacitor?: {
      isNativePlatform?: () => boolean;
    };
  }).Capacitor;

  return capacitor?.isNativePlatform?.() === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeStoredSession(value: unknown): StoredSession | null {
  if (!isRecord(value)) {
    return null;
  }

  const session: StoredSession = {
    token: toNullableString(value.token),
    refreshToken: toNullableString(value.refreshToken),
    expiresIn: toNullableNumber(value.expiresIn),
    expiresAt: toNullableNumber(value.expiresAt),
    userStatus: toNullableString(value.userStatus),
    userRole: toNullableString(value.userRole),
  };

  return isSessionEmpty(session) ? null : session;
}

function parseStoredSession(rawValue: string): StoredSession | null {
  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (isRecord(parsed) && 'state' in parsed) {
      return normalizeStoredSession((parsed as LegacyPersistedSession).state ?? null);
    }

    return normalizeStoredSession(parsed);
  } catch {
    return null;
  }
}

function buildPersistedStatePayload(session: StoredSession): string {
  return JSON.stringify({
    state: session,
    version: 0,
  });
}

function serializeSession(session: StoredSession): string {
  return JSON.stringify(session);
}

export function hasUsableSession(
  token: string | null | undefined,
  expiresAt: number | null | undefined,
): boolean {
  if (!token) {
    return false;
  }

  if (typeof expiresAt !== 'number') {
    return false;
  }

  return expiresAt > Date.now();
}

export function isSessionEmpty(session: StoredSession): boolean {
  return (
    session.token === null &&
    session.refreshToken === null &&
    session.expiresIn === null &&
    session.expiresAt === null &&
    session.userStatus === null &&
    session.userRole === null
  );
}

export const browserSessionStorageAdapter: SessionStorageAdapter = {
  getSession() {
    const storage = getBrowserStorage();
    if (!storage) {
      return null;
    }

    const rawValue = storage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    return parseStoredSession(rawValue);
  },
  saveSession(session) {
    const storage = getBrowserStorage();
    if (!storage) {
      return;
    }

    if (isSessionEmpty(session)) {
      storage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return;
    }

    storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  },
  clearSession() {
    const storage = getBrowserStorage();
    if (!storage) {
      return;
    }

    storage.removeItem(AUTH_SESSION_STORAGE_KEY);
  },
};

export const nativeSessionStorageAdapter: SessionStorageAdapter = {
  async getSession() {
    try {
      const rawValue = await SecureStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (!rawValue) {
        return null;
      }

      return parseStoredSession(rawValue);
    } catch (error) {
      logSecureStorageFailure('read', error);
      return null;
    }
  },
  async saveSession(session) {
    try {
      if (isSessionEmpty(session)) {
        await SecureStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        return;
      }

      await SecureStorage.setItem(AUTH_SESSION_STORAGE_KEY, serializeSession(session));
    } catch (error) {
      logSecureStorageFailure('write', error);
    }
  },
  async clearSession() {
    try {
      await SecureStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    } catch (error) {
      logSecureStorageFailure('remove', error);
    }
  },
};

function getSessionStorageAdapter(): SessionStorageAdapter {
  return isNativeSessionPlatform()
    ? nativeSessionStorageAdapter
    : browserSessionStorageAdapter;
}

export function resolveInitialSessionStatus(): 'idle' | 'loading' {
  return isNativeSessionPlatform() ? 'loading' : 'idle';
}

export async function getStoredSession(): Promise<StoredSession | null> {
  return getSessionStorageAdapter().getSession();
}

export const authSessionStateStorage: StateStorage = {
  async getItem(name) {
    if (name !== AUTH_SESSION_STORAGE_KEY) {
      const storage = getBrowserStorage();
      if (!storage) {
        return null;
      }

      return storage.getItem(name);
    }

    const session = await getStoredSession();
    return session ? buildPersistedStatePayload(session) : null;
  },
  async setItem(name, value) {
    if (name !== AUTH_SESSION_STORAGE_KEY) {
      const storage = getBrowserStorage();
      if (!storage) {
        return;
      }

      storage.setItem(name, value);
      return;
    }

    const session = parseStoredSession(value);
    if (!session) {
      await getSessionStorageAdapter().clearSession();
      return;
    }

    await getSessionStorageAdapter().saveSession(session);
  },
  async removeItem(name) {
    if (name !== AUTH_SESSION_STORAGE_KEY) {
      const storage = getBrowserStorage();
      if (!storage) {
        return;
      }

      storage.removeItem(name);
      return;
    }

    await getSessionStorageAdapter().clearSession();
  },
};
