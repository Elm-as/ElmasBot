import { cmdXpLogs } from '../commands/xpLogs.js'
import { env } from '../config/env.js'
import { cmdPing } from '../commands/ping.js'
import { cmdHelp } from '../commands/help.js'
import { cmdProfil } from '../commands/profil.js'
import { cmdClassement } from '../commands/classement.js'
import { cmdDaily } from '../commands/daily.js'
import { cmdQuizStart } from '../commands/quiz/quizStart.js'
import { cmdQuizStop } from '../commands/quiz/quizStop.js'
import { cmdQuizRep } from '../commands/quiz/quizRep.js'
import { cmdQuizAdmins } from '../commands/quiz/quizAdmins.js'
import { cmdQuizSetAdmin } from '../commands/quiz/quizSetAdmin.js'
import { cmdQuizDelAdmin } from '../commands/quiz/quizDelAdmin.js'
import { cmdQuizSettings } from '../commands/quiz/quizSettings.js'

import { quizEngine } from './quizEngine.js'
import { ensureUser } from './xp.js'
import { ensureGroup, ensureGroupMember } from './groupSync.js'
import { cmdAnime } from '../commands/anime.js'
import { cmdPerso } from '../commands/perso.js'
import { cmdImg } from '../commands/img.js'
import { cmdTrace } from '../commands/trace.js'

function getText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    ''
  ).trim()
}

export async function handleMessage(sock, msg) {
  const text = getText(msg)
  const jid = msg.key.remoteJid
  const sender = msg.senderJid

  // Création lazy user/groupe/membre
  await ensureUser(sender)
  await ensureGroup(jid)
  await ensureGroupMember(jid, sender)

  // 1) Réponses quiz (A/B/C/D) doivent passer AVANT prefix
  if (quizEngine.isQuizActive(jid)) {
    const letter = text.toUpperCase()
    if (['A', 'B', 'C', 'D'].includes(letter)) {
      await quizEngine.submitAnswer({ sock, groupJid: jid, senderJid: sender, letter })
      return
    }
  }

  // 2) Commands
  const prefix = env.BOT_PREFIX
  if (!text.startsWith(prefix)) return

  const [raw, ...args] = text.slice(prefix.length).trim().split(/\s+/)
  const command = raw.toLowerCase()

  switch (command) {
    case 'ping': return cmdPing(sock, msg)
    case 'help': return cmdHelp(sock, msg)
    case 'profil': return cmdProfil(sock, msg)
    case 'classement': return cmdClassement(sock, msg)
    case 'daily': return cmdDaily(sock, msg)
    case 'anime': return cmdAnime(sock, msg, args)
    case 'perso': return cmdPerso(sock, msg, args)
    case 'img': return cmdImg(sock, msg)
    case 'trace': return cmdTrace(sock, msg)
    case 'xplogs': return cmdXpLogs(sock, msg, args)
    // quiz
    case 'quiz': {
      const sub = (args[0] || '').toLowerCase()
      if (sub === 'start') return cmdQuizStart(sock, msg, args.slice(1))
      if (sub === 'stop') return cmdQuizStop(sock, msg)
      if (sub === 'rep') return cmdQuizRep(sock, msg)
      if (sub === 'admins') return cmdQuizAdmins(sock, msg, args.slice(1))
      if (sub === 'setadmin') return cmdQuizSetAdmin(sock, msg, args.slice(1))
      if (sub === 'deladmin') return cmdQuizDelAdmin(sock, msg, args.slice(1))
      if (sub === 'settings') return cmdQuizSettings(sock, msg, args.slice(1))
      return sock.sendMessage(jid, { text: "Utilise: !quiz start easy|normal|hard / !quiz stop / !quiz rep / !quiz admins / !quiz setadmin @user / !quiz deladmin @user / !quiz settings [clé] [valeur]" })
    }
      case 'easteregg':
        const easterEggs = [
          `╭━━━[ 🥚 *EASTER EGG* ]━━━╮\n┃ Tu as trouvé le secret du bot !\n┃ \n┃ 🚀 "Plus ultra !"\n┃ \n┃ 👾 Révèle ce code à tes amis otakus !\n╰━━━━━━━━━━━━━━━━━━━━╯`,
          `╭━━━[ 🥚 *EASTER EGG* ]━━━╮\n┃ Tu as percé le mystère...\n┃ \n┃ 🍜 "Itadakimasu !"\n┃ \n┃ 🐉 Le pouvoir du manga est en toi !\n╰━━━━━━━━━━━━━━━━━━━━╯`,
          `╭━━━[ 🥚 *EASTER EGG* ]━━━╮\n┃ Secret du bot activé !\n┃ \n┃ ⚡ "Dattebayo !"\n┃ \n┃ 🎴 Tu es digne d’un héros shônen !\n╰━━━━━━━━━━━━━━━━━━━━╯`,
          `╭━━━[ 🥚 *EASTER EGG* ]━━━╮\n┃ Tu as trouvé l’œuf caché !\n┃ \n┃ 🏮 "Omae wa mou shindeiru..."\n┃ \n┃ 👺 Partage ce secret avec ton clan !\n╰━━━━━━━━━━━━━━━━━━━━╯`,
          `╭━━━[ 🥚 *EASTER EGG* ]━━━╮\n┃ Félicitations, explorateur !\n┃ \n┃ 🦊 "Believe in yourself !"\n┃ \n┃ 🌸 Que la passion anime t’accompagne !\n╰━━━━━━━━━━━━━━━━━━━━╯`
        ]
        const randomMsg = easterEggs[Math.floor(Math.random() * easterEggs.length)]
        await sock.sendMessage(jid, { text: randomMsg })
        break;
    default:
      return
  }
}
