export class WeightEntryDto {
  id!: string;
  entryDate!: string;
  measuredAt!: string;
  syncStatus!: 'placeholder_unsynced';
  weightKg!: number;
  bodyFatPct!: number | null;
  note!: string | null;
  source!: 'manual';
  deltaFromPreviousKg!: number | null;
}
