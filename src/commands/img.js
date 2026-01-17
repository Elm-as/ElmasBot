import { ENDPOINTS } from '../config/endpoints.js'

export async function cmdImg(sock, msg) {
  const groupJid = msg.key.remoteJid
  // Feedback immédiat
  await sock.sendMessage(groupJid, { text: '🔎 Recherche d’une image anime en cours... ⏳' })
  try {
    const res = await fetch(`${ENDPOINTS.WAIFU}/sfw/waifu`)
    const data = await res.json()
    if (!data.url) {
      return sock.sendMessage(groupJid, { text: 'Aucune image trouvée.' })
    }
    await sock.sendMessage(groupJid, { image: { url: data.url }, caption: '╭━━━[ ✨ *IMAGE ANIME* ]━━━╮\n┃ Waifu générée aléatoirement !\n╰━━━━━━━━━━━━━━━━━━━━╯' })
  } catch (e) {
    await sock.sendMessage(groupJid, { text: '❌ Erreur lors de la récupération image.' })
  }
}
