import { demoMatches } from '../data/mockData'
import type { PotentialMatch } from '../types/models'

export interface MatchingService {
  listCandidates(): PotentialMatch[]
  review(matchId: string, status: 'confirmed' | 'dismissed'): PotentialMatch | undefined
}

const reviewed = new Map<string, PotentialMatch['reviewStatus']>()
export const matchingService: MatchingService = {
  listCandidates: () => demoMatches.map((match) => ({ ...match, reviewStatus: reviewed.get(match.id) ?? match.reviewStatus })),
  review: (matchId, status) => {
    reviewed.set(matchId, status)
    const match = demoMatches.find((candidate) => candidate.id === matchId)
    return match ? { ...match, reviewStatus: status } : undefined
  },
}
