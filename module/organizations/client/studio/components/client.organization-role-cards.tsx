"use client";

import {
  type OrgRole,
  PERMISSION_MATRIX_ROWS,
  roleCapability,
} from "@features/authorization/utils";
import { AccordionSection } from "@features/patterns/core/client/patterns.accordion-section";
import { AppIcon } from "@/components/patterns/app-icon";
import { RoleBadge } from "@/components/patterns/status-badge";

const ROLES: { role: OrgRole; summary: string }[] = [
  {
    role: "owner",
    summary:
      "Can manage members and settings, transfer ownership, archive, restore, or delete the organization.",
  },
  {
    role: "manager",
    summary:
      "Can invite members and manage teams; project access must be assigned.",
  },
  {
    role: "member",
    summary:
      "Can view organization information and work in projects they can access.",
  },
];

/**
 * One card per built-in role (reui settings-5). Every row is computed from
 * the same evaluator the API enforces, so nothing here is aspirational.
 */
export function OrganizationRoleCards() {
  return (
    <div className="flex flex-col gap-3">
      {ROLES.map(({ role, summary }) => (
        <AccordionSection
          key={role}
          title={<RoleBadge role={role} />}
          description={summary}
        >
          <ul className="flex flex-col gap-2">
            {PERMISSION_MATRIX_ROWS.map((row) => {
              const cap = roleCapability(row.action, role);
              return (
                <li
                  key={row.action}
                  className="flex items-center gap-2 text-sm"
                >
                  {cap === "yes" ? (
                    <AppIcon
                      name="check"
                      className="text-primary size-3.5 shrink-0"
                    />
                  ) : cap === "grant" ? (
                    <AppIcon
                      name="variable"
                      className="text-muted-foreground size-3.5 shrink-0"
                    />
                  ) : (
                    <AppIcon
                      name="minus"
                      className="text-muted-foreground/50 size-3.5 shrink-0"
                    />
                  )}
                  <span
                    className={
                      cap === "no"
                        ? "text-muted-foreground decoration-muted-foreground/40 line-through"
                        : undefined
                    }
                  >
                    <span className="sr-only">
                      {cap === "yes"
                        ? "Allowed: "
                        : cap === "grant"
                          ? "With project access: "
                          : "Not allowed: "}
                    </span>
                    {row.label}
                  </span>
                  {cap === "grant" ? (
                    <span className="text-muted-foreground ms-auto text-xs">
                      with access
                    </span>
                  ) : null}
                  {cap === "no" ? (
                    <span className="text-muted-foreground ms-auto text-xs">
                      Not included
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </AccordionSection>
      ))}
    </div>
  );
}
