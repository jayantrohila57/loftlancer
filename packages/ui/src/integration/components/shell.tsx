import { cn } from "@packages/ui/lib/utils"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import type { ReactNode } from "react"
import React from "react"
import {
  SHELL_HEADER_HEIGHT,
  SHELL_HORIZONTAL_PADDING,
} from "../../constants/ui.constants"
import { ShellScroll } from "./shell-scroll"

interface ShellTypes {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}
interface ShellComponent extends ShellTypes {
  Aside?: typeof Aside
  Bar?: typeof Bar
  Footer?: typeof Footer
  Frame?: typeof Frame
  Header?: typeof Header
  Host?: typeof Host
  Inset?: typeof Inset
  Main?: typeof Main
  Panel?: typeof Panel
  Scroll?: typeof Scroll
  Section?: typeof Section
  Stack?: typeof Stack
  SubHeader?: typeof SubHeader
  Subnav?: typeof Subnav
}

export const Shell = ({ children }: ShellComponent) => {
  return <>{children}</>
}

const Frame = React.forwardRef<HTMLDivElement, ShellTypes>(
  ({ className, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-svh flex-col overflow-hidden bg-background text-foreground",
          className
        )}
        data-slot="shell-frame"
        style={style}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Frame.displayName = "Frame"
Shell.Frame = Frame

const HeaderVariants = cva(
  "flex shrink-0 items-center border-b border-border bg-background text-foreground",
  {
    variants: {
      variant: {
        /** @deprecated Prefer `app` inside `Shell.Frame` — fixed header overlaps content. */
        default: "fixed top-0 right-0 left-0 z-50 bg-transparent shadow-none",
        /** @deprecated Prefer `app` inside `Shell.Frame`. */
        flexed: cn(
          "fixed top-0 right-0 left-0 z-50 w-full",
          SHELL_HORIZONTAL_PADDING
        ),
        /** In-flow app header band — use inside `Shell.Frame`. Keep in sync with `SHELL_HEADER_HEIGHT`. */
        app: cn("w-full", SHELL_HEADER_HEIGHT, SHELL_HORIZONTAL_PADDING),
      },
    },
    defaultVariants: {
      variant: "app",
    },
  }
)
interface HeaderTypes {
  className?: string
  children: ReactNode
}

const Header = React.forwardRef<
  HTMLElement,
  HeaderTypes & VariantProps<typeof HeaderVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <header
      ref={ref}
      {...props}
      className={cn(HeaderVariants({ variant }), className)}
      data-slot="shell-header"
    />
  )
})
Header.displayName = "Header"
Shell.Header = Header

interface AsideTypes {
  className?: string
  children: ReactNode
}

const Aside = React.forwardRef<HTMLElement, AsideTypes>(
  ({ className, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        {...props}
        className={cn(
          "shrink-0 border-e border-border bg-sidebar text-sidebar-foreground",
          className
        )}
        data-slot="shell-aside"
      />
    )
  }
)
Aside.displayName = "Aside"

Shell.Aside = Aside

