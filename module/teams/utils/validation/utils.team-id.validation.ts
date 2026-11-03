import { z } from "zod";
export const teamIdSchema = z.string().trim().min(1);
export const teamGetInputSchema = z.object({ teamId: teamIdSchema });
