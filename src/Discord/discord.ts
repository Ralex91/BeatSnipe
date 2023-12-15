import { Client, GatewayIntentBits, ActivityType } from 'discord.js'
import Commands from './Handlers/Commands.js'
import Events from './Handlers/Events.js'
import 'dotenv/config'

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
	]
})

client.once('ready', async () => {

	const commands = new Commands(client)
	await commands.load()
	await commands.listen()

	const events = new Events(client)
	await events.load()

	client.user?.setActivity(`Version ${process.env.DISPLAY_VERSION}`, { type: ActivityType.Watching })
	console.log(`Logged in as ${client.user?.tag as string}!`)
})

client.login(process.env.DISCORD_TOKEN)