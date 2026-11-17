import { escapeHtml, resolveEmailLocaleForUserIds } from "@features/i18n/server"
import { brandEmails } from "@packages/brand"
import { sendResendEmail } from "@packages/resend"

type AppLocale = "en-us" | "en-in" | "es-es"

function ticketConfirmationCopy(
  locale: AppLocale,
  values: {
    readonly ticketId: string
    readonly subject: string
  }
) {
  const subjectEscaped = escapeHtml(values.subject)
  const idEscaped = escapeHtml(values.ticketId)
  if (locale === "es-es") {
    return {
      subject: "Hemos recibido tu solicitud de soporte",
      html: `<p>Gracias por contactar con el soporte de Loftlancer.</p><p><strong>Asunto:</strong> ${subjectEscaped}</p><p><strong>Id de ticket:</strong> ${idEscaped}</p><p>Responderemos desde ${escapeHtml(brandEmails.support)}.</p>`,
      text: `Hemos recibido tu solicitud de soporte.\n\nAsunto: ${values.subject}\nId de ticket: ${values.ticketId}\n\nResponderemos desde ${brandEmails.support}.`,
    }
  }
  return {
    subject: "We received your support request",
    html: `<p>Thanks for contacting Loftlancer support.</p><p><strong>Subject:</strong> ${subjectEscaped}</p><p><strong>Ticket id:</strong> ${idEscaped}</p><p>We will reply from ${escapeHtml(brandEmails.support)}.</p>`,
    text: `We received your support request.\n\nSubject: ${values.subject}\nTicket id: ${values.ticketId}\n\nWe will reply from ${brandEmails.support}.`,
  }
}

function ticketStaffNotificationCopy(values: {
  readonly ticketId: string
  readonly userId: string
  readonly userEmail: string
  readonly category: string
  readonly subject: string
  readonly message: string
}) {
  const body = escapeHtml(values.message).replaceAll("\n", "<br />")
  return {
    subject: `[Support] ${values.subject}`,
    html: `<p><strong>Ticket:</strong> ${escapeHtml(values.ticketId)}</p><p><strong>User:</strong> ${escapeHtml(values.userEmail)} (${escapeHtml(values.userId)})</p><p><strong>Category:</strong> ${escapeHtml(values.category)}</p><p><strong>Subject:</strong> ${escapeHtml(values.subject)}</p><p>${body}</p>`,
    text: `Ticket: ${values.ticketId}\nUser: ${values.userEmail} (${values.userId})\nCategory: ${values.category}\nSubject: ${values.subject}\n\n${values.message}`,
  }
}

export async function sendSupportTicketEmails(input: {
  readonly userId: string
  readonly userEmail: string
  readonly ticketId: string
  readonly category: string
  readonly subject: string
  readonly message: string
}) {
  const locale = await resolveEmailLocaleForUserIds({
    recipientUserId: input.userId,
  })
  const confirmation = ticketConfirmationCopy(locale, {
    ticketId: input.ticketId,
    subject: input.subject,
  })
  await sendResendEmail({
    to: input.userEmail,
    subject: confirmation.subject,
    html: confirmation.html,
    text: confirmation.text,
  })

  const staff = ticketStaffNotificationCopy(input)
  await sendResendEmail({
    to: brandEmails.support,
    subject: staff.subject,
    html: staff.html,
    text: staff.text,
  })
}
