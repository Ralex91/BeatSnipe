import fetch from 'phin'

async function getplayerInfo(playerId: string) {
    const playerData: any = await fetch({
        url: `https://api.beatleader.xyz/player/${playerId}?stats=false&keepOriginalId=false`,
        method: "GET",
        parse: "string"
    })

    if (playerData.statusCode !== 200) {
        return false
    }

    const data = JSON.parse(playerData.body)
    return {
        name: data.name,
        id: data.id,
        avatar: data.avatar,
        pp: data.pp,
        rank: data.rank,
        country: data.country,
        countryRank: data.countryRank,
    }
}

async function getPlayerScoreMap(playerId: string, hash: string, difficulty: string, gamemode: string) {
    const getScore: any = await fetch({
        url: `https://api.beatleader.xyz/player/${playerId}/scorevalue/${hash}/${difficulty}/${gamemode}`,
        method: "GET",
        parse: "string"
    })

    if (getScore.statusCode !== 200) {
        return false
    }

    let data = JSON.parse(getScore.body)
    return data.score
}

async function getPlayerScores(beatLeaderId: string) {
    const scores = []

    try {
        let nextPage = null

        do {
            const data: any = await fetch({
                url: `https://api.beatleader.xyz/player/${beatLeaderId}/scores?sortBy=date&order=desc&count=100&page=${(nextPage ?? 1)}`,
                method: "GET",
                parse: "json"
            })
            const playerScores = data.body.data
            const metadata = data.body.metadata

            for (const playerScore of playerScores) {
                scores.push({
                    songName: playerScore.leaderboard.songName,
                    songHash: playerScore.leaderboard.song.hash,
                    score: playerScore.modifiedScore,
                    difficulty: playerScore.leaderboard.difficulty.value,
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