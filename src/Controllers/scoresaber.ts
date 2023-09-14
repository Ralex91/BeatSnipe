import { async } from 'node-stream-zip'
import fetch from 'phin'

let SSDifficultyToText = (difficulty: Number) => {
    switch (difficulty) {
        case 1:
            return "Easy"
        case 3:
            return "Normal"
        case 5:
            return "Hard"
        case 7:
            return "Expert"
        case 9:
            return "ExpertPlus"
    }
}

let SSDifficultyToNumber = (difficulty: string) => {
    switch (difficulty) {
        case "Easy":
            return 1
        case "Normal":
            return 3
        case "Hard":
            return 5
        case "Expert":
            return 7
        case "ExpertPlus":
            return 9
    }
}

async function getplayerInfo(playerId: string) {
    let playerData: any = await fetch({
        url: `https://scoresaber.com/api/player/${playerId}/basic/`,
        method: "GET",
        parse: "json"
    })

    if (playerData.statusCode === 200) {
        return {
            name: playerData.body.name,
            id: playerData.body.id,
            avatar: playerData.body.profilePicture,
            pp: playerData.body.pp,
            rank: playerData.body.rank,
            country: playerData.body.country,
            countryRank: playerData.body.countryRank,
        }
    } else {
        return false
    }

}

async function getPlayerScoreMap(playerName: string, hash: string, difficulty: string, gamemode: string) {
    let getScore: any = await fetch({
        url: `https://scoresaber.com/api/leaderboard/by-hash/${hash}/scores?difficulty=${SSDifficultyToNumber(difficulty)}&search=${playerName}&gameMode=Solo${gamemode}`,
        method: "GET",
        parse: "string"
    })

    if (getScore.statusCode === 200) {
        return getScore.body.modifiedScore
    } else {
        return false
    }
}

async function getPlayerScores(scoreSaberId: string) {
    const scores = []

    try {
        let nextPage = null

        do {
            const data: any = await fetch({
                url: `https://scoresaber.com/api/player/${scoreSaberId}/scores?sort=recent&limit=100&page=${(nextPage ?? 1)}`,
                method: "GET",
                parse: "json"
            })

            const playerScores = data.body.playerScores
            const metadata = data.body.metadata

            for (const playerScore of playerScores) {
                scores.push({
                    songName: playerScore.leaderboard.songName,
                    score: playerScore.score.modifiedScore,
                    songHash: playerScore.leaderboard.songHash,
                    difficulty: SSDifficultyToText(playerScore.leaderboard.difficulty.difficulty),
                })
            }

            nextPage = metadata.page + 1 <= Math.ceil(metadata.total / metadata.itemsPerPage) ? metadata.page + 1 : null
        } while (nextPage)

        return scores
    } catch (error) {
        console.error(error)
    }
}

export default {
    getplayerInfo,
    getPlayerScoreMap,
    getPlayerScores,
}