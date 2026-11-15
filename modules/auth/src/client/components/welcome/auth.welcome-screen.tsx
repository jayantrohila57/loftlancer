"use client"

import { Button } from "@packages/ui/components/button"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { useAuthWelcomePaths } from "../../hooks/auth.welcome-paths.client"

const welcomeStepKeys = [
  {
    body: "welcomeStepContinueBody",
    title: "welcomeStepContinueTitle",
  },
  {
    body: "welcomeStepLocationBody",
    title: "welcomeStepLocationTitle",
  },
  {
    body: "welcomeStepDestinationBody",
    title: "welcomeStepDestinationTitle",
  },
] as const

export function AuthWelcomeScreen() {
  const t = useTranslations("ui")
  const home = useTranslations("home")
  const { continueURL, firstLoginURL } = useAuthWelcomePaths()

  return (
    <Shell.Section variant="center">
      <Shell.Stack variant="form">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("welcome")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("welcomeDescription")}
          </p>
        </div>
        <ol className="list-decimal space-y-3 pl-5 text-left text-sm">
          {welcomeStepKeys.map((step) => (
            <li className="space-y-0.5" key={step.title}>
              <span className="font-medium">{t(step.title)}</span>
              <p className="text-muted-foreground">{t(step.body)}</p>
            </li>
          ))}
        </ol>
        <Button
          render={<a href={continueURL}>{home("continue")}</a>}
          type="button"
        />
        <p className="text-center text-sm">
          <a
            className="text-primary underline-offset-4 hover:underline"
            href={firstLoginURL}
          >
            {t("welcomeViewGettingStarted")}
          </a>
        </p>
      </Shell.Stack>
    </Shell.Section>
  )
}

const firstLoginGuideKeys = [
  {
    hint: "firstLoginProfileHint",
    hrefKey: "profileURL" as const,
    label: "profile",
  },
  {
    hint: "firstLoginSecurityHint",
    hrefKey: "securityURL" as const,
    label: "security",
  },
  {
    hint: "firstLoginOrganizationsHint",
    hrefKey: "organizationsListURL" as const,
    label: "organizations",
  },
] as const

export function AuthFirstLoginScreen() {
  const t = useTranslations("ui")
  const home = useTranslations("home")
  const paths = useAuthWelcomePaths()

  return (
    <Shell.Section variant="center">
      <Shell.Stack variant="form">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("firstLogin")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("firstLoginDescription")}
          </p>
        </div>
        <ul className="space-y-3 text-left text-sm">
          {firstLoginGuideKeys.map((item) => (
            <li className="space-y-0.5" key={item.label}>
              <a
                className="font-medium text-primary underline-offset-4 hover:underline"
                href={paths[item.hrefKey]}
              >
                {t(item.label)}
              </a>
              <p className="text-muted-foreground">{t(item.hint)}</p>
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <Button
            render={<a href={paths.accountOverviewURL}>{t("goToAccount")}</a>}
            type="button"
          />
          <Button
            render={<a href={paths.continueURL}>{home("continue")}</a>}
            type="button"
            variant="outline"
          />
        </div>
        <p className="text-center text-sm">
          <a
            className="text-primary underline-offset-4 hover:underline"
            href={paths.welcomeURL}
          >
            {t("firstLoginBackToWelcome")}
          </a>
        </p>
      </Shell.Stack>
    </Shell.Section>
  )
}
