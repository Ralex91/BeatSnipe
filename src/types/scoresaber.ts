export type GetPlayerInfoSS = {
  name: string
  id: string
  profilePicture: string
  pp: number
  rank: number
  country: string
  countryRank: number
}

export type GetPlayerScoreMapSS = {
  scores: {
    modifiedScore: number
  }[]
}

export type GetPlayerScoresSS = {
  playerScores: {
    leaderboard: {
      songHash: string
      songName: string
      difficulty: {
        difficultyRaw: string
        gameMode: string
        difficulty: number
      }
    }
    score: {
      modifiedScore: number
    }
  }[]
  metadata: {
    page: number
    itemsPerPage: number
    total: number
  }
}
