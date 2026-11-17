import type { BetterAuthEmailLocale } from "./better-auth.email.locale"
import type { BrandedEmailCopy } from "./better-auth.email-template"

export type BetterAuthEmailMessageSet = {
  readonly magicLinkBranded: BrandedEmailCopy
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

const magicLinkBrandedEn: BrandedEmailCopy = {
  subject: "Your Loftlancer sign-in link",
  preview: "Sign in to Loftlancer",
  heading: "Sign in to Loftlancer",
  body: "Use the button below to sign in. This link expires soon and works once.",
  cta: "Sign in",
  plainText: "Sign in to Loftlancer: {url}",
  ignore: "If you did not request this email, you can ignore it.",
}

const magicLinkBrandedEs: BrandedEmailCopy = {
  subject: "Tu enlace de acceso a Loftlancer",
  preview: "Accede a Loftlancer",
  heading: "Accede a Loftlancer",
  body: "Usa el botón para iniciar sesión. El enlace caduca pronto y solo sirve una vez.",
  cta: "Iniciar sesión",
  plainText: "Accede a Loftlancer: {url}",
  ignore: "Si no solicitaste este correo, puedes ignorarlo.",
}

const messages: Record<BetterAuthEmailLocale, BetterAuthEmailMessageSet> = {
  "en-us": {
    magicLinkBranded: magicLinkBrandedEn,
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
    magicLinkBranded: magicLinkBrandedEn,
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
    magicLinkBranded: magicLinkBrandedEs,
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
