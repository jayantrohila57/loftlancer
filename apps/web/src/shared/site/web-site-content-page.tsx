import Shell from "@packages/ui/components/shell"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import type { LangPageProps } from "@/shared/types/web.app.types"

type ContentSection = {
  readonly heading: string
  readonly paragraphs: readonly string[]
  readonly bullets?: readonly string[]
}

export type WebSiteContentPageNamespace =
  | "aboutPage"
  | "accessibilityPage"
  | "blogPage"
  | "companyStoriesPage"
  | "partnershipsPage"
  | "faqPage"
  | "searchPage"
  | "sitemapPage"
  | `productPages.${string}`

export interface WebSiteContentPageInput extends LangPageProps {
  readonly namespace: WebSiteContentPageNamespace
  readonly showLastUpdated?: boolean
}

export async function WebSiteContentPage({
  namespace,
  params,
  showLastUpdated = false,
}: WebSiteContentPageInput) {
  const t = await getServerTranslations(params, namespace)
  const sections = t.raw("sections") as readonly ContentSection[]

  return (
    <Shell.Section className="min-h-screen px-6 py-16" variant="site">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-16">
        <header className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-base text-pretty text-muted-foreground">
            {t("description")}
          </p>
          {showLastUpdated && t.has("lastUpdatedLine") ? (
            <p className="text-sm text-muted-foreground">
              {t("lastUpdatedLine")}
            </p>
          ) : null}
        </header>
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section className="space-y-3" key={section.heading}>
              <h2 className="text-xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  className="text-sm leading-relaxed text-pretty text-muted-foreground"
                  key={paragraph.slice(0, 48)}
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {section.bullets.map((item) => (
                    <li className="text-pretty" key={item.slice(0, 48)}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </article>
    </Shell.Section>
  )
}