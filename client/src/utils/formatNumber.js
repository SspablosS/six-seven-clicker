/** Форматирование крупных чисел: 1.2K, 3.4M, 1.5B (Эхо — целые) */
export function formatNumber(value) {
  const n = Math.floor(Number(value) || 0)
  const abs = Math.abs(n)

  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
