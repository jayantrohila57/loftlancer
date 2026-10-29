"use client";
import { authClient } from "@/lib/auth-client";

export async function updateProfile(input: { name?: string; image?: string }) {
  const result = await authClient.updateUser(input);
  if (result.error) {
    throw new Error(result.error.message ?? "Could not update profile");
  }
  return result.data;
}
