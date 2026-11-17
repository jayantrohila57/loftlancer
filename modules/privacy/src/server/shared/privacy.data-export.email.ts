import { escapeHtml, resolveEmailLocaleForUserIds } from "@features/i18n/server"
import { sendResendEmail } from "@packages/resend"

type AppLocale = "en-us" | "en-in" | "es-es"

function exportReadyCopy(
  locale: AppLocale,
  values: { readonly downloadUrl: string; readonly expiresAt: string }
) {
  const url = escapeHtml(values.downloadUrl)
  const expires = escapeHtml(values.expiresAt)
  if (locale === "es-es") {
    return {
      subject: "Tu exportación de datos está lista",
      html: `<p>Tu paquete de exportación de datos de Loftlancer está listo.</p><p><a href="${url}">Descargar exportación</a></p><p>Este enlace caduca el ${expires}.</p>`,
      text: `Tu exportación de datos está lista.\n\nDescargar: ${values.downloadUrl}\n\nCaduca: ${values.expiresAt}`,
    }
  }
  return {
    subject: "Your data export is ready",
    html: `<p>Your Loftlancer data export package is ready.</p><p><a href="${url}">Download export</a></p><p>This link expires on ${expires}.</p>`,
    text: `Your data export is ready.\n\nDownload: ${values.downloadUrl}\n\nExpires: ${values.expiresAt}`,
  }
}

export async function sendPrivacyDataExportReadyEmail(input: {
  readonly to: string
  readonly userId: string
  readonly downloadUrl: string
  readonly expiresAt: string
}) {
  const locale = await resolveEmailLocaleForUserIds({
    recipientUserId: input.userId,
  })
  const copy = exportReadyCopy(locale, {
    downloadUrl: input.downloadUrl,
    expiresAt: input.expiresAt,
  })
  await sendResendEmail({
    to: input.to,
    subject: copy.subject,
    html: copy.html,
    text: copy.text,
  })
}
