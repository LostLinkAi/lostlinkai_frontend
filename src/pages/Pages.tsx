import {
  ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown,
  CircleHelp, Clock3, Eraser, Eye, FileText, Filter, HeartHandshake, LayoutDashboard, LockKeyhole, LogOut, MapPin, Minus,
  MessageCircle, PencilLine, Plus, Search, Send, ShieldCheck, Sparkles, Upload, X, type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Calendar } from '@heroui/react'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ItemCard } from '../components/items/ItemCard'
import { ItemVisual } from '../components/items/ItemVisual'
import { BrandIdentity } from '../components/layout/BrandIdentity'
import { SectionHeading } from '../components/ui/SectionHeading'
import { demoItems, demoMatches, demoMessages, demoUser } from '../data/mockData'
import { itemService } from '../services/itemService'
import { messageService } from '../services/messageService'
import { matchingService } from '../services/matchingService'
import { notificationService } from '../services/notificationService'
import { endDemoSession, fetchProfileFromServer, getCurrentProfile, isDemoSessionActive, saveCurrentProfile, uploadUserAvatar } from '../services/profileService'
import { api, resolveApiUrl } from '../services/api'
import type { AppMessage, AppNotification, Item, ItemCategory, PotentialMatch, ReportType } from '../types/models'

const defaultCategories: ItemCategory[] = ['Electronics', 'Bags', 'Documents', 'Keys', 'Clothing', 'Accessories', 'Pets', 'Vehicles', 'Other']
const avatarChoices = ['https://i.pravatar.cc/120?img=12', 'https://i.pravatar.cc/120?img=47', 'https://i.pravatar.cc/120?img=32', 'https://i.pravatar.cc/120?img=5']
const heroHeadlines = [
  { lead: 'Lost Something?', accent: 'We’ll help you', ending: 'find it.' },
  { lead: 'Found a lost item?', accent: 'We’ll reunite it', ending: 'with the owner.' },
]

