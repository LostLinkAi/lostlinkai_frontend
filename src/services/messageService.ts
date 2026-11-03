import { demoMessages } from '../data/mockData'
import { matchingService } from './matchingService'
import { itemService } from './itemService'

export interface MessageService {
  canMessageAboutItem(itemId: string, userId: string): boolean
  listAccessibleMessages(userId: string): typeof demoMessages
}

function isConversationParticipant(itemId: string, userId: string) {
  const item = itemService.get(itemId)
  if (!item) return false

  return matchingService.listCandidates().some((match) => {
    if (match.reviewStatus === 'dismissed') return false
    if (match.lostItemId !== itemId && match.foundItemId !== itemId) return false
    const lostItem = itemService.get(match.lostItemId)
    const foundItem = itemService.get(match.foundItemId)
    if (!lostItem || !foundItem) return false

    return lostItem.reporterId !== foundItem.reporterId
      && (lostItem.reporterId === userId || foundItem.reporterId === userId)
  })
}

export const messageService: MessageService = {
  canMessageAboutItem: isConversationParticipant,
  listAccessibleMessages: (userId) => demoMessages.filter((message) =>
    (message.from === userId || message.to === userId)
    && isConversationParticipant(message.itemId, userId)),
}
