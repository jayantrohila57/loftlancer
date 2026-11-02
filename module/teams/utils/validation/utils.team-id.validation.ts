import { z } from "zod";
export const teamIdSchema = z.string().trim().min(1);
export const teamGetInputSchema = z.object({ teamId: teamIdSchema });

/** Preserve invalid payloads for controller validation and terminal audit. */
export const teamControllerInputSchema = z.unknown();
