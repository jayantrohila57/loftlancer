"use client"

import { Badge } from "@packages/ui/components/badge"
import { useTranslations } from "next-intl"

import { deviceAuthorizationClientLabelKey } from "../../utils/constants/device-authorization.client-labels"
import { deviceAuthorizationScopeLabelKey } from "../../utils/constants/device-authorization.scope-labels"
import { parseDeviceAuthorizationScopes } from "../../utils/device-authorization.parse-scopes"

export interface DeviceAuthorizationRequestDetailsProps {
  readonly clientId?: string
  readonly scope?: string
  readonly status: string
  readonly userCode: string
}

export function DeviceAuthorizationRequestDetails({
  clientId,
  scope,
  status,
  userCode,
}: DeviceAuthorizationRequestDetailsProps) {
  const t = useTranslations("ui")
  const scopes = parseDeviceAuthorizationScopes(scope)
  const clientLabelKey = clientId
    ? deviceAuthorizationClientLabelKey(clientId)
    : null

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("deviceAuthorizationRequestSummary", {
          code: userCode,
          status,
        })}
      </p>

      {clientId ? (
        <section className="space-y-2 rounded-lg border p-3">
          <h2 className="text-sm font-medium">
            {t("deviceAuthorizationRequestingClientTitle")}
          </h2>
          <p className="text-sm">
            {clientLabelKey ? t(clientLabelKey) : clientId}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">
              {t("deviceAuthorizationClientIdHint")}
            </span>
            {": "}
            <span className="font-mono">{clientId}</span>
          </p>
        </section>
      ) : null}

      <section className="space-y-2 rounded-lg border p-3">
        <div className="space-y-1">
          <h2 className="text-sm font-medium">
            {t("deviceAuthorizationRequestedAccessTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("deviceAuthorizationRequestedAccessDescription")}
          </p>
        </div>
        {scopes.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {scopes.map((entry) => (
              <li className="rounded-md border px-3 py-2" key={entry}>
                <p className="font-mono text-xs">{entry}</p>
                <p className="text-muted-foreground">
                  {t(deviceAuthorizationScopeLabelKey(entry))}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("deviceAuthorizationNoScopesRequested")}
          </p>
        )}
      </section>

      <dl className="grid gap-2 rounded-lg border p-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-muted-foreground">
            {t("deviceAuthorizationStatus")}
          </dt>
          <dd>
            <Badge variant="outline">{status}</Badge>
          </dd>
        </div>
      </dl>
    </div>
  )
}
