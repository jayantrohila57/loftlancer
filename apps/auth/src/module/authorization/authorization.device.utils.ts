/** Normalize RFC 8628 user codes for Better Auth device verification. */
export function formatDeviceUserCode(raw: string): string {
  return raw.trim().replace(/-/g, "").toUpperCase();
}
