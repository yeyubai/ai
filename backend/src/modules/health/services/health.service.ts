import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from '../dto/health-response.dto';

@Injectable()
export class HealthService {
  getStatus(): HealthResponseDto {
    return {
      service: 'backend',
      status: 'ok',
      checkedAt: new Date().toISOString(),
    };
  }
}
