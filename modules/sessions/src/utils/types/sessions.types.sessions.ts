import type { z } from "zod"
import type {
  listSessionsDataSchema,
  listSessionsOutputSchema,
} from "../validation/sessions.sessions.list.schema"

export type SessionsData = z.infer<typeof listSessionsDataSchema>
export type Session = SessionsData[number]
export type SessionsOutput = z.infer<typeof listSessionsOutputSchema>
