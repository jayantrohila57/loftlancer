"use client";

import { resolveAuthAppOrigin, studioHomeUrl } from "@loftlancer/ui/auth-links";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import {
  classifyInvitationAccessFailure,
  getInvitationSignInUrl,
} from "../lib/invitation-access";

export function useInvitationLanding(invitationId: string) {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = useSession();
  const [declined, setDeclined] = useState(false);
  const previewQuery = useQuery(
    trpc.organizations.getInvitationPreview.queryOptions({ invitationId }),
  );
  const preview = previewQuery.data;

  const detailsQuery = useQuery({
    queryKey: [
      "organization-invitation-details",
      invitationId,
      session?.user.id,
    ],
    enabled: Boolean(session?.user.id && preview?.status === "pending"),
    retry: false,
    queryFn: async () => {
      const result = await authClient.organization.getInvitation({
        query: { id: invitationId },
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Could not verify invitation");
      }
      if (!result.data) throw new Error("Could not verify invitation");
      return result.data;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.organization.acceptInvitation({
        invitationId,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Could not accept invitation");
      }
      return result.data;
    },
    onSuccess: () => queryClient.clear(),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.organization.rejectInvitation({
        invitationId,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Could not decline invitation");
      }
      return result.data;
    },
    onSuccess: () => setDeclined(true),
  });

  const accessFailure = classifyInvitationAccessFailure(
    detailsQuery.error instanceof Error ? detailsQuery.error.message : null,
  );
  const signInUrl = getInvitationSignInUrl(invitationId, {
    authUrl: resolveAuthAppOrigin(),
    studioUrl: studioHomeUrl(),
  });

  return {
    session,
    sessionPending,
    preview,
    previewPending: previewQuery.isPending,
    previewError: previewQuery.isError,
    refetchPreview: previewQuery.refetch,
    details: detailsQuery.data,
    detailsPending:
      detailsQuery.isPending && detailsQuery.fetchStatus !== "idle",
    detailsError: detailsQuery.isError,
    accessFailure,
    declined,
    acceptInvitation: acceptMutation.mutateAsync,
    accepting: acceptMutation.isPending,
    declineInvitation: rejectMutation.mutateAsync,
    declining: rejectMutation.isPending,
    signInUrl,
  };
}
