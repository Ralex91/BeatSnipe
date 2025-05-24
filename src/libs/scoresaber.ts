import ky from "ky"

const SSDifficultyId: { [code: string]: number } = {
  Easy: 1,
  Normal: 3,
  Hard: 5,
  Expert: 7,
  ExpertPlus: 9,
}
const SSDifficultyString: { [code: number]: string } = Object.fromEntries(
  Object.entries(SSDifficultyId).map((a) => a.reverse()),
)

async function getPlayerInfo(playerId: string) {
  const playerData: any = await ky.get(
    `https://scoresaber.com/api/player/${playerId}/basic/`,
  )

  if (playerData.status !== 200) {
    return false
  }

  const data = await playerData.json()

  return {
    name: data.name,
    id: data.id,
    url: `https://scoresaber.com/u/${data.id}`,
    avatar: data.profilePicture,
    pp: data.pp,
    rank: data.rank,
    country: data.country,
    countryRank: data.countryRank,
  }
}

async function getPlayerScoreMap(
  playerName: string,
  hash: string,
  difficulty: string,
  gamemode: string,
) {
  const getScore: any = await ky.get(
    `https://scoresaber.com/api/leaderboard/by-hash/${hash}/scores`,
    {
      searchParams: {
        difficulty: SSDifficultyId[difficulty],
        search: playerName,
        gameMode: `Solo${gamemode}`,
      },
    },
  )

  if (getScore.status !== 200) {
    return false
  }

  const data = await getScore.json()

  return data.scores[0].modifiedScore
}

async function getPlayerScores(scoreSaberId: string) {
  const scores = []
  let nextPage = null

  do {
    const rawPlayerScores: any = await ky.get(
      `https://scoresaber.com/api/player/${scoreSaberId}/scores`,
      {
        searchParams: {
          sort: "recent",
          limit: 100,
          page: nextPage ?? 1,
        },
      },
    )

    if (rawPlayerScores.status !== 200) {
      return false
    }

    const { metadata, playerScores } = await rawPlayerScores.json()

    for (const playerScore of playerScores) {
      scores.push({
        songName: playerScore.leaderboard.songName,
        score: playerScore.score.modifiedScore,
        songHash: playerScore.leaderboard.songHash,
        difficulty:
          SSDifficultyString[playerScore.leaderboard.difficulty.difficulty],
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
