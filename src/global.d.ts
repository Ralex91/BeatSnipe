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
}

export { };