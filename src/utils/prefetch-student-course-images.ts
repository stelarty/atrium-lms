import goodLuckImage from '@/assets/images/good-luck.png'
import inDevImage from '@/assets/images/in-dev.png'
import lessonsEmptyImage from '@/assets/images/lessons-emty.png'
import subscribeImage from '@/assets/images/subscribe.png'

/**
 * URLs for decorative PNGs used across student course tabs (program, schedule,
 * progress, homework, resources). `import` only registers the URL; the browser
 * fetches bytes when an <img> mounts — this primes the HTTP cache early.
 */
const tabIllustrationUrls = [
  inDevImage,
  subscribeImage,
  lessonsEmptyImage,
  goodLuckImage,
] as const

export function prefetchStudentCourseTabImages(): void {
  for (const url of tabIllustrationUrls) {
    const img = new Image()
    img.src = url
  }
}
