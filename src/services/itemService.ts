import { demoItems } from '../data/mockData'
import type { CategoryItem, Item, LocationItem } from '../types/models'
import { api, getStoredToken, resolveApiUrl } from './api'

const storageKey = 'find-what-matters-items'

function normalizeItem(item: Item): Item {
  return {
    ...item,
    imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls.map(resolveApiUrl) : [],
  }
}

export interface ItemListParams {
  type?: 'lost' | 'found' | string
  category?: string
  location?: string
  q?: string
  sort?: string
  page?: number
  limit?: number
}

function readStoredItems(): Item[] {
  try {
    const stored = localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as Item[]) : demoItems
  } catch (error) {
    console.error('Could not read cached item data.', error)
    return demoItems
  }
}

function writeStoredItems(items: Item[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items))
  } catch (error) {
    console.error('Could not cache item data.', error)
  }
}

let itemsCache: Item[] = readStoredItems()

export interface ItemService {
  list(params?: ItemListParams): Item[]
  get(id: string): Item | undefined
  create(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>, files?: File[]): Item
  createAsync(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>, files?: File[]): Promise<Item>
  update(id: string, patch: Partial<Item>): Item | undefined
  updateAsync(id: string, patch: Partial<Item>): Promise<Item | undefined>
  deleteAsync(id: string): Promise<boolean>
  fetchList(params?: ItemListParams): Promise<Item[]>
  fetchOne(id: string): Promise<Item | undefined>
  fetchMyReports(): Promise<Item[]>
  fetchCategories(): Promise<CategoryItem[]>
  fetchLocations(): Promise<LocationItem[]>
  fetchStats(): Promise<{ itemsReported: number; potentialConnections: number; reunited: number }>
  reportConcern(id: string, reason: string): Promise<boolean>
}

