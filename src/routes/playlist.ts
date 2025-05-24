import playlistMaker from "@/utils/playlist"
import { Context, Hono } from "hono"

const leaderboardList = ["scoresaber", "beatleader"]

const router = new Hono()

router.get("/:leaderboard/:snipeId", async (c: Context) => {
  const { leaderboard, snipeId } = c.req.param()

  if (!leaderboardList.includes(leaderboard)) {
    return c.json({ code: 404, message: "Playlist not found" }, 404)
  }

  const playlistData = await playlistMaker(leaderboard, snipeId)

  return c.json(playlistData)
})

export default router
