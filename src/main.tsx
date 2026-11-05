import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import './styles/globals.css'

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[UNHANDLED PROMISE REJECTION in Browser]:', event.reason)
  })
  window.addEventListener('error', (event) => {
    console.error('[GLOBAL ERROR in Browser]:', event.error || event.message)
  })
}
//try again
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
