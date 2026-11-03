import { Outlet, useLocation } from 'react-router-dom'
import { BrandIdentity } from './BrandIdentity'
import { FloatingNavWheel } from '../navigation/FloatingNavWheel'

export function AppLayout() {
  const location = useLocation()
  return (
    <>
      {location.pathname !== '/' && (
        <header className="topline">
          <BrandIdentity />
          <div className="demo-pill"><i /> DEMO MODE</div>
        </header>
      )}
      <main id="main-content"><Outlet /></main>
      <FloatingNavWheel />
    </>
  )
}
