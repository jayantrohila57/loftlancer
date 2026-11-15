"use client"

import { FormKit } from "@features/form"
import { Button } from "@packages/ui/components/button"
import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"
import { useFormState } from "react-hook-form"

import type { OrgCreateWizardNav } from "./org.create-form.wizard-nav.client"

function OrgCreateWizardSubmit() {
  const t = useTranslations("ui")
  const { isSubmitting } = useFormState()
  return (
    <Button
      type="submit"
      loading={isSubmitting}
      aria-label={isSubmitting ? t("creatingOrganization") : t("finish")}
    >
      {isSubmitting ? t("creatingOrganization") : t("finish")}
    </Button>
  )
}

export function OrgCreateFormWizardFooter({
  nav,
  onCancel,
}: {
  readonly nav: OrgCreateWizardNav
  readonly onCancel?: () => void
}) {
  const t = useTranslations("ui")
  const { isFirstStep, isLastStep, goPrevious, goNext } = nav

  // Draft persistence is not wired yet — stub until create-draft API exists.
  function saveDraft() {
    toastManager.add({
      title: t("saveDraftComingSoon"),
      type: "info",
    })
  }

  return (
    <FormKit.Actions className="shrink-0 bg-transparent px-0 py-3">
      {onCancel ? (
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("cancel")}
        </Button>
      ) : null}
      <Button type="button" variant="outline" onClick={saveDraft}>
        {t("saveDraft")}
      </Button>
      {!isFirstStep ? (
        <Button type="button" variant="outline" onClick={goPrevious}>
          {t("previous")}
        </Button>
      ) : null}
      {!isLastStep ? (
        <Button type="button" onClick={() => void goNext()}>
          {t("next")}
        </Button>
      ) : (
        <OrgCreateWizardSubmit />
      )}
    </FormKit.Actions>
  )
}
