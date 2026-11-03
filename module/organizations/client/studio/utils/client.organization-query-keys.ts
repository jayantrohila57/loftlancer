export const organizationIdentityKey = (slug: string) =>
  ["organizations", "get-by-slug", slug] as const;
