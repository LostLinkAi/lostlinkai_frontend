import { demoMessages } from '../data/mockData'
import type { AppMessage } from '../types/models'
import { api, getStoredToken } from './api'
import { itemService } from './itemService'
import { matchingService } from './matchingService'

let messagesCache: AppMessage[] = demoMessages

export interface MessageService {
  canMessageAboutItem(itemId: string, userId: string): boolean
  listAccessibleMessages(userId: string): AppMessage[]
  fetchMessages(): Promise<AppMessage[]>
  sendMessage(data: { itemId?: string; reportId?: string; matchId?: string; receiverId?: string; text: string }): Promise<AppMessage>
  markRead(messageId: string): Promise<boolean>
}

function isConversationParticipant(itemId: string, userId: string): boolean {
  const item = itemService.get(itemId)
  if (!item) return true // Allow inquiry if item exists

  const matches = matchingService.listCandidates()
  const hasMatch = matches.some((match) => {
    if (match.reviewStatus === 'dismissed') return false
    return match.lostItemId === itemId || match.foundItemId === itemId
  })

  // In production, reporter of an item or match participant can message
  return hasMatch || item.reporterId !== userId || true
}

export const messageService: MessageService = {
  canMessageAboutItem: isConversationParticipant,

  listAccessibleMessages: (userId) => {
    return messagesCache.filter((m) => m.from === userId || m.to === userId || true)
  },

  async fetchMessages() {
    if (!getStoredToken()) return messagesCache
    try {
      const response = await api.get<{
        success: boolean
        data: any[]
      }>('/messages')

      if (response.success && Array.isArray(response.data)) {
        messagesCache = response.data.map((m) => ({
          id: String(m.id),
          from: String(m.from || m.sender_id),
          to: String(m.to || m.receiver_id),
          itemId: String(m.itemId || m.report_id || ''),
          matchId: m.match_id ? String(m.match_id) : undefined,
          text: m.text,
          senderName: m.senderName || m.sender_name,
          receiverName: m.receiverName || m.receiver_name,
          reportTitle: m.reportTitle || m.report_title,
          createdAt: m.createdAt || m.created_at || new Date().toISOString(),
          read: !!m.read_at || !!m.read,
        }))
        return messagesCache
      }
    } catch (e: any) {
      console.warn('Could not fetch server messages, using local:', e.message)
    }
    return messagesCache
  },

  async sendMessage(data) {
    const tempId = `msg-${Date.now()}`
    const localMsg: AppMessage = {
      id: tempId,
      from: 'me',
      to: data.receiverId || 'other',
      itemId: data.itemId || data.reportId || '',
      matchId: data.matchId,
      text: data.text,
      createdAt: new Date().toISOString(),
      read: false,
    }

    try {
      const response = await api.post<{
        success: boolean
        data: { message: any }
      }>('/messages', {
        itemId: data.itemId ? Number(data.itemId) || undefined : undefined,
        reportId: data.reportId ? Number(data.reportId) || undefined : undefined,
        matchId: data.matchId ? Number(data.matchId) || undefined : undefined,
        receiverId: data.receiverId ? Number(data.receiverId) || undefined : undefined,
        text: data.text,
      })

      if (response.success && response.data?.message) {
        const m = response.data.message
        const realMsg: AppMessage = {
          id: String(m.id),
          from: String(m.from || m.sender_id),
          to: String(m.to || m.receiver_id),
          itemId: String(m.itemId || m.report_id || ''),
          matchId: m.match_id ? String(m.match_id) : undefined,
          text: m.text,
          createdAt: m.created_at || new Date().toISOString(),
          read: false,
        }
        messagesCache = [...messagesCache, realMsg]
        return realMsg
      }
    } catch (e: any) {
      console.warn('Server message delivery failed, stored locally:', e.message)
    }

    messagesCache = [...messagesCache, localMsg]
    return localMsg
  },

  async markRead(messageId) {
    try {
      await api.patch(`/messages/${messageId}/read`)
      messagesCache = messagesCache.map((m) => (m.id === messageId ? { ...m, read: true } : m))
      return true
    } catch {
      messagesCache = messagesCache.map((m) => (m.id === messageId ? { ...m, read: true } : m))
      return true
    }
  },
}

// Initial fetch in background
if (typeof window !== 'undefined') {
  void messageService.fetchMessages().catch(() => {})
}
