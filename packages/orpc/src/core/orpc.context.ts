import { auth } from "@loftlancer/better-auth";
import type { NextRequest } from "next/server";
import "@features/authentication/core/server/authentication.register-better-auth-product-hooks";
import { createContextWithAuth } from "./orpc.create-context";

export async function createContext(req: NextRequest) {
  return createContextWithAuth(req, auth);
}

export type { Context } from "./orpc.create-context";
