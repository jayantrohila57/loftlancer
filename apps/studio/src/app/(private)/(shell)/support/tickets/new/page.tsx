"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { Label } from "@loftlancer/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@loftlancer/ui/select";
import { Textarea } from "@loftlancer/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardSection from "@/components/section-dashboard";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

export default function NewSupportTicketPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState("normal");

  const create = useMutation({
    ...trpc.support.createTicket.mutationOptions(),
    onSuccess: (ticket) => {
      router.push(routes.supportTicket(ticket.id));
    },
  });

  return (
    <DashboardSection
      title="New ticket"
      description="Describe your issue and our support team will follow up by email."
      back={false}
    >
      <form
        className="mx-auto max-w-xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
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
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              items={[
                { value: "bug", label: "Bug" },
                { value: "billing", label: "Billing" },
                { value: "account", label: "Account" },
                { value: "feature_request", label: "Feature request" },
                { value: "other", label: "Other" },
              ]}
              onValueChange={(v) => v && setCategory(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="feature_request">Feature request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              items={[
                { value: "low", label: "Low" },
                { value: "normal", label: "Normal" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
              onValueChange={(v) => v && setPriority(v)}
            >
              <SelectTrigger>
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Submitting…" : "Create ticket"}
          </Button>
          <Button
            type="button"
            variant="outline"
            render={<Link href={routes.supportTickets()}>Cancel</Link>}
          />
        </div>
      </form>
    </DashboardSection>
  );
}
