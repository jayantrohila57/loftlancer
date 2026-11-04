import { PageContainer } from "@features/marketing/core/client";

export function HomePricingSection({
  pagesBaseUrl,
}: {
  pagesBaseUrl?: string;
}) {
  const pricingHref = pagesBaseUrl
    ? new URL("pricing", `${pagesBaseUrl.replace(/\/$/, "")}/`).toString()
    : "/pricing";
  return (
    <section className="border-foreground/15 border-y">
      <PageContainer className="grid gap-6 py-9 md:grid-cols-[1fr_auto] md:items-center md:py-11">
        <div>
          <h2 className="text-2xl font-medium tracking-[-0.04em] md:text-3xl">
            Use Loftlancer free during early access.
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            There are no paid plans or billing today. Review what is included
            before you get started.
          </p>
        </div>
        <div className="border-border/70 flex flex-wrap items-center gap-4 border-t pt-4 md:min-w-64 md:border-t-0 md:border-l md:pt-0 md:pl-7">
          <span className="text-4xl font-medium tracking-[-0.06em]">$0</span>
          <span className="text-muted-foreground max-w-24 text-xs leading-5">
            during early access
          </span>
          <a
            href={pricingHref}
            className="decoration-border hover:decoration-foreground ml-auto text-sm underline underline-offset-4 transition-colors"
          >
            Pricing details
          </a>
        </div>
      </PageContainer>
    </section>
  );
}
