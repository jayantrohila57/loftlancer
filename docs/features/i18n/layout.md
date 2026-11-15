# Layout and RTL (Cache Components)

- Routes: **`src/app/[lang]/`** (default segment `lang`).
- **`initRequestI18n(params)`** from `<slug>.i18n.server.ts` — locale, direction, and cached messages. The app `[lang]/layout.tsx` owns `<html>` and the provider tree.
- **`getServerTranslations(params, namespace)`** — pass route **`params`** under `cacheComponents`.
- RTL locales: extend **`rtlLanguageTags`** in this feature.

## App layout

```tsx
export default async function LangLayout({
  children,
  params,
}: LangLayoutProps) {
  const { direction, locale, messages } = await initRequestI18n(params)

  return (
    <html
      className={rootFontClassName()}
      dir={direction}
      lang={locale}
      suppressHydrationWarning
    >
      <body className="relative">
        <div className="relative isolate flex min-h-svh flex-col">
          <I18nProvider locale={locale} messages={messages}>
            <DirectionProvider direction={direction}>
              <ThemeProvider {...themeProviderProps}>{children}</ThemeProvider>
            </DirectionProvider>
          </I18nProvider>
        </div>
      </body>
    </html>
  )
}
```

**Locale resolution** stays in `initRequestI18n`. **Do not** pass `locale` / `messages` from `page.tsx`.

**Client boundaries:** Each app declares `I18nProvider` from `@features/i18n/provider`, `DirectionProvider`, and `ThemeProvider` directly in its root layout. Auth also declares its toast and navigation providers there.

**Prev:** [exports.md](./exports.md) · **Next:** [proxy-next.md](./proxy-next.md)
