import type { ReactNode } from "react"

interface AuthAccountLayoutProps {
  readonly children: ReactNode
}

export default function AuthAccountLayout({
  children,
}: AuthAccountLayoutProps) {
  return children
}
