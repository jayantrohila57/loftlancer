import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import type { z } from "zod"
import type { supportTicketCreateSchema } from "../../utils/validation/security.help-support-ticket.schema"
import {
  createUserSupportTicket,
  getUserSupportTicket,
  listUserSupportTickets,
} from "../repositories/help.support-ticket.repository"
import { sendSupportTicketEmails } from "../shared/help.support-ticket.email"

export const helpSupportTicketService = {
  async list(userId: string) {
    try {
      const data = await listUserSupportTickets(userId)
      return createSuccess(data, "Support tickets loaded.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "help",
        outcome: "error",
        errorCode: "SUPPORT_TICKETS_UNAVAILABLE",
      })
      return createError("Could not load support tickets.", {
        code: "SUPPORT_TICKETS_UNAVAILABLE",
      })
    }
  },
  async get(userId: string, ticketId: string) {
    try {
      const data = await getUserSupportTicket(userId, ticketId)
      if (!data) {
        return createError("Support ticket not found.", {
          code: "NOT_FOUND",
        })
      }
      return createSuccess(data, "Support ticket loaded.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "help",
        outcome: "error",
        errorCode: "SUPPORT_TICKETS_UNAVAILABLE",
      })
      return createError("Could not load the support ticket.", {
        code: "SUPPORT_TICKETS_UNAVAILABLE",
      })
    }
  },
  async create(
    userId: string,
    userEmail: string,
    input: z.infer<typeof supportTicketCreateSchema>
  ) {
    try {
      const data = await createUserSupportTicket(userId, input)
      await sendSupportTicketEmails({
        userId,
        userEmail,
        ticketId: data.id,
        category: data.category,
        subject: data.subject,
        message: data.message,
      })
      return createSuccess(data, "Support ticket created.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "help",
        outcome: "error",
        errorCode: "SUPPORT_TICKET_CREATE_FAILED",
      })
      return createError("Could not create the support ticket.", {
        code: "SUPPORT_TICKET_CREATE_FAILED",
      })
    }
  },
}
