"use client"

import { Button } from "@packages/ui/components/button"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@packages/ui/components/combobox"
import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@packages/ui/components/menu"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@packages/ui/components/preview-card"
import { cn } from "@packages/ui/lib/utils"
import { Languages } from "lucide-react"
import type { Locale } from "next-intl"
import { hasLocale, useFormatter, useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"

import {
  defaultLocaleLabels,
  defaultLocaleRegionCodes,
  defaultSupportedLocales,
} from "../constants/i18n.constants"
import type { LocaleSwitcherControlProps } from "../types/i18n.types"
import { buildPathnamePreservingBrowserQuery } from "../utils/i18n.pathname"
import { getLocaleFlagEmoji, getLocaleLabel } from "../utils/i18n.utils"

export type { LocaleSwitcherControlProps } from "../types/i18n.types"
export interface LocaleSwitcherComboboxProps
  extends LocaleSwitcherControlProps {
  locales: readonly string[]
  useRouter: LocaleSwitcherNavigation["useRouter"]
  usePathname: LocaleSwitcherNavigation["usePathname"]
}

export interface LocaleSwitcherIconButtonProps
  extends LocaleSwitcherComboboxProps {}

export interface LocaleSwitcherNavigation {
  useRouter: () => {
    replace: (
      href: string,
      options?: {
        locale?: Locale
      }
    ) => void
  }
  usePathname: () => string
}

function formatLocaleOption(
  locale: string,
  labels: Readonly<Record<string, string>>,
  regionCodes: Readonly<Record<string, string>>
): string {
  return `${getLocaleFlagEmoji(locale, regionCodes)} ${getLocaleLabel(locale, labels)}`
}

function LocaleOptionContent({
  locale,
  labels,
  regionCodes,
}: {
  locale: string
  labels: Readonly<Record<string, string>>
  regionCodes: Readonly<Record<string, string>>
}) {
  return (
    <>
      <span aria-hidden className="text-base leading-none">
        {getLocaleFlagEmoji(locale, regionCodes)}
      </span>
      <span>{getLocaleLabel(locale, labels)}</span>
    </>
  )
}

function useLocaleSwitch(
  props: LocaleSwitcherControlProps,
  useRouter: LocaleSwitcherNavigation["useRouter"],
  usePathname: LocaleSwitcherNavigation["usePathname"]
) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [pending, startTransition] = useTransition()
  const labels = props.labels ?? defaultLocaleLabels
  const regionCodes = props.regionCodes ?? defaultLocaleRegionCodes

  function switchLocale(nextLocale: string | null) {
    if (
      !nextLocale ||
      !hasLocale(defaultSupportedLocales, nextLocale) ||
      nextLocale === locale
    ) {
      return
    }

    startTransition(() => {
      router.replace(buildPathnamePreservingBrowserQuery(pathname), {
        locale: nextLocale,
      })
    })
  }

  return {
    locale,
    labels,
    regionCodes,
    pending,
    switchLocale,
    formatOption: (code: string) =>
      formatLocaleOption(code, labels, regionCodes),
  }
}

export function LocaleSwitcherCombobox({
  locales,
  useRouter,
  usePathname,
  className,
  placeholder,
  changeLanguageLabel,
  ...controlProps
}: LocaleSwitcherComboboxProps) {
  const t = useTranslations("i18n")
  const { locale, labels, regionCodes, pending, switchLocale, formatOption } =
    useLocaleSwitch(controlProps, useRouter, usePathname)

  return (
    <Combobox
      items={locales}
      value={locale}
      onValueChange={switchLocale}
      disabled={pending}
      itemToStringLabel={(code: string) => formatOption(code)}
    >
      <ComboboxInput
        className={cn("min-w-44", className)}
        placeholder={placeholder ?? t("selectLanguage")}
        aria-label={changeLanguageLabel ?? t("changeLanguage")}
        showClear={false}
      />
      <ComboboxPopup>
        <ComboboxList>
          {(code: string) => (
            <ComboboxItem key={code} value={code}>
              <LocaleOptionContent
                locale={code}
                labels={labels}
                regionCodes={regionCodes}
              />
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>{t("noLanguageFound")}</ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  )
}

function LocalePreview({
  locale,
  labels,
  regionCodes,
}: {
  locale: string
  labels: Readonly<Record<string, string>>
  regionCodes: Readonly<Record<string, string>>
}) {
  const format = useFormatter()
  const t = useTranslations("i18n")
  const [language, region] = locale.split("-")
  const languageName = language
    ? format.displayName(language, "language")
    : locale
  const regionName = region
    ? format.displayName(region.toUpperCase(), "region")
    : t("notAvailable")
  const date = format.dateTime(new Date("2026-11-07T12:00:00Z"), "shortDate")
  const number = format.number(1234567.89, "decimal")

  return (
    <div className="space-y-2">
      <div className="font-medium">
        {getLocaleFlagEmoji(locale, regionCodes)}{" "}
        {getLocaleLabel(locale, labels)}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted-foreground">
        <dt>{t("language")}</dt>
        <dd className="text-foreground">{languageName}</dd>
        <dt>{t("region")}</dt>
        <dd className="text-foreground">{regionName}</dd>
        <dt>{t("exampleDate")}</dt>
        <dd className="text-foreground">{date}</dd>
        <dt>{t("exampleNumber")}</dt>
        <dd className="text-foreground">{number}</dd>
      </dl>
    </div>
  )
}

export function LocaleSwitcherIconButton({
  locales,
  useRouter,
  usePathname,
  className,
  changeLanguageLabel,
  ...controlProps
}: LocaleSwitcherIconButtonProps) {
  const t = useTranslations("i18n")
  const { locale, labels, regionCodes, pending, switchLocale } =
    useLocaleSwitch(controlProps, useRouter, usePathname)
  return (
    <Menu>
      <PreviewCard>
        <PreviewCardTrigger
          delay={150}
          render={
            <MenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={className}
                  disabled={pending}
                  aria-label={changeLanguageLabel ?? t("changeLanguage")}
                />
              }
            />
          }
        >
          <Languages className="size-4" />
        </PreviewCardTrigger>
        <PreviewCardPopup align="end">
          <LocalePreview
            locale={locale}
            labels={labels}
            regionCodes={regionCodes}
          />
        </PreviewCardPopup>
      </PreviewCard>
      <MenuPopup align="end">
        <MenuRadioGroup
          value={locale}
          onValueChange={(value: string) => switchLocale(value)}
        >
          {locales.map((code) => (
            <MenuRadioItem key={code} value={code} disabled={pending}>
              <LocaleOptionContent
                locale={code}
                labels={labels}
                regionCodes={regionCodes}
              />
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  )
}
