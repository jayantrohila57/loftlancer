import Transport from "winston-transport"

type BetterStackTransportOptions = Transport.TransportStreamOptions & {
  endpoint?: string
}

/** Fire-and-forget JSON log delivery; console logging remains the source of truth. */
export class BetterStackTransport extends Transport {
  private readonly endpoint: string

  constructor(options: BetterStackTransportOptions = {}) {
    super(options)
    this.endpoint = options.endpoint ?? "https://in.logs.betterstack.com"
  }

  log(info: Record<string, unknown>, callback: () => void): void {
    setImmediate(() => this.emit("logged", info))
    const token = process.env.BETTER_STACK_SOURCE_TOKEN
    if (!token) {
      callback()
      return
    }
    void fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(info),
    }).catch(() => undefined)
    callback()
  }
}
