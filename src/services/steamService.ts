import type {
  PlayerStats,
  SteamSummaryResponse,
  SteamGamesResponse,
} from '../types/index.js'

/**
 * Fetch player profile summary and CS 2 playtime from Steam Web API
 */
export async function getSteamStats(
  steamId: string,
  apiKey: string,
): Promise<Partial<PlayerStats> | null> {
  try {
    // 1. Fetch general user profile summary
    const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
    const summaryRes = await fetch(summaryUrl)

    if (!summaryRes.ok) {
      throw new Error(`HTTP error! status: ${summaryRes.status}`)
    }

    const summaryData = (await summaryRes.json()) as SteamSummaryResponse
    const players = summaryData.response?.players

    if (!players || players.length === 0) return null
    const player = players[0]
    if (!player) return null

    // 2. Fetch owned games and extract CS 2 playtime (AppID: 730)
    const gamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json`
    let playtimeHours = 0

    try {
      const gamesRes = await fetch(gamesUrl)
      if (gamesRes.ok) {
        const gamesData = (await gamesRes.json()) as SteamGamesResponse
        const games = gamesData.response?.games || []
        const cs2 = games.find(g => g.appid === 730)
        if (cs2) {
          playtimeHours = Math.round(cs2.playtime_forever / 60)
        }
      }
    } catch {
      // Games might be hidden due to Steam profile privacy settings
    }

    return {
      personaName: player.personaname,
      profileUrl: player.profileurl,
      avatar: player.avatarfull,
      playtimeHours: playtimeHours,
    }
  } catch (error) {
    console.error(`Error fetching Steam API data for ID ${steamId}:`, error)
    return null
  }
}
