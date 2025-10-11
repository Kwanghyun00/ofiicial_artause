export interface TicketEntryPayload {
  campaignId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  answers?: Record<string, unknown>;
  consentMarketing: boolean;
}