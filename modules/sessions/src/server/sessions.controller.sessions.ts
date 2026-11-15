import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import { sessionsRoutes } from "../utils/config/sessions.config.sessions"
import { listSessionsOutputSchema } from "../utils/validation/sessions.sessions.list.schema"
import { sessionsService } from "./services/sessions.service.router"

export const sessionsController = {
  list: protectedProcedure
    .route(sessionsRoutes.list)
    .output(listSessionsOutputSchema)
    .handler(async ({ context }) =>
      listSessionsOutputSchema.parse(
        await sessionsService.list({ system: { userId: context.auth.user.id } })
      )
    ),
}
