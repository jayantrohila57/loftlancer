import type { ActionName } from "../types/authorization.action.types";

/**
 * First-party installable apps (apps system, #245). Code is the source of
 * truth; `project_app` rows record which project has which app installed.
 * No third-party apps for now. `plan` is reserved for paid plans later.
 */
export type AppNavItem = {
  path: string;
  label: string;
  action: ActionName | null;
};

/** A real, enforced app setting rendered on /p/[slug]/apps/[app] (#258). */
export type AppSettingDef = {
  key: string;
  label: string;
  description: string;
  type: "select";
  options: readonly { value: string; label: string }[];
  default: string;
};

export type AppManifest = {
  id: string;
  version: number;
  name: string;
  description: string;
  /** lucide icon name, resolved in the UI */
  icon: "KeyRound" | "ListTodo";
  category: string;
  /** Action names this app owns; blocked when the app isn't installed. */
  actions: readonly string[];
  /** What the install dialog shows. */
  permissions: readonly string[];
  dataCreated: readonly string[];
  nav: readonly AppNavItem[];
  settings: readonly AppSettingDef[];
  /** Reserved: "free" today; paid plans later. */
  plan: "free";
};

export const APP_RETENTION_DAYS = 30;

export const envApp: AppManifest = {
  id: "env",
  version: 1,
  name: "Environments",
  description:
    "Environments and encrypted variables with .env import and export.",
  icon: "KeyRound",
  category: "DevOps",
  actions: [
    "environment.read",
    "environment.create",
    "environment.update",
    "environment.delete",
    "variable.read",
    "variable.create",
    "variable.update",
    "variable.delete",
    "variable.reveal",
    "variable.export",
  ],
  permissions: [
    "Read and manage environments",
    "Read, reveal and export variables",
  ],
  dataCreated: ["Environments", "Encrypted variables"],
  nav: [{ path: "env", label: "Environments", action: "environment.read" }],
  settings: [],
  plan: "free",
};

export const tasksApp: AppManifest = {
  id: "tasks",
  version: 1,
  name: "Tasks",
  description:
    "Numbered tasks with status, priority, assignee, due date, labels and comments.",
  icon: "ListTodo",
  category: "Project management",
  actions: [
    "tasks.task.read",
    "tasks.task.create",
    "tasks.task.update",
    "tasks.task.delete",
    "tasks.comment.create",
  ],
  permissions: [
    "Read and manage tasks",
    "Comment on tasks",
    "Notify assignees and mentions",
  ],
  dataCreated: ["Tasks", "Task comments"],
  nav: [{ path: "tasks", label: "Tasks", action: "tasks.task.read" }],
  settings: [
    {
      key: "defaultStatus",
      label: "Default status",
      description: "Status new tasks start in.",
      type: "select",
      options: [
        { value: "backlog", label: "Backlog" },
        { value: "todo", label: "Todo" },
        { value: "in_progress", label: "In progress" },
      ],
      default: "todo",
    },
    {
      key: "defaultPriority",
      label: "Default priority",
      description: "Priority new tasks start with.",
      type: "select",
      options: [
        { value: "none", label: "No priority" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "urgent", label: "Urgent" },
      ],
      default: "none",
    },
  ],
  plan: "free",
};

export const appRegistry: readonly AppManifest[] = [envApp, tasksApp];

export type AppId = "env" | "tasks";

export function getAppManifest(id: string): AppManifest | undefined {
  return appRegistry.find((a) => a.id === id);
}

export function appIdForAction(action: string): AppId | undefined {
  return appRegistry.find((a) => a.actions.includes(action))?.id as
    | AppId
    | undefined;
}

/** Stored settings merged over manifest defaults; unknown keys/values dropped. */
export function resolveAppSettings(
  manifest: AppManifest,
  stored: unknown,
): Record<string, string> {
  const raw = (stored && typeof stored === "object" ? stored : {}) as Record<
    string,
    unknown
  >;
  const out: Record<string, string> = {};
  for (const def of manifest.settings) {
    const v = raw[def.key];
    out[def.key] =
      typeof v === "string" && def.options.some((o) => o.value === v)
        ? v
        : def.default;
  }
  return out;
}
