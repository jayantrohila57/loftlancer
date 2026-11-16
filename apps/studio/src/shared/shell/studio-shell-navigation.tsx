"use client"

import type { ShellNavigationBindings } from "@features/shell"
import { ShellNavigationProvider } from "@features/shell"
import type { ComponentProps, ReactNode } from "react"
import { useMemo } from "react"
import { Link, usePathname, useRouter } from "@/shared/i18n/studio.i18n"
import { rewriteStudioHref } from "@/shared/org/studio-auth-href"
import { readOrgSlugFromPathname } from "@/shared/org/studio-org.paths"

type StudioLinkProps = ComponentProps<typeof Link>

function rewriteUnknownHref(href: unknown, slug: string | null): unknown {
  if (typeof href === "string") return rewriteStudioHref(href, slug)
  if (href && typeof href === "object" && "pathname" in href) {
    const record = href as { pathname?: unknown }
    if (typeof record.pathname === "string") {
      return { ...record, pathname: rewriteStudioHref(record.pathname, slug) }
    }
  }
  return href
}

function StudioLink(props: StudioLinkProps) {
  const pathname = usePathname()
  const slug = readOrgSlugFromPathname(pathname)
  const href = rewriteUnknownHref(props.href, slug) as StudioLinkProps["href"]
  return <Link {...props} href={href} />
}

export function StudioShellNavigationProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const pathname = usePathname()
  const slug = readOrgSlugFromPathname(pathname)
  const router = useRouter()
  const boundRouter = useMemo(() => {
    return {
      ...router,
      push(href: string, options?: unknown) {
        return router.push(
          rewriteStudioHref(href, slug) as never,
          options as never
        )
      },
      replace(href: string, options?: unknown) {
        return router.replace(
          rewriteStudioHref(href, slug) as never,
          options as never
        )
      },
    }
  }, [router, slug])

  return (
    <ShellNavigationProvider
      Link={StudioLink as ShellNavigationBindings["Link"]}
      usePathname={usePathname}
      useRouter={(() => boundRouter) as ShellNavigationBindings["useRouter"]}
    >
      {children}
    </ShellNavigationProvider>
  )
}
