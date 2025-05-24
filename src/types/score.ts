export type AddScores = {
  name: string
  playerId: string
  snipeId: string
  hash: string
  leaderboard: string
  score: number
  difficulty: string
  gamemode: string
}

export type GetScoreParams = {
  playerId: string
  snipeId: string
  hash: string
  leaderboard: string
  difficulty: string
  gamemode: string
}

export type GetPlayerScoresLeaderboard = {
  playerId: string
  hash: string
  leaderboard: string
  difficulty: string
  gamemode: string
}
