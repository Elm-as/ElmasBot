import { ENDPOINTS } from '../config/endpoints.js'
import { translateToFr } from '../utils/translate.js'

// Télécharge un buffer d'image WhatsApp
async function downloadImage(sock, imageMsg) {
  const stream = await sock.downloadMediaMessage(imageMsg)
  if (!stream) throw new Error('Impossible de télécharger l\'image')
  // stream est un Buffer ou ArrayBuffer
  return Buffer.isBuffer(stream) ? stream : Buffer.from(stream)
}

// Upload sur Catbox et retourne l'URL publique
async function uploadToCatbox(buffer, filename = 'image.jpg') {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, filename)
  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  })
  const url = await res.text()
  if (!url.startsWith('https://')) throw new Error('Échec upload Catbox')
  return url.trim()
}

export async function cmdTrace(sock, msg) {
  const groupJid = msg.key.remoteJid
  const imageMsg = msg.message?.imageMessage
  if (!imageMsg) {
    return sock.sendMessage(groupJid, { text: 'Envoie une image avec !trace.' })
  }
  await sock.sendMessage(groupJid, { text: '🔎 Téléchargement et upload de l’image en cours...', quoted: msg })
  try {
    // 1. Télécharger l'image WhatsApp
    const buffer = await downloadImage(sock, imageMsg)
    // 2. Uploader sur Catbox
    const publicUrl = await uploadToCatbox(buffer)
    // 3. Appeler trace.moe
    await sock.sendMessage(groupJid, { text: '🔎 Recherche trace.moe en cours...', quoted: msg })
    const res = await fetch(`${ENDPOINTS.TRACE}/search?url=${encodeURIComponent(publicUrl)}`)
    const data = await res.json()
    if (!data.result?.length) {
      return sock.sendMessage(groupJid, { text: 'Aucun résultat trace.moe.', quoted: msg })
    }
    const r = data.result[0]
    let animeFr = r.anime
    try {
      if (r.anime) animeFr = await translateToFr(r.anime)
    } catch {}
    const text =
  `╭━━━[ 🔎 *TRACE.MOE* ]━━━╮
  ┃ Anime : *${animeFr ?? '?'}*
  ┃ Épisode : ${r.episode ?? '?'}
  ┃ ⏱️ Time : ${r.from ? Math.floor(r.from/60)+':'+('0'+Math.floor(r.from%60)).slice(-2) : '?'}
  ┃ 🔥 Similarité : ${(r.similarity*100).toFixed(1)}%
  ╰━━━━━━━━━━━━━━━━━━━━╯`
    await sock.sendMessage(groupJid, { text, quoted: msg })
  } catch (e) {
    await sock.sendMessage(groupJid, { text: '❌ Erreur lors de la recherche trace.moe ou upload Catbox.', quoted: msg })
  }
}
