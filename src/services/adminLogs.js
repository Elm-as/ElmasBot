import { supabase } from '../db/supabase.js'

export async function logAdminAction({ groupJid, adminJid, action, targetJid, details = null }) {
  await supabase.from('admin_logs').insert({
    group_jid: groupJid,
    admin_jid: adminJid,
    action,
    target_jid: targetJid,
    details
  })
}
