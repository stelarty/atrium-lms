/** Предзагрузка URL в кэш браузера (без await). */
export function preloadImages(urls: readonly (string | null | undefined)[]): void {
  urls.forEach((url) => {
    if (!url?.trim()) return
    const image = new Image()
    image.src = url
  })
}
