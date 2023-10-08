import { PrismaClient } from '@prisma/client'
import Beatleader from './beatleader'
import Scoresaber from './scoresaber'

const prisma = new PrismaClient()

const checkNewSnipeScore = async (scoreData: comparator, leaderboard: string) => {
    const prefix = leaderboard === "scoresaber" ? "SS" : leaderboard === "beatleader" ? "BL" : false

    if (!prefix) {
        console.log("Invalid leaderboard")
        return false
    }

    const { hash, name, difficulty, gamemode, baseScore, playerId, playerName } = scoreData

    const sniper = await prisma.snipe.findFirst({
        where: {
            playerId: playerId
        },
        select: {
            id: true,
            playerId: true,
            sniperId: true,
            leaderboard: true
        }
    })

    // There's no sniper on this player
    if (!sniper) {
        return false
    }

    let sniperInfo: playerInfo | false

    if (leaderboard === "scoresaber") {
        sniperInfo = await Scoresaber.getplayerInfo(sniper.sniperId)
    } else if (leaderboard === "beatleader") {
        sniperInfo = await Beatleader.getplayerInfo(sniper.sniperId)
    }

    // Sniper info not found
    if (!sniperInfo) {
        return false
    }

    let snipperScore: number | false

    if (leaderboard === "scoresaber") {
        snipperScore = await Scoresaber.getPlayerScoreMap(sniperInfo.name, hash, difficulty, gamemode)
    } else if (leaderboard === "beatleader") {
        snipperScore = await Beatleader.getPlayerScoreMap(sniper.sniperId, hash, difficulty, gamemode)
    }

    // No sniper score on this map & difficulty
    if (!snipperScore) {
        return false
    }

    console.log(`[${prefix}] ${playerName} attempted snipe a score on ${name} | ${difficulty}`)
    console.log(`[${prefix}] ${snipperScore} vs ${baseScore} `)

    // Player don't beat sniper score
    if (snipperScore > baseScore) {
        return false
    }

    // Player beat sniper score: snipperScore < baseScore
    console.log(`[${prefix}] Snipe Alert : ${playerName} snipe ${sniperInfo.name} on ${name} | ${difficulty}`)

    const getScore = await prisma.score.findFirst({
        where: {
            playerId: playerId,
            snipeId: sniper.id,
            hash: hash,
            leaderboard: leaderboard,
            difficulty: difficulty,
            gamemode: gamemode,
        },
        select: {
            id: true
        }
    })

    // Deletion of previous score
    if (getScore) {
        const deleteOldScore = await prisma.score.delete({
            where: {
                id: getScore.id
            }
        })
    }

    // Save player score
    const createNewScore = await prisma.score.create({
        data: {
            name: name,
            playerId: playerId,
            snipeId: sniper.id,
            hash: hash,
            leaderboard: leaderboard,
            score: baseScore,
            difficulty: difficulty,
            gamemode: gamemode,
        }
    })
}

const checkSniperBeatScore = async (scoreData: comparator, leaderboard: string) => {
    const prefix = leaderboard === "scoresaber" ? "SS" : leaderboard === "beatleader" ? "BL" : false

    if (!prefix) {
        console.log("Invalid leaderboard")
        return false
    }

    const { hash, name, difficulty, gamemode, baseScore, playerId, playerName } = scoreData

    const snipePlayersScores = await prisma.score.findMany({
        where: {
            hash: hash,
            difficulty: difficulty,
            gamemode: gamemode,
            leaderboard: leaderboard,
            snipe: {
                sniperId: playerId
            }
        },
        select: {
            id: true,
            score: true,
            snipe: true
        }
    })

    // Sniper has no scores to beat OR sniper not found
    if (!snipePlayersScores) {
        return false
    }

    for (const playerScore of snipePlayersScores) {
        if (playerScore.score < baseScore) {
            console.log(`[${prefix}] ${playerName} beat a score of ${playerScore.snipe.playerId}, on ${name} | ${difficulty}`)
            console.log(`[${prefix}] ${playerScore.score} < ${baseScore}`)

            // Delete sniped score
            const deleteScore = await prisma.score.delete({
                where: {
                    id: playerScore.id
                }
            })
        } else {
            console.log(`[${prefix}] ${playerName} doesn't beat ${playerScore.snipe.playerId} score on ${name} | ${difficulty}`)
            console.log(`[${prefix}] ${playerScore.score} > ${baseScore}`)
        }
    }
}

export default async function (score: comparator, leaderboard: string) {
    await checkNewSnipeScore(score, leaderboard)
    await checkSniperBeatScore(score, leaderboard)
}