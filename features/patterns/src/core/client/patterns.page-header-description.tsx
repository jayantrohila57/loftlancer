"use client";

import { pageHeaderDescriptionClass } from "@features/patterns/utils/patterns.page-header-classes.utils";
import {
  measureLineClampTruncated,
  PAGE_HEADER_DESCRIPTION_LINES,
} from "@features/patterns/utils/patterns.page-header-description-measure.utils";
import { cn } from "@loftlancer/ui/utils";
import { useLayoutEffect, useRef, useState } from "react";

const expandToggleClassName =
  "inline cursor-pointer border-0 bg-transparent p-0 font-normal text-muted-foreground text-xs underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";

export function PageHeaderDescription({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const measureRef = useRef<HTMLParagraphElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `text` is a deliberate trigger; a new description must be re-measured even when the element size stays the same.
  useLayoutEffect(() => {
    if (expanded) {
      return;
    }
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      setIsTruncated(
        measureLineClampTruncated(el, PAGE_HEADER_DESCRIPTION_LINES),
      );
    };

    measure();
    const raf = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.parentElement) {
      observer.observe(el.parentElement);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [expanded, text]);

  const rootClass = cn(pageHeaderDescriptionClass, className);

  if (expanded) {
    return (
      <div
        className={rootClass}
        data-slot="page-header-description"
        data-expanded="true"
      >
        <p className="wrap-anywhere">
          {text}{" "}
          <button
            type="button"
            className={expandToggleClassName}
            onClick={() => setExpanded(false)}
          >
            less
          </button>
        </p>
      </div>
    );
  }

  return (
    <div
      className={rootClass}
      data-slot="page-header-description"
      data-expanded="false"
    >
      <div className="relative min-w-0">
        <p
          ref={measureRef}
          className={cn(
            "line-clamp-2 min-w-0 [overflow-wrap:anywhere] wrap-anywhere",
            isTruncated && "pe-[2.75rem]",
          )}
        >
          {text}
        </p>
        {isTruncated ? (
          <button
            type="button"
            className={cn(
              expandToggleClassName,
              "bg-background absolute right-0 bottom-0 ps-0.5 leading-4",
            )}
            onClick={() => setExpanded(true)}
          >
            more
          </button>
        ) : null}
      </div>
    </div>
  );
}
