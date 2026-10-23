import { AppForbiddenPage } from "@loftlancer/ui/patterns/app-route-states";
import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";
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
