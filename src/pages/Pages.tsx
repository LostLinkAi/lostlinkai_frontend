import {
  ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown,
  CircleHelp, Clock3, Eye, FileText, Filter, HeartHandshake, LockKeyhole, MapPin,
  MessageCircle, Plus, Search, Send, ShieldCheck, Sparkles, Upload, X,
} from 'lucide-react'
import { Calendar } from '@heroui/react'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ItemCard } from '../components/items/ItemCard'
import { ItemVisual } from '../components/items/ItemVisual'
import { BrandIdentity } from '../components/layout/BrandIdentity'
import { SectionHeading } from '../components/ui/SectionHeading'
import { demoItems, demoMatches, demoNotifications, demoUser } from '../data/mockData'
import { itemService } from '../services/itemService'
import { messageService } from '../services/messageService'
import { matchingService } from '../services/matchingService'
import { endDemoSession, getCurrentProfile, isDemoSessionActive, saveCurrentProfile } from '../services/profileService'
import type { ItemCategory, ReportType } from '../types/models'

const categories: ItemCategory[] = ['Electronics', 'Bags', 'Documents', 'Keys', 'Clothing', 'Accessories', 'Pets', 'Vehicles', 'Other']
const locations = ['All locations', ...new Set(demoItems.map((item) => item.approximateLocation.split(' · ')[0]))]
const avatarChoices = ['https://i.pravatar.cc/120?img=12', 'https://i.pravatar.cc/120?img=47', 'https://i.pravatar.cc/120?img=32', 'https://i.pravatar.cc/120?img=5']

