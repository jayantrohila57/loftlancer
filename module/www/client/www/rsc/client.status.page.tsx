import { MarketingPage } from "@modules/www/client/www/components/client.marketing-page.component";
import { StatusBoard } from "@modules/www/client/www/components/client.status-board.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";

export const metadata = pageMetadata({
  title: "Status",
  description:
    "Live status and uptime for Loftlancer, documentation, dashboard and sign-in services, from our Better Stack monitors.",
  path: "/status",
});

/** loftlancer.com/status (#369): Better Stack monitors on our own domain. */
export default function StatusPage() {
  return (
    <MarketingPage
      title="Status"
      description="Live checks of our monitored services, refreshed every minute."
    >
      <StatusBoard />
    </MarketingPage>
  );
}
