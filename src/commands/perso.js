import { ENDPOINTS } from '../config/endpoints.js'

export async function cmdPerso(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  const query = args.join(' ')
  if (!query) {
    return sock.sendMessage(groupJid, { text: 'Utilise: !perso <nom>' })
  }
  // Feedback immédiat
  await sock.sendMessage(groupJid, { text: '🔎 Recherche du personnage en cours... ⏳' })
  try {
    const res = await fetch(`${ENDPOINTS.JIKAN}/characters?q=${encodeURIComponent(query)}&limit=1`)
    const data = await res.json()
    if (!data.data?.length) {
      return sock.sendMessage(groupJid, { text: 'Aucun personnage trouvé.' })
    }
    const perso = data.data[0]
    const detailsRes = await fetch(`${ENDPOINTS.JIKAN}/characters/${perso.mal_id}/full`)
    const details = await detailsRes.json()
    const p = details.data
    const text =
  `╭━━━[ 👤 *PERSONNAGE* ]━━━╮
  ┃ Nom : *${p.name}*
  ┃ Apparitions : ${(p.anime || []).map(a => a.name).join(', ') || '?'}
  ┃
  ┃ ${p.about?.slice(0, 400) ?? ''}
  ╰━━━━━━━━━━━━━━━━━━━━╯`
    await sock.sendMessage(groupJid, {
      text,
      ...(p.images?.jpg?.image_url ? { image: { url: p.images.jpg.image_url } } : {})
    })
  } catch (e) {
    await sock.sendMessage(groupJid, { text: '❌ Erreur lors de la recherche personnage.' })
  }
}
