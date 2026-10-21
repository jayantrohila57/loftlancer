"use client";

import { type ReactNode, useCallback, useId, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";

/**
 * Single confirm API for Loftlancer (reui dialog-3 inspired, dense).
 * Pass `confirmText` to require type-to-confirm for destructive deletes.
 */
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  title: string;
  description: ReactNode;
  content?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  /** When set, the user must type this exact value before confirming. */
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onOpenChangeComplete,
  title,
  description,
  content,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "default",
  confirmText,
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const inputId = useId();
  const [typed, setTyped] = useState("");
  const [running, setRunning] = useState(false);
  const busy = isPending || running;
  const needsTyping = Boolean(confirmText);
  const matches = !needsTyping || typed === confirmText;

  const handleConfirm = async () => {
    if (!matches || busy) return;
    setRunning(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Keep dialog open; caller surfaces the error (toast / inline).
    } finally {
      setRunning(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy && !next) return;
        onOpenChange(next);
      }}
      onOpenChangeComplete={(next) => {
        if (!next) setTyped("");
        onOpenChangeComplete?.(next);
      }}
    >
      <DialogPopup className="max-w-md" showCloseButton={false}>
        <DialogHeader className="gap-1.5 p-4 max-sm:pb-3">
          <DialogTitle className="font-semibold text-base">{title}</DialogTitle>
          <DialogDescription className="text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>
        {content || needsTyping ? (
          <DialogPanel className="px-4 pt-0 pb-4">
            {content}
            {needsTyping ? (
              <form
                className="mt-3 flex flex-col gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleConfirm();
                }}
              >
                <label
                  htmlFor={inputId}
                  className="text-muted-foreground text-xs"
                >
                  Type{" "}
                  <span className="font-medium font-mono text-foreground">
                    {confirmText}
                  </span>{" "}
                  to confirm
                </label>
                <Input
                  id={inputId}
                  size="sm"
                  value={typed}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy}
                  placeholder={confirmText}
                  onChange={(e) => setTyped(e.target.value)}
                />
              </form>
            ) : null}
          </DialogPanel>
        ) : null}
        <DialogFooter className="gap-1.5 px-4 py-3">
          <DialogClose
            render={<Button variant="ghost" size="sm" disabled={busy} />}
          >
            {cancelLabel}
          </DialogClose>
          <Button
            type="button"
            size="sm"
            variant={variant === "destructive" ? "destructive" : "default"}
            loading={busy}
            disabled={!matches || busy}
            aria-label={busy ? `${confirmLabel}…` : undefined}
            onClick={() => void handleConfirm()}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

export type ConfirmRequest = Omit<
  ConfirmDialogProps,
  "open" | "onOpenChange" | "onOpenChangeComplete" | "isPending"
>;

/** Imperative helper: `confirm({...})` then render `ConfirmDialog` outlet. */
export function useConfirm() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const [open, setOpen] = useState(false);

  const confirm = useCallback((options: ConfirmRequest) => {
    setRequest(options);
    setOpen(true);
  }, []);

  const outlet = request ? (
    <ConfirmDialog
      {...request}
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(next) => {
        if (!next) setRequest(null);
      }}
    />
  ) : null;

  return { confirm, ConfirmDialog: outlet };
}
