"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@loftlancer/ui/sidebar";
import {
  ActivityIcon,
  BellIcon,
  BookOpenIcon,
  CircleHelpIcon,
  FolderClosedIcon,
  LifeBuoyIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { accountSettingsUrl } from "@/lib/account-url";
import { routes } from "@/utils/navigation";

const primaryItems = [
  { label: "Overview", href: routes.overview(), icon: FolderClosedIcon },
  { label: "Activity", href: routes.activity(), icon: ActivityIcon },
  { label: "Notifications", href: routes.notifications(), icon: BellIcon },
] as const;

const footerItems = [
  { label: "Help Center", href: routes.supportHelp(), icon: CircleHelpIcon },
  { label: "Documentation", href: "/docs" as Route, icon: BookOpenIcon },
  { label: "Support", href: routes.supportTickets(), icon: LifeBuoyIcon },
  {
    label: "Settings",
    href: accountSettingsUrl() as Route,
    icon: SettingsIcon,
  },
  {
    label: "Account",
    href: accountSettingsUrl("/settings/profile") as Route,
    icon: UserIcon,
  },
] as const;

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="px-2 py-1 font-semibold text-sm">Loftlancer</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={<Link href={item.href as Route} />}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {footerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={String(item.href)}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
