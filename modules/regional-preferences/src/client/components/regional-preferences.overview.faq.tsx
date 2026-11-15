"use client"

import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@packages/ui/components/accordion"
import Shell from "@packages/ui/components/shell"
import { HelpCircle, MessageCircleQuestion, Minus, Plus } from "lucide-react"
import { useTranslations } from "next-intl"

const FAQ_ITEMS = [
  {
    answerKey: "overviewFaqSavedAnswer",
    questionKey: "overviewFaqSavedQuestion",
    value: "saved",
  },
  {
    answerKey: "overviewFaqDefaultAnswer",
    questionKey: "overviewFaqDefaultQuestion",
    value: "default",
  },
  {
    answerKey: "overviewFaqAppsAnswer",
    questionKey: "overviewFaqAppsQuestion",
    value: "apps",
  },
  {
    answerKey: "overviewFaqLanguageAnswer",
    questionKey: "overviewFaqLanguageQuestion",
    value: "language",
  },
  {
    answerKey: "overviewFaqCurrencyAnswer",
    questionKey: "overviewFaqCurrencyQuestion",
    value: "currency",
  },
] as const

export function RegionalOverviewFaq() {
  const t = useTranslations("regionalPreferences")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("overviewFaqFrameDetail")}
          title={t("overviewFaqTitle")}
        >
          <p className="mb-4 w-full text-sm text-muted-foreground">
            <span className="mb-2 flex items-center gap-2">
              <HelpCircle className="size-4 shrink-0" aria-hidden="true" />
              <span className="font-medium text-foreground">
                {t("overviewFaqLead")}
              </span>
            </span>
            <span className="block max-w-prose leading-relaxed text-pretty">
              {t("overviewFaqIntro")}
            </span>
          </p>
          <Accordion className="flex w-full flex-col gap-3" defaultValue={[]}>
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.value}
                className="overflow-hidden rounded-xl border border-b border-border border-b-border bg-muted/25 shadow-xs/5 transition-colors last:border-b data-panel-open:border-primary/35 data-panel-open:bg-muted/35"
                value={item.value}
              >
                <AccordionTrigger className="items-center gap-3 px-4 py-3 hover:bg-muted/50 data-panel-open:[&_.overview-faq-minus]:block data-panel-open:[&_.overview-faq-plus]:hidden [&_[data-slot=accordion-indicator]]:hidden">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                    <MessageCircleQuestion
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="min-w-0 flex-1 pe-2 text-sm leading-snug font-semibold text-foreground">
                    <span className="block max-w-prose text-pretty">
                      {t(item.questionKey)}
                    </span>
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                    <Plus
                      className="overview-faq-plus size-4"
                      aria-hidden="true"
                    />
                    <Minus
                      className="overview-faq-minus hidden size-4"
                      aria-hidden="true"
                    />
                  </span>
                </AccordionTrigger>
                <AccordionPanel className="text-foreground/90">
                  <div className="mx-4 mb-4 w-full rounded-lg border border-border/80 bg-background/90 px-3 py-3">
                    <p className="min-h-[4.5rem] max-w-prose text-sm leading-6 text-pretty text-muted-foreground">
                      {t(item.answerKey)}
                    </p>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
