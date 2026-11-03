import { appRegistry } from "@features/authorization/config/authorization.apps";
import { marketingFeatures } from "@features/marketing/core/client";
import { Badge } from "@loftlancer/ui/badge";

import { MarketingPage } from "@/components/marketing-page";

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
            className="bg-card text-card-foreground rounded-lg border p-5"
          >
            <h2 className="mt-0! text-base font-semibold">{feature.title}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
      <section className="not-prose mt-12" aria-labelledby="project-apps">
        <div>
          <p className="text-muted-foreground text-sm font-medium">
            Project apps
          </p>
          <h2
            id="project-apps"
            className="mt-2 text-xl font-semibold tracking-tight"
          >
            Add the tools a project needs
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
            Project apps are installed per project. They keep their own data and
            permissions inside the project where your team works.
          </p>
        </div>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {appRegistry.map((app) => (
            <li
              key={app.id}
              className="bg-card text-card-foreground rounded-xl border p-5"
            >
              <p className="text-base font-medium">{app.name}</p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {app.description}
              </p>
              <p className="text-muted-foreground mt-4 text-xs">
                {app.category}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="not-prose bg-muted/20 mt-12 rounded-xl border p-5"
        aria-labelledby="access-audit"
      >
        <h2 id="access-audit" className="text-xl font-semibold tracking-tight">
          Access follows the work
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Roles and project access</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Organization roles and project access determine which people can
              view or change each resource.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Activity history</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Important actions can be recorded so teams can review what
              changed.
            </p>
          </div>
        </div>
      </section>

      <section className="not-prose mt-12" aria-labelledby="connections">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="connections" className="text-xl font-semibold tracking-tight">
            Compatible tool connections
          </h2>
          <Badge variant="secondary" size="sm">
            Coming soon
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Compatible tool connections are planned. They are not available as
          product integrations today.
        </p>
      </section>
    </MarketingPage>
  );
}
