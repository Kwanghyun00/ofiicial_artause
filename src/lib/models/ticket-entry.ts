export interface TicketEntryPayload {
  campaignId: string;
  contactHash: string;
  adSessionId?: string | null;
  fingerprint?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  referralFactor?: number;
  noveltyOverride?: number;
}
