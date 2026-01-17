import { ENDPOINTS } from '../config/endpoints.js'

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
    const text =
  `╭━━━[ 🎬 *ANIME* ]━━━╮
  ┃ Titre : *${a.title}*
  ┃ Épisodes : ${a.episodes ?? '?'}
  ┃ ⭐ Score : ${a.score ?? '?'}
  ┃ 🎭 Genres : ${(a.genres || []).map(g => g.name).join(', ')}
  ┃
  ┃ ${a.synopsis?.slice(0, 400) ?? ''}
  ╰━━━━━━━━━━━━━━━━━━━━╯`
    await sock.sendMessage(groupJid, {
      text,
      ...(a.images?.jpg?.image_url ? { image: { url: a.images.jpg.image_url } } : {})
    })
  } catch (e) {
    await sock.sendMessage(groupJid, { text: '❌ Erreur lors de la recherche anime.' })
  }
}
