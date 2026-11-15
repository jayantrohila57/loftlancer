"use client"

import { withClientRetry } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { clientEnv } from "@packages/t3-env/client"
import { Button } from "@packages/ui/components/button"
import { Spinner } from "@packages/ui/components/spinner"
import { toastManager } from "@packages/ui/components/toast"
import { useLocale, useTranslations } from "next-intl"
import { useCallback, useEffect, useState } from "react"

import { isOrganizationOwnerRole } from "../../../utils/org.member-role"
import { readActiveOrganizationId } from "../../../utils/org.session"
import { useOrgListOrganizations } from "../../hooks/org.hook.list-organizations"
import {
  useOrgActiveMemberRole,
  useOrgSessionActiveId,
  useOrgSessionActiveIdPending,
} from "../../hooks/org.session.client"
import { switchActiveOrganization } from "../../utils/org.switch-active.client"

type BillingOverviewShape = {
  provisioningStep: string
  autumnBound: boolean
}

async function readBillingOverview(): Promise<BillingOverviewShape | null> {
  return withClientRetry(async () => {
    const result = await securityRpc.security.billing.overview()
    if (result.status !== "success" || !result.data) return null
    return {
      provisioningStep: result.data.provisioningStep,
      autumnBound: result.data.autumnBound,
    }
  })
}

async function resumeOrgProvisioning() {
  return withClientRetry(async () => {
    const result = await securityRpc.security.org.provisioning.resume()
    if (result.status !== "success") {
      throw new Error(result.message)
    }
    return result.data
  })
}

function provisioningIncomplete(overview: BillingOverviewShape | null) {
  if (!overview) return false
  return overview.provisioningStep !== "complete" || !overview.autumnBound
}

export function useOrgCreateProvisionResume() {
  const organizationId = useOrgSessionActiveId()
  const orgResolving = useOrgSessionActiveIdPending()
  const { role, isPending: rolePending } = useOrgActiveMemberRole()
  const { data: organizations, isPending: orgsPending } =
    useOrgListOrganizations()
  const [overview, setOverview] = useState<BillingOverviewShape | null>(null)
  const [checking, setChecking] = useState(false)

  const isOwner = Boolean(role && isOrganizationOwnerRole(role))

  const loadOverview = useCallback(async () => {
    if (!organizationId) {
      setOverview(null)
      return
    }
    setChecking(true)
    try {
      const data = await readBillingOverview()
      setOverview(data)
    } catch {
      setOverview(null)
    } finally {
      setChecking(false)
    }
  }, [organizationId])

  useEffect(() => {
    if (
      orgResolving ||
      orgsPending ||
      rolePending ||
      !isOwner ||
      !organizationId
    ) {
      return
    }
    void loadOverview()
  }, [
    isOwner,
    loadOverview,
    organizationId,
    orgResolving,
    orgsPending,
    rolePending,
  ])

  const showResume =
    isOwner &&
    !orgResolving &&
    !orgsPending &&
    !rolePending &&
    Boolean(organizationId) &&
    (checking || provisioningIncomplete(overview))

  return {
    showResume,
    checking,
    organizationId,
    organizations,
    overview,
    reloadOverview: loadOverview,
  }
}

export function OrgCreateProvisionResume(props: {
  readonly organizationId: string | null
  readonly organizationName?: string | null
  readonly onFinished?: () => void
}) {
  const t = useTranslations("ui")
  const locale = useLocale()
  const [pending, setPending] = useState(false)
  const accountOrgUrl = `${clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")}/${locale}/account/organization`

  async function onResume() {
    if (!props.organizationId || pending) return
    setPending(true)
    try {
      await toastManager.promise(
        (async () => {
          await resumeOrgProvisioning()
          await props.onFinished?.()
        })(),
        {
          loading: t("organizationProvisionResuming"),
          success: t("organizationProvisionResumed"),
          error: (error: unknown) =>
            error instanceof Error
              ? error.message
              : t("organizationProvisionResumeError"),
        }
      )
      window.location.assign(accountOrgUrl)
    } catch {
      // Toast reports failure.
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium">
        {t("organizationProvisionResumeTitle")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("organizationProvisionResumeDescription", {
          name: props.organizationName ?? t("organizations"),
        })}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button disabled={pending} onClick={() => void onResume()}>
          {pending ? <Spinner /> : null}{" "}
          {pending
            ? t("organizationProvisionResuming")
            : t("organizationProvisionResumeAction")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => {
            window.location.assign(accountOrgUrl)
          }}
        >
          {t("organizationSettings")}
        </Button>
      </div>
    </div>
  )
}

export function OrgCreateScreenProvisionerGate({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const t = useTranslations("ui")
  const { data: session } = authClient.useSession()
  const resume = useOrgCreateProvisionResume()
  const { data: organizations } = useOrgListOrganizations()
  const organizationName =
    organizations?.find((org) => org.id === resume.organizationId)?.name ?? null

  useEffect(() => {
    if (!resume.showResume || !resume.organizationId) return
    if (readActiveOrganizationId(session) === resume.organizationId) return
    void switchActiveOrganization({
      organizationId: resume.organizationId,
      switchErrorMessage: t("couldNotSwitchOrganization"),
    }).catch(() => {})
  }, [resume.organizationId, resume.showResume, session, t])

  if (resume.showResume && resume.organizationId) {
    return (
      <OrgCreateProvisionResume
        organizationId={resume.organizationId}
        organizationName={organizationName}
        onFinished={resume.reloadOverview}
      />
    )
  }

  return children
}
