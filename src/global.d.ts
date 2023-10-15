import comparator from "./Controllers/comparator"

declare global {
    interface playerScore {
        songName: string
        songHash: string
        difficulty: string
        score: number
    }

    interface playerInfo {
        name: string
        id: string
        avatar: string
        pp: number
        rank: number
        country: string
        countryRank: number
    }

    interface playlist {
        AllowDuplicates: boolean
        playlistTitle: string
        playlistAuthor: string
        customData: {
            syncURL: string
        }
        songs: {
            hash: string
            songName: string
            difficulties: {
                characteristic: string
                name: string
            }[]
        }[]
        image: string
    }

    interface comparator {
        hash: string
        name: string
        difficulty: string
        gamemode: string
        accuracy: number
        baseScore: number
        playerId: string
        playerName: string
    }
}

export { };