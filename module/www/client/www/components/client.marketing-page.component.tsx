import { PageContainer } from "@features/marketing/core/client";
import { cn } from "@loftlancer/ui/utils";
import type { ReactNode } from "react";

/**
 * Page title + prose body. The surrounding chrome comes from the route-group
 * layout: auth-5 split for (split) pages, the public app-shell for (legal).
 */
export function MarketingPage({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <PageContainer className="py-8 md:py-12">
      <header className="border-foreground/15 grid gap-6 border-y py-7 md:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] md:items-end md:gap-12 md:py-9">
        <h1 className="max-w-5xl text-[clamp(3.25rem,6vw,5.5rem)] leading-[0.94] font-medium tracking-[-0.04em] text-balance">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground max-w-md pb-1 text-base leading-7 text-pretty md:justify-self-end md:text-[1.05rem]">
            {description}
          </p>
        ) : null}
      </header>
      <div
        className={cn(
          "grid gap-10 pt-8 md:pt-10",
          aside && "lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-16",
        )}
      >
        <article className="text-foreground/90 [&_a:not([data-slot=button]):hover]:decoration-foreground [&_a:not([data-slot=button])]:text-foreground [&_a:not([data-slot=button])]:decoration-border [&_code]:bg-muted [&_h2]:border-border/70 [&_h2]:text-foreground [&_td]:border-border/70 [&_th]:border-border/70 max-w-none text-[15px] leading-7 [&_a:not([data-slot=button])]:underline [&_a:not([data-slot=button])]:underline-offset-4 [&_caption]:mb-3 [&_caption]:text-left [&_caption]:font-medium [&_code]:rounded-sm [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.84em] [&_h2]:mt-12 [&_h2]:border-b [&_h2]:pb-3 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-[-0.04em] [&_h3]:mt-7 [&_h3]:text-base [&_h3]:font-medium [&_p]:max-w-3xl [&_p]:leading-7 [&_table]:w-full [&_table]:border-collapse [&_td]:border-b [&_td]:p-3 [&_th]:border-b [&_th]:p-3 [&_th]:text-left">
          {children}
        </article>
        {aside ? (
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            {aside}
          </aside>
        ) : null}
      </div>
    </PageContainer>
  );
}
