export class WeeklyReportResponseDto {
  summary!: {
    title: string;
    body: string;
  };
  lockedSections!: string[];
  membershipPrompt!: {
    show: boolean;
    reason: string;
  };
}
