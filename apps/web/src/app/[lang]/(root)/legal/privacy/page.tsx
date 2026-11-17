import { WebLegalDocumentPage } from "@/shared/legal/web-legal-document-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export default async function LegalPrivacyPage(props: LangPageProps) {
  return WebLegalDocumentPage({ ...props, document: "privacy" })
}
