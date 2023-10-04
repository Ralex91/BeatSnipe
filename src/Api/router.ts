import { Router } from 'express'
import { rateLimit } from '../Controllers/ratelimit'
import playlist from './Routes/playlist'

// Api Page router
export const apiRouter = Router()

/* Playlist */
apiRouter.route('/playlist/:leaderboard/:snipeId').get(rateLimit(120000, 5), playlist)