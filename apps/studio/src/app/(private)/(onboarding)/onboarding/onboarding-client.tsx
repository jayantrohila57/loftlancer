"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isReservedOrgSlugForCreation } from "@loftlancer/env/reserved-slugs";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { UnsavedChangesPageGuard } from "@loftlancer/ui/patterns/unsaved-changes-page-guard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod/v3";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSlugInput } from "@/components/org/org-slug-input";
import { AppIcon } from "@/components/patterns/app-icon";
import { FormField } from "@/components/patterns/form-field";
import { actionToast } from "@/lib/action-toast";
import { authClient } from "@/lib/auth-client";
import {
  formatOrganizationCreateError,
  slugifyOrganizationName,
} from "@/lib/org-slug";
import { captureEvent, STUDIO_EVENTS } from "@/lib/posthog";
import { cn } from "@/lib/utils";

import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

const orgSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name is required")
    .max(100, "Name is too long"),
  slug: z
    .string()
    .trim()
    .transform((value) => slugifyOrganizationName(value))
    .pipe(
      z
        .string()
        .min(2, "Slug is required")
        .max(200, "Slug is too long")
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Use lowercase letters, numbers, and hyphens only",
        )
        .refine((slug) => !isReservedOrgSlugForCreation(slug), {
          message: "That slug is reserved. Choose a different slug.",
        }),
    ),
});

const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or fewer"),
});

const STEPS = [
  { title: "Organization", description: "Your workspace" },
  { title: "Project", description: "Where variables live" },
] as const;

type StepIndex = 0 | 1 | 2; // 2 = done

