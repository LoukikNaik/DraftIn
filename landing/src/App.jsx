import { useState, useEffect, useRef } from 'react'

const GH = 'https://github.com/LoukikNaik/DraftIn'

// ── Intersection-based reveal ────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

// ── Animated counter ─────────────────────────────────────────────
function AnimCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.5 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    let start = null
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1100, 1)
      setCount(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target])
  return <span ref={ref}>{count}{suffix}</span>
}

// ── Icons ────────────────────────────────────────────────────────
const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

// ── Brand mark (fountain-pen nib in a brand-blue tile) ──────────
const BrandMark = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden>
    <rect width="128" height="128" rx="26" fill="#0A66C2"/>
    <g transform="translate(64 64)">
      <path
        d="M 0 -46 C -14 -46 -20 -40 -20 -30 L -20 16 Q -20 19 -18 21 L 0 46 L 18 21 Q 20 19 20 16 L 20 -30 C 20 -40 14 -46 0 -46 Z"
        fill="#FFFFFF"
      />
      <line x1="0" y1="-16" x2="0" y2="40" stroke="#0A66C2" strokeWidth="2.6" strokeLinecap="round"/>
      <circle cx="0" cy="-20" r="3.8" fill="#0A66C2"/>
    </g>
  </svg>
)

// ── Nav ──────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav className={`nav${scrolled ? ' nav--up' : ''}`}>
      <a href="/" className="nav-logo">
        <span className="nav-logo-word">Draft</span>
        <span className="nav-logo-tile" aria-hidden>in</span>
      </a>
      <div className="nav-right">
        <a href="#how" className="nav-text-link">How it works</a>
        <a href={GH} className="nav-gh" target="_blank" rel="noopener noreferrer">
          <GithubIcon size={14} />
          GitHub
        </a>
      </div>
    </nav>
  )
}

// ── Hero ─────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid" aria-hidden />
      <div className="hero-inner">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Open source · Chrome MV3 · No API key
        </div>
        <h1 className="hero-h1">
          Cold outreach. <span className="hero-highlight">One keystroke.</span>
        </h1>
        <p className="hero-p">
          Open any LinkedIn page. Press <kbd>Alt+L</kbd>. Paste a personalized
          message into the DM with <kbd>⌘V</kbd>. DraftIn reads the screen,
          writes the message in your voice, and lands it on your clipboard.
          It runs through your existing ChatGPT subscription. No API keys.
          No SaaS dashboard. No copy paste from another tab.
        </p>
        <div className="hero-ctas">
          <a href={GH} className="btn-primary" target="_blank" rel="noopener noreferrer">
            <GithubIcon size={15} />
            Star on GitHub
          </a>
          <a href="#demo" className="btn-outline">
            See it in action <ArrowRight />
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Stats bar ────────────────────────────────────────────────────
const STATS = [
  { n: 1,   suffix: '',  label: 'Keystroke from page to draft' },
  { n: 0,   suffix: '',  label: 'API keys needed' },
  { n: 100, suffix: '%', label: 'On your machine' },
  { n: 3,   suffix: '+', label: 'Pages per draft' },
]

