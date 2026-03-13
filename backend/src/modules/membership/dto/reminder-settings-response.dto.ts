export class ReminderSettingsResponseDto {
  dailyMissionReminderTimes!: string[];
  reviewReminderTime!: string;
  strongReminderEnabled!: boolean;
  quietHours!: {
    start: string;
    end: string;
  };
  timezone!: string;
  updatedAt!: string;
}
