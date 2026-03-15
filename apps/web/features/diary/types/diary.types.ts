export type DiaryEntry = {
  id: string;
  contentHtml: string;
  plainText: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
};

export type DiaryEntrySummary = {
  id: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
};

export type DiaryEntryPayload = {
  contentHtml: string;
  plainText: string;
};
