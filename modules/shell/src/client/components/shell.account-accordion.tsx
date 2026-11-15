/** @deprecated Prefer `ShellAccountFrame` for always-visible account sections. */
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@packages/ui/components/accordion"
import type { ReactNode } from "react"

export function ShellAccountAccordion({
  children,
  defaultValue,
}: {
  readonly children: ReactNode
  readonly defaultValue: string | string[]
}) {
  return (
    <Accordion
      className="overflow-hidden rounded-xl border border-border"
      defaultValue={Array.isArray(defaultValue) ? defaultValue : [defaultValue]}
      multiple={Array.isArray(defaultValue)}
    >
      {children}
    </Accordion>
  )
}

export function ShellAccountAccordionSection({
  children,
  title,
  description,
  value,
}: {
  readonly children: ReactNode
  readonly title: string
  readonly description: string
  readonly value: string
}) {
  return (
    <AccordionItem className="bg-sidebar px-4" value={value}>
      <AccordionTrigger>
        <span className="min-w-0 text-start">
          <span className="block text-foreground">{title}</span>
          <span className="block font-normal text-muted-foreground">
            {description}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionPanel>{children}</AccordionPanel>
    </AccordionItem>
  )
}
