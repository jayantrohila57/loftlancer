import { Button } from "@loftlancer/ui/button";
import { PageContainer } from "@loftlancer/ui/marketing";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    <section className="flex min-h-[56svh] items-center border-foreground/15 border-b py-14 md:min-h-[62svh] md:py-20">
      <PageContainer className="grid gap-7 md:grid-cols-[0.42fr_1.58fr] md:gap-12">
        <p className="font-mono text-muted-foreground text-xs tabular-nums md:pt-3">
          {code}{" "}
          <span aria-hidden className="px-1.5 text-border">
            /
          </span>{" "}
          LOFTLANCER
        </p>
        <div className="max-w-4xl">
          <h1 className="text-balance font-medium text-[clamp(3.25rem,8vw,6.5rem)] leading-[0.9] tracking-[-0.065em]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground leading-7 md:text-lg">
            {description}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Button render={<a href={actionHref} />}>
              <ArrowLeft aria-hidden className="size-4" />
              {actionLabel}
            </Button>
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
                <ArrowRight aria-hidden className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
