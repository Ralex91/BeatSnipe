import { PrismaClient } from "@prisma/client"
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js"
import Beatleader from "../../Controllers/beatleader"
import Scoresaber from "../../Controllers/scoresaber"
import smallEmbed from "../Handlers/SmallEmbed"

const prisma = new PrismaClient()

export default {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your account id to BeatSnipe")
    .addStringOption((option) =>
      option.setName("id").setDescription("Your account ID").setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    const playerId = interaction.options.getString("id")
    const discordId = interaction.user.id

    if (!playerId) {
      await interaction.editReply(smallEmbed("❌ ┃ Player ID is require"))

      return
    }

    const linked = await prisma.player.count({
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

    const playerDataSS = await Scoresaber.getPlayerInfo(playerId)
    const playerDataBL = await Beatleader.getPlayerInfo(playerId)
    const playerData = playerDataSS || playerDataBL

    if (!playerData) {
      await interaction.editReply(
        smallEmbed("❌ ┃ Your account does not exist on any leaderboard"),
      )

      return
    }

    await prisma.player.create({
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
