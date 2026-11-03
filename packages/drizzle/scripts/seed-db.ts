/**
 * DB handle for seed scripts. Defaults to the app pool (@loftlancer/drizzle). Set
 * SEED_DB_DRIVER=neon-http to use Neon's HTTPS driver instead (port 443) when
 * outbound 5432 is blocked; it has no transactions, which these scripts don't need.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/schema";

export async function getSeedDb() {
  if (process.env.SEED_DB_DRIVER === "neon-http") {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is required");
    return drizzle(neon(url), {
      schema,
    }) as unknown as typeof import("@loftlancer/drizzle").db;
  }
  return (await import("@loftlancer/drizzle")).db;
}
