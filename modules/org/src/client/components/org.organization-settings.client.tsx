"use client"

import { FormKit } from "@features/form"
import { withClientRetry } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { useQuery, useQueryClient } from "@packages/react-query"
import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import { Skeleton } from "@packages/ui/components/skeleton"
import { toastManager } from "@packages/ui/components/toast"
import { Building2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { z } from "zod"

import { isOrganizationOwnerRole } from "../../utils/org.member-role"
import {
  useOrgActiveMemberRole,
  useOrgSessionActiveId,
  useOrgSessionActiveIdPending,
} from "../hooks/org.session.client"

const orgBasicsFormSchema = z.object({
  type: z.enum(["freelancer", "studio", "agency", "company"]),
  tagline: z.string().trim().max(120),
  description: z.string().trim().max(500),
})

type OrgBasicsFormValues = z.infer<typeof orgBasicsFormSchema>

function OrgSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

async function loadOrgSetup() {
  return withClientRetry(async () => {
    const result = await securityRpc.security.org.setup.get()
    if (result.status !== "success") {
      throw new Error(result.message)
    }
    return result.data
  })
}

async function patchOrgSetup(patch: {
  basics: {
    type: OrgBasicsFormValues["type"]
    tagline?: string
    description?: string
  }
}) {
  return withClientRetry(async () => {
    const result = await securityRpc.security.org.setup.patch({ patch })
    if (result.status !== "success") {
      throw new Error(result.message)
    }
    return result.data
  })
}

export function OrgOrganizationSettings() {
  const t = useTranslations("ui")
  const organizationId = useOrgSessionActiveId()
  const orgResolving = useOrgSessionActiveIdPending()
  const { role, isPending: rolePending } = useOrgActiveMemberRole()
  const { data: organization } = authClient.useActiveOrganization()
  const queryClient = useQueryClient()
  const canEdit = Boolean(role && isOrganizationOwnerRole(role))

  const queryKey = useMemo(
    () => ["org", "setup", organizationId] as const,
    [organizationId]
  )

  const setupQuery = useQuery({
    queryKey,
    enabled: Boolean(organizationId),
    queryFn: loadOrgSetup,
  })

  const organizationTypeOptions = useMemo(
    () =>
      [
        {
          value: "freelancer" as const,
          label: t("organizationTypeFreelancer"),
        },
        {
          value: "studio" as const,
          label: t("organizationTypeStudio"),
        },
        {
          value: "agency" as const,
          label: t("organizationTypeAgency"),
        },
        {
          value: "company" as const,
          label: t("organizationTypeCompany"),
        },
      ] satisfies Array<{ value: OrgBasicsFormValues["type"]; label: string }>,
    [t]
  )

  if (orgResolving || rolePending) {
    return <OrgSettingsSkeleton />
  }

  if (!organizationId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2 />
          </EmptyMedia>
          <EmptyTitle>{t("storageNoActiveOrgTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("storageNoActiveOrgDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (setupQuery.isPending) {
    return <OrgSettingsSkeleton />
  }

  if (setupQuery.isError || !setupQuery.data) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4">
        <p className="text-sm text-muted-foreground">
          {t("organizationSetupLoadError")}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void setupQuery.refetch()
          }}
        >
          {t("tryAgain")}
        </Button>
      </div>
    )
  }

  const setup = setupQuery.data.setup
  if (!setup) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("organizationSetupNotProvisioned")}
      </p>
    )
  }

  const basics = setup.basics
  const defaultValues: OrgBasicsFormValues = {
    type: basics.type,
    tagline: basics.tagline ?? "",
    description: basics.description ?? "",
  }

  if (!canEdit) {
    const typeLabel =
      organizationTypeOptions.find((option) => option.value === basics.type)
        ?.label ?? basics.type
    return (
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">{t("organizationName")}</dt>
          <dd className="font-medium">
            {organization?.name ?? t("organizationNameUnavailable")}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("organizationType")}</dt>
          <dd className="font-medium">{typeLabel}</dd>
        </div>
        {basics.tagline ? (
          <div>
            <dt className="text-muted-foreground">
              {t("organizationTaglineOptional")}
            </dt>
            <dd>{basics.tagline}</dd>
          </div>
        ) : null}
        {basics.description ? (
          <div>
            <dt className="text-muted-foreground">
              {t("organizationDescriptionOptional")}
            </dt>
            <dd className="whitespace-pre-wrap">{basics.description}</dd>
          </div>
        ) : null}
        <p className="text-muted-foreground">
          {t("organizationSetupReadOnly")}
        </p>
      </dl>
    )
  }

  return (
    <FormKit
      variant="embedded"
      defaultValues={defaultValues}
      schema={orgBasicsFormSchema}
      onSubmit={async (values) => {
        await toastManager.promise(
          (async () => {
            const data = await patchOrgSetup({
              basics: {
                type: values.type,
                tagline: values.tagline,
                description: values.description,
              },
            })
            queryClient.setQueryData(queryKey, data)
            await queryClient.invalidateQueries({ queryKey: ["org", "setup"] })
          })(),
          {
            loading: t("organizationSettingsSaving"),
            success: t("organizationSettingsSaved"),
            error: (error: unknown) =>
              error instanceof Error
                ? error.message
                : t("organizationSettingsSaveError"),
          }
        )
      }}
    >
      <p className="mb-4 text-sm">
        <span className="text-muted-foreground">{t("organizationName")}</span>{" "}
        <span className="font-medium">
          {organization?.name ?? t("organizationNameUnavailable")}
        </span>
      </p>
      <FormKit.Field
        type="radio-group"
        name="type"
        label={t("organizationType")}
        description={t("organizationTypeFieldDescription")}
        options={[...organizationTypeOptions]}
        required
      />
      <FormKit.Field
        type="text"
        name="tagline"
        label={t("organizationTaglineOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="textarea"
        name="description"
        label={t("organizationDescriptionOptional")}
        description={t("organizationDescriptionFieldDescription")}
      />
      <FormKit.Actions>
        <FormKit.Reset />
        <FormKit.Submit />
      </FormKit.Actions>
    </FormKit>
  )
}
