import { createCanvas, loadImage } from "canvas"
import fetch from "phin"
import path from "path"

const bufferImage = async (url: string) => {
    const { body } = await fetch(url)
    const imageBuffer = Buffer.from(body)
    return imageBuffer
}

export default async function (avatarURL: string, leaderboard: string) {
    const cv = createCanvas(200, 200)
    const ct = cv.getContext('2d')

    let avatarBuf = await bufferImage(avatarURL)
    let avatar = await loadImage(avatarBuf)

    let scope = await loadImage(path.join(__dirname, "../assets/scope.png"))
    let leaderboardIcon = await loadImage(path.join(__dirname, `../assets/${leaderboard}.png`))
    ct.shadowColor = "#212121"
    ct.shadowBlur = 4

    ct.drawImage(avatar, 0, 0, cv.width, cv.height)
    ct.drawImage(scope, 0, 0, cv.width, cv.height)
    ct.drawImage(leaderboardIcon, cv.width / 2 - 25, cv.height / 2 - 25, 50, 50)

    ct.shadowBlur = 0
    ct.strokeStyle = "#ff0000"
    ct.lineWidth = 20
    ct.strokeRect(0, 0, cv.width, cv.height)

    return <string>cv.toDataURL().split(';base64,').pop()
}