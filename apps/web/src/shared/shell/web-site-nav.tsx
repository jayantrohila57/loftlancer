"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@packages/ui/components/navigation-menu"
import { cn } from "@packages/ui/lib/utils"
import type { LucideIcon } from "lucide-react"
import {
  Accessibility,
  BadgeCheck,
  BarChart3,
  CircleQuestionMark,
  Code,
  Cookie,
  FileText,
  Globe,
  Handshake,
  HelpCircle,
  House,
  Layers,
  Leaf,
  Mail,
  Map as MapIcon,
  Plug,
  RotateCcw,
  Scale,
  ScrollText,
  Search,
  Shield,
  Star,
  TriangleAlert,
  UserPlus,
  Users,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/shared/i18n/web.i18n"
import type {
  WebSiteNavDescriptionKey,
  WebSiteNavGroup,
  WebSiteNavIconName,
  WebSiteNavItemSpec,
  WebSiteNavLabelKey,
} from "@/shared/shell/web-site-navigation"
import {
  getWebSiteNavItemSpecById,
  getWebSiteNavItemSpecsForHeaderDropdown,
  isWebSiteNavItemActive,
  WEB_SITE_HEADER_DROPDOWN_GROUPS,
  WEB_SITE_NAV_GROUP_HEADING_KEYS,
} from "@/shared/shell/web-site-navigation"

const webSiteNavIcons: Record<WebSiteNavIconName, LucideIcon> = {
  accessibility: Accessibility,
  "badge-check": BadgeCheck,
  "bar-chart-3": BarChart3,
  "circle-question-mark": CircleQuestionMark,
  code: Code,
  cookie: Cookie,
  "file-text": FileText,
  globe: Globe,
  handshake: Handshake,
  "help-circle": HelpCircle,
  house: House,
  layers: Layers,
  leaf: Leaf,
  mail: Mail,
  map: MapIcon,
  plug: Plug,
  "rotate-ccw": RotateCcw,
  scale: Scale,
  "scroll-text": ScrollText,
  search: Search,
  shield: Shield,
  star: Star,
  "triangle-alert": TriangleAlert,
  "user-plus": UserPlus,
  users: Users,
}

function dropdownItemsForGroup(
  group: WebSiteNavGroup
): readonly WebSiteNavItemSpec[] {
  return getWebSiteNavItemSpecsForHeaderDropdown(group)
}

function isDropdownGroupActive(
  pathname: string,
  group: WebSiteNavGroup
): boolean {
  return dropdownItemsForGroup(group).some((item) =>
    isWebSiteNavItemActive(pathname, item.href)
  )
}

const navMenuLinkClass =
  "h-8 rounded-md bg-transparent px-3 py-1.5 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-sidebar-foreground data-[active=true]:bg-transparent data-[active=true]:font-medium data-[active=true]:text-sidebar-foreground"

const navMenuTriggerClass = cn(
  navigationMenuTriggerStyle(),
  "h-8 gap-1 bg-transparent px-3 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-sidebar-foreground data-popup-open:bg-transparent data-open:bg-transparent data-open:font-medium data-open:text-sidebar-foreground"
)

const navMenuCardLinkClass =
  "h-auto w-full flex-col items-stretch gap-0 rounded-lg border border-border/60 bg-transparent p-0 text-left hover:bg-muted data-[active=true]:border-border data-[active=true]:bg-muted/60"

type WebSiteNavShellKey = WebSiteNavDescriptionKey | WebSiteNavLabelKey

function WebSiteNavMenuCard({
  active,
  description,
  href,
  iconName,
  title,
}: {
  readonly active: boolean
  readonly description: string | undefined
  readonly href: WebSiteNavItemSpec["href"]
  readonly iconName: WebSiteNavIconName | undefined
  readonly title: string
}) {
  const Icon = iconName ? webSiteNavIcons[iconName] : undefined

  return (
    <NavigationMenuLink
      active={active}
      className={navMenuCardLinkClass}
      closeOnClick
      render={<Link href={href} />}
    >
      <span className="flex gap-3 p-3">
        {Icon ? (
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-foreground"
          >
            <Icon className="size-4" />
          </span>
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {description ? (
            <span className="text-xs leading-snug text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
      </span>
    </NavigationMenuLink>
  )
}

function WebSiteNavMenuGroup({
  group,
  label,
  pathname,
  translate,
}: {
  readonly group: WebSiteNavGroup
  readonly label: string
  readonly pathname: string
  readonly translate: (key: WebSiteNavShellKey) => string
}) {
  const items = dropdownItemsForGroup(group)
  const groupActive = isDropdownGroupActive(pathname, group)

  return (
    <NavigationMenuItem value={group}>
      <NavigationMenuTrigger
        className={cn(
          navMenuTriggerClass,
          groupActive && "font-medium text-sidebar-foreground"
        )}
      >
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="p-2">
        <ul
          className={cn(
            "grid gap-2",
            group === "company" || group === "resources"
              ? "w-[min(90vw,36rem)] grid-cols-2"
              : "w-[min(90vw,28rem)] grid-cols-2"
          )}
        >
          {items.map((item) => {
            const active = isWebSiteNavItemActive(pathname, item.href)
            const description = item.descriptionKey
              ? translate(item.descriptionKey)
              : undefined

            return (
              <li key={item.id}>
                <WebSiteNavMenuCard
                  active={active}
                  description={description}
                  href={item.href}
                  iconName={item.icon}
                  title={translate(item.labelKey)}
                />
              </li>
            )
          })}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

export function WebSiteNav() {
  const t = useTranslations("siteShell")
  const pathname = usePathname()
  const home = getWebSiteNavItemSpecById("site.home")
  const homeActive = home ? isWebSiteNavItemActive(pathname, home.href) : false

  return (
    <NavigationMenu
      aria-label={t("navPrimary")}
      className="hidden max-w-max min-w-0 justify-start md:flex"
    >
      <NavigationMenuList className="justify-start gap-1">
        {home ? (
          <NavigationMenuItem>
            <NavigationMenuLink
              active={homeActive}
              className={navMenuLinkClass}
              closeOnClick
              render={<Link href={home.href} />}
            >
              {t(home.labelKey)}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ) : null}
        {WEB_SITE_HEADER_DROPDOWN_GROUPS.map((group) => (
          <WebSiteNavMenuGroup
            key={group}
            group={group}
            label={t(WEB_SITE_NAV_GROUP_HEADING_KEYS[group])}
            pathname={pathname}
            translate={(key) => t(key)}
          />
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
