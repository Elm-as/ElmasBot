// Commande !quiz info : explication du fonctionnement du quiz
export async function cmdQuizInfo(sock, msg) {
  const groupJid = msg.key.remoteJid
  const text =
`╭━━━[ 🎯 *FONCTIONNEMENT DU QUIZ* ]━━━╮
┃ 1. Un admin quiz démarre le quiz avec !quiz start <niveau>.
┃ 2. Le bot pose une question à choix multiple (A/B/C/D).
┃ 3. Les membres répondent en envoyant simplement la lettre.
┃ 4. Le bot corrige automatiquement, attribue les XP, et passe à la question suivante.
┃ 5. Un timer limite le temps de réponse (ex : 30s).
┃ 6. Le quiz s’arrête avec !quiz stop ou après X questions.
┃ 7. Utilise !quiz score pour voir les scores.
╰━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(groupJid, { text, quoted: msg })
}
