"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { Label } from "@loftlancer/ui/label";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@loftlancer/ui/sheet";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { Textarea } from "@loftlancer/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ClientRelativeTime } from "@/components/patterns/client-relative-time";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { actionToast } from "@/lib/action-toast";
import { trpc } from "@/utils/trpc";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "../hooks/task-meta";
import { FieldSelect } from "./field-select";
import { TaskCommentItem } from "./task-comment-item";

type Person = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

function toDateInput(d: Date | string | null) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export function TaskDetailSheet({
  projectId,
  number,
  people,
  onClose,
}: {
  projectId: string;
  number: number | null;
  people: Person[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const detailOptions = trpc.tasks.get.queryOptions({
    projectId,
    number: number ?? 0,
  });
  const detail = useQuery({ ...detailOptions, enabled: number !== null });
  const canUpdate = useCan("tasks.task.update", { projectId }).allowed;
  const canDelete = useCan("tasks.task.delete", { projectId }).allowed;
  const t = detail.data?.task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [labels, setLabels] = useState("");
  const [comment, setComment] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (t) {
      setTitle(t.title);
      setDescription(t.description ?? "");
      setLabels(t.labels.join(", "));
    }
  }, [t]);

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: detailOptions.queryKey }),
      queryClient.invalidateQueries({ queryKey: trpc.tasks.list.pathKey() }),
    ]);
  const update = useMutation({
    ...trpc.tasks.update.mutationOptions(),
    onSuccess: refresh,
  });
  const remove = useMutation({
    ...trpc.tasks.delete.mutationOptions(),
    onSuccess: refresh,
  });
  const addComment = useMutation({
    ...trpc.tasks.comment.mutationOptions(),
    onSuccess: refresh,
  });

  const patch = (
    data: Parameters<typeof update.mutateAsync>[0] extends infer P
      ? Omit<P, "taskId">
      : never,
  ) =>
    t &&
    actionToast(update.mutateAsync({ taskId: t.id, ...data }), {
      loading: "Saving…",
      success: "Task updated",
      error: "Couldn't save",
    });

  const personOptions = people.map((p) => ({
    value: p.id,
    label: p.name || p.email,
    hint: p.name ? p.email : undefined,
  }));
  const dirtyText =
    t &&
    (title.trim() !== t.title ||
      description !== (t.description ?? "") ||
      labels !== t.labels.join(", "));

  return (
    <Sheet open={number !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetPopup className="max-sm:max-h-[100dvh] max-sm:w-full max-sm:max-w-none sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-sm">
            {t ? `#${t.number}` : number ? `#${number}` : "Task"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {t ? (
              <>
                Created <ClientRelativeTime value={t.createdAt} />
              </>
            ) : (
              "\u00a0"
            )}
          </SheetDescription>
        </SheetHeader>
        <SheetPanel className="flex flex-col gap-4">
          {detail.isPending ? (
            <div className="flex flex-col gap-3" role="status" aria-busy="true">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          ) : detail.isError ? (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-sm">
                This task is unavailable. It may have been removed or you may no
                longer have access.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="self-start"
                onClick={() => void detail.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : !t ? (
            <p className="text-muted-foreground text-sm">
              This task is no longer available. Return to the task list to see
              the current project work.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="td-title" className="text-xs">
                  Title
                </Label>
                <Input
                  id="td-title"
                  size="sm"
                  value={title}
                  disabled={!canUpdate}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                <FieldSelect
                  ariaLabel="Status"
                  className="w-full"
                  disabled={!canUpdate}
                  value={t.status}
                  onChange={(v) => patch({ status: v as never })}
                  options={TASK_STATUS_OPTIONS}
                />
                <FieldSelect
                  ariaLabel="Priority"
                  className="w-full"
                  disabled={!canUpdate}
                  value={t.priority}
                  onChange={(v) => patch({ priority: v as never })}
                  options={TASK_PRIORITY_OPTIONS}
                />
                <FieldSelect
                  ariaLabel="Assignee"
                  className="w-full"
                  disabled={!canUpdate}
                  value={t.assigneeId ?? "none"}
                  onChange={(v) =>
                    patch({ assigneeId: v === "none" ? null : v })
                  }
                  options={[
                    { value: "none", label: "Unassigned" },
                    ...personOptions,
                  ]}
                />
                <Input
                  type="date"
                  size="sm"
                  aria-label="Due date"
                  disabled={!canUpdate}
                  value={toDateInput(t.dueDate)}
                  onChange={(e) =>
                    patch({
                      dueDate: e.target.value
                        ? new Date(`${e.target.value}T00:00:00Z`)
                        : null,
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="td-desc" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="td-desc"
                  rows={5}
                  value={description}
                  disabled={!canUpdate}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="td-labels" className="text-xs">
                  Labels (comma separated)
                </Label>
                <Input
                  id="td-labels"
                  size="sm"
                  value={labels}
                  disabled={!canUpdate}
                  onChange={(e) => setLabels(e.target.value)}
                />
              </div>
              {canUpdate ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    disabled={!dirtyText || !title.trim() || update.isPending}
                    onClick={() =>
                      patch({
                        title: title.trim(),
                        description: description || null,
                        labels: labels
                          .split(",")
                          .map((l) => l.trim())
                          .filter(Boolean)
                          .slice(0, 10),
                      })
                    }
                  >
                    Save changes
                  </Button>
                  {canDelete ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ms-auto text-destructive-foreground"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete task
                    </Button>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-border/60 border-t pt-4">
                <h3 className="font-medium text-sm">Comments</h3>
                {detail.data?.comments.length ? (
                  <ol className="flex flex-col gap-3">
                    {detail.data.comments.map((c) => (
                      <TaskCommentItem
                        key={c.id}
                        comment={c}
                        canEdit={
                          canUpdate && c.authorId === detail.data?.viewerId
                        }
                        canDelete={
                          c.authorId === detail.data?.viewerId ||
                          Boolean(detail.data?.canModerate)
                        }
                      />
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    No comments yet.
                  </p>
                )}
                {canUpdate ? (
                  <form
                    className="flex flex-col gap-1.5"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!comment.trim()) return;
                      const ids = mentions.filter((id) => {
                        const p = people.find((x) => x.id === id);
                        return p && comment.includes(`@${p.name || p.email}`);
                      });
                      await actionToast(
                        addComment.mutateAsync({
                          taskId: t.id,
                          body: comment,
                          mentionUserIds: ids,
                        }),
                        {
                          loading: "Posting…",
                          success: "Comment added",
                          error: "Couldn't add comment",
                        },
                      );
                      setComment("");
                      setMentions([]);
                    }}
                  >
                    <Textarea
                      rows={3}
                      aria-label="Comment"
                      placeholder="Write a comment…"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex items-center gap-1.5">
                      <FieldSelect
                        ariaLabel="Mention someone"
                        className="w-44"
                        value=""
                        placeholder="@ Mention…"
                        onChange={(id) => {
                          const p = people.find((x) => x.id === id);
                          if (!p) return;
                          setComment(
                            (c) =>
                              `${c}${c && !c.endsWith(" ") ? " " : ""}@${p.name || p.email} `,
                          );
                          setMentions((m) => [...new Set([...m, id])]);
                        }}
                        options={personOptions}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="ms-auto"
                        disabled={!comment.trim() || addComment.isPending}
                      >
                        Comment
                      </Button>
                    </div>
                  </form>
                ) : null}
              </div>
              <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                variant="destructive"
                title={`Delete task #${t.number}?`}
                description="The task and its comments are removed from this project."
                confirmLabel="Delete task"
                isPending={remove.isPending}
                onConfirm={async () => {
                  await actionToast(remove.mutateAsync({ taskId: t.id }), {
                    loading: "Deleting…",
                    success: "Task deleted",
                    error: "Couldn't delete",
                  });
                  setDeleteOpen(false);
                  onClose();
                }}
              />
            </>
          )}
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
}
