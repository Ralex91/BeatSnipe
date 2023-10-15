import * as fs from 'node:fs'
import { resolve } from 'node:path'
import { Client, Guild, Collection, ApplicationCommand, CommandInteractionOption, BaseInteraction, ApplicationCommandOptionType } from 'discord.js'
import SmallEmbed from './SmallEmbed'

interface Command extends ApplicationCommand {
	allowedChannels?: string[],
	execute: Function
}

export default class Commands {
	client: Client
	commands: Collection<string, ApplicationCommand> = new Collection()

	constructor(client: Client) {
		this.client = client
	}

	getCommandOptions(options: readonly CommandInteractionOption[]): string[] {
		return options.flatMap(d => {
			switch (d.type) {
				case ApplicationCommandOptionType.Attachment:
					return `${d.name}:${d?.attachment?.name}`
				case ApplicationCommandOptionType.Subcommand: {
					const subCommandName = d.name
					let commandOptions = [subCommandName]
					if (d.options) commandOptions = [...commandOptions, ...this.getCommandOptions(d.options)]
					return commandOptions
				}
				case ApplicationCommandOptionType.SubcommandGroup: {
					const subCommandGroupName = d.name
					let commandOptions = [subCommandGroupName]
					if (d.options) commandOptions = [...commandOptions, ...this.getCommandOptions(d.options)]
					return commandOptions
				}
				default:
					return `${d.name}:${d?.value}`
			}
		})
	}

	async load() {
		const commands = []
		const commandFiles = fs.readdirSync(resolve(__dirname, '../Commands')).filter(file => file.endsWith('.js'))

		for (const file of commandFiles) {
			const { default: command } = await import(`../Commands/${file}`)
			commands.push(command.data)
			this.commands.set(command.data.name, command)
		}

		if (!process.env.DISCORD_GUILDID) {
			console.error("DISCORD_GUILDID undefined")
			return
		}

		const guild = <Guild>this.client.guilds.cache.get(process.env.DISCORD_GUILDID)
		await guild.commands.set([])
		await guild.commands.set(commands)
	}

	async listen() {
		this.client.on('interactionCreate',
			async (interaction: BaseInteraction) => {
				if (!interaction.isChatInputCommand()) return

				const command = <Command>this.commands.get(interaction.commandName)

				if (!command) return

				try {
					const commandOptions = this.getCommandOptions(interaction.options.data)
					console.log(`${interaction.user.tag} executed the command "/${interaction.commandName}${commandOptions.length > 0 ? ` ${commandOptions.join(' ')}` : ''}"`)

					if (command.allowedChannels) {
						for (const channel of command.allowedChannels) {
							if (channel !== interaction.channelId) {
								await interaction.editReply(SmallEmbed("❌ ┃ Channel unauthorized"))
							}
						}
					}

					if (command.execute) await command.execute(interaction)
				} catch (error) {
					await interaction.editReply(SmallEmbed("❌ ┃ An error occured when attempting to execute that command!"))
					console.error(error)
				}
			}
		)
	}
}