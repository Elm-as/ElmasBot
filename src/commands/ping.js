export async function cmdPing(sock, msg) {
  // Feedback immédiat
  await sock.sendMessage(msg.key.remoteJid, { text: '🔎 Test du bot en cours... ⏳' })
  await sock.sendMessage(msg.key.remoteJid, { text: "🏓 Pong ✅" })
}
