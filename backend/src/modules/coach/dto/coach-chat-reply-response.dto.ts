import { CoachChatMessageDto } from './coach-chat-message.dto';

export class CoachChatReplyResponseDto {
  sessionId!: string;
  message!: CoachChatMessageDto;
}
