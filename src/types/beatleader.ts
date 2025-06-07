export type GetPlayerInfoBL = {
  id: string
  name: string
  country: string
  avatar: string
  countryFlag: string
  pp: number
  rank: number
  countryRank: number
}

export type GetPlayerScoreMapBL = {
  score: number
}
export type GetPlayerScoresBL = {
  metadata: {
    page: number
    itemsPerPage: number
    total: number
  }
  data: {
    leaderboard: {
      song: {
        hash: string
        name: string
      }
      difficulty: {
        difficultyName: string
      }
      player: {
        id: string
        name: string
      }
    }
    modifiedScore: number
  }[]
}

export type SocketResponseBL = {
  player: {
    id: string
    name: string
  }
  accuracy: number
  leaderboard: {
    song: {
      hash: string
      name: string
    }
    difficulty: {
      difficultyName: string
      modeName: string
    }
  }
  modifiedScore: number
}
