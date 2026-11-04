import { marketingFeatures } from "@features/marketing/core/client";

export function FeaturesCapabilitiesSection() {
  return (
    <section id="capabilities" className="scroll-mt-28">
      <div className="border-foreground/15 mb-8 grid gap-4 border-b pb-6 sm:grid-cols-[1fr_0.8fr] sm:items-end">
        <h2 className="text-3xl font-medium tracking-[-0.04em] text-balance md:text-4xl">
          Built around the way teams organize work.
        </h2>
        <p className="text-muted-foreground max-w-lg text-sm leading-6">
          Each resource has a clear place in the workspace, so people can see
          how projects, access, and configuration relate.
        </p>
      </div>
      <ul className="divide-border/70 border-foreground/15 divide-y border-y">
        {marketingFeatures.map((feature) => (
          <li
            key={feature.title}
            className="grid gap-2 py-4 sm:grid-cols-[0.8fr_1.2fr] sm:gap-4 md:py-5"
          >
            <h3 className="text-sm font-medium md:text-base">
              {feature.title}
            </h3>
            <p className="text-muted-foreground max-w-xl text-sm leading-6">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
