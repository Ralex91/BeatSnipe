import fs from 'fs'
import type ApplicationCommand from '../Templates/ApplicationCommand.js'
import path from 'path'

export default async (client) => {
	const commandFiles = fs.readdirSync(path.join(__dirname, '../Commands')).filter(file => file.endsWith('.js'))

	for (const file of commandFiles) {
		const command: ApplicationCommand = (await import(`../Commands/${file}`))
			.default as ApplicationCommand
		client.commands.set(command.data.name, command)
	}


	client.on("ready", async () => {
		//const devGuild = await client.guilds.cache.get("1151103110178164840")
		//devGuild.commands.set([])
		//client.application.commands.set([])
		client.application.commands.set(client.commands.map(cmd => cmd.data))
	});
}