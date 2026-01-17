import { supabase } from '../db/supabase.js'
import { getRankByXp } from './ranks.js'

export async function ensureUser(jid, name = null, supabaseClient = supabase) {
  const { data } = await supabaseClient.from('users').select('*').eq('jid', jid).maybeSingle()
  if (data) return data
  const ins = await supabaseClient.from('users').insert({ jid, name }).select('*').single()
  if (ins.error) throw ins.error
  await supabaseClient.from('user_stats').insert({ jid })
  return ins.data
}

export async function addXp({ jid, groupJid = null, delta, reason }, supabaseClient = supabase) {
  await ensureUser(jid, null, supabaseClient)
  const { data: current, error: e1 } = await supabaseClient.from('users').select('xp,name').eq('jid', jid).single()
  if (e1) throw e1
  const newXp = BigInt(current.xp) + BigInt(delta)
  const { error: e2 } = await supabaseClient.from('users').update({ xp: newXp.toString() }).eq('jid', jid)
  if (e2) throw e2
  const { error: e3 } = await supabaseClient.from('xp_logs').insert({
    jid,
    group_jid: groupJid,
    delta,
    reason
  })
  if (e3) throw e3
  const rankInfo = getRankByXp(Number(newXp))
  return {
    jid,
    oldXp: Number(current.xp),
    newXp: Number(newXp),
    rank: rankInfo.rank.name,
    next: rankInfo.next?.name || null
  }
}

export async function incWinLose({ jid, win }, supabaseClient = supabase) {
  await ensureUser(jid, null, supabaseClient)
  const { data: stats, error: e1 } = await supabaseClient.from('user_stats').select('*').eq('jid', jid).single()
  if (e1) throw e1
  let streak = stats.streak || 0
  let best = stats.best_streak || 0
  let quiz_win = stats.quiz_win || 0
  let quiz_lose = stats.quiz_lose || 0
  if (win) {
    quiz_win += 1
    streak += 1
    if (streak > best) best = streak
  } else {
    quiz_lose += 1
    streak = 0
  }
  const { error: e2 } = await supabaseClient.from('user_stats').update({
    quiz_win,
    quiz_lose,
    streak,
    best_streak: best
  }).eq('jid', jid)
  if (e2) throw e2
  return { quiz_win, quiz_lose, streak, best_streak: best }
}
