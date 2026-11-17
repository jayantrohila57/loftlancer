import domains from "disposable-email-domains"

const disposableDomains = new Set(domains.map((domain) => domain.toLowerCase()))

export const DISPOSABLE_EMAIL_ERROR_CODE = "disposable_email"

export function emailDomain(address: string): string | undefined {
  const at = address.lastIndexOf("@")
  if (at <= 0 || at === address.length - 1) return undefined
  return address
    .slice(at + 1)
    .trim()
    .toLowerCase()
}

export function isDisposableEmailAddress(email: string): boolean {
  const domain = emailDomain(email)
  if (!domain) return false
  return disposableDomains.has(domain)
}
