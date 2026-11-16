import { brand } from "@packages/brand"

import { getWebSiteFooterPublicEmailAddresses } from "@/shared/shell/web-site-footer-contact"

const footerLinkClassName =
  "text-sm text-muted-foreground transition-colors hover:text-sidebar-foreground"

const footerTextClassName = "text-sm text-pretty text-muted-foreground"

function companyDescription(): string | null {
  const text = brand.shortDescription.trim()
  return text.length > 0 ? text : null
}

export function hasWebSiteFooterCompanyDetails(): boolean {
  return (
    companyDescription() !== null ||
    getWebSiteFooterPublicEmailAddresses().length > 0
  )
}

interface WebSiteFooterCompanyDetailsInput {
  readonly emailLabel: string
}

export function WebSiteFooterCompanyDetails({
  emailLabel,
}: WebSiteFooterCompanyDetailsInput) {
  const description = companyDescription()
  const emails = getWebSiteFooterPublicEmailAddresses()

  if (!description && emails.length === 0) {
    return null
  }

  return (
    <div className="flex max-w-sm flex-col gap-2">
      {description ? (
        <p className={footerTextClassName}>{description}</p>
      ) : null}
      {emails.map((address) => (
        <p key={address} className={footerTextClassName}>
          {emailLabel}{" "}
          <a className={footerLinkClassName} href={`mailto:${address}`}>
            {address}
          </a>
        </p>
      ))}
    </div>
  )
}
