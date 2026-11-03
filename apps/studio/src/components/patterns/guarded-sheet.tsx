"use client";

import { DiscardChangesDialog } from "@features/patterns/core/client/patterns.discard-changes-dialog";
import { useUnsavedChangesGuard } from "@features/patterns/core/client/patterns.use-unsaved-changes-guard.hook";
import { Sheet } from "@loftlancer/ui/sheet";
import type { ComponentProps, ReactNode, RefObject } from "react";
import { useCallback, useEffect } from "react";
import { FormSheetGuardProvider } from "@/components/patterns/form-sheet-guard-context";

export type GuardedSheetProps = ComponentProps<typeof Sheet> & {
  isDirty?: boolean;
  onDiscard?: () => void;
  onClosed?: () => void;
  closeWithoutPromptRef?: RefObject<(() => void) | null>;
  children: ReactNode;
};

export function GuardedSheet({
  isDirty = false,
  onDiscard,
  onClosed,
  closeWithoutPromptRef,
  open,
  onOpenChange,
  children,
  ...props
}: GuardedSheetProps) {
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
      <Sheet
        open={Boolean(open) && !guard.discardDialogOpen}
        onOpenChange={(next, eventDetails) =>
          guard.handleOpenChange(next, (applied) => {
            onOpenChange?.(applied, eventDetails);
            if (!applied) onClosed?.();
          })
        }
        {...props}
      >
        {children}
      </Sheet>
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
