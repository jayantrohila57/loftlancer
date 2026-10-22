"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { Label } from "@loftlancer/ui/label";
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@loftlancer/ui/sheet";
import { Textarea } from "@loftlancer/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { actionToast } from "@/lib/action-toast";
import { trpc } from "@/utils/trpc";
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  type TaskPriority,
  type TaskStatus,
} from "../hooks/task-meta";
import { FieldSelect } from "./field-select";

export function CreateTaskSheet({
  open,
  onOpenChange,
  projectId,
  people,
  onCreated,
  defaults,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  people: { value: string; label: string; hint?: string }[];
  onCreated: (number: number) => void;
  defaults?: { status: TaskStatus; priority: TaskPriority };
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaults?.status ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(
    defaults?.priority ?? "none",
  );
  const [assigneeId, setAssigneeId] = useState("none");
  const create = useMutation({
    ...trpc.tasks.create.mutationOptions(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: trpc.tasks.list.pathKey() }),
  });

  // App settings (#258) load after mount; adopt them while the sheet is closed.
  useEffect(() => {
    if (!open && defaults) {
      setStatus(defaults.status);
      setPriority(defaults.priority);
    }
  }, [open, defaults]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setStatus(defaults?.status ?? "todo");
    setPriority(defaults?.priority ?? "none");
    setAssigneeId("none");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const created = await actionToast(
      create.mutateAsync({
        projectId,
        title,
        description: description.trim() || null,
        status,
        priority,
        assigneeId: assigneeId === "none" ? null : assigneeId,
      }),
      {
        loading: "Creating task…",
        success: "Task created",
        error: "Couldn't create task",
      },
    );
    reset();
    onOpenChange(false);
    onCreated(created.number);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup className="max-sm:max-h-[100dvh] max-sm:w-full max-sm:max-w-none">
        <form onSubmit={submit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>New task</SheetTitle>
            <SheetDescription>Tasks are numbered per project.</SheetDescription>
          </SheetHeader>
          <SheetPanel className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-title" className="text-xs">
                Title
              </Label>
              <Input
                id="task-title"
                size="sm"
                value={title}
                maxLength={200}
                required
                autoFocus
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-desc" className="text-xs">
                Description
              </Label>
              <Textarea
                id="task-desc"
                value={description}
                rows={5}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              <FieldSelect
                ariaLabel="Status"
                className="w-full"
                value={status}
                onChange={(v) => setStatus(v as TaskStatus)}
                options={TASK_STATUS_OPTIONS}
              />
              <FieldSelect
                ariaLabel="Priority"
                className="w-full"
                value={priority}
                onChange={(v) => setPriority(v as TaskPriority)}
                options={TASK_PRIORITY_OPTIONS}
              />
            </div>
            <FieldSelect
              ariaLabel="Assignee"
              className="w-full"
              value={assigneeId}
              onChange={setAssigneeId}
              options={[{ value: "none", label: "Unassigned" }, ...people]}
            />
          </SheetPanel>
          <SheetFooter>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim() || create.isPending}
            >
              Create task
            </Button>
          </SheetFooter>
        </form>
      </SheetPopup>
    </Sheet>
  );
}
