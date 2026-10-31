import { MarketingPage } from "@/components/marketing-page";
import { StatusBoard } from "@/components/status-board";
import { pageMetadata } from "@/lib/seo";

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
      eyebrow="Platform / Status"
      title="Status"
      description="Live checks of our monitored services, refreshed every minute."
    >
      <StatusBoard />
    </MarketingPage>
  );
}
