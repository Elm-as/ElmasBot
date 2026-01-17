import { supabase } from '../db/supabase.js'

export async function cmdXpLogs(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  const jid = msg.senderJid
  // Option admin : voir les logs d'un autre utilisateur
  const targetJid = args[0] || jid
  // Feedback immédiat
  await sock.sendMessage(groupJid, { text: '🔎 Récupération des logs XP en cours... ⏳' })
  const { data: logs, error } = await supabase
    .from('xp_logs')
    .select('*')
    .eq('jid', targetJid)
    .order('created_at', { ascending: false })
    .limit(10)
  if (error || !logs?.length) {
    return sock.sendMessage(groupJid, { text: "Aucun log XP trouvé." })
  }
  const lines = logs.map(l => {
    const date = new Date(l.created_at)
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    const heure = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const emoji = l.delta > 0 ? '🟢' : '🔴'
    return `┃ ${emoji} ${l.delta > 0 ? '+' : ''}${l.delta} XP — *${l.reason}* (${dateStr} à ${heure})`
  })
  const text = `╭━━━[ 📜 *LOGS XP* ]━━━╮\n┃ Derniers logs XP pour @${targetJid.split('@')[0]} :\n${lines.join('\n')}\n╰━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(groupJid, { text, mentions: [targetJid], quoted: msg })
}