function PageIntro({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return <div className="page-intro"><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{text}</p></div>
}
function ConcernButton() {
  const [reported, setReported] = useState(false)
  return <button className="concern-button" onClick={() => setReported(true)}>{reported ? 'Thank you — this listing is flagged for review.' : 'Report a concern'}</button>
}

export function HomePage() {
  const items = itemService.list()
  return (
    <div className="home-page">
      <header className="home-top"><BrandIdentity /><div className="home-header-actions"><Link to="/login" className="home-signin-link">Sign in</Link><span className="demo-pill"><i /> COMMUNITY DEMO</span></div></header>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> A little closer to found</div>
          <h1>Lost something?<br /><em>We’ll help you</em><br />find it.</h1>
          <p>Good things find their way back. Tell your community what’s missing, or help someone reconnect with what matters.</p>
          <div className="hero-actions"><Link to="/report/lost" className="button button-amber">Report an item <ArrowUpRight size={16} /></Link><Link to="/browse" className="button button-ghost">Browse items <ArrowRight size={16} /></Link></div>
          <div className="hero-proof"><div className="avatar-stack"><img src={avatarChoices[0]} alt="" /><img src={avatarChoices[1]} alt="" /><img src={avatarChoices[2]} alt="" /></div><span><strong>Neighbors looking out</strong><br />for one another, every day.</span></div>
        </div>
        <div className="hero-art">
          <div className="art-grid" />
          <div className="art-index">FIELD NOTE&nbsp; / &nbsp;001</div>
          <div className="hero-photo"><img src="/images/lostlink-ai-logo.webp" alt="LostLink AI — Find What Matters logo" /></div>
          <div className="photo-caption"><span className="caption-dot" /> STORIES FIND THEIR WAY HOME <span>01 — 03</span></div>
          <div className="art-orbit orbit-a" /><div className="art-orbit orbit-b" />
          <div className="match-note"><Sparkles size={15} /><span><b>We will</b><br />Find it.</span><span className="match-percent">100%</span></div>
          <div className="hero-coordinate">40°43′ N &nbsp; 73°59′ W</div>
        </div>
        <div className="hero-side-label">REPORT CLEARLY <span>—</span> DISCOVER INTELLIGENTLY <span>—</span> REUNITE SAFELY</div>
      </section>
      <section className="home-stats">
        <div className="stats-note"><span className="eyebrow">A community in motion</span><p>Every report is a small act of hope.</p></div>
        <div><strong>2,480</strong><span>items reported <i>DEMO DATA</i></span></div>
        <div><strong>816</strong><span>potential connections <i>DEMO DATA</i></span></div>
        <div><strong>392</strong><span>things back where they belong <i>DEMO DATA</i></span></div>
      </section>
      <section className="how-section">
        <div className="how-heading"><span className="eyebrow">A simple way back</span><h2>Small details.<br /><em>Meaningful reunions.</em></h2><p>It starts with a good description and a community ready to help.</p><Link to="/help" className="text-link">How it works <ArrowRight size={15} /></Link></div>
        <div className="steps-list"><article><span>01</span><div><h3>Tell us what’s missing</h3><p>Add the details only you would know. Your contact information stays private.</p></div><FileText /></article><article><span>02</span><div><h3>We look for the little things</h3><p>Demo matching compares item details and highlights possible connections for human review.</p></div><Sparkles /></article><article><span>03</span><div><h3>Make a safe connection</h3><p>Message through the platform, verify ownership, and arrange a thoughtful return.</p></div><HeartHandshake /></article></div>
      </section>
      <section className="home-feature"><div className="feature-visual"><div className="feature-ring"><div className="ring-point point-one" /><div className="ring-point point-two" /><div className="ring-core"><Sparkles size={26} /></div></div><span className="feature-coordinate">DETAILS IN / SIGNAL OUT</span></div><div className="feature-copy"><span className="eyebrow">A second set of eyes</span><h2>Sometimes a match is hiding in the details.</h2><p>Our simulated matching view brings similar reports together — from category and timing to the small identifying details that matter. Every suggestion is an invitation to look closer, never a verdict.</p><Link to="/matching" className="text-link">Explore matching <ArrowRight size={15} /></Link><div className="feature-disclaimer"><LockKeyhole size={14} /> A match is a lead, not proof. People make the final call.</div></div></section>
      <section className="community-band"><div><ShieldCheck /><span className="eyebrow">Care comes first</span><h2>Helpful by nature.<br /><em>Private by design.</em></h2></div><p>Keep exact addresses and personal contact details private. Share a detail only when you’re ready. A safe return begins with a careful conversation.</p><Link to="/help" className="button button-outline">Our safety guide <ArrowUpRight size={15} /></Link></section>
      <div className="home-preview"><div className="section-heading"><div><span className="eyebrow">From around the neighborhood</span><h2>Recently reported</h2></div><Link to="/browse" className="text-link">See all items <ArrowRight size={15} /></Link></div><div className="item-grid">{items.slice(0, 3).map((item) => <ItemCard key={item.id} item={item} />)}</div></div>
      <footer className="site-footer"><BrandIdentity /><span>For the things — and people — worth finding.</span><nav><Link to="/help">Help</Link><a href="mailto:hello@findwhatmatters.example">Contact</a><Link to="/help">Privacy</Link><Link to="/help">Terms</Link></nav><small>© 2025 LostLink AI · Demo experience</small></footer>
    </div>
  )
}

export function DashboardPage() {
  const own = itemService.list().filter((item) => item.reporterId === demoUser.id)
  return <div className="page-shell dashboard-page">
    <div className="welcome-row"><div className="avatar-large"><img src={demoUser.avatarUrl} alt="Alex Morgan" /></div><div><span className="eyebrow">TUESDAY, FEBRUARY 25</span><h1>Good morning, Alex<span className="amber">.</span></h1><p>Here’s what’s happening around your reports.</p></div><span className="demo-pill"><i /> DEMO MODE</span></div>
    <div className="metric-grid"><Metric label="Lost reports" value="02" detail="+ 1 this month" icon={<CircleHelp />} /><Metric label="Found reports" value="01" detail="In your neighborhood" icon={<CheckCircle2 />} /><Metric label="Potential matches" value="01" detail="Ready for your review" icon={<Sparkles />} accent /><Metric label="Reunited" value="01" detail="A good ending" icon={<HeartHandshake />} /></div>
    <div className="dashboard-columns"><section className="panel timeline-panel"><div className="panel-heading"><div><span className="eyebrow">Your corner of the community</span><h2>Recent activity</h2></div><Link to="/notifications" className="text-link">All activity <ArrowRight size={14} /></Link></div><div className="timeline"><Timeline icon={<Sparkles />} title="A possible camera match appeared" detail="Riverside Market · 4 hours ago" color="amber" /><Timeline icon={<MessageCircle />} title="Jordan sent you a message" detail="About a vintage camera · 5 hours ago" color="cyan" /><Timeline icon={<Check />} title="Your notebook found its way home" detail="Resolved · Yesterday" color="green" /></div></section>
      <section className="panel quick-panel"><span className="eyebrow">Start with a small step</span><h2>Something missing<br />or found?</h2><p>Your details can make all the difference.</p><Link to="/report/lost" className="quick-action"><span><CircleHelp size={18} /> Report something lost</span><ArrowUpRight size={16} /></Link><Link to="/report/found" className="quick-action"><span><CheckCircle2 size={18} /> Register something found</span><ArrowUpRight size={16} /></Link></section></div>
    <div className="dashboard-bottom"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">Worth a closer look</span><h2>Latest suggestion</h2></div><span className="score-badge">87% SIMILAR</span></div><MatchMini /></section><section className="panel"><div className="panel-heading"><div><span className="eyebrow">Your reports</span><h2>Recently updated</h2></div><Link to="/my-items" className="text-link">Manage <ArrowRight size={14} /></Link></div><div className="compact-list">{own.slice(0, 2).map((item) => <Link to={`/items/${item.id}`} key={item.id}><span className={`tiny-status ${item.status}`} /><span><b>{item.title}</b><small>{item.status === 'resolved' ? 'Reunited' : 'Waiting for a connection'}</small></span><ArrowRight size={14} /></Link>)}</div></section></div>
  </div>
}
function Metric({ label, value, detail, icon, accent }: { label: string; value: string; detail: string; icon: React.ReactNode; accent?: boolean }) { return <div className={`metric-card ${accent ? 'metric-accent' : ''}`}><span className="metric-icon">{icon}</span><span className="eyebrow">{label}</span><strong>{value}</strong><small>{detail}</small></div> }
function Timeline({ icon, title, detail, color }: { icon: React.ReactNode; title: string; detail: string; color: string }) { return <div className="timeline-row"><span className={`timeline-icon ${color}`}>{icon}</span><span><b>{title}</b><small>{detail}</small></span></div> }

export function BrowseItemsPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All items')
  const [category, setCategory] = useState('All categories')
  const [location, setLocation] = useState('All locations')
  const [sort, setSort] = useState('Newest first')
  const [limit, setLimit] = useState(6)
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    const records = itemService.list().filter((item) => {
      const matchesText = `${item.title} ${item.description} ${item.category} ${item.approximateLocation} ${item.identifyingFeatures.join(' ')}`.toLowerCase().includes(text)
      return matchesText && (type === 'All items' || item.reportType === type.toLowerCase().replace(' items', '')) && (category === 'All categories' || item.category === category) && (location === 'All locations' || item.approximateLocation.startsWith(location))
    })
    return records.sort((a, b) => sort === 'Oldest first' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt))
  }, [query, type, category, location, sort])
  return <div className="page-shell"><SectionHeading eyebrow="The neighborhood lost & found" title="Browse items" description="A familiar detail can be the beginning of a reunion." action={<Link className="button button-amber" to="/report/lost"><Plus size={16} /> Report an item</Link>} />
    <div className="browse-tools"><label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, details, places…" /><kbd>⌘ K</kbd></label><div className="tabs">{['All items', 'Lost items', 'Found items'].map((tab) => <button key={tab} onClick={() => setType(tab)} className={type === tab ? 'selected' : ''}>{tab}</button>)}</div></div>
    <div className="filter-row"><span><Filter size={14} /> FILTER BY</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{categories.map((cat) => <option key={cat}>{cat}</option>)}</select><select value={location} onChange={(event) => setLocation(event.target.value)}>{locations.map((place) => <option key={place}>{place}</option>)}</select><select aria-label="Sort items" value={sort} onChange={(event) => setSort(event.target.value)}><option>Newest first</option><option>Oldest first</option></select><span className="results-count">{filtered.length} listings</span></div>
    {filtered.length ? <><div className="item-grid">{filtered.slice(0, limit).map((item) => <ItemCard key={item.id} item={item} />)}</div>{filtered.length > limit && <button className="button button-outline load-more" onClick={() => setLimit((count) => count + 6)}>Load more listings <ArrowDownRight size={16} /></button>}</> : <div className="empty-state"><Search size={24} /><h2>Nothing here just yet</h2><p>Try a different search or clear a filter to explore more listings.</p><button className="text-link" onClick={() => { setQuery(''); setType('All items'); setCategory('All categories'); setLocation('All locations') }}>Clear all filters <X size={15} /></button></div>}
    <p className="demo-note"><i /> Community listings are simulated demo data.</p>
  </div>
}

