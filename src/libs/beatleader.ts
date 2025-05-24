import ky from "ky"

async function getPlayerInfo(playerId: string) {
  try {
    const playerData: any = await ky.get(
      `https://api.beatleader.xyz/player/${playerId}`,
      {
        searchParams: {
          stats: false,
          keepOriginalId: false,
        },
      },
    )

    if (playerData.status !== 200) {
      return false
    }

    const data = await playerData.json()

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
  const getScore: any = await ky.get(
    `https://api.beatleader.xyz/player/${playerId}/scorevalue/${hash}/${difficulty}/${gamemode}`,
  )

  if (getScore.status !== 200) {
    return false
  }

  const data = await getScore.json()

  return data.score
}

async function getPlayerScores(beatLeaderId: string) {
  const scores = []

  let nextPage = null

  do {
    const data: any = await ky.get(
      `https://api.beatleader.xyz/player/${beatLeaderId}/scores`,
      {
        searchParams: {
          sortBy: "date",
          order: "desc",
          count: 100,
          page: nextPage ?? 1,
        },
      },
    )

    if (data.status !== 200) {
      return false
    }

    const { metadata, data: playerScores } = await data.json()

    for (const playerScore of playerScores) {
      scores.push({
        songName: playerScore.leaderboard.song.name,
        songHash: playerScore.leaderboard.song.hash.toUpperCase(),
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
