type PlatformAdminReader = () => boolean;

let readPlatformAdmin: PlatformAdminReader = () => false;

/** Server-only: `@loftlancer/orpc` registers AsyncLocalStorage reader at load time. */
export function registerPlatformAdminReader(reader: PlatformAdminReader): void {
  readPlatformAdmin = reader;
}

export function isPlatformAdminFlag(): boolean {
  return readPlatformAdmin();
}

/** True when Better Auth admin plugin marks the user with role `admin`. */
export function sessionUserIsPlatformAdmin(
  user: { role?: string | null } | null | undefined,
): boolean {
  return user?.role === "admin";
}
