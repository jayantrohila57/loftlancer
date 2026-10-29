import { pageMetadata } from "@/lib/seo";
import { StatusView } from "@/module/status/status.view";

export const metadata = pageMetadata({
  title: "Status",
  description:
    "Live status and uptime for Loftlancer, documentation, dashboard and sign-in services, from our Better Stack monitors.",
  path: "/status",
});

/** loftlancer.com/status (#369): Better Stack monitors on our own domain. */
export default function StatusPage() {
  return <StatusView />;
}
