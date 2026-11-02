import { toORPCRouter } from "@orpc/trpc";
import { studioRouter } from "../routers/studio";
import { teamsProcedures } from "./procedures/teams";

/**
 * Parallel oRPC surface over the existing Studio router. Module-owned
 * operations are extracted behind the tRPC procedures first, which preserves
 * authorization and response parity while clients move protocol by protocol.
 */
export const studioORPCRouter = {
  ...toORPCRouter(studioRouter),
  teams: teamsProcedures,
};

export type StudioORPCRouter = typeof studioORPCRouter;
