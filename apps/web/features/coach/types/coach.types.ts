export type CoachAnalysisSummary = {
  bodyTypeSummary: string;
  confidenceNote: string;
  highlights: string[];
  risks: string[];
  actionSuggestions: string[];
  disclaimer: string;
};

export type CoachChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};

export type CoachSession = {
  sessionId: string;
  status: 'processing' | 'ready' | 'failed';
  sourceType: 'body_photo';
  analysisSummary: CoachAnalysisSummary;
  messages: CoachChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type CoachLatestSessionResponse = {
  session: CoachSession | null;
};

export type CoachChatReply = {
  sessionId: string;
  message: CoachChatMessage;
};