export function ItemDetailsPage() {
  const { id = '' } = useParams()
  const item = itemService.get(id)
  if (!item) return <div className="page-shell"><div className="empty-state"><h1>That item isn’t here</h1><p>The listing may have been removed or the link may be incorrect.</p><Link className="button button-amber" to="/browse">Back to browsing</Link></div></div>
  const canMessage = messageService.canMessageAboutItem(item.id, demoUser.id)
  return <div className="page-shell details-page"><Link to="/browse" className="back-link"><ArrowLeft size={15} /> Back to items</Link><div className="detail-layout"><div className="detail-media"><ItemVisual title={item.title} src={item.imageUrls[0]} />{item.imageUrls.length > 0 && <div className="image-index">01 / {String(item.imageUrls.length).padStart(2, '0')}</div>}<div className="detail-caption">COMMUNITY LISTING <span>·</span> #{item.id.toUpperCase()}</div></div><div className="detail-copy"><div className="detail-tags"><span className={`status-tag ${item.reportType}`}>{item.reportType}</span><span>{item.category}</span></div><h1>{item.title}</h1><p className="detail-description">{item.description}</p><div className="detail-facts"><div><span>WHEN</span><b><Clock3 size={15} /> {new Date(item.dateLostOrFound).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</b></div><div><span>WHERE</span><b><MapPin size={15} /> {item.approximateLocation}</b><small>Approximate area shared for privacy</small></div></div><section className="identify-box"><span className="eyebrow">DETAILS THAT MAY HELP IDENTIFY IT</span>{item.identifyingFeatures.length ? <ul>{item.identifyingFeatures.map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul> : <p>No additional identifying details yet.</p>}</section><div className="reporter"><img src={demoUser.avatarUrl} alt="" /><span><small>SHARED BY</small><b>Community member</b></span><span className="verified"><ShieldCheck size={15} /> Community</span></div>{canMessage ? <><Link className="button button-amber full-button" to="/messages">Message about this item <MessageCircle size={16} /></Link><p className="privacy-hint"><LockKeyhole size={14} /> Private conversation for people connected to this potential match.</p></> : <p className="private-contact-note"><LockKeyhole size={14} /> Messaging is available only to the people involved in a related lost-and-found match.</p>}<ConcernButton /></div></div>
    <section className="similar-section"><div className="section-heading"><div><span className="eyebrow">Keep looking</span><h2>Nearby in the community</h2></div></div><div className="item-grid">{itemService.list().filter((entry) => entry.id !== item.id).slice(0, 3).map((entry) => <ItemCard key={entry.id} item={entry} />)}</div></section>
  </div>
}