const FooterVariants = cva(
  "shrink-0 border-t border-border bg-background text-foreground",
  {
    variants: {
      variant: {
        default: cn(SHELL_HORIZONTAL_PADDING, "py-4"),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface FooterTypes {
  className?: string
  children: ReactNode
}

const Footer = React.forwardRef<
  HTMLElement,
  FooterTypes & VariantProps<typeof FooterVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <footer
      ref={ref}
      {...props}
      className={cn(FooterVariants({ variant }), className)}
      data-slot="shell-footer"
    />
  )
})
Footer.displayName = "Footer"

Shell.Footer = Footer

const MainVariants = cva("min-w-0 bg-background text-foreground", {
  variants: {
    variant: {
      default: "min-h-screen overflow-x-hidden border-e border-border",
      dashboard: "flex min-h-0 flex-1 flex-col overflow-hidden",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Main = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"main"> & VariantProps<typeof MainVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(MainVariants({ variant }), className)}
      data-slot="shell-main"
      {...props}
    />
  )
})
Main.displayName = "Main"

Shell.Main = Main

const SectionVariants = cva("", {
  variants: {
    variant: {
      default: "",
      full: "h-full w-full",
      /** In-shell scroller under a header-only Frame (auth landing). Parent Main is overflow-hidden. */
      flexed: cn(
        "flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain text-foreground",
        SHELL_HORIZONTAL_PADDING
      ),
      dashboard:
        "flex min-h-0 flex-1 flex-col gap-0 bg-background text-foreground",
      center:
        "flex min-h-svh flex-col items-center justify-center px-6 py-12 text-foreground md:py-20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface SectionTypes {
  className?: string
  children: ReactNode
}

const Section = React.forwardRef<
  HTMLElement,
  SectionTypes & VariantProps<typeof SectionVariants>
>(({ variant, className, ...props }, ref) => {
  return (
    <section
      ref={ref}
      className={cn(SectionVariants({ variant }), className)}
      data-slot="shell-section"
      {...props}
    />
  )
})
Section.displayName = "Section"

Shell.Section = Section

/** Main column beside `Sidebar` — typically nested in `SidebarInset`. */
const InsetVariants = cva("flex min-w-0 flex-col", {
  variants: {
    variant: {
      default: "min-h-0 flex-1",
      /** Fills viewport height; stacks app bar + `Shell.Main variant="dashboard"`. */
      dashboard: "h-svh min-h-0 flex-1 flex-col overflow-hidden",
    },
  },
  defaultVariants: {
    variant: "dashboard",
  },
})

const Inset = React.forwardRef<
  HTMLDivElement,
  ShellTypes & VariantProps<typeof InsetVariants>
>(({ className, variant, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(InsetVariants({ variant }), className)}
      data-slot="shell-inset"
      {...props}
    >
      {children}
    </div>
  )
})
Inset.displayName = "Inset"
Shell.Inset = Inset

/** Section column under `Shell.Main` — fixed chrome + flex child (often `Shell.Scroll`). */
const PanelVariants = cva("flex min-h-0 flex-1 flex-col overflow-hidden", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Panel = React.forwardRef<
  HTMLDivElement,
  ShellTypes & VariantProps<typeof PanelVariants>
>(({ className, variant, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(PanelVariants({ variant }), className)}
      data-slot="shell-panel"
      {...props}
    >
      {children}
    </div>
  )
})
Panel.displayName = "Panel"
Shell.Panel = Panel

/** Primary vertical scroller inside dashboard / section layouts. */
const Scroll = ShellScroll
Shell.Scroll = Scroll

/** Band below the app header: section title, description, tabs (`Shell.Subnav`). */
const SubHeaderVariants = cva(
  "flex shrink-0 flex-col border-b border-border bg-sidebar text-foreground",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const SubHeader = React.forwardRef<
  HTMLDivElement,
  ShellTypes & VariantProps<typeof SubHeaderVariants>
>(({ className, variant, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(SubHeaderVariants({ variant }), className)}
      data-slot="shell-sub-header"
      {...props}
    >
      {children}
    </div>
  )
})
SubHeader.displayName = "SubHeader"
Shell.SubHeader = SubHeader

/** Tab / filter row attached under a sub-header or standalone. */
const SubnavVariants = cva("shrink-0 bg-sidebar text-foreground", {
  variants: {
    variant: {
      default: SHELL_HORIZONTAL_PADDING,
      flush: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Subnav = React.forwardRef<
  HTMLDivElement,
  ShellTypes & VariantProps<typeof SubnavVariants>
>(({ className, variant, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(SubnavVariants({ variant }), className)}
      data-slot="shell-subnav"
      {...props}
    >
      {children}
    </div>
  )
})
Subnav.displayName = "Subnav"
Shell.Subnav = Subnav

/** Compact top app bar (breadcrumbs, actions). Pairs with `SHELL_HEADER_HEIGHT`. */
const BarVariants = cva(
  "flex shrink-0 items-center justify-between border-b border-border bg-sidebar text-sidebar-foreground",
  {
    variants: {
      variant: {
        default: cn(SHELL_HEADER_HEIGHT, "px-2"),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Bar = React.forwardRef<
  HTMLElement,
  Omit<HeaderTypes, "children"> &
    VariantProps<typeof BarVariants> & { readonly children?: ReactNode }
>(({ className, variant, children, ...props }, ref) => {
  return (
    <header
      ref={ref}
      className={cn(BarVariants({ variant }), className)}
      data-slot="shell-bar"
      {...props}
    >
      {children}
    </header>
  )
})
Bar.displayName = "Bar"
Shell.Bar = Bar

/** Document / provider root under `<body>` — not a viewport frame (use `Shell.Frame` in routes). */
const Host = React.forwardRef<HTMLDivElement, ShellTypes>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative isolate flex min-h-svh flex-col", className)}
        data-slot="shell-host"
        {...props}
      >
        {children}
      </div>
    )
  }
)
Host.displayName = "Host"
Shell.Host = Host

const StackVariants = cva("flex flex-col", {
  variants: {
    variant: {
      default: "gap-2",
      /** Centered auth / onboarding column. */
      form: "w-full max-w-sm gap-6",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Stack = React.forwardRef<
  HTMLDivElement,
  ShellTypes & VariantProps<typeof StackVariants>
>(({ className, variant, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(StackVariants({ variant }), className)}
      data-slot="shell-stack"
      {...props}
    >
      {children}
    </div>
  )
})
Stack.displayName = "Stack"
Shell.Stack = Stack

export default Shell
