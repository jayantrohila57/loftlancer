import type { BetterAuthEmailLocale } from "./better-auth.email.locale"

export type BetterAuthEmailMessageSet = {
  readonly magicLinkSubject: string
  readonly magicLinkHtml: (url: string) => string
  readonly magicLinkText: (url: string) => string
  readonly verifyEmailSubject: string
  readonly verifyEmailHtml: (url: string) => string
  readonly verifyEmailText: (url: string) => string
  readonly changeEmailConfirmSubject: string
  readonly changeEmailConfirmHtml: (params: {
    newEmail: string
    url: string
  }) => string
  readonly changeEmailConfirmText: (params: {
    newEmail: string
    url: string
  }) => string
  readonly disposableEmailDescription: string
}

const messages: Record<BetterAuthEmailLocale, BetterAuthEmailMessageSet> = {
  "en-us": {
    magicLinkSubject: "Your Loftlancer sign-in link",
    magicLinkHtml: (url) =>
      `<p><a href="${url}">Sign in to Loftlancer</a></p><p>If you did not request this email, you can ignore it.</p>`,
    magicLinkText: (url) =>
      `Sign in to Loftlancer: ${url}\n\nIf you did not request this email, you can ignore it.`,
    verifyEmailSubject: "Verify your Loftlancer email",
    verifyEmailHtml: (url) =>
      `<p>Confirm your email address for Loftlancer.</p><p><a href="${url}">Verify email</a></p>`,
    verifyEmailText: (url) =>
      `Confirm your email address for Loftlancer.\n\nVerify email: ${url}`,
    changeEmailConfirmSubject: "Confirm your Loftlancer email change",
    changeEmailConfirmHtml: ({ newEmail, url }) =>
      `<p>We received a request to change your Loftlancer email to <strong>${newEmail}</strong>.</p><p><a href="${url}">Confirm this change</a></p><p>If this was not you, ignore this message.</p>`,
    changeEmailConfirmText: ({ newEmail, url }) =>
      `We received a request to change your Loftlancer email to ${newEmail}.\n\nConfirm: ${url}\n\nIf this was not you, ignore this message.`,
    disposableEmailDescription:
      "Disposable email addresses cannot be used for Loftlancer accounts.",
  },
  "en-in": {
    magicLinkSubject: "Your Loftlancer sign-in link",
    magicLinkHtml: (url) =>
      `<p><a href="${url}">Sign in to Loftlancer</a></p><p>If you did not request this email, you can ignore it.</p>`,
    magicLinkText: (url) =>
      `Sign in to Loftlancer: ${url}\n\nIf you did not request this email, you can ignore it.`,
    verifyEmailSubject: "Verify your Loftlancer email",
    verifyEmailHtml: (url) =>
      `<p>Confirm your email address for Loftlancer.</p><p><a href="${url}">Verify email</a></p>`,
    verifyEmailText: (url) =>
      `Confirm your email address for Loftlancer.\n\nVerify email: ${url}`,
    changeEmailConfirmSubject: "Confirm your Loftlancer email change",
    changeEmailConfirmHtml: ({ newEmail, url }) =>
      `<p>We received a request to change your Loftlancer email to <strong>${newEmail}</strong>.</p><p><a href="${url}">Confirm this change</a></p><p>If this was not you, ignore this message.</p>`,
    changeEmailConfirmText: ({ newEmail, url }) =>
      `We received a request to change your Loftlancer email to ${newEmail}.\n\nConfirm: ${url}\n\nIf this was not you, ignore this message.`,
    disposableEmailDescription:
      "Disposable email addresses cannot be used for Loftlancer accounts.",
  },
  "es-es": {
    magicLinkSubject: "Tu enlace de acceso a Loftlancer",
    magicLinkHtml: (url) =>
      `<p><a href="${url}">Inicia sesión en Loftlancer</a></p><p>Si no solicitaste este correo, ignóralo.</p>`,
    magicLinkText: (url) =>
      `Inicia sesión en Loftlancer: ${url}\n\nSi no solicitaste este correo, ignóralo.`,
    verifyEmailSubject: "Verifica tu correo de Loftlancer",
    verifyEmailHtml: (url) =>
      `<p>Confirma tu dirección de correo en Loftlancer.</p><p><a href="${url}">Verificar correo</a></p>`,
    verifyEmailText: (url) =>
      `Confirma tu dirección de correo en Loftlancer.\n\nVerificar correo: ${url}`,
    changeEmailConfirmSubject: "Confirma el cambio de correo en Loftlancer",
    changeEmailConfirmHtml: ({ newEmail, url }) =>
      `<p>Hemos recibido una solicitud para cambiar tu correo de Loftlancer a <strong>${newEmail}</strong>.</p><p><a href="${url}">Confirmar este cambio</a></p><p>Si no fuiste tú, ignora este mensaje.</p>`,
    changeEmailConfirmText: ({ newEmail, url }) =>
      `Hemos recibido una solicitud para cambiar tu correo de Loftlancer a ${newEmail}.\n\nConfirmar: ${url}\n\nSi no fuiste tú, ignora este mensaje.`,
    disposableEmailDescription:
      "No se pueden usar direcciones de correo desechables en Loftlancer.",
  },
}

export function getBetterAuthEmailMessages(
  locale: BetterAuthEmailLocale
): BetterAuthEmailMessageSet {
  return messages[locale] ?? messages["en-us"]
}
