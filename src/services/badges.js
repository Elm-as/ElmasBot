import { supabase } from '../db/supabase.js'

// Exemple de badges simples
export const BADGES = [
  { id: 'quiz_10', label: 'Quiz Novice', desc: 'A répondu à 10 quiz', condition: stats => stats.quiz_win + stats.quiz_lose >= 10 },
  { id: 'quiz_50', label: 'Quiz Master', desc: 'A répondu à 50 quiz', condition: stats => stats.quiz_win + stats.quiz_lose >= 50 },
  { id: 'streak_5', label: 'Streak 5', desc: '5 victoires quiz d\'affilée', condition: stats => stats.best_streak >= 5 },
  { id: 'streak_10', label: 'Streak 10', desc: '10 victoires quiz d\'affilée', condition: stats => stats.best_streak >= 10 }
]

export async function getUserBadges(jid, supabaseClient = supabase) {
  const { data: stats } = await supabaseClient.from('user_stats').select('*').eq('jid', jid).single()
  if (!stats) return []
  return BADGES.filter(b => b.condition(stats)).map(b => ({ id: b.id, label: b.label, desc: b.desc }))
}
