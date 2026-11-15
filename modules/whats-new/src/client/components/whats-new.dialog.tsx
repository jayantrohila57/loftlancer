"use client"

import { useTranslations } from "next-intl"

import { WHATS_NEW_POPUP_ENABLED } from "../../utils/constants/whats-new.constants"
import type {
  WhatsNewReleaseNotes,
  WhatsNewSectionHeading,
} from "../../utils/types/whats-new.types"
import { WHATS_NEW_SECTION_HEADINGS } from "../../utils/types/whats-new.types"
import { markVersionSeen } from "../../utils/whats-new.version"

const sectionMessageKey = {
  Added: "added",
  Changed: "changed",
  Removed: "removed",
  Breaking: "breaking",
} as const satisfies Record<WhatsNewSectionHeading, string>

interface WhatsNewDialogProps {
  readonly notes?: WhatsNewReleaseNotes | null
}

function WhatsNewDialogPanel({ notes }: WhatsNewDialogProps) {
  const t = useTranslations("whatsNew")
  if (!notes) {
    return null
  }

  return (
    <div
      aria-labelledby="whats-new-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      role="dialog"
    >
      <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-lg bg-background p-6 shadow-lg">
        <h2 className="text-lg font-medium" id="whats-new-dialog-title">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("versionLabel", { version: notes.version })}
        </p>
        {WHATS_NEW_SECTION_HEADINGS.map((heading) => {
          const items = notes.sections[heading]
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
        <button
          className="mt-6 text-sm underline"
          onClick={() => markVersionSeen(notes.version)}
          type="button"
        >
          {t("close")}
        </button>
      </div>
    </div>
  )
}

/**
 * Future in-app "What's New" pop-up. This component is not mounted in any
 * layout. Keep `WHATS_NEW_POPUP_ENABLED` false until a future release
 * enables it, then render `<WhatsNewDialog />` from an app layout.
 */
export function WhatsNewDialog(props: WhatsNewDialogProps) {
  if (!WHATS_NEW_POPUP_ENABLED) {
    return null
  }
  return <WhatsNewDialogPanel {...props} />
}
