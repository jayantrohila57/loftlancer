import { SHELL_MAIN_CONTENT_ID, ShellSkipToMainContent } from "@features/shell"
import Shell from "@packages/ui/components/shell"
import { TooltipProvider } from "@packages/ui/components/tooltip"
import { WebSiteFooter } from "@/shared/shell/web-site-footer"
import { WebSiteHeader } from "@/shared/shell/web-site-header"
import { WebSiteShellCommandMenu } from "@/shared/shell/web-site-shell-command-menu"
import type { LangLayoutProps } from "@/shared/types/web.app.types"

export async function WebRootShellLayout({
  children,
  params,
}: LangLayoutProps) {
  return (
    <WebSiteShellCommandMenu>
      <Shell>
        <Shell.Frame variant="site">
          <TooltipProvider>
            <Shell.Inset className="w-full" variant="site">
              <ShellSkipToMainContent />
              <WebSiteHeader params={params} />
              <Shell.Main
                id={SHELL_MAIN_CONTENT_ID}
                tabIndex={-1}
                variant="site"
              >
                {children}
              </Shell.Main>
              <WebSiteFooter params={params} />
            </Shell.Inset>
          </TooltipProvider>
        </Shell.Frame>
      </Shell>
    </WebSiteShellCommandMenu>
  )
}
