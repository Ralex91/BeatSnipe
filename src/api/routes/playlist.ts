import playlistMaker from "@/utils/playlist"
import { Request, Response } from "express"

const leaderboardList = ["scoresaber", "beatleader"]

export default async function playlist(req: Request, res: Response) {
  if (!leaderboardList.includes(req.params.leaderboard)) {
    return res.status(404).json({ code: 404, message: "Playlist not found" })
  }

  const playlistData = await playlistMaker(
    req.params.leaderboard,
    req.params.snipeId,
  )

  return res.json(playlistData)
}
