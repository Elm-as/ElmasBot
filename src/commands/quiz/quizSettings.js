import { isQuizAdmin } from '../../services/permissions.js'
import { supabase } from '../../db/supabase.js'

export async function cmdQuizSettings(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  const sender = msg.senderJid
  const allowed = await isQuizAdmin(sock, groupJid, sender)
  if (!allowed) {
    return sock.sendMessage(groupJid, { text: "⛔ Commande réservée aux admins quiz." })
  }
  if (!args.length) {
    // Afficher les paramètres actuels
    const { data } = await supabase.from('group_settings').select('*').eq('group_jid', groupJid).maybeSingle()
    if (!data) return sock.sendMessage(groupJid, { text: "Aucun paramètre trouvé pour ce groupe." })
    return sock.sendMessage(groupJid, { text: `Paramètres quiz:\n- quiz_enabled: ${data.quiz_enabled}\n- quiz_cooldown_sec: ${data.quiz_cooldown_sec}` })
  }
  // Modification d'un paramètre
  const [key, value] = args
  if (!['quiz_enabled','quiz_cooldown_sec'].includes(key)) {
    return sock.sendMessage(groupJid, { text: "Paramètre inconnu. Utilise quiz_enabled ou quiz_cooldown_sec." })
  }
  let update = {}
  if (key === 'quiz_enabled') update.quiz_enabled = value === 'true' || value === '1'
  if (key === 'quiz_cooldown_sec') update.quiz_cooldown_sec = parseInt(value)
  await supabase.from('group_settings').upsert({ group_jid: groupJid, ...update })
  await sock.sendMessage(groupJid, { text: `✅ Paramètre ${key} mis à jour.` })
}
