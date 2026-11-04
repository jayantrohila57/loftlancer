import { MarketingPage } from "@modules/www/client/www/components/client.marketing-page.component";
import { StatusBoard } from "@modules/www/client/www/components/client.status-board.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";

export const metadata = pageMetadata({
  title: "Status",
  description:
    "Current checks and incident history for Loftlancer services monitored by Better Stack.",
  path: "/status",
});

/** loftlancer.com/status (#369): Better Stack monitors on our own domain. */
export default function StatusPage() {
  return (
    <MarketingPage
      title="Status"
      description="View Better Stack checks and recent incidents for monitored Loftlancer services. The page refreshes automatically."
    >
      <StatusBoard />
    </MarketingPage>
  );
}
