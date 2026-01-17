
import { isQuizAdmin } from '../../services/permissions.js'
import { supabase } from '../../db/supabase.js'
import { logAdminAction } from '../../services/adminLogs.js'

export async function cmdQuizSetAdmin(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  const sender = msg.senderJid
  const allowed = await isQuizAdmin(sock, groupJid, sender)
  if (!allowed) {
    return sock.sendMessage(groupJid, { text: "⛔ Commande réservée aux admins quiz." })
  }
  const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0]
  if (!mention) {
    return sock.sendMessage(groupJid, { text: "Mentionne un utilisateur ou donne son JID." })
  }
  const { error } = await supabase.from('group_quiz_admins').insert({
    group_jid: groupJid,
    jid: mention,
    added_by: sender
  })
  if (error && !String(error.message).includes('duplicate')) {
    return sock.sendMessage(groupJid, { text: "Erreur lors de l'ajout admin quiz." })
  }
  await logAdminAction({
    groupJid,
    adminJid: sender,
    action: 'add_quiz_admin',
    targetJid: mention
  })
  await sock.sendMessage(groupJid, { text: `✅ Ajouté à la whitelist quiz: @${mention.split('@')[0]}`, mentions: [mention] })
}
