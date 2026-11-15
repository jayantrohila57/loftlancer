"use client"

import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import Shell from "@packages/ui/components/shell"
import { CircleAlert, FileQuestion } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/shared/i18n/auth.i18n"
import { AccountPageSection } from "./account-page-section"
import { AuthRouteBoundaryPanel } from "./auth-route-boundary-panel.client"

/** Where route chrome comes from — error UI only fills the content slot. */
export type AuthRouteBoundarySurface = "root" | "portal" | "chrome"

export type AuthRouteChromeTier = "account" | "section"

type AuthRouteBoundaryProps = {
  readonly chromeTier?: AuthRouteChromeTier
  readonly onRetry?: () => void
  readonly surface: AuthRouteBoundarySurface
  readonly variant: "error" | "not-found"
}

function AuthRoutePortalFallback({
  fillViewport = false,
  onRetry,
  variant,
}: {
  readonly fillViewport?: boolean
  readonly onRetry?: () => void
  readonly variant: "error" | "not-found"
}) {
  const t = useTranslations("routeBoundaries")
  const tUi = useTranslations("ui")

  const title = variant === "error" ? t("errorTitle") : t("notFoundTitle")
  const description =
    variant === "error" ? t("errorDescription") : t("notFoundDescription")
  const Icon = variant === "error" ? CircleAlert : FileQuestion

  return (
    <Shell.Section
      className={fillViewport ? "min-h-svh" : undefined}
      variant="center"
    >
      <Shell.Stack variant="form">
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon aria-hidden />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {onRetry ? (
                <Button onClick={onRetry} type="button">
                  {tUi("tryAgain")}
                </Button>
              ) : null}
              <Button
                onClick={() => window.history.back()}
                type="button"
                variant="outline"
              >
                {tUi("goBack")}
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button render={<Link href="/sign-in" />} variant="outline">
                {tUi("signIn")}
              </Button>
              <Button render={<Link href="/account" />} variant="outline">
                {tUi("account")}
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </Shell.Stack>
    </Shell.Section>
  )
}

function AuthRouteRootFallback({
  onRetry,
  variant,
}: {
  readonly onRetry?: () => void
  readonly variant: "error" | "not-found"
}) {
  return (
    <AuthRoutePortalFallback fillViewport onRetry={onRetry} variant={variant} />
  )
}

export function AuthRouteBoundary({
  chromeTier = "section",
  onRetry,
  surface,
  variant,
}: AuthRouteBoundaryProps) {
  if (surface === "root") {
    return <AuthRouteRootFallback onRetry={onRetry} variant={variant} />
  }

  if (surface === "portal") {
    return <AuthRoutePortalFallback onRetry={onRetry} variant={variant} />
  }

  const panel = (
    <AuthRouteBoundaryPanel
      onRetry={onRetry}
      showSectionHome={chromeTier === "section"}
      variant={variant}
    />
  )

  if (chromeTier === "account") {
    return <AccountPageSection>{panel}</AccountPageSection>
  }

  return panel
}
