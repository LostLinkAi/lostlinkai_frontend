import { demoUser } from '../data/mockData'
import { api, clearAuth, getStoredToken, getStoredUser, setStoredUser } from './api'

export interface AccountProfile {
  id?: string
  displayName: string
  email: string
  phone: string
  avatarUrl?: string
  bio?: string
  location?: string
  role?: string
}

function initProfile(): AccountProfile {
  const stored = getStoredUser<any>()
  if (stored) {
    return {
      id: String(stored.id || ''),
      displayName: stored.name || stored.displayName || demoUser.displayName,
      email: stored.email || demoUser.email,
      phone: stored.phone || '',
      avatarUrl: stored.avatar_url || stored.avatarUrl || demoUser.avatarUrl,
      bio: stored.bio || '',
      location: stored.location || '',
      role: stored.role || 'user'
    }
  }
  return {
    displayName: demoUser.displayName,
    email: demoUser.email,
    phone: '',
    avatarUrl: demoUser.avatarUrl,
    bio: '',
    location: '',
    role: 'user'
  }
}

let activeProfile: AccountProfile = initProfile()

export function getCurrentProfile(): AccountProfile {
  return { ...activeProfile }
}

export function saveCurrentProfile(profile: Partial<AccountProfile>): void {
  activeProfile = {
    ...activeProfile,
    ...profile,
    displayName: (profile.displayName ?? activeProfile.displayName).trim(),
    email: (profile.email ?? activeProfile.email).trim(),
    phone: (profile.phone ?? activeProfile.phone).trim(),
  }
  setStoredUser(activeProfile)

  // Sync to backend if authenticated
  if (getStoredToken()) {
    void api.patch('/users/me', {
      name: activeProfile.displayName,
      email: activeProfile.email,
      phone: activeProfile.phone,
      avatarUrl: activeProfile.avatarUrl,
      bio: activeProfile.bio,
      location: activeProfile.location,
    }).catch(err => {
      console.warn('Failed to sync profile update to server:', err.message)
    })
  }
}

export async function fetchProfileFromServer(): Promise<AccountProfile> {
  const token = getStoredToken()
  if (!token) return getCurrentProfile()

  try {
    const res = await api.get<{ success: boolean; data: { user: any } }>('/auth/me')
    if (res.data?.user) {
      const u = res.data.user
      activeProfile = {
        id: String(u.id),
        displayName: u.name || activeProfile.displayName,
        email: u.email || activeProfile.email,
        phone: u.phone || '',
        avatarUrl: u.avatar_url || activeProfile.avatarUrl,
        bio: u.bio || '',
        location: u.location || '',
        role: u.role || 'user'
      }
      setStoredUser(activeProfile)
    }
  } catch (e) {
    console.warn('Could not fetch server profile, using cached:', e)
  }
  return getCurrentProfile()
}

export function isDemoSessionActive(): boolean {
  if (typeof window === 'undefined') return false
  return !!getStoredToken() || sessionStorage.getItem('lostlink_session_active') === 'true'
}

export function setSessionActive(active: boolean): void {
  if (typeof window === 'undefined') return
  if (active) {
    sessionStorage.setItem('lostlink_session_active', 'true')
  } else {
    sessionStorage.removeItem('lostlink_session_active')
  }
}

export function endDemoSession(): void {
  clearAuth()
  setSessionActive(false)
  activeProfile = {
    displayName: demoUser.displayName,
    email: demoUser.email,
    phone: '',
    avatarUrl: demoUser.avatarUrl,
    bio: '',
    location: '',
    role: 'user'
  }
}

export function createDemoAccount(profile: AccountProfile): AccountProfile {
  activeProfile = { ...profile }
  setStoredUser(activeProfile)
  setSessionActive(true)
  return getCurrentProfile()
}

export function signInToDemoAccount(email: string): AccountProfile | undefined {
  if (email.trim().toLowerCase() === activeProfile.email.toLowerCase()) {
    setSessionActive(true)
    return getCurrentProfile()
  }
  return undefined
}
