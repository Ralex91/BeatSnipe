import fetch from "phin"

async function getPlayerInfo(playerId: string) {
  try {
    const playerData = await fetch({
      url: `https://api.beatleader.xyz/player/${playerId}?stats=false&keepOriginalId=false`,
      method: "GET",
      parse: "string",
    })

    if (playerData.statusCode !== 200) {
      return false
    }

    const data = JSON.parse(playerData.body)

    return {
      name: data.name,
      id: data.id,
      url: `https://www.beatleader.xyz/u/${data.id}`,
      avatar: data.avatar,
      pp: data.pp,
      rank: data.rank,
      country: data.country,
      countryRank: data.countryRank,
    }
  } catch (error) {
    console.error(`Failed to get player info ${playerId}`, error)

    return false
  }
}

async function getPlayerScoreMap(
  playerId: string,
  hash: string,
  difficulty: string,
  gamemode: string,
) {
  const getScore = await fetch({
    url: `https://api.beatleader.xyz/player/${playerId}/scorevalue/${hash}/${difficulty}/${gamemode}`,
    method: "GET",
    parse: "string",
  })

  if (getScore.statusCode !== 200) {
    return false
  }

  const data = JSON.parse(getScore.body)

  return data.score
}

async function getPlayerScores(beatLeaderId: string) {
  const scores = []

  let nextPage = null

  do {
    const data: any = await fetch({
      url: `https://api.beatleader.xyz/player/${beatLeaderId}/scores?sortBy=date&order=desc&count=100&page=${
        nextPage ?? 1
      }`,
      method: "GET",
      parse: "json",
    })
    const playerScores = data.body.data
    const { metadata } = data.body

    for (const playerScore of playerScores) {
      scores.push({
        songName: playerScore.leaderboard.song.name,
        songHash: playerScore.leaderboard.song.hash,
        score: playerScore.modifiedScore,
        difficulty: playerScore.leaderboard.difficulty.difficultyName,
      })
    }

    nextPage =
      metadata.page + 1 <= Math.ceil(metadata.total / metadata.itemsPerPage)
        ? metadata.page + 1
        : null
  } while (nextPage)

  return scores
}

export default {
  getPlayerInfo,
  getPlayerScoreMap,
  getPlayerScores,
}
