import fetch from "phin"
import { PrismaClient } from '@prisma/client'
import Scoresaber from "../Controllers/scoresaber"
import Beatleader from "../Controllers/beatleader"
import Cover from "./cover"

const prisma = new PrismaClient();

export default async function (leaderboard: string, snippeId: string) {

    const snipeInfo = await prisma.snipe.findFirst({
        where: {
            id: snippeId,
        },
        select: {
            id: true,
            playerId: true,
            leaderboard: true,
            scores: {
                where: {
                    leaderboard: leaderboard
                }
            }
        }
    })

    if (!snipeInfo) return { code: 404, message: "Playlist not found" }

    const leaderboards = snipeInfo.leaderboard.split(",")
    let playerInfo: any

    if (leaderboards.includes("scoresaber")) {
        playerInfo = await Scoresaber.getplayerInfo(snipeInfo.playerId)
    }

    if (leaderboards.includes("beatleader")) {
        playerInfo = await Beatleader.getplayerInfo(snipeInfo.playerId)
    }

    if (!playerInfo) return { code: 404, message: "Player not found" }

    const playlistCover = await Cover(playerInfo.avatar, leaderboard)

    const playlist: playlist = {
        "AllowDuplicates": false,
        "playlistTitle": `Snippe playlist ${leaderboard} of ${playerInfo.name}`,
        "playlistAuthor": "BeatSnipe",
        "customData": {
            "syncURL": `https://beatsnipe.ralex.app/api/playlist/${leaderboard}/${snipeInfo.id}`
        },
        "songs": [],
        "image": `base64,${playlistCover}`
    }

    const hashes = []
    snipeInfo.scores.reverse().forEach(map => {

        const index = hashes.indexOf(map.hash)
        if (index < 0) {
            hashes.push(map.hash)
            const song = {
                hash: map.hash,
                songName: map.name,
                difficulties: [
                    {
                        characteristic: map.gamemode,
                        name: map.difficulty
                    }
                ]
            }

            playlist.songs.push(song)
        } else {
            const song = playlist.songs[index]
            const difficulty = {
                characteristic: map.gamemode,
                name: map.difficulty
            }

            song.difficulties.push(difficulty)
        }
    })

    return playlist
}