import { toORPCRouter } from "@orpc/trpc";
import { studioRouter } from "../routers/studio";

/**
 * oRPC surface over the Studio tRPC router.
 * Domain procedures (teams/organizations) removed in product reset.
 */
export const studioORPCRouter = {
  ...toORPCRouter(studioRouter),
};

export type StudioORPCRouter = typeof studioORPCRouter;
