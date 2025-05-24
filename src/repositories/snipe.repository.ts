import db from "@/utils/db"

type AddScores = {
  name: string
  playerId: string
  snipeId: string
  hash: string
  leaderboard: string
  score: number
  difficulty: string
  gamemode: string
}

export class SnipeRepository {
  static async getById(id: string) {
    return await db.snipe.findUnique({
      where: {
        id,
      },
    })
  }

  static async getByPlayerId(playerId: string) {
    return await db.snipe.findFirst({
      where: {
        playerId,
      },
    })
  }

  static async getByPlayerIdAndSniperID(playerId: string, sniperId: string) {
    return await db.snipe.findFirst({
      where: {
        playerId,
        sniperId,
      },
    })
  }

  static async getByPlayerIdAndDiscordId(playerId: string, discordId: string) {
    return await db.snipe.findFirst({
      where: {
        playerId,
        sniper: {
          discordId,
        },
      },
    })
  }

  static async getAll(sniperId: string) {
    return await db.snipe.findMany({
      where: {
        sniperId,
      },
      select: {
        playerId: true,
        leaderboard: true,
      },
    })
  }

  static async getTotal(sniperId: string) {
    return await db.snipe.count({
      where: {
        sniperId,
      },
    })
  }

  static async getSnipers(playerId: string) {
    return await db.snipe.findFirst({
      where: {
        playerId,
      },
    })
  }

  static async add(sniperId: string, playerId: string, leaderboard: string) {
    return await db.snipe.create({
      data: {
        sniperId,
        playerId,
        leaderboard,
      },
    })
  }

  static async addScores(scores: AddScores[]) {
    return await db.score.createMany({
      data: scores.reverse(),
      skipDuplicates: true,
    })
  }

  static async delete(id: string) {
    return await db.snipe.delete({
      where: {
        id,
      },
    })
  }
}
