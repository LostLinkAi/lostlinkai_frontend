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
      displayName: stored.name || stored.displayName || (getStoredToken() ? '' : demoUser.displayName),
      email: stored.email || (getStoredToken() ? '' : demoUser.email),
      phone: stored.phone || '',
      avatarUrl: stored.avatar_url || stored.avatarUrl || '',
      bio: stored.bio || '',
      location: stored.location || '',
      role: stored.role || 'user'
    }
  }
  if (getStoredToken()) {
    return {
      id: '',
      displayName: '',
      email: '',
      phone: '',
      avatarUrl: '',
      bio: '',
      location: '',
      role: 'user'
    }
  }
  return {
    id: demoUser.id,
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

/**
 * Sets the active profile in memory and client storage WITHOUT syncing to the server.
 * Used during login, session restoration, or setting server-fetched user data.
 */
export function setActiveProfile(profile: Partial<AccountProfile>): AccountProfile {
  activeProfile = {
    ...activeProfile,
    ...profile,
    displayName: (profile.displayName ?? activeProfile.displayName ?? '').trim(),
    email: (profile.email ?? activeProfile.email ?? '').trim(),
    phone: (profile.phone ?? activeProfile.phone ?? '').trim(),
    avatarUrl: profile.avatarUrl !== undefined ? profile.avatarUrl : activeProfile.avatarUrl,
    bio: profile.bio !== undefined ? profile.bio : activeProfile.bio,
    location: profile.location !== undefined ? profile.location : activeProfile.location,
    role: profile.role ?? activeProfile.role ?? 'user',
  }
  setStoredUser(activeProfile)
  return getCurrentProfile()
}

/**
 * Persists profile updates to the database (if authenticated) and updates local state.
 */
export async function saveCurrentProfile(profile: Partial<AccountProfile>): Promise<AccountProfile> {
  const token = getStoredToken()

  if (token) {
    const payload: Record<string, any> = {}
    if (profile.displayName !== undefined) payload.name = profile.displayName.trim()
    if (profile.email !== undefined) payload.email = profile.email.trim()
    if (profile.phone !== undefined) payload.phone = profile.phone.trim()
    if (profile.avatarUrl !== undefined) payload.avatarUrl = profile.avatarUrl
    if (profile.bio !== undefined) payload.bio = profile.bio
    if (profile.location !== undefined) payload.location = profile.location

    const res = await api.patch<{ success: boolean; data: { user: any } }>('/users/me', payload)
    if (res.data?.user) {
      const u = res.data.user
      activeProfile = {
        id: String(u.id),
        displayName: u.name || activeProfile.displayName,
        email: u.email || activeProfile.email,
        phone: u.phone || '',
        avatarUrl: u.avatar_url || '',
        bio: u.bio || '',
        location: u.location || '',
        role: u.role || 'user'
      }
      setStoredUser(activeProfile)
      return getCurrentProfile()
    }
  }

  activeProfile = {
    ...activeProfile,
    ...profile,
    displayName: (profile.displayName ?? activeProfile.displayName).trim(),
    email: (profile.email ?? activeProfile.email).trim(),
    phone: (profile.phone ?? activeProfile.phone).trim(),
    avatarUrl: profile.avatarUrl !== undefined ? profile.avatarUrl : activeProfile.avatarUrl,
    bio: profile.bio !== undefined ? profile.bio : activeProfile.bio,
    location: profile.location !== undefined ? profile.location : activeProfile.location,
  }
  setStoredUser(activeProfile)
  return getCurrentProfile()
}

/**
 * Uploads an avatar image to the server and sets it in the user's database record.
 */
export async function uploadUserAvatar(file: File): Promise<string> {
  const form = new FormData()
  form.append('avatar', file)
  const res = await api.upload<{ success: boolean; data: { avatarUrl: string; user?: any } }>(
    '/users/me/avatar',
    form
  )
  if (res.data?.avatarUrl) {
    activeProfile.avatarUrl = res.data.avatarUrl
    if (res.data.user) {
      const u = res.data.user
      activeProfile = {
        ...activeProfile,
        id: String(u.id),
        displayName: u.name || activeProfile.displayName,
        email: u.email || activeProfile.email,
        phone: u.phone || activeProfile.phone,
        avatarUrl: u.avatar_url || activeProfile.avatarUrl,
        bio: u.bio || activeProfile.bio,
        location: u.location || activeProfile.location,
      }
    }
    setStoredUser(activeProfile)
    return res.data.avatarUrl
  }
  throw new Error('Avatar upload failed')
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
        displayName: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        avatarUrl: u.avatar_url || '',
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
  return !!getStoredToken() || localStorage.getItem('lostlink_session_active') === 'true' || sessionStorage.getItem('lostlink_session_active') === 'true'
}

export function setSessionActive(active: boolean): void {
  if (typeof window === 'undefined') return
  if (active) {
    localStorage.setItem('lostlink_session_active', 'true')
    sessionStorage.setItem('lostlink_session_active', 'true')
  } else {
    localStorage.removeItem('lostlink_session_active')
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
