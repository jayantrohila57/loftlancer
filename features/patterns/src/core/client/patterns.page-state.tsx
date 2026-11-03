import { layoutContentClass } from "@features/shell/utils/shell.layout-spacing.utils";
import { Button } from "@loftlancer/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@loftlancer/ui/empty";
import { Frame, FramePanel } from "@loftlancer/ui/frame";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { cn } from "@loftlancer/ui/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageStatusShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[50vh] flex-1 flex-col items-center justify-center",
        layoutContentClass,
        className,
      )}
    >
      <Frame className="w-full max-w-lg">{children}</Frame>
    </div>
  );
}

export function PageStatusEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <PageStatusShell>
      <FramePanel>
        <Empty className="min-h-48 border-0">
          <EmptyHeader>
            {Icon ? (
              <EmptyMedia variant="icon">
                <Icon className="size-5" aria-hidden />
              </EmptyMedia>
            ) : null}
            <EmptyTitle>{title}</EmptyTitle>
            {description ? (
              <EmptyDescription>{description}</EmptyDescription>
            ) : null}
          </EmptyHeader>
          {action ? <EmptyContent>{action}</EmptyContent> : null}
        </Empty>
      </FramePanel>
    </PageStatusShell>
  );
}

export function PageStatusForbidden({
  icon,
  title = "Access denied",
  description = "You do not have permission to view this page.",
  action,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <PageStatusEmpty
      icon={icon}
      title={title}
      description={description}
      action={action}
    />
  );
}

export function PageStatusNotFound({
  icon,
  title = "Page not found",
  description = "This page does not exist or you no longer have access.",
  action,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <PageStatusEmpty
      icon={icon}
      title={title}
      description={description}
      action={action}
    />
  );
}

export function PageStatusError({
  title = "Something went wrong",
  description = "We could not load this content. Please try again.",
  onRetry,
  retryLabel = "Try again",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <PageStatusEmpty
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : undefined
      }
    />
  );
}

/**
 * Same shell and min-height as the empty/error/forbidden states, so swapping
 * loading → result never moves the frame.
 */
export function PageLoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <PageStatusShell>
      <FramePanel
        className="flex min-h-48 w-full flex-col justify-center gap-3"
        aria-busy="true"
      >
        <span className="sr-only">Loading…</span>
        {Array.from({ length: rows }, (_, index) => `loading-row-${index}`).map(
          (rowKey) => (
            <Skeleton
              key={rowKey}
              className="h-8 w-full rounded-md motion-reduce:animate-none"
            />
          ),
        )}
      </FramePanel>
    </PageStatusShell>
  );
}

export function DataEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Empty className="min-h-48 w-full border border-dashed">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}
