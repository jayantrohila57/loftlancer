import Shell from "@packages/ui/components/shell"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import type { WebPricingStatusKind } from "@/shared/pricing/web-pricing-status-panel.client"
import { WebPricingStatusPanel } from "@/shared/pricing/web-pricing-status-panel.client"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function WebPricingStatusPage({
  kind,
  params,
}: LangPageProps & { readonly kind: WebPricingStatusKind }) {
  const t = await getServerTranslations(params, "pricing")
  const title =
    kind === "success"
      ? t("statusSuccessTitle")
      : kind === "failure"
        ? t("statusFailureTitle")
        : t("statusCancelTitle")

  return (
    <Shell.Section className="px-6 py-16" variant="site">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <h1 className="text-center font-heading text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <WebPricingStatusPanel kind={kind} />
      </div>
    </Shell.Section>
  )
}
