import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type DataTableEmptyVariantConfig = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export type DataTableEmptyConfig = {
  /** When the dataset has no rows at all */
  empty: DataTableEmptyVariantConfig;
  /** When rows exist but search/filters hide everything */
  noResults?: DataTableEmptyVariantConfig;
};
