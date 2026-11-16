import { buildAuthSignInLocation } from "@modules/auth"
import { brandHero } from "@packages/brand"
import { Button } from "@packages/ui/components/button"
import { ArrowRight, PhoneCall, Rocket } from "lucide-react"
import { Link } from "@/shared/i18n/web.i18n"
import {
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import type { LangPageProps } from "@/shared/types/web.app.types"

function isBrandDefaultLocale(locale: string): boolean {
  return locale === "en-us" || locale === "en-in"
}

export async function WebSiteHeroSection({ params }: LangPageProps) {
  const { locale } = await initRequestI18n(params)
  const t = await getServerTranslations(params, "homeHero")
  const signInHref = buildAuthSignInLocation({ locale })

  const copy = isBrandDefaultLocale(locale)
    ? {
        badge: brandHero.badge,
        headlineLine1: brandHero.headline.line1,
        headlineLine2: brandHero.headline.line2,
        subheadLine1: brandHero.subhead.line1,
        subheadLine2: brandHero.subhead.line2,
        ctaBookCall: brandHero.cta.bookCall.label,
        ctaGetStarted: brandHero.cta.getStarted.label,
      }
    : {
        badge: t("badge"),
        headlineLine1: t("headlineLine1"),
        headlineLine2: t("headlineLine2"),
        subheadLine1: t("subheadLine1"),
        subheadLine2: t("subheadLine2"),
        ctaBookCall: t("ctaBookCall"),
        ctaGetStarted: t("ctaGetStarted"),
      }

  return (
    <section className="relative relative flex min-h-0 w-full flex-1 flex-1 flex-col p-4 sm:p-6 md:p-8">
      <div className="relative flex flex-1 flex-col items-start justify-start gap-5">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-1 size-full overflow-hidden"
        >
          <div className="absolute inset-y-0 left-4 w-px bg-border md:left-8" />
          <div className="absolute inset-y-0 right-4 w-px bg-border md:right-8" />
          <div className="absolute inset-y-0 left-8 w-px bg-border/50 md:left-12" />
          <div className="absolute inset-y-0 right-8 w-px bg-border/50 md:right-12" />
        </div>

        <Link
          className="group flex w-fit items-center gap-3 rounded-lg border bg-card px-3 py-1 shadow transition-all ease-out"
          href={brandHero.links.whatsNew}
        >
          <Rocket className="size-3 text-muted-foreground" />
          <span className="text-xs">{copy.badge}</span>
          <span className="block h-5 border-l" />
          <ArrowRight className="size-3 ease-out group-hover:translate-x-1" />
        </Link>

        <h1 className="max-w-3xl text-left font-heading text-4xl font-semibold tracking-tight text-balance text-shadow-[0_0px_50px_theme(--color-foreground/.2)] md:text-6xl lg:text-7xl">
          {copy.headlineLine1} <br />
          {copy.headlineLine2}
        </h1>

        <p className="max-w-xl text-left text-base tracking-wider text-foreground/80 sm:text-lg md:text-xl">
          {copy.subheadLine1} <br />
          {copy.subheadLine2}
        </p>

        <div className="flex flex-row flex-wrap items-center justify-start gap-3 pt-2">
          <Button
            render={<Link href={brandHero.cta.bookCall.href} />}
            size="lg"
            variant="secondary"
          >
            <PhoneCall data-icon="inline-start" />
            {copy.ctaBookCall}
          </Button>
          <Button render={<a href={signInHref} />} size="lg">
            {copy.ctaGetStarted}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
