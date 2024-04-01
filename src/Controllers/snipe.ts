import { PrismaClient } from "@prisma/client"
import { PlayerScore } from "src/Types/player"
import Beatleader from "./beatleader"
import Scoresaber from "./scoresaber"

const prisma = new PrismaClient()

type AddScoresParams = {
  snipeId: string
  playerId: string
  leaderboard: string
  playerScores: PlayerScore[]
  playerToSnipeScores: PlayerScore[]
}

const addScores = async ({
  snipeId,
  playerId,
  leaderboard,
  playerScores,
  playerToSnipeScores,
}: AddScoresParams) => {
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

  await prisma.score.createMany({
    data: scoresToSnipe.reverse(),
    skipDuplicates: true,
  })
}

async function add(sniperId: string, playerId: string, leaderboard: string) {
  const createSnipe = await prisma.snipe.create({
    data: {
      sniperId,
      playerId,
      leaderboard,
    },
  })

  if (leaderboard.includes("scoresaber")) {
    const playerScores = await Scoresaber.getPlayerScores(sniperId)
    const playerToSnipeScores = await Scoresaber.getPlayerScores(playerId)

    if (playerScores && playerToSnipeScores) {
      await addScores({
        snipeId: createSnipe.id,
        playerId,
        leaderboard: "scoresaber",
        playerScores,
        playerToSnipeScores,
      })
    }
  }

  if (leaderboard.includes("beatleader")) {
    const playerScores = await Beatleader.getPlayerScores(sniperId)
    const playerToSnipeScores = await Beatleader.getPlayerScores(playerId)

    if (playerScores && playerToSnipeScores) {
      await addScores({
        snipeId: createSnipe.id,
        playerId,
        leaderboard: "beatleader",
        playerScores,
        playerToSnipeScores,
      })
    }
  }

  return createSnipe
}

async function remove(snipeId: string) {
  await prisma.snipe.delete({
    where: {
      id: snipeId,
    },
  })

  return true
}

export default {
  add,
  remove,
}
