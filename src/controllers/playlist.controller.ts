import { SnipeRepository } from "@/repositories/snipe.repository"
import { BeatLeaderService } from "@/services/beatleader.service"
import { PlaylistService } from "@/services/playlist.service"
import { ScoreSaberService } from "@/services/scoresaber.service"
import { LEADERBOARD } from "@/utils/contantes"
import { Context } from "hono"
import { StatusCodes } from "http-status-codes"

export class PlaylistController {
  static async getPlaylist(c: Context) {
    const { leaderboard, snipeId } = c.req.param()

    if (!Object.values(LEADERBOARD).includes(leaderboard)) {
      return c.json(
        { error: "Leaderboard not supported" },
        StatusCodes.BAD_REQUEST,
      )
    }

    const snipe = await SnipeRepository.getById(snipeId)

    if (!snipe) {
      return c.json({ error: "Playlist not found" }, StatusCodes.NOT_FOUND)
    }

    if (!snipe.leaderboard.split(",").includes(leaderboard)) {
      return c.json(
        { error: "This snipe not for this leaderboard" },
        StatusCodes.BAD_REQUEST,
      )
    }

    let player = null

    switch (leaderboard) {
      case LEADERBOARD.ScoreSaber:
        player = await ScoreSaberService.getPlayerInfo(snipe.playerId)

        break

      case LEADERBOARD.BeatLeader:
        player = await BeatLeaderService.getPlayerInfo(snipe.playerId)

        break
    }

    if (!player) {
      return c.json({ error: "Player not found" }, StatusCodes.NOT_FOUND)
    }

    const scores = await SnipeRepository.getScores(snipe.id, leaderboard)

    if (!scores) {
      return c.json({ error: "Scores not found" }, StatusCodes.NOT_FOUND)
    }

    const playlistService = new PlaylistService(leaderboard)
    const playlist = await playlistService.create(snipe, scores, player)

    return c.json(playlist)
  }
}
