import smallEmbed from "@/discord/handlers/smallEmbed"
import { PlayerRepository } from "@/repositories/player.repository"
import { BeatLeaderService } from "@/services/beatleader.service"
import { ScoreSaberService } from "@/services/scoresaber.service"
import { EMBED_COLORS } from "@/utils/contants"
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"

export default {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your account id to BeatSnipe")
    .addStringOption((option) =>
      option.setName("id").setDescription("Your account ID").setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const playerId = interaction.options.getString("id")
    const discordId = interaction.user.id

    if (!playerId) {
      await interaction.editReply(smallEmbed("❌ ┃ Player ID is require"))

      return
    }

    const linked = await PlayerRepository.getByDiscordId(discordId)

    if (linked) {
      await interaction.editReply(
        smallEmbed("❌ ┃ Your account already linked !"),
      )

      return
    }

    const playerDataSS = await ScoreSaberService.getPlayerInfo(playerId)
    const playerDataBL = await BeatLeaderService.getPlayerInfo(playerId)
    const playerData = playerDataSS || playerDataBL

    if (!playerData) {
      await interaction.editReply(
        smallEmbed("❌ ┃ Your account does not exist on any leaderboard"),
      )

      return
    }

    await PlayerRepository.add(playerId, discordId)

    const linkedEmbed = new EmbedBuilder()
      .setColor(EMBED_COLORS.success)
      .setTitle(playerData.name)
      .setURL(playerData.url)
      .setThumbnail(playerData.avatar)
      .setDescription(
        `Your account has been linked to your Discord account !\nRun </snipe add:1151622228639760468> command to add a player to snipe`,
      )

    await interaction.editReply({ embeds: [linkedEmbed] })
  },
}
