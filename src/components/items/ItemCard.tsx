import { ArrowUpRight, MapPin } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Item } from '../../types/models'
import { ItemVisual } from './ItemVisual'

export function ItemCard({ item, browseInteractive = false }: { item: Item; browseInteractive?: boolean }) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [isVisible, setIsVisible] = useState(!browseInteractive)

  useEffect(() => {
    if (!browseInteractive) return

    const card = cardRef.current
    if (!card || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setIsVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '0px 0px -24px 0px', threshold: 0.08 })

    observer.observe(card)
    return () => observer.disconnect()
  }, [browseInteractive])

  function handlePointerMove(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (!browseInteractive || event.pointerType !== 'mouse') return

    const card = event.currentTarget
    const bounds = card.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return

    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    card.style.setProperty('--card-tilt-x', `${(0.5 - y) * 7}deg`)
    card.style.setProperty('--card-tilt-y', `${(x - 0.5) * 7}deg`)
    card.style.setProperty('--card-pointer-x', `${x * 100}%`)
    card.style.setProperty('--card-pointer-y', `${y * 100}%`)
  }

  function handlePointerLeave(event: ReactPointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty('--card-tilt-x', '0deg')
    event.currentTarget.style.setProperty('--card-tilt-y', '0deg')
    event.currentTarget.style.setProperty('--card-pointer-x', '50%')
    event.currentTarget.style.setProperty('--card-pointer-y', '50%')
  }

  return (
    <Link
      ref={cardRef}
      to={`/items/${item.id}`}
      className={`item-card${browseInteractive ? ` item-card--discovery${isVisible ? ' is-visible' : ''}` : ''}`}
      onPointerMove={browseInteractive ? handlePointerMove : undefined}
      onPointerLeave={browseInteractive ? handlePointerLeave : undefined}
    >
      <div className="item-image-wrap">
        <ItemVisual title={item.title} src={item.imageUrls[0]} />
        <span className={`status-tag ${item.reportType}`}>{item.reportType === 'lost' ? 'Lost' : 'Found'}</span>
        <span className="item-open"><ArrowUpRight size={16} /></span>
      </div>
      <div className="item-card-copy">
        <div className="eyebrow">{item.category} <span>·</span> {new Date(item.dateLostOrFound).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="item-location"><MapPin size={13} /> {item.approximateLocation}</div>
      </div>
    </Link>
  )
}
