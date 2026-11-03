import { demoUser } from '../data/mockData'

export interface AccountProfile {
  displayName: string
  email: string
  phone: string
}

const demoAccounts = new Map<string, AccountProfile>()
let activeProfile: AccountProfile = {
  displayName: demoUser.displayName,
  email: demoUser.email,
  phone: '',
}
let demoSessionActive = false

export function getCurrentProfile(): AccountProfile {
  return { ...activeProfile }
}

export function saveCurrentProfile(profile: AccountProfile): void {
  activeProfile = {
    displayName: profile.displayName.trim(),
    email: profile.email.trim(),
    phone: profile.phone.trim(),
  }
}

export function isDemoSessionActive(): boolean {
  return demoSessionActive
}

export function endDemoSession(): void {
  demoSessionActive = false
  activeProfile = {
    displayName: demoUser.displayName,
    email: demoUser.email,
    phone: '',
  }
}

export function createDemoAccount(profile: AccountProfile): AccountProfile {
  const account = { ...profile }
  demoAccounts.set(account.email.toLowerCase(), account)
  saveCurrentProfile(account)
  demoSessionActive = true
  return getCurrentProfile()
}

export function signInToDemoAccount(email: string): AccountProfile | undefined {
  const account = demoAccounts.get(email.trim().toLowerCase())
  if (!account) return undefined
  saveCurrentProfile(account)
  demoSessionActive = true
  return getCurrentProfile()
}
