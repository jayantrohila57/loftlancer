import type { DataTableEmptyConfig } from "@features/data-table/types/data-table.empty.types";
import { Button } from "@loftlancer/ui/button";
import type { ReactNode } from "react";
import { appIcons } from "@/lib/icons";

export function noResultsWithClearSearch(
  onClear: () => void,
): DataTableEmptyConfig {
  return {
    empty: {
      icon: appIcons.searchEmpty,
      title: "No results",
      description: "Try a different search term.",
    },
    noResults: {
      icon: appIcons.searchEmpty,
      title: "No results",
      description: "Nothing matches your search.",
      action: (
        <Button type="button" size="sm" variant="outline" onClick={onClear}>
          Clear search
        </Button>
      ),
    },
  };
}

export function projectsTableEmpty(action?: ReactNode): DataTableEmptyConfig {
  return {
    empty: {
      icon: appIcons.project,
      title: "No projects yet",
      description: "Create a project to manage environments and variables.",
      action,
    },
    noResults: {
      icon: appIcons.searchEmpty,
      title: "No matching projects",
      description: "Try another name or clear your search.",
    },
  };
}

export function variablesTableEmpty(action?: ReactNode): DataTableEmptyConfig {
  return {
    empty: {
      icon: appIcons.variable,
      title: "No variables yet",
      description: "Add secrets and config for this environment.",
      action,
    },
    noResults: {
      icon: appIcons.searchEmpty,
      title: "No matching variables",
      description: "Try another key or clear your search.",
    },
  };
}

export function membersTableEmpty(action?: ReactNode): DataTableEmptyConfig {
  return {
    empty: {
      icon: appIcons.member,
      title: "You're the only member",
      description: "Invite teammates to collaborate on projects.",
      action,
    },
    noResults: {
      icon: appIcons.searchEmpty,
      title: "No matching members",
      description: "Try another name or email.",
    },
  };
}

export function auditLogEmpty(
  onClearFilters?: () => void,
): DataTableEmptyConfig {
  return {
    empty: {
      icon: appIcons.activity,
      title: "No activity yet",
      description: "Changes to variables and projects will appear here.",
    },
    noResults: {
      icon: appIcons.searchEmpty,
      title: "No matching events",
      description: "Adjust search or filters.",
      action: onClearFilters ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onClearFilters}
        >
          Clear filters
        </Button>
      ) : undefined,
    },
  };
}

export function invitationsEmpty(action?: ReactNode): DataTableEmptyConfig {
  return {
    empty: {
      icon: appIcons.invite,
      title: "No pending invitations",
      description: "Invited members will appear here until they accept.",
      action,
    },
    noResults: {
      icon: appIcons.searchEmpty,
      title: "No matching invitations",
      description: "Try another email.",
    },
  };
}
