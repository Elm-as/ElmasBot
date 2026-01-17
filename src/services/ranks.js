export const RANKS = [
  { name: "Rang F", minXp: 0 },
  { name: "Rang E", minXp: 10 },
  { name: "Rang D", minXp: 100 },
  { name: "Rang C", minXp: 1000 },
  { name: "Rang B", minXp: 10000 },
  { name: "Rang A", minXp: 100000 },
  { name: "Rang S", minXp: 1000000 },
  { name: "Rang SS", minXp: 10000000 },
  { name: "Rang Nation", minXp: 100000000 },
  { name: "Rang SSS", minXp: 1000000000 },
  { name: "Rang Monarque", minXp: 10000000000 },
  { name: "Rang ROI", minXp: 100000000000 },
  { name: "Rang Divin", minXp: 1000000000000 }
]

export function getRankByXp(xp) {
  let current = RANKS[0]
  for (const r of RANKS) {
    if (xp >= r.minXp) current = r
    else break
  }
  const idx = RANKS.findIndex(r => r.name === current.name)
  const next = idx >= 0 && idx < RANKS.length - 1 ? RANKS[idx + 1] : null

  return {
    rank: current,
    next,
    progress: next
      ? { currentXp: xp, min: current.minXp, next: next.minXp }
      : null
  }
}

export function xpToNextRank(xp) {
  const { next } = getRankByXp(xp)
  if (!next) return 0
  return Math.max(0, next.minXp - xp)
}
