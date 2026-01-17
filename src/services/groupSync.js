import { supabase } from '../db/supabase.js'

export async function ensureGroup(groupJid, title = null) {
  const { data } = await supabase.from('groups').select('*').eq('group_jid', groupJid).maybeSingle()
  if (data) return data
  const ins = await supabase.from('groups').insert({ group_jid: groupJid, title }).select('*').single()
  return ins.data
}

export async function ensureGroupMember(groupJid, jid) {
  await ensureGroup(groupJid)
  const now = new Date().toISOString()
  await supabase.from('group_members').upsert({
    group_jid: groupJid,
    jid,
    last_seen_at: now
  })
}
