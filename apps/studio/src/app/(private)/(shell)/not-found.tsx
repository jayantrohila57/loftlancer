import { Button } from "@loftlancer/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@loftlancer/ui/empty";
import { FolderX } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { PageStack } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { RouteNotFoundMarker } from "@/components/route-not-found-marker";
import { type NotFoundScope, resolveNotFoundScope } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";

type Copy = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  cta: { label: string; href: Route };
};

/** Names what wasn't found, never the unknown slug itself (#317). */
function copyFor(scope: NotFoundScope): Copy {
  const { org, project } = scope;
  if (scope.kind === "organization") {
    return {
      title: "Organization not found",
      description:
        "This organization doesn't exist or you aren't a member of it.",
      emptyTitle: "No such organization",
      emptyDescription:
        "Check the URL, or pick one of the organizations you belong to.",
      cta: {
        label: "Your organizations",
        href: routes.organizationsDirectory(),
      },
    };
  }
  if (scope.kind === "project" && org) {
    return {
      title: "Project not found",
      description: `This project doesn't exist in ${org.name} or you don't have access to it.`,
      emptyTitle: "No such project",
      emptyDescription:
        "Check the URL, or open one of this organization's projects.",
      cta: { label: "Projects", href: routes.projects(org.slug) },
    };
  }
  const back: Copy["cta"] =
    org && project
      ? {
          label: "Project overview",
          href: routes.project(org.slug, project.slug),
        }
      : org
        ? { label: "Organization overview", href: routes.org(org.slug) }
        : {
            label: "Your organizations",
            href: routes.organizationsDirectory(),
          };
  return {
    title: "Page not found",
    description: "This page doesn't exist.",
    emptyTitle: "Nothing here",
    emptyDescription: "Check the URL or go back.",
    cta: back,
  };
}

export default async function PrivateNotFound() {
  const scope = await resolveNotFoundScope();
  const copy = copyFor(scope);
  return (
    <PageStack>
      <RouteNotFoundMarker depth={scope.depth} />
      <PageHeader
        title={copy.title}
        description={copy.description}
        back={copy.cta.href}
      />
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderX className="size-5" aria-hidden />
          </EmptyMedia>
          <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
          <EmptyDescription>{copy.emptyDescription}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" render={<Link href={copy.cta.href} />}>
            {copy.cta.label}
          </Button>
        </EmptyContent>
      </Empty>
    </PageStack>
  );
}
