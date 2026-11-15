import type {
  CommandPaletteHandler,
  CommandPaletteItem,
} from "../types/command.types"
import { isCommandPaletteItemSelectable } from "./command.merge"

export interface ExecuteCommandPaletteItemContext {
  readonly navigate: (href: string) => void
  readonly onIntent?: (intent: string) => void
  readonly onRunError?: (error: unknown) => void
}

export async function executeCommandHandler(
  handler: CommandPaletteHandler,
  context: ExecuteCommandPaletteItemContext
): Promise<void> {
  switch (handler.kind) {
    case "href":
      context.navigate(handler.href)
      return
    case "intent":
      context.onIntent?.(handler.intent)
      return
    case "run":
      try {
        await handler.run()
      } catch (error) {
        if (context.onRunError !== undefined) {
          context.onRunError(error)
          return
        }

        throw error
      }
      return
    default: {
      const exhaustive: never = handler
      throw new Error(`Unhandled command handler: ${String(exhaustive)}`)
    }
  }
}

export async function executeCommandPaletteItem(
  item: CommandPaletteItem,
  context: ExecuteCommandPaletteItemContext
): Promise<void> {
  if (!isCommandPaletteItemSelectable(item)) {
    return
  }

  await executeCommandHandler(item.handler, context)
}
