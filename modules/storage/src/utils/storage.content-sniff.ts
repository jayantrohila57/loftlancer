import type { OrgStorageAllowedMime } from "./constants/storage.constants.mime"
import { isOrgStorageAllowedMime } from "./constants/storage.constants.mime"

export function sniffOrgStorageContentType(
  bytes: Uint8Array
): OrgStorageAllowedMime | null {
  const png =
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
  if (png) return "image/png"

  const jpg =
    bytes.length >= 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  if (jpg) return "image/jpeg"

  const gif =
    bytes.length >= 6 &&
    ["GIF87a", "GIF89a"].includes(new TextDecoder().decode(bytes.slice(0, 6)))
  if (gif) return "image/gif"

  const webp =
    bytes.length >= 12 &&
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
  if (webp) return "image/webp"

  const pdf =
    bytes.length >= 5 && new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-"
  if (pdf) return "application/pdf"

  const textSample = new TextDecoder("utf-8", { fatal: false }).decode(
    bytes.slice(0, Math.min(bytes.length, 512))
  )
  const looksText = /^[\t\n\r\x20-\x7E\u00A0-\uFFFF]*$/.test(textSample)
  if (looksText && textSample.includes(",")) return "text/csv"
  if (looksText) return "text/plain"

  const isZip =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
    (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)
  if (isZip) {
    const sample = new TextDecoder().decode(
      bytes.slice(0, Math.min(4096, bytes.length))
    )
    if (sample.includes("word/")) {
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
    if (sample.includes("xl/")) {
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
    if (sample.includes("ppt/")) {
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    }
  }

  return null
}

export function validateOrgStorageBytes(input: {
  bytes: Uint8Array
  declaredType: string
}) {
  const sniffed = sniffOrgStorageContentType(input.bytes)
  if (!sniffed || !isOrgStorageAllowedMime(input.declaredType)) {
    return null
  }
  if (sniffed !== input.declaredType) return null
  return sniffed
}
