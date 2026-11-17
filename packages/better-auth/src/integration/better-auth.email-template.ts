import { escapeHtmlAttribute } from "./better-auth.email.escape"

export type BrandedEmailCopy = {
  readonly preview: string
  readonly heading: string
  readonly body: string
  readonly cta: string
  readonly ignore: string
  readonly subject: string
  readonly plainText: string
}

export { escapeHtmlAttribute }

export function buildBrandedEmailHtml(input: {
  readonly copy: BrandedEmailCopy
  readonly actionUrl: string
}): string {
  const safeUrl = escapeHtmlAttribute(input.actionUrl)
  const safeHeading = escapeHtmlAttribute(input.copy.heading)
  const safeBody = escapeHtmlAttribute(input.copy.body)
  const safeCta = escapeHtmlAttribute(input.copy.cta)
  const safePreview = escapeHtmlAttribute(input.copy.preview)
  const safeIgnore = escapeHtmlAttribute(input.copy.ignore)

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeHeading}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#18181b;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreview}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:32px;">
            <tr>
              <td style="font-size:20px;font-weight:600;padding-bottom:8px;">Loftlancer</td>
            </tr>
            <tr>
              <td style="font-size:18px;font-weight:600;padding-bottom:12px;">${safeHeading}</td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.5;padding-bottom:24px;color:#3f3f46;">${safeBody}</td>
            </tr>
            <tr>
              <td style="padding-bottom:24px;">
                <a href="${safeUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 20px;border-radius:8px;">${safeCta}</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;line-height:1.5;color:#71717a;">${safeIgnore}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function buildBrandedEmailPlainText(input: {
  readonly copy: BrandedEmailCopy
  readonly actionUrl: string
}): string {
  return [
    input.copy.plainText.replace("{url}", input.actionUrl),
    "",
    input.copy.ignore,
  ].join("\n")
}
