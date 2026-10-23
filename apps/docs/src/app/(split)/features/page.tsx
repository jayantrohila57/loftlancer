import { Badge } from "@loftlancer/ui/badge";
import { marketingFeatures } from "@loftlancer/ui/marketing";

import { MarketingPage } from "@/components/marketing-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Features",
  description:
    "Encryption, organizations, projects, project apps and activity in Loftlancer.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <MarketingPage
      title="Features"
      description="Manage organizations, projects, installed project apps, and activity from one dashboard."
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
        Your organization roles and project access determine what each person
        can see and change. Important actions can be recorded for your team to
        review.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <h2 className="mt-0!">Connect your tools</h2>
        <Badge variant="secondary" size="sm">
          Coming soon
        </Badge>
      </div>
      <p>
        Connect compatible tools and workflows to Loftlancer with the same
        access controls as your dashboard. This integration is coming soon.
      </p>
    </MarketingPage>
  );
}
