export type ReportType = 'lost' | 'found'
export type ItemCategory = 'Electronics' | 'Bags' | 'Documents' | 'Keys' | 'Clothing' | 'Accessories' | 'Pets' | 'Vehicles' | 'Other'
export type ItemStatus = 'open' | 'matched' | 'resolved' | 'archived'

export interface User {
  id: string
  displayName: string
  email: string
  avatarUrl: string
  role: 'member' | 'moderator'
  createdAt: string
}

export interface Item {
  id: string
  reporterId: string
  reportType: ReportType
  title: string
  category: ItemCategory
  description: string
  identifyingFeatures: string[]
  imageUrls: string[]
  dateLostOrFound: string
  approximateLocation: string
  status: ItemStatus
  createdAt: string
  updatedAt: string
  estimatedValue?: number
}

export interface UserProfile {
  userId: string
  avatarUrl: string
  biography: string
  generalLocation: string
  contactPreferences: { inAppMessages: boolean }
  notificationPreferences: { matches: boolean; messages: boolean; updates: boolean }
  privacyPreferences: { showLocation: boolean }
}

export interface PotentialMatch {
  id: string
  lostItemId: string
  foundItemId: string
  similarityScore: number
  matchingReasons: string[]
  conflictingDetails: string[]
  reviewStatus: 'pending' | 'confirmed' | 'dismissed'
  createdAt: string
}

export interface AppMessage {
  id: string
  from: string
  to: string
  itemId: string
  text: string
  createdAt: string
  read: boolean
}

export interface AppNotification {
  id: string
  userId: string
  title: string
  body: string
  kind: 'match' | 'message' | 'status'
  createdAt: string
  read: boolean
  href: string
}
