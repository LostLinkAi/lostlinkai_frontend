import { useEffect, useState } from 'react'
import { EclipseScene } from './EclipseScene'

/**
 * Cinematic auth background. Respect reduced-motion by default, while
 * keeping a visible, explicit control for visitors who want the video.
 */
export function AuthBackground() {
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [motionEnabled, setMotionEnabled] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => {
      setMotionEnabled(!mediaQuery.matches)
      setVideoReady(false)
    }

    updateMotionPreference()
    mediaQuery.addEventListener?.('change', updateMotionPreference)
    return () => mediaQuery.removeEventListener?.('change', updateMotionPreference)
  }, [])

  const enableCinematicBackground = () => {
    setVideoFailed(false)
    setMotionEnabled(true)
  }

  return (
    <>
      <div className={`auth-background${videoReady ? ' auth-background--video-ready' : ''}`} aria-hidden="true">
        <EclipseScene />
        {motionEnabled && !videoFailed && (
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
      {!motionEnabled && !videoFailed && (
        <button
          className="auth-background__motion-toggle"
          type="button"
          onClick={enableCinematicBackground}
          aria-label="Play cinematic background video"
        >
          <span aria-hidden="true">▶</span> Play cinematic background
        </button>
      )}
    </>
  )
}
