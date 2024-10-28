import playlist from "@/Api/Routes/playlist"
import { rateLimit } from "@/Controllers/ratelimit"
import { Router } from "express"

// Api Page router
// eslint-disable-next-line new-cap
export const apiRouter = Router()

/* Playlist */
apiRouter
  .route("/playlist/:leaderboard/:snipeId")
  .get(rateLimit(120000, 5), playlist)
