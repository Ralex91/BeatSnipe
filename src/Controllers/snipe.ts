import { PrismaClient } from '@prisma/client'
import Scoresaber from './scoresaber';
import Beatleader from './beatleader'

const prisma = new PrismaClient();

async function add(sniperId: string, playerId: string, leaderboard) {
    const createSnipe = await prisma.snipe.create({
        data: {
            sniperId: sniperId,
            playerId: playerId,
            leaderboard: leaderboard,
        }
    })

    const leaderboards = createSnipe.leaderboard.split(",")
    const scoresToSnipe = []
    let playerScores: playerScore[]
    let playerToSnipeScores: playerScore[]

    if (leaderboards.includes("scoresaber")) {
        playerScores = await Scoresaber.getPlayerScores(sniperId)
        playerToSnipeScores = await Scoresaber.getPlayerScores(playerId)
    }

    if (leaderboards.includes("beatleader")) {
        playerScores = await Beatleader.getPlayerScores(sniperId)
        playerToSnipeScores = await Beatleader.getPlayerScores(playerId)
    }

    for (const s1 of playerToSnipeScores) {
        if (playerScores.find(s2 => s1.songHash === s2.songHash && s1.difficulty === s2.difficulty && s2.score < s1.score)) {
            scoresToSnipe.push({
                name: s1.songName,
                playerId: playerId,
                snipeId: createSnipe.id,
                hash: s1.songHash,
                leaderboard: leaderboard,
                score: s1.score,
                difficulty: s1.difficulty,
                gamemode: "Standard"
            })
        }
    }

    const addScore = await prisma.score.createMany({
        data: scoresToSnipe.reverse(),
        skipDuplicates: true
    })

    return createSnipe
}

async function remove(snipeId: string) {
    const deleteSnipeScores = await prisma.score.deleteMany({
        where: {
            snipeId: snipeId
        }
    })

    const deleteSnipe = await prisma.snipe.delete({
        where: {
            id: snipeId
        }
    })

    return true
}

export default {
    add,
    remove
}