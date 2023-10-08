import fetch from 'phin'

const SSDifficulty = {
    "Easy": 1,
    "Normal": 3,
    "Hard": 5,
    "Expert": 7,
    "ExpertPlus": 9
}

const convertSSDifficulty = (value: string | number, index: boolean = false) => {
    if (index) {
        return SSDifficulty[value]
    }

    return Object.keys(SSDifficulty).find(key => SSDifficulty[key] === value)
}

async function getplayerInfo(playerId: string) {
    const playerData: any = await fetch({
        url: `https://scoresaber.com/api/player/${playerId}/basic/`,
        method: "GET",
        parse: "json"
    })

    if (playerData.statusCode !== 200) {
        return false
    }

    return {
        name: playerData.body.name,
        id: playerData.body.id,
        avatar: playerData.body.profilePicture,
        pp: playerData.body.pp,
        rank: playerData.body.rank,
        country: playerData.body.country,
        countryRank: playerData.body.countryRank,
    }

}

async function getPlayerScoreMap(playerName: string, hash: string, difficulty: string, gamemode: string) {
    const getScore: any = await fetch({
        url: `https://scoresaber.com/api/leaderboard/by-hash/${hash}/scores?difficulty=${convertSSDifficulty(difficulty, true)}&search=${playerName}&gameMode=Solo${gamemode}`,
        method: "GET",
        parse: "json"
    })

    if (getScore.statusCode !== 200) {
        return false
    }

    return getScore.body.scores[0].modifiedScore
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
                    difficulty: convertSSDifficulty(playerScore.leaderboard.difficulty.difficulty),
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