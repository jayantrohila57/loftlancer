"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { Label } from "@loftlancer/ui/label";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@loftlancer/ui/select";
import { SheetClose, SheetDescription } from "@loftlancer/ui/sheet";
import { Textarea } from "@loftlancer/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  FormSheet,
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { RequiredFieldsHint } from "@/components/patterns/required-fields-hint";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

export function CreateSupportTicketSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState("normal");
  const create = useMutation({
    ...trpc.support.createTicket.mutationOptions(),
    onSuccess: (ticket) => router.push(routes.supportTicket(ticket.id)),
  });
  const isDirty = Boolean(
    subject.trim() ||
      description.trim() ||
      category !== "other" ||
      priority !== "normal",
  );

  const reset = () => {
    setSubject("");
    setDescription("");
    setCategory("other");
    setPriority("normal");
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      isDirty={isDirty}
      onDiscard={reset}
      closeWithoutPromptRef={closeWithoutPromptRef}
    >
      <FormSheetPopup>
        <FormSheetHeader>
          <SheetTitleWithIcon icon="support">New ticket</SheetTitleWithIcon>
          <SheetDescription>
            Describe your issue and our support team will follow up by email.
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetForm
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate({
              subject,
              description,
              category: category as
                | "bug"
                | "billing"
                | "account"
                | "feature_request"
                | "other",
              priority: priority as "low" | "normal" | "high" | "urgent",
            });
          }}
        >
          <FormSheetBody className="gap-4">
            <RequiredFieldsHint />
            <div className="space-y-2">
              <Label htmlFor="support-ticket-subject">
                Subject{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="support-ticket-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                required
                disabled={create.isPending}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="support-ticket-category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => value && setCategory(value)}
                  disabled={create.isPending}
                >
                  <SelectTrigger id="support-ticket-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="feature_request">
                      Feature request
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-ticket-priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => value && setPriority(value)}
                  disabled={create.isPending}
                >
                  <SelectTrigger id="support-ticket-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-ticket-description">
                Description{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Textarea
                id="support-ticket-description"
                rows={8}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                disabled={create.isPending}
              />
            </div>
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  disabled={create.isPending}
                />
              }
            >
              Cancel
            </SheetClose>
            <SubmitButton
              isLoading={create.isPending}
              loadingLabel="Creating…"
              disabled={!subject.trim() || !description.trim()}
            >
              Create ticket
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </FormSheet>
  );
}
