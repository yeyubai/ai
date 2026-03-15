export class UserSettingsResponseDto {
  diaryName!: string;
  theme!: 'aqua-mist' | 'sea-breeze' | 'paper-light';
  exportEnabled!: boolean;
}
