import { useTranslations } from "next-intl"
/** Shared empty state for option-based fields. */
export function FieldEmpty() {
  const t = useTranslations("ui")

  return (
    <div role="status" className="px-2 py-1.5 text-sm text-muted-foreground">
      {t("noItems")}
    </div>
  )
}
