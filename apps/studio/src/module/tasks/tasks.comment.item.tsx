"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@loftlancer/ui/avatar";
import { Button } from "@loftlancer/ui/button";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import { Textarea } from "@loftlancer/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ClientRelativeTime } from "@/components/patterns/client-relative-time";
import { actionToast } from "@/lib/action-toast";
import { initialsFromLabel } from "@/lib/initials";
import { trpc } from "@/utils/trpc";

export type TaskCommentView = {
  id: string;
  body: string;
  createdAt: Date | string;
  editedAt: Date | string | null;
  authorId: string | null;
  authorName: string | null;
  authorImage: string | null;
};

/** One comment: author can edit; author or project manager/owner can delete (#260). */
export function TaskCommentItem({
  comment: c,
  canEdit,
  canDelete,
}: {
  comment: TaskCommentView;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(c.body);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: trpc.tasks.get.pathKey() });
  const edit = useMutation({
    ...trpc.tasks.editComment.mutationOptions(),
    onSuccess: refresh,
  });
  const remove = useMutation({
    ...trpc.tasks.deleteComment.mutationOptions(),
    onSuccess: refresh,
  });

  return (
    <li className="group flex gap-2">
      <Avatar className="size-6">
        {c.authorImage ? <AvatarImage src={c.authorImage} alt="" /> : null}
        <AvatarFallback className="text-[9px]">
          {initialsFromLabel(c.authorName ?? "?", "?")}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex h-6 items-center gap-1.5 text-xs">
          <span className="font-medium">{c.authorName ?? "Deleted user"}</span>
          <span className="text-muted-foreground">
            <ClientRelativeTime value={c.createdAt} />
            {c.editedAt ? " · edited" : ""}
          </span>
          {!editing && (canEdit || canDelete) ? (
            <span className="ms-auto flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
              {canEdit ? (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setDraft(c.body);
                    setEditing(true);
                  }}
                >
                  Edit
                </Button>
              ) : null}
              {canDelete ? (
                <Button
                  size="xs"
                  variant="ghost"
                  className="text-destructive-foreground"
                  onClick={() => setConfirmOpen(true)}
                >
                  Delete
                </Button>
              ) : null}
            </span>
          ) : null}
        </div>
        {editing ? (
          <form
            className="flex flex-col gap-1.5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              await actionToast(
                edit.mutateAsync({ commentId: c.id, body: draft }),
                {
                  loading: "Saving…",
                  success: "Comment updated",
                  error: "Couldn't update comment",
                },
              );
              setEditing(false);
            }}
          >
            <Textarea
              rows={3}
              aria-label="Edit comment"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="flex justify-end gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!draft.trim() || draft === c.body || edit.isPending}
              >
                Save
              </Button>
            </div>
          </form>
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm">{c.body}</p>
        )}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="destructive"
        title="Delete comment?"
        description="The comment is removed from this task for everyone."
        confirmLabel="Delete comment"
        isPending={remove.isPending}
        onConfirm={async () => {
          await actionToast(remove.mutateAsync({ commentId: c.id }), {
            loading: "Deleting…",
            success: "Comment deleted",
            error: "Couldn't delete comment",
          });
          setConfirmOpen(false);
        }}
      />
    </li>
  );
}
