export async function cmdHelp(sock, msg) {
  // Feedback immédiat
  await sock.sendMessage(msg.key.remoteJid, { text: '🔎 Chargement de la liste des commandes... ⏳' })
  const text =
`╭━━━[ 🤖 *100% Manga Bot* ]━━━╮
┃ 🎮 Commandes:
┃   !ping
┃   !help
┃   !profil
┃   !classement
┃   !daily
┃
┃ 🎯 Quiz (admins):
┃   !quiz start easy|normal|hard
┃   !quiz rep
┃   !quiz stop
┃   !quiz admins
╰━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(msg.key.remoteJid, { text })
}
