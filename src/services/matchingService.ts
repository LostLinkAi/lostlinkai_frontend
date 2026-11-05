import { demoMatches } from '../data/mockData'
import type { PotentialMatch } from '../types/models'
import { api, getStoredToken } from './api'

export interface MatchingService {
  listCandidates(): PotentialMatch[]
  fetchCandidates(): Promise<PotentialMatch[]>
  getMatch(id: string): Promise<PotentialMatch | undefined>
  review(matchId: string, status: 'confirmed' | 'dismissed'): PotentialMatch | undefined
  reviewAsync(matchId: string, status: 'confirmed' | 'dismissed'): Promise<PotentialMatch | undefined>
  reprocessMatches(reportId: string): Promise<boolean>
  submitRecoveryRequest(matchId: string, message: string, verificationDetails?: string): Promise<boolean>
}

let matchesCache: PotentialMatch[] = demoMatches
const reviewed = new Map<string, PotentialMatch['reviewStatus']>()

export const matchingService: MatchingService = {
  listCandidates: () => {
    return matchesCache.map((match) => ({
      ...match,
      reviewStatus: reviewed.get(match.id) ?? match.reviewStatus,
    }))
  },

  async fetchCandidates() {
    if (!getStoredToken()) return matchingService.listCandidates()
    try {
      const response = await api.get<{
        success: boolean
        data: any[]
      }>('/matches')

      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        matchesCache = response.data.map((m) => ({
          id: String(m.id),
          lostItemId: String(m.lost_report_id || m.lostItemId || ''),
          foundItemId: String(m.found_report_id || m.foundItemId || ''),
          lostTitle: m.lost_title || m.lostTitle,
          foundTitle: m.found_title || m.foundTitle,
          similarityScore: Math.round(Number(m.score || 0.85) * 100),
          matchingReasons: m.matchingReasons || [m.explanation || 'Similar item details and neighborhood area.'],
          conflictingDetails: m.conflictingDetails || ['Verify private identifying details before confirming.'],
          reviewStatus: m.status === 'confirmed_recovery' ? 'confirmed' : m.status === 'dismissed' ? 'dismissed' : 'pending',
          createdAt: m.created_at || new Date().toISOString(),
        }))
        return matchesCache
      }
    } catch (e: any) {
      console.warn('Could not fetch matches from server, using local:', e.message)
    }
    return matchingService.listCandidates()
  },

  async getMatch(id: string) {
    try {
      const response = await api.get<{ success: boolean; data: any }>(`/matches/${id}`)
      if (response.success && response.data) {
        const m = response.data
        return {
          id: String(m.id),
          lostItemId: String(m.lost_report_id),
          foundItemId: String(m.found_report_id),
          lostTitle: m.lost_title,
          foundTitle: m.found_title,
          similarityScore: Math.round(Number(m.score) * 100),
          matchingReasons: [m.explanation],
          conflictingDetails: ['Verify private details with campus/community staff.'],
          reviewStatus: m.status === 'confirmed_recovery' ? 'confirmed' : 'pending',
          createdAt: m.created_at,
        }
      }
    } catch {
      // Fallback
    }
    return matchesCache.find((m) => m.id === id)
  },

  review: (matchId, status) => {
    reviewed.set(matchId, status)
    void matchingService.reviewAsync(matchId, status).catch(() => {})
    const match = matchesCache.find((candidate) => candidate.id === matchId)
    return match ? { ...match, reviewStatus: status } : undefined
  },

  async reviewAsync(matchId, status) {
    reviewed.set(matchId, status)
    try {
      const serverStatus = status === 'dismissed' ? 'dismissed' : 'candidate'
      await api.patch(`/matches/${matchId}`, { status: serverStatus })
    } catch (e: any) {
      console.warn('Failed to update match status on server:', e.message)
    }
    const match = matchesCache.find((candidate) => candidate.id === matchId)
    return match ? { ...match, reviewStatus: status } : undefined
  },

  async reprocessMatches(reportId) {
    try {
      await api.post(`/reports/${reportId}/reprocess-matches`)
      await matchingService.fetchCandidates()
      return true
    } catch {
      return false
    }
  },

  async submitRecoveryRequest(matchId, message, verificationDetails) {
    try {
      await api.post('/recovery-requests', {
        matchId: Number(matchId) || matchId,
        message,
        verificationDetails,
      })
      return true
    } catch (e: any) {
      console.warn('Failed to submit recovery request:', e.message)
      return false
    }
  },
}

// Initial fetch in background
if (typeof window !== 'undefined') {
  void matchingService.fetchCandidates().catch(() => {})
}
