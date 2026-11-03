import { Auth5Content, Auth5Frame } from "@features/authentication/core/client";
import { AppForbiddenPage } from "@features/patterns/core/client/patterns.app-route-states";
import type { Metadata } from "next";
import { studioRouteStateLinks } from "@/lib/route-state-links";

export const metadata: Metadata = { title: "Access denied" };

export default function ForbiddenPage() {
  return (
    <Auth5Frame>
      <Auth5Content>
        <AppForbiddenPage links={studioRouteStateLinks} />
      </Auth5Content>
    </Auth5Frame>
  );
}
