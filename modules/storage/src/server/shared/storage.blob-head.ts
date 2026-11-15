import { BlobNotFoundError, head } from "@packages/blob"

export async function orgStorageBlobExists(pathname: string) {
  try {
    await head(pathname)
    return true
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return false
    }
    throw error
  }
}
