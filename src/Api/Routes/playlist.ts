import { Request, Response } from "express"
import playlistMaker from "../../Utils/playlist"

const leaderboardList = ["scoresaber", "beatleader"]

export default async function playlist(req: Request, res: Response) {
  const userAgent = req.headers["user-agent"]

  if (!userAgent) {
    return res.json({ code: 401, message: "Unauthorized" })
  }

  if (userAgent.includes("PlaylistManager")) {
    return res.json({ code: 401, message: "Unauthorized" })
  }

  if (!leaderboardList.includes(req.params.leaderboard)) {
    return res.json({ code: 404, message: "Playlist not found" })
  }

  const playlistData = await playlistMaker(
    req.params.leaderboard,
    req.params.snipeId,
  )

  return res.json(playlistData)
}
