import { SnipeRepository } from "@/repositories/snipe.repository"
import { BeatLeaderService } from "@/services/beatleader.service"
import { PlaylistService } from "@/services/playlist.service"
import { ScoreSaberService } from "@/services/scoresaber.service"
import { LEADERBOARD } from "@/utils/contantes"
import { Context } from "hono"

export class PlaylistController {
  static async getPlaylist(c: Context) {
    const { leaderboard, snipeId } = c.req.param()

    if (!Object.values(LEADERBOARD).includes(leaderboard)) {
      return c.json({ code: 403, message: "Leaderboard not supported" }, 403)
    }

    const snipe = await SnipeRepository.getById(snipeId)

    if (!snipe) {
      return c.json({ code: 404, message: "Playlist not found" }, 404)
    }

    if (!snipe.leaderboard.split(",").includes(leaderboard)) {
      return c.json(
        { code: 403, message: "This snipe not for this leaderboard" },
        403,
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
      return c.json({ code: 404, message: "Player not found" }, 404)
    }

    const scores = await SnipeRepository.getScores(snipe.id, leaderboard)

    if (!scores) {
      return c.json({ code: 404, message: "Scores not found" }, 404)
    }

    const playlistService = new PlaylistService(leaderboard)
    const playlist = await playlistService.create(snipe, scores, player)

    return c.json(playlist)
  }
}
