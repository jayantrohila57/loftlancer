import { getTranslations } from "next-intl/server"

import { loadWhatsNewReleases } from "../../server/whats-new.loader"
import type { WhatsNewSectionHeading } from "../../utils/types/whats-new.types"
import { WHATS_NEW_SECTION_HEADINGS } from "../../utils/types/whats-new.types"

const sectionMessageKey = {
  Added: "added",
  Changed: "changed",
  Removed: "removed",
  Breaking: "breaking",
} as const satisfies Record<WhatsNewSectionHeading, string>

export async function WhatsNewPage() {
  const t = await getTranslations("whatsNew")
  const releases = loadWhatsNewReleases()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>
      {releases.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ol className="flex list-none flex-col gap-10 p-0">
          {releases.map((release) => (
            <li key={release.version}>
              <h2 className="text-lg font-medium">
                {t("versionLabel", { version: release.version })}
              </h2>
              {release.date ? (
                <time
                  className="text-sm text-muted-foreground"
                  dateTime={release.date}
                >
                  {release.date}
                </time>
              ) : null}
              {WHATS_NEW_SECTION_HEADINGS.map((heading) => {
                const items = release.sections[heading]
                if (!items?.length) {
                  return null
                }
                return (
                  <section className="mt-4" key={heading}>
                    <h3 className="text-sm font-medium">
                      {t(sectionMessageKey[heading])}
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}
