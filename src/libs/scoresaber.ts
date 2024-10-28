import fetch from "phin"

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
  const playerData: any = await fetch({
    url: `https://scoresaber.com/api/player/${playerId}/basic/`,
    method: "GET",
    parse: "json",
  })

  if (playerData.statusCode !== 200) {
    return false
  }

  return {
    name: playerData.body.name,
    id: playerData.body.id,
    url: `https://scoresaber.com/u/${playerData.body.id}`,
    avatar: playerData.body.profilePicture,
    pp: playerData.body.pp,
    rank: playerData.body.rank,
    country: playerData.body.country,
    countryRank: playerData.body.countryRank,
  }
}

async function getPlayerScoreMap(
  playerName: string,
  hash: string,
  difficulty: string,
  gamemode: string,
) {
  const getScore: any = await fetch({
    url: `https://scoresaber.com/api/leaderboard/by-hash/${hash}/scores?difficulty=${SSDifficultyId[difficulty]}&search=${playerName}&gameMode=Solo${gamemode}`,
    method: "GET",
    parse: "json",
  })

  if (getScore.statusCode !== 200) {
    return false
  }

  return getScore.body.scores[0].modifiedScore
}

async function getPlayerScores(scoreSaberId: string) {
  const scores = []
  let nextPage = null

  do {
    const data: any = await fetch({
      url: `https://scoresaber.com/api/player/${scoreSaberId}/scores?sort=recent&limit=100&page=${
        nextPage ?? 1
      }`,
      method: "GET",
      parse: "json",
    })
    const { playerScores } = data.body
    const { metadata } = data.body

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
