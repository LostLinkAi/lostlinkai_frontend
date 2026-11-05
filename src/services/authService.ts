import { api, clearAuth, setStoredToken, setStoredUser, ApiException } from './api'
import { endDemoSession, saveCurrentProfile, setSessionActive, signInToDemoAccount } from './profileService'

export interface PasswordCredentials {
  email: string
  password: string
}

export interface AuthProfile {
  id?: string
  displayName: string
  email: string
  phone?: string
  avatarUrl?: string
  role?: string
}

export type AuthResult =
  | { ok: true; next: 'authenticated' | 'login-redirect' | 'verify-email' | 'verify-phone' | 'reset-sent'; mode?: 'live' | 'demo'; profile?: AuthProfile; message?: string }
  | { ok: false; reason: 'not-configured' | 'rejected'; message: string }

export interface AuthService {
  loginWithPassword(credentials: PasswordCredentials): Promise<AuthResult>
  loginWithGoogle(): Promise<AuthResult>
  requestPhoneCode(phone: string): Promise<AuthResult>
  signUp(details: { displayName: string; email: string; phone?: string; password: string }): Promise<AuthResult>
  requestPasswordReset(email: string): Promise<AuthResult>
  resetPassword(details: { email: string; code: string; newPassword: string }): Promise<AuthResult>
  requestEmailVerification(email: string): Promise<AuthResult>
  verifyEmail(email: string, code: string): Promise<AuthResult>
  verifyPhone(phone: string, code: string): Promise<AuthResult>
  logout(): Promise<void>
}

export const authService: AuthService = {
  async loginWithPassword(credentials) {
    try {
      const response = await api.post<{
        success: boolean
        data: {
          accessToken: string
          user: {
            id: number | string
            name: string
            email: string
            role: string
            phone?: string
            avatar_url?: string
          }
        }
      }>('/auth/login', {
        email: credentials.email.trim(),
        password: credentials.password,
      })

      if (response.success && response.data) {
        const { accessToken, user } = response.data
        setStoredToken(accessToken)
        setStoredUser(user)
        setSessionActive(true)

        const profile: AuthProfile = {
          id: String(user.id),
          displayName: user.name,
          email: user.email,
          phone: user.phone || '',
          avatarUrl: user.avatar_url || '',
          role: user.role,
        }

        saveCurrentProfile(profile)
        return { ok: true, next: 'authenticated', mode: 'live', profile }
      }
    } catch (err: any) {
      if (err instanceof ApiException) {
        return {
          ok: false,
          reason: 'rejected',
          message: err.message || 'Invalid email or password.',
        }
      }
      console.warn('Backend login network error, checking demo session:', err.message)
      const profile = signInToDemoAccount(credentials.email)
      if (profile) {
        return { ok: true, next: 'authenticated', mode: 'demo', profile }
      }
      return {
        ok: false,
        reason: 'rejected',
        message: err.message || 'Unable to connect to authentication server.',
      }
    }

    return {
      ok: false,
      reason: 'rejected',
      message: 'Sign in could not be completed.',
    }
  },

  async loginWithGoogle() {
    return {
      ok: false,
      reason: 'not-configured',
      message: 'Google Sign-In is not configured yet. Please sign in with email and password.',
    }
  },

  async requestPhoneCode(_phone: string) {
    return {
      ok: false,
      reason: 'not-configured',
      message: 'SMS verification is not configured on this server. Please use email and password sign in.',
    }
  },

  async signUp(details) {
    try {
      const response = await api.post<{
        success: boolean
        message: string
        data: {
          user: {
            id: number | string
            name: string
            email: string
            role: string
            phone?: string
          }
        }
      }>('/auth/register', {
        name: details.displayName.trim(),
        email: details.email.trim(),
        password: details.password,
      })

      if (response.success) {
        return {
          ok: true,
          next: 'login-redirect',
          mode: 'live',
          message: response.message || 'Account created successfully! A confirmation email has been sent to your address.',
          profile: {
            displayName: details.displayName,
            email: details.email,
            phone: details.phone || '',
          },
        }
      }
    } catch (err: any) {
      if (err instanceof ApiException) {
        return {
          ok: false,
          reason: 'rejected',
          message: err.message || 'Account creation could not be completed.',
        }
      }
      return {
        ok: false,
        reason: 'rejected',
        message: err.message || 'Could not connect to authentication server. Please ensure server is running.',
      }
    }

    return {
      ok: false,
      reason: 'rejected',
      message: 'Account creation could not be completed.',
    }
  },

  async requestPasswordReset(email: string) {
    try {
      await api.post<{ success: boolean; message: string }>('/auth/forgot-password', {
        email: email.trim(),
      })
      return {
        ok: true,
        next: 'reset-sent',
        profile: { displayName: '', email },
      }
    } catch (err: any) {
      if (err instanceof ApiException) {
        return { ok: false, reason: 'rejected', message: err.message }
      }
      return {
        ok: true,
        next: 'reset-sent',
        profile: { displayName: '', email },
      }
    }
  },

  async resetPassword({ email, code, newPassword }: { email: string; code: string; newPassword: string }) {
    try {
      await api.post<{ success: boolean; message: string }>('/auth/reset-password', {
        email: email.trim(),
        token: code.trim(),
        newPassword,
      })
      return { ok: true, next: 'authenticated' }
    } catch (err: any) {
      return { ok: false, reason: 'rejected', message: err.message || 'Password reset failed.' }
    }
  },

  async requestEmailVerification(email: string) {
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      return { ok: true, next: 'verify-email' }
    } catch {
      return { ok: true, next: 'verify-email' }
    }
  },

  async verifyEmail(email: string, code: string) {
    try {
      await api.post('/auth/verify-email', { email: email.trim(), code: code.trim() })
      return { ok: true, next: 'authenticated' }
    } catch (err: any) {
      return { ok: false, reason: 'rejected', message: err.message || 'Verification could not be completed.' }
    }
  },

  async verifyPhone(_phone: string, _code: string) {
    return {
      ok: false,
      reason: 'not-configured',
      message: 'Phone verification is not configured.',
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth()
      endDemoSession()
    }
  },
}
