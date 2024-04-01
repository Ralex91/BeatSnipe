import { PrismaClient } from "@prisma/client"
import { Comparator } from "src/Types/comparator"
import { PlayerInfo } from "src/Types/player"
import Beatleader from "./beatleader"
import Scoresaber from "./scoresaber"

const shortName = (leaderboard: string) => {
  if (leaderboard === "scoresaber") {
    return "SS"
  }

  if (leaderboard === "beatleader") {
    return "BL"
  }

  return false
}
const prisma = new PrismaClient()
const checkNewSnipeScore = async (
  scoreData: Comparator,
  leaderboard: string,
) => {
  const prefix = shortName(leaderboard)

  if (!prefix) {
    console.log("Invalid leaderboard")

    return
  }

  const { hash, name, difficulty, gamemode, baseScore, playerId, playerName } =
    scoreData
  const sniper = await prisma.snipe.findFirst({
    where: {
      playerId,
    },
    select: {
      id: true,
      playerId: true,
      sniperId: true,
      leaderboard: true,
    },
  })

  // There's no sniper on this player
  if (!sniper) {
    return
  }

  let sniperInfo: PlayerInfo | false = false

  if (leaderboard === "scoresaber") {
    sniperInfo = await Scoresaber.getPlayerInfo(sniper.sniperId)
  } else if (leaderboard === "beatleader") {
    sniperInfo = await Beatleader.getPlayerInfo(sniper.sniperId)
  }

  // Sniper info not found
  if (!sniperInfo) {
    return
  }

  let snipperScore: number = 0

  if (leaderboard === "scoresaber") {
    snipperScore = await Scoresaber.getPlayerScoreMap(
      sniperInfo.name,
      hash,
      difficulty,
      gamemode,
    )
  } else if (leaderboard === "beatleader") {
    snipperScore = await Beatleader.getPlayerScoreMap(
      sniper.sniperId,
      hash,
      difficulty,
      gamemode,
    )
  }

  // No sniper score on this map & difficulty
  if (!snipperScore) {
    return
  }

  console.log(
    `[${prefix}] ${playerName} attempted snipe a score on ${name} | ${difficulty}`,
  )
  console.log(`[${prefix}] ${snipperScore} vs ${baseScore} `)

  // Player don't beat sniper score
  if (snipperScore > baseScore) {
    return
  }

  // Player beat sniper score: snipperScore < baseScore
  console.log(
    `[${prefix}] Snipe Alert : ${playerName} snipe ${sniperInfo.name} on ${name} | ${difficulty}`,
  )

  const getScore = await prisma.score.findFirst({
    where: {
      playerId,
      snipeId: sniper.id,
      hash,
      leaderboard,
      difficulty,
      gamemode,
    },
    select: {
      id: true,
    },
  })

  // Deletion of previous score
  if (getScore) {
    await prisma.score.delete({
      where: {
        id: getScore.id,
      },
    })
  }

  // Save player score
  await prisma.score.create({
    data: {
      name,
      playerId,
      snipeId: sniper.id,
      hash,
      leaderboard,
      score: baseScore,
      difficulty,
      gamemode,
    },
  })
}
const checkSniperBeatScore = async (
  scoreData: Comparator,
  leaderboard: string,
) => {
  const prefix = shortName(leaderboard)

  if (!prefix) {
    console.log("Invalid leaderboard")

    return
  }

  const { hash, name, difficulty, gamemode, baseScore, playerId, playerName } =
    scoreData
  const snipePlayersScores = await prisma.score.findMany({
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

  // Sniper has no scores to beat OR sniper not found
  if (!snipePlayersScores) {
    return
  }

  for (const playerScore of snipePlayersScores) {
    if (playerScore.score < baseScore) {
      console.log(
        `[${prefix}] ${playerName} beat a score of ${playerScore.snipe.playerId}, on ${name} | ${difficulty}`,
      )
      console.log(`[${prefix}] ${playerScore.score} < ${baseScore}`)

      // Delete sniped score
      await prisma.score.delete({
        where: {
          id: playerScore.id,
        },
      })
    } else {
      console.log(
        `[${prefix}] ${playerName} doesn't beat ${playerScore.snipe.playerId} score on ${name} | ${difficulty}`,
      )
      console.log(`[${prefix}] ${playerScore.score} > ${baseScore}`)
    }
  }
}

export default async function comparator(
  score: Comparator,
  leaderboard: string,
) {
  await checkNewSnipeScore(score, leaderboard)
  await checkSniperBeatScore(score, leaderboard)
}
