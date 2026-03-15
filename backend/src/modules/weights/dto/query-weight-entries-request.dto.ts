import { IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryWeightEntriesRequestDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
