import scoreUtils from "../Utils/score"

async function ScoreSaber({ leaderboard, score }) {
    let hash: string = leaderboard.songHash

    let name: string = leaderboard.songName
    let difficulty: string = leaderboard.difficulty.difficultyRaw.split("_")[1]
    let gamemode = leaderboard.difficulty.gameMode.replace('Solo', '')
    let acc: any = leaderboard.maxScore > 0 ? score.modifiedScore / leaderboard.maxScore * 100 : 0//await scoreUtils.calcAcc(hash, difficulty, gamemode, score.modifiedScore)
    let baseScore: number = score.modifiedScore

    let playerId: string = score.leaderboardPlayerInfo.id
    let playerName: string = score.leaderboardPlayerInfo.name

    return [hash, name, difficulty, gamemode, parseFloat(acc.toFixed(2)), baseScore, playerId, playerName]
}

function BeatLeader({ leaderboard, player, accuracy, modifiedScore }) {
    let hash: string = leaderboard.song.hash

    let name: string = leaderboard.song.name
    let difficulty: string = leaderboard.song.difficulties[0].difficultyName
    let gamemode = leaderboard.song.difficulties[0].modeName
    let acc: GLfloat = accuracy * 100

    let playerId: string = player.id
    let playerName: string = player.name

    return [hash, name, difficulty, gamemode, parseFloat(acc.toFixed(2)), modifiedScore, playerId, playerName]
}

export default {
    ScoreSaber,
    BeatLeader
}