/**
 * Draft legal document pages — copy pending formal legal review.
 */

import Shell from "@packages/ui/components/shell"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import type { LangPageProps } from "@/shared/types/web.app.types"

export type WebLegalDocumentId = "terms" | "privacy" | "cookies"

type LegalSection = {
  readonly heading: string
  readonly paragraphs: readonly string[]
}

export async function WebLegalDocumentPage({
  document,
  params,
}: LangPageProps & { readonly document: WebLegalDocumentId }) {
  const t = await getServerTranslations(params, "legal")
  const sections = t.raw(`${document}.sections`) as readonly LegalSection[]

  return (
    <Shell.Section className="min-h-screen px-6 py-16" variant="site">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-16">
        <header className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t(`${document}.title`)}
          </h1>
          <p className="text-base text-muted-foreground">
            {t(`${document}.description`)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("lastUpdatedLine")}
          </p>
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
            </section>
          ))}
        </div>
      </article>
    </Shell.Section>
  )
}
