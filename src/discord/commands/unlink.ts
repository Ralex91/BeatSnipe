import smallEmbed from "@/discord/handlers/smallEmbed"
import { PlayerRepository } from "@/repositories/player.repository"
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"

export default {
  data: new SlashCommandBuilder()
    .setName("unlink")
    .setDescription("Unlink your account id to BeatSnipe"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })
    const discordId = interaction.user.id

    await interaction.editReply(
      smallEmbed(
        "<a:loading:1158674816136659006> ┃ Your unlink in progress ...",
      ),
    )

    const player = await PlayerRepository.getByDiscordId(discordId)

    if (!player) {
      await interaction.editReply(
        smallEmbed(
          "❌ ┃ No account link! Link your account with </link:1151622228639760465>",
        ),
      )

      return
    }

    await PlayerRepository.delete(player.discordId)

    await interaction.editReply(
      smallEmbed(
        "✅ ┃ Your account has been unlink and sniped/playlist players have been deleted",
      ),
    )
  },
}
