import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthLayout } from '../components/auth/AuthLayout'
import {
  BrowseItemsPage, DashboardPage, HelpCenterPage, HomePage, ItemDetailsPage,
  MatchingPage, MessagesPage, MyItemsPage, NotificationsPage, ProfilePage, ReportItemPage,
} from '../pages/Pages'
import { ForgotPasswordPage, LoginPage, ResetPasswordPage, SignupPage, VerificationPage } from '../pages/auth/AuthPages'
import { fetchProfileFromServer, isDemoSessionActive } from '../services/profileService'
import { supabase } from '../services/supabase'
import { authService } from '../services/authService'

function ProtectedAppRoutes() {
  const location = useLocation()
  const authenticated = isDemoSessionActive()

  useEffect(() => {
    if (authenticated) {
      void fetchProfileFromServer()
    }
  }, [authenticated])

  if (!authenticated) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />
  }
  return <Outlet />
}

export function AppRouter() {
  const [oauthSyncing, setOauthSyncing] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.location.hash.includes('access_token=') ||
      window.location.search.includes('code=')
    )
  })
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let mounted = true

    async function checkSupabaseSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && mounted) {
          await authService.syncGoogleSession(session.user)
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState(null, '', window.location.pathname)
          }
          if (location.pathname === '/login' || location.pathname === '/signup') {
            navigate('/dashboard', { replace: true })
          }
        }
      } catch (err) {
        console.warn('OAuth session check error:', err)
      } finally {
        if (mounted) setOauthSyncing(false)
      }
    }

    void checkSupabaseSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && mounted) {
        setOauthSyncing(true)
        await authService.syncGoogleSession(session.user)
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname)
        }
        if (mounted) {
          setOauthSyncing(false)
          if (location.pathname === '/login' || location.pathname === '/signup') {
            navigate('/dashboard', { replace: true })
          }
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [navigate, location.pathname])

  if (oauthSyncing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080d1a',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          border: '3px solid #1e293b',
          borderTopColor: '#06b6d4',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <p style={{ fontSize: '15px', color: '#94a3b8' }}>Connecting to LostLink AI via Google…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerificationPage method="email" />} />
        <Route path="/verify-phone" element={<VerificationPage method="phone" />} />
      </Route>
      <Route element={<ProtectedAppRoutes />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/browse" element={<BrowseItemsPage />} />
          <Route path="/items/:id" element={<ItemDetailsPage />} />
          <Route path="/report/:type?" element={<ReportItemPage />} />
          <Route path="/my-items" element={<MyItemsPage />} />
          <Route path="/matching" element={<MatchingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Route>
    </Routes>
  )
}