/** reui onboarding-4 style horizontal stepper; fixed height in every state. */
function Stepper({ current }: { current: StepIndex }) {
  return (
    <ol className="grid grid-cols-2 gap-3" aria-label="Onboarding progress">
      {STEPS.map((step, i) => {
        const done = current > i;
        const active = current === i;
        return (
          <li
            key={step.title}
            aria-current={active ? "step" : undefined}
            className="flex min-w-0 flex-col gap-2"
          >
            <span
              className={cn(
                "h-1 w-full rounded-full",
                done || active ? "bg-primary" : "bg-muted",
              )}
            />
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] tabular-nums",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-foreground",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                {done ? <CheckIcon className="size-3" /> : i + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate font-medium text-sm",
                    !active && !done && "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
                <span className="block truncate text-muted-foreground text-xs">
                  {step.description}
                </span>
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function OnboardingClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { afterOrganizationCreated, orgs, initialLoadDone } =
    useActiveOrganization();
  const [step, setStep] = useState<StepIndex>(0);
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [orgSlug, setOrgSlug] = useState<string | null>(null);
  const startedRef = useRef(false);

  // Users who already belong to an org skip onboarding — but never mid-flow.
  useEffect(() => {
    // The provider runs the initial org load once the session is ready.
    // Calling refreshOrganizations here raced the session and re-activated
    // the first org (#262), so just wait for it.
    if (!initialLoadDone) return;
    if (orgs.length > 0 && !startedRef.current) {
      router.replace(routes.home());
    }
  }, [initialLoadDone, orgs.length, router]);

  const orgForm = useForm({
    resolver: zodResolver(orgSchema),
    defaultValues: { name: "", slug: "" },
    mode: "onChange",
  });
  const projectForm = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const nameValue = useWatch({ control: orgForm.control, name: "name" });
  const slugTouched = orgForm.formState.touchedFields.slug;
  useEffect(() => {
    if (slugTouched) return;
    const next = slugifyOrganizationName(nameValue);
    if (next) orgForm.setValue("slug", next, { shouldValidate: true });
  }, [nameValue, slugTouched, orgForm]);

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.projects.list.queryKey(),
        });
      },
    }),
  );

  const onCreateOrg = async (data: z.infer<typeof orgSchema>) => {
    orgForm.clearErrors("slug");
    startedRef.current = true;
    try {
      const created = await actionToast(
        (async () => {
          const result = await authClient.organization.create({
            name: data.name,
            slug: data.slug,
          });
          if (result.error) {
            const message = formatOrganizationCreateError(result.error.message);
            if (message.toLowerCase().includes("slug")) {
              orgForm.setError("slug", { message });
            }
            throw new Error(message);
          }
          return result;
        })(),
        {
          loading: "Creating organization…",
          success: "Organization created",
          error: "Could not create organization",
        },
      );
      captureEvent(STUDIO_EVENTS.organizationCreated, { source: "onboarding" });
      const orgId = created.data?.id;
      if (orgId) await afterOrganizationCreated(orgId);
      setOrgSlug(created.data?.slug ?? data.slug);
      orgForm.reset(data);
      setStep(1);
    } catch {
      startedRef.current = false;
    }
  };

  const onCreateProject = async (data: z.infer<typeof projectSchema>) => {
    try {
      const result = await actionToast(
        createProject.mutateAsync({ name: data.name.trim(), isPublic: false }),
        {
          loading: "Creating project…",
          success: "Project created",
          error: "Could not create project",
        },
      );
      captureEvent(STUDIO_EVENTS.projectCreated, { source: "onboarding" });
      captureEvent(STUDIO_EVENTS.onboardingCompleted);
      setProjectSlug(result?.data?.slug ?? null);
      projectForm.reset(data);
      setStep(2);
    } catch {
      // toast shown
    }
  };

  const projectHref = orgSlug
    ? projectSlug
      ? routes.project(orgSlug, projectSlug)
      : routes.projects(orgSlug)
    : routes.home();

  const dirty =
    step === 0
      ? orgForm.formState.isDirty
      : step === 1 && projectForm.formState.isDirty;

  return (
    <UnsavedChangesPageGuard
      isDirty={Boolean(dirty)}
      onDiscard={() => {
        orgForm.reset();
        projectForm.reset();
      }}
    >
      {() => (
        <div className="space-y-6" data-testid="onboarding">
          <div className="space-y-1">
            <h1 className="font-semibold text-xl tracking-tight">
              Set up Loftlancer
            </h1>
            <p className="text-muted-foreground text-sm">
              Two quick steps to a working project.
            </p>
          </div>

          <Stepper current={step} />

          {/* Fixed-height panel: steps swap inside, the frame never resizes. */}
          <div className="flex min-h-80 flex-col rounded-xl border border-border/60 bg-card p-4">
            {step === 0 ? (
              <form
                className="flex flex-1 flex-col gap-4"
                onSubmit={orgForm.handleSubmit(onCreateOrg)}
              >
                <StepHeading
                  title="Create your organization"
                  description="This name appears in the sidebar team switcher."
                />
                <Controller
                  name="name"
                  control={orgForm.control}
                  render={({ field, fieldState }) => (
                    <FormField
                      id="org-name"
                      label="Organization name"
                      required
                      error={fieldState.error?.message}
                    >
                      <Input
                        {...field}
                        id="org-name"
                        placeholder="Acme Inc."
                        autoFocus
                      />
                    </FormField>
                  )}
                />
                <Controller
                  name="slug"
                  control={orgForm.control}
                  render={({ field, fieldState }) => (
                    <FormField
                      id="org-slug"
                      label="URL slug"
                      required
                      hint="Lowercase letters, numbers, and hyphens."
                      error={fieldState.error?.message}
                    >
                      <OrgSlugInput
                        id="org-slug"
                        placeholder="acme-inc"
                        autoComplete="off"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormField>
                  )}
                />
                <StepFooter>
                  <SubmitButton
                    isLoading={orgForm.formState.isSubmitting}
                    loadingLabel="Creating organization…"
                    disabled={!orgForm.formState.isValid}
                  >
                    Continue
                  </SubmitButton>
                </StepFooter>
              </form>
            ) : step === 1 ? (
              <form
                className="flex flex-1 flex-col gap-4"
                onSubmit={projectForm.handleSubmit(onCreateProject)}
              >
                <StepHeading
                  title="Create your first project"
                  description="Projects hold environments and their variables."
                />
                <Controller
                  name="name"
                  control={projectForm.control}
                  render={({ field, fieldState }) => (
                    <FormField
                      id="project-name"
                      label="Project name"
                      required
                      error={fieldState.error?.message}
                    >
                      <Input
                        {...field}
                        id="project-name"
                        placeholder="web-app"
                        autoFocus
                      />
                    </FormField>
                  )}
                />
                <StepFooter>
                  <SubmitButton
                    isLoading={createProject.isPending}
                    loadingLabel="Creating project…"
                    disabled={!projectForm.formState.isValid}
                  >
                    Continue
                  </SubmitButton>
                </StepFooter>
              </form>
            ) : (
              <div
                className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
                data-testid="onboarding-success"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <CheckIcon className="size-5 text-foreground" />
                </span>
                <div className="space-y-1">
                  <p className="font-medium text-sm">You're all set</p>
                  <p className="max-w-xs text-muted-foreground text-xs">
                    Your organization and project are ready. Add environments
                    and variables next.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    render={<Link href={routes.organizationsDirectory()} />}
                  >
                    All organizations
                  </Button>
                  <Button render={<Link href={projectHref} />}>
                    <AppIcon name="project" />
                    Open project
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </UnsavedChangesPageGuard>
  );
}

function StepHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-0.5">
      <h2 className="font-semibold text-sm">{title}</h2>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  );
}

function StepFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-auto flex justify-end gap-2 pt-2">{children}</div>;
}
