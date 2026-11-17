"use server"

import { brandEmails, brandLegal } from "@packages/brand"
import { sendResendEmail } from "@packages/resend"
import { headers } from "next/headers"
import { serverEnv } from "@/shared/config/web.server-env"
import { assertWebContactRateLimit } from "@/shared/contact/web-contact-rate-limit"
import { webContactFormSchema } from "@/shared/contact/web-contact.schema"

export type WebContactActionState =
  | { readonly status: "idle" }
  | { readonly status: "success" }
  | { readonly status: "error"; readonly code: string }

const initialState: WebContactActionState = { status: "idle" }

function resolveSupportInbox(): string {
  return serverEnv.SUPPORT_EMAIL ?? brandEmails.support
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export async function submitWebContactForm(
  _prev: WebContactActionState,
  formData: FormData
): Promise<WebContactActionState> {
  const parsed = webContactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic"),
    message: formData.get("message"),
    consent: formData.get("consent") === "on",
    companyWebsite: String(formData.get("companyWebsite") ?? ""),
  })

  if (!parsed.success) {
    return { status: "error", code: "validation" }
  }

  if (parsed.data.companyWebsite) {
    return { status: "success" }
  }

  const headerList = await headers()
  const forwarded = headerList.get("x-forwarded-for")
  const clientIp = forwarded?.split(",")[0]?.trim() ?? "unknown"
  const rate = await assertWebContactRateLimit(clientIp)
  if (!rate.allowed) {
    return { status: "error", code: "rateLimited" }
  }

  const { name, email, topic, message } = parsed.data
  const inbox = resolveSupportInbox()
  const subject = `[Loftlancer contact] ${topic} — ${name}`

  const text = [
    `Topic: ${topic}`,
    `From: ${name} <${email}>`,
    "",
    message,
    "",
    `Submitted: ${new Date().toISOString()}`,
    `IP: ${clientIp}`,
  ].join("\n")

  const html = [
    `<p><strong>Topic:</strong> ${escapeHtml(topic)}</p>`,
    `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>`,
    `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    `<p><small>Submitted ${new Date().toISOString()} · IP ${escapeHtml(clientIp)}</small></p>`,
    `<p><small>Draft policy version ${brandLegal.termsVersion}</small></p>`,
  ].join("")

  try {
    await sendResendEmail({
      to: inbox,
      subject,
      html,
      text,
    })
    return { status: "success" }
  } catch {
    return { status: "error", code: "sendFailed" }
  }
}

export { initialState as webContactActionInitialState }