import { WebRootShellLayout } from "@/shared/shell/web-root-shell-layout"
import type { LangLayoutProps } from "@/shared/types/web.app.types"

export default function WebRootRouteLayout(props: LangLayoutProps) {
  return <WebRootShellLayout {...props} />
}
