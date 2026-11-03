export function deletedAccountUserUpdate(userId: string) {
  return {
    name: "Deleted user",
    email: `deleted-${userId}@users.deleted.local`,
    image: null,
    deletedAt: new Date(),
    deletedBy: userId,
  };
}
