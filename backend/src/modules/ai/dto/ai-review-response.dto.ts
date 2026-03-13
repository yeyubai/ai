import { AiPayloadSource } from './ai-plan-response.dto';

export class AiReviewResponseDto {
  reviewId!: string;
  date!: string;
  score!: number;
  highlights!: string[];
  gaps!: string[];
  tomorrowFocus!: string[];
  riskFlags!: string[];
  summaryText!: string;
  source!: AiPayloadSource;
}