export function ReportItemPage() {
  const { type: routeType } = useParams()
  const navigate = useNavigate()
  const [type, setType] = useState<ReportType>(routeType === 'found' ? 'found' : 'lost')
  const [step, setStep] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [details, setDetails] = useState({ title: '', category: '', description: '', identifyingFeatures: '', date: '', location: '', value: '', contact: 'in-app' })
  const prompts = type === 'lost' ? ['What did you lose?', 'Add the details you remember.', 'Where and when did you last see it?', 'How should someone reach you?'] : ['What did you find?', 'Add details that could help identify it.', 'Where and when did you find it?', 'How can the owner reach you?']
  useEffect(() => setType(routeType === 'found' ? 'found' : 'lost'), [routeType])
  function addFiles(selected: FileList | null) {
    if (!selected) return
    const valid = Array.from(selected).filter((file) => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024)
    if (valid.length !== selected.length) setError('Choose image files smaller than 5 MB each.')
    const next = [...files, ...valid].slice(0, 5)
    setFiles(next)
    setPreviews(next.map((file) => URL.createObjectURL(file)))
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!details.title || !details.category || !details.description || !details.date || !details.location) {
      setError('Please complete the item, description, date, and approximate location before submitting.')
      setStep(!details.title || !details.category || !details.description ? 0 : 2)
      return
    }
    const created = itemService.create({
      reporterId: demoUser.id, reportType: type, title: details.title, category: details.category as ItemCategory,
      description: details.description, identifyingFeatures: details.identifyingFeatures.split(',').map((text) => text.trim()).filter(Boolean),
      imageUrls: previews,
      dateLostOrFound: details.date, approximateLocation: details.location, status: 'open',
      ...(details.value ? { estimatedValue: Number(details.value) } : {}),
    })
    setSubmitted(true)
    window.setTimeout(() => navigate(`/items/${created.id}`), 1200)
  }
  if (submitted) return <div className="page-shell"><div className="success-state"><span><Check size={28} /></span><div className="eyebrow">REPORT SAVED IN THIS DEMO</div><h1>Your details are in good hands.</h1><p>This listing is saved in this browser only. No photographs were uploaded to a server.</p><Link to="/my-items" className="button button-amber">View my reports <ArrowRight size={16} /></Link></div></div>
  return <div className="page-shell report-page"><Link to="/dashboard" className="back-link"><ArrowLeft size={15} /> Back to dashboard</Link><div className="report-header"><span className="eyebrow">A few details can change everything</span><h1>{type === 'lost' ? 'Let’s help it find its way back.' : 'Let’s help someone find what matters.'}</h1><p>Share what you know. You can always update your report later.</p></div><div className="report-layout"><aside className="step-nav">{['Item details', 'Photos & clues', 'Place & date', 'Contact', 'Review'].map((label, index) => <button key={label} onClick={() => { setError(''); setStep(index) }} className={step === index ? 'active' : step < index ? '' : 'complete'}><span>{step > index ? <Check size={13} /> : `0${index + 1}`}</span>{label}</button>)}<div className="privacy-card"><LockKeyhole size={17} /><b>Your details stay yours.</b><p>Personal contact details are never shown publicly. Use approximate locations only.</p></div></aside><form className="report-form" onSubmit={submit}><div className="form-step-head"><div><span className="eyebrow">STEP 0{step + 1} / 05</span><h2>{prompts[Math.min(step, 3)]}</h2></div></div>
      {step === 0 && <div className="form-fields"><label>What are you reporting?<div className="segmented"><button type="button" onClick={() => setType('lost')} className={type === 'lost' ? 'active' : ''}>I lost something</button><button type="button" onClick={() => setType('found')} className={type === 'found' ? 'active' : ''}>I found something</button></div></label><label>Item name<input required placeholder="e.g. Navy canvas backpack" value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} /></label><label>Category<select required value={details.category} onChange={(e) => setDetails({ ...details, category: e.target.value })}><option value="">Choose a category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="wide-field">Describe it<textarea required rows={4} placeholder="Shape, color, condition, or anything that makes it unique…" value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} /></label></div>}
      {step === 1 && <div className="form-fields"><label className="wide-field">Photographs <span className="field-note">Optional · up to 5 images · 5 MB max each. Preview stays in this browser.</span><div className="upload-box" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }}><Upload size={23} /><b>Drop images here, or choose files</b><small>JPG, PNG or WEBP · never uploaded in this demo</small><input aria-label="Choose photographs" type="file" accept="image/*" multiple onChange={(event) => addFiles(event.target.files)} /></div></label>{previews.length > 0 && <div className="preview-grid">{previews.map((src, i) => <div key={src}><img src={src} alt={`Selected item preview ${i + 1}`} /><button type="button" aria-label={`Remove image ${i + 1}`} onClick={() => { setFiles(files.filter((_, index) => index !== i)); setPreviews(previews.filter((_, index) => index !== i)) }}><X size={13} /></button></div>)}</div>}<label className="wide-field">Identifying features <span className="field-note">Use details someone else might not know; separate with commas.</span><textarea rows={3} placeholder="Small mark, initials, contents…" value={details.identifyingFeatures} onChange={(e) => setDetails({ ...details, identifyingFeatures: e.target.value })} /></label></div>}
      {step === 2 && <div className="form-fields"><label>Approximate location<input required placeholder="e.g. Northside Library" value={details.location} onChange={(e) => setDetails({ ...details, location: e.target.value })} /><span className="field-note">Please don’t enter a home address or exact private location.</span></label><div className="date-calendar-field"><span className="date-calendar-label" id="report-date-label">{type === 'lost' ? 'Date last seen' : 'Date found'}<span className="field-note">Choose the date from the calendar below.</span></span><Calendar aria-labelledby="report-date-label" className="report-calendar" value={details.date ? parseDate(details.date) : null} onChange={(date) => setDetails({ ...details, date: date?.toString() ?? '' })} maxValue={today(getLocalTimeZone())}><Calendar.Header className="report-calendar-header"><Calendar.NavButton slot="previous" aria-label="Previous month" /><Calendar.Heading /><Calendar.NavButton slot="next" aria-label="Next month" /></Calendar.Header><Calendar.Grid className="report-calendar-grid"><Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader><Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody></Calendar.Grid></Calendar>{details.date && <span className="selected-date" role="status"><Check size={13} /> Selected: {new Date(`${details.date}T12:00:00`).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}</div><label>Estimated value <span className="field-note">Optional</span><input type="number" min="0" placeholder="0" value={details.value} onChange={(e) => setDetails({ ...details, value: e.target.value })} /></label></div>}
      {step === 3 && <div className="form-fields"><label>Preferred way to connect<select value={details.contact} onChange={(e) => setDetails({ ...details, contact: e.target.value })}><option value="in-app">Private in-app messages</option><option value="platform">Platform notifications</option></select></label><div className="privacy-callout"><ShieldCheck size={19} /><p><b>Your privacy matters.</b><br />Your email and phone number will not appear on the public listing. Keep the conversation here until you feel comfortable.</p></div></div>}
      {step === 4 && <div className="review-card"><span className={`status-tag ${type}`}>{type}</span><h3>{details.title || 'Your item name'}</h3><p>{details.description || 'Your description will appear here.'}</p><div><span>{details.category || 'Category pending'}</span><span>{details.location || 'Location pending'}</span><span>{details.date || 'Date pending'}</span></div><small>DEMO SUBMISSION · Photos stay on this device only</small></div>}
      {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions">{step > 0 && <button type="button" className="button button-ghost" onClick={() => { setStep(step - 1); setError('') }}><ArrowLeft size={15} /> Previous</button>}{step < 4 ? <button type="button" className="button button-amber" onClick={() => { setStep(step + 1); setError('') }}>Continue <ArrowRight size={15} /></button> : <button type="submit" className="button button-amber">Submit demo report <Check size={15} /></button>}</div></form></div></div>
}

function MatchMini() {
  const lost = demoItems.find((item) => item.id === demoMatches[0].lostItemId)!
  const found = demoItems.find((item) => item.id === demoMatches[0].foundItemId)!
  return <div className="mini-match"><div className="mini-match-images"><ItemVisual title={lost.title} src={lost.imageUrls[0]} /><span><Sparkles size={14} /></span><ItemVisual title={found.title} src={found.imageUrls[0]} /></div><div><b>{lost.title} <span>↔</span> {found.title}</b><small>Similar details · same neighborhood · one day apart</small></div><Link to="/matching" aria-label="Review potential match"><ArrowUpRight size={16} /></Link></div>
}

export function MyItemsPage() {
  const [tab, setTab] = useState('All reports')
  const [refresh, setRefresh] = useState(0)
  const mine = itemService.list().filter((item) => item.reporterId === demoUser.id)
  void refresh
  const records = mine.filter((item) => tab === 'All reports' || tab === 'Lost' && item.reportType === 'lost' || tab === 'Found' && item.reportType === 'found' || tab === 'Resolved' && item.status === 'resolved')
  return <div className="page-shell"><SectionHeading eyebrow="YOUR REPORTS, YOUR WAY" title="My items" description="Keep track of what you’ve reported and update details as things change." action={<Link className="button button-amber" to="/report/lost"><Plus size={16} /> New report</Link>} /><div className="tabs item-tabs">{['All reports', 'Lost', 'Found', 'Resolved'].map((label) => <button key={label} className={tab === label ? 'selected' : ''} onClick={() => setTab(label)}>{label}</button>)}</div>{records.length ? <div className="manage-list">{records.map((item) => <div className="manage-row" key={item.id}><ItemVisual title={item.title} src={item.imageUrls[0]} /><span className={`status-tag ${item.reportType}`}>{item.reportType}</span><div className="manage-info"><Link to={`/items/${item.id}`}><b>{item.title}</b></Link><small>{item.approximateLocation} · {new Date(item.dateLostOrFound).toLocaleDateString()}</small></div><span className={`report-state ${item.status}`}>{item.status === 'resolved' ? 'Reunited' : item.status === 'archived' ? 'Archived' : 'Active'}</span><Link to={`/items/${item.id}`} className="text-link">Details <ArrowUpRight size={14} /></Link><button className="icon-action" aria-label={item.status === 'archived' ? 'Restore report' : 'Archive report'} onClick={() => { itemService.update(item.id, { status: item.status === 'archived' ? 'open' : 'archived' }); setRefresh(refresh + 1) }}><Eye size={16} /></button></div>)}</div> : <div className="empty-state"><h2>No reports in this view</h2><p>When you submit a report, it will be available here.</p><Link to="/report/lost" className="button button-amber">Create a report</Link></div>}<div className="demo-note"><i /> Demo reports are saved in this browser. Changes are local to this device.</div></div>
}

export function MatchingPage() {
  const [status, setStatus] = useState('')
  const match = matchingService.listCandidates()[0]
  const lost = itemService.get(match.lostItemId)!
  const found = itemService.get(match.foundItemId)!
  return <div className="page-shell matching-page"><PageIntro kicker="A second set of eyes · simulated results" title="A possible connection." text="These details may belong in the same story. Take a closer look, then decide what feels right." />  <div className="match-alert"><Sparkles size={16} /><span><b>A new possibility surfaced.</b> Two reports share a few notable details.</span><span>DEMO SUGGESTION</span></div><div className="match-compare"><div className="compare-item"><div className="compare-image"><ItemVisual title={lost.title} src={lost.imageUrls[0]} /><span className="status-tag lost">LOST REPORT</span></div><span className="eyebrow">REPORTED BY ALEX · FEB 19</span><h2>{lost.title}</h2><p>{lost.description}</p><div className="compare-tags">{lost.identifyingFeatures.map((feature) => <span key={feature}>{feature}</span>)}</div></div><div className="match-score"><div className="score-ring"><span>87<small>%</small></span></div><span className="eyebrow">SIMILARITY<br />ESTIMATE</span><div className="signal-line"><i /><i /><i /></div></div><div className="compare-item"><div className="compare-image"><ItemVisual title={found.title} src={found.imageUrls[0]} /><span className="status-tag found">FOUND REPORT</span></div><span className="eyebrow">COMMUNITY MEMBER · FEB 20</span><h2>{found.title}</h2><p>{found.description}</p><div className="compare-tags">{found.identifyingFeatures.map((feature) => <span key={feature}>{feature}</span>)}</div></div></div>
    <div className="match-analysis"><section><span className="eyebrow">WHAT LINES UP</span>{match.matchingReasons.map((reason) => <p key={reason}><CheckCircle2 size={15} /> {reason}</p>)}</section><section className="conflict"><span className="eyebrow">WHAT STILL NEEDS CHECKING</span>{match.conflictingDetails.map((reason) => <p key={reason}><CircleHelp size={15} /> {reason}</p>)}</section></div><div className="confidence-note"><ShieldCheck size={17} /><p><b>A similarity score is an estimate, not proof of ownership.</b><br />Ask about a detail that isn’t in the listing before arranging a return. Keep exact personal details private.</p></div>{status && <p className="success-inline" role="status"><Check size={15} /> {status}</p>}<div className="match-actions"><button className="button button-outline" onClick={() => { matchingService.review(match.id, 'dismissed'); setStatus('Suggestion dismissed. You can revisit it later.') }}>Not a match</button>{messageService.canMessageAboutItem(found.id, demoUser.id) && <Link to="/messages" className="button button-ghost"><MessageCircle size={16} /> Ask a question</Link>}<button className="button button-amber" onClick={() => { matchingService.review(match.id, 'confirmed'); setStatus('Saved for a careful, human review. No ownership was confirmed.') }}>Review this match <ArrowRight size={15} /></button></div></div>
}

export function ProfilePage() {
  const profile = getCurrentProfile()
  const demoSession = isDemoSessionActive()
  const [avatar, setAvatar] = useState(() => localStorage.getItem('fwm-avatar') || demoUser.avatarUrl)
  const [name, setName] = useState(() => demoSession ? profile.displayName : localStorage.getItem('fwm-display-name') || profile.displayName)
  const [email, setEmail] = useState(profile.email)
  const [phone, setPhone] = useState(profile.phone)
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState('')
  function save(event: FormEvent) {
    event.preventDefault()
    if (!preview) localStorage.setItem('fwm-avatar', avatar)
    localStorage.setItem('fwm-display-name', name)
    saveCurrentProfile({ displayName: name, email, phone })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }
  return (
    <div className="page-shell profile-page">
      <SectionHeading eyebrow="A LITTLE ABOUT YOU" title="Your profile" description="Make your space feel like yours. Your contact details stay private." />
      <form onSubmit={save}>
        <div className="profile-layout">
          <section className="panel profile-avatar-panel">
            <span className="eyebrow">YOUR AVATAR</span>
            <img className="profile-avatar" src={preview || avatar} alt="Profile avatar preview" />
            <div className="avatar-choices">{avatarChoices.map((choice) => <button type="button" key={choice} className={avatar === choice ? 'selected' : ''} onClick={() => { setAvatar(choice); setPreview('') }}><img src={choice} alt="Choose avatar" /></button>)}</div>
            <label className="upload-avatar">Upload a photo<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) { if (file.size > 5 * 1024 * 1024) { window.alert('Choose an image under 5 MB.'); return } setPreview(URL.createObjectURL(file)) } }} /></label>
            {preview && <button type="button" className="text-link" onClick={() => setPreview('')}>Remove photo preview <X size={13} /></button>}
            <small>Preview only — photo isn’t uploaded or stored.</small>
          </section>
          <section className="panel profile-fields">
            <span className="eyebrow">PUBLIC PROFILE</span>
            {demoSession && <><p className="demo-note">TEMPORARY DEMO PROFILE · RESET WHEN THIS TAB RELOADS</p><Link to="/login" className="text-link profile-demo-signout" onClick={endDemoSession}>Sign out of demo account <ArrowRight size={13} /></Link></>}
            <label>Display name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label>About you<textarea rows={3} placeholder="A little about how you help your community…" /></label>
            <label>General location<input placeholder="e.g. Northside" /></label>
            <label>Email <span className="field-note">Private · demo only</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Telephone <span className="field-note">Private · demo only</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Not displayed publicly" /></label>
            <div className="preference-list"><label><input type="checkbox" defaultChecked /> Notify me about potential matches</label><label><input type="checkbox" defaultChecked /> Notify me about new messages</label><label><input type="checkbox" /> Show my general area on reports</label></div>
            <div className="privacy-callout"><LockKeyhole size={17} /><p>Profile name preference is saved in this browser. Email and phone remain in memory only for this tab. Passwords and authentication tokens are never saved.</p></div>
            {saved && <p className="success-inline"><Check size={14} /> Your demo preferences are saved.</p>}
            <button className="button button-amber" type="submit">Save profile <Check size={15} /></button>
          </section>
        </div>
      </form>
    </div>
  )
}

