import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { envConfig } from '../config/env.config';

function isRetryableInitError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const errorCode =
    'errorCode' in error && typeof error.errorCode === 'string' ? error.errorCode : '';
  const message = error.message.toLowerCase();

  return (
    errorCode === 'P1001' ||
    errorCode === 'P1002' ||
    message.includes("can't reach database server") ||
    message.includes('timed out') ||
    message.includes('econnrefused') ||
    message.includes('eai_again') ||
    message.includes('enotfound')
  );
}

async function wait(delayMs: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    const maxRetries = Math.max(1, envConfig.dbConnectMaxRetries);
    const retryDelayMs = Math.max(0, envConfig.dbConnectRetryDelayMs);

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        await this.$connect();

        if (attempt > 1) {
          this.logger.log(`Connected to database on attempt ${attempt}/${maxRetries}.`);
        }

        return;
      } catch (error) {
        if (!isRetryableInitError(error) || attempt === maxRetries) {
          throw error;
        }

        this.logger.warn(
          `Database not ready yet (attempt ${attempt}/${maxRetries}). Retrying in ${retryDelayMs}ms.`,
        );
        await wait(retryDelayMs);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
