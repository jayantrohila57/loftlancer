import { z } from "zod"

export const webContactTopicValues = [
  "sales",
  "support",
  "billing",
  "privacy",
  "security",
  "press",
  "other",
] as const

export type WebContactTopic = (typeof webContactTopicValues)[number]

export const webContactFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  topic: z.enum(webContactTopicValues),
  message: z.string().trim().min(20).max(5000),
  consent: z.literal(true, {
    errorMap: () => ({ message: "consentRequired" }),
  }),
  companyWebsite: z.string().max(0).optional(),
})

export type WebContactFormValues = z.infer<typeof webContactFormSchema>