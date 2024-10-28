import beatleader from "@/libs/beatleader"
import scoresaber from "@/libs/scoresaber"
import { PlayerScore } from "@/types/player"
import { PrismaClient } from "@prisma/client"

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

async function add(
  sniperId: string,
  playerId: string,
  leaderboard: string,
  snipeId?: string,
) {
  let snipe = null

  if (snipeId) {
    snipe = await prisma.snipe.findUnique({
      where: {
        id: snipeId,
      },
    })
  } else {
    snipe = await prisma.snipe.create({
      data: {
        sniperId,
        playerId,
        leaderboard,
      },
    })
  }

  if (!snipe) {
    console.log("Could not create/refresh snipe")

    return false
  }

  if (leaderboard.includes("scoresaber")) {
    const playerScores = await scoresaber.getPlayerScores(sniperId)
    const playerToSnipeScores = await scoresaber.getPlayerScores(playerId)

    if (playerScores && playerToSnipeScores) {
      await addScores({
        snipeId: snipe.id,
        playerId,
        leaderboard: "scoresaber",
        playerScores,
        playerToSnipeScores,
      })
    }
  }

  if (leaderboard.includes("beatleader")) {
    const playerScores = await beatleader.getPlayerScores(sniperId)
    const playerToSnipeScores = await beatleader.getPlayerScores(playerId)

    if (playerScores && playerToSnipeScores) {
      await addScores({
        snipeId: snipe.id,
        playerId,
        leaderboard: "beatleader",
        playerScores,
        playerToSnipeScores,
      })
    }
  }

  return snipe
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
  addScores,
}
