"use client";
import { toastManager } from "@loftlancer/ui/toast";
import { applyResponseToast } from "@module/shared/client/apply-response-toast";
import { trackActionIntent } from "@module/shared/client/track-action-intent";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studioORPC } from "@/lib/orpc";
import { teamsQueryKeys } from "../../../utils/constants/utils.query-keys.constants";
import type { TeamCreateInput } from "../../../utils/validation/utils.create-team.validation";
export function useTeamCreate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: TeamCreateInput) => {
      trackActionIntent("team.create");
      return studioORPC.teams.create(input);
    },
    meta: { skipGlobalErrorToast: true },
    onSuccess: async (response) => {
      applyResponseToast(response, {
        success: (title) => {
          toastManager.add({ title, type: "success" });
        },
        warning: (title) => {
          toastManager.add({ title, type: "warning" });
        },
        error: (title) => {
          toastManager.add({ title, type: "error" });
        },
      });
      if (response.status === "success")
        await client.invalidateQueries({ queryKey: teamsQueryKeys.all });
    },
    onError: () =>
      applyResponseToast(
        {
          status: "error",
          data: null,
          message: "Could not create team. Please try again.",
          error: { code: "NETWORK_ERROR" },
        },
        {
          success: () => {},
          warning: () => {},
          error: (title) => {
            toastManager.add({ title, type: "error" });
          },
        },
      ),
  });
}
