"use client"

import { cn } from "@packages/ui/lib/utils"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import React from "react"
import { ScrollArea } from "./scroll-area"

export interface ShellScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly children: React.ReactNode
  readonly className?: string
}

const shellScrollHiddenVariants = cva("min-h-0 flex-1 overscroll-contain", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "overflow-y-auto",
      hidden: "overflow-hidden",
    },
  },
})

export const ShellScroll = React.forwardRef<
  HTMLDivElement,
  ShellScrollProps & VariantProps<typeof shellScrollHiddenVariants>
>(({ children, className, variant = "default", ...props }, ref) => {
  if (variant === "hidden") {
    return (
      <div
        ref={ref}
        className={cn(shellScrollHiddenVariants({ variant }), className)}
        data-slot="shell-scroll"
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <ScrollArea
      ref={ref}
      className={cn("min-h-0 flex-1", className)}
      data-slot="shell-scroll"
      overscrollContain
      scrollbarGutter
      verticalScrollbarClassName="m-1.5 w-3 opacity-100 transition-opacity delay-0 duration-150 data-hovering:opacity-100 data-scrolling:opacity-100 data-[orientation=vertical]:w-3"
      verticalThumbClassName="bg-foreground/30"
      {...props}
    >
      <div className="p-2">{children}</div>
    </ScrollArea>
  )
})
ShellScroll.displayName = "ShellScroll"