function PageIntro({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return <div className="page-intro"><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{text}</p></div>
}

function HeroTypewriter() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [visibleCharacters, setVisibleCharacters] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const message = heroHeadlines[messageIndex]
  const totalCharacters = message.lead.length + message.accent.length + message.ending.length

  useEffect(() => {
    const complete = visibleCharacters === totalCharacters
    const delay = deleting
      ? (visibleCharacters === 0 ? 450 : 40)
      : (complete ? 2250 : 72)

    const timeout = window.setTimeout(() => {
      if (!deleting) {
        if (complete) setDeleting(true)
        else setVisibleCharacters((count) => count + 1)
      } else if (visibleCharacters > 0) {
        setVisibleCharacters((count) => count - 1)
      } else {
        setMessageIndex((index) => (index + 1) % heroHeadlines.length)
        setDeleting(false)
      }
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [deleting, messageIndex, totalCharacters, visibleCharacters])

  const leadCharacters = Math.min(visibleCharacters, message.lead.length)
  const accentCharacters = Math.min(
    message.accent.length,
    Math.max(0, visibleCharacters - message.lead.length),
  )
  const endingCharacters = Math.max(
    0,
    visibleCharacters - message.lead.length - message.accent.length,
  )
  const isTyping = !deleting && visibleCharacters < totalCharacters
  const toolPhase = deleting ? 'erasing' : isTyping ? 'writing' : 'resting'
  const writingTool = (
    <span
      className={`hero-typewriter__tool-wrap hero-typewriter__tool-wrap--${toolPhase}`}
      aria-hidden="true"
    >
      {deleting
        ? <Eraser className="hero-typewriter__tool" strokeWidth={2.2} />
        : <PencilLine className="hero-typewriter__tool" strokeWidth={2.2} />}
    </span>
  )

  return (
    <h1 aria-label={`${message.lead} ${message.accent} ${message.ending}`}>
      <span className="hero-typewriter__reserve" aria-hidden="true">
        Found a lost item?<br /><em>We’ll reunite it</em><br />with the owner.
      </span>
      <span className="hero-typewriter__live" aria-hidden="true">
        {message.lead.slice(0, leadCharacters)}
        {visibleCharacters <= message.lead.length && writingTool}
        <br />
        <em>
          {message.accent.slice(0, accentCharacters)}
          {visibleCharacters > message.lead.length && visibleCharacters <= message.lead.length + message.accent.length && writingTool}
        </em>
        <br />
        {message.ending.slice(0, endingCharacters)}
        {visibleCharacters > message.lead.length + message.accent.length && writingTool}
      </span>
    </h1>
  )
}

function ConcernButton({ itemId }: { itemId?: string }) {
  const [reported, setReported] = useState(false)
  async function flag() {
    if (itemId) {
      await itemService.reportConcern(itemId, 'Report concern submitted by user.')
    }
    setReported(true)
  }
  return <button className="concern-button" onClick={flag}>{reported ? 'Thank you — this listing is flagged for review.' : 'Report a concern'}</button>
}

export function HomePage() {
  const [items, setItems] = useState<Item[]>(() => itemService.list())
  const [stats, setStats] = useState({ itemsReported: 2480, potentialConnections: 816, reunited: 392 })
  const authenticated = isDemoSessionActive()

  useEffect(() => {
    void itemService.fetchList({ limit: 6 }).then((res) => {
      if (res && res.length) setItems(res)
    })
    void itemService.fetchStats().then((res) => {
      if (res) setStats(res)
    })
  }, [])

  return (
    <div className="home-page">
      <header className="home-top">
        <BrandIdentity />
        <div className="home-header-actions">
          {authenticated ? (
            <Link
              to="/dashboard"
              className="home-signin-link home-dashboard-link"
              aria-label="Dashboard"
              data-tooltip="Dashboard"
            >
              <LayoutDashboard size={19} aria-hidden="true" />
            </Link>
          ) : (
            <Link to="/login" className="home-signin-link">Sign in</Link>
          )}
          <span className="demo-pill"><i /> COMMUNITY PLATFORM</span>
        </div>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> A little closer to found</div>
          <HeroTypewriter />
          <p>Good things find their way back. Tell your community what’s missing, or help someone reconnect with what matters.</p>
          <div className="hero-actions">
            <Link to="/report/lost" className="button button-amber">Report an item <ArrowUpRight size={16} /></Link>
            <Link to="/browse" className="button button-ghost">Browse items <ArrowRight size={16} /></Link>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack">
              <img src={avatarChoices[0]} alt="" />
              <img src={avatarChoices[1]} alt="" />
              <img src={avatarChoices[2]} alt="" />
            </div>
            <span><strong>Neighbors looking out</strong><br />for one another, every day.</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-grid" />
          <div className="art-index">FIELD NOTE&nbsp; / &nbsp;001</div>
          <div className="hero-photo"><img src="/lostlink-ai-logo.webp" alt="LostLink AI — Find What Matters logo" /></div>
          <div className="photo-caption"><span className="caption-dot" /> STORIES FIND THEIR WAY HOME <span>01 — 03</span></div>
          <div className="art-orbit orbit-a" /><div className="art-orbit orbit-b" />
          <div className="match-note"><Sparkles size={15} /><span><b>We will</b><br />Find it.</span><span className="match-percent">100%</span></div>
          <div className="hero-coordinate">40°43′ N &nbsp; 73°59′ W</div>
        </div>
        <div className="hero-side-label">REPORT CLEARLY <span>—</span> DISCOVER INTELLIGENTLY <span>—</span> REUNITE SAFELY</div>
      </section>
      <section className="home-stats">
        <div className="stats-note"><span className="eyebrow">A community in motion</span><p>Every report is a small act of hope.</p></div>
        <div><strong>{stats.itemsReported.toLocaleString()}</strong><span>items reported</span></div>
        <div><strong>{stats.potentialConnections.toLocaleString()}</strong><span>potential connections</span></div>
        <div><strong>{stats.reunited.toLocaleString()}</strong><span>things back where they belong</span></div>
      </section>
      <section className="how-section">
        <div className="how-heading"><span className="eyebrow">A simple way back</span><h2>Small details.<br /><em>Meaningful reunions.</em></h2><p>It starts with a good description and a community ready to help.</p><Link to="/help" className="text-link">How it works <ArrowRight size={15} /></Link></div>
        <div className="steps-list"><article><span>01</span><div><h3>Tell us what’s missing</h3><p>Add the details only you would know. Your contact information stays private.</p></div><FileText /></article><article><span>02</span><div><h3>We look for the little things</h3><p>AI matching compares item details and highlights possible connections for human review.</p></div><Sparkles /></article><article><span>03</span><div><h3>Make a safe connection</h3><p>Message through the platform, verify ownership, and arrange a thoughtful return.</p></div><HeartHandshake /></article></div>
      </section>
      <section className="home-feature"><div className="feature-visual"><div className="feature-ring"><div className="ring-point point-one" /><div className="ring-point point-two" /><div className="ring-core"><Sparkles size={26} /></div></div><span className="feature-coordinate">DETAILS IN / SIGNAL OUT</span></div><div className="feature-copy"><span className="eyebrow">A second set of eyes</span><h2>Sometimes a match is hiding in the details.</h2><p>Our intelligent matching view brings similar reports together — from category and timing to the small identifying details that matter. Every suggestion is an invitation to look closer, never a verdict.</p><Link to="/matching" className="text-link">Explore matching <ArrowRight size={15} /></Link><div className="feature-disclaimer"><LockKeyhole size={14} /> A match is a lead, not proof. People make the final call.</div></div></section>
      <section className="community-band"><div><ShieldCheck /><span className="eyebrow">Care comes first</span><h2>Helpful by nature.<br /><em>Private by design.</em></h2></div><p>Keep exact addresses and personal contact details private. Share a detail only when you’re ready. A safe return begins with a careful conversation.</p><Link to="/help" className="button button-outline">Our safety guide <ArrowUpRight size={15} /></Link></section>
      <div className="home-preview"><div className="section-heading"><div><span className="eyebrow">From around the neighborhood</span><h2>Recently reported</h2></div><Link to="/browse" className="text-link">See all items <ArrowRight size={15} /></Link></div><div className="item-grid">{items.slice(0, 3).map((item) => <ItemCard key={item.id} item={item} />)}</div></div>
      <footer className="site-footer"><BrandIdentity /><span>For the things — and people — worth finding.</span><nav><Link to="/help">Help</Link><a href="mailto:hello@findwhatmatters.example">Contact</a><Link to="/help">Privacy</Link><Link to="/help">Terms</Link></nav><small>© 2026 LostLink AI</small></footer>
    </div>
  )
}

export function DashboardPage() {
  const [profile, setProfile] = useState(getCurrentProfile())
  const [myReports, setMyReports] = useState<Item[]>([])
  const [matches, setMatches] = useState<PotentialMatch[]>(() => matchingService.listCandidates())
  const [metrics, setMetrics] = useState({ lostCount: 0, foundCount: 0, matchesCount: 0, resolvedCount: 0 })

  useEffect(() => {
    void fetchProfileFromServer().then(setProfile)
    void itemService.fetchMyReports().then((reports) => {
      setMyReports(reports)
      const lost = reports.filter((r) => r.reportType === 'lost' && r.status !== 'resolved' && r.status !== 'withdrawn').length
      const found = reports.filter((r) => r.reportType === 'found' && r.status !== 'resolved' && r.status !== 'withdrawn').length
      const resolved = reports.filter((r) => r.status === 'resolved').length
      setMetrics((m) => ({ ...m, lostCount: lost, foundCount: found, resolvedCount: resolved }))
    })
    void matchingService.fetchCandidates().then((m) => {
      setMatches(m)
      setMetrics((prev) => ({ ...prev, matchesCount: m.length }))
    })

    // Try dashboard endpoint
    void api.get<{ success: boolean; data: any }>('/users/me/dashboard').then((res) => {
      if (res.success && res.data?.metrics) {
        setMetrics(res.data.metrics)
      }
    }).catch(() => {})
  }, [])

  const topMatch = matches[0]

  return (
    <div className="page-shell dashboard-page">
      <div className="welcome-row">
        <div className="avatar-large"><img src={resolveApiUrl(profile.avatarUrl || '') || demoUser.avatarUrl} alt={profile.displayName || 'User'} /></div>
        <div><span className="eyebrow">LOSTLINK AI DASHBOARD</span><h1>Good day, {(profile.displayName || 'Neighbor').split(' ')[0]}<span className="amber">.</span></h1><p>Here’s what’s happening around your reports and community matches.</p></div>
        <span className="demo-pill"><i /> LIVE</span>
      </div>
      <div className="metric-grid">
        <Metric label="Lost reports" value={String(metrics.lostCount).padStart(2, '0')} detail="Active searches" icon={<CircleHelp />} />
        <Metric label="Found reports" value={String(metrics.foundCount).padStart(2, '0')} detail="Registered by you" icon={<CheckCircle2 />} />
        <Metric label="Potential matches" value={String(metrics.matchesCount).padStart(2, '0')} detail="Ready for review" icon={<Sparkles />} accent />
        <Metric label="Reunited" value={String(metrics.resolvedCount).padStart(2, '0')} detail="Returned safely" icon={<HeartHandshake />} />
      </div>
      <div className="dashboard-columns">
        <section className="panel timeline-panel">
          <div className="panel-heading"><div><span className="eyebrow">Your corner of the community</span><h2>Recent activity</h2></div><Link to="/notifications" className="text-link">All activity <ArrowRight size={14} /></Link></div>
          <div className="timeline">
            {topMatch && <Timeline icon={<Sparkles />} title="A potential match was surfaced" detail={`${topMatch.similarityScore}% similarity estimate`} color="amber" />}
            <Timeline icon={<MessageCircle />} title="Community messaging is open" detail="Direct inquiries on matching items" color="cyan" />
            <Timeline icon={<Check />} title="Safe return guidelines active" detail="Protecting ownership privacy" color="green" />
          </div>
        </section>
        <section className="panel quick-panel">
          <span className="eyebrow">Start with a small step</span><h2>Something missing<br />or found?</h2><p>Your details can make all the difference.</p>
          <Link to="/report/lost" className="quick-action"><span><CircleHelp size={18} /> Report something lost</span><ArrowUpRight size={16} /></Link>
          <Link to="/report/found" className="quick-action"><span><CheckCircle2 size={18} /> Register something found</span><ArrowUpRight size={16} /></Link>
        </section>
      </div>
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="panel-heading"><div><span className="eyebrow">Worth a closer look</span><h2>Latest suggestion</h2></div>{topMatch && <span className="score-badge">{topMatch.similarityScore}% SIMILAR</span>}</div>
          {topMatch ? <MatchMini match={topMatch} /> : <p className="empty-inline">No candidate matches yet.</p>}
        </section>
        <section className="panel">
          <div className="panel-heading"><div><span className="eyebrow">Your reports</span><h2>Recently updated</h2></div><Link to="/my-items" className="text-link">Manage <ArrowRight size={14} /></Link></div>
          <div className="compact-list">
            {myReports.length ? myReports.slice(0, 3).map((item) => (
              <Link to={`/items/${item.id}`} key={item.id}>
                <span className={`tiny-status ${item.status}`} />
                <span><b>{item.title}</b><small>{item.status === 'resolved' ? 'Reunited' : item.approximateLocation}</small></span>
                <ArrowRight size={14} />
              </Link>
            )) : <p className="empty-inline">You haven’t created any reports yet.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

function Metric({ label, value, detail, icon, accent }: { label: string; value: string; detail: string; icon: React.ReactNode; accent?: boolean }) {
  return <div className={`metric-card ${accent ? 'metric-accent' : ''}`}><span className="metric-icon">{icon}</span><span className="eyebrow">{label}</span><strong>{value}</strong><small>{detail}</small></div>
}

function Timeline({ icon, title, detail, color }: { icon: React.ReactNode; title: string; detail: string; color: string }) {
  return <div className="timeline-row"><span className={`timeline-icon ${color}`}>{icon}</span><span><b>{title}</b><small>{detail}</small></span></div>
}

export function BrowseItemsPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All items')
  const [category, setCategory] = useState('All categories')
  const [location, setLocation] = useState('All locations')
  const [sort, setSort] = useState('Newest first')
  const [limit, setLimit] = useState(6)
  const [items, setItems] = useState<Item[]>(() => itemService.list())
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<string[]>(defaultCategories)
  const [availableLocations, setAvailableLocations] = useState<string[]>([])

  useEffect(() => {
    void itemService.fetchCategories().then((cats) => {
      if (cats && cats.length) {
        setAvailableCategories([...new Set([...cats.map((c) => c.name), ...defaultCategories])])
      }
    })
    void itemService.fetchLocations().then((locs) => {
      if (locs && locs.length) {
        setAvailableLocations(['All locations', ...new Set(locs.map((l) => l.name))])
      }
    })
  }, [])

  useEffect(() => {
    let active = true
    setIsLoadingItems(true)
    void itemService.fetchList({
      type,
      category,
      location,
      q: query,
      sort,
      limit: 50,
    }).then((res) => {
      if (active) setItems(res)
    }, (error: unknown) => {
      if (active) console.error('Failed to load Browse listings.', error)
    }).finally(() => {
      if (active) setIsLoadingItems(false)
    })
    return () => { active = false }
  }, [type, category, location, query, sort])

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesText = `${item.title} ${item.description} ${item.category} ${item.approximateLocation} ${(item.identifyingFeatures || []).join(' ')}`.toLowerCase().includes(text)
      return (
        matchesText &&
        (type === 'All items' || item.reportType === type.toLowerCase().replace(' items', '')) &&
        (category === 'All categories' || item.category === category) &&
        (location === 'All locations' || item.approximateLocation.toLowerCase().includes(location.toLowerCase()))
      )
    })
  }, [items, query, type, category, location])

  return (
    <div className="page-shell browse-page">
      <div className="browse-question-marks" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => <span key={index}>?</span>)}
      </div>
      <SectionHeading eyebrow="The neighborhood lost & found" title="Browse items" description="A familiar detail can be the beginning of a reunion." action={<Link className="button button-amber" to="/report/lost"><Plus size={16} /> Report an item</Link>} />
      <div className="browse-tools">
        <label className="search-box">
          <Search size={18} />
          <input aria-label="Search listings" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, details, places…" />
          <kbd>⌘ K</kbd>
        </label>
        <div className="tabs">
          {['All items', 'Lost items', 'Found items'].map((tab) => (
            <button key={tab} type="button" onClick={() => setType(tab)} className={type === tab ? 'selected' : ''} aria-pressed={type === tab}>{tab}</button>
          ))}
        </div>
      </div>
      <div className="filter-row">
        <span><Filter size={14} /> FILTER BY</span>
        <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option>All categories</option>
          {availableCategories.map((cat) => <option key={cat}>{cat}</option>)}
        </select>
        <select aria-label="Filter by location" value={location} onChange={(event) => setLocation(event.target.value)}>
          {availableLocations.length > 0 ? (
            availableLocations.map((place) => <option key={place}>{place}</option>)
          ) : (
            <>
              <option>All locations</option>
              <option>Riverside Market</option>
              <option>Northside Library</option>
              <option>Botanical Gardens</option>
              <option>Harbor tram stop</option>
              <option>Old Town</option>
            </>
          )}
        </select>
        <select aria-label="Sort items" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option>Newest first</option>
          <option>Oldest first</option>
        </select>
        <span className="results-count" role="status" aria-live="polite" aria-busy={isLoadingItems}>
          {isLoadingItems && <span className="browse-spinner" aria-hidden="true" />}
          {filtered.length} listings
        </span>
      </div>
      {filtered.length ? (
        <>
          <div className="item-grid" aria-busy={isLoadingItems}>{filtered.slice(0, limit).map((item) => <ItemCard key={item.id} item={item} browseInteractive />)}</div>
          {filtered.length > limit && (
            <button className="button button-outline load-more" onClick={() => setLimit((count) => count + 6)}>
              Load more listings <ArrowDownRight size={16} />
            </button>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Search size={24} />
          <h2>Nothing here just yet</h2>
          <p>Try a different search or clear a filter to explore more listings.</p>
          <button className="text-link" onClick={() => { setQuery(''); setType('All items'); setCategory('All categories'); setLocation('All locations') }}>
            Clear all filters <X size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

export function ItemDetailsPage() {
  const { id = '' } = useParams()
  const [item, setItem] = useState<Item | undefined>(() => itemService.get(id))
  const profile = getCurrentProfile()

  useEffect(() => {
    void itemService.fetchOne(id).then((res) => {
      if (res) setItem(res)
    })
  }, [id])

  if (!item) {
    return (
      <div className="page-shell">
        <div className="empty-state">
          <h1>That item isn’t here</h1>
          <p>The listing may have been removed or the link may be incorrect.</p>
          <Link className="button button-amber" to="/browse">Back to browsing</Link>
        </div>
      </div>
    )
  }

  const isOwner = item.reporterId === profile.id || item.reporterId === demoUser.id

  return (
    <div className="page-shell details-page">
      <Link to="/browse" className="back-link"><ArrowLeft size={15} /> Back to items</Link>
      <div className="detail-layout">
        <div className="detail-media">
          <ItemVisual title={item.title} src={item.imageUrls[0]} />
          {item.imageUrls.length > 0 && <div className="image-index">01 / {String(item.imageUrls.length).padStart(2, '0')}</div>}
          <div className="detail-caption">COMMUNITY LISTING <span>·</span> #{item.id.toUpperCase()}</div>
        </div>
        <div className="detail-copy">
          <div className="detail-tags">
            <span className={`status-tag ${item.reportType}`}>{item.reportType}</span>
            <span>{item.category}</span>
          </div>
          <h1>{item.title}</h1>
          <p className="detail-description">{item.description}</p>
          <div className="detail-facts">
            <div><span>WHEN</span><b><Clock3 size={15} /> {new Date(item.dateLostOrFound).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</b></div>
            <div><span>WHERE</span><b><MapPin size={15} /> {item.approximateLocation}</b><small>Approximate area shared for privacy</small></div>
          </div>
          <section className="identify-box">
            <span className="eyebrow">DETAILS THAT MAY HELP IDENTIFY IT</span>
            {item.identifyingFeatures && item.identifyingFeatures.length ? (
              <ul>{item.identifyingFeatures.map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul>
            ) : (
              <p>No additional identifying details recorded.</p>
            )}
          </section>
          <div className="reporter">
            <img src={demoUser.avatarUrl} alt="" />
            <span><small>SHARED BY</small><b>Community member</b></span>
            <span className="verified"><ShieldCheck size={15} /> Verified</span>
          </div>
          {!isOwner ? (
            <>
              <Link className="button button-amber full-button" to={`/messages?itemId=${item.id}&reporterId=${item.reporterId}`}>
                Message about this item <MessageCircle size={16} />
              </Link>
              <p className="privacy-hint"><LockKeyhole size={14} /> Private direct conversation between community members.</p>
            </>
          ) : (
            <p className="privacy-hint"><CheckCircle2 size={14} /> This is your reported listing.</p>
          )}
          <ConcernButton itemId={item.id} />
        </div>
      </div>
      <section className="similar-section">
        <div className="section-heading"><div><span className="eyebrow">Keep looking</span><h2>Nearby in the community</h2></div></div>
        <div className="item-grid">{itemService.list().filter((entry) => entry.id !== item.id).slice(0, 3).map((entry) => <ItemCard key={entry.id} item={entry} />)}</div>
      </section>
    </div>
  )
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
  const [submitting, setSubmitting] = useState(false)
  const [createdItemId, setCreatedItemId] = useState('')
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

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!details.title || !details.category || !details.description || !details.date || !details.location) {
      setError('Please complete the item name, category, description, date, and approximate location before submitting.')
      setStep(!details.title || !details.category || !details.description ? 0 : 2)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const profile = getCurrentProfile()
      const created = await itemService.createAsync({
        reporterId: profile.id || demoUser.id,
        reportType: type,
        title: details.title,
        category: details.category as ItemCategory,
        description: details.description,
        identifyingFeatures: details.identifyingFeatures.split(',').map((text) => text.trim()).filter(Boolean),
        imageUrls: previews,
        dateLostOrFound: details.date,
        approximateLocation: details.location,
        status: 'open',
        ...(details.value ? { estimatedValue: Number(details.value) } : {}),
      }, files)

      setCreatedItemId(created.id)
      setSubmitted(true)
      window.setTimeout(() => navigate(`/items/${created.id}`), 1400)
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="page-shell">
        <div className="success-state">
          <span><Check size={28} /></span>
          <div className="eyebrow">REPORT REGISTERED SUCCESSFULLY</div>
          <h1>Your details are in good hands.</h1>
          <p>The report has been saved and AI matching is searching for potential connections.</p>
          <Link to={createdItemId ? `/items/${createdItemId}` : '/my-items'} className="button button-amber">
            View report <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell report-page">
      <Link to="/dashboard" className="back-link"><ArrowLeft size={15} /> Back to dashboard</Link>
      <div className="report-header">
        <span className="eyebrow">A few details can change everything</span>
        <h1>{type === 'lost' ? 'Let’s help it find its way back.' : 'Let’s help someone find what matters.'}</h1>
        <p>Share what you know. You can always update your report later.</p>
      </div>
      <div className="report-layout">
        <aside className="step-nav">
          {['Item details', 'Photos & clues', 'Place & date', 'Contact', 'Review'].map((label, index) => (
            <button key={label} onClick={() => { setError(''); setStep(index) }} className={step === index ? 'active' : step < index ? '' : 'complete'}>
              <span>{step > index ? <Check size={13} /> : `0${index + 1}`}</span>{label}
            </button>
          ))}
          <div className="privacy-card"><LockKeyhole size={17} /><b>Your details stay yours.</b><p>Personal contact details are never shown publicly. Use approximate locations only.</p></div>
        </aside>
        <form className="report-form" onSubmit={submit}>
          <div className="form-step-head">
            <div><span className="eyebrow">STEP 0{step + 1} / 05</span><h2>{prompts[Math.min(step, 3)]}</h2></div>
          </div>
          {step === 0 && (
            <div className="form-fields">
              <label>What are you reporting?
                <div className="segmented">
                  <button type="button" onClick={() => setType('lost')} className={type === 'lost' ? 'active' : ''}>I lost something</button>
                  <button type="button" onClick={() => setType('found')} className={type === 'found' ? 'active' : ''}>I found something</button>
                </div>
              </label>
              <label>Item name<input required placeholder="e.g. Navy canvas backpack" value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} /></label>
              <label>Category
                <select required value={details.category} onChange={(e) => setDetails({ ...details, category: e.target.value })}>
                  <option value="">Choose a category</option>
                  {defaultCategories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="wide-field">Describe it<textarea required rows={4} placeholder="Shape, color, condition, or anything that makes it unique…" value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} /></label>
            </div>
          )}
          {step === 1 && (
            <div className="form-fields">
              <label className="wide-field">Photographs <span className="field-note">Optional · up to 5 images · JPEG, PNG or WebP · 5 MB max each.</span>
                <div className="upload-box" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }}>
                  <Upload size={23} />
                  <b>Drop images here, or choose files</b>
                  <small>Images are uploaded securely to your report.</small>
                  <input aria-label="Choose photographs" type="file" accept="image/*" multiple onChange={(event) => addFiles(event.target.files)} />
                </div>
              </label>
              {previews.length > 0 && (
                <div className="preview-grid">
                  {previews.map((src, i) => (
                    <div key={src}>
                      <img src={src} alt={`Selected item preview ${i + 1}`} />
                      <button type="button" aria-label={`Remove image ${i + 1}`} onClick={() => { setFiles(files.filter((_, index) => index !== i)); setPreviews(previews.filter((_, index) => index !== i)) }}><X size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
              <label className="wide-field">Identifying features <span className="field-note">Use details someone else might not know; separate with commas.</span>
                <textarea rows={3} placeholder="Small mark, initials, contents…" value={details.identifyingFeatures} onChange={(e) => setDetails({ ...details, identifyingFeatures: e.target.value })} />
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="form-fields">
              <label>Approximate location<input required placeholder="e.g. Northside Library" value={details.location} onChange={(e) => setDetails({ ...details, location: e.target.value })} /><span className="field-note">Please don’t enter a home address or exact private location.</span></label>
              <div className="date-calendar-field">
                <span className="date-calendar-label" id="report-date-label">{type === 'lost' ? 'Date last seen' : 'Date found'}<span className="field-note">Choose the date from the calendar below.</span></span>
                <Calendar aria-labelledby="report-date-label" className="report-calendar" value={details.date ? parseDate(details.date) : null} onChange={(date) => setDetails({ ...details, date: date?.toString() ?? '' })} maxValue={today(getLocalTimeZone())}>
                  <Calendar.Header className="report-calendar-header"><Calendar.NavButton slot="previous" aria-label="Previous month" /><Calendar.Heading /><Calendar.NavButton slot="next" aria-label="Next month" /></Calendar.Header>
                  <Calendar.Grid className="report-calendar-grid"><Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader><Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody></Calendar.Grid>
                </Calendar>
                {details.date && <span className="selected-date" role="status"><Check size={13} /> Selected: {new Date(`${details.date}T12:00:00`).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
              </div>
              <label>Estimated value <span className="field-note">Optional</span><input type="number" min="0" placeholder="0" value={details.value} onChange={(e) => setDetails({ ...details, value: e.target.value })} /></label>
            </div>
          )}
          {step === 3 && (
            <div className="form-fields">
              <label>Preferred way to connect
                <select value={details.contact} onChange={(e) => setDetails({ ...details, contact: e.target.value })}>
                  <option value="in-app">Private in-app messages</option>
                  <option value="platform">Platform notifications</option>
                </select>
              </label>
              <div className="privacy-callout">
                <ShieldCheck size={19} />
                <p><b>Your privacy matters.</b><br />Your email and phone number will not appear on the public listing. Keep the conversation here until you feel comfortable.</p>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="review-card">
              <span className={`status-tag ${type}`}>{type}</span>
              <h3>{details.title || 'Your item name'}</h3>
              <p>{details.description || 'Your description will appear here.'}</p>
              <div>
                <span>{details.category || 'Category pending'}</span>
                <span>{details.location || 'Location pending'}</span>
                <span>{details.date || 'Date pending'}</span>
              </div>
              <small>Ready to submit to the LostLink AI community network.</small>
            </div>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions">
            {step > 0 && <button type="button" className="button button-ghost" onClick={() => { setStep(step - 1); setError('') }}><ArrowLeft size={15} /> Previous</button>}
            {step < 4 ? (
              <button type="button" className="button button-amber" onClick={() => { setStep(step + 1); setError('') }}>Continue <ArrowRight size={15} /></button>
            ) : (
              <button type="submit" className="button button-amber" disabled={submitting}>
                {submitting ? 'Submitting to network…' : 'Submit report'} <Check size={15} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

function MatchMini({ match }: { match: PotentialMatch }) {
  const lost = itemService.get(match.lostItemId) || demoItems[0]
  const found = itemService.get(match.foundItemId) || demoItems[1]
  return (
    <div className="mini-match">
      <div className="mini-match-images">
        <ItemVisual title={lost.title} src={lost.imageUrls[0]} />
        <span><Sparkles size={14} /></span>
        <ItemVisual title={found.title} src={found.imageUrls[0]} />
      </div>
      <div>
        <b>{lost.title} <span>↔</span> {found.title}</b>
        <small>{match.matchingReasons[0] || 'Similar details in nearby location'}</small>
      </div>
      <Link to="/matching" aria-label="Review potential match"><ArrowUpRight size={16} /></Link>
    </div>
  )
}

export function MyItemsPage() {
  const [tab, setTab] = useState('All reports')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  async function loadReports() {
    setLoading(true)
    const reports = await itemService.fetchMyReports()
    setItems(reports)
    setLoading(false)
  }

  useEffect(() => {
    void loadReports()
  }, [])

  async function toggleStatus(item: Item) {
    const nextStatus = item.status === 'archived' || item.status === 'resolved' ? 'open' : 'resolved'
    await itemService.updateAsync(item.id, { status: nextStatus })
    await loadReports()
  }

  const records = items.filter((item) => {
    if (tab === 'All reports') return item.status !== 'withdrawn'
    if (tab === 'Lost') return item.reportType === 'lost' && item.status !== 'withdrawn'
    if (tab === 'Found') return item.reportType === 'found' && item.status !== 'withdrawn'
    if (tab === 'Resolved') return item.status === 'resolved'
    return true
  })

  return (
    <div className="page-shell">
      <SectionHeading eyebrow="YOUR REPORTS, YOUR WAY" title="My items" description="Keep track of what you’ve reported and update details as things change." action={<Link className="button button-amber" to="/report/lost"><Plus size={16} /> New report</Link>} />
      <div className="tabs item-tabs">
        {['All reports', 'Lost', 'Found', 'Resolved'].map((label) => (
          <button key={label} className={tab === label ? 'selected' : ''} onClick={() => setTab(label)}>{label}</button>
        ))}
      </div>
      {loading ? (
        <p className="loading-state">Loading your reports…</p>
      ) : records.length ? (
        <div className="manage-list">
          {records.map((item) => (
            <div className="manage-row" key={item.id}>
              <ItemVisual title={item.title} src={item.imageUrls[0]} />
              <span className={`status-tag ${item.reportType}`}>{item.reportType}</span>
              <div className="manage-info">
                <Link to={`/items/${item.id}`}><b>{item.title}</b></Link>
                <small>{item.approximateLocation} · {new Date(item.dateLostOrFound).toLocaleDateString()}</small>
              </div>
              <span className={`report-state ${item.status}`}>{item.status === 'resolved' ? 'Reunited' : item.status === 'archived' ? 'Archived' : 'Active'}</span>
              <Link to={`/items/${item.id}`} className="text-link">Details <ArrowUpRight size={14} /></Link>
              <button className="icon-action" title={item.status === 'resolved' ? 'Reopen report' : 'Mark as reunited'} onClick={() => toggleStatus(item)}>
                <Eye size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No reports in this view</h2>
          <p>When you submit a report, it will be available here.</p>
          <Link to="/report/lost" className="button button-amber">Create a report</Link>
        </div>
      )}
    </div>
  )
}

export function MatchingPage() {
  const [status, setStatus] = useState('')
  const [matches, setMatches] = useState<PotentialMatch[]>(() => matchingService.listCandidates())

  useEffect(() => {
    void matchingService.fetchCandidates().then((m) => {
      if (m && m.length) setMatches(m)
    })
  }, [])

  const match = matches[0] || demoMatches[0]
  const lost = itemService.get(match.lostItemId) || demoItems[0]
  const found = itemService.get(match.foundItemId) || demoItems[1]

  async function handleDismiss() {
    await matchingService.reviewAsync(match.id, 'dismissed')
    setStatus('Suggestion dismissed. You can revisit it later.')
    setMatches(matches.filter((m) => m.id !== match.id))
  }

  async function handleConfirm() {
    await matchingService.submitRecoveryRequest(match.id, 'Candidate match confirmed for verification review.')
    setStatus('Recovery review submitted. Both parties have been notified for private verification.')
  }

  return (
    <div className="page-shell matching-page">
      <PageIntro kicker="Intelligent matching · powered by LostLink AI" title="A possible connection." text="These details may belong in the same story. Take a closer look, then decide what feels right." />
      <div className="match-alert">
        <Sparkles size={16} />
        <span><b>A potential connection was surfaced.</b> Two reports share notable details.</span>
        <span>AI MATCHING</span>
      </div>
      <div className="match-compare">
        <div className="compare-item">
          <div className="compare-image">
            <ItemVisual title={lost.title} src={lost.imageUrls[0]} />
            <span className="status-tag lost">LOST REPORT</span>
          </div>
          <span className="eyebrow">REPORTED BELONGING</span>
          <h2>{lost.title}</h2>
          <p>{lost.description}</p>
          <div className="compare-tags">{(lost.identifyingFeatures || []).map((feature) => <span key={feature}>{feature}</span>)}</div>
        </div>
        <div className="match-score">
          <div className="score-ring"><span>{match.similarityScore}<small>%</small></span></div>
          <span className="eyebrow">SIMILARITY<br />ESTIMATE</span>
          <div className="signal-line"><i /><i /><i /></div>
        </div>
        <div className="compare-item">
          <div className="compare-image">
            <ItemVisual title={found.title} src={found.imageUrls[0]} />
            <span className="status-tag found">FOUND REPORT</span>
          </div>
          <span className="eyebrow">FOUND BELONGING</span>
          <h2>{found.title}</h2>
          <p>{found.description}</p>
          <div className="compare-tags">{(found.identifyingFeatures || []).map((feature) => <span key={feature}>{feature}</span>)}</div>
        </div>
      </div>
      <div className="match-analysis">
        <section>
          <span className="eyebrow">WHAT LINES UP</span>
          {match.matchingReasons.map((reason) => <p key={reason}><CheckCircle2 size={15} /> {reason}</p>)}
        </section>
        <section className="conflict">
          <span className="eyebrow">WHAT STILL NEEDS CHECKING</span>
          {match.conflictingDetails.map((reason) => <p key={reason}><CircleHelp size={15} /> {reason}</p>)}
        </section>
      </div>
      <div className="confidence-note">
        <ShieldCheck size={17} />
        <p><b>A similarity score is an estimate, not proof of ownership.</b><br />Ask about a detail that isn’t in the listing before arranging a return. Keep exact personal details private.</p>
      </div>
      {status && <p className="success-inline" role="status"><Check size={15} /> {status}</p>}
      <div className="match-actions">
        <button className="button button-outline" onClick={handleDismiss}>Not a match</button>
        <Link to={`/messages?itemId=${found.id}&matchId=${match.id}`} className="button button-ghost"><MessageCircle size={16} /> Ask a question</Link>
        <button className="button button-amber" onClick={handleConfirm}>Confirm & Request Return <ArrowRight size={15} /></button>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const [profile, setProfile] = useState(getCurrentProfile())
  const [avatar, setAvatar] = useState(profile.avatarUrl || '')
  const [name, setName] = useState(profile.displayName)
  const [email, setEmail] = useState(profile.email)
  const [phone, setPhone] = useState(profile.phone || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [location, setLocation] = useState(profile.location || '')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    void fetchProfileFromServer().then((p) => {
      setProfile(p)
      setName(p.displayName || '')
      setEmail(p.email || '')
      setPhone(p.phone || '')
      setAvatar(p.avatarUrl || '')
      setBio(p.bio || '')
      setLocation(p.location || '')
    })
  }, [])

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      let activeAvatar = avatar

      if (avatarFile) {
        activeAvatar = await uploadUserAvatar(avatarFile)
        setAvatar(activeAvatar)
        setAvatarFile(null)
        setPreview('')
      }

      const updated = await saveCurrentProfile({
        displayName: name,
        email,
        phone,
        avatarUrl: activeAvatar,
        bio,
        location,
      })

      setProfile(updated)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      console.error('Failed to save profile:', err)
      setError(err?.message || 'Failed to save profile to database. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-shell profile-page">
      <SectionHeading
        eyebrow="A LITTLE ABOUT YOU"
        title="Your profile"
        description="Make your space feel like yours. Your contact details stay private."
        action={<Link to="/login" className="button button-signout" onClick={endDemoSession}><LogOut size={15} /> Sign out</Link>}
      />
      <form onSubmit={save}>
        <div className="profile-layout">
          <section className="panel profile-avatar-panel">
            <span className="eyebrow">YOUR AVATAR</span>
            <img className="profile-avatar" src={preview || resolveApiUrl(avatar) || demoUser.avatarUrl} alt="Profile avatar preview" />
            <div className="avatar-choices">
              {avatarChoices.map((choice) => (
                <button type="button" key={choice} className={avatar === choice && !preview ? 'selected' : ''} onClick={() => { setAvatar(choice); setAvatarFile(null); setPreview('') }}>
                  <img src={choice} alt="Choose avatar" />
                </button>
              ))}
            </div>
            <label className="upload-avatar">Upload a photo
              <input type="file" accept="image/*" onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  if (file.size > 5 * 1024 * 1024) { window.alert('Choose an image under 5 MB.'); return }
                  setAvatarFile(file)
                  setPreview(URL.createObjectURL(file))
                }
              }} />
            </label>
            {preview && <button type="button" className="text-link" onClick={() => { setAvatarFile(null); setPreview('') }}>Remove photo preview <X size={13} /></button>}
          </section>
          <section className="panel profile-fields">
            <span className="eyebrow">ACCOUNT INFORMATION</span>
            <label>Display name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
            <label>About you<textarea rows={3} placeholder="A little about yourself and community involvement…" value={bio} onChange={(e) => setBio(e.target.value)} /></label>
            <label>General location<input placeholder="e.g. Northside" value={location} onChange={(e) => setLocation(e.target.value)} /></label>
            <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Telephone number<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Optional · not displayed publicly" /></label>
            <div className="preference-list">
              <label><input type="checkbox" defaultChecked /> Notify me about potential matches</label>
              <label><input type="checkbox" defaultChecked /> Notify me about new messages</label>
              <label><input type="checkbox" /> Show general area on reports</label>
            </div>
            <div className="privacy-callout">
              <LockKeyhole size={17} />
              <p>Your profile and contact preferences are stored securely on your LostLink AI account.</p>
            </div>
            {error && <p className="error-inline" style={{ color: '#ef4444', fontSize: '13px', margin: '8px 0' }}>{error}</p>}
            {saved && <p className="success-inline"><Check size={14} /> Profile preferences saved.</p>}
            <button className="button button-amber" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'} <Check size={15} />
            </button>
          </section>
        </div>
      </form>
    </div>
  )
}

export function MessagesPage() {
  const [searchParams] = useSearchParams()
  const targetItemId = searchParams.get('itemId') || ''
  const targetMatchId = searchParams.get('matchId') || ''
  const targetReceiverId = searchParams.get('reporterId') || ''

  const [text, setText] = useState('')
  const [messages, setMessages] = useState<AppMessage[]>(() => messageService.listAccessibleMessages('me'))
  const [sending, setSending] = useState(false)
  const profile = getCurrentProfile()

  useEffect(() => {
    void messageService.fetchMessages().then(setMessages)
  }, [])

  const activeMessage = messages[0] || demoMessages[0]
  const conversationItemId = targetItemId || (activeMessage ? activeMessage.itemId : '')
  const conversationItem = conversationItemId ? itemService.get(conversationItemId) : undefined

  async function send(event: FormEvent) {
    event.preventDefault()
    if (!text.trim() || sending) return

    setSending(true)
    const msg = await messageService.sendMessage({
      itemId: conversationItemId,
      matchId: targetMatchId || activeMessage?.matchId,
      receiverId: targetReceiverId || (activeMessage ? activeMessage.from : undefined),
      text: text.trim(),
    })
    setMessages((prev) => [...prev, msg])
    setText('')
    setSending(false)
  }

  return (
    <div className="page-shell messages-page">
      <SectionHeading eyebrow="PRIVATE CONVERSATIONS" title="Messages" description="A thoughtful question can bring the right details to light." />
      <div className="message-layout">
        <aside className="conversation-list">
          <span className="eyebrow">COMMUNITY CONVERSATIONS</span>
          <div className="conversation selected">
            <img src="https://i.pravatar.cc/100?img=47" alt="" />
            <span>
              <b>{activeMessage?.receiverName || activeMessage?.senderName || 'Community Member'}</b>
              <small>{conversationItem ? `About: ${conversationItem.title}` : 'Direct listing discussion'}</small>
            </span>
            <i />
          </div>
        </aside>
        <section className="conversation-panel">
          <div className="conversation-head">
            <img src="https://i.pravatar.cc/100?img=47" alt="" />
            <span>
              <b>{activeMessage?.receiverName || activeMessage?.senderName || 'Community Member'}</b>
              <small>Verified connection</small>
            </span>
            <ShieldCheck size={17} />
          </div>
          {conversationItem && (
            <div className="conversation-context">
              <ItemVisual title={conversationItem.title} src={conversationItem.imageUrls[0]} />
              <span><small>ABOUT THIS LISTING</small><b>{conversationItem.title}</b></span>
              <Link to={`/items/${conversationItem.id}`}>View <ArrowUpRight size={13} /></Link>
            </div>
          )}
          <div className="chat-thread">
            <div className="chat-date">CONVERSATION THREAD</div>
            {messages.map((m) => {
              const isMe = m.from === 'me' || m.from === profile.id
              return (
                <div className={`chat-bubble ${isMe ? 'sent' : 'received'}`} key={m.id}>
                  {m.text}
                  <small>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
              )
            })}
          </div>
          <form className="message-compose" onSubmit={send}>
            <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a private message…" aria-label="Message text" />
            <button type="submit" aria-label="Send message" disabled={sending}><Send size={17} /></button>
          </form>
          <small className="safe-message"><LockKeyhole size={12} /> Keep sensitive personal details and addresses private until confirmed.</small>
        </section>
      </div>
    </div>
  )
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => notificationService.list())

  useEffect(() => {
    void notificationService.fetchNotifications().then(setNotifications)
  }, [])

  async function markRead(id: string) {
    await notificationService.markRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  async function markAll() {
    await notificationService.markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="page-shell notifications-page">
      <SectionHeading eyebrow="THE LITTLE UPDATES" title="Notifications" description="Keep up with the conversations and connections around your reports." action={<button className="text-link" onClick={markAll}>Mark all read <Check size={14} /></button>} />
      <div className="notification-list">
        {notifications.map((note) => (
          <Link to={note.href} className={`notification-row ${note.read ? 'read' : ''}`} key={note.id} onClick={() => markRead(note.id)}>
            <span className={`notification-icon ${note.kind}`}>{note.kind === 'match' ? <Sparkles /> : note.kind === 'message' ? <MessageCircle /> : <CheckCircle2 />}</span>
            <span>
              <b>{note.title}</b>
              <p>{note.body}</p>
              <small>{new Date(note.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</small>
            </span>
            {!note.read && <i />}
          </Link>
        ))}
      </div>
    </div>
  )
}

const helpArticles = [
  { category: 'Getting started', title: 'What does LostLink AI do?', text: 'A community-led platform to report lost belongings, register found items, and match them intelligently using AI and location signals.' },
  { category: 'Getting started', title: 'How do I create an account?', text: 'Click Sign Up to register with your name, email and a secure password. You will receive immediate access to report and track items.' },
  { category: 'Reporting', title: 'How to report a lost item', text: 'Choose Report lost, enter the item name, category, and descriptive details. Add date, approximate location and any identifying features only you know.' },
  { category: 'Reporting', title: 'How to register a found item', text: 'Choose Report found, describe where and when you found it, and keep it safe. Keep unique ownership details off the public listing for safety.' },
  { category: 'Reporting', title: 'Taking helpful photographs', text: 'Take clear photos with a neutral background. You can upload up to 5 photos (JPEG, PNG, or WebP) up to 5 MB each.' },
  { category: 'Matching & safety', title: 'How AI matching works', text: 'Our backend compares report descriptions, categories, dates, locations, and semantic embeddings to highlight potential candidate matches.' },
  { category: 'Matching & safety', title: 'How should I interpret a match?', text: 'A score is an estimate, not legal proof of ownership. Verify ownership by asking the reporter to describe undisclosed details before returning.' },
  { category: 'Matching & safety', title: 'Contacting someone safely', text: 'Use the in-app private messages feature. Meet in a well-lit, public location or campus desk for item handoff.' },
  { category: 'Matching & safety', title: 'Verifying ownership', text: 'Ask for serial numbers, receipts, unique markings or internal contents before handing over found valuables.' },
  { category: 'Your account', title: 'Profile, avatar and notifications', text: 'Customize your profile, avatar, telephone number and notification preferences in the Profile section.' },
  { category: 'Privacy', title: 'How are my details handled?', text: 'Your contact details and passwords are encrypted and never shown publicly on listings. Passwords use bcrypt hashing and tokens use signed JWT.' },
  { category: 'Privacy', title: 'Report something suspicious', text: 'Use the Report a concern button on any item detail page to immediately notify administrators and moderators for review.' },
]

type HelpGuideline = { title: string; icon: LucideIcon; points: string[] }

const helpDos: HelpGuideline[] = [
  {
    title: 'Provide accurate item descriptions',
    icon: FileText,
    points: [
      'Describe the item clearly.',
      'Include its colour, brand, type, and distinguishing features.',
      'Provide useful details that can help identify the item.',
      'Avoid misleading or exaggerated descriptions.',
    ],
  },
  {
    title: 'Upload clear photographs',
    icon: Upload,
    points: [
      'Use genuine photographs of the actual item where possible.',
      'Ensure the image is clear and relevant.',
      'Avoid heavily edited or misleading images.',
      'Only upload images you are authorized to share.',
    ],
  },
  {
    title: 'Provide accurate locations and dates',
    icon: MapPin,
    points: [
      'Specify where the item was lost or found.',
      'Provide the correct date or approximate time.',
      'Use location details that help others identify the relevant area.',
      'Update the report if the information changes.',
    ],
  },
  {
    title: 'Report found items responsibly',
    icon: HeartHandshake,
    points: [
      'Report discovered property honestly.',
      'Describe the item’s condition.',
      'Keep found property safe while arranging an appropriate handover.',
      'Follow applicable local laws and institutional procedures.',
    ],
  },
  {
    title: 'Verify ownership before returning an item',
    icon: ShieldCheck,
    points: [
      'Ask the claimant to describe identifying characteristics.',
      'Request reasonable proof of ownership.',
      'Confirm distinguishing details that are not publicly disclosed in the listing.',
      'Use the platform’s available communication and recovery process.',
    ],
  },
  {
    title: 'Communicate respectfully',
    icon: MessageCircle,
    points: [
      'Be polite when contacting other users.',
      'Respond to legitimate enquiries.',
      'Avoid harassment, threats, or unnecessary confrontation.',
      'Keep communication relevant to recovering the property.',
    ],
  },
  {
    title: 'Protect your personal information',
    icon: LockKeyhole,
    points: [
      'Share only information necessary for the recovery process.',
      'Use available system communication channels where possible.',
      'Arrange safe handovers in appropriate public or supervised locations.',
    ],
  },
  {
    title: 'Update your reports',
    icon: CheckCircle2,
    points: [
      'Update a report when an item has been recovered.',
      'Notify the appropriate users or administrators.',
      'Avoid leaving resolved listings active unnecessarily.',
      'Provide accurate status updates.',
    ],
  },
]

const helpDonts: HelpGuideline[] = [
  {
    title: 'Don’t submit false reports',
    icon: FileText,
    points: [
      'Do not report items you have not actually lost or found.',
      'Do not fabricate item descriptions or locations.',
      'Do not create duplicate reports to manipulate visibility.',
      'Do not submit reports for entertainment or malicious purposes.',
    ],
  },
  {
    title: 'Don’t claim items that aren’t yours',
    icon: Eye,
    points: [
      'Never falsely claim ownership of another person’s belongings.',
      'Do not provide fabricated ownership evidence.',
      'Do not attempt to collect property without proper verification.',
    ],
  },
  {
    title: 'Don’t expose sensitive identifying information',
    icon: LockKeyhole,
    points: [
      'Do not publish full identification numbers, passwords, bank details, or private documents.',
      'Avoid exposing serial numbers or unique security identifiers publicly.',
      'Do not publish private contact details belonging to other people.',
    ],
  },
  {
    title: 'Don’t upload misleading content',
    icon: Upload,
    points: [
      'Do not upload unrelated photographs.',
      'Do not use another person’s image without authorization.',
      'Do not manipulate photographs to misrepresent an item’s condition or identity.',
    ],
  },
  {
    title: 'Don’t demand money or offer rewards deceptively',
    icon: HeartHandshake,
    points: [
      'Do not use false claims to obtain money.',
      'Do not demand payment before establishing legitimate ownership and following approved recovery procedures.',
      'Do not impersonate the owner or a system administrator.',
    ],
  },
  {
    title: 'Don’t arrange unsafe handovers',
    icon: MapPin,
    points: [
      'Avoid isolated or unfamiliar meeting locations.',
      'Do not disclose your home address unnecessarily.',
      'Do not meet suspicious individuals alone.',
      'Do not put yourself at risk to recover property.',
    ],
  },
  {
    title: 'Don’t misuse the communication system',
    icon: MessageCircle,
    points: [
      'Do not spam other users.',
      'Do not send abusive, threatening, or inappropriate messages.',
      'Do not harass users who cannot respond immediately.',
      'Do not impersonate other users.',
    ],
  },
  {
    title: 'Don’t misuse AI matching',
    icon: Sparkles,
    points: [
      'Do not assume that an AI-generated match automatically proves ownership.',
      'Do not treat similarity scores as definitive verification.',
      'Always verify item details before arranging recovery.',
    ],
  },
]

const safetyReminders = [
  'Never share passwords, OTPs, or banking credentials.',
  'Never pay suspicious individuals claiming to have recovered your property.',
  'Verify ownership before handing over valuable belongings.',
  'Arrange handovers in safe, public, or supervised locations.',
  'Report suspicious activities to the appropriate system administrators.',
  'Do not attempt to personally confront someone suspected of theft.',
  'For emergencies or suspected criminal activity, contact the appropriate local authorities.',
]

const lostReportChecklist = [
  'Item name and category',
  'Clear description',
  'Last known location',
  'Date and approximate time lost',
  'Relevant identifying characteristics',
  'Photograph, if available',
]

const foundReportChecklist = [
  'Item name and category',
  'Where and when it was found',
  'General item description',
  'Current condition',
  'Photograph, where appropriate and safe to share',
]

const recoverySteps: { title: string; text: string; icon: LucideIcon }[] = [
  { title: 'Discover', text: 'Search existing lost and found reports.', icon: Search },
  { title: 'Identify', text: 'Compare descriptions, locations, dates, and item characteristics.', icon: Eye },
  { title: 'Match', text: 'Review potential AI-generated matches, where available.', icon: Sparkles },
  { title: 'Verify', text: 'Establish legitimate ownership through distinguishing details.', icon: ShieldCheck },
  { title: 'Coordinate', text: 'Arrange a safe handover through the available communication process.', icon: MessageCircle },
  { title: 'Resolve', text: 'Update the report once the item has been successfully recovered.', icon: CheckCircle2 },
]

function HelpGuidelineCard({
  guideline,
  kind,
  id,
  expanded,
  onToggle,
}: {
  guideline: HelpGuideline
  kind: 'do' | 'dont'
  id: string
  expanded: boolean
  onToggle: () => void
}) {
  const Icon = guideline.icon

  return (
    <article className={`guideline-card guideline-card--${kind}`}>
      <button
        className="guideline-card__toggle"
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={onToggle}
      >
        <span className="guideline-card__icon"><Icon size={17} aria-hidden="true" /></span>
        <span className="guideline-card__title">{guideline.title}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <div className={`guideline-card__expand${expanded ? ' is-open' : ''}`} id={id} aria-hidden={!expanded}>
        <div className="guideline-card__expand-inner">
          <ul>
            {guideline.points.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </div>
      </div>
    </article>
  )
}

export function HelpCenterPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All topics')
  const [expanded, setExpanded] = useState<string | null>(helpArticles[0].title)
  const [expandedGuideline, setExpandedGuideline] = useState<string | null>(null)
  const reducedMotion = useReducedMotion()
  const categoriesList = ['All topics', ...new Set(helpArticles.map((article) => article.category))]
  const results = helpArticles.filter((article) => (category === 'All topics' || article.category === category) && `${article.title} ${article.text} ${article.category}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="page-shell help-page">
      <PageIntro kicker="HERE WHEN YOU NEED US" title="Help, with a human touch." text="Answers for the small steps that bring the important things back." />
      <label className="help-search">
        <Search size={18} aria-hidden="true" />
        <input aria-label="Search help articles" placeholder="Search articles, topics, questions…" value={query} onChange={(event) => setQuery(event.target.value)} />
        <kbd aria-hidden="true">⌘ K</kbd>
      </label>
      <div className="help-categories">
        {categoriesList.map((name) => (
          <button
            key={name}
            type="button"
            className={category === name ? 'active' : ''}
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
          >
            <span className="help-category-label">{name}</span>
            {category === name && (
              <motion.span
                className="help-category-indicator"
                layoutId="help-faq-category-indicator"
                aria-hidden="true"
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 36 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="help-layout">
        <div className="help-articles">
          <AnimatePresence initial={false} mode="popLayout">
            {results.length ? (
              results.map((article, index) => {
                const articleIndex = helpArticles.indexOf(article)
                const questionId = `help-faq-question-${articleIndex}`
                const answerId = `help-faq-answer-${articleIndex}`
                const isExpanded = expanded === article.title

                return (
                  <motion.article
                    className={`help-article${isExpanded ? ' is-expanded' : ''}`}
                    key={article.title}
                    layout="position"
                    initial={reducedMotion ? false : { opacity: 0, y: 9 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
                    transition={{
                      duration: reducedMotion ? 0 : 0.24,
                      delay: reducedMotion ? 0 : Math.min(index * 0.025, 0.15),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ transformPerspective: 900 }}
                    whileHover={reducedMotion ? undefined : { y: -2, rotateX: 0.3 }}
                  >
                    <button
                      className="help-article__trigger"
                      id={questionId}
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={answerId}
                      onClick={() => setExpanded(isExpanded ? null : article.title)}
                    >
                      <span className="article-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="faq-question-copy">
                        <small>{article.category}</small>
                        <b>{article.title}</b>
                      </span>
                      <span className={`faq-question-icon${isExpanded ? ' is-expanded' : ''}`} aria-hidden="true">
                        <Plus className="faq-icon-plus" size={17} />
                        <Minus className="faq-icon-minus" size={17} />
                      </span>
                    </button>
                    <motion.div
                      className="faq-answer"
                      id={answerId}
                      role="region"
                      aria-labelledby={questionId}
                      aria-hidden={!isExpanded}
                      initial={false}
                      animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                      transition={{
                        height: { duration: reducedMotion ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' },
                      }}
                    >
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            className="faq-answer__content"
                            key="answer-content"
                            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                            transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
                          >
                            <span className="faq-answer__marker"><CircleHelp size={15} aria-hidden="true" /><span>Helpful information</span></span>
                            <p>{article.text}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.article>
                )
              })
            ) : (
              <motion.div
                className="empty-state help-empty"
                key="no-help-results"
                role="status"
                aria-live="polite"
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
              >
                <h2>No articles found</h2><p>Try another search term or category.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <aside className="support-card">
          <CircleHelp size={22} />
          <span className="eyebrow">STILL LOOKING?</span>
          <h2>We’re happy to help.</h2>
          <p>Send a note to our support team. Please leave out sensitive personal information.</p>
          <a className="button button-amber" href="mailto:support@lostlink.ai">Contact support <ArrowUpRight size={15} /></a>
          <small>Help center · Community support</small>
        </aside>
      </div>
      <section className="dos-donts-section" aria-labelledby="guidelines-heading">
        <div className="guidelines-intro">
          <span className="eyebrow">USE LOSTLINK AI RESPONSIBLY</span>
          <h2 id="guidelines-heading">Dos &amp; Don’ts of Using LostLink AI</h2>
          <p>These guidelines help keep item reports trustworthy, communication respectful, and recovery safer for everyone.</p>
        </div>
        <div className="dos-donts-grid">
          <section className="guideline-column guideline-column--do" aria-labelledby="guidelines-do-heading">
            <div className="guideline-column__heading">
              <span className="guideline-column__badge"><Check size={15} aria-hidden="true" /></span>
              <div><h3 id="guidelines-do-heading">Do: Best practices</h3><p>Help the right item find its way home.</p></div>
            </div>
            <div className="guideline-column__cards">
              {helpDos.map((guideline, index) => {
                const id = `help-do-guideline-${index}`
                return (
                  <HelpGuidelineCard
                    key={guideline.title}
                    guideline={guideline}
                    kind="do"
                    id={id}
                    expanded={expandedGuideline === id}
                    onToggle={() => setExpandedGuideline(expandedGuideline === id ? null : id)}
                  />
                )
              })}
            </div>
          </section>
          <section className="guideline-column guideline-column--dont" aria-labelledby="guidelines-dont-heading">
            <div className="guideline-column__heading">
              <span className="guideline-column__badge"><X size={15} aria-hidden="true" /></span>
              <div><h3 id="guidelines-dont-heading">Don’t: Things to avoid</h3><p>Protect yourself and the LostLink community.</p></div>
            </div>
            <div className="guideline-column__cards">
              {helpDonts.map((guideline, index) => {
                const id = `help-dont-guideline-${index}`
                return (
                  <HelpGuidelineCard
                    key={guideline.title}
                    guideline={guideline}
                    kind="dont"
                    id={id}
                    expanded={expandedGuideline === id}
                    onToggle={() => setExpandedGuideline(expandedGuideline === id ? null : id)}
                  />
                )
              })}
            </div>
          </section>
        </div>
      </section>
      <section className="safety-panel" aria-labelledby="safety-panel-heading">
        <div className="safety-panel__header">
          <span className="safety-panel__icon"><ShieldCheck size={21} aria-hidden="true" /></span>
          <div>
            <span className="eyebrow">IMPORTANT SAFETY REMINDER</span>
            <h2 id="safety-panel-heading">Your safety comes first</h2>
            <p>LostLink AI helps people connect about lost property, but it does not replace good judgment or local authorities.</p>
          </div>
        </div>
        <ul className="safety-panel__list">
          {safetyReminders.map((reminder) => (
            <li key={reminder}><ShieldCheck size={15} aria-hidden="true" /><span>{reminder}</span></li>
          ))}
        </ul>
        <p className="safety-panel__note"><Sparkles size={14} aria-hidden="true" /> AI-generated matches are suggestions only—not proof of ownership. Always verify item details before arranging a handover.</p>
      </section>
      <section className="reporting-guide" aria-labelledby="reporting-guide-heading">
        <div className="reporting-guide__intro">
          <span className="eyebrow">A CLEAR REPORT HELPS</span>
          <h2 id="reporting-guide-heading">Before you submit a report</h2>
          <p>Include useful details while keeping private information out of public descriptions.</p>
        </div>
        <div className="reporting-checklists">
          <section className="reporting-checklist" aria-labelledby="lost-checklist-heading">
            <div className="reporting-checklist__heading">
              <span><FileText size={17} aria-hidden="true" /></span>
              <h3 id="lost-checklist-heading">Reporting a lost item</h3>
            </div>
            <ul>
              {lostReportChecklist.map((item) => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}
            </ul>
          </section>
          <section className="reporting-checklist" aria-labelledby="found-checklist-heading">
            <div className="reporting-checklist__heading">
              <span><HeartHandshake size={17} aria-hidden="true" /></span>
              <h3 id="found-checklist-heading">Reporting a found item</h3>
            </div>
            <ul>
              {foundReportChecklist.map((item) => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}
            </ul>
          </section>
        </div>
        <p className="reporting-guide__privacy"><LockKeyhole size={15} aria-hidden="true" /> Keep one or two distinctive details private so a claimant can verify ownership. Never include passwords, full identification numbers, banking details, or another person’s private information in a public report.</p>
      </section>
      <section className="recovery-process" aria-labelledby="recovery-process-heading">
        <div className="reporting-guide__intro">
          <span className="eyebrow">FROM SEARCH TO SAFE RETURN</span>
          <h2 id="recovery-process-heading">The responsible recovery process</h2>
          <p>Follow these steps to move from a possible match to a well-coordinated resolution.</p>
        </div>
        <ol className="recovery-steps">
          {recoverySteps.map(({ title, text, icon: Icon }, index) => (
            <li className="recovery-step" key={title}>
              <div className="recovery-step__top">
                <span className="recovery-step__number">{String(index + 1).padStart(2, '0')}</span>
                <Icon size={18} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <div className="help-footnote"><ShieldCheck size={15} /> For a safe return, always verify ownership in private and meet in a public place.</div>
    </div>
  )
}
