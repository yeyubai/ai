function parseCorsOrigins(raw: string | undefined): string[] {
  if (!raw) {
    return ['http://localhost:3000'];
  }

  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins.length > 0 ? origins : ['http://localhost:3000'];
}

export const envConfig = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: process.env.DATABASE_URL ?? '',
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY ?? '',
  authMockCode: process.env.AUTH_MOCK_CODE ?? '123456',
  authTokenExpiresInSeconds: Number(process.env.AUTH_TOKEN_EXPIRES_IN_SECONDS ?? 7200),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
};