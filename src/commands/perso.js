import { ENDPOINTS } from '../config/endpoints.js'
import { translateToFr } from '../utils/translate.js'

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

    // Traduction automatique via utilitaire
    let nomFr = p.name, bioFr = p.about, langue = 'EN';
    try {
      nomFr = await translateToFr(p.name)
      langue = 'FR'
    } catch {}
    try {
      if (p.about) bioFr = await translateToFr(p.about.slice(0, 500))
    } catch {}

    const apparitions = (p.anime || []).map(a => a.name).join(', ') || '?'
    const text =
  `╭━━━[ 👤 *PERSONNAGE* ]━━━╮
  ┃ Nom : *${nomFr}*
  ┃ Apparitions : ${apparitions}
  ┃
  ┃ ${bioFr?.slice(0, 400) ?? ''}
  ┃
  ┃ 🌐 Langue : ${langue}
  ╰━━━━━━━━━━━━━━━━━━━━╯`
    await sock.sendMessage(groupJid, {
      text,
      image: { url: p.images?.jpg?.image_url || 'https://i.imgur.com/8Q2Qy4F.png' },
      quoted: msg
    })
  } catch (e) {
    await sock.sendMessage(groupJid, { text: '❌ Erreur lors de la recherche personnage.' })
  }
}
