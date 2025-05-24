import { createCanvas, loadImage } from "@napi-rs/canvas"
import ky from "ky"
import path from "path"

const bufferImage = async (url: string) => await ky.get(url).arrayBuffer()

export default async function cover(avatarURL: string, leaderboard: string) {
  const cv = createCanvas(100, 100)
  const ct = cv.getContext("2d")
  const avatarBuf = await bufferImage(avatarURL)
  const avatar = await loadImage(avatarBuf)
  const scope = await loadImage(path.join(__dirname, "../assets/scope.png"))
  const leaderboardIcon = await loadImage(
    path.join(__dirname, `../assets/${leaderboard}.png`),
  )
  ct.shadowColor = "#212121"
  ct.shadowBlur = 4

  ct.drawImage(avatar, 0, 0, cv.width, cv.height)
  ct.drawImage(scope, 0, 0, cv.width, cv.height)
  ct.drawImage(
    leaderboardIcon,
    cv.width / 2 - 12.5,
    cv.height / 2 - 12.5,
    25,
    25,
  )

  ct.shadowBlur = 0
  ct.strokeStyle = "#ff0000"
  ct.lineWidth = 10
  ct.strokeRect(0, 0, cv.width, cv.height)

  const pngData = await cv.encode("png")

  return <string>pngData.toString("base64")
}
