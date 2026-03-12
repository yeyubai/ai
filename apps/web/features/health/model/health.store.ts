'use client';

import { create } from 'zustand';

export type HealthState = {
  service: string;
  status: string;
  checkedAt: string;
  setStatus: (payload: Pick<HealthState, 'service' | 'status' | 'checkedAt'>) => void;
};

export const useHealthStore = create<HealthState>((set) => ({
  service: 'web',
  status: 'unknown',
  checkedAt: '',
  setStatus: (payload) => set(payload),
}));
