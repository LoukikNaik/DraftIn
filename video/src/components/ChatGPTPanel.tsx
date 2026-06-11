import React from 'react'
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fonts } from '../theme'

const FULL_REPLY = `Hey Priya, saw the Search Infra hiring post.

Spent the last 5 years on backend search and storage at Vellum. Most relevant to what you are describing: cut p99 on a metadata hot path from 1.2s to 280ms by reshaping the index. No planner rewrite. Shipped at full traffic. No rollback.

Resume and a short writeup of the fix below. Happy to chat whenever works for you.`

// Mini LinkedIn page thumbnail (used as ChatGPT image attachment)
const PageThumb: React.FC<{ tint: string; initial: string }> = ({ tint, initial }) => (
  <div style={{
    width: 80, height: 104,
    background: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column',
  }}>
    <div style={{ height: 26, background: `linear-gradient(135deg, ${tint}, #4A7BC8)` }} />
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      background: tint, color: '#fff',
      fontWeight: 800, fontSize: 8,
      border: '2px solid #fff',
      margin: '-12px 0 0 10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      letterSpacing: '-0.02em',
    }}>{initial}</div>
    <div style={{ padding: '8px 10px 0' }}>
      <div style={{ width: '70%', height: 4, background: 'rgba(0,0,0,0.55)', borderRadius: 2 }} />
      <div style={{ width: '80%', height: 3, background: 'rgba(0,0,0,0.22)', borderRadius: 2, marginTop: 4 }} />
      <div style={{ width: '60%', height: 3, background: 'rgba(0,0,0,0.22)', borderRadius: 2, marginTop: 3 }} />
      <div style={{ width: '40%', height: 3, background: 'rgba(0,0,0,0.22)', borderRadius: 2, marginTop: 3 }} />
    </div>
  </div>
)

// ChatGPT logo
const CGLogo: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="16" fill={colors.ink} />
    <text x="16" y="22" textAnchor="middle" fill="#fff" fontSize="18" fontFamily={fonts.sans} fontWeight={800}>✦</text>
  </svg>
)

// Pasted personal-context card (mimics ChatGPT's "paste-as-text" cell).
// Makes it visible that the draft is grounded in real me.md content,
// not hallucinated.
const ME_MD_CONTENT = `# me.md
# Loukik. Backend engineer, 5 yrs on search and storage infra at Vellum.
# Most recently on the metadata path team.

## What I have shipped that I am proud of
- Cut p99 on the metadata hot path from 1.2s to 280ms by reshaping the
  index. No planner rewrite. Full traffic. Zero rollback.
- Built the migration tool that moved 14B rows off a legacy shard layout
  over a weekend, zero downtime.
- Mentor 3-5 newer engineers. Two of them got promoted to senior in
  their first review cycle.

## What I want next
- Backend IC (not management) where I can keep going deep on storage
  or search at scale.
- Small team. Strong eng culture. "Shipped under load" is the bar.
- Real users. Not pre-product.

## What I look for in a team
- Concrete technical problems. Not "build a platform from scratch".
- People who write clearly. I learn faster from them.
- Honest postmortems.

## Tone for outreach (important)
- Warm. Specific. No buzzwords.
- Lead with relevance to them, not the ask.
- Three short paragraphs max.
- Always include a concrete proof point from my own work.
- Never use "would love to compare notes", "circle back", "synergy".
- Never reference reading their profile. Assume they know I did.
- Sign-off: friendly, not formal.

## Logistics
- Open to remote, hybrid SF, or moving for the right thing.
- Resume: loukik.dev/resume.pdf
- GitHub: github.com/loukiknaik`

const ME_MD_LINE_COUNT = ME_MD_CONTENT.split('\n').length

const PastedMeMdCard: React.FC = () => (
  <div style={{
    width: 540,
    background: '#2A2A2A',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '12px 14px 14px',
    color: '#ECECEC',
    position: 'relative',
    overflow: 'hidden',
    maxHeight: 200,
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      paddingBottom: 8,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      marginBottom: 8,
      fontFamily: fonts.sans,
      fontSize: 12,
      color: 'rgba(255,255,255,0.7)',
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 18, height: 18,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 4,
        fontSize: 11,
      }}>📄</span>
      <span style={{ fontWeight: 700, color: '#fff' }}>Pasted</span>
      <span style={{ color: 'rgba(255,255,255,0.5)' }}>me.md</span>
      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
        {ME_MD_LINE_COUNT} lines
      </span>
    </div>
    <pre style={{
      margin: 0,
      whiteSpace: 'pre-wrap',
      fontFamily: fonts.mono,
      fontSize: 10.5,
      lineHeight: 1.5,
      color: 'rgba(255,255,255,0.82)',
    }}>{ME_MD_CONTENT}</pre>
    {/* fade at the bottom to suggest more content */}
    <div style={{
      position: 'absolute',
      left: 0, right: 0, bottom: 0,
      height: 56,
      background: 'linear-gradient(180deg, rgba(42,42,42,0) 0%, #2A2A2A 85%)',
      pointerEvents: 'none',
    }} />
  </div>
)

