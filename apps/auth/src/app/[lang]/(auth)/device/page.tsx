import { SecurityDeviceAuthorizationScreen } from "@modules/device-authorization"
import Shell from "@packages/ui/components/shell"
import { requireAccountSession } from "@/shared/auth/auth.session"
import { getServerTranslations } from "@/shared/i18n/auth.i18n.server"
import type { LangPageProps } from "@/shared/types/auth.app.types"

type DeviceAuthorizationPageProps = LangPageProps & {
  searchParams: Promise<{ user_code?: string | string[] }>
}

export default async function DeviceAuthorizationPage({
  params,
  searchParams,
}: DeviceAuthorizationPageProps) {
  await requireAccountSession(params)
  const t = await getServerTranslations(params, "ui")
  const { user_code: userCode } = await searchParams
  const initialUserCode = typeof userCode === "string" ? userCode : undefined

  return (
    <Shell.Section className="mx-auto w-full max-w-md p-4" variant="center">
      <div className="space-y-2 text-center">
        <h1 className="text-lg font-semibold">{t("deviceAuthorization")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("deviceAuthorizationPageDescription")}
        </p>
      </div>
      <SecurityDeviceAuthorizationScreen initialUserCode={initialUserCode} />
    </Shell.Section>
  )
}
