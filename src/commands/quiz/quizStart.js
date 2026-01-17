import { isQuizAdmin } from '../../services/permissions.js'
import { quizEngine } from '../../services/quizEngine.js'

export async function cmdQuizStart(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  const sender = msg.senderJid
  const allowed = await isQuizAdmin(sock, groupJid, sender)
  if (!allowed) {
    return sock.sendMessage(groupJid, { text: "⛔ Commande réservée aux admins quiz." })
  }
  // Feedback immédiat
  await sock.sendMessage(groupJid, { text: '🔎 Démarrage du quiz en cours... ⏳' })
  const difficulty = (args[0] || 'normal').toLowerCase()
  if (!['easy','normal','hard'].includes(difficulty)) {
    return sock.sendMessage(groupJid, { text: "Utilise: !quiz start easy|normal|hard" })
  }
  await quizEngine.start({ sock, groupJid, startedBy: sender, difficulty })
}
