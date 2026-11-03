import { toORPCRouter } from "@orpc/trpc";
import { studioRouter } from "../routers/studio";

/** Parallel oRPC surface over the existing Studio router (transport-only). */
export const studioORPCRouter = toORPCRouter(studioRouter);

export type StudioORPCRouter = typeof studioORPCRouter;
