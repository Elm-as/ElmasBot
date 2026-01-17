import { ENDPOINTS } from '../config/endpoints.js'

export async function cmdTrace(sock, msg) {
  const groupJid = msg.key.remoteJid
  const imageMsg = msg.message?.imageMessage
  if (!imageMsg?.url) {
    return sock.sendMessage(groupJid, { text: 'Envoie une image avec !trace.' })
  }
  // Feedback immédiat
  await sock.sendMessage(groupJid, { text: '🔎 Recherche trace.moe en cours... ⏳' })
  try {
    const imageUrl = imageMsg.url
    const res = await fetch(`${ENDPOINTS.TRACE}/search?url=${encodeURIComponent(imageUrl)}`)
    const data = await res.json()
    if (!data.result?.length) {
      return sock.sendMessage(groupJid, { text: 'Aucun résultat trace.moe.' })
    }
    const r = data.result[0]
    const text =
  `╭━━━[ 🔎 *TRACE.MOE* ]━━━╮
  ┃ Anime : *${r.anime ?? '?'}*
  ┃ Épisode : ${r.episode ?? '?'}
  ┃ ⏱️ Time : ${r.from ? Math.floor(r.from/60)+':'+('0'+Math.floor(r.from%60)).slice(-2) : '?'}
  ┃ 🔥 Similarité : ${(r.similarity*100).toFixed(1)}%
  ╰━━━━━━━━━━━━━━━━━━━━╯`
    await sock.sendMessage(groupJid, { text })
  } catch (e) {
    await sock.sendMessage(groupJid, { text: '❌ Erreur trace.moe.' })
  }
}
