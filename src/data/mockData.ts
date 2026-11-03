import type { AppMessage, AppNotification, Item, PotentialMatch, User } from '../types/models'

export const demoUser: User = {
  id: 'u-01', displayName: 'Alex Morgan', email: 'alex@example.test',
  avatarUrl: 'https://i.pravatar.cc/120?img=12', role: 'member', createdAt: '2025-02-12',
}

export const demoItems: Item[] = [
  { id: 'item-01', reporterId: 'u-01', reportType: 'lost', title: 'Vintage film camera', category: 'Electronics', description: 'Black Olympus camera with a worn leather strap. It has a small scratch near the lens and the initials A.M. inside the battery cover.', identifyingFeatures: ['Worn brown leather strap', 'Initials A.M. inside cover'], imageUrls: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85'], dateLostOrFound: '2025-02-19', approximateLocation: 'Riverside Market', status: 'open', createdAt: '2025-02-19', updatedAt: '2025-02-19' },
  { id: 'item-02', reporterId: 'u-02', reportType: 'found', title: 'Olympus point-and-shoot', category: 'Electronics', description: 'Found near the east entrance. Black compact camera with a leather-look strap. Would love to get it back to its owner.', identifyingFeatures: ['Dark leather-look strap', 'Compact 35mm body'], imageUrls: ['https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=1000&q=85'], dateLostOrFound: '2025-02-20', approximateLocation: 'Riverside Market · east entrance', status: 'open', createdAt: '2025-02-20', updatedAt: '2025-02-20' },
  { id: 'item-03', reporterId: 'u-03', reportType: 'found', title: 'Canvas tote with sketchbook', category: 'Bags', description: 'A natural canvas tote containing a small sketchbook. Handed in to the community desk.', identifyingFeatures: ['Blue ink mark on one handle'], imageUrls: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85'], dateLostOrFound: '2025-02-21', approximateLocation: 'Northside Library', status: 'open', createdAt: '2025-02-21', updatedAt: '2025-02-21' },
  { id: 'item-04', reporterId: 'u-04', reportType: 'lost', title: 'Silver key ring', category: 'Keys', description: 'Three keys on a small silver ring, including one brass key and a green fabric tag.', identifyingFeatures: ['Green fabric tag', 'One brass key'], imageUrls: ['https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1000&q=85'], dateLostOrFound: '2025-02-18', approximateLocation: 'Harbor tram stop', status: 'open', createdAt: '2025-02-18', updatedAt: '2025-02-18' },
  { id: 'item-05', reporterId: 'u-05', reportType: 'found', title: 'Blue wool scarf', category: 'Clothing', description: 'Soft blue scarf found folded on a bench near the garden path.', identifyingFeatures: ['Small stitched star at one end'], imageUrls: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85'], dateLostOrFound: '2025-02-17', approximateLocation: 'Botanical Gardens', status: 'open', createdAt: '2025-02-17', updatedAt: '2025-02-17' },
  { id: 'item-06', reporterId: 'u-01', reportType: 'lost', title: 'Leather notebook', category: 'Accessories', description: 'Dark green pocket notebook with a brass clasp. A few pages have handwritten recipes.', identifyingFeatures: ['Brass clasp', 'Handwritten recipes'], imageUrls: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1000&q=85'], dateLostOrFound: '2025-02-16', approximateLocation: 'Old Town', status: 'resolved', createdAt: '2025-02-16', updatedAt: '2025-02-22' },
]

export const demoMatches: PotentialMatch[] = [
  { id: 'match-01', lostItemId: 'item-01', foundItemId: 'item-02', similarityScore: 87, matchingReasons: ['Both described as black Olympus cameras', 'Same market area within one day', 'Similar leather-look strap'], conflictingDetails: ['Initials not verified yet'], reviewStatus: 'pending', createdAt: '2025-02-21' },
]

export const demoMessages: AppMessage[] = [
  { id: 'msg-01', from: 'u-02', to: 'u-01', itemId: 'item-02', text: 'I may have found your camera. Can you describe one detail on the back?', createdAt: '2025-02-21T10:30:00Z', read: false },
]

export const demoNotifications: AppNotification[] = [
  { id: 'note-01', userId: 'u-01', title: 'A possible match was found', body: 'A camera report near Riverside Market may be related to yours.', kind: 'match', createdAt: '2025-02-21T10:30:00Z', read: false, href: '/matching' },
  { id: 'note-02', userId: 'u-01', title: 'New message', body: 'Jordan sent a message about a camera listing.', kind: 'message', createdAt: '2025-02-21T10:15:00Z', read: false, href: '/messages' },
  { id: 'note-03', userId: 'u-01', title: 'Report updated', body: 'Your leather notebook report was marked reunited.', kind: 'status', createdAt: '2025-02-20T09:00:00Z', read: true, href: '/my-items' },
]
