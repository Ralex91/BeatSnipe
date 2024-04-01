import { PrismaClient } from "@prisma/client"
import { PlayerInfo } from "src/Types/player"
import { Playlist } from "src/Types/playlist"
import beatleader from "../Controllers/beatleader"
import scoresaber from "../Controllers/scoresaber"
import cover from "./cover"

const prisma = new PrismaClient()

export default async function playlistMaker(
  leaderboard: string,
  snippeId: string,
) {
  const snipeInfo = await prisma.snipe.findFirst({
    where: {
      id: snippeId,
    },
    select: {
      id: true,
      playerId: true,
      leaderboard: true,
      scores: {
        where: {
          leaderboard,
        },
      },
    },
  })

  if (!snipeInfo) {
    return { code: 404, message: "Playlist not found" }
  }

  if (!snipeInfo.leaderboard.split(",").includes(leaderboard)) {
    return { code: 404, message: "Leaderboard not found" }
  }

  let playerInfo: PlayerInfo | false = false

  if (leaderboard === "scoresaber") {
    playerInfo = await scoresaber.getPlayerInfo(snipeInfo.playerId)
  } else if (leaderboard === "beatleader") {
    playerInfo = await beatleader.getPlayerInfo(snipeInfo.playerId)
  }

  if (!playerInfo) {
    return { code: 404, message: "Player not found" }
  }

  const playlistCover = await cover(playerInfo.avatar, leaderboard)
  const playlistBase: Playlist = {
    AllowDuplicates: false,
    playlistTitle: `Snippe playlist ${leaderboard} of ${playerInfo.name}`,
    playlistAuthor: "BeatSnipe",
    customData: {
      syncURL: `https://beatsnipe.ralex.app/api/playlist/${leaderboard}/${snipeInfo.id}`,
    },
    songs: [],
    image: `base64,${playlistCover}`,
  }
  const hashes: string[] = []
  snipeInfo.scores.reverse().forEach((map) => {
    const index = hashes.indexOf(map.hash)

    if (index < 0) {
      hashes.push(map.hash)
      const song = {
        hash: map.hash,
        songName: map.name,
        difficulties: [
          {
            characteristic: map.gamemode,
            name: map.difficulty,
          },
        ],
      }

      playlistBase.songs.push(song)
    } else {
      const song = playlistBase.songs[index]
      const difficulty = {
        characteristic: map.gamemode,
        name: map.difficulty,
      }

      song.difficulties.push(difficulty)
    }
  })

  return playlistBase
}
