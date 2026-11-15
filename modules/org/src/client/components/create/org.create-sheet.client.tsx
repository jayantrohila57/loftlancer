"use client"

import { Button } from "@packages/ui/components/button"
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@packages/ui/components/sheet"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { createContext, useContext, useState } from "react"

import { OrgCreateForm } from "./org.create-form.client"

const OrgCreateSheetContext = createContext<(() => void) | null>(null)

export function useOrgCreateSheet() {
  const open = useContext(OrgCreateSheetContext)
  if (!open) throw new Error("Organization creation sheet is unavailable")
  return open
}

export function OrgCreateSheetProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const t = useTranslations("ui")
  const [open, setOpen] = useState(false)
  return (
    <OrgCreateSheetContext.Provider value={() => setOpen(true)}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetPopup
          className="h-full max-h-[calc(100dvh-2rem)] min-h-0 sm:max-w-4xl"
          side="right"
          variant="inset"
        >
          <SheetHeader>
            <SheetTitle>{t("createOrganization")}</SheetTitle>
            <SheetDescription>
              {t("organizationCreateDescription")}
            </SheetDescription>
          </SheetHeader>
          <SheetPanel
            className="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
            scrollFade={false}
            scrollable={false}
          >
            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-6 [&_form]:h-full [&_form]:min-h-0 [&_form]:border-0 [&_form]:bg-transparent [&_form]:shadow-none">
              <OrgCreateForm compact onCancel={() => setOpen(false)} />
            </div>
          </SheetPanel>
        </SheetPopup>
      </Sheet>
    </OrgCreateSheetContext.Provider>
  )
}

export function OrgCreateSheetAction() {
  const t = useTranslations("ui")
  const open = useOrgCreateSheet()
  return (
    <Button variant="outline" onClick={open}>
      <Plus aria-hidden="true" />
      {t("createOrganization")}
    </Button>
  )
}
