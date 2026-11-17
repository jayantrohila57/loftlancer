import "server-only"

export {
  resolveEmailLocaleForEmail,
  resolveEmailLocaleForUserIds,
} from "./capability/i18n.email-locale"
export type { SegmentI18nTools } from "./capability/i18n.segment-server"
export { createSegmentI18nTools } from "./capability/i18n.segment-server"
export { escapeHtml } from "./utils/i18n.escape-html"
