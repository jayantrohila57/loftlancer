import { WebSitePlaceholderPage } from "@/shared/shell/web-site-placeholder-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export default async function ProductWebsiteBuilderPage(props: LangPageProps) {
  return WebSitePlaceholderPage({
    ...props,
    titleKey: "navProductWebsiteBuilder",
  })
}
