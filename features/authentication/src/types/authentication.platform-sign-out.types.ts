export type PlatformSignOutOptions = {
  /** Clear React Query (or other) client caches before navigating away. */
  onClearClient?: () => void;
  /** Revoke the session (Better Auth `signOut()` on this origin). */
  signOutLocal?: () => Promise<unknown>;
  /** Where to land afterwards; defaults to the public landing. */
  returnTo?: string;
};
