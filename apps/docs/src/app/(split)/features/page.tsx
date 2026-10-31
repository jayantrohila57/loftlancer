import { appRegistry } from "@loftlancer/actions/apps";
import { marketingFeatures, ProductPreview } from "@loftlancer/ui/marketing";
import Image from "next/image";

import { MarketingPage } from "@/components/marketing-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Features",
  description:
    "Encryption, organizations, projects, project apps and activity in Loftlancer.",
  path: "/features",
});

function PageIndex() {
  return (
    <nav
      aria-label="On this page"
      className="border-foreground/15 border-t pt-4"
    >
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
        On this page
      </p>
      <ul className="mt-3 grid gap-1">
        {[
          ["Capabilities", "#capabilities"],
          ["Project apps", "#project-apps"],
          ["Access", "#access"],
        ].map(([label, href]) => (
          <li key={href}>
            <a
              href={href}
              className="text-muted-foreground text-sm underline decoration-transparent underline-offset-4 transition-colors hover:text-foreground hover:decoration-border"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function FeaturesPage() {
  return (
    <MarketingPage
      eyebrow="Product / Capabilities"
      title="People, projects, access."
      description="Organize teams and project apps, set access by role, and manage encrypted configuration from a shared workspace."
      aside={<PageIndex />}
    >
      <section id="capabilities" className="scroll-mt-28">
        <div className="mb-8 grid gap-4 border-foreground/15 border-b pb-6 sm:grid-cols-[1fr_0.8fr] sm:items-end">
          <div>
            <p className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
              01 / Workspace capabilities
            </p>
            <h2 className="mt-0! border-0! pb-0! text-3xl! tracking-[-0.05em]! md:text-4xl!">
              Built around the way teams organize work.
            </h2>
          </div>
          <p className="max-w-lg text-muted-foreground text-sm leading-6">
            Each resource has a clear place in the workspace, so people can see
            how projects, access, and configuration relate.
          </p>
        </div>
        <ul className="divide-y divide-border/70 border-foreground/15 border-y">
          {marketingFeatures.map((feature, index) => (
            <li
              key={feature.title}
              className="grid gap-2 py-4 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:gap-4 md:py-5"
            >
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-0! font-medium text-sm md:text-base">
                {feature.title}
              </h3>
              <p className="max-w-xl text-muted-foreground text-sm leading-6">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="project-apps" className="mt-16 scroll-mt-28 md:mt-20">
        <div className="mb-8 grid gap-4 border-foreground/15 border-b pb-6 sm:grid-cols-[1fr_0.8fr] sm:items-end">
          <div>
            <p className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
              02 / Project apps
            </p>
            <h2 className="mt-0! border-0! pb-0! text-3xl! tracking-[-0.05em]! md:text-4xl!">
              Choose the tools each project needs.
            </h2>
          </div>
          <p className="max-w-lg text-muted-foreground text-sm leading-6">
            Installable apps keep their own data and permissions inside the
            project where your team works.
          </p>
        </div>
        <ul className="divide-y divide-border/70 border-foreground/15 border-y">
          {appRegistry.map((app, index) => (
            <li
              key={app.id}
              className="grid gap-2 py-4 sm:grid-cols-[3rem_0.7fr_0.5fr_1.3fr] sm:gap-4 md:py-5"
            >
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-0! font-medium text-sm md:text-base">
                {app.name}
              </h3>
              <p className="text-muted-foreground text-xs sm:pt-1">
                {app.category}
              </p>
              <p className="max-w-xl text-muted-foreground text-sm leading-6">
                {app.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="access" className="mt-16 scroll-mt-28 md:mt-20">
        <div className="grid gap-8 border-foreground/15 border-t pt-8 md:grid-cols-[0.78fr_1.22fr] md:gap-12">
          <div>
            <p className="mb-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
              03 / People and access
            </p>
            <h2 className="mt-0! border-0! pb-0! text-3xl! tracking-[-0.05em]! md:text-4xl!">
              Give every person access for their work.
            </h2>
            <p className="mt-4 max-w-lg text-muted-foreground leading-7">
              Organization roles set the baseline. Team membership and
              per-project grants extend access where a project needs it.
              Activity history helps teams review important changes.
            </p>
          </div>
          <ProductPreview
            label="Loftlancer Studio / Access settings"
            note="Organization roles and project permissions"
          >
            <Image
              alt="Loftlancer Studio access settings showing organization roles and project permissions."
              className="h-auto w-full"
              height={1108}
              sizes="(max-width: 767px) calc(100vw - 2rem), 700px"
              src="/studio-access.jpg"
              width={2010}
            />
          </ProductPreview>
        </div>
      </section>
    </MarketingPage>
  );
}
