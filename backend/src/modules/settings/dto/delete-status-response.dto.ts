export class DeleteStatusResponseDto {
  status!: 'pending_cooldown';
  requestedAt!: string;
  effectiveAt!: string;
  canCancel!: boolean;
}
