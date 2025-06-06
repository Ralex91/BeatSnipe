import { Client, ClientEvents } from "discord.js"
import fs from "fs"
import path from "path"

export default class Events {
  client: Client

  constructor(client: Client) {
    this.client = client
  }

  async load() {
    const eventFiles = fs
      .readdirSync(path.join(__dirname, "../events"))
      .filter((file) => file.endsWith(".js"))

    for (const file of eventFiles) {
      const { default: event } = await import(`../events/${file}`)

      if (event.disabled) {
        return
      }

      const name = event.name || file.split(".")[0]
      const emitter =
        (typeof event.emitter === "string"
          ? this.client[<"on" | "once" | "off">event.emitter]
          : event.emitter) || this.client
      const { once } = event

      try {
        emitter[once ? "once" : "on"](name, (...args: (keyof ClientEvents)[]) =>
          event.execute(...args),
        )
      } catch (error) {
        console.error(error)
      }
    }
  }
}
