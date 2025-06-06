import smallEmbed from "@/discord/handlers/smallEmbed"
import { SnipeRepository } from "@/repositories/snipe.repository"
import { BeatLeaderService } from "@/services/beatleader.service"
import { PlaylistService } from "@/services/playlist.service"
import { ScoreSaberService } from "@/services/scoresaber.service"
import { PlayerInfo } from "@/types/player"
import { EMBED_COLORS, LEADERBOARD } from "@/utils/contants"
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import sanitize from "sanitize-filename"

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
          { name: "scoresaber", value: LEADERBOARD.ScoreSaber },
          { name: "beatleader", value: LEADERBOARD.BeatLeader },
        )
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

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

    const snipe = await SnipeRepository.getByPlayerIdAndDiscordId(
      playerId,
      discordId,
    )

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

    let playerInfo: PlayerInfo | null = null

    if (leaderboard === LEADERBOARD.ScoreSaber) {
      playerInfo = await ScoreSaberService.getPlayerInfo(playerId)
    }

    if (leaderboard === LEADERBOARD.BeatLeader) {
      playerInfo = await BeatLeaderService.getPlayerInfo(playerId)
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

    const scores = await SnipeRepository.getScores(snipe.id, leaderboard)

    if (!scores) {
      await interaction.editReply(smallEmbed("❌ ┃ Snipe not found"))

      return
    }

    const plalistService = new PlaylistService(leaderboard)
    const playlistContent = await plalistService.create(
      snipe,
      scores,
      playerInfo,
    )
    const attachment = new AttachmentBuilder(
      Buffer.from(JSON.stringify(playlistContent)),
      {
        name: `${sanitize(playerInfo.name)}_snipe_${leaderboard}.bplist`,
      },
    )

    await interaction.editReply({
      embeds: [
        {
          color: EMBED_COLORS.primary,
          title: `✅ ┃ Snipe's playlist is ready`,
        },
      ],
      files: [attachment],
    })
  },
}
