import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthLayout } from '../components/auth/AuthLayout'
import {
  BrowseItemsPage, DashboardPage, HelpCenterPage, HomePage, ItemDetailsPage,
  MatchingPage, MessagesPage, MyItemsPage, NotificationsPage, ProfilePage, ReportItemPage,
} from '../pages/Pages'
import { ForgotPasswordPage, LoginPage, ResetPasswordPage, SignupPage, VerificationPage } from '../pages/auth/AuthPages'
import { fetchProfileFromServer, isDemoSessionActive } from '../services/profileService'

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
