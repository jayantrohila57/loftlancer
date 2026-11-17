import { brandContact, brandEmails } from "@packages/brand"
import Shell from "@packages/ui/components/shell"
import { WebContactForm } from "@/shared/contact/web-contact-form.client"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import type { LangPageProps } from "@/shared/types/web.app.types"

type ContentSection = {
  readonly heading: string
  readonly paragraphs: readonly string[]
}

export async function WebContactPage({ params }: LangPageProps) {
  const t = await getServerTranslations(params, "contactPage")
  const formT = await getServerTranslations(params, "contactPage.form")
  const labels = {
    name: formT("name"),
    email: formT("email"),
    topic: formT("topic"),
    message: formT("message"),
    consent: formT("consent"),
    submit: formT("submit"),
    success: formT("success"),
    topicOptions: {
      sales: formT("topicOptions.sales"),
      support: formT("topicOptions.support"),
      billing: formT("topicOptions.billing"),
      privacy: formT("topicOptions.privacy"),
      security: formT("topicOptions.security"),
      press: formT("topicOptions.press"),
      other: formT("topicOptions.other"),
    },
    error: {
      validation: formT("error.validation"),
      rateLimited: formT("error.rateLimited"),
      sendFailed: formT("error.sendFailed"),
    },
  }
  const sections = t.raw("sections") as readonly ContentSection[]

  return (
    <Shell.Section className="min-h-screen px-6 py-16" variant="site">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 pb-16">
        <header className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-base text-pretty text-muted-foreground">
            {t("description")}
          </p>
        </header>
        {sections.map((section) => (
          <section className="space-y-3" key={section.heading}>
            <h2 className="text-lg font-semibold tracking-tight">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                className="text-sm text-pretty text-muted-foreground"
                key={paragraph.slice(0, 48)}
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        <WebContactForm labels={labels} />
        <aside className="space-y-3 text-sm text-muted-foreground">
          <p>{formT("responseTime")}</p>
          <ul className="space-y-1">
            <li>
              <a
                className="text-primary underline-offset-4 hover:underline"
                href={`mailto:${brandEmails.support}`}
              >
                {formT("emailList.supportLine", {
                  email: formT("directEmails.support"),
                })}
              </a>
            </li>
            <li>
              <a
                className="text-primary underline-offset-4 hover:underline"
                href={`mailto:${brandEmails.privacy}`}
              >
                {formT("emailList.privacyLine", {
                  email: formT("directEmails.privacy"),
                })}
              </a>
            </li>
            <li>
              <a
                className="text-primary underline-offset-4 hover:underline"
                href={`mailto:${formT("directEmails.security")}`}
              >
                {formT("emailList.securityLine", {
                  email: formT("directEmails.security"),
                })}
              </a>
            </li>
          </ul>
          <p className="text-xs">
            {formT("operatorNote", {
              legalName: brandContact.legalName ?? "Loftlancer",
            })}
          </p>
        </aside>
      </div>
    </Shell.Section>
  )
}
