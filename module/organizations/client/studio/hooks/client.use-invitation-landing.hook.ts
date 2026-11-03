"use client";

import { resolveAuthAppOrigin, studioHomeUrl } from "@loftlancer/ui/auth-links";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { studioORPC } from "@/lib/orpc";
import { useSession } from "@/module/auth/auth.auth.actions";
import {
  classifyInvitationAccessFailure,
  getInvitationSignInUrl,
} from "../../../utils/utils.invitation-access";
import { useOrganizationOperationMutation } from "./client.use-organization-operation.hook";

export function useInvitationLanding(invitationId: string) {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = useSession();
  const [declined, setDeclined] = useState(false);
  const previewQuery = useQuery({
    queryKey: ["organizations", "invitation-preview", invitationId],
    queryFn: () => studioORPC.organizations.invitationPreview({ invitationId }),
    staleTime: 15_000,
    meta: { toastOnError: false },
  });
  const previewResponse = previewQuery.data;
  const preview =
    previewResponse?.status === "success" &&
    previewResponse.data !== null &&
    !Array.isArray(previewResponse.data)
      ? previewResponse.data
      : undefined;

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
  const acceptProjectMutation = useOrganizationOperationMutation(
    "invitation.accept",
    (input: { invitationId: string }) =>
      studioORPC.organizations.acceptProjectInvitation(input),
    { responseToast: false, onSuccess: () => queryClient.clear() },
  );
  const acceptTeamMutation = useOrganizationOperationMutation(
    "invitation.accept",
    (input: { invitationId: string }) =>
      studioORPC.organizations.acceptTeamInvitation(input),
    { responseToast: false, onSuccess: () => queryClient.clear() },
  );

  const acceptThroughOrganization = async (
    mutation: typeof acceptProjectMutation,
  ) => {
    const response = await mutation.mutateAsync({ invitationId });
    if (response.status !== "success") throw new Error(response.message);
    return response.data;
  };

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
    previewError:
      previewQuery.isError ||
      (previewResponse !== undefined && previewResponse.status !== "success"),
    refetchPreview: previewQuery.refetch,
    details: detailsQuery.data,
    detailsPending:
      detailsQuery.isPending && detailsQuery.fetchStatus !== "idle",
    detailsError: detailsQuery.isError,
    accessFailure,
    declined,
    acceptInvitation: () =>
      preview && preview.status !== "not_found" && preview.projectId
        ? acceptThroughOrganization(acceptProjectMutation)
        : preview && preview.status !== "not_found" && preview.teamId
          ? acceptThroughOrganization(acceptTeamMutation)
          : acceptMutation.mutateAsync(),
    accepting:
      acceptMutation.isPending ||
      acceptProjectMutation.isPending ||
      acceptTeamMutation.isPending,
    declineInvitation: rejectMutation.mutateAsync,
    declining: rejectMutation.isPending,
    signInUrl,
  };
}
