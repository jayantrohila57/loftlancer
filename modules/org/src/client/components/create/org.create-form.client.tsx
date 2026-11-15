"use client"

import type { ComboboxOption } from "@features/form"
import { FormKit } from "@features/form"
import { withClientRetry } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { clientEnv } from "@packages/t3-env/client"
import { toastManager } from "@packages/ui/components/toast"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import type { z } from "zod"
import { formatOrgClientError } from "../../../utils/org.client-error"
import { activateOrganizationAfterJoin } from "../../../utils/org.organization-id"
import {
  buildOrgCountryOptions,
  buildOrgCurrencyOptions,
} from "./org.create-form.options.client"
import { createOrganizationFormSchema } from "./org.create-form.schema.client"
import { OrgCreateFormWizard } from "./org.create-form.wizard.client"
import { OrgCreateFormWizardFooter } from "./org.create-form.wizard-footer.client"
import { useOrgCreateWizardNav } from "./org.create-form.wizard-nav.client"

type OrganizationFormValues = z.infer<
  ReturnType<typeof createOrganizationFormSchema>
>

type OrganizationTypeOption = {
  readonly value: "freelancer" | "studio" | "agency" | "company"
  readonly label: string
  readonly description: string
}

function parseInviteEmails(raw: string | undefined) {
  if (!raw?.trim()) return undefined
  const emails = raw
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
  return emails.length ? emails.map((email) => ({ email })) : undefined
}

function OrgCreateFormBody({
  compact,
  onCancel,
  organizationTypeOptions,
  countryOptions,
  currencyOptions,
}: {
  readonly compact?: boolean
  readonly onCancel?: () => void
  readonly organizationTypeOptions: readonly OrganizationTypeOption[]
  readonly countryOptions: ComboboxOption[]
  readonly currencyOptions: ComboboxOption[]
}) {
  const nav = useOrgCreateWizardNav()

  const wizard = (
    <OrgCreateFormWizard
      compact={compact}
      nav={nav}
      organizationTypeOptions={organizationTypeOptions}
      countryOptions={countryOptions}
      currencyOptions={currencyOptions}
    />
  )

  return (
    <FormKit.Group>
      {compact ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {wizard}
        </div>
      ) : (
        wizard
      )}
      <OrgCreateFormWizardFooter nav={nav} onCancel={onCancel} />
    </FormKit.Group>
  )
}

export function OrgCreateForm({
  compact = false,
  onCancel,
}: {
  readonly compact?: boolean
  readonly onCancel?: () => void
}) {
  const t = useTranslations("ui")
  const schema = createOrganizationFormSchema(t)
  const locale = useLocale()
  const format = useFormatter()
  const { data: session } = authClient.useSession()
  const countryOptions = useMemo(() => buildOrgCountryOptions(format), [format])
  const currencyOptions = useMemo(
    () => buildOrgCurrencyOptions(format),
    [format]
  )

  const defaultValues = useMemo<OrganizationFormValues>(
    () => ({
      name: "",
      slug: "",
      logo: "",
      version: 2,
      basics: {
        type: "freelancer",
        tagline: "",
        description: "",
        logoUrl: "",
      },
      business: {
        industry: "",
        category: "",
        website: "",
        portfolioUrl: "",
      },
      contact: {
        primaryEmail: session?.user.email ?? "",
        alternativeEmail: "",
        supportEmail: "",
        businessPhone: "",
      },
      location: {
        countryCode: "",
        city: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        timezone: "",
        currencyCode: "",
        geo: null,
      },
      legalSkipped: false,
      legal: {
        legalBusinessName: "",
        registrationNumber: "",
        taxIdNumber: "",
        taxDocumentUrl: "",
      },
      branding: {
        displayName: "",
        brandColor: "",
        primaryLogoUrl: "",
      },
      workspace: {
        defaultMemberRole: "member",
        projectNumberPrefix: "",
      },
      team: {
        inviteEmails: "",
        firstTeamName: "",
      },
    }),
    [session?.user.email]
  )

  async function createOrganization(values: OrganizationFormValues) {
    const logo =
      values.logo?.trim() ||
      values.basics.logoUrl?.trim() ||
      values.branding.primaryLogoUrl?.trim() ||
      undefined
    const setup = {
      version: 2 as const,
      basics: {
        ...values.basics,
        logoUrl: logo ?? values.basics.logoUrl,
      },
      business: values.business,
      contact: values.contact,
      location: values.location.geo
        ? {
            ...values.location,
            geo: values.location.geo,
          }
        : { ...values.location, geo: undefined },
      legal: values.legalSkipped
        ? { skipped: true }
        : {
            ...values.legal,
            skipped: false,
          },
      branding: {
        displayName: values.branding.displayName,
        brandColor: values.branding.brandColor,
      },
      workspace: values.workspace,
      team: {
        invites: parseInviteEmails(values.team.inviteEmails),
        firstTeamName: values.team.firstTeamName || undefined,
      },
    }
    try {
      await toastManager.promise(
        (async () => {
          const response = await authClient.organization.create({
            name: values.name,
            slug: values.slug,
            ...(logo ? { logo } : {}),
            metadata: { setup },
          })
          if (response.error) {
            throw new Error(
              formatOrgClientError(response.error, {
                fallback: t("couldNotCreateOrganization"),
                limitMessage: t("organizationCreateLimitReached"),
                slugTakenMessage: t("organizationSlugAlreadyTaken"),
              })
            )
          }
          await activateOrganizationAfterJoin(
            authClient.organization.setActive.bind(authClient.organization),
            response.data,
            { switchErrorMessage: t("couldNotSwitchOrganization") }
          )
          const base = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
          const provisioningComplete = await withClientRetry(async () => {
            const overview = await securityRpc.security.billing.overview()
            if (overview.status !== "success" || !overview.data) return false
            return (
              overview.data.provisioningStep === "complete" &&
              overview.data.autumnBound
            )
          }).catch(() => false)
          window.location.assign(
            provisioningComplete
              ? `${base}/${locale}/account/organization`
              : `${base}/${locale}/organizations/create`
          )
        })(),
        {
          loading: t("creatingOrganization"),
          success: t("organizationCreated"),
          error: (error: unknown) =>
            error instanceof Error
              ? error.message
              : t("couldNotCreateOrganization"),
        }
      )
    } catch {
      // Toast surfaces the failure.
    }
  }

  const organizationTypeOptions = [
    {
      value: "freelancer",
      label: t("organizationTypeFreelancer"),
      description: t("organizationTypeFreelancerDescription"),
    },
    {
      value: "studio",
      label: t("organizationTypeStudio"),
      description: t("organizationTypeStudioDescription"),
    },
    {
      value: "agency",
      label: t("organizationTypeAgency"),
      description: t("organizationTypeAgencyDescription"),
    },
    {
      value: "company",
      label: t("organizationTypeCompany"),
      description: t("organizationTypeCompanyDescription"),
    },
  ] as const satisfies readonly OrganizationTypeOption[]

  return (
    <FormKit
      key={session?.user.email ?? "org-create"}
      variant={compact ? "card" : "embedded"}
      fillViewport={compact}
      schema={schema}
      defaultValues={defaultValues}
      onSubmit={createOrganization}
    >
      <OrgCreateFormBody
        compact={compact}
        onCancel={onCancel}
        organizationTypeOptions={organizationTypeOptions}
        countryOptions={countryOptions}
        currencyOptions={currencyOptions}
      />
    </FormKit>
  )
}
