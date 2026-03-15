import { CoachAnalysisSummaryDto } from './coach-analysis-summary.dto';
import { CoachChatMessageDto } from './coach-chat-message.dto';

export class CoachAnalysisSessionResponseDto {
  sessionId!: string;
  status!: 'processing' | 'ready' | 'failed';
  sourceType!: 'body_photo';
  analysisSummary!: CoachAnalysisSummaryDto;
  messages!: CoachChatMessageDto[];
  createdAt!: string;
  updatedAt!: string;
}
