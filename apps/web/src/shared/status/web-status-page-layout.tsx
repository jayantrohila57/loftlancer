import Shell from "@packages/ui/components/shell"

type WebStatusPageLayoutInput = {
  readonly eyebrow: string
  readonly title: string
  readonly subtitle: string
  readonly children: React.ReactNode
}

export function WebStatusPageLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: WebStatusPageLayoutInput) {
  return (
    <Shell.Section className="min-h-screen" variant="site">
      <section className="mx-auto flex min-h-screen w-full flex-col gap-10 px-4 pt-8 pb-20 sm:px-6 md:py-12 md:pb-24">
        <header className="flex max-w-3xl flex-col items-start gap-3 self-start text-left">
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        </header>
        {children}
      </section>
    </Shell.Section>
  )
}
