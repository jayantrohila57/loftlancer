import { orgProvisioningController } from "./org.provisioning.controller"
import { orgSetupController } from "./org.setup.controller"

export const orgRouter = {
  setup: orgSetupController,
  provisioning: orgProvisioningController,
}
