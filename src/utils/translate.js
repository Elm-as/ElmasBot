// utils/translate.js
// Utilitaire pour traduire du texte en français via LibreTranslate

export async function translateToFr(text, sourceLang = 'en') {
  if (!text) return text
  try {
    const res = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: sourceLang, target: 'fr', format: 'text' })
    })
    const data = await res.json()
    if (data.translatedText) return data.translatedText
  } catch {}
  return text
}
