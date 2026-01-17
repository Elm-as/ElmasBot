import { supabase } from '../db/supabase.js'
import { getRankByXp } from '../services/ranks.js'

export async function cmdClassement(sock, msg) {
  const groupJid = msg.key.remoteJid
  // Feedback immédiat
  await sock.sendMessage(groupJid, { text: '🔎 Récupération du classement en cours... ⏳' })
  const { data: members } = await supabase
    .from('group_members')
    .select('jid')
    .eq('group_jid', groupJid)
  if (!members?.length) return sock.sendMessage(groupJid, { text: "ℹ️ Aucun membre trouvé pour ce groupe." })
  const jids = members.map(m => m.jid)
  const { data: users } = await supabase
    .from('users')
    .select('jid,xp')
    .in('jid', jids)
    .order('xp', { ascending: false })
    .limit(10)
  if (!users?.length) return sock.sendMessage(groupJid, { text: "ℹ️ Aucun classement disponible." })
  const mentions = users.map(u => u.jid)
  const lines = users.map((u, i) => {
    const rank = getRankByXp(Number(u.xp)).rank.name
    return `┃ ${i + 1}. @${u.jid.split('@')[0]} — *${u.xp}* XP (${rank})`
  })
  const text = `╭━━━[ 🏆 *CLASSEMENT DU GROUPE* ]━━━╮\n${lines.join('\n')}\n╰━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(groupJid, { text, mentions })
}
