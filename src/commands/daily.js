import { supabase } from '../db/supabase.js'
import { ensureUser, addXp } from '../services/xp.js'

export async function cmdDaily(sock, msg) {
  const groupJid = msg.key.remoteJid
  const jid = msg.senderJid
  const DAILY_XP = 100
  const ONE_DAY = 24 * 60 * 60 * 1000
  // Feedback immédiat
  await sock.sendMessage(groupJid, { text: '🔎 Traitement du daily bonus en cours... ⏳' })
  await ensureUser(jid)
  const { data: stats } = await supabase.from('user_stats').select('*').eq('jid', jid).single()
  const last = stats?.last_daily ? new Date(stats.last_daily).getTime() : 0
  const now = Date.now()
  if (last && now - last < ONE_DAY) {
    const leftMs = ONE_DAY - (now - last)
    const leftH = Math.ceil(leftMs / (60 * 60 * 1000))
    return sock.sendMessage(groupJid, { text: `⏳ Daily déjà pris. Reviens dans ~${leftH}h.` })
  }
  await supabase.from('user_stats').update({ last_daily: new Date().toISOString() }).eq('jid', jid)
  const res = await addXp({ jid, groupJid, delta: DAILY_XP, reason: 'daily_bonus' })
  const text = `╭━━━[ 🎁 *DAILY BONUS* ]━━━╮\n┃ +${DAILY_XP} XP\n┃ 🏅 Rang: ${res.rank}\n╰━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(groupJid, {
    text,
    mentions: [jid]
  })
}
