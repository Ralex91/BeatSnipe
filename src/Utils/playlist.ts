import fetch from "phin"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

interface song {
    hash: number
    difficulty: string
    gamemode: string
}

// Playlist structure

export default async function (leaderboard: string, snippeId: string) {

    let snipeInfo = await prisma.snipe.findFirst({
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

    let leaderboards = snipeInfo.leaderboard.split(",")
    let playerInfo: any

    if (leaderboards.includes("scoresaber")) {
        let getplayerInfo: any = await fetch({
            url: `https://scoresaber.com/api/player/${snipeInfo.playerId}/basic/`,
            method: "GET",
            parse: "json"
        })

        playerInfo = {
            name: getplayerInfo.body.name,
            avatar: getplayerInfo.body.profilePicture
        }

    }

    if (leaderboards.includes("beatleader")) {
        let getplayerInfo: any = await fetch({
            url: `https://api.beatleader.xyz/player/${snipeInfo.playerId}?stats=false&keepOriginalId=false`,
            method: "GET",
            parse: "json"
        })

        playerInfo = {
            name: getplayerInfo.body.name,
            avatar: getplayerInfo.body.avatar
        }
    }

    let playerImage = await fetch({
        url: playerInfo.avatar,
        method: "GET",
    })

    let playlist: any = {
        "AllowDuplicates": false,
        "playlistTitle": `Snippe playlist ${leaderboard} of ${playerInfo.name}`,
        "playlistAuthor": "Score Snipper",
        "customData": {
            "syncURL": `https://beatsnipe.ralex.app/api/playlist/${leaderboard}/${snipeInfo.id}`
        },
        "songs": [],
        "image": `base64,${Buffer.from(playerImage.body).toString('base64')}`
    }

    const hashes = []
    snipeInfo.scores.forEach(map => {

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