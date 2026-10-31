import { PageContainer, PageHero } from "@loftlancer/ui/marketing";
import { cn } from "@loftlancer/ui/utils";
import type { ReactNode } from "react";

/**
 * Page title + prose body. The surrounding chrome comes from the route-group
 * layout: auth-5 split for (split) pages, the public app-shell for (legal).
 */
export function MarketingPage({
  title,
  description,
  eyebrow,
  children,
  aside,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <PageContainer className="py-8 md:py-12">
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <div
        className={cn(
          "grid gap-10 pt-8 md:pt-10",
          aside && "lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-16",
        )}
      >
        <article className="max-w-none text-[15px] text-foreground/90 leading-7 [&_a:not([data-slot=button]):hover]:decoration-foreground [&_a:not([data-slot=button])]:text-foreground [&_a:not([data-slot=button])]:underline [&_a:not([data-slot=button])]:decoration-border [&_a:not([data-slot=button])]:underline-offset-4 [&_caption]:mb-3 [&_caption]:text-left [&_caption]:font-medium [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.84em] [&_h2]:mt-12 [&_h2]:border-border/70 [&_h2]:border-b [&_h2]:pb-3 [&_h2]:font-medium [&_h2]:text-2xl [&_h2]:text-foreground [&_h2]:tracking-[-0.04em] [&_h3]:mt-7 [&_h3]:font-medium [&_h3]:text-base [&_p]:max-w-3xl [&_p]:leading-7 [&_table]:w-full [&_table]:border-collapse [&_td]:border-border/70 [&_td]:border-b [&_td]:p-3 [&_th]:border-border/70 [&_th]:border-b [&_th]:p-3 [&_th]:text-left">
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
