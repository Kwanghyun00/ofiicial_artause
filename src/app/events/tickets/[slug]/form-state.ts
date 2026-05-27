export interface TicketEntryFormState {
  status: "idle" | "success" | "error" | "duplicate";
  message?: string;
}

export const ticketEntryInitialState: TicketEntryFormState = {
  status: "idle",
};
