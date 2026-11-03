export type FileContext = {
  userId: string;
  organizationId: string;
  projectId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};
