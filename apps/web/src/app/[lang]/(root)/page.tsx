import Shell from "@packages/ui/components/shell"
import { WebSiteHeroSection } from "@/shared/marketing/web-site-hero-section"
import type { LangPageProps } from "@/shared/types/web.app.types"

export default async function WebHomePage({ params }: LangPageProps) {
  return (
    <Shell.Section variant="site">
      <WebSiteHeroSection params={params} />
    </Shell.Section>
  )
}
