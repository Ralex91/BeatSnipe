import { PrismaClient } from '@prisma/client'
import Beatleader from './beatleader';
import Scoresaber from './scoresaber';

const prisma = new PrismaClient();

export default async function (score, leaderboard: string) {
    const prefix = leaderboard === "scoresaber" ? "SS" : leaderboard === "beatleader" ? "BL" : false;

    if (!prefix) {
        console.log("Invaild leaderboard")
        return false
    }

    const { hash, name, difficulty, gamemode, baseScore, playerId, playerName } = score

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

    if (sniper) {
        let sniperInfo: playerInfo | false

        if (leaderboard === "scoresaber") {
            sniperInfo = await Scoresaber.getplayerInfo(sniper.sniperId)
        } else if (leaderboard === "beatleader") {
            sniperInfo = await Beatleader.getplayerInfo(sniper.sniperId)
        }

        if (sniperInfo) {
            let snipperScore: number | false

            if (leaderboard === "scoresaber") {
                sniperInfo = await Scoresaber.getPlayerScoreMap(sniperInfo.name, hash, difficulty, gamemode)
            } else if (leaderboard === "beatleader") {
                sniperInfo = await Beatleader.getPlayerScoreMap(sniper.sniperId, hash, difficulty, gamemode)
            }

            if (sniperInfo && snipperScore) {
                console.log(`[${prefix}] : ${snipperScore} vs ${baseScore}`)

                if (snipperScore < baseScore) {
                    console.log(`[${prefix}] Snipe Alert : ${playerName} snipe ${sniperInfo.name} on ${name} | ${difficulty}`)

                    const score = await prisma.score.findFirst({
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

                    if (score) {
                        const deleteOldScore = await prisma.score.delete({
                            where: {
                                id: score.id
                            }
                        })

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

                    } else {
                        const newScore = await prisma.score.create({
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
                }
            }
        }
    }/* else {
        console.log(`[${prefix}] : No snipper found for: ${playerName}`)
    }*/

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

    if (snipePlayersScores) {
        for (const playerScore of snipePlayersScores) {
            if (playerScore.score < baseScore) {
                console.log(`[${prefix}] ${playerName} beat a score of ${playerScore.snipe.playerId}, on ${name} | ${difficulty}`)
                console.log(`[${prefix}] ${playerScore.score} < ${baseScore}`)

                console.log(playerScore.id)
                const deleteScore = await prisma.score.delete({
                    where: {
                        id: playerScore.id
                    }
                })

                console.log(deleteScore)
            } else {
                console.log(`[${prefix}] ${playerName} doesn't beat ${playerScore.snipe.playerId} score on ${name} | ${difficulty}`)
                console.log(`[${prefix}] ${playerScore.score} > ${baseScore}`)
            }
        }

        /*if (snipePlayerScore.score < baseScore) {
            console.log(`[${prefix}] ${playerName} beat a score of ${snipePlayerScore.snipe.playerId}, on ${name} | ${difficulty}`)
            console.log(`[${prefix}] ${snipePlayerScore.score} < ${baseScore}`)

            console.log(snipePlayerScore.id)
            const deleteScore = await prisma.score.delete({
                where: {
                    id: snipePlayerScore.id
                }
            })

            console.log(deleteScore)
        } else {
            console.log(`[${prefix}] ${playerName} doesn't beat ${snipePlayerScore.snipe.playerId} score on ${name} | ${difficulty}`)
            console.log(`[${prefix}] ${snipePlayerScore.score} > ${baseScore}`)
        }*/
    }
}