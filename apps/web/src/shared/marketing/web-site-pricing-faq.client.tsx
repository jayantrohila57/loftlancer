"use client"

import { FieldKit } from "@features/form"
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@packages/ui/components/accordion"
import { Button } from "@packages/ui/components/button"
import { cn } from "@packages/ui/lib/utils"
import type { LucideIcon } from "lucide-react"
import {
  CreditCard,
  Headphones,
  LayoutGrid,
  PenLine,
  Power,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { z } from "zod"

const faqSearchSchema = z.object({
  query: z.string(),
})

/** Collapsed accordion trigger row height (matches ~text-base trigger). */
const FAQ_COLLAPSED_ROW_REM = 3.5

const FAQ_CATEGORY_IDS = [
  "all",
  "gettingStarted",
  "features",
  "billing",
  "support",
] as const

type FaqCategoryId = (typeof FAQ_CATEGORY_IDS)[number]

const FAQ_CATEGORY_ICONS: Record<FaqCategoryId, LucideIcon> = {
  all: LayoutGrid,
  gettingStarted: Power,
  features: PenLine,
  billing: CreditCard,
  support: Headphones,
}

interface PricingFaqItem {
  readonly question: string
  readonly answer: string
  readonly category: Exclude<FaqCategoryId, "all">
}

export function WebSitePricingFaqClient() {
  const t = useTranslations("pricingPage")
  const faqItems = t.raw("faqItems") as PricingFaqItem[]
  const [activeCategory, setActiveCategory] = useState<FaqCategoryId>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const categoryFilteredItems = useMemo(
    () =>
      activeCategory === "all"
        ? faqItems
        : faqItems.filter((item) => item.category === activeCategory),
    [activeCategory, faqItems]
  )

  const filteredItems = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) {
      return categoryFilteredItems
    }
    return categoryFilteredItems.filter(
      (item) =>
        item.question.toLowerCase().includes(normalized) ||
        item.answer.toLowerCase().includes(normalized)
    )
  }, [categoryFilteredItems, searchQuery])

  const maxCollapsedRowCount = useMemo(() => {
    const counts = FAQ_CATEGORY_IDS.map((categoryId) =>
      categoryId === "all"
        ? faqItems.length
        : faqItems.filter((item) => item.category === categoryId).length
    )
    return Math.max(...counts, 0)
  }, [faqItems])

  const accordionMinHeightRem = maxCollapsedRowCount * FAQ_COLLAPSED_ROW_REM

  const ActiveCategoryIcon = FAQ_CATEGORY_ICONS[activeCategory]

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex max-w-3xl flex-col items-start gap-3 self-start text-left">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("faqTitle")}
        </h2>
        <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
          {t("faqDescription")}
        </p>
      </header>

      <FieldKit
        onValuesChange={(next) => {
          setSearchQuery(typeof next.query === "string" ? next.query : "")
        }}
        schema={faqSearchSchema}
        values={{ query: searchQuery }}
      >
        <FieldKit.Field
          label={t("faqSearchLabel")}
          name="query"
          placeholder={t("faqSearchPlaceholder")}
          type="search"
        />
      </FieldKit>

      <div className="grid w-full gap-6 md:grid-cols-[3fr_5fr] md:gap-12">
        <nav
          aria-label={t("faqFilterLabel")}
          className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
        >
          {FAQ_CATEGORY_IDS.map((categoryId) => {
            const Icon = FAQ_CATEGORY_ICONS[categoryId]
            const isActive = activeCategory === categoryId

            return (
              <Button
                className={cn(
                  "h-9 shrink-0 justify-start gap-2 px-3 font-normal",
                  isActive && "bg-muted/50 text-foreground"
                )}
                key={categoryId}
                onClick={() => setActiveCategory(categoryId)}
                type="button"
                variant="ghost"
              >
                <Icon aria-hidden className="size-4 shrink-0" />
                {t(`faqCategories.${categoryId}.label`)}
              </Button>
            )
          })}
        </nav>

        <div className="flex min-w-0 flex-col gap-4">
          <header className="flex items-center gap-2 text-base font-medium text-foreground">
            <ActiveCategoryIcon aria-hidden className="size-4 shrink-0" />
            {t(`faqCategories.${activeCategory}.label`)}
          </header>

          <div
            className="w-full"
            style={{ minHeight: `${accordionMinHeightRem}rem` }}
          >
            <Accordion className="w-full" key={activeCategory}>
              {filteredItems.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`}>
                  <AccordionTrigger className="text-base text-foreground hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionPanel>
                    <p className="leading-relaxed text-pretty">{item.answer}</p>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  )
}
