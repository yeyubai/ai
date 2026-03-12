import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1',
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message ?? error?.message ?? 'Request failed';
    return Promise.reject({
      code: error?.response?.status ?? 500,
      message,
      traceId: error?.response?.data?.traceId,
    });
  },
);
