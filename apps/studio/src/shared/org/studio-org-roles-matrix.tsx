import type { OrgProductRoleId } from "@modules/org"
import {
  ORG_PRODUCT_PERMISSION_ROWS,
  ORG_PRODUCT_ROLE_IDS,
  orgProductRolePermissionMatrix,
} from "@modules/org"
import { Check, Minus } from "lucide-react"

type StudioOrgRolesMatrixProps = {
  readonly t: (key: string) => string
}

function roleColumnLabel(
  role: OrgProductRoleId,
  t: StudioOrgRolesMatrixProps["t"]
) {
  if (role === "owner") return t("organizationRoleOwner")
  if (role === "admin") return t("organizationRoleAdmin")
  if (role === "manager") return t("organizationRoleManager")
  return t("organizationRoleMember")
}

export function StudioOrgRolesMatrix({ t }: StudioOrgRolesMatrixProps) {
  const matrix = orgProductRolePermissionMatrix()
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[36rem] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left">
            <th className="px-4 py-3 font-medium" scope="col">
              {t("organizationPermissionColumn")}
            </th>
            {ORG_PRODUCT_ROLE_IDS.map((role) => (
              <th key={role} className="px-3 py-3 font-medium" scope="col">
                {roleColumnLabel(role, t)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ORG_PRODUCT_PERMISSION_ROWS.map((row) => (
            <tr key={row.id} className="border-b last:border-b-0">
              <th className="px-4 py-3 text-left font-normal text-muted-foreground">
                {t(row.labelKey)}
              </th>
              {ORG_PRODUCT_ROLE_IDS.map((role) => {
                const allowed = matrix[role][row.id]
                return (
                  <td key={role} className="px-3 py-3 text-center">
                    {allowed ? (
                      <Check
                        aria-label={t("organizationPermissionAllowed")}
                        className="mx-auto size-4 text-primary"
                      />
                    ) : (
                      <Minus
                        aria-label={t("organizationPermissionDenied")}
                        className="mx-auto size-4 text-muted-foreground"
                      />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
