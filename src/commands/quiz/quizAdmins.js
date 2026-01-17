import { isQuizAdmin } from '../../services/permissions.js'
import { supabase } from '../../db/supabase.js'

export async function cmdQuizAdmins(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  const sender = msg.senderJid
  const allowed = await isQuizAdmin(sock, groupJid, sender)
  if (!allowed) {
    return sock.sendMessage(groupJid, { text: "⛔ Commande réservée aux admins quiz.", quoted: msg })
  }
  const { data: admins } = await supabase
    .from('group_quiz_admins')
    .select('jid')
    .eq('group_jid', groupJid)
  if (!admins?.length) {
    return sock.sendMessage(groupJid, { text: "Aucun admin quiz whitelisté.", quoted: msg })
  }
  const lines = admins.map(a => `@${a.jid.split('@')[0]}`)
  await sock.sendMessage(groupJid, { text: `Quiz admins whitelist:\n${lines.join('\n')}`, mentions: admins.map(a => a.jid), quoted: msg })
}