export const ChatGPTPanel: React.FC<{ revealFrom?: number; copiedToastFrom?: number }> = ({
  revealFrom = 0, copiedToastFrom,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Stream typewriter - reveal characters over time
  const streamStart = revealFrom + 24
  const streamDuration = 150
  const charsTotal = FULL_REPLY.length
  const charsShown = Math.max(0, Math.min(charsTotal, Math.floor(
    interpolate(frame, [streamStart, streamStart + streamDuration], [0, charsTotal], { extrapolateRight: 'clamp' })
  )))
  const streamed = FULL_REPLY.slice(0, charsShown)

  // Cursor blink
  const cursorOn = (Math.floor(frame / 8) % 2) === 0

  // Toast
  const toastOpacity = copiedToastFrom !== undefined
    ? interpolate(frame, [copiedToastFrom, copiedToastFrom + 8, copiedToastFrom + 60, copiedToastFrom + 70], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
    : 0
  const toastY = interpolate(frame, [copiedToastFrom ?? 0, (copiedToastFrom ?? 0) + 12], [12, 0], { extrapolateRight: 'clamp' })

  return (
    <div style={{
      width: '88%',
      height: '88%',
      margin: 'auto',
      background: colors.cgBg,
      borderRadius: 18,
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: '230px 1fr',
      boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
      fontFamily: fonts.sans,
      color: '#ECECEC',
      position: 'relative',
    }}>
      {/* Sidebar */}
      <aside style={{
        background: colors.cgSidebarBg,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '18px 12px',
        display: 'flex', flexDirection: 'column', gap: 6,
        fontSize: 14,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#fff', fontWeight: 600,
        }}>
          <span style={{ fontSize: 18 }}>+</span> New chat
        </div>
        <div style={{
          padding: '8px 12px', borderRadius: 8,
          color: 'rgba(255,255,255,0.45)', fontSize: 13,
        }}>🔍 Search chats</div>
        <div style={{ padding: '10px 12px 4px', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Today</div>
        <div style={{
          padding: '9px 12px', borderRadius: 7,
          background: 'rgba(255,255,255,0.07)',
          color: '#fff', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.green }} />
          Outreach to Priya Shah
        </div>
        <div style={{ padding: '9px 12px', borderRadius: 7, color: 'rgba(255,255,255,0.72)' }}>
          Helix search infra notes
        </div>
        <div style={{ padding: '10px 12px 4px', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Yesterday</div>
        <div style={{ padding: '9px 12px', borderRadius: 7, color: 'rgba(255,255,255,0.72)' }}>
          Compare ANN libraries
        </div>
      </aside>

      {/* Main column */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '20px 28px 18px', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>ChatGPT</span>
          <span style={{
            fontSize: 13, color: 'rgba(255,255,255,0.5)',
            fontFamily: fonts.mono,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '3px 10px', borderRadius: 6,
          }}>gpt-5.5-instant ▾</span>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,0.65)',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            padding: '6px 14px', borderRadius: 999,
          }}>Share</span>
        </div>

        {/* Thread */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 12, overflow: 'hidden' }}>
          {/* User message */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <PastedMeMdCard />
            <div style={{ display: 'flex', gap: 8 }}>
              <PageThumb tint={colors.brandDeep} initial="PS" />
              <PageThumb tint="#084E97" initial="PS" />
              <PageThumb tint="#14213D" initial="N" />
            </div>
            <div style={{
              maxWidth: 540,
              background: colors.cgBubble,
              borderRadius: '18px 18px 6px 18px',
              padding: '13px 18px',
              fontSize: 15,
              lineHeight: 1.55,
              color: '#ECECEC',
            }}>
              Use me.md above as my voice. Read the screenshots.
              Draft a warm intro to this person. Every line grounded in
              the page or in me.md. Do not invent.
            </div>
          </div>

          {/* Assistant message */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}><CGLogo size={32} /></div>
            <div style={{
              flex: 1,
              fontSize: 15,
              lineHeight: 1.7,
              color: '#ECECEC',
              whiteSpace: 'pre-wrap',
              maxWidth: 620,
            }}>
              {streamed}
              {cursorOn && charsShown < charsTotal && (
                <span style={{
                  display: 'inline-block', width: 9, height: 16,
                  background: colors.green, verticalAlign: '-2px', marginLeft: 3,
                }} />
              )}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div style={{
          marginTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: 12,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: colors.cgBubble,
            borderRadius: 28,
            padding: '10px 10px 10px 18px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }}>+</span>
            <span style={{ flex: 1, color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Ask anything</span>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>🎤</span>
            <span style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#fff', color: colors.cgBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, fontWeight: 700,
            }}>↑</span>
          </div>
        </div>
      </div>

      {/* Copied-to-clipboard toast */}
      {copiedToastFrom !== undefined && (
        <div style={{
          position: 'absolute',
          right: 40, bottom: 40,
          background: 'rgba(16,163,127,0.95)',
          color: '#fff',
          padding: '12px 22px',
          borderRadius: 999,
          fontFamily: fonts.mono,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 14px 32px rgba(16,163,127,0.45)',
          opacity: toastOpacity,
          transform: `translateY(${toastY}px)`,
          zIndex: 10,
        }}>
          ✓ Copied to clipboard
        </div>
      )}
    </div>
  )
}
