export function allowLoftlancerIdentity(profile) {
  if (!profile || typeof profile.sub !== "string" || !profile.sub) return null;
  if (typeof profile.email !== "string" || profile.email.toLowerCase() !== "jrohila55@gmail.com" || profile.email_verified !== true) return null;
  return { id: profile.sub, name: profile.name || profile.email, email: profile.email, emailVerified: true };
}
