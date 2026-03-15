export class CoachChatMessageDto {
  id!: string;
  role!: 'user' | 'assistant' | 'system';
  content!: string;
  createdAt!: string;
}
