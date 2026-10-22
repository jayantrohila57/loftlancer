/**
 * Column classes shared by the variables table and its skeleton so the
 * loading state has exactly the loaded columns and widths (#326).
 */
export const variableColumnClassNames = {
  key: "min-w-0 max-w-none w-auto sm:max-w-[12rem]",
  value: "hidden min-w-0 max-w-[12rem] sm:table-cell md:max-w-[18rem]",
  updatedBy: "hidden min-w-[10rem] md:table-cell",
  actions: "w-12 ps-0",
} as const;

export const VARIABLES_SEARCH_PLACEHOLDER = "Search variables…";
