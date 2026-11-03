import superjson from "superjson";

/** Shared tRPC transformer — keeps Dates and other non-JSON types consistent (HTTP + SSR prefetch). */
export const transformer = superjson;
