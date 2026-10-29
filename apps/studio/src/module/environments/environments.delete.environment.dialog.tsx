"use client";

import { Button } from "@loftlancer/ui/button";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@loftlancer/ui/tooltip";
import { useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";

interface DeleteEnvironmentDialogProps {
  environmentName: string;
  onConfirm: () => Promise<void>;
  isPending: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function DeleteEnvironmentDialog({
  environmentName,
  onConfirm,
  isPending,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}: DeleteEnvironmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  return (
    <>
      {!hideTrigger ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0"
                aria-label={`Delete ${environmentName} environment`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
              />
            }
          >
            <AppIcon name="delete" className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Delete environment</TooltipContent>
        </Tooltip>
      ) : null}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete environment"
        description={`Delete "${environmentName}" and all variables in it? This cannot be undone.`}
        confirmLabel="Delete environment"
        confirmText={environmentName}
        variant="destructive"
        isPending={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
