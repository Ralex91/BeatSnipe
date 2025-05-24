import smallEmbed from "@/discord/handlers/smallEmbed"
import { SnipeRepository } from "@/repositories/snipe.repository"
import { ScoreSaberService } from "@/services/scoresaber.service"
import { PlayerInfo } from "@/types/player"
import db from "@/utils/db"
import packageJson from "@package"
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"

interface snipeList {
  color: number
  title: string
  thumbnail: {
    url: string
  }
  fields: {
    name: string
    value: string
  }[]
  footer: {
    text: string
    icon_url?: string
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("Show your snipe list"),

  async execute(interaction: ChatInputCommandInteraction) {
    const discordId = interaction.user.id
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const getSniperId = await db.player.findFirst({
      where: {
        discordId,
      },
      select: {
        id: true,
      },
    })

    if (!getSniperId) {
      await interaction.editReply(
        smallEmbed(
          "❌ ┃ No account link! Link your account with </link:1151622228639760465>",
        ),
      )

      return
    }

    const getAllSnipe = await SnipeRepository.getAll(getSniperId.id)

    if (!getAllSnipe) {
      await interaction.editReply(smallEmbed("❌ ┃ Your snipe list is empty"))

      return
    }

    const snipeListEmbed: snipeList = {
      color: 0xff0000,
      title: "📋 ┃ List of players you are sniping",
      thumbnail: {
        url: "https://cdn-icons-png.flaticon.com/512/5641/5641195.png",
      },
      fields: [],
      footer: {
        text: `BeatSnipe v${packageJson.version}`,
        //icon_url: client.user?.displayAvatarURL(),
      },
    }

    for (const player of getAllSnipe) {
      let playerInfo: PlayerInfo | false = false

      if (player.leaderboard.includes("scoresaber")) {
        playerInfo = await ScoreSaberService.getPlayerInfo(player.playerId)
      } else if (player.leaderboard.includes("beatleader")) {
        playerInfo = await ScoreSaberService.getPlayerInfo(player.playerId)
      }

      if (playerInfo) {
        const field = {
          name: `👤 ┃ ${playerInfo.name}`,
          value: `🔹 \`${player.playerId}\``,
        }

        snipeListEmbed.fields.push(field)
      } else {
        console.log(`Player not found on API: ${player.playerId}`)
      }
    }

    await interaction.editReply({ embeds: [snipeListEmbed] })
  },
}
