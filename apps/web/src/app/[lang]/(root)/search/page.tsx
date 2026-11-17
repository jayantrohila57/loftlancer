import type { Metadata } from "next"
import { WebSearchPage } from "@/shared/search/web-search-page"
import { createWebPageMetadata } from "@/shared/site/web-page-metadata"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata(
  props: LangPageProps
): Promise<Metadata> {
  return createWebPageMetadata(props, "searchPage")
}

type SearchRouteProps = LangPageProps & {
  readonly searchParams: Promise<{ q?: string | string[] }>
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchRouteProps) {
  const queryRaw = (await searchParams).q
  const query = Array.isArray(queryRaw) ? (queryRaw[0] ?? "") : (queryRaw ?? "")
  return WebSearchPage({ params, query })
}
