import { z } from "zod"
import { helpSupportTicketRoutes } from "../utils/config/security.help-support-ticket.routes"
import {
  supportTicketCreateResponseSchema,
  supportTicketCreateSchema,
  supportTicketDetailResponseSchema,
  supportTicketListResponseSchema,
} from "../utils/validation/security.help-support-ticket.schema"
import { helpSupportTicketService } from "./services/help.support-ticket.service"
import { protectedProcedure } from "./shared/security.procedure"

export const helpSupportTicketController = {
  list: protectedProcedure
    .route(helpSupportTicketRoutes.list)
    .output(supportTicketListResponseSchema)
    .handler(async ({ context }) =>
      supportTicketListResponseSchema.parse(
        await helpSupportTicketService.list(context.auth.user.id)
      )
    ),
  get: protectedProcedure
    .route(helpSupportTicketRoutes.get)
    .input(z.object({ ticketId: z.string().min(1) }).strict())
    .output(supportTicketDetailResponseSchema)
    .handler(async ({ context, input }) =>
      supportTicketDetailResponseSchema.parse(
        await helpSupportTicketService.get(context.auth.user.id, input.ticketId)
      )
    ),
  create: protectedProcedure
    .route(helpSupportTicketRoutes.create)
    .input(z.object({ payload: supportTicketCreateSchema }).strict())
    .output(supportTicketCreateResponseSchema)
    .handler(async ({ context, input }) =>
      supportTicketCreateResponseSchema.parse(
        await helpSupportTicketService.create(
          context.auth.user.id,
          context.auth.user.email,
          input.payload
        )
      )
    ),
}
