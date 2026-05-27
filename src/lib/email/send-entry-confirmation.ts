"use server"

import {
  sendEntryConfirmation,
  type EntryConfirmationData,
} from "./templates/entry-confirmation"

export type { EntryConfirmationData }
export { sendEntryConfirmation }
