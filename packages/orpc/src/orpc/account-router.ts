import { toORPCRouter } from "@orpc/trpc";
import { accountAppRouter } from "../routers/account-app";

/** Account settings keeps the legacy implementation until each module moves. */
export const accountORPCRouter = toORPCRouter(accountAppRouter);
export type AccountORPCRouter = typeof accountORPCRouter;
