"use client";

import { cn } from "@loftlancer/ui/utils";
import { type ClipboardEvent, type KeyboardEvent, useRef } from "react";

const LENGTH = 8;

type SegmentedCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
};

function normalize(raw: string) {
  return raw
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, LENGTH);
}

/** 8-cell device code input (XXXX-XXXX). Paste fills every cell. */
export function SegmentedCodeInput({
  value,
  onChange,
  id,
  disabled,
  invalid,
  readOnly,
}: SegmentedCodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = normalize(value).padEnd(LENGTH, " ").split("");

  const setAt = (index: number, char: string) => {
    const next = chars.slice();
    next[index] = char || " ";
    onChange(next.join("").replace(/\s+$/, "").replace(/\s/g, ""));
  };

  const focus = (index: number) =>
    refs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && chars[index] === " ") {
      event.preventDefault();
      setAt(index - 1, "");
      focus(index - 1);
    } else if (event.key === "ArrowLeft") {
      focus(index - 1);
    } else if (event.key === "ArrowRight") {
      focus(index + 1);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = normalize(event.clipboardData.getData("text"));
    onChange(pasted);
    focus(pasted.length);
  };

  return (
    <div
      className="flex items-center gap-1.5"
      role="group"
      aria-label="Device code"
    >
      {chars.map((char, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-position cells
        <span key={index} className="contents">
          {index === LENGTH / 2 ? (
            <span aria-hidden className="text-muted-foreground">
              –
            </span>
          ) : null}
          <input
            ref={(el) => {
              refs.current[index] = el;
            }}
            id={index === 0 ? id : undefined}
            aria-label={`Character ${index + 1}`}
            aria-invalid={invalid || undefined}
            autoComplete="off"
            inputMode="text"
            maxLength={1}
            disabled={disabled}
            readOnly={readOnly}
            value={char.trim()}
            onChange={(event) => {
              const c = normalize(event.target.value).slice(-1);
              setAt(index, c);
              if (c) focus(index + 1);
            }}
            onKeyDown={(event) => onKeyDown(index, event)}
            onPaste={onPaste}
            onFocus={(event) => event.target.select()}
            className={cn(
              "h-8 w-8 rounded-md border border-border/60 bg-background text-center font-mono text-sm uppercase outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60",
              invalid && "border-destructive/60",
              readOnly && "bg-muted",
            )}
          />
        </span>
      ))}
    </div>
  );
}
