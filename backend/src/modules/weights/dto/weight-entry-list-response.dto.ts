import { WeightEntryDto } from './weight-entry.dto';

export class WeightEntryListResponseDto {
  groups!: Array<{
    date: string;
    entries: WeightEntryDto[];
  }>;
  nextCursor!: string | null;
}
