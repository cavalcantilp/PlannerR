export function isNativeNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (!isNativeNotificationSupported()) return null
  if (Notification.permission === 'default') {
    return Notification.requestPermission()
  }
  return Notification.permission
}

export function fireNativeNotification(title: string, body: string) {
  if (!isNativeNotificationSupported()) return
  if (Notification.permission !== 'granted') return
  new Notification(title, { body, icon: '/favicon.svg' })
}
