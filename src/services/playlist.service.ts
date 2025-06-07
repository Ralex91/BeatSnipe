import { PlayerInfo } from "@/types/player"
import { Playlist } from "@/types/playlist"
import { Snipe } from "@/types/snipe"
import { fetch } from "@/utils/fetch"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import packageJson from "@package"
import { Score } from "@prisma/client"
import path from "path"

export class PlaylistService {
  private leaderboard: string

  constructor(leaderboard: string) {
    this.leaderboard = leaderboard
  }

  private async getCoverImage(avatarURL: string): Promise<string> {
    const canvas = createCanvas(100, 100)
    const ctx = canvas.getContext("2d")

    const avatarBuf = await fetch.get(avatarURL).arrayBuffer()
    const avatar = await loadImage(avatarBuf)
    const scope = await loadImage(path.join(__dirname, "../assets/scope.png"))
    const leaderboardIcon = await loadImage(
      path.join(__dirname, `../assets/${this.leaderboard}.png`),
    )

    ctx.shadowColor = "#212121"
    ctx.shadowBlur = 4

    ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height)
    ctx.drawImage(scope, 0, 0, canvas.width, canvas.height)
    ctx.drawImage(
      leaderboardIcon,
      canvas.width / 2 - 12.5,
      canvas.height / 2 - 12.5,
      25,
      25,
    )

    ctx.shadowBlur = 0
    ctx.strokeStyle = "#ff0000"
    ctx.lineWidth = 10
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    const pngData = await canvas.encode("png")

    return pngData.toString("base64")
  }

  public async create(
    snipe: Snipe,
    scores: Score[],
    player: PlayerInfo,
  ): Promise<Playlist> {
    const imageBase64 = await this.getCoverImage(player.avatar)

    const playlist: Playlist = {
      playlistTitle: `Snippe playlist ${this.leaderboard} of ${player.name}`,
      playlistAuthor: `BeatSnipe v${packageJson.version}`,
      AllowDuplicates: false,
      customData: {
        syncURL: `${process.env.PUBLIC_URL}/api/playlist/${this.leaderboard}/${snipe.id}`,
      },
      songs: [],
      image: `base64,${imageBase64}`,
    }

    const hashes: string[] = []

    scores.reverse().forEach((map) => {
      const index = hashes.indexOf(map.hash)

      if (index < 0) {
        hashes.push(map.hash)
        playlist.songs.push({
          hash: map.hash,
          songName: map.name,
          difficulties: [
            {
              characteristic: map.gamemode,
              name: map.difficulty,
            },
          ],
        })
      } else {
        playlist.songs[index].difficulties.push({
          characteristic: map.gamemode,
          name: map.difficulty,
        })
      }
    })

    return playlist
  }
}