export const itemService: ItemService = {
  list: (_params) => itemsCache,

  get: (id) => itemsCache.find((item) => item.id === String(id)),

  create: (input, files) => {
    const tempId = `rep-${Date.now()}`
    const item: Item = {
      ...input,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    itemsCache = [item, ...itemsCache.filter((i) => i.id !== tempId)]
    writeStoredItems(itemsCache)

    // Trigger async creation in the background
    void itemService.createAsync(input, files).catch((e) => console.warn('Background report creation failed:', e.message))
    return item
  },

  async createAsync(input, files) {
    try {
      const response = await api.post<{
        success: boolean
        data: {
          report: any
        }
      }>('/reports', {
        type: input.reportType,
        title: input.title,
        description: input.description,
        categoryName: input.category,
        locationName: input.approximateLocation,
        incidentDate: input.dateLostOrFound ? input.dateLostOrFound.split('T')[0] : null,
        identifyingFeatures: input.identifyingFeatures,
        estimatedValue: input.estimatedValue,
      })

      const rep = response.data?.report
      const realId = rep ? String(rep.id) : `rep-${Date.now()}`
      const uploadedUrls: string[] = []

      // If user provided image files, upload them
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const form = new FormData()
            form.append('image', file)
            const imgRes = await api.upload<{ success: boolean; data: { image: { url: string } } }>(
              `/reports/${realId}/images`,
              form
            )
            if (imgRes.data?.image?.url) {
              uploadedUrls.push(imgRes.data.image.url)
            }
          } catch (uploadErr) {
            console.warn('Failed to upload image file:', uploadErr)
          }
        }
      }

      const created: Item = {
        ...input,
        id: realId,
        imageUrls: uploadedUrls.length > 0 ? uploadedUrls : input.imageUrls,
        createdAt: rep?.created_at || new Date().toISOString(),
        updatedAt: rep?.updated_at || new Date().toISOString(),
      }

      itemsCache = [created, ...itemsCache.filter((i) => i.id !== realId)]
      writeStoredItems(itemsCache)
      return created
    } catch (err: any) {
      console.warn('Server report create failed, saving locally:', err.message)
      const fallbackId = `local-${Date.now()}`
      const created: Item = {
        ...input,
        id: fallbackId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      itemsCache = [created, ...itemsCache]
      writeStoredItems(itemsCache)
      return created
    }
  },

  update: (id, patch) => {
    itemsCache = itemsCache.map((item) =>
      item.id === String(id) ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
    )
    writeStoredItems(itemsCache)
    void itemService.updateAsync(id, patch).catch((e) => console.warn('Background report update failed:', e.message))
    return itemsCache.find((item) => item.id === String(id))
  },

  async updateAsync(id, patch) {
    try {
      const serverStatus = patch.status === 'open' ? 'active' : patch.status === 'archived' ? 'withdrawn' : patch.status
      const response = await api.patch<{ success: boolean; data: { report: any } }>(`/reports/${id}`, {
        ...(patch.title ? { title: patch.title } : {}),
        ...(patch.description ? { description: patch.description } : {}),
        ...(patch.status ? { status: serverStatus } : {}),
        ...(patch.identifyingFeatures ? { identifyingFeatures: patch.identifyingFeatures } : {}),
      })
      if (response.data?.report) {
        itemsCache = itemsCache.map((item) => (item.id === String(id) ? { ...item, ...patch } : item))
        writeStoredItems(itemsCache)
      }
    } catch (e: any) {
      console.warn('Server report update failed:', e.message)
    }
    return itemsCache.find((item) => item.id === String(id))
  },

  async deleteAsync(id) {
    try {
      await api.delete(`/reports/${id}`)
      itemsCache = itemsCache.filter((item) => item.id !== String(id))
      writeStoredItems(itemsCache)
      return true
    } catch {
      return false
    }
  },

  async fetchList(params) {
    try {
      const qParams = new URLSearchParams()
      if (params?.type && params.type !== 'All items') {
        const t = params.type.toLowerCase().replace(' items', '')
        if (t === 'lost' || t === 'found') qParams.set('type', t)
      }
      if (params?.category && params.category !== 'All categories') {
        qParams.set('category', params.category)
      }
      if (params?.location && params.location !== 'All locations') {
        qParams.set('location', params.location)
      }
      if (params?.q) qParams.set('q', params.q)
      if (params?.sort) qParams.set('sort', params.sort)
      if (params?.page) qParams.set('page', String(params.page))
      if (params?.limit) qParams.set('limit', String(params.limit))

      const queryString = qParams.toString() ? `?${qParams.toString()}` : ''
      const response = await api.get<{ success: boolean; data: Item[] }>(`/reports${queryString}`)

      if (response.success && Array.isArray(response.data)) {
        // Merge with cache
        const fetched = response.data.map(normalizeItem)
        const fetchedIds = new Set(fetched.map((i) => i.id))
        itemsCache = [...fetched, ...itemsCache.filter((i) => !fetchedIds.has(i.id))]
        writeStoredItems(itemsCache)
        return fetched
      }
    } catch (e: any) {
      console.warn('Failed to fetch reports from server, using local:', e.message)
    }
    return itemsCache
  },

  async fetchOne(id) {
    try {
      const response = await api.get<{ success: boolean; data: { report: Item } }>(`/reports/${id}`)
      if (response.data?.report) {
        const item = normalizeItem(response.data.report)
        itemsCache = [item, ...itemsCache.filter((i) => i.id !== String(id))]
        writeStoredItems(itemsCache)
        return item
      }
    } catch (e: any) {
      console.warn('Failed to fetch report from server:', e.message)
    }
    return itemsCache.find((i) => i.id === String(id))
  },

  async fetchMyReports() {
    if (!getStoredToken()) return itemsCache
    try {
      const response = await api.get<{ success: boolean; data: Item[] }>('/users/me/reports')
      if (response.success && Array.isArray(response.data)) {
        return response.data.map(normalizeItem)
      }
    } catch (e: any) {
      console.warn('Failed to fetch user reports:', e.message)
    }
    return itemsCache
  },

  async fetchCategories() {
    try {
      const response = await api.get<{ success: boolean; data: CategoryItem[] }>('/categories')
      if (response.success && Array.isArray(response.data)) {
        return response.data
      }
    } catch {
      // Fallback
    }
    return []
  },

  async fetchLocations() {
    try {
      const response = await api.get<{ success: boolean; data: LocationItem[] }>('/locations')
      if (response.success && Array.isArray(response.data)) {
        return response.data
      }
    } catch {
      // Fallback
    }
    return []
  },

  async fetchStats() {
    try {
      const response = await api.get<{ success: boolean; data: { itemsReported: number; potentialConnections: number; reunited: number } }>('/stats')
      if (response.success && response.data) {
        return response.data
      }
    } catch {
      // Fallback
    }
    return { itemsReported: itemsCache.length, potentialConnections: 1, reunited: 1 }
  },

  async reportConcern(id, reason) {
    try {
      await api.post(`/reports/${id}/concern`, { reason })
      return true
    } catch (e: any) {
      console.warn('Failed to submit concern:', e.message)
      return false
    }
  },
}

// Initial eager fetch in background
if (typeof window !== 'undefined') {
  void itemService.fetchList().catch(() => {})
}
