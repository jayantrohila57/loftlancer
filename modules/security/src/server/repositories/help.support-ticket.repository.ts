import type { UserSupportTicketStatus } from "@packages/drizzle/schema"
import { userSupportTicket } from "@packages/drizzle/schema"
import { and, desc, eq } from "drizzle-orm"
import type { z } from "zod"
import type { supportTicketCreateSchema } from "../../utils/validation/security.help-support-ticket.schema"
import { requireSecurityDb } from "../shared/security.db"

function serializeTicketRow(row: {
  readonly id: string
  readonly category: string
  readonly subject: string
  readonly message: string
  readonly status: string
  readonly createdAt: Date
  readonly updatedAt: Date
}) {
  return {
    id: row.id,
    category: row.category,
    subject: row.subject,
    message: row.message,
    status: row.status as UserSupportTicketStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listUserSupportTickets(userId: string) {
  const rows = await requireSecurityDb()
    .select()
    .from(userSupportTicket)
    .where(eq(userSupportTicket.userId, userId))
    .orderBy(desc(userSupportTicket.createdAt))
  return rows.map(serializeTicketRow)
}

export async function getUserSupportTicket(userId: string, ticketId: string) {
  const [row] = await requireSecurityDb()
    .select()
    .from(userSupportTicket)
    .where(
      and(
        eq(userSupportTicket.userId, userId),
        eq(userSupportTicket.id, ticketId)
      )
    )
    .limit(1)
  return row ? serializeTicketRow(row) : null
}

export async function createUserSupportTicket(
  userId: string,
  input: z.infer<typeof supportTicketCreateSchema>
) {
  const id = crypto.randomUUID()
  const now = new Date()
  await requireSecurityDb().insert(userSupportTicket).values({
    id,
    userId,
    category: input.category,
    subject: input.subject,
    message: input.message,
    status: "open",
    createdAt: now,
    updatedAt: now,
  })
  const created = await getUserSupportTicket(userId, id)
  if (!created) throw new Error("SUPPORT_TICKET_CREATE_FAILED")
  return created
}
