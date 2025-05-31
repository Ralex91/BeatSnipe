import Commands from "@/discord/handlers/commands"
import { Logger } from "@/utils/logger"
import packageJson from "@package"
import chalk from "chalk"
import { ActivityType, Client, GatewayIntentBits } from "discord.js"
//import events from "@/discord/handlers/events"

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

client.once("ready", async () => {
  const commands = new Commands(client)
  await commands.load()
  await commands.listen()

  //const events = new events(client)
  //await events.load()

  client.user?.setActivity(`Version ${packageJson.version}`, {
    type: ActivityType.Watching,
  })
  Logger.log(
    "discord",
    `Logged in as ${chalk.bold(client.user?.tag as string)}!`,
  )
})

client.login(process.env.DISCORD_TOKEN)
