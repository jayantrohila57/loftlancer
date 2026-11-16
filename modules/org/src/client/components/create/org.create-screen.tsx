import Shell from "@packages/ui/components/shell"

import { OrgCreateForm } from "./org.create-form.client"
import { OrgCreateScreenProvisionerGate } from "./org.create-provision-resume.client"

export function OrgCreateScreen(props: { readonly returnTo?: string }) {
  return (
    <Shell.Section variant="dashboard" className="p-2">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
        <div className="flex min-h-[32rem] flex-col rounded-xl border border-border bg-card p-4">
          <OrgCreateScreenProvisionerGate returnTo={props.returnTo}>
            <OrgCreateForm returnTo={props.returnTo} />
          </OrgCreateScreenProvisionerGate>
        </div>
      </div>
    </Shell.Section>
  )
}
