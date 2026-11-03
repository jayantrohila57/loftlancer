import { publicProcedure, router } from "../index";
import { supportRouter } from "./support";

/** Router mounted at `apps/support` `/api/trpc`. */
export const supportAppRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  support: supportRouter,
});

export type SupportAppRouter = typeof supportAppRouter;
