import Shell from "@packages/ui/components/shell"
import { Link } from "@/shared/i18n/web.i18n"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import type { LangPageProps } from "@/shared/types/web.app.types"

type FaqItem = {
  readonly answer: string
  readonly category: string
  readonly question: string
}

type ContentSection = {
  readonly heading: string
  readonly paragraphs: readonly string[]
}

export async function WebFaqPage({ params }: LangPageProps) {
  const tPage = await getServerTranslations(params, "faqPage")
  const tHelp = await getServerTranslations(params, "helpCenter")
  const sections = tPage.raw("sections") as readonly ContentSection[]
  const faqItems = tHelp.raw("faqItems") as readonly FaqItem[]

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
        {sections.map((section) => (
          <section className="space-y-3" key={section.heading}>
            <h2 className="text-lg font-semibold tracking-tight">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                className="text-sm text-pretty text-muted-foreground"
                key={paragraph.slice(0, 48)}
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        <dl className="flex flex-col gap-6">
          {faqItems.map((item) => (
            <div className="space-y-2" key={item.question}>
              <dt className="font-medium text-foreground">{item.question}</dt>
              <dd className="text-sm text-pretty text-muted-foreground">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground">
          <Link className="underline-offset-4 hover:underline" href="/help">
            {tHelp("title")}
          </Link>
        </p>
      </div>
    </Shell.Section>
  )
}
