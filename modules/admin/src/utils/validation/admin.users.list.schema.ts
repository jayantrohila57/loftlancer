import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

export const listUsersInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25),
  offset: z.number().int().min(0).default(0),
  searchValue: z.string().trim().min(1).max(200).optional(),
})

const adminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  role: z.string().nullable().optional(),
  banned: z.boolean().optional(),
  createdAt: z.coerce.date(),
})

export const listUsersDataSchema = z.object({
  users: z.array(adminUserSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
})

export const listUsersOutputSchema = serviceResponseSchema(listUsersDataSchema)
