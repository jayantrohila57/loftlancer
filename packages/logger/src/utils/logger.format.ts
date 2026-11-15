import type { LogFields, LogLevel } from "../types/logger.types"

/** Pretty terminal output only when Next/Node runs with NODE_ENV=development. */
export function isDevLogging(): boolean {
  return process.env.NODE_ENV === "development"
}

const levelAnsi: Record<LogLevel, string> = {
  debug: "\u001b[90m",
  error: "\u001b[31m",
  info: "\u001b[36m",
  warn: "\u001b[33m",
}

const ansiReset = "\u001b[0m"
const ansiBold = "\u001b[1m"

const requestColor = "\u001b[32m"
const responseColor = "\u001b[36m"

const devFieldKeyAnsi: Record<string, string> = {
  input: "\u001b[35m",
  output: "\u001b[35m",
  query: "\u001b[34m",
  headers: "\u001b[33m",
}

const devFieldKeyHighlight = /^(input|output|query|headers)$/

export function colorizeLevel(level: LogLevel): string {
  return `${levelAnsi[level]}${level.toUpperCase()}${ansiReset}`
}

/** Dev-only: prefix HTTP/RPC lifecycle events with directional markers and color. */
export function formatDevEventMessage(message: string): string {
  if (message.endsWith(".started"))
    return `${requestColor}${ansiBold}>>>>${ansiReset} ${requestColor}${message}${ansiReset}`
  if (message.endsWith(".completed"))
    return `${responseColor}${ansiBold}<<<<${ansiReset} ${responseColor}${message}${ansiReset}`
  return message
}

export function formatRuntimeDevLine(
  level: LogLevel,
  message: string,
  timestamp: string
): string {
  return `${timestamp} ${colorizeLevel(level)} ${formatDevEventMessage(message)}`
}

export function runtimeLogFields(entry: {
  level: LogLevel
  message: string
  timestamp: string
}): LogFields {
  const {
    level: _level,
    message: _message,
    timestamp: _timestamp,
    ...fields
  } = entry
  return fields
}

function colorizeDevJsonKeys(json: string): string {
  return json.replace(
    /^(\s*)"([^"]+)":/gm,
    (line, indent: string, key: string) => {
      const color = devFieldKeyAnsi[key]
      if (!color) return line
      return `${indent}${color}${ansiBold}${key}${ansiReset}:`
    }
  )
}

/** Development-only: multi-line JSON with highlighted payload, query, and header sections. */
export function formatDevLogFields(fields: LogFields): string {
  const json = JSON.stringify(fields, null, 2)
  if (!Object.keys(fields).some((key) => devFieldKeyHighlight.test(key)))
    return json
  return colorizeDevJsonKeys(json)
}
