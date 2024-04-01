function scoreSaber({ leaderboard, score }: any) {
  const acc: number =
    leaderboard.maxScore > 0
      ? (score.modifiedScore / leaderboard.maxScore) * 100
      : 0

  return {
    hash: leaderboard.songHash,
    name: leaderboard.songName,
    difficulty: leaderboard.difficulty.difficultyRaw.split("_")[1],
    gamemode: leaderboard.difficulty.gameMode.replace("Solo", ""),
    accuracy: parseFloat(acc.toFixed(2)),
    baseScore: score.modifiedScore,
    playerId: score.leaderboardPlayerInfo.id,
    playerName: score.leaderboardPlayerInfo.name,
  }
}

function beatLeader(response: any) {
  const { leaderboard, player, accuracy, modifiedScore } = response
  const acc: number = accuracy * 100

  return {
    hash: leaderboard.song.hash,
    name: leaderboard.song.name,
    difficulty: leaderboard.difficulty.difficultyName,
    gamemode: leaderboard.difficulty.modeName,
    accuracy: parseFloat(acc.toFixed(2)),
    baseScore: modifiedScore,
    playerId: player.id,
    playerName: player.name,
  }
}

export default {
  scoreSaber,
  beatLeader,
}
