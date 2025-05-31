import { SocketResponseBL } from "@/types/beatleader"
import { NormalizedScore } from "@/types/normalizer"

export class ScoreNormalizer {
  private static calculateAccuracy(score: number, maxScore: number): number {
    if (maxScore <= 0) {
      return 0
    }

    return parseFloat(((score / maxScore) * 100).toFixed(2))
  }

  private static formatAccuracy(accuracy: number): number {
    return parseFloat((accuracy * 100).toFixed(2))
  }

  static scoreSaber({ leaderboard, score }: any): NormalizedScore {
    const accuracy = this.calculateAccuracy(
      score.modifiedScore,
      leaderboard.maxScore,
    )

    return {
      hash: leaderboard.songHash,
      name: leaderboard.songName,
      difficulty: leaderboard.difficulty.difficultyRaw.split("_")[1],
      gamemode: leaderboard.difficulty.gameMode.replace("Solo", ""),
      accuracy,
      baseScore: score.modifiedScore,
      playerId: score.leaderboardPlayerInfo.id,
      playerName: score.leaderboardPlayerInfo.name,
    }
  }

  static beatLeader(response: SocketResponseBL): NormalizedScore {
    const { leaderboard, player, accuracy, modifiedScore } = response

    return {
      hash: leaderboard.song.hash.toUpperCase(),
      name: leaderboard.song.name,
      difficulty: leaderboard.difficulty.difficultyName,
      gamemode: leaderboard.difficulty.modeName,
      accuracy: this.formatAccuracy(accuracy),
      baseScore: modifiedScore,
      playerId: player.id,
      playerName: player.name,
    }
  }
}
