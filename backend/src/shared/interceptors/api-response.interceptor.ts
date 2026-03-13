import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  buildApiResponse,
  isApiSuccessPayload,
} from '../dto/api-response.dto';

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { id?: string }>();
    const traceId = request.id;

    return next.handle().pipe(
      map((data) => {
        if (isApiSuccessPayload(data)) {
          return buildApiResponse({
            code: data.code,
            message: data.message,
            data: data.data,
            traceId,
          });
        }

        return buildApiResponse({ data, traceId });
      }),
    );
  }
}
