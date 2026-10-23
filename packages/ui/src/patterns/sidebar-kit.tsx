"use client";

import {
  BookOpenIcon,
  Building2Icon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  FolderClosedIcon,
  LayersIcon,
  LifeBuoyIcon,
  LogInIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  MoreHorizontalIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  StarOffIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  type ComponentType,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { Dialog, DialogPopup, DialogTitle } from "../components/ui/dialog";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "../components/ui/menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../components/ui/sidebar";
import { Skeleton } from "../components/ui/skeleton";
import { cn, headerIconButtonClassName } from "../lib/utils";
import { ConfirmDialog } from "./confirm-dialog";
import { countBadgeClassName, formatCount } from "./count-badge";
import { SettingsAvatar } from "./settings-frame";

/* ---------------- Brand ---------------- */

/** The Loftlancer mark is the Lucide `Layers` icon (#394). */
export function LoftlancerMark({ className }: { className?: string }) {
  return <LayersIcon aria-hidden className={cn("size-4", className)} />;
}

/** Logo + wordmark; collapsed sidebar shows the mark only. */
export function SidebarBrand({ href }: { href: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip="Loftlancer"
          render={<a href={href} aria-label="Loftlancer home" />}
          className="gap-2"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LoftlancerMark className="size-4" />
          </span>
          <span className="truncate font-semibold text-base tracking-tight">
            Loftlancer
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/* ---------------- Count pill ---------------- */

/** Real-count pill for a nav item; renders nothing at 0. */
export function NavCountBadge({
  count,
  tone = "muted",
}: {
  count?: number | null;
  tone?: "muted" | "alert";
}) {
  if (!count || count <= 0) return null;
  return (
    <SidebarMenuBadge
      data-testid="nav-count"
      className={countBadgeClassName(tone === "alert" ? "primary" : "muted")}
    >
      {formatCount(count)}
    </SidebarMenuBadge>
  );
}

/* ---------------- ⌘K command palette ---------------- */

export type CommandEntry = {
  id: string;
  label: string;
  href: string;
  hint?: string;
  keywords?: string;
};
export type CommandGroup = {
  heading: string;
  icon?: "project" | "env" | "settings" | "member";
  items: CommandEntry[];
};

const groupIcons = {
  project: FolderClosedIcon,
  env: LayersIcon,
  settings: SettingsIcon,
  member: UserIcon,
} as const;

function useCommandShortcut(onOpen: () => void) {
  const ref = useRef(onOpen);
  ref.current = onOpen;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

export function CommandPalette({
  open,
  onOpenChange,
  groups,
  onNavigate,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
  onNavigate: (href: string) => void;
  loading?: boolean;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: needle
          ? g.items.filter((i) =>
              `${i.label} ${i.hint ?? ""} ${i.keywords ?? ""}`
                .toLowerCase()
                .includes(needle),
            )
          : g.items,
      }))
      .filter((g) => g.items.length > 0)
      .map((g) => ({ ...g, items: g.items.slice(0, 8) }));
  }, [groups, q]);
  const flat = filtered.flatMap((g) => g.items);
  const go = (entry?: CommandEntry) => {
    if (!entry) return;
    onOpenChange(false);
    onNavigate(entry.href);
  };

  let index = -1;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup
        showCloseButton={false}
        className="overflow-hidden p-0 sm:max-w-lg"
        data-testid="command-palette"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center gap-2 border-b px-3">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(flat.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(flat[active]);
              }
            }}
            placeholder="Search projects, environments, settings, members…"
            aria-label="Search"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-1" role="listbox">
          {loading && flat.length === 0 ? (
            <div className="min-h-32 space-y-1 py-1" aria-busy="true">
              <span className="sr-only">Loading…</span>
              <Skeleton className="mx-2 mb-1 h-3 w-20 motion-reduce:animate-none" />
              {["w-40", "w-32", "w-48"].map((w) => (
                <div key={w} className="flex h-8 items-center gap-2 px-2">
                  <Skeleton className="size-4 motion-reduce:animate-none" />
                  <Skeleton
                    className={cn("h-4 motion-reduce:animate-none", w)}
                  />
                </div>
              ))}
            </div>
          ) : flat.length === 0 ? (
            <p className="flex min-h-32 items-center justify-center px-3 text-center text-muted-foreground text-sm">
              No results.
            </p>
          ) : (
            filtered.map((g) => {
              const Icon = g.icon ? groupIcons[g.icon] : null;
              return (
                <div key={g.heading} className="py-1">
                  <p className="px-2 pb-1 font-medium text-muted-foreground text-xs">
                    {g.heading}
                  </p>
                  {g.items.map((item) => {
                    index += 1;
                    const i = index;
                    return (
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === active}
                        key={item.id}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(item)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                          i === active
                            ? "bg-accent text-accent-foreground"
                            : "",
                        )}
                      >
                        {Icon ? (
                          <Icon className="size-4 shrink-0 text-muted-foreground" />
                        ) : null}
                        <span className="truncate">{item.label}</span>
                        {item.hint ? (
                          <span className="ms-auto truncate text-muted-foreground text-xs">
                            {item.hint}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </DialogPopup>
    </Dialog>
  );
}

/** "Search… ⌘K" trigger + palette with the ⌘K / Ctrl+K shortcut. */
export function SidebarSearch(props: {
  groups: CommandGroup[];
  onNavigate: (href: string) => void;
  loading?: boolean;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);
  const openIt = () => {
    props.onOpen?.();
    setOpen(true);
  };
  useCommandShortcut(openIt);
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Search (⌘K)"
            onClick={openIt}
            className="border border-sidebar-border bg-background text-muted-foreground shadow-xs"
            data-testid="sidebar-search"
          >
            <SearchIcon />
            <span>Search…</span>
            <kbd className="ms-auto rounded border bg-muted px-1.5 font-mono text-[10px] group-data-[collapsible=icon]:hidden">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <CommandPalette open={open} onOpenChange={setOpen} {...props} />
    </>
  );
}

/* ---------------- Favorites ---------------- */

export type FavoriteProject = {
  id: string;
  label: string;
  href: string;
  env?: { label: string; production?: boolean } | null;
};

const DOT_COLORS = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
];
export function projectDotColor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return DOT_COLORS[h % DOT_COLORS.length];
}

type LinkLike = ComponentType<{
  href: string;
  className?: string;
  children?: ReactNode;
}>;

export function SidebarFavorites({
  items,
  isActive,
  LinkComponent,
  loading = false,
}: {
  items: FavoriteProject[];
  isActive?: (href: string) => boolean;
  LinkComponent?: LinkLike;
  /** First load: keep the group and show placeholder rows. */
  loading?: boolean;
}) {
  const [open, setOpen] = useState(true);
  if (loading && !items.length) {
    return <FavoritesGroup open={open} onOpenChange={setOpen} loading />;
  }
  if (!items.length) return null;
  const L: LinkLike = LinkComponent ?? ((p) => <a {...p} />);
  return (
    <FavoritesGroup open={open} onOpenChange={setOpen}>
      {items.map((p) => (
        <SidebarMenuItem key={p.id}>
          <SidebarMenuButton
            tooltip={p.label}
            isActive={isActive?.(p.href)}
            render={<L href={p.href} />}
          >
            <span className="flex size-4 shrink-0 items-center justify-center">
              <span
                className={cn("size-2 rounded-full", projectDotColor(p.id))}
              />
            </span>
            <span className="truncate">{p.label}</span>
            {p.env ? (
              <span
                className={cn(
                  "ms-auto shrink-0 rounded-full border px-1.5 font-medium text-[10px] leading-4",
                  p.env.production
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-sidebar-border text-muted-foreground",
                )}
              >
                {p.env.label}
              </span>
            ) : null}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </FavoritesGroup>
  );
}

function FavoritesGroup({
  open,
  onOpenChange,
  loading = false,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <SidebarGroup data-testid="sidebar-favorites" aria-busy={loading}>
        <CollapsibleTrigger
          render={
            <SidebarGroupLabel className="cursor-pointer gap-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
          }
        >
          <StarIcon className="me-1 size-3" /> Favorites
          <ChevronRightIcon
            className={cn(
              "ms-auto size-4 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
            aria-hidden
          />
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading
                ? ["w-28", "w-20", "w-24"].map((w) => (
                    <SidebarMenuItem key={w}>
                      <div className="flex h-8 items-center gap-2 px-2">
                        <Skeleton className="size-2 rounded-full motion-reduce:animate-none" />
                        <Skeleton
                          className={cn("h-4 motion-reduce:animate-none", w)}
                        />
                      </div>
                    </SidebarMenuItem>
                  ))
                : children}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsiblePanel>
      </SidebarGroup>
    </Collapsible>
  );
}

/* ---------------- User menu (shared: sidebar footer + header avatar) ---------------- */

export type UserMenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  accountHref: string;
  organizationSettingsHref?: string | null;
  docsHref: string;
  /** User-level support (outside any org), e.g. studio /support/tickets. */
  supportHref?: string | null;
  onSignOut: () => void | Promise<void>;
};

/** One popup for both triggers so labels, width and text sizes never drift. */
function UserMenuPopup({
  user,
  accountHref,
  organizationSettingsHref,
  docsHref,
  supportHref,
  onRequestSignOut,
  side,
  align,
}: Omit<UserMenuProps, "onSignOut"> & {
  onRequestSignOut: () => void;
  side: "top" | "bottom";
  align: "start" | "end";
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const name = user?.name || user?.email || "Account";
  return (
    <MenuPopup side={side} align={align} className="w-60 text-sm">
      <MenuGroup>
        <MenuGroupLabel>
          <span className="block truncate font-medium text-foreground">
            {name}
          </span>
          {user?.email ? (
            <span className="block truncate font-normal">{user.email}</span>
          ) : null}
        </MenuGroupLabel>
      </MenuGroup>
      <MenuSeparator />
      <MenuLinkItem href={accountHref}>
        <UserIcon /> Account
      </MenuLinkItem>
      {organizationSettingsHref ? (
        <MenuLinkItem href={organizationSettingsHref}>
          <Building2Icon /> Organization settings
        </MenuLinkItem>
      ) : null}
      <MenuSeparator />
      <MenuGroup>
        <MenuGroupLabel>Theme</MenuGroupLabel>
        <MenuRadioGroup
          value={mounted ? (theme ?? "system") : "system"}
          onValueChange={(v) => setTheme(String(v))}
        >
          <MenuRadioItem value="light">
            <span className="flex items-center gap-2">
              <SunIcon className="size-4" /> Light
            </span>
          </MenuRadioItem>
          <MenuRadioItem value="dark">
            <span className="flex items-center gap-2">
              <MoonIcon className="size-4" /> Dark
            </span>
          </MenuRadioItem>
          <MenuRadioItem value="system">
            <span className="flex items-center gap-2">
              <MonitorIcon className="size-4" /> System
            </span>
          </MenuRadioItem>
        </MenuRadioGroup>
      </MenuGroup>
      <MenuSeparator />
      <MenuLinkItem href={docsHref}>
        <BookOpenIcon /> Docs
      </MenuLinkItem>
      {supportHref ? (
        <MenuLinkItem href={supportHref} data-testid="menu-support">
          <LifeBuoyIcon /> Support
        </MenuLinkItem>
      ) : null}
      <MenuItem
        variant="destructive"
        data-testid="menu-sign-out"
        onClick={onRequestSignOut}
      >
        <LogOutIcon /> Sign out
      </MenuItem>
    </MenuPopup>
  );
}

/** Menu + confirm dialog; the dialog lives outside the popup so it survives close. */
function useSignOutConfirm(onSignOut: UserMenuProps["onSignOut"]) {
  const [open, setOpen] = useState(false);
  return {
    request: () => setOpen(true),
    dialog: (
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Sign out of Loftlancer?"
        description="You will be signed out of Studio and your account settings on this device."
        confirmLabel="Sign out"
        variant="destructive"
        onConfirm={onSignOut}
      />
    ),
  };
}

export function SidebarUserMenu({ onSignOut, ...props }: UserMenuProps) {
  const { user } = props;
  const signOut = useSignOutConfirm(onSignOut);
  const name = user?.name || user?.email || "Account";
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menu>
          <MenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={name}
                data-testid="sidebar-user-menu"
              />
            }
          >
            <SettingsAvatar
              src={user?.image}
              name={name}
              className="size-8 rounded-md text-xs"
            />
            <span className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate font-medium text-sm">{name}</span>
              {user?.email ? (
                <span className="truncate text-muted-foreground text-xs">
                  {user.email}
                </span>
              ) : null}
            </span>
            <ChevronsUpDownIcon className="ms-auto size-4 opacity-60" />
          </MenuTrigger>
          <UserMenuPopup
            {...props}
            onRequestSignOut={signOut.request}
            side="top"
            align="start"
          />
        </Menu>
        {signOut.dialog}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/** Header avatar trigger: same size-8 square as the other header buttons. */
export function HeaderUserMenu({ onSignOut, ...props }: UserMenuProps) {
  const { user } = props;
  const signOut = useSignOutConfirm(onSignOut);
  const name = user?.name || user?.email || "Account";
  return (
    <>
      <Menu>
        <MenuTrigger
          aria-label="Open account menu"
          data-testid="header-user-menu"
          className={cn(
            headerIconButtonClassName,
            "inline-flex items-center justify-center overflow-hidden border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <SettingsAvatar
            src={user?.image}
            name={name}
            className="size-full rounded-none text-xs"
          />
        </MenuTrigger>
        <UserMenuPopup
          {...props}
          onRequestSignOut={signOut.request}
          side="bottom"
          align="end"
        />
      </Menu>
      {signOut.dialog}
    </>
  );
}

/* ---------------- Footer settings link ---------------- */

/** Account settings entry anchored above the sidebar user menu (#79). */
export function SidebarSettingsLink({
  href,
  isActive,
}: {
  href: string;
  isActive?: boolean;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          tooltip="Settings"
          data-testid="sidebar-settings-link"
          render={<a href={href} />}
        >
          <SettingsIcon />
          <span>Settings</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/* ---------------- Project row pin menu ---------------- */

/** Row "⋯" menu on a sidebar project item: Pin to / Remove from Favorites. */
export function ProjectPinMenu({
  pinned,
  onToggle,
  pending,
  limitReached = false,
  favoriteLimit = 3,
}: {
  pinned: boolean;
  onToggle: () => void;
  pending?: boolean;
  limitReached?: boolean;
  favoriteLimit?: number;
}) {
  return (
    <Menu>
      <MenuTrigger
        render={
          <SidebarMenuAction
            showOnHover
            aria-label="Project actions"
            data-testid="project-row-menu"
          />
        }
      >
        <MoreHorizontalIcon />
      </MenuTrigger>
      <MenuPopup side="right" align="start">
        <MenuItem
          disabled={pending || (!pinned && limitReached)}
          onClick={onToggle}
        >
          {pinned ? <StarOffIcon /> : <StarIcon />}
          {pinned
            ? "Remove from Favorites"
            : limitReached
              ? `Favorites limit reached (${favoriteLimit})`
              : "Pin to Favorites"}
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}

/* ---------------- Public (unguarded) sidebar ---------------- */

export type PublicNavGroup = {
  label: string;
  items: {
    label: string;
    href: string;
    icon?: ComponentType<{ className?: string }>;
  }[];
};

type PublicSession = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

/**
 * Session is read client-side only, so nothing user-specific is in the
 * static HTML. Cross-app links are plain <a> (no prefetch).
 */
function usePublicSession(sessionUrl: string) {
  const [user, setUser] = useState<PublicSession | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(sessionUrl, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { user?: PublicSession } | null) => {
        if (alive) setUser(d?.user ?? null);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [sessionUrl]);
  return user;
}

export function PublicSidebar({
  homeHref,
  groups,
  currentPath,
  sessionUrl,
  signInHref,
  onSignOut,
  accountHref,
  docsHref,
}: {
  homeHref: string;
  groups: PublicNavGroup[];
  currentPath?: string;
  sessionUrl: string;
  signInHref: string;
  /** Ends the session (the confirm dialog is built in). */
  onSignOut: () => void | Promise<void>;
  accountHref: string;
  docsHref: string;
}) {
  const user = usePublicSession(sessionUrl);
  return (
    <Sidebar collapsible="icon" variant="inset" data-testid="public-sidebar">
      <SidebarHeader className="shrink-0">
        <SidebarBrand href={homeHref} />
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel className="text-muted-foreground">
              {g.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={currentPath === item.href}
                        render={<a href={item.href} />}
                      >
                        {Icon ? (
                          <Icon className="shrink-0 text-muted-foreground" />
                        ) : null}
                        <span className="min-w-0 truncate">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="mt-auto shrink-0 border-border/60 border-t bg-sidebar">
        {user ? (
          <SidebarUserMenu
            user={user}
            accountHref={accountHref}
            docsHref={docsHref}
            onSignOut={onSignOut}
          />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign in"
                render={<a href={signInHref} />}
                className="h-8 justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                data-testid="public-sign-in"
              >
                <LogInIcon />
                <span>Sign in</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
