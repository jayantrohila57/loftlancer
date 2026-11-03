import { AsyncLocalStorage } from "node:async_hooks";

export type ConsoleAuditContext = {
  source: "console";
};

const storage = new AsyncLocalStorage<ConsoleAuditContext>();

export function runWithConsoleAuditContext<T>(
  fn: () => T | Promise<T>,
): Promise<T> {
  return Promise.resolve(storage.run({ source: "console" }, fn));
}

export function getConsoleAuditContext(): ConsoleAuditContext | undefined {
  return storage.getStore();
}
