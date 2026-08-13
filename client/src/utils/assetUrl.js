/** Публичные файлы с учётом Vite base (GitHub Pages: /repo-name/). */
export function assetUrl(path) {
  const base = import.meta.env.BASE_URL
  const clean = path.startsWith('/') ? path.slice(1) : path
  return `${base}${clean}`
}
