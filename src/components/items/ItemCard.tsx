import { ArrowUpRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Item } from '../../types/models'
import { ItemVisual } from './ItemVisual'

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link to={`/items/${item.id}`} className="item-card">
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
