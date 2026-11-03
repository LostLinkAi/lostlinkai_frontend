import { createDemoAccount, signInToDemoAccount } from './profileService'

export interface PasswordCredentials {
  email: string
  password: string
}

export interface AuthProfile {
  displayName: string
  email: string
  phone?: string
}

export type AuthResult =
  | { ok: true; next: 'authenticated' | 'verify-email' | 'verify-phone' | 'reset-sent'; mode?: 'demo'; profile?: AuthProfile }
  | { ok: false; reason: 'not-configured' | 'rejected'; message: string }

export interface AuthService {
  loginWithPassword(credentials: PasswordCredentials): Promise<AuthResult>
  loginWithGoogle(): Promise<AuthResult>
  requestPhoneCode(phone: string): Promise<AuthResult>
  signUp(details: { displayName: string; email: string; phone?: string; password: string }): Promise<AuthResult>
  requestPasswordReset(email: string): Promise<AuthResult>
  requestEmailVerification(email: string): Promise<AuthResult>
  verifyEmail(email: string, code: string): Promise<AuthResult>
  verifyPhone(phone: string, code: string): Promise<AuthResult>
}

const unavailable: AuthResult = {
  ok: false,
  reason: 'not-configured',
  message: 'Authentication is not connected yet. No information was submitted or saved.',
}

export const authService: AuthService = {
  async loginWithPassword(credentials) {
    const profile = signInToDemoAccount(credentials.email)
    if (!profile) {
      return {
        ok: false,
        reason: 'rejected',
        message: 'No demo account with that email exists in this tab. Create an account first; demo accounts reset when the page reloads.',
      }
    }
    return { ok: true, next: 'authenticated', mode: 'demo', profile }
  },
  async loginWithGoogle() {
    return unavailable
  },
  async requestPhoneCode() {
    return unavailable
  },
  async signUp(details) {
    const profile = createDemoAccount({
      displayName: details.displayName,
      email: details.email,
      phone: details.phone ?? '',
    })
    return { ok: true, next: 'authenticated', mode: 'demo', profile }
  },
  async requestPasswordReset() {
    return unavailable
  },
  async requestEmailVerification() {
    return unavailable
  },
  async verifyEmail() {
    return unavailable
  },
  async verifyPhone() {
    return unavailable
  },
}
