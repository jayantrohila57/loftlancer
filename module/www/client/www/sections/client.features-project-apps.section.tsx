import { appRegistry } from "@features/authorization/config/authorization.apps";

export function FeaturesProjectAppsSection() {
  return (
    <section id="project-apps" className="mt-16 scroll-mt-28 md:mt-20">
      <div className="border-foreground/15 mb-8 grid gap-4 border-b pb-6 sm:grid-cols-[1fr_0.8fr] sm:items-end">
        <h2 className="text-3xl font-medium tracking-[-0.04em] text-balance md:text-4xl">
          Choose the tools each project needs.
        </h2>
        <p className="text-muted-foreground max-w-lg text-sm leading-6">
          Installable apps keep their own data and permissions inside the
          project where your team works.
        </p>
      </div>
      <ul className="divide-border/70 border-foreground/15 divide-y border-y">
        {appRegistry.map((app) => (
          <li
            key={app.id}
            className="grid gap-2 py-4 sm:grid-cols-[0.7fr_0.5fr_1.3fr] sm:gap-4 md:py-5"
          >
            <h3 className="text-sm font-medium md:text-base">{app.name}</h3>
            <p className="text-muted-foreground text-sm sm:pt-1">
              {app.category}
            </p>
            <p className="text-muted-foreground max-w-xl text-sm leading-6">
              {app.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
