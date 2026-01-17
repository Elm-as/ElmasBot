import { supabase } from '../../db/supabase.js'

// !quiz score [@user|jid] : score quiz du groupe ou d'un utilisateur
export async function cmdQuizScore(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  let targetJid = args[0]
  if (targetJid && !targetJid.includes('@')) targetJid = null
  // Si pas d'argument, on affiche le top 5 du groupe
  if (!targetJid) {
    // Récupérer les membres du groupe
    let jids = []
    try {
      const meta = await sock.groupMetadata(groupJid)
      jids = meta.participants.map(p => p.id)
    } catch {
      const { data: members } = await supabase.from('group_members').select('jid').eq('group_jid', groupJid)
      if (!members?.length) return sock.sendMessage(groupJid, { text: "Aucun membre trouvé.", quoted: msg })
      jids = members.map(m => m.jid)
    }
    if (!jids.length) return sock.sendMessage(groupJid, { text: "Aucun membre trouvé.", quoted: msg })
    // Récupérer les stats quiz
    const { data: stats } = await supabase
      .from('user_stats')
      .select('jid,quiz_win,quiz_lose,best_streak')
      .in('jid', jids)
    if (!stats?.length) return sock.sendMessage(groupJid, { text: "Aucun score quiz disponible.", quoted: msg })
    const sorted = stats.sort((a, b) => (b.quiz_win || 0) - (a.quiz_win || 0)).slice(0, 5)
    const lines = sorted.map((s, i) => `┃ ${i+1}. @${s.jid.split('@')[0]} — ✅ ${s.quiz_win||0} | ❌ ${s.quiz_lose||0} | 🔥 ${s.best_streak||0}`)
    const text = `╭━━━[ 🏆 *TOP QUIZ GROUPE* ]━━━╮\n${lines.join('\n')}\n╰━━━━━━━━━━━━━━━━━━━━╯`
    await sock.sendMessage(groupJid, { text, mentions: sorted.map(s => s.jid), quoted: msg })
    return
  }
  // Sinon, score individuel
  const { data: stat } = await supabase.from('user_stats').select('*').eq('jid', targetJid).single()
  if (!stat) return sock.sendMessage(groupJid, { text: "Aucun score quiz pour cet utilisateur.", quoted: msg })
  const text =
    `╭━━━[ 👤 *SCORE QUIZ* ]━━━╮\n`+
    `┃ @${targetJid.split('@')[0]}\n`+
    `┃ ✅ Victoires : ${stat.quiz_win||0}\n`+
    `┃ ❌ Défaites : ${stat.quiz_lose||0}\n`+
    `┃ 🔥 Streak : ${stat.streak||0} (best: ${stat.best_streak||0})\n`+
    `╰━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(groupJid, { text, mentions: [targetJid], quoted: msg })
}
