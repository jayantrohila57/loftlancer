import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { OverviewView } from "@/module/overview/overview.view";

export const metadata: Metadata = {
  title: "Overview",
  description: `Your dashboard overview in ${siteConfig.name}.`,
};

export default function StudioOverviewPage() {
  return <OverviewView />;
}
