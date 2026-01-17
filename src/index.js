import 'dotenv/config'
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  jidNormalizedUser
} from '@whiskeysockets/baileys'

import pino from 'pino'
import { handleMessage } from './services/handlers.js'


import('qrcode-terminal').then(qrcode => { global.qrcode = qrcode.default })

const logger = pino({ level: 'info' })

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: logger.child({ level: 'silent' })
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr && global.qrcode) {
      global.qrcode.generate(qr, { small: true })
      console.log('Scanne ce QR code avec WhatsApp !')
    }
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      logger.warn({ statusCode }, 'connection closed')
      if (shouldReconnect) startBot()
      else logger.error('Logged out. Delete auth_info and relink.')
    }
    if (connection === 'open') {
      logger.info('✅ Bot connected successfully.')
    }
  })

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages?.[0]
    if (!msg) return
    if (msg.key.fromMe) return
    if (msg.key.remoteJid === 'status@broadcast') return
    msg.senderJid = msg.key.participant
      ? jidNormalizedUser(msg.key.participant)
      : jidNormalizedUser(msg.key.remoteJid)
    await handleMessage(sock, msg)
  })
}

startBot()