export function MessagesPage() {
  const [text, setText] = useState('')
  const [sent, setSent] = useState<string[]>([])
  const conversations = messageService.listAccessibleMessages(demoUser.id)
  const activeMessage = conversations[0]
  const conversationItem = activeMessage ? itemService.get(activeMessage.itemId) : undefined
  function send(event: FormEvent) { event.preventDefault(); if (text.trim()) { setSent([...sent, text.trim()]); setText('') } }
  return <div className="page-shell messages-page"><SectionHeading eyebrow="PRIVATE CONVERSATIONS" title="Messages" description="A thoughtful question can bring the right details to light." />{activeMessage && conversationItem ? <div className="message-layout"><aside className="conversation-list"><span className="eyebrow">RECENT · MATCH PARTICIPANTS ONLY</span><div className="conversation selected"><img src="https://i.pravatar.cc/100?img=47" alt="" /><span><b>Jordan Lee</b><small>About: {conversationItem.title}</small></span><i /></div></aside><section className="conversation-panel"><div className="conversation-head"><img src="https://i.pravatar.cc/100?img=47" alt="" /><span><b>Jordan Lee</b><small>Conversation about a possible item match</small></span><ShieldCheck size={17} /></div><div className="conversation-context"><ItemVisual title={conversationItem.title} src={conversationItem.imageUrls[0]} /><span><small>ABOUT THIS LISTING</small><b>{conversationItem.title}</b></span><Link to={`/items/${conversationItem.id}`}>View <ArrowUpRight size={13} /></Link></div><div className="chat-thread"><div className="chat-date">TODAY · FEB 21</div><div className="chat-bubble received">{activeMessage.text}<small>10:30 AM</small></div>{sent.map((message, i) => <div className="chat-bubble sent" key={`${message}-${i}`}>{message}<small>Just now · Demo</small></div>)}</div><form className="message-compose" onSubmit={send}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a private message…" aria-label="Message text" /><button type="submit" aria-label="Send message"><Send size={17} /></button></form><small className="safe-message"><LockKeyhole size={12} /> Keep personal contact details private.</small></section></div> : <div className="empty-state private-messages-empty"><LockKeyhole size={24} /><h2>No conversations available</h2><p>Conversations are only shown to the people who reported the lost item and the person who found a related item.</p><Link to="/browse" className="button button-outline">Browse items</Link></div>}</div>
}

export function NotificationsPage() {
  const [read, setRead] = useState<string[]>(demoNotifications.filter((note) => note.read).map((note) => note.id))
  return <div className="page-shell notifications-page"><SectionHeading eyebrow="THE LITTLE UPDATES" title="Notifications" description="Keep up with the conversations and connections around your reports." action={<button className="text-link" onClick={() => setRead(demoNotifications.map((note) => note.id))}>Mark all read <Check size={14} /></button>} /><div className="notification-list">{demoNotifications.map((note) => <Link to={note.href} className={`notification-row ${read.includes(note.id) ? 'read' : ''}`} key={note.id} onClick={() => setRead([...read, note.id])}><span className={`notification-icon ${note.kind}`}>{note.kind === 'match' ? <Sparkles /> : note.kind === 'message' ? <MessageCircle /> : <CheckCircle2 />}</span><span><b>{note.title}</b><p>{note.body}</p><small>{new Date(note.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })} · Demo update</small></span>{!read.includes(note.id) && <i />}</Link>)}</div></div>
}

