"use client";

import {
  type UseUnsavedChangesGuardOptions,
  useUnsavedChangesGuard,
} from "@features/patterns/core/client/patterns.use-unsaved-changes-guard.hook";
import type { ReactNode } from "react";
import { DiscardChangesDialog } from "./patterns.discard-changes-dialog";

type UnsavedChangesPageGuardProps = Pick<
  UseUnsavedChangesGuardOptions,
  "isDirty" | "onDiscard"
> & {
  children: (helpers: {
    guardNavigation: (action: () => void) => void;
    allowNextNavigationWithoutPrompt: () => void;
  }) => ReactNode;
};

export function UnsavedChangesPageGuard({
  isDirty,
  onDiscard,
  children,
}: UnsavedChangesPageGuardProps) {
  const guard = useUnsavedChangesGuard({
    isDirty,
    enabled: true,
    onDiscard,
    blockNavigation: true,
  });

  return (
    <>
      {children({
        guardNavigation: guard.guardNavigation,
        allowNextNavigationWithoutPrompt: guard.allowNextCloseWithoutPrompt,
      })}
      <DiscardChangesDialog
        open={guard.discardDialogOpen}
        onOpenChange={(next) => {
          if (!next) guard.cancelDiscard();
          else guard.setDiscardDialogOpen(true);
        }}
        onDiscard={guard.confirmDiscard}
      />
    </>
  );
}
