export class ReminderReceiptsResponseDto {
  list!: Array<{
    reminderType: string;
    scheduledAt: string;
    sentAt: string;
    status: 'sent';
    openAt: string;
  }>;
  total!: number;
}
