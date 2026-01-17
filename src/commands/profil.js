import { ensureUser } from '../services/xp.js'
import { supabase } from '../db/supabase.js'
import { getRankByXp, xpToNextRank } from '../services/ranks.js'
import { getUserBadges } from '../services/badges.js'

export async function cmdProfil(sock, msg) {
  const groupJid = msg.key.remoteJid
  const jid = msg.senderJid
  await ensureUser(jid)
  const { data: user } = await supabase.from('users').select('*').eq('jid', jid).single()
  const { data: stats } = await supabase.from('user_stats').select('*').eq('jid', jid).single()
  const rankInfo = getRankByXp(Number(user.xp))
  const left = xpToNextRank(Number(user.xp))
  const badges = await getUserBadges(jid)
    const badgeLine = badges.length
      ? `\n🎖️ *Badges* : ${badges.map(b => `「${b.label}」`).join(' ')}`
      : ''

  const text =
  `╭━━━[ 👤 *PROFIL MANGA* ]━━━╮
  ┃ 🆔 : @${jid.split('@')[0]}
  ┃ 🏅 Rang : *${rankInfo.rank.name}*
  ┃ ✨ XP : *${user.xp}*
  ┃ ➡️ Prochain rang : ${rankInfo.next?.name ?? 'MAX'}
  ┃ 📌 XP restant : ${rankInfo.next ? left : 0}
  ${badgeLine ? '┃' + badgeLine : ''}
  ┃
  ┃ 🎯 *Quiz*
  ┃   ✅ Victoires : ${stats?.quiz_win ?? 0}
  ┃   ❌ Défaites : ${stats?.quiz_lose ?? 0}
  ┃   🔥 Streak : ${stats?.streak ?? 0} (best: ${stats?.best_streak ?? 0})
  ╰━━━━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(groupJid, { text, mentions: [jid] })
}
