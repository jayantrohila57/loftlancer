import { decodePathSegment } from "./shell-breadcrumb-label.utils"

export interface ShellBreadcrumbItem {
  href: string
  label: string
}

export function generateBreadcrumbs(pathname: string): ShellBreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean)
  return segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join("/")}`,
    label: decodePathSegment(segment) || segment,
  }))
}

export function compressBreadcrumbs(items: ShellBreadcrumbItem[]): {
  visible: ShellBreadcrumbItem[]
  hidden: ShellBreadcrumbItem[]
} {
  if (items.length <= 3) return { visible: items, hidden: [] }
  const first = items[0]
  const secondLast = items[items.length - 2]
  const last = items[items.length - 1]
  if (!first || !secondLast || !last) return { visible: items, hidden: [] }
  return {
    visible: [first, secondLast, last],
    hidden: items.slice(1, -2),
  }
}
