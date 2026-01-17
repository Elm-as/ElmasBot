import { isQuizAdmin } from '../../services/permissions.js'
import { quizEngine } from '../../services/quizEngine.js'

export async function cmdQuizStart(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  const sender = msg.senderJid
  const allowed = await isQuizAdmin(sock, groupJid, sender)
  if (!allowed) {
    return sock.sendMessage(groupJid, { text: "⛔ Commande réservée aux admins quiz.", quoted: msg })
  }
  // Feedback immédiat
  await sock.sendMessage(groupJid, { text: '🔎 Démarrage du quiz en cours... ⏳', quoted: msg })
  const difficulty = (args[0] || 'normal').toLowerCase()
  if (!['easy','normal','hard'].includes(difficulty)) {
    return sock.sendMessage(groupJid, { text: "Utilise: !quiz start easy|normal|hard [nb] ou !quiz start normal marathon", quoted: msg })
  }
  let total = 1
  let marathon = false
  if (args[1]) {
    if (args[1].toLowerCase() === 'marathon') marathon = true
    else if (!isNaN(Number(args[1]))) total = Math.max(1, parseInt(args[1]))
  }
  await quizEngine.start({ sock, groupJid, startedBy: sender, difficulty, total, marathon })
}
