import smallEmbed from "@/discord/handlers/smallEmbed"
import beatleader from "@/libs/beatleader"
import scoresaber from "@/libs/scoresaber"
import { PlayerInfo } from "@/types/player"
import packageJson from "@package"
import { PrismaClient } from "@prisma/client"
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"

const prisma = new PrismaClient()

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

    const getSniperId = await prisma.player.findFirst({
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

    const getAllSnipe = await prisma.snipe.findMany({
      where: {
        sniperId: getSniperId.id,
      },
      select: {
        playerId: true,
        leaderboard: true,
      },
    })

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
        playerInfo = await scoresaber.getPlayerInfo(player.playerId)
      } else if (player.leaderboard.includes("beatleader")) {
        playerInfo = await beatleader.getPlayerInfo(player.playerId)
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
