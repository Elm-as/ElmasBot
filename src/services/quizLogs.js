import { supabase } from '../db/supabase.js'

export async function logQuizEvent({ groupJid, quizId, event, data = null }) {
  await supabase.from('quiz_logs').insert({
    group_jid: groupJid,
    quiz_id: quizId,
    event,
    data
  })
}
