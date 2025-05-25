import {
  GetPlayerScoresLeaderboard,
  GetScoreParams,
  Scores,
} from "@/types/score"
import db from "@/utils/db"

export class ScoreRepository {
  static async get({
    playerId,
    snipeId,
    hash,
    leaderboard,
    difficulty,
    gamemode,
  }: GetScoreParams) {
    return await db.score.findFirst({
      where: {
        playerId,
        snipeId,
        hash,
        leaderboard,
        difficulty,
        gamemode,
      },
      select: {
        id: true,
      },
    })
  }

  static async getPlayerLeaderboardScores({
    playerId,
    hash,
    difficulty,
    gamemode,
    leaderboard,
  }: GetPlayerScoresLeaderboard) {
    return await db.score.findMany({
      where: {
        hash,
        difficulty,
        gamemode,
        leaderboard,
        snipe: {
          sniperId: playerId,
        },
      },
      select: {
        id: true,
        score: true,
        snipe: true,
      },
    })
  }

  static async add(score: Scores) {
    return await db.score.create({
      data: score,
    })
  }

  static async addScores(scores: Scores[]) {
    return await db.score.createMany({
      data: scores.reverse(),
      skipDuplicates: true,
    })
  }

  static async delete(id: number) {
    return await db.score.delete({
      where: {
        id,
      },
    })
  }

  static async deleteBySnipeId(snipeId: string) {
    return await db.score.deleteMany({
      where: {
        snipeId,
      },
    })
  }
}
