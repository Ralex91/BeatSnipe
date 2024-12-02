import playlist from "@/api/routes/playlist"
import { rateLimit } from "@/controllers/ratelimit"
import { Router } from "express"

// Api Page router
// eslint-disable-next-line new-cap
export const apiRouter = Router()

/* Playlist */
apiRouter
  .route("/playlist/:leaderboard/:snipeId")
  .get(rateLimit(120000, 5), playlist)
