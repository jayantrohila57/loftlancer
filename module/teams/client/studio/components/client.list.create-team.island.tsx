"use client";

import { Button } from "@loftlancer/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@loftlancer/ui/dialog";
import { Field, FieldLabel } from "@loftlancer/ui/field";
import { Input } from "@loftlancer/ui/input";
import { GuardedDialog } from "@loftlancer/ui/patterns/guarded-dialog";
import { Textarea } from "@loftlancer/ui/textarea";
import { useTeamsListCreate } from "../hooks/client.use-teams-list-create.hook";

export function TeamsListCreateTeamIsland({
  orgId,
  slug,
}: {
  orgId: string;
  slug: string;
}) {
  const state = useTeamsListCreate(orgId, slug);
  const { create, values, errors, canCreate } = state;

  if (!canCreate.allowed) return null;

  return (
    <>
      <Button type="button" size="sm" onClick={() => state.setOpen(true)}>
        New team
      </Button>
      <GuardedDialog
        open={state.open}
        onOpenChange={(next) => {
          if (!create.isPending) state.setOpen(next);
        }}
        isDirty={Object.values(values).some((value) => value.trim())}
        onDiscard={state.reset}
        closeWithoutPromptRef={state.closeWithoutPromptRef}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
            <DialogDescription>
              Team name is required. Purpose and description are optional.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void state.submit();
            }}
            noValidate
          >
            {Object.values(errors).some(Boolean) ? (
              <div ref={state.summaryRef} tabIndex={-1} role="alert">
                <p>Check the team details.</p>
                {Object.entries(errors).map(([key, messages]) =>
                  messages?.map((message) => (
                    <a
                      className="block underline"
                      href={`#team-${key}`}
                      key={`${key}-${message}`}
                    >
                      {message}
                    </a>
                  )),
                )}
              </div>
            ) : null}
            {create.data && create.data.status !== "success" ? (
              <p role="alert">{create.data.message}</p>
            ) : create.isError ? (
              <p role="alert">
                Could not create team. Your entries are saved; try again.
              </p>
            ) : null}
            <Field name="name" invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="team-name">Team name</FieldLabel>
              <Input
                id="team-name"
                required
                maxLength={100}
                value={values.name}
                onBlur={state.validate}
                onChange={(event) =>
                  state.setValues({ ...values, name: event.target.value })
                }
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "team-name-error" : undefined}
              />
              {errors.name ? (
                <p id="team-name-error" className="text-destructive text-sm">
                  {errors.name[0]}
                </p>
              ) : null}
            </Field>
            <Field name="purpose" invalid={Boolean(errors.purpose)}>
              <FieldLabel htmlFor="team-purpose">Purpose</FieldLabel>
              <Input
                id="team-purpose"
                maxLength={250}
                value={values.purpose}
                onChange={(event) =>
                  state.setValues({ ...values, purpose: event.target.value })
                }
                aria-invalid={Boolean(errors.purpose)}
              />
              {errors.purpose ? (
                <p className="text-destructive text-sm">{errors.purpose[0]}</p>
              ) : null}
            </Field>
            <Field name="description" invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="team-description">Description</FieldLabel>
              <Textarea
                id="team-description"
                maxLength={500}
                rows={3}
                value={values.description}
                onChange={(event) =>
                  state.setValues({
                    ...values,
                    description: event.target.value,
                  })
                }
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description ? (
                <p className="text-destructive text-sm">
                  {errors.description[0]}
                </p>
              ) : null}
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                disabled={create.isPending}
                onClick={() => state.setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={create.isPending || !canCreate.allowed}
              >
                {create.isPending ? "Creating…" : "Create team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </GuardedDialog>
    </>
  );
}
