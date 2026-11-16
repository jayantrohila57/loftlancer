import { brand } from "@packages/brand"
import { SHELL_HEADER_HEIGHT } from "@packages/ui"
import Shell from "@packages/ui/components/shell"
import { cn } from "@packages/ui/lib/utils"
import { ShipCargo } from "lucide-react"
import type { ReactNode } from "react"
import { serverEnv } from "@/shared/config/web.server-env"
import { Link } from "@/shared/i18n/web.i18n"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import {
  hasWebSiteFooterCompanyDetails,
  WebSiteFooterCompanyDetails,
} from "@/shared/shell/web-site-footer-company-details"
import type { WebSiteFooterContactLabelKey } from "@/shared/shell/web-site-footer-contact"
import {
  getWebSiteFooterContactItems,
  WebSiteFooterContactItem,
} from "@/shared/shell/web-site-footer-contact"
import { WebSiteFooterCopyright } from "@/shared/shell/web-site-footer-copyright"
import { WebSiteFooterLegalBarActions } from "@/shared/shell/web-site-footer-legal-bar-actions"
import { WebSiteFooterStatus } from "@/shared/shell/web-site-footer-status"
import type {
  WebSiteFooterNavColumn as WebSiteFooterNavColumnSpec,
  WebSiteNavLabelKey,
} from "@/shared/shell/web-site-navigation"
import {
  getWebSiteFooterNavColumnHeadingKey,
  getWebSiteNavItemSpecsForFooterColumn,
  WEB_SITE_FOOTER_NAV_COLUMNS,
} from "@/shared/shell/web-site-navigation"
import type { LangLayoutProps } from "@/shared/types/web.app.types"

const footerLinkClassName =
  "text-sm text-muted-foreground transition-colors hover:text-sidebar-foreground"

export async function WebSiteFooter({
  params,
}: Pick<LangLayoutProps, "params">) {
  const t = await getServerTranslations(params, "siteShell")
  const rssHref = new URL("/feed.xml", serverEnv.APP_PUBLIC_URL).href

  return (
    <Shell.Footer className="bg-sidebar p-4">
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.25fr)_minmax(0,6fr)] md:gap-0">
          <WebSiteFooterBrand
            className="md:pr-8"
            emailLabel={t("footerCompanyEmail")}
            siteName={brand.name}
            tagline={t("footerTagline")}
          />
          <div
            className={cn(
              "flex flex-col gap-8 border-t border-border pt-8",
              "md:grid md:grid-cols-6 md:gap-8 md:border-t-0 md:border-l md:pt-0 md:pl-8"
            )}
          >
            {WEB_SITE_FOOTER_NAV_COLUMNS.map((column) => (
              <WebSiteFooterNavColumn
                key={
                  column.kind === "group"
                    ? column.group
                    : `legal-${column.legalSubGroup}`
                }
                column={column}
                heading={t(getWebSiteFooterNavColumnHeadingKey(column))}
                navLabel={t("navFooter")}
                translate={(key) => t(key)}
              />
            ))}
          </div>
        </div>
        <WebSiteFooterLegalBar
          copyright={<WebSiteFooterCopyright siteName={brand.name} />}
        >
          <div className="flex shrink-0 items-center gap-3">
            <WebSiteFooterStatus params={params} />
            <WebSiteFooterLegalBarActions rssHref={rssHref} />
          </div>
        </WebSiteFooterLegalBar>
      </div>
    </Shell.Footer>
  )
}

interface WebSiteFooterBrandInput {
  readonly className?: string
  readonly emailLabel: string
  readonly siteName: string
  readonly tagline: string
}

function WebSiteFooterBrand({
  className,
  emailLabel,
  siteName,
  tagline,
}: WebSiteFooterBrandInput) {
  const showBrandDetails = hasWebSiteFooterCompanyDetails()

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Link
        className="inline-flex w-fit shrink-0 items-center gap-2 font-medium text-sidebar-foreground"
        href="/"
      >
        <ShipCargo aria-hidden className="size-5 shrink-0" />
        {siteName}
      </Link>
      {showBrandDetails ? (
        <WebSiteFooterCompanyDetails emailLabel={emailLabel} />
      ) : (
        <p className="max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
          {tagline}
        </p>
      )}
    </div>
  )
}

interface WebSiteFooterNavColumnInput {
  readonly column: WebSiteFooterNavColumnSpec
  readonly heading: string
  readonly navLabel: string
  readonly translate: (
    key: WebSiteNavLabelKey | WebSiteFooterContactLabelKey
  ) => string
}

function WebSiteFooterNavColumn({
  column,
  heading,
  navLabel,
  translate,
}: WebSiteFooterNavColumnInput) {
  const items = getWebSiteNavItemSpecsForFooterColumn(column)
  const isCompanyColumn = column.kind === "group" && column.group === "company"
  const contactItems = isCompanyColumn ? getWebSiteFooterContactItems() : []

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-sidebar-foreground">
        {heading}
      </h2>
      <nav aria-label={`${navLabel}: ${heading}`}>
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.id}>
              <Link className={footerLinkClassName} href={item.href}>
                {translate(item.labelKey)}
              </Link>
            </li>
          ))}
          {contactItems.map((item) => (
            <li key={item.id}>
              <WebSiteFooterContactItem item={item} translate={translate} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

interface WebSiteFooterLegalBarInput {
  readonly copyright: ReactNode
  readonly children?: ReactNode
}

function WebSiteFooterLegalBar({
  copyright,
  children,
}: WebSiteFooterLegalBarInput) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-2 border-t border-border px-2",
        SHELL_HEADER_HEIGHT
      )}
    >
      <p className="min-w-0 text-sm text-muted-foreground">{copyright}</p>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  )
}
