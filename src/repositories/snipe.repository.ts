import db from "@/utils/db"

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

  static async getScores(id: string, leaderboard: string) {
    const result = await db.snipe.findUnique({
      where: {
        id,
      },
      select: {
        scores: {
          where: {
            leaderboard,
          },
        },
      },
    })

    return result?.scores
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

  static async delete(id: string) {
    return await db.snipe.delete({
      where: {
        id,
      },
    })
  }
}
