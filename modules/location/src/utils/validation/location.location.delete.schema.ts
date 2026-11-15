import { deletedOutputSchema } from "@modules/security/utils"
import { serviceResponseSchema } from "@packages/orpc"
export const deleteLocationOutputSchema =
  serviceResponseSchema(deletedOutputSchema)
