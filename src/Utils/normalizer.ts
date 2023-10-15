async function ScoreSaber({ leaderboard, score }: any) {
    let acc: any = leaderboard.maxScore > 0 ? score.modifiedScore / leaderboard.maxScore * 100 : 0

    return {
        hash: leaderboard.songHash,
        name: leaderboard.songName,
        difficulty: leaderboard.difficulty.difficultyRaw.split("_")[1],
        gamemode: leaderboard.difficulty.gameMode.replace('Solo', ''),
        accuracy: parseFloat(acc.toFixed(2)),
        baseScore: score.modifiedScore,
        playerId: score.leaderboardPlayerInfo.id,
        playerName: score.leaderboardPlayerInfo.name
    }
}

function BeatLeader({ leaderboard, player, accuracy, modifiedScore }: any) {
    let acc: number = accuracy * 100

    return {
        hash: leaderboard.song.hash,
        name: leaderboard.song.name,
        difficulty: leaderboard.song.difficulties[0].difficultyName,
        gamemode: leaderboard.song.difficulties[0].modeName,
        accuracy: parseFloat(acc.toFixed(2)),
        baseScore: modifiedScore,
        playerId: player.id,
        playerName: player.name
    }
}

export default {
    ScoreSaber,
    BeatLeader
}