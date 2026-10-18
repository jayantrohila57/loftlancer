export function isOnboardingRoute(
  pathname: string,
  onboardingPath: string,
): boolean {
  return (
    pathname === onboardingPath || pathname.startsWith(`${onboardingPath}/`)
  );
}
