import { PrismaClient } from '@prisma/client'
import Scoresaber from './scoresaber';
import Beatleader from './beatleader'

const prisma = new PrismaClient()

const addScores = async (snipeId: string, playerId: string, leaderboard: string, playerScores: playerScore[], playerToSnipeScores: playerScore[]) => {
    let scoresToSnipe = []

    for (const s1 of playerToSnipeScores) {
        if (playerScores.find(s2 => s1.songHash === s2.songHash && s1.difficulty === s2.difficulty && s2.score < s1.score)) {
            scoresToSnipe.push({
                name: s1.songName,
                playerId: playerId,
                snipeId: snipeId,
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
}

async function add(sniperId: string, playerId: string, leaderboard) {
    const createSnipe = await prisma.snipe.create({
        data: {
            sniperId: sniperId,
            playerId: playerId,
            leaderboard: leaderboard,
        }
    })

    const leaderboards = createSnipe.leaderboard.split(",")

    if (leaderboards.includes("scoresaber")) {
        let playerScores: playerScore[] = await Scoresaber.getPlayerScores(sniperId)
        let playerToSnipeScores: playerScore[] = await Scoresaber.getPlayerScores(playerId)

        await addScores(createSnipe.id, playerId, "scoresaber", playerScores, playerToSnipeScores)
    }

    if (leaderboards.includes("beatleader")) {
        let playerScores: playerScore[] = await Beatleader.getPlayerScores(sniperId)
        let playerToSnipeScores: playerScore[] = await Beatleader.getPlayerScores(playerId)

        await addScores(createSnipe.id, playerId, "beatleader", playerScores, playerToSnipeScores)
    }

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