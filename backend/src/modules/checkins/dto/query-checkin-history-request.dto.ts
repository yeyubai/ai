import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { IsDateOnly } from 'src/shared/validation/decorators';

export class QueryCheckinHistoryRequestDto {
  @IsOptional()
  @IsIn(['weight', 'meal', 'activity', 'sleep'], { message: 'INVALID_PARAMS' })
  type?: 'weight' | 'meal' | 'activity' | 'sleep';

  @IsOptional()
  @IsDateOnly({ message: 'INVALID_PARAMS' })
  dateFrom?: string;

  @IsOptional()
  @IsDateOnly({ message: 'INVALID_PARAMS' })
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'INVALID_PARAMS' })
  @Min(1, { message: 'INVALID_PARAMS' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'INVALID_PARAMS' })
  @Min(1, { message: 'INVALID_PARAMS' })
  @Max(100, { message: 'INVALID_PARAMS' })
  pageSize?: number;
}
