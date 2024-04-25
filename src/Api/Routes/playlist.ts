import { Request, Response } from "express"
import playlistMaker from "../../Utils/playlist"

const leaderboardList = ["scoresaber", "beatleader"]

export default async function playlist(req: Request, res: Response) {
  const userAgent = req.headers["user-agent"]

  if (!userAgent) {
    return res.status(401).json({ code: 401, message: "Unauthorized" })
  }

  if (!userAgent.includes("PlaylistManager")) {
    return res.status(401).json({ code: 401, message: "Unauthorized" })
  }

  if (!leaderboardList.includes(req.params.leaderboard)) {
    return res.status(404).json({ code: 404, message: "Playlist not found" })
  }

  const playlistData = await playlistMaker(
    req.params.leaderboard,
    req.params.snipeId,
  )

  return res.json(playlistData)
}
