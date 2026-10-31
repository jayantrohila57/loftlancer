import { Button } from "@loftlancer/ui/button";
import { docsUrl } from "@loftlancer/ui/platform-urls";

import { MarketingPage } from "@/components/marketing-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "A collaborative workspace for encrypted project configuration and team access.",
  path: "/about",
});

const principles = [
  {
    number: "01",
    title: "Keep the structure visible",
    description:
      "Organizations, teams, projects, and project apps form a hierarchy people can understand and manage.",
  },
  {
    number: "02",
    title: "Put access near the work",
    description:
      "Roles and project grants make it possible to give people access at the level where they need to contribute.",
  },
  {
    number: "03",
    title: "Treat configuration as part of the project",
    description:
      "Environment values live alongside project access and are encrypted at rest, with their values masked in the interface.",
  },
];

export default function AboutPage() {
  const docs = docsUrl();

  return (
    <MarketingPage
      eyebrow="Company / About"
      title="About Loftlancer"
      description="Loftlancer brings project structure, team access, and encrypted configuration into one shared place."
    >
      <section className="grid gap-5 border-foreground/15 border-b pb-10 md:grid-cols-[0.6fr_1.4fr] md:gap-12 md:pb-14">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
          Why Loftlancer exists
        </p>
        <div className="max-w-3xl">
          <p className="text-pretty font-medium text-2xl leading-snug tracking-[-0.04em] md:text-3xl">
            Project work touches people, permissions, environments, and tools.
            Loftlancer gives those pieces a shared home.
          </p>
          <p className="mt-5 max-w-2xl text-muted-foreground leading-7">
            The product is built for teams that want to keep operational context
            close to the projects they work on, with clear ownership and access
            along the way.
          </p>
        </div>
      </section>

      <section className="mt-10 md:mt-14" aria-labelledby="principles-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
              Product principles
            </p>
            <h2
              id="principles-heading"
              className="mt-0! border-0! pb-0! text-3xl! tracking-[-0.05em]! md:text-4xl!"
            >
              How the product is organized
            </h2>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
            03 / PRINCIPLES
          </span>
        </div>
        <ol className="divide-y divide-border/70 border-foreground/15 border-y">
          {principles.map((item) => (
            <li
              key={item.number}
              className="grid gap-2 py-5 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:gap-4 md:py-6"
            >
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                {item.number}
              </span>
              <h3 className="mt-0! font-medium text-base tracking-tight">
                {item.title}
              </h3>
              <p className="max-w-xl text-muted-foreground text-sm leading-6">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 grid gap-5 border-foreground/15 border-t pt-8 sm:grid-cols-[0.6fr_1.4fr] sm:items-center md:mt-14 md:pt-10">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
          Learn and contribute
        </p>
        <div className="flex flex-wrap items-center justify-between gap-5">
          <p className="max-w-2xl text-muted-foreground leading-7">
            Read the product documentation or explore the open source project on
            GitHub.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="outline" render={<a href={docs} />}>
              Documentation
            </Button>
            <Button
              variant="outline"
              render={
                <a
                  href="https://github.com/jayantrohila57/loftlancer"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              GitHub
            </Button>
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
