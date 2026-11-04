import { PageContainer } from "@features/marketing/core/client";
import { Button } from "@loftlancer/ui/button";

export function MarketingRouteState({
  code,
  title,
  description,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
  secondaryAction,
}: {
  code: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  secondaryAction?: () => void;
}) {
  return (
    <section className="border-foreground/15 flex min-h-[56svh] items-center border-b py-14 md:min-h-[62svh] md:py-20">
      <PageContainer className="grid gap-7 md:grid-cols-[0.42fr_1.58fr] md:gap-12">
        <p className="text-muted-foreground font-mono text-xs tabular-nums md:pt-3">
          {code}{" "}
          <span aria-hidden className="text-border px-1.5">
            /
          </span>{" "}
          LOFTLANCER
        </p>
        <div className="max-w-4xl">
          <h1 className="text-[clamp(3.25rem,8vw,6.5rem)] leading-[0.9] font-medium tracking-[-0.065em] text-balance">
            {title}
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl leading-7 md:text-lg">
            {description}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Button render={<a href={actionHref} />}>{actionLabel}</Button>
            {secondaryLabel && (secondaryHref || secondaryAction) ? (
              <Button
                variant="outline"
                onClick={secondaryAction}
                render={
                  secondaryHref ? (
                    <a href={secondaryHref}>{secondaryLabel}</a>
                  ) : undefined
                }
              >
                {secondaryLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
