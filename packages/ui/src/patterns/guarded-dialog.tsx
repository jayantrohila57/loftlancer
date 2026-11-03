"use client";

import { Dialog } from "@loftlancer/ui/dialog";
import { useUnsavedChangesGuard } from "@loftlancer/ui/hooks/use-unsaved-changes-guard";
import { DiscardChangesDialog } from "@loftlancer/ui/patterns/discard-changes-dialog";
import type { ComponentProps, ReactNode, RefObject } from "react";
import { useCallback, useEffect } from "react";
import { FormSheetGuardProvider } from "./form-sheet-guard-context";

export type GuardedDialogProps = ComponentProps<typeof Dialog> & {
  isDirty?: boolean;
  onDiscard?: () => void;
  onClosed?: () => void;
  closeWithoutPromptRef?: RefObject<(() => void) | null>;
  children: ReactNode;
};

export function GuardedDialog({
  isDirty = false,
  onDiscard,
  onClosed,
  closeWithoutPromptRef,
  open,
  onOpenChange,
  children,
  ...props
}: GuardedDialogProps) {
  const guard = useUnsavedChangesGuard({
    isDirty,
    enabled: Boolean(open),
    onDiscard,
  });

  useEffect(() => {
    if (!closeWithoutPromptRef) return;
    closeWithoutPromptRef.current = guard.allowNextCloseWithoutPrompt;
    return () => {
      closeWithoutPromptRef.current = null;
    };
  }, [closeWithoutPromptRef, guard.allowNextCloseWithoutPrompt]);

  const requestClose = useCallback(() => {
    guard.handleOpenChange(false, (applied) => {
      (onOpenChange as ((open: boolean) => void) | undefined)?.(applied);
      if (!applied) onClosed?.();
    });
  }, [guard.handleOpenChange, onClosed, onOpenChange]);

  return (
    <FormSheetGuardProvider
      allowNextCloseWithoutPrompt={guard.allowNextCloseWithoutPrompt}
      requestClose={requestClose}
    >
      <Dialog
        open={open}
        onOpenChange={(next, eventDetails) =>
          guard.handleOpenChange(next, (applied) => {
            onOpenChange?.(applied, eventDetails);
            if (!applied) onClosed?.();
          })
        }
        {...props}
      >
        {children}
      </Dialog>
      <DiscardChangesDialog
        open={guard.discardDialogOpen}
        onOpenChange={(next) => {
          if (!next) guard.cancelDiscard();
          else guard.setDiscardDialogOpen(true);
        }}
        onDiscard={guard.confirmDiscard}
      />
    </FormSheetGuardProvider>
  );
}
