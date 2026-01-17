import { env } from '../config/env.js'
import { supabase } from '../db/supabase.js'

export async function isSuperAdmin(jid) {
  return env.SUPER_ADMINS.includes(jid)
}

export async function isWhatsAppGroupAdmin(sock, groupJid, userJid) {
  try {
    const meta = await sock.groupMetadata(groupJid)
    const participant = meta.participants.find(p => p.id === userJid)
    if (!participant) return false
    return participant.admin === 'admin' || participant.admin === 'superadmin'
  } catch {
    return false
  }
}

export async function isQuizAdmin(sock, groupJid, userJid) {
  if (await isSuperAdmin(userJid)) return true
  const { data } = await supabase
    .from('group_quiz_admins')
    .select('jid')
    .eq('group_jid', groupJid)
    .eq('jid', userJid)
    .maybeSingle()
  if (data) return true
  return isWhatsAppGroupAdmin(sock, groupJid, userJid)
}
