import { ENDPOINTS } from '../config/endpoints.js'
import { translateToFr } from '../utils/translate.js'

// Utilise waifu.im pour générer une image d'anime/manga selon un mot-clé
export async function cmdImage(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  const query = args.join(' ')
  if (!query) {
    return sock.sendMessage(groupJid, { text: 'Utilise: !image <mot-clé>' })
  }
  await sock.sendMessage(groupJid, { text: '🔎 Recherche d’une image en cours... ⏳' })
  try {
    // waifu.im API : https://waifu.im/docs
    const res = await fetch(`https://api.waifu.im/search/?included_tags=${encodeURIComponent(query)}&is_nsfw=false&many=false`)
    const data = await res.json()
    if (!data.images?.length) {
      return sock.sendMessage(groupJid, { text: `Aucune image trouvée pour "${query}".` })
    }
    const img = data.images[0]
    // Traduction du tag si possible
    let tagFr = query
    try { tagFr = await translateToFr(query) } catch {}
    const text = `╭━━━[ 🖼️ *IMAGE ANIME* ]━━━╮\n┃ Mot-clé : *${tagFr}*\n╰━━━━━━━━━━━━━━━━━━━━╯`
    await sock.sendMessage(groupJid, {
      text,
      image: { url: img.url },
      quoted: msg
    })
  } catch (e) {
    await sock.sendMessage(groupJid, { text: '❌ Erreur lors de la recherche d’image.' })
  }
}
