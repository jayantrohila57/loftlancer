export const TASK_STATUS_OPTIONS = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "canceled", label: "Canceled" },
] as const;

export const TASK_PRIORITY_OPTIONS = [
  { value: "none", label: "No priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export type TaskStatus = (typeof TASK_STATUS_OPTIONS)[number]["value"];
export type TaskPriority = (typeof TASK_PRIORITY_OPTIONS)[number]["value"];

export const statusLabel = (v: string) =>
  TASK_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v;
export const priorityLabel = (v: string) =>
  TASK_PRIORITY_OPTIONS.find((o) => o.value === v)?.label ?? v;

export const statusBadgeVariant = (v: string) =>
  v === "done"
    ? "success"
    : v === "in_progress"
      ? "info"
      : v === "canceled"
        ? "secondary"
        : "outline";
export const priorityBadgeVariant = (v: string) =>
  v === "urgent" ? "error" : v === "high" ? "warning" : "outline";