function StatsBar() {
  return (
    <div className="stats-bar">
      {STATS.map(s => (
        <div key={s.label} className="stat">
          <span className="stat-n">
            <AnimCounter target={s.n} suffix={s.suffix} />
          </span>
          <span className="stat-l">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── LinkedIn UI icons ─────────────────────────────────────────────
const LIIcons = {
  plus: <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden><path d="M14 8a1 1 0 0 1-1 1H9v4a1 1 0 1 1-2 0V9H3a1 1 0 0 1 0-2h4V3a1 1 0 0 1 2 0v4h4a1 1 0 0 1 1 1z"/></svg>,
  chat: <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden><path d="M14 1.75A1.76 1.76 0 0 0 12.25 0h-8.5A1.76 1.76 0 0 0 2 1.75v9.5A1.76 1.76 0 0 0 3.75 13H8l4 3v-3h.25A1.76 1.76 0 0 0 14 11.25z"/></svg>,
  ellipsis: <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden><circle cx="3.5" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="12.5" cy="8" r="1.5"/></svg>,
  globe: <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM2.5 8a5.5 5.5 0 0 1 .7-2.66L6 8.78v.97a1 1 0 0 0 .29.7l1.71 1.71V13a5.5 5.5 0 0 1-5.5-5zm10.31 1.62A1.5 1.5 0 0 0 11.5 9h-1v-2a1 1 0 0 0-1-1H6V4.5h1a1 1 0 0 0 1-1V3a5.5 5.5 0 0 1 4.81 6.62z"/></svg>,
  like: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M19.46 11l-3.91-3.91a7 7 0 0 1-1.69-2.74l-.49-1.47A2.76 2.76 0 0 0 10.76 1 2.75 2.75 0 0 0 8 3.74v1.12a9.19 9.19 0 0 0 .46 2.85L8.89 9H4.12A2.12 2.12 0 0 0 2 11.12a2.16 2.16 0 0 0 .92 1.76A2.11 2.11 0 0 0 2 14.62a2.14 2.14 0 0 0 1.28 2 2 2 0 0 0-.28 1 2.12 2.12 0 0 0 2 2.12v.14A2.12 2.12 0 0 0 7.12 22h7.49a8.08 8.08 0 0 0 3.58-.84l.31-.16H21V11z"/></svg>,
  comment: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M7 9h10v1H7zm0 4h7v-1H7zm16-2a6.78 6.78 0 0 1-2.84 5.61L12 22v-4H8A7 7 0 0 1 8 4h8a7 7 0 0 1 7 7zm-2 0a5 5 0 0 0-5-5H8a5 5 0 0 0 0 10h6v2.28L19 15a4.79 4.79 0 0 0 2-4z"/></svg>,
  repost: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M19 8.92h-9.61l1.96-1.96-1.41-1.42L5.5 9.99l4.44 4.43 1.42-1.42-2-2H19v6H5v-9H3v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"/></svg>,
  send: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M21 3 0 10l7.66 4.26L16 8l-6.26 8.34L14 24l7-21z"/></svg>,
  check: <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden><path d="M6 11.78 3.22 9l-.94.94L6 13.66l8-8-.94-.94L6 11.78z"/></svg>,
  search: <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden><path d="M6.5 12a5.5 5.5 0 1 1 3.74-1.46l4.11 4.11-1.06 1.06-4.11-4.11A5.48 5.48 0 0 1 6.5 12zm0-2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>,
  home: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d="M23 9v2h-2v7a2 2 0 0 1-2 2h-4v-6h-4v6H7a2 2 0 0 1-2-2v-7H3V9l10-7 10 7z"/></svg>,
  network: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d="M12 16v6H3v-1a5 5 0 0 1 5-5h1a5 5 0 0 1 3 1zm5-7.3a2.7 2.7 0 1 1-2.7-2.7A2.7 2.7 0 0 1 17 8.7zM17 12a5 5 0 0 0-5 5v.13a8 8 0 0 1 4.31 4.4 6.91 6.91 0 0 0 5.69-3 7 7 0 0 0-2-3.91A5 5 0 0 0 17 12zM8.5 11a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/></svg>,
  briefcase: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d="M17 6V5a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v1H2v4a3 3 0 0 0 3 3h3v-2h8v2h3a3 3 0 0 0 3-3V6zm-8 0V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1zM2 19a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-4H2z"/></svg>,
  msg: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d="M16 4H8a7 7 0 0 0 0 14h4v4l8.16-5.39A6.78 6.78 0 0 0 23 11a7 7 0 0 0-7-7z"/></svg>,
  bell: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d="M22 19h-8.28a2 2 0 1 1-3.44 0H2v-1l2-2v-4a8 8 0 1 1 16 0v4l2 2z"/></svg>,
  paperclip: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d="M19 7v8a7 7 0 0 1-14 0V5a5 5 0 0 1 10 0v10a3 3 0 0 1-6 0V7h2v8a1 1 0 0 0 2 0V5a3 3 0 0 0-6 0v10a5 5 0 0 0 10 0V7z"/></svg>,
  image: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d="M21 3H3v18h18zM5 19l3.5-4.5 2.5 3 3.5-4.5 4.5 6zM8 9a2 2 0 1 1-2-2 2 2 0 0 1 2 2z"/></svg>,
  smile: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-3.5 7A1.5 1.5 0 1 1 7 10.5 1.5 1.5 0 0 1 8.5 9zm7 0A1.5 1.5 0 1 1 14 10.5 1.5 1.5 0 0 1 15.5 9zM12 17.5A5.5 5.5 0 0 1 6.5 13h11a5.5 5.5 0 0 1-5.5 4.5z"/></svg>,
  video: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M20 6.5 14.5 10V7a2 2 0 0 0-2-2h-9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3l5.5 3.5z"/></svg>,
  minus: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M5 11h14v2H5z"/></svg>,
  close: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4-6.3-6.3L4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/></svg>,
  gif: 'GIF',
}

// ── LinkedIn top nav (lifts the mocks to "page screenshot" fidelity) ─
function LinkedInTopNav({ activeItem = 'home' }) {
  const items = [
    { key: 'home',    icon: LIIcons.home,      label: 'Home' },
    { key: 'network', icon: LIIcons.network,   label: 'My Network' },
    { key: 'jobs',    icon: LIIcons.briefcase, label: 'Jobs' },
    { key: 'msg',     icon: LIIcons.msg,       label: 'Messaging' },
    { key: 'bell',    icon: LIIcons.bell,      label: 'Notifications' },
  ]
  return (
    <div className="li-topnav">
      <div className="li-topnav-left">
        <span className="li-topnav-logo">in</span>
        <div className="li-topnav-search">
          {LIIcons.search}
          <span className="li-topnav-search-text">Search</span>
        </div>
      </div>
      <div className="li-topnav-items">
        {items.map(it => (
          <div key={it.key} className={`li-topnav-item${activeItem === it.key ? ' li-topnav-item--active' : ''}`}>
            <span className="li-topnav-icon">{it.icon}</span>
            <span className="li-topnav-label">{it.label}</span>
          </div>
        ))}
        <div className="li-topnav-divider" />
        <div className="li-topnav-me">
          <div className="li-topnav-me-avatar" />
          <span className="li-topnav-me-label">Me ▾</span>
        </div>
      </div>
    </div>
  )
}

// ── LinkedIn Profile mock ─────────────────────────────────────────
function LinkedInProfileMock({
  name, pronouns, headline, location, connections = '500+',
  banner, avatarText, avatarTint = '#0A66C2', avatarTextColor = '#fff',
  mutuals, about, role, company, companyInitial, companyTint = '#0E0E10',
  dates, duration, captureBadge = true,
}) {
  return (
    <div className="li li-profile-mock">
      {captureBadge && (
        <span className="li-capture-badge">
          <span className="li-capture-dot" />
          Captured · Alt+K
        </span>
      )}
      <LinkedInTopNav activeItem="network" />
      <div className="li-cover" style={{ background: banner }} />
      <div className="li-profile-body">
        <div className="li-avatar-wrap">
          <div className="li-avatar li-avatar-lg" style={{ background: avatarTint, color: avatarTextColor }}>
            {avatarText}
          </div>
        </div>
        <div className="li-name-row">
          <h4 className="li-name">{name}</h4>
          {pronouns && <span className="li-pron">({pronouns})</span>}
          <span className="li-degree">· 2nd</span>
        </div>
        <p className="li-headline">{headline}</p>
        <p className="li-meta">
          <span>{location}</span>
          <span className="li-meta-sep">·</span>
          <a className="li-link">Contact info</a>
        </p>
        <p className="li-meta">
          <a className="li-link"><strong>{connections}</strong> connections</a>
        </p>
        {mutuals && (
          <div className="li-mutuals">
            <span className="li-mut-stack">
              <span className="li-mut-dot" style={{ background: '#9CA3AF' }} />
              <span className="li-mut-dot" style={{ background: '#6B7280' }} />
              <span className="li-mut-dot" style={{ background: '#4B5563' }} />
            </span>
            <span className="li-mut-text">{mutuals}</span>
          </div>
        )}
        <div className="li-actions">
          <button className="li-btn li-btn-primary">{LIIcons.plus} Connect</button>
          <button className="li-btn li-btn-outline">{LIIcons.chat} Message</button>
          <button className="li-btn li-btn-icon" aria-label="More">{LIIcons.ellipsis}</button>
        </div>
      </div>

      <div className="li-card">
        <h5 className="li-card-h">About</h5>
        <p className="li-about">
          {about}
          <button className="li-see-more">…see more</button>
        </p>
      </div>

      <div className="li-card">
        <h5 className="li-card-h">Experience</h5>
        <div className="li-exp">
          <div className="li-exp-logo" style={{ background: companyTint }}>{companyInitial}</div>
          <div className="li-exp-body">
            <div className="li-exp-role">{role}</div>
            <div className="li-exp-co">{company} <span className="li-meta-sep">·</span> Full-time</div>
            <div className="li-exp-dates">{dates} <span className="li-meta-sep">·</span> {duration}</div>
            <div className="li-exp-loc">{location}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── LinkedIn Post mock ────────────────────────────────────────────
function LinkedInPostMock({
  authorName, authorHeadline, time = '2d',
  avatarText, avatarTint = '#0A66C2', avatarTextColor = '#fff',
  body, reactions = '128', comments = '24', reposts = '6',
  captureBadge = true,
}) {
  return (
    <div className="li li-post-mock">
      {captureBadge && (
        <span className="li-capture-badge">
          <span className="li-capture-dot" />
          Captured · Alt+K
        </span>
      )}
      <LinkedInTopNav activeItem="home" />
      <div className="li-post-head">
        <div className="li-avatar li-avatar-md" style={{ background: avatarTint, color: avatarTextColor }}>
          {avatarText}
        </div>
        <div className="li-post-id">
          <div className="li-post-name-row">
            <span className="li-post-name">{authorName}</span>
            <span className="li-degree">· 2nd</span>
          </div>
          <div className="li-post-headline">{authorHeadline}</div>
          <div className="li-post-meta">
            <span>{time}</span>
            <span className="li-meta-sep">·</span>
            {LIIcons.globe}
          </div>
        </div>
        <button className="li-icon-btn" aria-label="More">{LIIcons.ellipsis}</button>
      </div>

      <div className="li-post-body">
        {body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
        <button className="li-see-more">…see more</button>
      </div>

      <div className="li-react-row">
        <span className="li-emojis" aria-hidden>
          <span className="li-emoji" style={{ background: '#0A66C2' }}>👍</span>
          <span className="li-emoji" style={{ background: '#DF704D' }}>❤️</span>
          <span className="li-emoji" style={{ background: '#F5BB5C' }}>💡</span>
        </span>
        <span className="li-react-count">{reactions}</span>
        <span className="li-react-right">
          {comments} comments <span className="li-meta-sep">·</span> {reposts} reposts
        </span>
      </div>

      <div className="li-action-bar">
        <button className="li-action">{LIIcons.like} Like</button>
        <button className="li-action">{LIIcons.comment} Comment</button>
        <button className="li-action">{LIIcons.repost} Repost</button>
        <button className="li-action">{LIIcons.send} Send</button>
      </div>
    </div>
  )
}

// ── Drafted-message panel ─────────────────────────────────────────
function DraftPanel({ subject, draft }) {
  return (
    <div className="draft-panel">
      <div className="draft-panel-head">
        <span className="draft-panel-dot" />
        Drafted · on clipboard
        <span className="draft-panel-time">{subject}</span>
      </div>
      <pre className="draft-panel-body">{draft}</pre>
      <div className="draft-panel-foot">
        <span className="draft-panel-kbd">⌘V</span>
        <span className="draft-panel-foot-text">ready to paste</span>
      </div>
    </div>
  )
}

// ── Example row composer ──────────────────────────────────────────
function ExampleRow({ children, draft, subject, label, delay = 0 }) {
  const [ref, visible] = useReveal(0.08)
  return (
    <div
      ref={ref}
      className={`example-row${visible ? ' visible' : ''}`}
      style={{ '--delay': `${delay}ms` }}
    >
      <div className="example-source">
        <span className="example-label">
          <span className="example-label-dot" />
          {label}
        </span>
        {children}
      </div>
      <div className="example-flow" aria-hidden>
        <span className="example-flow-kbd">Alt+L</span>
        <svg className="example-flow-arrow" width="44" height="14" viewBox="0 0 44 14" fill="none">
          <path d="M1 7h41m0 0l-6-6m6 6l-6 6" stroke="#0A66C2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="example-output">
        <span className="example-label">
          <span className="example-label-dot example-label-dot--out" />
          Drafted message
        </span>
        <DraftPanel subject={subject} draft={draft} />
      </div>
    </div>
  )
}

// ── Demo section data ─────────────────────────────────────────────
const PRIYA_DRAFT = [
  "Hey Priya, saw the Search Infra hiring post.",
  "",
  "Spent the last 5 years on backend search and storage at Vellum. Most",
  "relevant to what you are describing: cut p99 on a metadata hot path",
  "from 1.2s to 280ms by reshaping the index. No planner rewrite. Shipped",
  "at full traffic. No rollback.",
  "",
  "Resume and a short writeup of the fix below. Happy to chat whenever",
  "works for you.",
].join('\n')

const FOUNDER_POST_DRAFT = [
  "Hey Daniel, the \"wrong eval is worse than no eval\" line is exactly",
  "what we hit at Northwind.",
  "",
  "Rebuilt our eval setup three times before it actually predicted",
  "production behaviour. The second pass looked clean in dashboards but",
  "was masking a 15% regression on long-tail intents. We only caught it",
  "because a single user complained.",
  "",
  "Would love to hear how you are scoping the hand-labeled portion when",
  "the domain shifts faster than the labelers.",
].join('\n')

// ── Demo ──────────────────────────────────────────────────────────
function Demo() {
  const [hRef, hVisible] = useReveal()
  return (
    <section className="demo-section" id="demo">
      <div className="container">
        <div ref={hRef} className={`demo-head${hVisible ? ' visible' : ''}`}>
          <p className="eyebrow">See it in action</p>
          <h2 className="h2">What goes in.<br /><em>What comes out.</em></h2>
          <p className="lead">
            Two real reach-out scenarios. One LinkedIn profile. One LinkedIn
            post. The screenshot on the left is what DraftIn captures and sends
            to GPT. The message on the right is what lands on your clipboard.
          </p>
        </div>

        <ExampleRow
          label="LinkedIn profile · captured screenshot"
          subject="To Priya · ready"
          draft={PRIYA_DRAFT}
          delay={0}
        >
          <LinkedInProfileMock
            name="Priya Shah"
            pronouns="she/her"
            headline="Engineering Manager, Search Infra at Helix. Previously at Pier."
            location="San Francisco, California"
            connections="500+"
            banner="linear-gradient(120deg, #1F4E96 0%, #4A7BC8 55%, #84A9DE 100%)"
            avatarText="PS"
            avatarTint="#1F4E96"
            mutuals="Alex Chen, Sara Patel, and 6 other mutual connections"
            about="I lead the Search Infrastructure team at Helix. We recently shipped the workspace-wide search rewrite. We cut p99 from 1.8s to 350ms without touching the query planner. Always hiring backend ICs who care about latency the way most people care about features."
            role="Engineering Manager, Search Infrastructure"
            company="Helix"
            companyInitial="H"
            companyTint="#0E0E10"
            dates="Mar 2022 to Present"
            duration="3 yrs 3 mos"
          />
        </ExampleRow>

        <ExampleRow
          label="LinkedIn post · captured screenshot"
          subject="To Daniel · ready"
          draft={FOUNDER_POST_DRAFT}
          delay={120}
        >
          <LinkedInPostMock
            authorName="Daniel Mercer"
            authorHeadline="Co-founder and CEO at Polaris (YC W25). Building eval tooling for production LLM agents."
            time="3d"
            avatarText="DM"
            avatarTint="#084E97"
            body={[
              "Hot take after 11 months of building eval tooling for production LLM agents: the wrong eval is worse than no eval.",
              "A polished benchmark that looks great in dashboards but masks regressions on the long-tail prompts your real users hit is actively dangerous. It gives the team a false signal to ship.",
              "We rebuilt ours three times. The version that finally worked is the one that hurts when it disagrees with intuition."
            ].join('\n\n')}
            reactions="412"
            comments="58"
            reposts="14"
          />
        </ExampleRow>
      </div>
    </section>
  )
}

// ── Step visualizations ──────────────────────────────────────────
// ── Step 01: 3 captured screenshots, horizontally scrollable ──────
function CapScreenshotHiringPost() {
  return (
    <div className="cap-shot-page cap-shot-post">
      <div className="cap-shot-post-head">
        <div className="cap-shot-post-avatar" style={{ background: '#1F4E96' }}>PS</div>
        <div className="cap-shot-post-id">
          <div className="cap-shot-post-name">
            Priya Shah <span className="cap-shot-degree">· 2nd</span>
          </div>
          <div className="cap-shot-post-headline">Eng Manager · Search Infra at Helix · ex-Pier</div>
          <div className="cap-shot-post-meta">3d · 🌐</div>
        </div>
        <span className="cap-shot-post-more">⋯</span>
      </div>

      <div className="cap-shot-post-body">
        <p><strong>We are hiring 2 backend engineers on the Helix Search Infra team.</strong></p>
        <p>If you have shipped narrow, surgical wins on a hot path (index reshapes,
        query rewrites, p99 cuts under real load), I want to talk. DMs open.
        Reposts appreciated <span className="cap-shot-emoji">🙏</span></p>
      </div>

      <div className="cap-shot-post-react">
        <span className="cap-shot-emoji-stack" aria-hidden>
          <span className="cap-shot-em" style={{ background: '#0A66C2' }}>👍</span>
          <span className="cap-shot-em" style={{ background: '#DF704D' }}>❤️</span>
          <span className="cap-shot-em" style={{ background: '#F5BB5C' }}>💡</span>
        </span>
        <span className="cap-shot-react-count">247</span>
        <span className="cap-shot-react-right">32 comments · 8 reposts</span>
      </div>

      <div className="cap-shot-post-actions">
        <span className="cap-shot-post-action">👍 Like</span>
        <span className="cap-shot-post-action">💬 Comment</span>
        <span className="cap-shot-post-action">🔁 Repost</span>
        <span className="cap-shot-post-action">➤ Send</span>
      </div>
    </div>
  )
}

function CapScreenshotProfileTop() {
  return (
    <div className="cap-shot-page">
      <div className="cap-shot-cover" />
      <div className="cap-shot-avatar" style={{ background: '#1F4E96' }}>PS</div>
      <div className="cap-shot-name">
        Priya Shah <span className="cap-shot-degree">· 2nd</span>
      </div>
      <div className="cap-shot-headline">Eng Manager · Search Infra at Helix · ex-Pier</div>
      <div className="cap-shot-sub">San Francisco · 500+ connections</div>
      <div className="cap-shot-actions">
        <span className="cap-shot-btn cap-shot-btn-primary">Connect</span>
        <span className="cap-shot-btn cap-shot-btn-outline">Message</span>
        <span className="cap-shot-btn cap-shot-btn-icon">⋯</span>
      </div>
      <div className="cap-shot-card">
        <div className="cap-shot-card-h">About</div>
        <div className="cap-shot-line" />
        <div className="cap-shot-line" style={{ width: '82%' }} />
      </div>
    </div>
  )
}

function CapScreenshotProfileExperience() {
  return (
    <div className="cap-shot-page">
      <div className="cap-shot-card cap-shot-card-flush">
        <div className="cap-shot-card-h">Experience</div>
        <div className="cap-shot-exp">
          <div className="cap-shot-logo cap-shot-logo-sm" style={{ background: '#0E0E10' }}>N</div>
          <div>
            <div className="cap-shot-exp-role">Engineering Manager, Search Infrastructure</div>
            <div className="cap-shot-exp-co">Helix · Full-time</div>
            <div className="cap-shot-exp-d">Mar 2022 to Present · 3 yrs 3 mos</div>
            <div className="cap-shot-exp-d">San Francisco, California</div>
          </div>
        </div>
        <div className="cap-shot-divider" />
        <div className="cap-shot-exp">
          <div className="cap-shot-logo cap-shot-logo-sm" style={{ background: '#635BFF' }}>S</div>
          <div>
            <div className="cap-shot-exp-role">Senior Software Engineer</div>
            <div className="cap-shot-exp-co">Pier · Full-time</div>
            <div className="cap-shot-exp-d">Jul 2018 to Mar 2022 · 3 yrs 9 mos</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CAPTURE_SHOTS = [
  { url: 'linkedin.com/feed/update/urn:li:activity:7257…', tag: 'Hiring post', Body: CapScreenshotHiringPost },
  { url: 'linkedin.com/in/priya-shah',  tag: 'Profile · top',            Body: CapScreenshotProfileTop },
  { url: 'linkedin.com/in/priya-shah',  tag: 'Profile · scrolled · Exp', Body: CapScreenshotProfileExperience },
]

function CaptureMock() {
  const [current, setCurrent] = useState(0)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      // brief flash when the next screenshot snaps in
      setFlash(true)
      setTimeout(() => setFlash(false), 220)
      setCurrent(c => (c + 1) % CAPTURE_SHOTS.length)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="cap-mock">
      <div className="cap-stage" aria-live="polite">
        {CAPTURE_SHOTS.map((s, i) => {
          const Body = s.Body
          return (
            <div
              key={i}
              className={`cap-shot${i === current ? ' cap-shot-active' : ''}`}
              aria-hidden={i !== current}
            >
              <div className="cap-shot-bar">
                <span className="cap-window-dot" style={{ background: '#FF5F57' }} />
                <span className="cap-window-dot" style={{ background: '#FEBC2E' }} />
                <span className="cap-window-dot" style={{ background: '#28C840' }} />
                <span className="cap-shot-url">{s.url}</span>
              </div>
              <div className="cap-shot-body">
                <Body />
              </div>
              <div className="cap-shot-corner cap-shot-corner-tl" />
              <div className="cap-shot-corner cap-shot-corner-tr" />
              <div className="cap-shot-corner cap-shot-corner-bl" />
              <div className="cap-shot-corner cap-shot-corner-br" />
              <span className="cap-shot-badge">
                <span className="cap-shot-badge-dot" />
                {String(i + 1).padStart(2, '0')} · {s.tag}
              </span>
            </div>
          )
        })}
        <span className={`cap-stage-flash${flash ? ' cap-stage-flash--on' : ''}`} aria-hidden />
      </div>

      <div className="cap-queue">
        <div className="cap-dots">
          {CAPTURE_SHOTS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`cap-dot${i === current ? ' cap-dot-active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Show screenshot ${i + 1}`}
            />
          ))}
        </div>
        <div className="cap-queue-meta">
          <span className="cap-queue-kbd">Alt+K</span>
          <span className="cap-queue-text">
            {current + 1} of {CAPTURE_SHOTS.length} · {CAPTURE_SHOTS[current].tag}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── ChatGPT mock ─────────────────────────────────────────────────
function ChatGPTLogo({ size = 18 }) {
  // Simplified ChatGPT-mark: 6-lobed flower.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#0E0E10"/>
      <path d="M22.6 14.4a4.4 4.4 0 0 0-.4-3.6 4.5 4.5 0 0 0-4.8-2.1 4.4 4.4 0 0 0-3.3-1.5 4.5 4.5 0 0 0-4.3 3.1 4.4 4.4 0 0 0-3 2.2 4.5 4.5 0 0 0 .6 5.2 4.4 4.4 0 0 0 .4 3.6 4.5 4.5 0 0 0 4.8 2.1 4.4 4.4 0 0 0 3.3 1.5 4.5 4.5 0 0 0 4.3-3.1 4.4 4.4 0 0 0 3-2.2 4.5 4.5 0 0 0-.6-5.2zm-6.7 9.5a3.3 3.3 0 0 1-2.1-.8l.1-.1 3.5-2 .2-.2v-5l1.4.9v4.1a3.3 3.3 0 0 1-3.1 3.1zm-7.1-3a3.3 3.3 0 0 1-.4-2.2l.1.1 3.5 2 .3.1 4.3-2.5v1.7l-3.6 2.1a3.3 3.3 0 0 1-4.2-1.3zm-.9-7.4a3.3 3.3 0 0 1 1.7-1.4v4.2l.1.3 4.3 2.4-1.4.9-3.6-2.1a3.3 3.3 0 0 1-1.1-4.3zm12.3 2.8-4.3-2.5 1.4-.8 3.6 2.1a3.3 3.3 0 0 1-.5 5.9v-4.4z" fill="#fff"/>
    </svg>
  )
}

function ChatGPTMock() {
  return (
    <div className="cg-mock" aria-label="ChatGPT conversation showing the prompt DraftIn sends">
      {/* ── Left sidebar ──────────────────────────────────────── */}
      <aside className="cg-side">
        <div className="cg-side-new">
          <span className="cg-side-plus">+</span>
          <span>New chat</span>
        </div>
        <div className="cg-side-search">
          <span className="cg-side-search-icon">{LIIcons.search}</span>
          <span>Search chats</span>
        </div>
        <div className="cg-side-section">Today</div>
        <div className="cg-side-item cg-side-active">
          <span className="cg-side-dot" />
          Outreach to Priya Shah
        </div>
        <div className="cg-side-item">Helix search infra notes</div>
        <div className="cg-side-section">Yesterday</div>
        <div className="cg-side-item">Compare ANN libraries</div>
        <div className="cg-side-item">Pricing tier tradeoffs</div>
        <div className="cg-side-foot">
          <div className="cg-side-foot-avatar">L</div>
          <span className="cg-side-foot-name">Loukik</span>
        </div>
      </aside>

      {/* ── Main chat column ──────────────────────────────────── */}
      <div className="cg-main">
        <div className="cg-mock-top">
          <span className="cg-mock-title">ChatGPT</span>
          <span className="cg-mock-model">gpt-5.5-instant ▾</span>
          <span className="cg-mock-share">Share</span>
        </div>

        <div className="cg-thread">
          <div className="cg-msg cg-msg-user">
            <div className="cg-attach">
              <div className="cg-thumb cg-thumb-1">
                <div className="cg-thumb-cover" />
                <div className="cg-thumb-avatar" style={{ background: '#1F4E96' }}>PS</div>
                <div className="cg-thumb-name" />
                <div className="cg-thumb-line" />
                <div className="cg-thumb-line cg-thumb-line-2" />
              </div>
              <div className="cg-thumb cg-thumb-2">
                <div className="cg-thumb-cover" style={{ background: 'linear-gradient(140deg,#084E97,#2C70BA)' }} />
                <div className="cg-thumb-avatar" style={{ background: '#084E97' }}>DM</div>
                <div className="cg-thumb-name" />
                <div className="cg-thumb-line" />
                <div className="cg-thumb-line cg-thumb-line-2" />
              </div>
              <div className="cg-thumb cg-thumb-3">
                <div className="cg-thumb-cover" style={{ background: 'linear-gradient(140deg,#14213D,#1F4E96)' }} />
                <div className="cg-thumb-avatar" style={{ background: '#14213D' }}>N</div>
                <div className="cg-thumb-name" />
                <div className="cg-thumb-line" />
                <div className="cg-thumb-line cg-thumb-line-2" />
              </div>
            </div>
            <div className="cg-bubble">
              Read these LinkedIn screenshots and draft a warm five-bullet intro
              from me to this person. Ground every line in something on the page.
              Do not invent. If you do not recognize the company, web-search it.
              Tone: warm, specific, no buzzwords.
            </div>
          </div>

          <div className="cg-msg cg-msg-assistant">
            <div className="cg-avatar"><ChatGPTLogo size={20} /></div>
            <div className="cg-stream">
              <div className="cg-stream-row">Hey Priya, saw the Search Infra hiring post.</div>
              <div className="cg-stream-row">Spent the last 5 years on backend search and storage at Vellum. Most</div>
              <div className="cg-stream-row">relevant: cut p99 on a metadata hot path from 1.2s to 280ms by<span className="cg-cursor" /></div>
            </div>
          </div>
        </div>

        <div className="cg-input">
          <div className="cg-input-box">
            <span className="cg-input-plus">+</span>
            <span className="cg-input-placeholder">Ask anything</span>
            <span className="cg-input-tools">
              <span className="cg-input-icon" aria-label="voice">🎤</span>
              <span className="cg-input-send">↑</span>
            </span>
          </div>
          <span className="cg-input-hint">ChatGPT can make mistakes. Check important info.</span>
        </div>
      </div>
    </div>
  )
}

// ── Step 03: LinkedIn DM compose with drafted message pasted in ──
function LinkedInDMMock() {
  return (
    <div className="dm-mock">
      <div className="dm-window">
        <div className="dm-head">
          <div className="dm-head-id">
            <div className="dm-avatar" style={{ background: '#1F4E96' }}>PS</div>
            <div>
              <div className="dm-name">Priya Shah</div>
              <div className="dm-status">
                <span className="dm-status-dot" />
                Active 2h ago
              </div>
            </div>
          </div>
          <div className="dm-head-actions">
            <span className="dm-head-icon">{LIIcons.video}</span>
            <span className="dm-head-icon">{LIIcons.ellipsis}</span>
            <span className="dm-head-icon">{LIIcons.minus}</span>
            <span className="dm-head-icon">{LIIcons.close}</span>
          </div>
        </div>

        <div className="dm-body">
          <div className="dm-day">TODAY</div>
          <div className="dm-message dm-message-them">
            <div className="dm-bubble dm-bubble-them">
              Always open to chatting infra. Send a note when you have one.
            </div>
            <div className="dm-time">10:42 AM</div>
          </div>
        </div>

        <div className="dm-compose">
          <div className="dm-compose-pasted-tag">
            <span className="dm-paste-dot" />
            Just pasted from clipboard
          </div>
          <div className="dm-compose-text">
            Hey Priya, saw the Search Infra hiring post.
            <br /><br />
            Spent the last 5 years on backend search and storage at Vellum.
            Most relevant to what you are describing: cut p99 on a metadata
            hot path from 1.2s to 280ms by reshaping the index. No planner
            rewrite. Shipped at full traffic. No rollback.
            <br /><br />
            Resume and a short writeup of the fix below. Happy to chat whenever
            works for you.
            <span className="dm-caret" />
          </div>
          <div className="dm-compose-bar">
            <div className="dm-compose-tools">
              <span className="dm-tool-icon">{LIIcons.smile}</span>
              <span className="dm-tool-icon">{LIIcons.image}</span>
              <span className="dm-tool-icon">{LIIcons.paperclip}</span>
              <span className="dm-tool-icon dm-tool-gif">GIF</span>
            </div>
            <button className="dm-send">Send</button>
          </div>
        </div>
      </div>

      <div className="dm-tips">
        <div className="dm-tip">
          <span className="dm-tip-kbd">Alt+L</span>
          <span className="dm-tip-text">
            <strong>Re-roll.</strong> Keeps the buffer, asks GPT again.
          </span>
        </div>
        <div className="dm-tip">
          <span className="dm-tip-kbd">Alt+C</span>
          <span className="dm-tip-text">
            <strong>Clear.</strong> Throws away every captured screenshot.
          </span>
        </div>
      </div>
    </div>
  )
}

// ── How it works ─────────────────────────────────────────────────
const STEPS = [
  {
    n: '01',
    viz: CaptureMock,
    title: 'Capture',
    body: 'Press Alt+K on any tab. The visible viewport is saved to a buffer. Stack a hiring post, then the manager\'s profile, then the section you scrolled to. Every screenshot becomes context for the same draft.',
    tag: 'Chrome captureVisibleTab',
  },
  {
    n: '02',
    viz: ChatGPTMock,
    title: 'Draft',
    body: 'Press Alt+L. A local server bundles the screenshots, attaches your me.md, and hands the whole thing to a hidden ChatGPT session. GPT vision reads the images directly. It searches the company if it does not recognize the name. It writes a warm five-bullet intro grounded in what it actually saw. No DOM scraping. No API key.',
    tag: 'Oracle CLI · GPT-5.5',
  },
  {
    n: '03',
    viz: LinkedInDMMock,
    title: 'Paste',
    body: 'The draft lands on your system clipboard the moment it returns. Press ⌘V into LinkedIn, iMessage, anywhere. If you do not like the draft, press Alt+L again to re-roll without re-uploading. If you are done with the thread, press Alt+C to clear the buffer so the next capture starts fresh.',
    tag: 'pbcopy · xclip · clip.exe',
  },
]

function HowItWorks() {
  return (
    <section className="how-section" id="how">
      <div className="container">
        <div className="how-head">
          <p className="eyebrow">How it works</p>
          <h2 className="h2">Three keystrokes.<br /><em>That is the whole tool.</em></h2>
          <p className="lead">No popup. No form. No template picker. The keyboard is the interface.</p>
        </div>
        <div className="steps">
          {STEPS.map((s, i) => <StepCard key={s.n} step={s} delay={i * 80} />)}
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, delay }) {
  const [ref, visible] = useReveal()
  const Viz = step.viz
  return (
    <div ref={ref} className={`step${visible ? ' visible' : ''}`} style={{ '--delay': `${delay}ms` }}>
      <Viz />
      <div className="step-body">
        <div className="step-top">
          <span className="step-n">{step.n}</span>
        </div>
        <h3 className="step-h">{step.title}</h3>
        <p className="step-p">{step.body}</p>
        <span className="step-tag">{step.tag}</span>
      </div>
    </div>
  )
}

// ── Stack ────────────────────────────────────────────────────────
const STACK = [
  {
    label: 'Extension',
    title: 'Chrome MV3',
    desc: 'A single content script, a service worker, and an offscreen helper. No popup UI. No settings page. No telemetry. The keyboard is the entire surface. Alt+K to capture. Alt+L to draft. Alt+C to clear.',
  },
  {
    label: 'Local Server',
    title: 'Node HTTP on 127.0.0.1',
    desc: 'A 200-line Node server. POST /generate with the screenshot buffer, get a drafted message back. No auth. No database. No rate limits. Everything stays on your machine. Your me.md sits beside the source as the single source of personalization.',
  },
  {
    label: 'LLM',
    title: 'Oracle · GPT-5.5 vision via browser',
    desc: 'A small CLI drives ChatGPT in a hidden Chromium window. GPT vision reads each screenshot directly. It searches the recipient\'s company if it does not recognize the name. It writes a five-bullet warm intro grounded in what it saw. You pay nothing per draft. The tool rides your existing subscription.',
  },
  {
    label: 'Clipboard',
    title: 'pbcopy · xclip · clip.exe',
    desc: 'The clipboard write happens server-side, not in the extension. Chrome MV3 service workers cannot reliably write to the clipboard when the toolbar steals focus. The local server, which always has a shell, owns that step. pbcopy on macOS, xclip on Linux, clip.exe on Windows.',
  },
]

function Stack() {
  const [ref, visible] = useReveal()
  return (
    <section className="stack-section">
      <div className="container">
        <div ref={ref} className={`stack-head${visible ? ' visible' : ''}`}>
          <p className="eyebrow">Under the hood</p>
          <h2 className="h2">The pieces.<br /><em>Plain parts.</em></h2>
        </div>
        <div className="stack-grid">
          {STACK.map((c, i) => <StackCard key={c.label} card={c} delay={i * 70} />)}
        </div>
      </div>
    </section>
  )
}

function StackCard({ card, delay }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} className={`scard${visible ? ' visible' : ''}`} style={{ '--delay': `${delay}ms` }}>
      <span className="scard-label">{card.label}</span>
      <h3 className="scard-h">{card.title}</h3>
      <p className="scard-p">{card.desc}</p>
    </div>
  )
}

// ── CTA ──────────────────────────────────────────────────────────
function CTABanner() {
  const [ref, visible] = useReveal()
  return (
    <section className="cta-section" ref={ref}>
      <div className={`cta-inner${visible ? ' visible' : ''}`}>
        <h2 className="cta-h">Send a message that does not sound like a template.</h2>
        <p className="cta-p">Free. Open source. Runs entirely on your machine. Clone it, point it at your me.md, press Alt+L.</p>
        <a href={GH} className="btn-cta" target="_blank" rel="noopener noreferrer">
          <GithubIcon size={16} />
          View on GitHub
        </a>
      </div>
    </section>
  )
}

// ── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <span className="footer-logo">
          <span className="footer-logo-word">Draft</span>
          <span className="footer-logo-tile" aria-hidden>in</span>
        </span>
        <span className="footer-sub">by <strong>Loukik Naik</strong></span>
      </div>
      <a href={GH} className="footer-gh" target="_blank" rel="noopener noreferrer">
        <GithubIcon size={14} />
        github.com/LoukikNaik/DraftIn
      </a>
    </footer>
  )
}

// ── App ──────────────────────────────────────────────────────────
// ── Flow video: the 25s silent loop that replaces "See it in action" ─
function FlowVideo() {
  const [ref, visible] = useReveal(0.1)
  return (
    <section className="flow-section" id="flow">
      <div className="container">
        <div ref={ref} className={`flow-head${visible ? ' visible' : ''}`}>
          <p className="eyebrow">The whole flow</p>
          <h2 className="h2">From scroll<br /><em>to send.</em></h2>
          <p className="lead">
            Three Alt+K presses while you browse. One Alt+L when you are ready.
            ⌘V into the DM. No popup. No editor. No extra subscription.
          </p>
        </div>
        <div className={`flow-video-wrap${visible ? ' visible' : ''}`}>
          <div className="flow-video-frame">
            <video
              className="flow-video"
              src="/hero.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label="DraftIn workflow: capture three LinkedIn screenshots, draft via ChatGPT, paste and send"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <StatsBar />
      <FlowVideo />
      <HowItWorks />
      <Stack />
      <CTABanner />
      <Footer />
    </>
  )
}
