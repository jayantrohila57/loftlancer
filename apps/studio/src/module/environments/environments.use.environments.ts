export function useEnvironments(_args?: unknown) {
  return {
    project: null,
    environments: [],
    status: "success" as const,
    isLoading: false,
    projectId: null,
    createEnvironment: async () => undefined,
    updateEnvironment: async () => undefined,
    deleteEnvironment: async () => undefined,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    activeTab: "list",
    setActiveTab: (_t: string) => undefined,
    data: [],
    isPending: false,
    isError: false,
    refetch: async () => undefined,
  };
}
