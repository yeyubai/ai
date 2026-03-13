export class CheckinFeedItemDto {
  checkinId!: string;
  type!: 'weight' | 'meal' | 'activity' | 'sleep';
  checkinDate!: string;
  displayValue!: string;
  isBackfill!: boolean;
  createdAt!: string;
}

export class TodayCheckinsResponseDto {
  items!: CheckinFeedItemDto[];
}

export class CheckinHistoryResponseDto {
  list!: CheckinFeedItemDto[];
  total!: number;
}
