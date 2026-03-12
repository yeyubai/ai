import { apiClient } from '@/lib/api/client';

export type HealthStatusResponse = {
  code: number;
  message: string;
  data: {
    service: string;
    status: string;
    checkedAt: string;
  };
  traceId?: string;
};

export async function fetchHealthStatus(): Promise<HealthStatusResponse> {
  const response = await apiClient.get<HealthStatusResponse>('/health');
  return response.data;
}
