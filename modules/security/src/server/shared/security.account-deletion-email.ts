import { escapeHtml, resolveEmailLocaleForUserIds } from "@features/i18n/server"
import { sendResendEmail } from "@packages/resend"

type AppLocale = "en-us" | "en-in" | "es-es"

function deletionCopy(
  locale: AppLocale,
  values: { readonly productName: string }
): { readonly subject: string; readonly html: string; readonly text: string } {
  const product = escapeHtml(values.productName)
  if (locale === "es-es") {
    return {
      subject: "Confirmación de eliminación de cuenta",
      html: `<p>Tu cuenta de ${product} se eliminó correctamente.</p><p>Si no solicitaste esto, contacta con soporte de inmediato.</p>`,
      text: `Tu cuenta de ${values.productName} se eliminó correctamente.\n\nSi no solicitaste esto, contacta con soporte de inmediato.`,
    }
  }
  if (locale === "en-in") {
    return {
      subject: "Account deletion confirmation",
      html: `<p>Your ${product} account has been deleted.</p><p>If you did not request this, contact support immediately.</p>`,
      text: `Your ${values.productName} account has been deleted.\n\nIf you did not request this, contact support immediately.`,
    }
  }
  return {
    subject: "Account deletion confirmation",
    html: `<p>Your ${product} account has been deleted.</p><p>If you did not request this, contact support immediately.</p>`,
    text: `Your ${values.productName} account has been deleted.\n\nIf you did not request this, contact support immediately.`,
  }
}

export async function sendAccountDeletionConfirmationEmail(input: {
  readonly to: string
  readonly userId: string
}) {
  const locale = await resolveEmailLocaleForUserIds({
    recipientUserId: input.userId,
  })
  const copy = deletionCopy(locale, { productName: "Loftlancer" })
  await sendResendEmail({
    to: input.to,
    subject: copy.subject,
    html: copy.html,
    text: copy.text,
  })
}
