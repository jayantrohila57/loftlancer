"use client";

import {
  type OrgRole,
  PERMISSION_MATRIX_ROWS,
  roleCapability,
} from "@loftlancer/actions";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
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
                      className="size-3.5 shrink-0 text-primary"
                    />
                  ) : cap === "grant" ? (
                    <AppIcon
                      name="variable"
                      className="size-3.5 shrink-0 text-muted-foreground"
                    />
                  ) : (
                    <AppIcon
                      name="minus"
                      className="size-3.5 shrink-0 text-muted-foreground/50"
                    />
                  )}
                  <span
                    className={
                      cap === "no"
                        ? "text-muted-foreground line-through decoration-muted-foreground/40"
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
                    <span className="ms-auto text-muted-foreground text-xs">
                      with access
                    </span>
                  ) : null}
                  {cap === "no" ? (
                    <span className="ms-auto text-muted-foreground text-xs">
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
