import { Request, Response, } from 'express'
import playlistMaker from '../../Utils/playlist'

const leaderboardList = [
    "scoresaber",
    "beatleader"
]

export default async (req: Request, res: Response) => {
    if (!leaderboardList.includes(req.params.leaderboard)) {
        return { code: 404, message: "Playlist not found" }
    }

    let playlist = await playlistMaker(req.params.leaderboard, req.params.snipeId)
    res.json(playlist)
}