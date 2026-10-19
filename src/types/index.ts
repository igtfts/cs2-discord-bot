export interface PlayerMapping {
  discordName: string
  steamId: string
}

export interface PlayerStats {
  discordName: string
  personaName: string
  profileUrl: string
  avatar: string
  playtimeHours: number | null
}

export interface SteamPlayerSummary {
  personaname: string
  profileurl: string
  avatarfull: string
}

export interface SteamSummaryResponse {
  response?: {
    players?: SteamPlayerSummary[]
  }
}

export interface SteamGame {
  appid: number
  playtime_forever: number
}

export interface SteamGamesResponse {
  response?: {
    games?: SteamGame[]
  }
}
