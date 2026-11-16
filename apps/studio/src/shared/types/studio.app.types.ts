import type { ReactNode } from "react"

/** Untrusted URL segment; initRequestI18n validates it before returning Locale. */
export type LangRouteParams = Readonly<{
  lang: string
}>

export type OrgRouteParams = Readonly<{
  lang: string
  org: string
}>

export interface LangLayoutProps {
  readonly children: ReactNode
  readonly params: Promise<LangRouteParams>
}

export interface LangPageProps {
  readonly params: Promise<LangRouteParams>
}

export interface OrgLayoutProps {
  readonly children: ReactNode
  readonly params: Promise<OrgRouteParams>
}

export interface OrgPageProps {
  readonly params: Promise<OrgRouteParams>
}
