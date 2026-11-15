import { ModeToggle } from "@features/theme"
import { Button } from "@packages/ui/components/button"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import {
  LocaleSwitcherCombobox,
  LocaleSwitcherIconButton,
} from "@/shared/shell/web-locale-switcher"
import type { LangPageProps } from "@/shared/types/web.app.types"

export default async function WebHomePage({ params }: LangPageProps) {
  const t = await getServerTranslations(params, "home")

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-medium">{t("title")}</h1>
            <p>{t("intro")}</p>
            <p>{t("hint")}</p>
            <Button className="mt-2">{t("button")}</Button>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LocaleSwitcherCombobox />
            <LocaleSwitcherIconButton />
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
