import { routes as rawRoutes } from "@features/shell/utils/shell.studio-routes.utils";
import type { Route } from "next";

export {
  isReservedOrgSlug,
  isReservedProjectSlug,
  type OrgSection,
  type ProjectSection,
  platformNavHref,
} from "@features/shell/utils/shell.studio-routes.utils";

type Builders = typeof rawRoutes;
type Typed = {
  [K in keyof Builders]: (...args: Parameters<Builders[K]>) => Route;
};

/**
 * THE studio route builder (#300). Every href / router.push goes through
 * this; CI (scripts/check-route-literals.sh) fails on legacy path literals.
 */
export const routes = rawRoutes as unknown as Typed;

// URL-scope hooks live in ./use-route-scope (client-only).
