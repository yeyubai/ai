export class ExportTaskResponseDto {
  taskId!: string;
  status!: 'processing' | 'done';
  downloadUrl?: string | null;
  expiresAt?: string | null;
}
