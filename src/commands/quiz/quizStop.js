import { isQuizAdmin } from '../../services/permissions.js'
import { quizEngine } from '../../services/quizEngine.js'

export async function cmdQuizStop(sock, msg) {
  const groupJid = msg.key.remoteJid
  const sender = msg.senderJid
  const allowed = await isQuizAdmin(sock, groupJid, sender)
  if (!allowed) {
    return sock.sendMessage(groupJid, { text: "⛔ Commande réservée aux admins quiz.", quoted: msg })
  }
  await quizEngine.stop({ sock, groupJid })
}
