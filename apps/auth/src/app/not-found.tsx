import { Auth5Panel } from "@features/authentication/core/client";
import { AppNotFoundPage } from "@features/patterns/core/client/patterns.app-route-states";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Not found · Loftlancer" },
};

const links = { homeHref: "/settings" };

export default function NotFound() {
  return (
    <Auth5Panel showTerms={false}>
      <AppNotFoundPage links={links} />
    </Auth5Panel>
  );
}
