import db from "@/utils/db"

export class PlayerRepository {
  static async getByDiscordId(id: string) {
    return await db.player.findUnique({
      where: {
        discordId: id,
      },
    })
  }

  static async add(playerId: string, discordId: string) {
    return await db.player.create({
      data: {
        id: playerId,
        discordId,
      },
    })
  }

  static async delete(discordId: string) {
    return await db.player.delete({
      where: {
        discordId,
      },
    })
  }
}
