import { marketingContainerClass } from "@features/shell/utils/shell.layout-spacing.utils";

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@loftlancer/ui/accordion";
import { Button } from "@loftlancer/ui/button";
import { cn } from "@loftlancer/ui/utils";
import type { ReactNode } from "react";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(marketingContainerClass, className)}>{children}</div>
  );
}

export function Section({
  children,
  className,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn("py-12 md:py-16", className)}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="text-muted-foreground mb-3 text-[11px] font-medium tracking-[0.16em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-medium tracking-[-0.045em] text-balance md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground mt-4 max-w-xl leading-7">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function FeatureShowcase({
  title,
  description,
  details,
  visual,
  reverse = false,
}: {
  title: string;
  description: string;
  details?: ReactNode;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <section className="border-border/70 grid items-center gap-8 border-t py-10 md:grid-cols-[0.78fr_1.22fr] md:gap-14 md:py-14">
      <div className={cn("min-w-0", reverse && "md:order-2")}>
        <h2 className="max-w-xl text-3xl font-medium tracking-[-0.045em] text-balance md:text-4xl">
          {title}
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl leading-7">
          {description}
        </p>
        {details ? <div className="mt-6">{details}</div> : null}
      </div>
      <div className={cn("min-w-0", reverse && "md:order-1")}>{visual}</div>
    </section>
  );
}

export function ProductPreview({
  children,
  label,
  note,
  className,
}: {
  children: ReactNode;
  label: string;
  note?: string;
  className?: string;
}) {
  return (
    <figure className={cn("min-w-0", className)}>
      <div className="border-foreground/15 bg-muted/30 overflow-hidden border">
        {children}
      </div>
      <figcaption className="border-border/70 text-muted-foreground flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b py-2.5 text-xs">
        <span>{label}</span>
        {note ? (
          <span className="tracking-normal normal-case">{note}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function CallToAction({
  title,
  description,
  href,
  actionLabel,
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <section className="border-foreground/15 bg-muted/20 border-y py-10 md:py-14">
      <PageContainer className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-medium tracking-[-0.045em] text-balance md:text-4xl">
            {title}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
            {description}
          </p>
        </div>
        <Button size="lg" render={<a href={href} />} className="w-fit shrink-0">
          {actionLabel}
        </Button>
      </PageContainer>
    </section>
  );
}

export function FAQSection({
  items,
  title = "A few product questions",
  description,
}: {
  items: ReadonlyArray<{ question: string; answer: string }>;
  title?: string;
  description?: string;
}) {
  return (
    <section
      className="border-foreground/15 grid gap-8 border-t py-12 md:grid-cols-[0.72fr_1.28fr] md:gap-14 md:py-16"
      aria-labelledby="marketing-faq-title"
    >
      <div>
        <h2
          id="marketing-faq-title"
          className="text-3xl font-medium tracking-[-0.045em] text-balance md:text-4xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground mt-4 leading-7">{description}</p>
        ) : null}
      </div>
      <Accordion className="divide-border/70 border-foreground/15 divide-y border-y">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`question-${index}`}>
            <AccordionTrigger className="py-5 text-left text-sm font-medium md:text-base">
              {item.question}
            </AccordionTrigger>
            <AccordionPanel className="text-muted-foreground max-w-2xl pb-5 text-sm leading-6">
              {item.answer}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
