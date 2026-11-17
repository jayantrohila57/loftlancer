import { WebLegalDocumentPage } from "@/shared/legal/web-legal-document-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export default async function LegalCookiesPage(props: LangPageProps) {
  return WebLegalDocumentPage({ ...props, document: "cookies" })
}
