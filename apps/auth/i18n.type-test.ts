import type { Locale, Messages, useFormatter, useTranslations } from "next-intl"
import type {
  I18nLocale,
  I18nMessages,
  i18nFormats,
} from "@/shared/i18n/auth.i18n"

type Assert<T extends true> = T
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false

type Formatter = ReturnType<typeof useFormatter>
type NumberFormat = Extract<Parameters<Formatter["number"]>[1], string>
type DateTimeFormat = Extract<Parameters<Formatter["dateTime"]>[1], string>
type ListFormat = Extract<Parameters<Formatter["list"]>[1], string>
type DisplayNameFormat = Extract<
  Parameters<Formatter["displayName"]>[1],
  string
>

export type I18nAugmentationAssertions = [
  Assert<Equal<Locale, I18nLocale>>,
  Assert<Equal<string extends Locale ? true : false, false>>,
  Assert<Equal<Messages, I18nMessages>>,
  Assert<Equal<NumberFormat, keyof typeof i18nFormats.number>>,
  Assert<Equal<DateTimeFormat, keyof typeof i18nFormats.dateTime>>,
  Assert<Equal<ListFormat, keyof typeof i18nFormats.list>>,
  Assert<Equal<DisplayNameFormat, keyof typeof i18nFormats.displayName>>,
]

// Compiled with this app's own augmentation; never imported at runtime.
export function verifyI18nTypes(
  format: Formatter,
  t: ReturnType<typeof useTranslations>
) {
  format.number(1234.5, "usd")
  format.dateTime(0, "shortDate")
  format.list(["one", "two"], "conjunction")
  format.displayName("IN", "region")
  // @ts-expect-error Unknown message keys must fail.
  t("__invalid_i18n_key__")
  // @ts-expect-error Unknown named formats must fail.
  format.number(1, "__invalid_format__")
  // @ts-expect-error Unsupported locales must fail.
  const invalidLocale: Locale = "__invalid_locale__"
  return invalidLocale
}
