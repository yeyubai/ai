export class UserSettingsResponseDto {
  diaryName!: string;
  theme!: 'aqua-mist' | 'sea-breeze' | 'paper-light';
  weightUnit!: 'kg' | 'lb';
  exportEnabled!: boolean;
}
