import { demoNotifications } from '../data/mockData'
import type { AppNotification } from '../types/models'
import { api, getStoredToken } from './api'

let notificationsCache: AppNotification[] = demoNotifications

export const notificationService = {
  list(): AppNotification[] {
    return notificationsCache
  },

  async fetchNotifications(): Promise<AppNotification[]> {
    if (!getStoredToken()) return notificationsCache
    try {
      const response = await api.get<{
        success: boolean
        data: AppNotification[]
      }>('/notifications')

      if (response.success && Array.isArray(response.data)) {
        notificationsCache = response.data
        return notificationsCache
      }
    } catch (e: any) {
      console.warn('Could not fetch notifications from server:', e.message)
    }
    return notificationsCache
  },

  async markRead(id: string): Promise<boolean> {
    notificationsCache = notificationsCache.map((n) => (n.id === id ? { ...n, read: true } : n))
    try {
      await api.patch(`/notifications/${id}/read`)
      return true
    } catch {
      return true
    }
  },

  async markAllRead(): Promise<boolean> {
    notificationsCache = notificationsCache.map((n) => ({ ...n, read: true }))
    try {
      await api.patch('/notifications/read-all')
      return true
    } catch {
      return true
    }
  },
}

// Initial fetch in background
if (typeof window !== 'undefined') {
  void notificationService.fetchNotifications().catch(() => {})
}

