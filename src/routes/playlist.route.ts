import { PlaylistController } from "@/controllers/playlist.controller"
import { Hono } from "hono"
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
  PlaylistController.getPlaylist,
)

export default router
