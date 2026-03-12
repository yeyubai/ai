export const envConfig = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: process.env.DATABASE_URL ?? '',
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY ?? '',
  authMockCode: process.env.AUTH_MOCK_CODE ?? '123456',
  authTokenExpiresInSeconds: Number(process.env.AUTH_TOKEN_EXPIRES_IN_SECONDS ?? 7200),
};
