import wait from "@/libs/wait"
import {
  GetPlayerInfoSS,
  GetPlayerScoreMapSS,
  GetPlayerScoresSS,
} from "@/types/scoresaber"
import { fetch } from "@/utils/fetch"

export class ScoreSaberService {
  private static readonly DifficultyId: { [code: string]: number } = {
    Easy: 1,
    Normal: 3,
    Hard: 5,
    Expert: 7,
    ExpertPlus: 9,
  }

  private static readonly Difficulty: { [code: number]: string } =
    Object.fromEntries(
      Object.entries(this.DifficultyId).map((a) => a.reverse()),
    )

  static async getPlayerInfo(playerId: string) {
    const response = await fetch.get<GetPlayerInfoSS>(
      `https://scoresaber.com/api/player/${playerId}/basic/`,
    )

    if (response.status !== 200) {
      return null
    }

    const data = await response.json()

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

  static async getPlayerScoreMap(
    playerName: string,
    hash: string,
    difficulty: string,
    gamemode: string,
  ) {
    const response = await fetch.get<GetPlayerScoreMapSS>(
      `https://scoresaber.com/api/leaderboard/by-hash/${hash}/scores`,
      {
        searchParams: {
          difficulty: this.DifficultyId[difficulty],
          search: playerName,
          gameMode: `Solo${gamemode}`,
        },
      },
    )

    if (response.status !== 200) {
      return null
    }

    const data = await response.json()

    return data.scores[0].modifiedScore
  }

  static async getPlayerScores(scoreSaberId: string) {
    const scores = []
    let nextPage = null
    let retryDelay = 1000

    do {
      try {
        const response = await fetch.get<GetPlayerScoresSS>(
          `https://scoresaber.com/api/player/${scoreSaberId}/scores`,
          {
            searchParams: {
              sort: "recent",
              limit: 100,
              page: nextPage ?? 1,
            },
          },
        )

        if (response.status === 429) {
          console.log(`Rate limited, waiting ${retryDelay}ms...`)
          await wait(retryDelay)
          retryDelay = Math.min(retryDelay * 2, 30000)

          continue
        }

        if (response.status !== 200) {
          return null
        }

        retryDelay = 1000
        const data: GetPlayerScoresSS = await response.json()
        const { playerScores, metadata } = data

        for (const playerScore of playerScores) {
          scores.push({
            songName: playerScore.leaderboard.songName,
            score: playerScore.score.modifiedScore,
            songHash: playerScore.leaderboard.songHash,
            difficulty:
              this.Difficulty[playerScore.leaderboard.difficulty.difficulty],
          })
        }

        nextPage =
          metadata.page + 1 <= Math.ceil(metadata.total / metadata.itemsPerPage)
            ? metadata.page + 1
            : null
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.log(`Rate limited (exception), waiting ${retryDelay}ms...`)
          await wait(retryDelay)
          retryDelay = Math.min(retryDelay * 2, 30000)

          continue
        }

        console.error("Error while fetching scores:", error)

        return null
      }
    } while (nextPage)

    return scores
  }
}
