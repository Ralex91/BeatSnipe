import smallEmbed from "@/discord/handlers/smallEmbed"
import { Logger } from "@/utils/logger"
import {
  ApplicationCommand,
  ApplicationCommandOptionType,
  BaseInteraction,
  Client,
  Collection,
  CommandInteractionOption,
} from "discord.js"
import * as fs from "node:fs"
import { resolve } from "node:path"

interface Command extends ApplicationCommand {
  allowedChannels?: string[]
  execute: Function
}

export default class Commands {
  client: Client
  commands: Collection<string, ApplicationCommand> = new Collection()

  constructor(client: Client) {
    this.client = client
  }

  getCommandOptions(options: readonly CommandInteractionOption[]): string[] {
    return options.flatMap((d) => {
      switch (d.type) {
        case ApplicationCommandOptionType.Attachment:
          return `${d.name}:${d?.attachment?.name}`

        case ApplicationCommandOptionType.Subcommand: {
          const subCommandName = d.name
          let commandOptions = [subCommandName]

          if (d.options) {
            commandOptions = [
              ...commandOptions,
              ...this.getCommandOptions(d.options),
            ]
          }

          return commandOptions
        }

        case ApplicationCommandOptionType.SubcommandGroup: {
          const subCommandGroupName = d.name
          let commandOptions = [subCommandGroupName]

          if (d.options) {
            commandOptions = [
              ...commandOptions,
              ...this.getCommandOptions(d.options),
            ]
          }

          return commandOptions
        }

        default:
          return `${d.name}:${d?.value}`
      }
    })
  }

  async load() {
    const commands = []
    const commandFiles = fs
      .readdirSync(resolve(__dirname, "../commands"))
      .filter((file) => file.endsWith(".ts"))

    for (const file of commandFiles) {
      const { default: command } = await import(`../commands/${file}`)
      commands.push(command.data)
      this.commands.set(command.data.name, command)
    }

    //const guild = <Guild>this.client.guilds.cache.get("1223260665083592845")
    //await guild.commands.set([])
    //await guild.commands.set(commands)
    this.client.application?.commands.set(commands)
  }

  listen() {
    this.client.on(
      "interactionCreate",
      async (interaction: BaseInteraction) => {
        if (!interaction.isChatInputCommand()) {
          return
        }

        const command = <Command>this.commands.get(interaction.commandName)

        if (!command) {
          return
        }

        try {
          const commandOptions = this.getCommandOptions(
            interaction.options.data,
          )
          Logger.log(
            "discord",
            `${interaction.user.tag} executed the command "/${interaction.commandName}${commandOptions.length > 0 ? ` ${commandOptions.join(" ")}` : ""}"`,
          )

          if (command.allowedChannels) {
            const isAllowedChannel = command.allowedChannels.find(
              (channel) => channel !== interaction.channelId,
            )

            if (isAllowedChannel) {
              await interaction.editReply(
                smallEmbed("❌ ┃ Channel unauthorized"),
              )
            }
          }

          if (command.execute) {
            await command.execute(interaction)
          }
        } catch (error) {
          await interaction.editReply(
            smallEmbed(
              "❌ ┃ An error occured when attempting to execute that command!",
            ),
          )

          Logger.error("discord", error as string)
        }
      },
    )
  }
}
