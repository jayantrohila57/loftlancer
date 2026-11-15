/**
 * BLOCKER: Org-scoped blob upload API (storage module) is not wired for create wizard.
 * Until `storage.upload` supports org logo + tax document prefixes, uploads store
 * temporary object URLs for client preview only — not persisted as asset IDs.
 */
export async function uploadOrgWizardImageStub(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are supported in the wizard stub.")
  }
  return URL.createObjectURL(file)
}
