const URL_PATTERN = /https?:\/\/[^\s<]+/gi

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function trimTrailingUrlPunctuation(url: string): string {
  return url.replace(/[.,;:!?)]+$/, '')
}

function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Converts plain text (with optional URLs and line breaks) to safe HTML for v-html.
 * Only emits <br> and <a target="_blank" rel="noopener noreferrer">.
 */
export function linkifyPlainTextToHtml(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ''

  const escaped = escapeHtml(text)
  const withBreaks = escaped.replace(/\r\n/g, '\n').replace(/\n/g, '<br>')

  return withBreaks.replace(URL_PATTERN, (rawMatch) => {
    const url = trimTrailingUrlPunctuation(rawMatch)
    if (!isSafeHttpUrl(url)) {
      return rawMatch
    }

    const href = escapeHtml(url)
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${href}</a>`
  })
}
