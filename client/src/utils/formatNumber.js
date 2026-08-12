/** Форматирование крупных чисел: 1.2K, 3.4M, 1.5B */
export function formatNumber(value) {
  const n = Number(value) || 0
  const abs = Math.abs(n)

  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  if (abs >= 10) return String(Math.floor(n))
  return n.toFixed(n % 1 === 0 ? 0 : 1)
}
