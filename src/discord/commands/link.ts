import smallEmbed from "@/discord/handlers/smallEmbed"
import { BeatLeaderService } from "@/services/beatleader.service"
import { ScoreSaberService } from "@/services/scoresaber.service"
import db from "@/utils/db"
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

    const linked = await db.player.count({
      where: {
        discordId,
      },
    })

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

    await db.player.create({
      data: {
        id: playerId,
        discordId,
      },
    })

    const linkedEmbed = new EmbedBuilder()
      .setColor("#4cd639")
      .setTitle(playerData.name)
      .setURL(playerData.url)
      .setThumbnail(playerData.avatar)
      .setDescription(
        `Your account has been linked to your Discord account !\nRun </snipe add:1151622228639760468> command to add a player to snipe`,
      )

    await interaction.editReply({ embeds: [linkedEmbed] })
  },
}
