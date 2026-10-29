"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { PageStack } from "@/components/layout/app-layout";
import { EnvironmentPanel } from "@/module/environments/environments.environment.panel";
import { EnvironmentsTabsView } from "@/module/environments/environments.environments.tabs.view";
import { useEnvironments } from "@/module/environments/environments.use.environments";
import { routes } from "@/utils/navigation";
import { useOrgSlug } from "@/utils/use-route-scope";

interface ProjectDetailProps {
  projectSlug: string;
  project: ProjectOutput;
}

export default function ProjectDetail({
  projectSlug,
  project: _project,
}: ProjectDetailProps) {
  const {
    environments,
    activeTab,
    setActiveTab,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    isCreating,
    isUpdating,
    isDeleting,
    projectId,
  } = useEnvironments(projectSlug);
  const org = useOrgSlug();

  return (
    <PageStack className="w-full min-w-0 gap-4">
      <section className="flex min-w-0 flex-col gap-2">
        <EnvironmentsTabsView
          environments={environments}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabHref={(env) => routes.env(org, projectSlug, env.slug ?? env.id)}
          onCreate={async (name) => {
            if (!projectId) return;
            await createEnvironment({ projectId, name });
          }}
          onUpdate={async (id, name) => {
            await updateEnvironment({ id, name });
          }}
          onDelete={async (id) => {
            await deleteEnvironment({ id });
          }}
          isCreating={isCreating}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        >
          {(env) => (
            <EnvironmentPanel
              environmentId={env.id}
              projectEnvironments={environments.map((item) => ({
                id: item.id,
                name: item.name,
              }))}
            />
          )}
        </EnvironmentsTabsView>
      </section>
    </PageStack>
  );
}
