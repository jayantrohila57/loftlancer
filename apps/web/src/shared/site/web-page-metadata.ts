import type { Metadata } from "next"
import {
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import type { LangPageProps } from "@/shared/types/web.app.types"

type WebPageMetadataNamespace = string

export async function createWebPageMetadata(
  { params }: LangPageProps,
  namespace: WebPageMetadataNamespace
): Promise<Metadata> {
  await initRequestI18n(params)
  const t = await getServerTranslations(params, namespace)
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}