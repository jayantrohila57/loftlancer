import type { BrandedEmailCopy } from "./better-auth.email-template"

type MagicLinkEmailLocale = "en-us" | "en-in" | "es-es"

const MAGIC_LINK_COPY: Record<MagicLinkEmailLocale, BrandedEmailCopy> = {
  "en-us": {
    subject: "Your Loftlancer sign-in link",
    preview: "Sign in to Loftlancer",
    heading: "Sign in to Loftlancer",
    body: "Use the button below to sign in. This link expires soon and works once.",
    cta: "Sign in",
    plainText: "Sign in to Loftlancer: {url}",
    ignore: "If you did not request this email, you can ignore it.",
  },
  "en-in": {
    subject: "Your Loftlancer sign-in link",
    preview: "Sign in to Loftlancer",
    heading: "Sign in to Loftlancer",
    body: "Use the button below to sign in. This link expires soon and works once.",
    cta: "Sign in",
    plainText: "Sign in to Loftlancer: {url}",
    ignore: "If you did not request this email, you can ignore it.",
  },
  "es-es": {
    subject: "Tu enlace de acceso a Loftlancer",
    preview: "Accede a Loftlancer",
    heading: "Accede a Loftlancer",
    body: "Usa el botón para iniciar sesión. El enlace caduca pronto y solo sirve una vez.",
    cta: "Iniciar sesión",
    plainText: "Accede a Loftlancer: {url}",
    ignore: "Si no solicitaste este correo, puedes ignorarlo.",
  },
}

export function resolveMagicLinkEmailCopy(
  locale: string | undefined
): BrandedEmailCopy {
  const normalized = locale?.trim().toLowerCase()
  if (normalized === "es-es") return MAGIC_LINK_COPY["es-es"]
  if (normalized === "en-in") return MAGIC_LINK_COPY["en-in"]
  if (normalized === "en-us") return MAGIC_LINK_COPY["en-us"]
  return MAGIC_LINK_COPY["en-us"]
}
