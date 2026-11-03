"use client";

// Thin wrapper: the single confirm API lives in @loftlancer/ui (#218).
export {
  type ConfirmRequest,
  useConfirm,
} from "@features/patterns/core/client/patterns.confirm-dialog";
