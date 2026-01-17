import { isQuizAdmin } from '../../services/permissions.js'
import { quizEngine } from '../../services/quizEngine.js'

export async function cmdQuizRep(sock, msg) {
  const groupJid = msg.key.remoteJid
  const sender = msg.senderJid
  const allowed = await isQuizAdmin(sock, groupJid, sender)
  if (!allowed) {
    return sock.sendMessage(groupJid, { text: "⛔ Commande réservée aux admins quiz." })
  }
  await quizEngine.reveal({ sock, groupJid })
}
