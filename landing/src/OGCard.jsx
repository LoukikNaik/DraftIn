// 1200x630 Open Graph card for link previews (LinkedIn, X, Slack, iMessage, etc).
//
// To regenerate the static PNG:
//   1. Temporarily render <OGCard /> from main.jsx instead of <App />.
//   2. `npm run dev`, open the page in Chrome.
//   3. DevTools → Device Mode → Responsive 1200x630, DPR 2.
//   4. Toolbar `⋮` → Capture screenshot.
//   5. Save as landing/public/og.png and revert main.jsx.
import { useEffect } from 'react'

const CARDS = [
  {
    name: 'Priya Shah',
    headline: 'Eng Manager · Search · Notion',
    tint: '#0A66C2',
    avatar: 'PS',
  },
  {
    name: 'Staff Eng · ML Infra',
    headline: 'Cursor · Remote · 2d ago',
    tint: '#0E0E10',
    avatar: 'C',
  },
  {
    name: 'Marc Tien',
    headline: 'Co-founder · Bend (YC W24)',
    tint: '#084E97',
    avatar: 'MT',
  },
]

export default function OGCard() {
  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.background = '#0a101e'
    document.body.style.display = 'grid'
    document.body.style.placeItems = 'center'
    document.body.style.minHeight = '100vh'
  }, [])

  return (
    <div style={S.canvas}>
      <div style={S.grid} />

      <div style={S.brand}>
        <span style={S.brandWord}>Draft</span>
        <span style={S.brandTile}>in</span>
      </div>

      <div style={S.left}>
        <div style={S.badge}>
          <span style={S.badgeDot} />
          OPEN SOURCE · CHROME MV3 · NO API KEY
        </div>
        <h1 style={S.h1}>
          Cold outreach.<br />
          <em style={S.em}>One keystroke.</em>
        </h1>
        <p style={S.tag}>
          Open a LinkedIn profile, hit <strong style={S.kbd}>Alt+L</strong>, paste with <strong style={S.kbd}>⌘V</strong>.
          DraftIn screenshots the page and lands a personalized message on your clipboard.
        </p>
        <div style={S.chips}>
          {['Chrome MV3', 'Node local', 'GPT vision', 'No API key'].map(c => (
            <span key={c} style={S.chip}>{c}</span>
          ))}
        </div>
      </div>

      <div style={S.cards}>
        {CARDS.map((c, i) => (
          <div key={c.name} style={{
            ...S.card,
            transform: `rotate(${(i - 1) * 4}deg) translateY(${Math.abs(i - 1) * 18}px)`,
            zIndex: i === 1 ? 3 : 1,
          }}>
            <div style={S.cardChrome}>
              <span style={{ ...S.cardDot, background: '#FF5F57' }} />
              <span style={{ ...S.cardDot, background: '#FEBC2E' }} />
              <span style={{ ...S.cardDot, background: '#28C840' }} />
              <span style={S.cardUrl}>linkedin.com</span>
            </div>
            <div style={S.cardProfile}>
              <div style={{ ...S.cardAvatar, background: c.tint }}>{c.avatar}</div>
              <div>
                <div style={S.cardName}>{c.name}</div>
                <div style={S.cardHeadline}>{c.headline}</div>
              </div>
            </div>
            <div style={S.cardDraft}>
              <div style={S.cardDraftHead}>
                <span style={S.cardDraftDot} />
                DRAFTED · CLIPBOARD
              </div>
              <div style={S.cardDraftLine} />
              <div style={{ ...S.cardDraftLine, width: '88%' }} />
              <div style={{ ...S.cardDraftLine, width: '72%' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={S.url}>
        <span style={S.urlDot} />
        github.com/LoukikNaik/DraftIn
      </div>
    </div>
  )
}

const S = {
  canvas: {
    width: 1200, height: 630, position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(135deg, #EBF3FF 0%, #F4F8FF 55%, #EEF4FF 100%)',
    fontFamily: "'Instrument Sans', system-ui, sans-serif",
    color: '#0F172A', boxSizing: 'border-box',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: 'radial-gradient(circle, rgba(10,102,194,0.14) 1px, transparent 1px)',
    backgroundSize: '26px 26px',
    WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.1))',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.1))',
  },
  brand: {
    position: 'absolute', top: 38, left: 60,
    display: 'inline-flex', alignItems: 'baseline', gap: 4,
    fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 32,
    letterSpacing: '-0.025em',
  },
  brandWord: { color: '#0E0E10' },
  brandTile: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, marginLeft: 4,
    background: '#0A66C2', color: '#fff',
    fontFamily: "'Instrument Sans', sans-serif",
    fontWeight: 900, fontSize: 22, letterSpacing: '-0.06em',
    borderRadius: 8, transform: 'translateY(6px)',
    paddingBottom: 2, lineHeight: 1,
  },

  left: { position: 'absolute', left: 60, top: 138, width: 600 },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '7px 14px', background: '#fff', border: '1.5px solid #D1E2FF',
    borderRadius: 999, boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
    fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
    color: '#64748B', marginBottom: 28,
  },
  badgeDot: { width: 7, height: 7, borderRadius: '50%', background: '#0A66C2' },
  h1: {
    fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 86,
    lineHeight: 0.95, letterSpacing: '-0.038em', margin: '0 0 22px',
  },
  em: { color: '#0A66C2', fontStyle: 'italic' },
  tag: {
    fontSize: 20, lineHeight: 1.5, color: '#475569',
    margin: '0 0 26px', maxWidth: 560,
  },
  kbd: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 16, fontWeight: 600, color: '#0F172A',
    background: '#fff', border: '1.5px solid #D1E2FF',
    borderBottomWidth: 2.5, borderRadius: 5,
    padding: '1px 8px', margin: '0 2px',
  },
  chips: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  chip: {
    padding: '7px 14px', background: 'rgba(10,102,194,0.08)',
    border: '1.5px solid #D1E2FF', borderRadius: 999,
    fontSize: 13, fontWeight: 600, color: '#084E97',
  },

  cards: {
    position: 'absolute', right: 60, top: 110,
    width: 480, height: 460,
    display: 'flex', gap: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    width: 200, height: 320, borderRadius: 16,
    background: '#fff', border: '1px solid #D1E2FF',
    boxShadow: '0 24px 60px rgba(15,23,42,0.18), 0 8px 24px rgba(15,23,42,0.1)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  },
  cardChrome: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '8px 10px', background: '#F1F5FA',
    borderBottom: '1px solid #D1E2FF',
  },
  cardDot: { width: 8, height: 8, borderRadius: '50%' },
  cardUrl: {
    marginLeft: 8, fontFamily: 'ui-monospace, monospace',
    fontSize: 10, color: '#64748B', background: '#fff',
    border: '1px solid #D1E2FF', borderRadius: 5,
    padding: '2px 8px', flex: 1,
  },
  cardProfile: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 12px 8px',
  },
  cardAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 11,
    flexShrink: 0, letterSpacing: '-0.02em',
  },
  cardName: {
    fontSize: 11, fontWeight: 700, color: '#0E0E10',
    lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden',
    textOverflow: 'ellipsis', maxWidth: 130,
  },
  cardHeadline: {
    fontSize: 9, color: '#64748B', marginTop: 2,
    lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden',
    textOverflow: 'ellipsis', maxWidth: 130,
  },
  cardDraft: {
    margin: '6px 12px 14px', background: '#0E0E10',
    borderRadius: 10, padding: '10px 11px', flex: 1,
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  cardDraftHead: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
    color: '#10B981', fontFamily: 'ui-monospace, monospace',
  },
  cardDraftDot: {
    width: 5, height: 5, borderRadius: '50%',
    background: '#10B981', boxShadow: '0 0 6px #10B981',
  },
  cardDraftLine: {
    height: 6, borderRadius: 3, width: '100%',
    background: 'rgba(226,232,240,0.55)',
  },

  url: {
    position: 'absolute', bottom: 36, left: 60,
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontSize: 16, fontWeight: 600, color: '#0A66C2',
    background: '#fff', border: '1.5px solid #D1E2FF',
    borderRadius: 999, padding: '8px 18px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
    fontFamily: 'ui-monospace, monospace',
  },
  urlDot: { width: 8, height: 8, borderRadius: '50%', background: '#10B981' },
}
