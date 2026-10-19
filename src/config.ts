import dotenv from 'dotenv'
import type {PlayerMapping} from './types/index.js'

dotenv.config()

export const TOKEN = process.env.DISCORD_TOKEN
export const STEAM_API_KEY = process.env.STEAM_API_KEY
export const CHANNEL_ID = process.env.CHANNEL_ID

if (!TOKEN || !STEAM_API_KEY || !CHANNEL_ID) {
  console.error(
    '❌ Error: Please fill in all required variables in the .env file!',
  )
  process.exit(1)
}

// List of players mapping Discord names to their SteamID64
export const PLAYERS: PlayerMapping[] = [
  {discordName: 'ИгрокОдин', steamId: '76561198000000001'},
  {discordName: 'ИгрокДва', steamId: '76561198000000002'},
]