const helpArticles = [
  { category: 'Getting started', title: 'What does Find What Matters do?', text: 'A community-led place to report lost belongings, register found items, and start safe conversations. This prototype uses simulated data only.' },
  { category: 'Getting started', title: 'How do I create an account?', text: 'Account creation will be connected to the authentication service in a future release. For now, the app runs as a local demo with a sample profile.' },
  { category: 'Reporting', title: 'How to report a lost item', text: 'Choose Report lost, add the item name, category and a detailed description. Include the date and approximate location. Add identifying features only you know.' },
  { category: 'Reporting', title: 'How to register a found item', text: 'Choose Report found, describe where and when you found the item, and keep it somewhere safe. Don’t publish private information or every identifying feature.' },
  { category: 'Reporting', title: 'Taking helpful photographs', text: 'Use a clear, well-lit photo with a plain background. Include a close-up of distinctive features, but keep unique ownership clues private.' },
  { category: 'Matching & safety', title: 'How simulated matching works', text: 'The demo illustrates potential similarities across text, category, dates, location and visual details. It does not run a real AI service.' },
  { category: 'Matching & safety', title: 'How should I interpret a match?', text: 'A score is only an estimate, never proof of ownership. Ask the reporter to describe a detail not shown publicly and use human judgment.' },
  { category: 'Matching & safety', title: 'Contacting someone safely', text: 'Start with the private message action. Keep exact addresses, phone numbers and sensitive details off public listings.' },
  { category: 'Matching & safety', title: 'Verifying ownership', text: 'Ask for unique details, receipts, serial numbers or contents that were not included in the listing. Arrange returns in a safe public place.' },
  { category: 'Your account', title: 'Profile, avatar and notifications', text: 'Choose a built-in avatar or preview a local image. In this demo, only display name and avatar preference are stored locally.' },
  { category: 'Privacy', title: 'How are my details handled?', text: 'Do not enter real sensitive information in the demo. Passwords and authentication tokens are never stored. Photos are previewed locally, not uploaded.' },
  { category: 'Privacy', title: 'Report something suspicious', text: 'Use Report a concern on the item details page. Support and moderation workflows will be connected to a future backend.' },
  { category: 'Troubleshooting', title: 'Why is my report only visible here?', text: 'Reports are stored in your browser for this prototype. They are not sent to a shared database or visible to other people.' },
  { category: 'Troubleshooting', title: 'Contact support', text: 'Email the demo support team at hello@findwhatmatters.example. Do not include sensitive personal details in your message.' },
]

