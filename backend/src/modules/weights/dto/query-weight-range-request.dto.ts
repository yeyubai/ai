import { IsIn, IsOptional } from 'class-validator';

export class QueryWeightRangeRequestDto {
  @IsOptional()
  @IsIn(['7d', '30d', '90d', 'all'])
  range?: '7d' | '30d' | '90d' | 'all';
}
