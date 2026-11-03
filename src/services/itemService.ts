import { demoItems } from '../data/mockData'
import type { Item } from '../types/models'

const storageKey = 'find-what-matters-items'
export interface ItemService {
  list(): Item[]
  get(id: string): Item | undefined
  create(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Item
  update(id: string, patch: Partial<Item>): Item | undefined
}

function readItems(): Item[] {
  try {
    const stored = localStorage.getItem(storageKey)
    return stored ? JSON.parse(stored) as Item[] : demoItems
  } catch (error) {
    console.error('Could not read demo item data.', error)
    return demoItems
  }
}

export const itemService: ItemService = {
  list: readItems,
  get: (id) => readItems().find((item) => item.id === id),
  create: (input) => {
    const item: Item = { ...input, id: `demo-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    const current = readItems()
    localStorage.setItem(storageKey, JSON.stringify([item, ...current]))
    return item
  },
  update: (id, patch) => {
    const current = readItems()
    const updated = current.map((item) => item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item)
    localStorage.setItem(storageKey, JSON.stringify(updated))
    return updated.find((item) => item.id === id)
  },
}
