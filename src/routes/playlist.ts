import { LEADERBOARD } from "@/utils/contantes"
import playlistMaker from "@/utils/playlist"
import { Context, Hono } from "hono"
import { rateLimiter } from "hono-rate-limiter"

const router = new Hono()

router.get(
  "/:leaderboard/:snipeId",
  rateLimiter({
    windowMs: 120 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    keyGenerator: (c) => c.req.param("snipeId"),
    handler: (c) => c.json({ code: 429, message: "Rate limit exceeded" }, 429),
  }),
  async (c: Context) => {
    const { leaderboard, snipeId } = c.req.param()

    if (!Object.values(LEADERBOARD).includes(leaderboard)) {
      return c.json({ code: 404, message: "Playlist not found" }, 404)
    }

    const playlistData = await playlistMaker(leaderboard, snipeId)

    return c.json(playlistData)
  },
)

export default router
