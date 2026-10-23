import { DEFAULT_STUDIO_URL } from "@loftlancer/env/platform";
import type { AppRouteStateLinks } from "@loftlancer/ui/patterns/app-route-states";
import { routes } from "@/utils/navigation";

const origin = (
  process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL
).replace(/\/$/, "");

export const studioRouteStateLinks: AppRouteStateLinks = {
  homeHref: routes.organizationsDirectory(),
  homeLabel: "Open organizations",
  dashboardHref: routes.overview(),
};

export const studioPublicOrigin = origin;
