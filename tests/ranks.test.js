import { getRankByXp, xpToNextRank, RANKS } from '../src/services/ranks.js'

describe('RANKS', () => {
  test('getRankByXp returns correct rank', () => {
    expect(getRankByXp(0).rank.name).toBe('Rang F')
    expect(getRankByXp(10).rank.name).toBe('Rang E')
    expect(getRankByXp(100).rank.name).toBe('Rang D')
    expect(getRankByXp(1000000000000).rank.name).toBe('Rang Divin')
  })

  test('xpToNextRank returns correct value', () => {
    expect(xpToNextRank(0)).toBe(10)
    expect(xpToNextRank(10)).toBe(90)
    expect(xpToNextRank(100)).toBe(900)
    expect(xpToNextRank(1000000000000)).toBe(0)
  })
})
