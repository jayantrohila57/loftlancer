/**
 * @loftlancer/sentry — Sentry integration + shared JSON console logger sink.
 * Apps wire Sentry via `./instrument` / `./instrument-server`; packages log
 * through `logger` here. Never pass secrets as attributes.
 */

export {
  configureLogger,
  errorAttributes,
  logger,
  resetLoggerForTests,
  setRequestIdentity,
} from "./core/sentry.logger";
export type {
  LogAttributes,
  LogLevel,
  LogSink,
  LogValue,
  RequestIdentity,
} from "./types/sentry.types";
