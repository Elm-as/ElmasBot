import { supabase } from '../db/supabase.js'
import { env } from '../config/env.js'

// Commande !settings : voir/modifier les paramètres globaux du bot
export async function cmdSettings(sock, msg, args) {
  const groupJid = msg.key.remoteJid
  const sender = msg.senderJid
  // Seuls les super admins peuvent modifier
  const isSuperAdmin = env.SUPER_ADMINS.includes(sender)

  if (!args.length) {
    // Afficher les paramètres globaux
    const text =
      `╭━━━[ ⚙️ *PARAMÈTRES BOT* ]━━━╮\n` +
      `┃ Préfixe : ${env.BOT_PREFIX}\n` +
      `┃ Nom : ${env.BOT_NAME}\n` +
      `┃ Super Admins : ${env.SUPER_ADMINS.join(', ') || 'Aucun'}\n` +
      `┃ Jikan : ${env.JIKAN_BASE}\n` +
      `┃ Waifu : ${env.WAIFU_BASE}\n` +
      `┃ Trace : ${env.TRACE_BASE}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯`;
    return sock.sendMessage(groupJid, { text, quoted: msg })
  }

  // Modification (super admin uniquement)
  if (!isSuperAdmin) {
    return sock.sendMessage(groupJid, { text: '⛔ Seuls les super admins peuvent modifier les paramètres globaux.', quoted: msg })
  }
  const [key, ...rest] = args
  const value = rest.join(' ')
  let ok = false
  switch (key) {
    case 'prefix':
      process.env.BOT_PREFIX = value
      ok = true
      break
    case 'name':
      process.env.BOT_NAME = value
      ok = true
      break
    default:
      return sock.sendMessage(groupJid, { text: 'Paramètre inconnu. Utilise prefix ou name.', quoted: msg })
  }
  if (ok) {
    return sock.sendMessage(groupJid, { text: `✅ Paramètre ${key} mis à jour (${value}) (redémarrage requis).`, quoted: msg })
  }
}
