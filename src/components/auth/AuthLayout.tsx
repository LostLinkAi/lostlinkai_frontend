import { ArrowRight, BrainCircuit, PackageSearch, Search } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { BrandIdentity } from '../layout/BrandIdentity'
import { EclipseScene } from './EclipseScene'
import './auth.css'

export function AuthLayout() {
  const location = useLocation()
  const isSignup = location.pathname === '/signup'
  const returnTo = new URLSearchParams(location.search).get('returnTo')
  const returnQuery = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''

  return (
    <main className="auth-shell">
      <header className="auth-topbar">
        <BrandIdentity className="auth-brand" />
        <div className="auth-topbar__action">
          <span>{isSignup ? 'Already have an account?' : 'New here?'}</span>
          <Link to={`${isSignup ? '/login' : '/signup'}${returnQuery}`}>{isSignup ? 'Sign in' : 'Create account'} <ArrowRight size={12} /></Link>
        </div>
      </header>
      <div className="auth-body">
        <section className="auth-art" aria-label="LostLink AI welcome">
          <EclipseScene />
          <div className="auth-art-copy">
            <span className="auth-kicker">A LITTLE CLOSER TO FOUND</span>
            <div className="auth-art-features">
              <div><i><PackageSearch size={15} /></i><span><b>Report lost items</b><small>Help something meaningful find its way back.</small></span></div>
              <div><i><Search size={15} /></i><span><b>Find what matters</b><small>Discover items shared by your community.</small></span></div>
              <div><i><BrainCircuit size={15} /></i><span><b>AI matching</b><small>See potential connections in the details.</small></span></div>
            </div>
          </div>
        </section>
        <section className="auth-content"><Outlet /></section>
      </div>
      <footer className="auth-footer">
        <span className="auth-footer__brand">LOSTLINK AI <i /> FIND WHAT MATTERS</span>
        <span className="auth-footer__nav">REPORT&nbsp;&nbsp; · &nbsp;&nbsp;DISCOVER&nbsp;&nbsp; · &nbsp;&nbsp;REUNITE</span>
        <span>SAFE&nbsp;&nbsp; / &nbsp;&nbsp;TRUSTED&nbsp;&nbsp; / &nbsp;&nbsp;COMMUNITY DRIVEN</span>
      </footer>
    </main>
  )
}
