"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export interface UseUnsavedChangesGuardOptions {
  isDirty: boolean;
  enabled?: boolean;
  onDiscard?: () => void;
  blockNavigation?: boolean;
}

export interface UseUnsavedChangesGuardResult {
  discardDialogOpen: boolean;
  setDiscardDialogOpen: (open: boolean) => void;
  handleOpenChange: (
    nextOpen: boolean,
    applyOpenChange: (open: boolean) => void,
  ) => void;
  allowNextCloseWithoutPrompt: () => void;
  confirmDiscard: () => void;
  cancelDiscard: () => void;
  guardNavigation: (action: () => void) => void;
  bypassGuardRef: RefObject<boolean>;
}

function isInternalNavigationHref(href: string): boolean {
  if (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return false;
  }
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function useUnsavedChangesGuard({
  isDirty,
  enabled = true,
  onDiscard,
  blockNavigation = false,
}: UseUnsavedChangesGuardOptions): UseUnsavedChangesGuardResult {
  const router = useRouter();
  const bypassGuardRef = useRef(false);
  const pendingCloseRef = useRef<((open: boolean) => void) | null>(null);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const historyMarkerId = useId();

  const active = enabled && isDirty;

  const allowNextCloseWithoutPrompt = useCallback(() => {
    bypassGuardRef.current = true;
  }, []);

  const finishPendingClose = useCallback(() => {
    const apply = pendingCloseRef.current;
    pendingCloseRef.current = null;
    bypassGuardRef.current = true;
    apply?.(false);
  }, []);

  const runPendingNavigation = useCallback(() => {
    const action = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    action?.();
  }, []);

  const cancelDiscard = useCallback(() => {
    pendingCloseRef.current = null;
    pendingNavigationRef.current = null;
    setDiscardDialogOpen(false);
  }, []);

  const confirmDiscard = useCallback(() => {
    setDiscardDialogOpen(false);
    onDiscard?.();
    if (pendingCloseRef.current) {
      finishPendingClose();
    }
    if (pendingNavigationRef.current) {
      bypassGuardRef.current = true;
      runPendingNavigation();
    }
  }, [finishPendingClose, onDiscard, runPendingNavigation]);

  const requestDiscardPrompt = useCallback(
    (applyClose: (open: boolean) => void) => {
      pendingCloseRef.current = applyClose;
      setDiscardDialogOpen(true);
    },
    [],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean, applyOpenChange: (open: boolean) => void) => {
      if (nextOpen) {
        applyOpenChange(true);
        return;
      }
      if (bypassGuardRef.current || !active) {
        bypassGuardRef.current = false;
        applyOpenChange(false);
        return;
      }
      requestDiscardPrompt(applyOpenChange);
    },
    [active, requestDiscardPrompt],
  );

  const guardNavigation = useCallback(
    (action: () => void) => {
      if (bypassGuardRef.current || !active) {
        bypassGuardRef.current = false;
        action();
        return;
      }
      pendingNavigationRef.current = action;
      setDiscardDialogOpen(true);
    },
    [active],
  );

  useEffect(() => {
    if (!active || !blockNavigation) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active, blockNavigation]);

  useEffect(() => {
    if (!active || !blockNavigation) return;

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || !isInternalNavigationHref(href)) return;

      event.preventDefault();
      event.stopPropagation();

      pendingNavigationRef.current = () => {
        router.push(href as Route);
      };
      setDiscardDialogOpen(true);
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [active, blockNavigation, router]);

  useEffect(() => {
    if (!active || !blockNavigation) return;

    const marker = `unsaved-${historyMarkerId}`;
    window.history.pushState({ [marker]: true }, "");

    const onPopState = () => {
      window.history.pushState({ [marker]: true }, "");
      pendingNavigationRef.current = () => {
        bypassGuardRef.current = true;
        router.back();
      };
      setDiscardDialogOpen(true);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [active, blockNavigation, historyMarkerId, router]);

  return {
    discardDialogOpen,
    setDiscardDialogOpen,
    handleOpenChange,
    allowNextCloseWithoutPrompt,
    confirmDiscard,
    cancelDiscard,
    guardNavigation,
    bypassGuardRef,
  };
}
