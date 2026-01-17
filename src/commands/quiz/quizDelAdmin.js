
import { isQuizAdmin } from '../../services/permissions.js'
import { supabase } from '../../db/supabase.js'
import { logAdminAction } from '../../services/adminLogs.js'

export async function cmdQuizDelAdmin(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  const sender = msg.senderJid
  const allowed = await isQuizAdmin(sock, groupJid, sender)
  if (!allowed) {
    return sock.sendMessage(groupJid, { text: "⛔ Commande réservée aux admins quiz.", quoted: msg })
  }
  const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0]
  if (!mention) {
    return sock.sendMessage(groupJid, { text: "Mentionne un utilisateur ou donne son JID.", quoted: msg })
  }
  const { error } = await supabase.from('group_quiz_admins')
    .delete()
    .eq('group_jid', groupJid)
    .eq('jid', mention)
  if (error) {
    return sock.sendMessage(groupJid, { text: "Erreur lors de la suppression admin quiz.", quoted: msg })
  }
  await logAdminAction({
    groupJid,
    adminJid: sender,
    action: 'remove_quiz_admin',
    targetJid: mention
  })
  await sock.sendMessage(groupJid, { text: `❌ Retiré de la whitelist quiz: @${mention.split('@')[0]}`, mentions: [mention], quoted: msg })
}
