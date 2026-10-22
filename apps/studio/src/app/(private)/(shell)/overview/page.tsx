import type { Metadata } from "next";
import DashboardSection from "@/components/section-dashboard";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Overview",
  description: `Your workspace overview in ${siteConfig.name}.`,
};

export default function StudioOverviewPage() {
  return (
    <DashboardSection
      title="Overview"
      description="Your workspace overview."
      back={false}
    >
      <div />
    </DashboardSection>
  );
}
