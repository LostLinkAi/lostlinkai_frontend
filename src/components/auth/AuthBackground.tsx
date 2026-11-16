import { useEffect, useState } from 'react'
import { EclipseScene } from './EclipseScene'

const MOBILE_QUERY = '(max-width: 620px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const DESKTOP_VIDEO = '/videos/lostlink-desktop.mp4'
const MOBILE_VIDEO = '/videos/lostlink-mobile.mp4'

function mediaQueryMatches(query: string) {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(query).matches
}

/**
 * Decorative cinematic artwork for the auth panel.
 * The existing EclipseScene remains visible until the selected video can play,
 * when a video fails, or when the visitor prefers reduced motion.
 */
export function AuthBackground() {
  const [isMobile, setIsMobile] = useState(() => mediaQueryMatches(MOBILE_QUERY))
  const [motionAllowed, setMotionAllowed] = useState(() => !mediaQueryMatches(REDUCED_MOTION_QUERY))
  const [readySource, setReadySource] = useState<string | null>(null)
  const [failedSource, setFailedSource] = useState<string | null>(null)

  const videoSrc = isMobile ? MOBILE_VIDEO : DESKTOP_VIDEO
  const videoReady = readySource === videoSrc

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY)
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY)

    const updatePreferences = () => {
      setIsMobile(mobileQuery.matches)
      setMotionAllowed(!motionQuery.matches)
    }

    updatePreferences()
    mobileQuery.addEventListener?.('change', updatePreferences)
    motionQuery.addEventListener?.('change', updatePreferences)

    return () => {
      mobileQuery.removeEventListener?.('change', updatePreferences)
      motionQuery.removeEventListener?.('change', updatePreferences)
    }
  }, [])

  return (
    <div
      className={[
        'auth-background',
        videoReady ? 'auth-background--video-ready' : '',
        isMobile ? 'auth-background--mobile' : '',
      ].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <EclipseScene />
      {motionAllowed && failedSource !== videoSrc && (
        <video
          key={videoSrc}
          className="auth-background__video"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
          onCanPlay={() => setReadySource(videoSrc)}
          onError={() => {
            setReadySource(null)
            setFailedSource(videoSrc)
          }}
        />
      )}
    </div>
  )
}
