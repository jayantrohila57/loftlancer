import { Badge } from "@loftlancer/ui/badge";
import { marketingFeatures } from "@loftlancer/ui/marketing";

import { MarketingPage } from "@/components/marketing-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Features",
  description:
    "Encryption, organizations, projects, apps and activity in Loftlancer.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <MarketingPage
      title="Features"
      description="Everything in the product today — grounded in how the studio app actually behaves."
    >
      <ul className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {marketingFeatures.map((feature) => (
          <li
            key={feature.title}
            className="rounded-lg border bg-card p-5 text-card-foreground"
          >
            <h2 className="mt-0! font-semibold text-base">{feature.title}</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
      <h2 className="mt-12">Permissions and audit</h2>
      <p>
        Every sensitive operation maps to a canonical action in{" "}
        <code>@loftlancer/actions</code>. The studio API checks{" "}
        <code>requireAction</code> using organization role, optional project
        grants, and action blocks. When <code>ACTIONS_AUDIT_ENABLED</code> is
        on, successful and denied operations can be recorded for the timeline.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <h2 className="mt-0!">MCP for agents</h2>
        <Badge variant="secondary" size="sm">
          Coming soon
        </Badge>
      </div>
      <p>
        An MCP tool layer (package <code>@loftlancer/mcp</code>) maps the same
        actions to tools behind OAuth scopes, but no MCP endpoint is deployed on
        loftlancer.com today.
      </p>
    </MarketingPage>
  );
}
