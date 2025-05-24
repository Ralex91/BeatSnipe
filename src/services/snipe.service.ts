import { SnipeRepository } from "@/repositories/snipe.repository"
import { BeatLeaderService } from "@/services/beatleader.service"
import { ScoreSaberService } from "@/services/scoresaber.service"
import { PlayerScore } from "@/types/player"
import { LEADERBOARD } from "@/utils/contantes"

type AddScoresParams = {
  snipeId: string
  playerId: string
  leaderboard: string
  playerScores: PlayerScore[]
  playerToSnipeScores: PlayerScore[]
}

export class SnipeService {
  static async saveScores({
    snipeId,
    playerId,
    leaderboard,
    playerScores,
    playerToSnipeScores,
  }: AddScoresParams) {
    const scoresToSnipe = []

    for (const s1 of playerToSnipeScores) {
      if (
        playerScores.find(
          (s2) =>
            s1.songHash === s2.songHash &&
            s1.difficulty === s2.difficulty &&
            s2.score < s1.score,
        )
      ) {
        scoresToSnipe.push({
          name: s1.songName,
          playerId,
          snipeId,
          hash: s1.songHash,
          leaderboard,
          score: s1.score,
          difficulty: s1.difficulty,
          gamemode: "Standard",
        })
      }
    }

    await SnipeRepository.addScores(scoresToSnipe)
  }

  static async add(
    sniperId: string,
    playerId: string,
    leaderboard: string,
    snipeId?: string,
  ) {
    let snipe = null

    if (snipeId) {
      snipe = await SnipeRepository.getById(snipeId)
    } else {
      snipe = await SnipeRepository.add(sniperId, playerId, leaderboard)
    }

    if (!snipe) {
      console.log("Could not create/refresh snipe")

      return false
    }

    if (leaderboard.includes(LEADERBOARD.ScoreSaber)) {
      const playerScores = await ScoreSaberService.getPlayerScores(sniperId)
      const playerToSnipeScores =
        await ScoreSaberService.getPlayerScores(playerId)

      if (playerScores && playerToSnipeScores) {
        await this.saveScores({
          snipeId: snipe.id,
          playerId,
          leaderboard: LEADERBOARD.ScoreSaber,
          playerScores,
          playerToSnipeScores,
        })
      }
    }

    if (leaderboard.includes(LEADERBOARD.BeatLeader)) {
      const playerScores = await BeatLeaderService.getPlayerScores(sniperId)
      const playerToSnipeScores =
        await BeatLeaderService.getPlayerScores(playerId)

      if (playerScores && playerToSnipeScores) {
        await this.saveScores({
          snipeId: snipe.id,
          playerId,
          leaderboard: LEADERBOARD.BeatLeader,
          playerScores,
          playerToSnipeScores,
        })
      }
    }

    return snipe
  }

  static async delete(snipeId: string) {
    return await SnipeRepository.delete(snipeId)
  }
}