export function HelpCenterPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All topics')
  const [expanded, setExpanded] = useState<string | null>(helpArticles[0].title)
  const categoriesList = ['All topics', ...new Set(helpArticles.map((article) => article.category))]
  const results = helpArticles.filter((article) => (category === 'All topics' || article.category === category) && `${article.title} ${article.text} ${article.category}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="page-shell help-page"><PageIntro kicker="HERE WHEN YOU NEED US" title="Help, with a human touch." text="Answers for the small steps that bring the important things back." /><label className="help-search"><Search size={18} /><input placeholder="Search articles, topics, questions…" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label><div className="help-categories">{categoriesList.map((name) => <button key={name} className={category === name ? 'active' : ''} onClick={() => setCategory(name)}>{name}</button>)}</div><div className="help-layout"><div className="help-articles">{results.length ? results.map((article, index) => <article className="help-article" key={article.title}><button aria-expanded={expanded === article.title} onClick={() => setExpanded(expanded === article.title ? null : article.title)}><span className="article-index">0{index + 1}</span><span><small>{article.category}</small><b>{article.title}</b></span><ChevronDown size={17} /></button>{expanded === article.title && <p>{article.text}</p>}</article>) : <div className="empty-state"><h2>No articles found</h2><p>Try another search term or category.</p></div>}</div><aside className="support-card"><CircleHelp size={22} /><span className="eyebrow">STILL LOOKING?</span><h2>We’re happy to help.</h2><p>Send a note to our demo support team. Please leave out sensitive personal information.</p><a className="button button-amber" href="mailto:hello@findwhatmatters.example">Contact support <ArrowUpRight size={15} /></a><small>Help center · Demo service</small></aside></div><div className="help-footnote"><ShieldCheck size={15} /> For a safe return, always verify ownership in private and meet in a public place.</div></div>
}
