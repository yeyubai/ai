export type CheckinType = 'weight' | 'meal' | 'activity' | 'sleep';

export class CheckinCreatedResponseDto {
  checkinId!: string;
  checkinType!: CheckinType;
  checkinDate!: string;
  isBackfill!: boolean;
  createdAt!: Date;
}
