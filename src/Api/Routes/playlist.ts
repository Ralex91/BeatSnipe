import { Request, Response, } from 'express'
import playlistMaker from '../../Utils/playlist'

const leaderboardList = [
    "scoresaber",
    "beatleader"
]

export default async (req: Request, res: Response) => {
    let userAgent = req.headers['user-agent']

    if (!userAgent) {
        return res.json({ code: 401, message: "Unauthorized" })
    }

    if (!userAgent && !userAgent.includes("PlaylistManager")) {
        return res.json({ code: 401, message: "Unauthorized" })
    }

    if (!leaderboardList.includes(req.params.leaderboard)) {
        return res.json({ code: 404, message: "Playlist not found" })
    }

    let playlist = await playlistMaker(req.params.leaderboard, req.params.snipeId)
    res.json(playlist)
}