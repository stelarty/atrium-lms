import { getCurrentInstance } from 'vue'

export function useTabBarIconGradient(iconKey: string) {
  const instance = getCurrentInstance()
  const uid = instance?.uid ?? 'default'

  return {
    activeGradientId: `${iconKey}-active-gradient-${uid}`,
    inactiveGradientId: `${iconKey}-inactive-gradient-${uid}`,
  }
}
