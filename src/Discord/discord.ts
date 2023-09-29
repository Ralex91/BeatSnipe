import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js'
import type ApplicationCommand from './Templates/ApplicationCommand.js'
import Commands from './Handlers/Commands.js'
import Events from './Handlers/Events.js'
import 'dotenv/config'

global.client = Object.assign(
	new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
		],
		partials: [Partials.Channel]
	}),
	{
		commands: new Collection<string, ApplicationCommand>(),
	}
)

client.commands = new Collection()

Commands(client)
Events(client)

client.login(process.env.DISCORD_TOKEN)