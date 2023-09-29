import { PrismaClient } from '@prisma/client'
import Beatleader from './beatleader';
import Scoresaber from './scoresaber';

const prisma = new PrismaClient();

async function compareSS(score) {
    const { hash, name, difficulty, gamemode, baseScore, playerId, playerName } = score

    const sniper: any = await prisma.snipe.findFirst({
        where: {
            playerId: playerId
        },
        select: {
            id: true,
            playerId: true,
            sniperId: true,
            leaderboard: true
        }
    });

    if (sniper && sniper.leaderboard.includes("scoresaber")) {

        const sniperInfo: playerInfo | boolean = await Scoresaber.getplayerInfo(sniper.sniperId)

        if (sniperInfo) {
            const snipperScore: number | boolean = await Scoresaber.getPlayerScoreMap(sniperInfo.name, hash, difficulty, gamemode)

            if (sniperInfo && snipperScore) {
                console.log(`[SS] : ${snipperScore} vs ${baseScore}`)

                if (snipperScore < baseScore) {
                    console.log(`[SS] Snipe Alert : ${playerName} snipe ${sniperInfo.name} on ${name} | ${difficulty}`)

                    const score = await prisma.score.findFirst({
                        where: {
                            playerId: playerId,
                            snipeId: sniper.id,
                            hash: hash,
                            leaderboard: "scoresaber",
                            difficulty: difficulty,
                            gamemode: gamemode,
                        },
                        select: {
                            id: true
                        }
                    })

                    if (score) {
                        const updateScore = await prisma.score.update({
                            where: {
                                id: score.id
                            },
                            data: {
                                score: baseScore
                            }
                        })

                    } else {
                        const newScore = await prisma.score.create({
                            data: {
                                name: name,
                                playerId: playerId,
                                snipeId: sniper.id,
                                hash: hash,
                                leaderboard: "scoresaber",
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
        console.log(`[SS] : No snipper found for: ${playerName}`)
    }*/

    const getSnipperScore = await prisma.score.findFirst({
        where: {
            hash: hash,
            difficulty: difficulty,
            gamemode: gamemode,
            leaderboard: "scoresaber",
            snipe: {
                sniperId: playerId
            }
        },
        select: {
            id: true,
            score: true,
            snipe: true
        }
    });

    if (getSnipperScore) {
        if (getSnipperScore.score < baseScore) {
            console.log(`${getSnipperScore.score} < ${baseScore}`)

            const deleteScore = await prisma.score.delete({
                where: {
                    id: getSnipperScore.id
                }
            })
        }
    }

}

async function compareBL(score) {
    const { hash, name, difficulty, gamemode, baseScore, playerId, playerName } = score

    const sniper: any = await prisma.snipe.findFirst({
        where: {
            playerId: playerId,
            leaderboard: "beatleader"
        },
        select: {
            id: true,
            playerId: true,
            sniperId: true,
        }
    });

    if (sniper && sniper.leaderboard.includes("beatleader")) {

        const sniperInfo: playerInfo | boolean = await Beatleader.getplayerInfo(sniper.sniperId)
        const snipperScore: number | boolean = await Beatleader.getPlayerScoreMap(sniper.sniperId, hash, difficulty, gamemode)

        if (sniperInfo && snipperScore) {
            console.log(`[BL] : ${snipperScore} vs ${baseScore}`)

            if (snipperScore < baseScore) {
                console.log(`[BL] Snipe Alert : ${playerName} snipe ${sniperInfo.name} on ${name} | ${difficulty}`)

                const score = await prisma.score.findFirst({
                    where: {
                        playerId: playerId,
                        snipeId: sniper.id,
                        hash: hash,
                        leaderboard: "beatleader",
                        difficulty: difficulty,
                        gamemode: gamemode,
                    },
                    select: {
                        id: true
                    }
                })

                if (score) {
                    const updateScore = await prisma.score.update({
                        where: {
                            id: score.id
                        },
                        data: {
                            score: baseScore
                        }
                    })

                } else {
                    const newScore = await prisma.score.create({
                        data: {
                            name: name,
                            playerId: playerId,
                            snipeId: sniper.id,
                            hash: hash,
                            leaderboard: "beatleader",
                            score: baseScore,
                            difficulty: difficulty,
                            gamemode: gamemode,
                        }
                    })
                }
            }
        }
    }/* else {
        console.log(`[BL] : No snipper found for: ${playerName}`)
    }*/

    const getSnipperScore = await prisma.score.findFirst({
        where: {
            hash: hash,
            difficulty: difficulty,
            gamemode: gamemode,
            leaderboard: "beatleader",
            snipe: {
                sniperId: playerId,
            }
        },
        select: {
            id: true,
            score: true,
            snipe: true
        }
    })

    if (getSnipperScore) {
        if (getSnipperScore.score < baseScore) {
            console.log(`${getSnipperScore.score} < ${baseScore}`)

            const deleteScore = await prisma.score.delete({
                where: {
                    id: getSnipperScore.id
                }
            })
        }
    }
}

export default {
    compareSS,
    compareBL
}