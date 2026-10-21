"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { FormField } from "@/components/patterns/form-field";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

type Challenge = { name: string; value: string };

export function OrganizationSecurityDomains() {
  const client = useQueryClient();
  const { orgs, activeOrganizationId } = useActiveOrganization();
  const canManage =
    orgs.find((org) => org.id === activeOrganizationId)?.role === "owner";
  const query = useQuery(trpc.organizations.listSecurityDomains.queryOptions());
  const [hostname, setHostname] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const invalidate = () =>
    client.invalidateQueries({
      queryKey: trpc.organizations.listSecurityDomains.queryKey(),
    });
  const create = useMutation(
    trpc.organizations.createSecurityDomain.mutationOptions({
      onSuccess: async (result) => {
        setChallenge(result.txtRecord);
        setHostname("");
        await invalidate();
        toast.success(
          "Domain added. Publish the TXT record to prove ownership.",
        );
      },
      onError: () => toast.error("Could not add this domain."),
    }),
  );
  const verify = useMutation(
    trpc.organizations.verifySecurityDomain.mutationOptions({
      onSuccess: async (result) => {
        if (result.verified) {
          toast.success(result.message);
          setChallenge(null);
        } else toast.error(result.message);
        await invalidate();
      },
      onError: () => toast.error("Could not verify domain ownership."),
    }),
  );
  const revoke = useMutation(
    trpc.organizations.revokeSecurityDomain.mutationOptions({
      onSuccess: async () => {
        setRevokeId(null);
        await invalidate();
        toast.success("Domain removed.");
      },
      onError: () => toast.error("Could not remove domain."),
    }),
  );
  const domainToRevoke = query.data?.items.find((item) => item.id === revokeId);

  return (
    <>
      <AccordionSection
        title="Email domains"
        description="Verify domain ownership with DNS. Verification alone does not grant membership or change sign-in behavior."
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <FormField
            id="organization-domain"
            label="Email domain"
            hint="Add a domain such as example.com. Workspace-host routing is not configured."
          >
            <Input
              id="organization-domain"
              value={hostname}
              disabled={!canManage || create.isPending}
              onChange={(event) => setHostname(event.target.value)}
              placeholder="example.com"
            />
          </FormField>
          <Button
            disabled={!canManage || !hostname.trim() || create.isPending}
            onClick={() => create.mutate({ hostname })}
          >
            {create.isPending ? "Adding…" : "Add domain"}
          </Button>
        </div>
        {challenge ? (
          <div className="mt-4 space-y-2 rounded-md border p-3 text-sm">
            <p className="font-medium">
              Publish this DNS TXT record, then choose Verify.
            </p>
            <p className="break-all">
              <span className="font-medium">Name:</span> {challenge.name}
            </p>
            <p className="break-all">
              <span className="font-medium">Value:</span> {challenge.value}
            </p>
            <p className="text-muted-foreground text-xs">
              The token is shown once and expires in 24 hours.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                void navigator.clipboard
                  .writeText(`${challenge.name} TXT ${challenge.value}`)
                  .then(
                    () => toast.success("DNS record copied."),
                    () => toast.error("Could not copy DNS record."),
                  )
              }
            >
              Copy record
            </Button>
          </div>
        ) : null}
        <div className="mt-4 divide-y rounded-md border">
          {query.isPending ? (
            <p className="p-3 text-muted-foreground text-sm">
              Loading domains…
            </p>
          ) : null}
          {query.isError ? (
            <p className="p-3 text-destructive text-sm">
              Domains could not be loaded. Reload this page and try again.
            </p>
          ) : null}
          {query.data?.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">{item.hostname}</p>
                <p className="text-muted-foreground text-xs">
                  {item.state === "verified"
                    ? "Ownership verified"
                    : item.state === "pending"
                      ? "Waiting for DNS verification"
                      : "Removed"}
                </p>
              </div>
              <div className="flex gap-2">
                {item.state === "pending" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canManage || verify.isPending}
                    onClick={() => verify.mutate({ domainId: item.id })}
                  >
                    Verify
                  </Button>
                ) : null}
                {item.state !== "revoked" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!canManage || revoke.isPending}
                    onClick={() => setRevokeId(item.id)}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
          {!query.isPending &&
          !query.isError &&
          query.data?.items.length === 0 ? (
            <p className="p-3 text-muted-foreground text-sm">
              No email domains added.
            </p>
          ) : null}
        </div>
        <p className="mt-4 text-muted-foreground text-sm">
          MFA enforcement, SSO, and custom workspace domains are unavailable
          until the authentication provider and host routing are configured.
          They are not reported as active.
        </p>
      </AccordionSection>
      <ConfirmDialog
        open={Boolean(domainToRevoke)}
        onOpenChange={(open) => {
          if (!open) setRevokeId(null);
        }}
        title="Remove verified domain"
        description={
          domainToRevoke
            ? `Remove ${domainToRevoke.hostname}? It will no longer be available for organization checks.`
            : "Remove this domain?"
        }
        confirmLabel="Remove domain"
        variant="destructive"
        isPending={revoke.isPending}
        onConfirm={() => {
          if (revokeId) revoke.mutate({ domainId: revokeId });
        }}
      />
    </>
  );
}
