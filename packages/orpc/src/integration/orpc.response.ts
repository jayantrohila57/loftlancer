import { z } from "zod"

const responseErrorSchema = z.object({
  code: z.string(),
  details: z.unknown().optional(),
})

export function serviceResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.discriminatedUnion("status", [
    z.object({
      status: z.literal("success"),
      data: dataSchema,
      message: z.string(),
      error: z.undefined().optional(),
    }),
    z.object({
      status: z.literal("failed"),
      data: z.null(),
      message: z.string(),
      error: responseErrorSchema.optional(),
    }),
    z.object({
      status: z.literal("error"),
      data: z.null(),
      message: z.string(),
      error: responseErrorSchema,
    }),
  ])
}

export type ServiceResponse<T> = z.infer<
  ReturnType<typeof serviceResponseSchema<z.ZodType<T>>>
>
export type ServiceOutcome<T> = ServiceResponse<T>
type ResponseError = z.infer<typeof responseErrorSchema>

export function createSuccess<T>(data: T, message: string) {
  return { status: "success" as const, data, message }
}

export function createFailed(message: string, error?: ResponseError) {
  return {
    status: "failed" as const,
    data: null,
    message,
    ...(error && { error }),
  }
}

export function createError(message: string, error: ResponseError) {
  return { status: "error" as const, data: null, message, error }
}
