import { useEffect, useState } from 'react'
import { EclipseScene } from './EclipseScene'

/**
 * Optional cinematic layer for the auth artwork.
 * Keep the existing illustrated scene underneath so the page remains complete
 * when video assets are unavailable, blocked, or reduced motion is requested.
 */
export function AuthBackground() {
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [motionAllowed, setMotionAllowed] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => {
      setMotionAllowed(!mediaQuery.matches)
      if (mediaQuery.matches) setVideoReady(false)
    }

    updateMotionPreference()
    mediaQuery.addEventListener?.('change', updateMotionPreference)
    return () => mediaQuery.removeEventListener?.('change', updateMotionPreference)
  }, [])

  return (
    <div className={`auth-background${videoReady ? ' auth-background--video-ready' : ''}`} aria-hidden="true">
      <EclipseScene />
      {motionAllowed && !videoFailed && (
        <video
          className="auth-background__video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
          onCanPlay={() => setVideoReady(true)}
          onError={() => {
            setVideoReady(false)
            setVideoFailed(true)
          }}
        >
          <source src="/videos/lostlink-mobile.mp4" type="video/mp4" media="(max-width: 620px)" />
          <source src="/videos/lostlink-desktop.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  )
}
