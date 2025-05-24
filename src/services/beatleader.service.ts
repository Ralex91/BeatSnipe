import wait from "@/libs/wait"
import ky from "ky"

export class BeatLeaderService {
  static async getPlayerInfo(playerId: string) {
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

  static async getPlayerScoreMap(
    playerId: string,
    hash: string,
    difficulty: string,
    gamemode: string,
  ) {
    let retryDelay = 1000

    while (true) {
      try {
        const getScore: any = await ky.get(
          `https://api.beatleader.xyz/player/${playerId}/scorevalue/${hash}/${difficulty}/${gamemode}`,
        )

        if (getScore.status === 429) {
          console.log(`Rate limited, waiting ${retryDelay}ms...`)
          await wait(retryDelay)
          retryDelay = Math.min(retryDelay * 2, 30000)

          continue
        }

        if (getScore.status !== 200) {
          return false
        }

        const data = await getScore.json()

        return data.score
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.log(`Rate limited (exception), waiting ${retryDelay}ms...`)
          await wait(retryDelay)
          retryDelay = Math.min(retryDelay * 2, 30000)

          continue
        }

        console.error("Error while fetching score:", error)

        return false
      }
    }
  }

  static async getPlayerScores(beatLeaderId: string) {
    const scores = []
    let nextPage = null
    let retryDelay = 1000

    do {
      try {
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

        if (data.status === 429) {
          console.log(`Rate limited, waiting ${retryDelay}ms...`)
          await wait(retryDelay)
          retryDelay = Math.min(retryDelay * 2, 30000)

          continue
        }

        if (data.status !== 200) {
          return false
        }

        retryDelay = 1000

        const { metadata, data: playerScores } = await data.json()
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
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.log(`Rate limited (exception), waiting ${retryDelay}ms...`)
          await wait(retryDelay)
          retryDelay = Math.min(retryDelay * 2, 30000)

          continue
        }

        console.error("Error while fetching scores:", error)

        return false
      }
    } while (nextPage)

    return scores
  }
}
