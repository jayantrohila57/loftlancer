"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@loftlancer/ui/breadcrumb";
import { Button } from "@loftlancer/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@loftlancer/ui/menu";
import { cn } from "@loftlancer/ui/utils";
import { Home, MoreHorizontal } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import React, { type ReactNode } from "react";

export type BreadcrumbTrailItem = {
  href: string;
  label: ReactNode;
};

/**
 * The app-shell header breadcrumb shared by every app (studio, account
 * settings): home icon, "/" separators, the full trail from `md` up (middle
 * collapsed past four crumbs) and "… / current" with an ancestor menu
 * below `md`. Apps only compute the crumbs (#329).
 */
export function BreadcrumbTrail({
  homeHref,
  homeLabel = "Home",
  items,
  className,
}: {
  homeHref: string;
  homeLabel?: string;
  items: BreadcrumbTrailItem[];
  className?: string;
}) {
  const collapseMiddle = items.length > 4;
  const lastIndex = items.length - 1;
  const mobileMenuItems = items.length > 1 ? items.slice(0, -1) : [];

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList
        className={cn("min-w-0 flex-nowrap overflow-hidden", className)}
      >
        <BreadcrumbItem className="shrink-0">
          <BreadcrumbLink
            render={<Link href={homeHref as Route} />}
            aria-label={homeLabel}
            className="inline-flex size-11 items-center justify-center"
          >
            <Home className="size-4" aria-hidden />
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Mobile: last segment + ellipsis menu for ancestors */}
        {items.length > 0 ? (
          <>
            {mobileMenuItems.length > 0 ? (
              <React.Fragment key="mobile-ellipsis">
                <BreadcrumbSeparator className="shrink-0 md:hidden">
                  {"/"}
                </BreadcrumbSeparator>
                <BreadcrumbItem className="shrink-0 md:hidden">
                  <Menu>
                    <MenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Show breadcrumb trail"
                        />
                      }
                    >
                      <MoreHorizontal className="size-4" aria-hidden />
                    </MenuTrigger>
                    <MenuPopup align="start">
                      {mobileMenuItems.map((crumb) => (
                        <MenuItem
                          key={crumb.href}
                          render={<Link href={crumb.href as Route} />}
                        >
                          {crumb.label}
                        </MenuItem>
                      ))}
                    </MenuPopup>
                  </Menu>
                </BreadcrumbItem>
              </React.Fragment>
            ) : null}
            <BreadcrumbSeparator className="shrink-0 md:hidden">
              {"/"}
            </BreadcrumbSeparator>
            <BreadcrumbItem className="max-w-[min(12rem,55vw)] shrink truncate md:hidden">
              <BreadcrumbPage className="truncate">
                {items[lastIndex]?.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}

        {/* md+: full trail (with optional middle collapse) */}
        {items.map((crumb, index) => {
          if (collapseMiddle && index > 0 && index < items.length - 2) {
            if (index === 1) {
              return (
                <React.Fragment key="ellipsis">
                  <BreadcrumbSeparator className="hidden shrink-0 md:flex">
                    {"/"}
                  </BreadcrumbSeparator>
                  <BreadcrumbItem className="text-muted-foreground hidden shrink-0 md:flex">
                    …
                  </BreadcrumbItem>
                </React.Fragment>
              );
            }
            return null;
          }

          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbSeparator className="hidden shrink-0 first:hidden md:flex">
                {"/"}
              </BreadcrumbSeparator>
              <BreadcrumbItem className="hidden max-w-32 shrink truncate md:flex md:max-w-xs">
                {index === lastIndex ? (
                  <BreadcrumbPage className="truncate">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="truncate"
                    render={<Link href={crumb.href as Route} />}
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
