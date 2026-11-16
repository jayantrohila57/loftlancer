import {
  brandContact,
  brandEmails,
  brandLinks,
  brandSocial,
} from "@packages/brand"

const footerLinkClassName =
  "text-sm text-muted-foreground transition-colors hover:text-sidebar-foreground"

const footerTextClassName = "text-sm text-pretty text-muted-foreground"

export type WebSiteFooterContactLabelKey =
  | "footerContactGitHub"
  | "footerContactLinkedIn"
  | "footerContactStatus"
  | "footerContactSupport"
  | "footerContactWebsite"
  | "footerContactX"

type FooterContactTranslate = (key: WebSiteFooterContactLabelKey) => string

export type FooterContactItem =
  | {
      readonly id: string
      readonly kind: "link"
      readonly href: string
      readonly labelKey: WebSiteFooterContactLabelKey
    }
  | {
      readonly id: string
      readonly kind: "mailto" | "tel"
      readonly href: string
      readonly text: string
    }
  | {
      readonly id: string
      readonly kind: "text"
      readonly text: string
    }

function nullableText(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function emailAddress(value: string): string {
  const angled = value.match(/<([^>]+)>/)
  return (angled?.[1] ?? value).trim()
}

function isPublicEmail(value: string | null | undefined): value is string {
  if (!nonEmptyString(value)) {
    return false
  }
  const address = emailAddress(value)
  if (!address.includes("@")) {
    return false
  }
  if (address.toLowerCase() === brandEmails.noreply.toLowerCase()) {
    return false
  }
  return !address.toLowerCase().startsWith("noreply@")
}

export function getWebSiteFooterPublicEmailAddresses(): readonly string[] {
  const emailCandidates = [
    nullableText(brandEmails.support),
    nullableText(brandContact.emails.support),
    nullableText(brandEmails.contact),
    nullableText(brandContact.emails.contact),
  ]
  const publicEmails = emailCandidates.filter(isPublicEmail).map(emailAddress)
  return [...new Set(publicEmails)]
}

function socialUrl(
  value: { readonly url: string } | string | null
): string | null {
  if (!value) {
    return null
  }
  if (typeof value === "string") {
    return nonEmptyString(value) ? value : null
  }
  return nonEmptyString(value.url) ? value.url : null
}

export function getWebSiteFooterContactItems(): readonly FooterContactItem[] {
  const items: FooterContactItem[] = []

  if (nonEmptyString(brandLinks.website)) {
    items.push({
      id: "website",
      kind: "link",
      href: brandLinks.website,
      labelKey: "footerContactWebsite",
    })
  }

  const githubUrl = socialUrl(brandSocial.github) ?? brandLinks.github
  if (nonEmptyString(githubUrl)) {
    items.push({
      id: "github",
      kind: "link",
      href: githubUrl,
      labelKey: "footerContactGitHub",
    })
  }

  const supportUrl =
    brandContact.supportChannel.url ??
    brandLinks.issues ??
    brandSocial.github.issues
  if (nonEmptyString(supportUrl)) {
    items.push({
      id: "support",
      kind: "link",
      href: supportUrl,
      labelKey: "footerContactSupport",
    })
  }

  if (nonEmptyString(brandLinks.status)) {
    items.push({
      id: "status",
      kind: "link",
      href: brandLinks.status,
      labelKey: "footerContactStatus",
    })
  }

  for (const address of getWebSiteFooterPublicEmailAddresses()) {
    items.push({
      id: `email-${address}`,
      kind: "mailto",
      href: `mailto:${address}`,
      text: address,
    })
  }

  const phone = nullableText(brandContact.phone)
  if (nonEmptyString(phone)) {
    const tel = phone.replace(/[^\d+]/g, "")
    items.push({
      id: "phone",
      kind: "tel",
      href: tel ? `tel:${tel}` : phone,
      text: phone,
    })
  }

  const address = nullableText(brandContact.address)
  if (nonEmptyString(address)) {
    items.push({
      id: "address",
      kind: "text",
      text: address,
    })
  }

  const xUrl = socialUrl(brandSocial.x)
  if (nonEmptyString(xUrl)) {
    items.push({
      id: "x",
      kind: "link",
      href: xUrl,
      labelKey: "footerContactX",
    })
  }

  const linkedinUrl = socialUrl(brandSocial.linkedin)
  if (nonEmptyString(linkedinUrl)) {
    items.push({
      id: "linkedin",
      kind: "link",
      href: linkedinUrl,
      labelKey: "footerContactLinkedIn",
    })
  }

  return items
}

interface WebSiteFooterContactItemInput {
  readonly item: FooterContactItem
  readonly translate: FooterContactTranslate
}

export function WebSiteFooterContactItem({
  item,
  translate,
}: WebSiteFooterContactItemInput) {
  if (item.kind === "text") {
    return (
      <p className={`${footerTextClassName} whitespace-pre-line`}>
        {item.text}
      </p>
    )
  }

  const label = item.kind === "link" ? translate(item.labelKey) : item.text

  if (item.kind === "link") {
    return (
      <a
        className={footerLinkClassName}
        href={item.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {label}
      </a>
    )
  }

  return (
    <a className={footerLinkClassName} href={item.href}>
      {label}
    </a>
  )
}
