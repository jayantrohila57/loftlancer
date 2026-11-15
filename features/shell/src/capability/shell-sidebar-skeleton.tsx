import {
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@packages/ui/components/sidebar"
import { Skeleton } from "@packages/ui/components/skeleton"

export function ShellSidebarSkeleton() {
  return (
    <div aria-hidden="true" className="flex min-h-0 flex-1 flex-col">
      <SidebarHeader className="flex h-12 flex-row items-center gap-2 px-2">
        <Skeleton className="size-8" />
      </SidebarHeader>
      <SidebarContent>
        {[
          ["overview", "profile"],
          [
            "security",
            "subscription",
            "usage",
            "billing",
            "storage",
            "privacy",
            "settings",
            "support",
          ],
        ].map((items) => (
          <SidebarGroup key={items[0]}>
            <div className="flex h-8 items-center px-2 group-data-[collapsible=icon]:hidden">
              <Skeleton className="h-3 w-16" />
            </div>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item}>
                  <div className="flex h-8 items-center gap-2 px-2">
                    <Skeleton className="size-4 shrink-0" />
                    <Skeleton className="h-4 w-24 group-data-[collapsible=icon]:hidden" />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </div>
  )
}
