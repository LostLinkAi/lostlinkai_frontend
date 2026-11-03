import { useState } from 'react'

function getInitials(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean)
  return words.slice(0, 2).map((word) => Array.from(word)[0]?.toLocaleUpperCase() ?? '').join('')
}

export function ItemVisual({ title, src, className = '' }: { title: string; src?: string; className?: string }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(src) && !imageFailed

  return (
    <div className={`item-visual ${showImage ? 'has-image' : 'has-initials'} ${className}`} aria-label={title}>
      {showImage
        ? <img src={src} alt={title} loading="lazy" onError={() => setImageFailed(true)} />
        : <span aria-hidden="true">{getInitials(title) || '?'}</span>}
    </div>
  )
}
