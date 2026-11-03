export function useProjectApps(_args?: unknown) {
  return {
    data: [] as { id: string; name: string; slug: string }[],
    isPending: false,
    projectId: null as string | null,
    project: null,
    apps: [] as { id: string; name: string; slug: string }[],
  };
}
