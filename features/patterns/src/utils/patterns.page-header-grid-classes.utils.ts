import { cn } from "@loftlancer/ui/utils";

/** Grid placement for description headers — avoid md:col-start-2 without a back column. */
export function pageHeaderDescriptionGridTitleClass(hasBack: boolean) {
  return cn("[grid-area:title]", hasBack && "md:col-start-2");
}

export function pageHeaderDescriptionGridDescClass(hasBack: boolean) {
  return cn("[grid-area:desc]", hasBack && "md:col-start-2");
}

export function pageHeaderDescriptionGridActionClass(hasBack: boolean) {
  return cn(
    "shrink-0 self-center [grid-area:action]",
    hasBack && "md:col-start-3",
  );
}
