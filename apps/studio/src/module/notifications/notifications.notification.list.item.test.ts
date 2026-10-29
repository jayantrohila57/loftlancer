import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buttonVariants } from "@loftlancer/ui/button";
import { cn } from "@/lib/utils";
import { notificationRowButtonClass } from "./notifications.notification.list.item";

const ROW_BUTTON_OVERRIDE_TOKENS = [
  "sm:h-auto",
  "static",
  "items-stretch",
  "justify-start",
  "before:pointer-events-auto",
  "border-0",
] as const;

function mergedNotificationRowButtonClass(): string {
  return cn(
    buttonVariants({
      className: notificationRowButtonClass,
      variant: "ghost",
    }),
  );
}

function assertContainsTokens(className: string, tokens: readonly string[]) {
  for (const token of tokens) {
    assert.match(
      className,
      new RegExp(
        `(?:^|\\s)${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`,
      ),
      `expected class string to include ${token}`,
    );
  }
}

describe("notificationRowButtonClass", () => {
  it("includes Button base overrides for non-link rows", () => {
    assertContainsTokens(
      notificationRowButtonClass,
      ROW_BUTTON_OVERRIDE_TOKENS,
    );
  });

  it("tailwind-merge resolves overrides against ghost Button variants", () => {
    const merged = mergedNotificationRowButtonClass();
    assertContainsTokens(merged, ROW_BUTTON_OVERRIDE_TOKENS);
    assert.doesNotMatch(merged, /(?:^|\s)sm:h-8(?:\s|$)/);
  });
});
