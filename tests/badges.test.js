import { BADGES, getUserBadges } from '../src/services/badges.js'

describe('BADGES', () => {
  test('getUserBadges returns correct badges', async () => {
    // Simule des stats utilisateur
    const stats = { quiz_win: 5, quiz_lose: 5, best_streak: 6 }
    // Mock supabase compatible injection
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: stats })
          })
        })
      })
    }
    const badges = await getUserBadges('jid', mockSupabase)
    expect(badges.map(b => b.id)).toContain('quiz_10')
    expect(badges.map(b => b.id)).toContain('streak_5')
  })
})
