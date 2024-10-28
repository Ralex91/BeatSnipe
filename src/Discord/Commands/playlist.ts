import beatleader from "@/Controllers/beatleader"
import scoresaber from "@/Controllers/scoresaber"
import smallEmbed from "@/Discord/Handlers/SmallEmbed"
import playlist from "@/Utils/playlist"
import { PrismaClient } from "@prisma/client"
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js"
import sanitize from "sanitize-filename"
import { PlayerInfo } from "src/Types/player"

const prisma = new PrismaClient()
const cooldown = new Set()

export default {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Generate a snipe playlist")
    .addStringOption((option) =>
      option.setName("player").setDescription("Player ID").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("leaderboard")
        .setDescription("Leaderboard scores")
        .addChoices(
          { name: "scoresaber", value: "scoresaber" },
          { name: "beatleader", value: "beatleader" },
        )
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    const playerId = interaction.options.getString("player")
    const discordId = interaction.user.id
    const leaderboard = interaction.options.getString("leaderboard")

    if (cooldown.has(discordId)) {
      await interaction.editReply(
        smallEmbed(
          "⏱ ┃ You have to wait 20 seconde before you can use the playlist commands again",
        ),
      )

      return
    }

    if (!playerId) {
      await interaction.editReply(smallEmbed("❌ ┃ Player ID is require"))

      return
    }

    if (!leaderboard) {
      await interaction.editReply(smallEmbed("❌ ┃ Leaderboard is require"))

      return
    }

    const snipe = await prisma.snipe.findFirst({
      where: {
        playerId,
        sniper: {
          discordId,
        },
      },
      select: {
        id: true,
        leaderboard: true,
      },
    })

    cooldown.add(discordId)
    setTimeout(() => {
      cooldown.delete(discordId)
    }, 20000)

    if (!snipe) {
      await interaction.editReply(smallEmbed("❌ ┃ Snipe not found"))

      return
    }

    if (!snipe.leaderboard.split(",").includes(leaderboard)) {
      interaction.editReply(
        smallEmbed("❌ ┃ The snipe is not active on this leaderboard"),
      )

      return
    }

    let playerInfo: PlayerInfo | false = false

    if (leaderboard === "scoresaber") {
      playerInfo = await scoresaber.getPlayerInfo(playerId)
    }

    if (leaderboard === "beatleader") {
      playerInfo = await beatleader.getPlayerInfo(playerId)
    }

    if (!playerInfo) {
      await interaction.editReply(
        smallEmbed("❌ ┃ The player is not registered in this leaderboard"),
      )

      return
    }

    await interaction.editReply(
      smallEmbed(
        "<a:loading:1158674816136659006> ┃ Playlist generation in progress...",
      ),
    )

    const playlistContent = await playlist(leaderboard, snipe.id)
    const attachment = new AttachmentBuilder(
      Buffer.from(JSON.stringify(playlistContent)),
      {
        name: `${sanitize(playerInfo.name)}_snipe_${leaderboard}.bplist`,
      },
    )

    await interaction.editReply({
      embeds: [{ color: 0xff0000, title: `✅ ┃ Snipe's playlist is ready` }],
      files: [attachment],
    })
  },
}
