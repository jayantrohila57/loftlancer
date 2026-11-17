import Shell from "@packages/ui/components/shell"
import { Link } from "@/shared/i18n/web.i18n"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import type { LangPageProps } from "@/shared/types/web.app.types"

const LEGAL_LINKS = [
  { href: "/legal/terms", labelKey: "terms.title" },
  { href: "/legal/privacy", labelKey: "privacy.title" },
  { href: "/legal/cookies", labelKey: "cookies.title" },
  { href: "/legal/refund", labelKey: "refund.title" },
  { href: "/legal/acceptable-use", labelKey: "acceptableUse.title" },
  { href: "/legal/disclaimer", labelKey: "disclaimer.title" },
  { href: "/legal/subprocessors", labelKey: "subprocessors.title" },
  { href: "/legal/security", labelKey: "security.title" },
  { href: "/legal/licenses", labelKey: "licenses.title" },
] as const

type OverviewSection = {
  readonly heading: string
  readonly paragraphs: readonly string[]
}

export async function WebLegalOverviewPage({ params }: LangPageProps) {
  const tLegal = await getServerTranslations(params, "legal")
  const sections = tLegal.raw("overview.sections") as readonly OverviewSection[]

  return (
    <Shell.Section className="min-h-screen px-6 py-16" variant="site">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-16">
        <header className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {tLegal("overview.title")}
          </h1>
          <p className="text-base text-pretty text-muted-foreground">
            {tLegal("overview.description")}
          </p>
          <p className="text-sm text-muted-foreground">
            {tLegal("lastUpdatedLine")}
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
          <nav aria-label={tLegal("overview.indexTitle")}>
            <h2 className="mb-3 text-xl font-semibold tracking-tight">
              {tLegal("overview.indexTitle")}
            </h2>
            <ul className="flex flex-col gap-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    href={link.href}
                  >
                    {tLegal(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </article>
    </Shell.Section>
  )
}
