import { PrismaClient } from '@prisma/client'
import Beatleader from './beatleader';
import Scoresaber from './scoresaber';

const prisma = new PrismaClient();

async function compareSS(score) {

    let [hash, name, difficulty, gamemode, accuracy, baseScore, playerId, playerName] = score

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

        let sniperInfo: playerInfo | boolean = await Scoresaber.getplayerInfo(playerId)
        let snipperScore: number | boolean = await Scoresaber.getPlayerScoreMap(playerName, hash, difficulty, gamemode)

        if (sniperInfo && snipperScore) {
            console.log(`[SS] : ${snipperScore} < ${baseScore}`)

            if (snipperScore < baseScore) {
                console.log(`[SS] Snipe Alert : ${playerName} snipe ${sniper.sniper.name} on ${name} | ${difficulty}`)

                let score = await prisma.score.findFirst({
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
        console.log(`${getSnipperScore.score} > ${baseScore}`)

        if (getSnipperScore.score < baseScore) {
            const deleteScore = await prisma.score.delete({
                where: {
                    id: getSnipperScore.id
                }
            })
        }
    }

}

async function compareBL(score) {
    let [hash, name, difficulty, gamemode, accuracy, baseScore, playerId, playerName] = score

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

        let sniperInfo: playerInfo | boolean = await Beatleader.getplayerInfo(playerId)
        let snipperScore: number | boolean = await Beatleader.getPlayerScoreMap(playerId, hash, difficulty, gamemode)

        if (sniperInfo && snipperScore) {
            console.log(`[BL] : ${snipperScore} < ${baseScore}`)

            if (snipperScore < baseScore) {
                console.log(`[BL] Snipe Alert : ${sniperInfo.name} snipe ${sniper.sniper.name} on ${name} | ${difficulty}`)

                let score = await prisma.score.findFirst({
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
    });

    if (getSnipperScore) {
        console.log(`${getSnipperScore.score} > ${baseScore}`)

        if (getSnipperScore.score < baseScore) {
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