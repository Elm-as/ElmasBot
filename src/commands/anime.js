import { ENDPOINTS } from '../config/endpoints.js'
import { translateToFr } from '../utils/translate.js'

export async function cmdAnime(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  const query = args.join(' ')
  if (!query) {
    return sock.sendMessage(groupJid, { text: 'Utilise: !anime <nom>' })
  }
  // Feedback immédiat
  await sock.sendMessage(groupJid, { text: '🔎 Recherche de l’anime en cours... ⏳' })
  try {
    const res = await fetch(`${ENDPOINTS.JIKAN}/anime?q=${encodeURIComponent(query)}&limit=1`)
    const data = await res.json()
    if (!data.data?.length) {
      return sock.sendMessage(groupJid, { text: 'Aucun anime trouvé.' })
    }
    const anime = data.data[0]
    const detailsRes = await fetch(`${ENDPOINTS.JIKAN}/anime/${anime.mal_id}/full`)
    const details = await detailsRes.json()
    const a = details.data

    // Traduction automatique via utilitaire
    let titreFr = a.title, synopsisFr = a.synopsis, langue = 'EN';
    try {
      titreFr = await translateToFr(a.title)
      langue = 'FR'
    } catch {}
    try {
      if (a.synopsis) synopsisFr = await translateToFr(a.synopsis.slice(0, 500))
    } catch {}

    const text =
  `╭━━━[ 🎬 *ANIME* ]━━━╮
  ┃ Titre : *${titreFr}*
  ┃ Épisodes : ${a.episodes ?? '?'}
  ┃ ⭐ Score : ${a.score ?? '?'}
  ┃ 🎭 Genres : ${(a.genres || []).map(g => g.name).join(', ')}
  ┃
  ┃ ${synopsisFr?.slice(0, 400) ?? ''}
  ┃
  ┃ 🌐 Langue : ${langue}
  ╰━━━━━━━━━━━━━━━━━━━━╯`
    await sock.sendMessage(groupJid, {
      text,
      ...(a.images?.jpg?.image_url ? { image: { url: a.images.jpg.image_url } } : {}),
      quoted: msg
    })
  } catch (e) {
    await sock.sendMessage(groupJid, { text: '❌ Erreur lors de la recherche anime.' })
  }
}
