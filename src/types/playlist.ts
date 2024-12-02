export type Playlist = {
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
