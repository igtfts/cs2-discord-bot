import {Client, GatewayIntentBits, EmbedBuilder} from 'discord.js'
import type {TextChannel} from 'discord.js'
import cron from 'node-cron'
import {TOKEN, STEAM_API_KEY, CHANNEL_ID, PLAYERS} from './config.js'
import {getSteamStats} from './services/steamService.js'
import type {PlayerStats} from './types/index.js'

// Initialize Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ] as const,
})

/**
 * Generate and send the CS 2 leaderboard embed to the designated Discord channel
 */
export async function sendLeaderboard(): Promise<void> {
  const channel = (await client.channels.fetch(
    CHANNEL_ID,
  )) as TextChannel | null
  if (!channel) {
    console.error(
      '❌ Failed to find the target channel for sending statistics!',
    )
    return
  }

  const leaderboardData: PlayerStats[] = []

  for (const p of PLAYERS) {
    const stats = await getSteamStats(p.steamId, STEAM_API_KEY)
    if (stats) {
      leaderboardData.push({
        discordName: p.discordName,
        personaName: stats.personaName ?? p.discordName,
        profileUrl: stats.profileUrl ?? '#',
        avatar: stats.avatar ?? '',
        playtimeHours: stats.playtimeHours ?? 0,
      })
    }
  }

  // Sort players descending by total CS 2 playtime hours
  leaderboardData.sort(
    (a, b) => (b.playtimeHours ?? 0) - (a.playtimeHours ?? 0),
  )

  // Build the rich embed message in Russian
  const embed = new EmbedBuilder()
    .setTitle('🏆 Таблица лидеров CS 2 (Steam Stats)')
    .setDescription('Актуальная игровая активность участников сервера:')
    .setColor(0x00ae86)
    .setTimestamp()

  leaderboardData.forEach((player, index) => {
    const medals = ['🥇', '🥈', '🥉']
    const place = medals[index] ?? `${index + 1}.`

    embed.addFields({
      name: `${place} ${player.discordName} (${player.personaName})`,
      value: `⏱ Часов в CS 2: **${player.playtimeHours} ч.**\n🔗 [Профиль Steam](${player.profileUrl})`,
      inline: false,
    })
  })

  await channel.send({embeds: [embed]})
  console.log('✅ Leaderboard successfully sent to Discord!')
}

client.once('ready', () => {
  console.log(`🤖 Bot ${client.user?.tag} is online and ready!`)

  // Schedule task using node-cron (Runs every day at 12:00 PM)
  cron.schedule('0 12 * * *', () => {
    console.log('⏳ Triggering scheduled leaderboard update...')
    void sendLeaderboard()
  })
})

// Handle manual command triggers via chat messages
client.on('messageCreate', async message => {
  if (message.author.bot) return

  if (message.content === '!leaderboard') {
    if (message.channelId !== CHANNEL_ID) {
      await message.reply(
        'Эту команду можно использовать только в специализированном канале статистики!',
      )
      return
    }
    await message.reply('⏳ Собираю актуальные данные из Steam...')
    await sendLeaderboard()
  }
})

void client.login(TOKEN)
