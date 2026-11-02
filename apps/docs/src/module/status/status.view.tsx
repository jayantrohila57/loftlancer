import { MarketingPage } from "@/components/marketing-page";
import { StatusBoard } from "./status.board";

export function StatusView() {
  return (
    <MarketingPage
      title="Status"
      description="Live checks of our monitored services, refreshed every minute."
    >
      <StatusBoard />
    </MarketingPage>
  );
}
