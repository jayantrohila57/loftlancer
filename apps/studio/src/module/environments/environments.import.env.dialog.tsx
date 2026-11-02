"use client";

import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import { Checkbox } from "@loftlancer/ui/checkbox";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@loftlancer/ui/dialog";
import { Label } from "@loftlancer/ui/label";
import { Textarea } from "@loftlancer/ui/textarea";
import { useMemo, useRef, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { GuardedDialog } from "@/components/patterns/guarded-dialog";
import { parseDotenv } from "@/lib/dotenv";

/**
 * Paste-a-.env import (reui form-8 pattern): textarea → parsed preview with
 * create/update/skip per key → bulkImport. Fixed-height preview so the
 * dialog never resizes while typing or saving.
 */
export function ImportEnvDialog({
  open,
  onOpenChange,
  initialText,
  existingKeys,
  onImport,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialText: string;
  existingKeys: Set<string>;
  onImport: (input: {
    variables: { key: string; value: string }[];
    overwrite: boolean;
  }) => Promise<unknown>;
  isPending: boolean;
}) {
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [text, setText] = useState(initialText);
  const [overwrite, setOverwrite] = useState(false);
  const [lastInitial, setLastInitial] = useState(initialText);
  if (initialText !== lastInitial) {
    setLastInitial(initialText);
    setText(initialText);
  }

  const { entries, invalidLines } = useMemo(() => parseDotenv(text), [text]);
  const counts = useMemo(() => {
    let create = 0;
    let update = 0;
    let skip = 0;
    for (const e of entries) {
      if (!existingKeys.has(e.key)) create += 1;
      else if (overwrite) update += 1;
      else skip += 1;
    }
    return { create, update, skip };
  }, [entries, existingKeys, overwrite]);

  const resetDraft = () => {
    setText("");
    setOverwrite(false);
  };

  const submit = async () => {
    await onImport({ variables: entries, overwrite });
    closeWithoutPromptRef.current?.();
    onOpenChange(false);
    resetDraft();
  };

  const isDirty = text.trim().length > 0;

  return (
    <GuardedDialog
      open={open}
      onOpenChange={onOpenChange}
      isDirty={isDirty}
      onDiscard={resetDraft}
      onClosed={resetDraft}
      closeWithoutPromptRef={closeWithoutPromptRef}
    >
      <DialogContent className="sm:max-w-xl" data-testid="import-env-dialog">
        <DialogHeader>
          <DialogTitle>Import .env</DialogTitle>
          <DialogDescription>
            Paste KEY=value lines. Existing keys are skipped unless you choose
            to overwrite them.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 px-6">
          <Textarea
            aria-label=".env contents"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"DATABASE_URL=postgres://…\nAPI_KEY=…"}
            className="h-32 font-mono text-xs"
            spellCheck={false}
          />
          <div className="h-44 overflow-y-auto rounded-lg border border-border/60 [scrollbar-gutter:stable]">
            {entries.length === 0 ? (
              <p className="flex h-full items-center justify-center px-3 text-center text-muted-foreground text-xs">
                Parsed keys will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {entries.map((e) => {
                  const exists = existingKeys.has(e.key);
                  const state = !exists ? "New" : overwrite ? "Update" : "Skip";
                  return (
                    <li
                      key={e.key}
                      className="flex h-8 items-center gap-3 px-3 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate font-mono text-xs">
                        {e.key}
                      </span>
                      <Badge
                        variant="outline"
                        className="h-5 w-16 justify-center px-1.5 text-[10px]"
                      >
                        {state}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="flex min-h-5 items-center justify-between gap-3 text-muted-foreground text-xs">
            <span className="tabular-nums">
              {counts.create} new · {counts.update} update · {counts.skip} skip
            </span>
            <span className="text-destructive tabular-nums">
              {invalidLines.length
                ? `Ignored line${invalidLines.length > 1 ? "s" : ""} ${invalidLines.slice(0, 5).join(", ")}`
                : ""}
            </span>
          </div>
          <Label className="flex items-center gap-2 font-normal text-sm">
            <Checkbox
              checked={overwrite}
              onCheckedChange={(v) => setOverwrite(Boolean(v))}
            />
            Overwrite existing keys
          </Label>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            loading={isPending}
            disabled={counts.create + counts.update === 0}
            onClick={() => void submit()}
          >
            <AppIcon name="importFile" />
            Import {counts.create + counts.update || ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </GuardedDialog>
  );
}
