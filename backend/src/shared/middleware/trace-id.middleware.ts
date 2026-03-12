import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';

type TraceIdRequest = {
  header(name: string): string | undefined;
  id?: string;
};

type TraceIdResponse = {
  setHeader(name: string, value: string): void;
};

type TraceIdNext = () => void;

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(
    request: TraceIdRequest,
    response: TraceIdResponse,
    next: TraceIdNext,
  ): void {
    const incomingTraceId = request.header('x-trace-id');
    const traceId =
      typeof incomingTraceId === 'string' && incomingTraceId.trim().length > 0
        ? incomingTraceId.trim()
        : randomUUID();

    request.id = traceId;
    response.setHeader('x-trace-id', traceId);
    next();
  }
}
