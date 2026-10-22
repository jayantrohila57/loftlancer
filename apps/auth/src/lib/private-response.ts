export function setPrivateNoStore(headers: Headers): void {
  headers.set("Cache-Control", "private, no-store");
}
