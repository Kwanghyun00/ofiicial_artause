export interface TicketEntryFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export const ticketEntryInitialState: TicketEntryFormState = {
  status: "idle",
};
