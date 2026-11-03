import "server-only";

import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import {
  PageForbiddenError,
  PageNotFoundError,
} from "../authentication.page-guard-errors";

export function redirectToForbidden(): never {
  redirect("/forbidden" as Route);
}

export async function runPageGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    applyPageGuardError(error);
  }
}

export function applyPageGuardError(error: unknown): never {
  if (error instanceof PageNotFoundError) {
    notFound();
  }
  if (error instanceof PageForbiddenError) {
    redirectToForbidden();
  }
  throw error;
}
