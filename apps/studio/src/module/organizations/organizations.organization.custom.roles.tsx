"use client";

import {
  getActionDefinition,
  normalizeOrgRole,
  PERMISSION_MATRIX_ROWS,
} from "@loftlancer/actions";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Can } from "@/domain/permissions/components/can";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

export function OrganizationCustomRoles() {
  const client = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const roles = useQuery(trpc.organizations.listCustomRoles.queryOptions());
  const members = useQuery(trpc.organizations.listMembers.queryOptions());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const create = useMutation(
    trpc.organizations.createCustomRole.mutationOptions({
      onSuccess: () => {
        toast.success("Organization role created");
        setName("");
        setDescription("");
        setSelected([]);
        void client.invalidateQueries({
          queryKey: trpc.organizations.listCustomRoles.queryKey(),
        });
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const remove = useMutation(
    trpc.organizations.deleteCustomRole.mutationOptions({
      onSuccess: () => {
        toast.success("Organization role deleted");
        void client.invalidateQueries({
          queryKey: trpc.organizations.listCustomRoles.queryKey(),
        });
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const assign = useMutation(
    trpc.organizations.assignCustomRole.mutationOptions({
      onSuccess: () => {
        toast.success("Member role updated");
        void client.invalidateQueries({
          queryKey: trpc.organizations.listCustomRoles.queryKey(),
        });
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const update = useMutation(
    trpc.organizations.updateCustomRole.mutationOptions({
      onSuccess: () => {
        toast.success("Organization role updated");
        setEditingRoleId(null);
        setName("");
        setDescription("");
        setSelected([]);
        void client.invalidateQueries({
          queryKey: trpc.organizations.listCustomRoles.queryKey(),
        });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  return (
    <>
      <AccordionSection
        title="Custom organization roles"
        description="Custom roles can assign only the organization permissions listed below. They cannot grant owner-only, project, or app access."
      >
        <Can action="organization.role.create">
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const input = {
                name,
                description: description || undefined,
                actions: selected,
              };
              if (editingRoleId)
                update.mutate({ ...input, roleId: editingRoleId });
              else create.mutate(input);
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                aria-label="Role name"
                placeholder="Role name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={60}
                required
              />
              <Input
                aria-label="Role description"
                placeholder="Description (optional)"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={240}
              />
            </div>
            <fieldset className="grid gap-2 sm:grid-cols-2">
              <legend className="mb-2 font-medium text-sm">
                Organization permissions
              </legend>
              {PERMISSION_MATRIX_ROWS.filter(
                (row) =>
                  getActionDefinition(row.action).scope === "organization" &&
                  (row.manager !== "—" || row.member !== "—"),
              ).map((row) => (
                <label
                  className="flex items-center gap-2 text-sm"
                  key={row.action}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(row.action)}
                    onChange={(event) =>
                      setSelected((old) =>
                        event.target.checked
                          ? [...old, row.action]
                          : old.filter((value) => value !== row.action),
                      )
                    }
                  />
                  <span>
                    <span className="block">{row.label}</span>
                    <span className="block text-muted-foreground text-xs">
                      {getActionDefinition(row.action).description}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            <div>
              <Button
                type="submit"
                disabled={
                  create.isPending || update.isPending || name.trim().length < 2
                }
              >
                {editingRoleId ? "Save changes" : "Create role"}
              </Button>
              {editingRoleId ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingRoleId(null);
                    setName("");
                    setDescription("");
                    setSelected([]);
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Can>
        {roles.isError ? (
          <p role="alert" className="mt-4 text-destructive text-sm">
            Could not load custom roles: {roles.error.message}
          </p>
        ) : null}
        {roles.data?.length && members.data?.items.length ? (
          <Can action="organization.role.assign">
            <div className="mt-5 border-t pt-4">
              <h3 className="mb-2 font-medium text-sm">
                Assign roles to members
              </h3>
              <ul className="divide-y">
                {members.data.items
                  .filter(
                    (member) =>
                      normalizeOrgRole(member.role) === "member" &&
                      !member.suspendedAt,
                  )
                  .map((member) => {
                    const currentRole = roles.data.find((role) =>
                      role.memberIds.includes(member.id),
                    );
                    return (
                      <li
                        key={member.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-2"
                      >
                        <span className="text-sm">
                          {member.name || member.email}
                        </span>
                        <select
                          aria-label={`Custom role for ${member.name || member.email}`}
                          className="h-9 rounded-md border bg-background px-3 text-sm"
                          value={currentRole?.id ?? ""}
                          disabled={assign.isPending}
                          onChange={(event) =>
                            assign.mutate({
                              memberId: member.id,
                              roleId: event.target.value || null,
                            })
                          }
                        >
                          <option value="">Built-in role only</option>
                          {roles.data.map((role) => (
                            <option value={role.id} key={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </Can>
        ) : null}
        {roles.data?.length ? (
          <ul className="mt-4 divide-y">
            {roles.data.map((role) => (
              <li
                key={role.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium">{role.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {role.description ||
                      `${role.actions.length} permissions · ${role.memberIds.length} members`}
                  </p>
                </div>
                <Can action="organization.role.update">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingRoleId(role.id);
                      setName(role.name);
                      setDescription(role.description ?? "");
                      setSelected(role.actions);
                    }}
                  >
                    Edit
                  </Button>
                </Can>
                <Can action="organization.role.delete">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={remove.isPending}
                    onClick={() =>
                      confirm({
                        title: `Delete ${role.name}?`,
                        description: `This removes the role from ${role.memberIds.length} member${role.memberIds.length === 1 ? "" : "s"}. Their custom organization permissions end immediately.`,
                        confirmLabel: "Delete role",
                        variant: "destructive",
                        onConfirm: async () => {
                          await remove.mutateAsync({ roleId: role.id });
                        },
                      })
                    }
                  >
                    Delete
                  </Button>
                </Can>
              </li>
            ))}
          </ul>
        ) : roles.isSuccess ? (
          <p className="mt-4 text-muted-foreground text-sm">
            No custom roles yet.
          </p>
        ) : null}
      </AccordionSection>
      {ConfirmDialog}
    </>
  );
}
