import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

export function McpAuthorizationConsentInvalidScreen() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="center">
      <Shell.Stack variant="form">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("mcpConsentInvalidTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("mcpConsentInvalidDescription")}
          </p>
        </div>
      </Shell.Stack>
    </Shell.Section>
  )
}
