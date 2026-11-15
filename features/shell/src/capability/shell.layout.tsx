import Shell from "@packages/ui/components/shell"
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@packages/ui/components/sidebar"
import { TooltipProvider } from "@packages/ui/components/tooltip"
import type { ReactNode } from "react"
import { SHELL_MAIN_CONTENT_ID } from "../utils/shell.a11y.constants"
import { ShellHeader } from "./shell.header"
import { ShellSkipToMainContent } from "./shell.skip-to-main"

export function ShellLayout({
  children,
  navigation,
  languageSelector,
  userMenu,
}: {
  readonly children: ReactNode
  readonly navigation: ReactNode
  readonly languageSelector?: ReactNode
  readonly userMenu?: ReactNode
}) {
  return (
    <Shell>
      <Shell.Frame>
        <TooltipProvider>
          <SidebarProvider className="flex min-h-0 w-full min-w-0 flex-1">
            <Sidebar collapsible="icon" variant="sidebar">
              {navigation}
            </Sidebar>
            <SidebarInset className="min-h-0 flex-1 p-0">
              <Shell.Inset variant="dashboard">
                <ShellSkipToMainContent />
                <ShellHeader
                  languageSelector={languageSelector}
                  userMenu={userMenu}
                />
                <Shell.Main
                  id={SHELL_MAIN_CONTENT_ID}
                  tabIndex={-1}
                  variant="dashboard"
                >
                  {children}
                </Shell.Main>
              </Shell.Inset>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </Shell.Frame>
    </Shell>
  )
}
