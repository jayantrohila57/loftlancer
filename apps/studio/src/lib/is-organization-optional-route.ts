import { routes } from "@/utils/navigation";

export function isOrganizationOptionalRoute(pathname: string | null): boolean {
  return (
    pathname === routes.overview() ||
    pathname === routes.organizations() ||
    pathname === routes.newOrganization()
  );
}
