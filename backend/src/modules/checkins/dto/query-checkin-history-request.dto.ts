import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class QueryCheckinHistoryRequestDto {
  @IsOptional()
  @IsIn(['weight', 'meal', 'activity', 'sleep'], { message: 'INVALID_PARAMS' })
  type?: 'weight' | 'meal' | 'activity' | 'sleep';

  @IsOptional()
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'INVALID_PARAMS' })
  dateFrom?: string;

  @IsOptional()
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'INVALID_PARAMS' })
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
