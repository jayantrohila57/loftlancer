import Shell from "@packages/ui/components/shell"
import { WEB_HELP_ARTICLE_SLUGS } from "@/shared/help/web-help-articles"
import { Link } from "@/shared/i18n/web.i18n"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import { webSiteNavItemSpecs } from "@/shared/shell/web-site-navigation"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function WebSitemapPage({ params }: LangPageProps) {
  const tPage = await getServerTranslations(params, "sitemapPage")
  const tSite = await getServerTranslations(params, "siteShell")
  const tHelp = await getServerTranslations(params, "helpCenter")

  const staticPages = webSiteNavItemSpecs.map((item) => ({
    href: item.href,
    label: tSite(item.labelKey),
  }))

  return (
    <Shell.Section className="min-h-screen px-6 py-16" variant="site">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 pb-16">
        <header className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {tPage("title")}
          </h1>
          <p className="text-base text-pretty text-muted-foreground">
            {tPage("description")}
          </p>
        </header>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {tPage("sitePagesHeading")}
          </h2>
          <ul className="columns-1 gap-x-8 sm:columns-2">
            {staticPages.map((page) => (
              <li className="break-inside-avoid py-1" key={page.href}>
                <Link
                  className="text-sm text-primary underline-offset-4 hover:underline"
                  href={page.href}
                >
                  {page.label}
                </Link>
              </li>
            ))}
            <li className="break-inside-avoid py-1">
              <Link
                className="text-sm text-primary underline-offset-4 hover:underline"
                href="/whats-new"
              >
                {tPage("whatsNewLink")}
              </Link>
            </li>
            <li className="break-inside-avoid py-1">
              <Link
                className="text-sm text-primary underline-offset-4 hover:underline"
                href="/status"
              >
                {tSite("footerContactStatus")}
              </Link>
            </li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {tPage("helpArticlesHeading")}
          </h2>
          <ul className="columns-1 gap-x-8 sm:columns-2">
            {WEB_HELP_ARTICLE_SLUGS.map((slug) => (
              <li className="break-inside-avoid py-1" key={slug}>
                <Link
                  className="text-sm text-primary underline-offset-4 hover:underline"
                  href={`/help/${slug}`}
                >
                  {tHelp(`articles.${slug}.title`)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell.Section>
  )
}
