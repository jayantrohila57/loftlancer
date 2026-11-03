export type PermissionCheckInput = {
  action: string;
  subjectId?: string;
  resourceId?: string;
};

export type PermissionCheckResult = {
  allowed: boolean;
};

export function checkPermission(
  _input: PermissionCheckInput,
): PermissionCheckResult {
  throw new Error("not implemented");
}
