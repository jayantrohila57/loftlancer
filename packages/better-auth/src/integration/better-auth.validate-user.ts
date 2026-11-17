import {
  DISPOSABLE_EMAIL_ERROR_CODE,
  isDisposableEmailAddress,
} from "./better-auth.disposable-email"
import { resolveBetterAuthEmailLocale } from "./better-auth.email.locale"
import { getBetterAuthEmailMessages } from "./better-auth.email.messages"

export function createDisposableEmailValidator() {
  return async function validateUserInfo(
    data: {
      user: { email?: string | null }
    },
    _context: { request?: Request }
  ) {
    const email = data.user.email?.trim().toLowerCase()
    if (!email || !isDisposableEmailAddress(email)) return
    const locale = resolveBetterAuthEmailLocale(_context.request)
    const messages = getBetterAuthEmailMessages(locale)
    return {
      error: DISPOSABLE_EMAIL_ERROR_CODE,
      errorDescription: messages.disposableEmailDescription,
    }
  }
}
