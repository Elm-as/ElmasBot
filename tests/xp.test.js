import { addXp, incWinLose } from '../src/services/xp.js'

describe('XP', () => {
  test('addXp increments XP and returns correct rank', async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: { xp: 0, name: 'Test' } }),
            maybeSingle: () => ({ data: { xp: 0, name: 'Test' } })
          })
        }),
        update: () => ({ eq: () => ({}) }),
        insert: () => ({})
      })
    }
    const res = await addXp({ jid: 'jid', groupJid: 'group', delta: 100, reason: 'test' }, mockSupabase)
    expect(res.newXp).toBe(100)
    expect(res.rank).toBeDefined()
  })

  test('incWinLose updates stats', async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: { streak: 2, best_streak: 2, quiz_win: 2, quiz_lose: 1 } }),
            maybeSingle: () => ({ data: { streak: 2, best_streak: 2, quiz_win: 2, quiz_lose: 1 } })
          })
        }),
        update: () => ({ eq: () => ({}) }),
        insert: () => ({})
      })
    }
    const res = await incWinLose({ jid: 'jid', win: true }, mockSupabase)
    expect(res.streak).toBeGreaterThanOrEqual(0)
  })
})
