import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

type ErrorPayload = {
  code: string | number;
  message: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request & { id?: string }>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = this.resolveErrorPayload(exception, status);

    response.status(status).json({
      code: payload.code,
      message: payload.message,
      data: null,
      traceId: request.id,
    });
  }

  private resolveErrorPayload(
    exception: unknown,
    status: HttpStatus,
  ): ErrorPayload {
    if (!(exception instanceof HttpException)) {
      return { code: 'INTERNAL_ERROR', message: 'Internal server error' };
    }

    const errorResponse = exception.getResponse();

    if (typeof errorResponse === 'string') {
      return { code: this.mapCodeByStatus(status), message: errorResponse };
    }

    if (this.isObjectResponse(errorResponse)) {
      const rawMessage = errorResponse.message;
      const message = Array.isArray(rawMessage)
        ? String(rawMessage[0] ?? this.defaultMessageByStatus(status))
        : String(rawMessage ?? this.defaultMessageByStatus(status));

      const code =
        typeof errorResponse.code === 'string' ||
        typeof errorResponse.code === 'number'
          ? errorResponse.code
          : this.mapCodeByStatus(status);

      return { code, message };
    }

    return {
      code: this.mapCodeByStatus(status),
      message: this.defaultMessageByStatus(status),
    };
  }

  private isObjectResponse(
    value: unknown,
  ): value is { code?: unknown; message?: unknown } {
    return typeof value === 'object' && value !== null;
  }

  private mapCodeByStatus(status: HttpStatus): string {
    if (status === HttpStatus.BAD_REQUEST) {
      return 'INVALID_PARAMS';
    }

    if (status === HttpStatus.UNAUTHORIZED) {
      return 'AUTH_EXPIRED';
    }

    return 'INTERNAL_ERROR';
  }

  private defaultMessageByStatus(status: HttpStatus): string {
    if (status === HttpStatus.BAD_REQUEST) {
      return 'INVALID_PARAMS';
    }

    if (status === HttpStatus.UNAUTHORIZED) {
      return 'AUTH_EXPIRED';
    }

    return 'Internal server error';
  }
}
