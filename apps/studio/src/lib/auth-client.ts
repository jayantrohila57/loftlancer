import { createLoftlancerAuthClient } from "@loftlancer/better-auth/client";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

/** Studio sibling auth at `<studio URL>/api/better-auth`. */
export const authClient = createLoftlancerAuthClient({
  baseURL: process.env.NEXT_PUBLIC_STUDIO_URL?.replace(/\/$/, ""),
  organizationsEnabled: isOrganizationsEnabledOnClient(),
});

/**
 * Better Auth's listMembers defaults to 100 rows, which made the Members page
 * show 100 of 353 (#251). Ask for every member explicitly.
 */
export const MEMBER_PAGE_LIMIT = 5000;
