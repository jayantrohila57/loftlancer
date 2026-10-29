import { KeyRound, LayoutGrid, ListTodo, Settings } from "@/lib/icons";
import { cn } from "@/lib/utils";

const icons: Record<string, typeof KeyRound> = {
  KeyRound,
  LayoutGrid,
  ListTodo,
  Settings,
};

/** Square app tile icon (reui card-style, dense). */
export function AppGlyph({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = icons[icon] ?? ListTodo;
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50",
        className,
      )}
      aria-hidden
    >
      <Icon className="size-4 text-muted-foreground" />
    </span>
  );
}
