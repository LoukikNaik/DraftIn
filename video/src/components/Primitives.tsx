import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fonts } from '../theme'

// ── Mac/Chrome-style window frame ────────────────────────────────
export const ChromeWindow: React.FC<{ url: string; children: React.ReactNode }> = ({ url, children }) => (
  <div style={{
    width: '88%',
    height: '88%',
    margin: 'auto',
    background: colors.liBg,
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  }}>
    <div style={{
      background: colors.chromeBg,
      borderBottom: '1px solid rgba(0,0,0,0.1)',
      padding: '12px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    }}>
      <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#FF5F57' }} />
      <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#FEBC2E' }} />
      <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#28C840' }} />
      <div style={{
        marginLeft: 20,
        flex: 1,
        background: colors.white,
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 6,
        padding: '6px 14px',
        fontFamily: fonts.mono,
        fontSize: 16,
        color: colors.textMuted,
        textAlign: 'center',
        maxWidth: 560,
        margin: '0 auto',
        marginLeft: 80,
        marginRight: 80,
      }}>{url}</div>
      <div style={{ width: 40 }} />
    </div>
    <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>
  </div>
)

// ── LinkedIn top nav (inside ChromeWindow) ───────────────────────
export const LinkedInNav: React.FC = () => (
  <div style={{
    background: colors.white,
    borderBottom: `1px solid ${colors.liBorder}`,
    padding: '10px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    height: 56,
    flexShrink: 0,
    fontFamily: fonts.sans,
  }}>
    <div style={{
      width: 32, height: 32,
      background: colors.brand,
      color: '#fff',
      fontWeight: 900, fontSize: 18,
      letterSpacing: '-0.06em',
      borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingBottom: 2,
    }}>in</div>
    <div style={{
      background: '#EDF3F8',
      borderRadius: 4,
      padding: '7px 12px',
      fontSize: 13,
      color: colors.textMuted,
      width: 240,
    }}>Search</div>
    <div style={{ flex: 1 }} />
    {['Home', 'My Network', 'Jobs', 'Messaging', 'Notifications'].map((label, i) => (
      <div key={label} style={{
        fontSize: 12,
        color: i === 0 ? colors.text : colors.textMuted,
        fontWeight: i === 0 ? 600 : 400,
        padding: '4px 10px',
        borderBottom: i === 0 ? `2px solid ${colors.text}` : '2px solid transparent',
      }}>{label}</div>
    ))}
    <div style={{ width: 1, height: 36, background: 'rgba(0,0,0,0.15)' }} />
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.brand}, ${colors.brandDeep})` }} />
      <span style={{ fontSize: 11, color: colors.textMuted }}>Me ▾</span>
    </div>
  </div>
)

// ── Keystroke badge (Alt+K, Alt+L, ⌘V) ───────────────────────────
export const KbdBadge: React.FC<{ keys: string[]; startFrame?: number; endFrame?: number; bottom?: number; right?: number }> = ({
  keys, startFrame = 0, endFrame, bottom = 60, right = 60,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const localFrame = frame - startFrame
  if (localFrame < 0) return null

  const popIn = spring({ frame: localFrame, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } })
  const scale = interpolate(popIn, [0, 1], [0.5, 1])
  const opacity = interpolate(popIn, [0, 1], [0, 1])
  const bobY = Math.sin(localFrame * 0.18) * 4

  let fadeOut = 1
  if (endFrame !== undefined && frame > endFrame - 8) {
    fadeOut = interpolate(frame, [endFrame - 8, endFrame], [1, 0], { extrapolateRight: 'clamp' })
  }

  return (
    <div style={{
      position: 'absolute',
      bottom, right,
      display: 'flex',
      gap: 8,
      transform: `scale(${scale}) translateY(${bobY}px)`,
      opacity: opacity * fadeOut,
      filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.4))',
    }}>
      {keys.map(k => (
        <span key={k} style={{
          fontFamily: fonts.mono,
          fontSize: 22,
          fontWeight: 700,
          color: colors.white,
          background: 'rgba(255,255,255,0.08)',
          border: '2px solid rgba(255,255,255,0.18)',
          borderBottomWidth: 4,
          borderRadius: 10,
          minWidth: 44,
          textAlign: 'center',
          padding: '6px 12px',
          backdropFilter: 'blur(6px)',
        }}>{k}</span>
      ))}
    </div>
  )
}

// ── White-flash overlay (capture flash) ──────────────────────────
export const ScreenFlash: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame()
  const local = frame - startFrame
  if (local < 0 || local > 14) return null
  const opacity = interpolate(local, [0, 4, 14], [0, 0.65, 0], { extrapolateRight: 'clamp' })
  return <AbsoluteFill style={{ background: colors.white, opacity, pointerEvents: 'none', zIndex: 100 }} />
}

// ── Screenshot queue counter (corner badge) ──────────────────────
export const QueueBadge: React.FC<{ count: number; bumpFrame?: number }> = ({ count, bumpFrame }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  let scale = 1
  if (bumpFrame !== undefined) {
    const local = frame - bumpFrame
    if (local >= 0 && local < 18) {
      const s = spring({ frame: local, fps, config: { damping: 10, stiffness: 240 } })
      scale = interpolate(s, [0, 0.5, 1], [1, 1.25, 1])
    }
  }
  return (
    <div style={{
      position: 'absolute',
      top: 32, right: 32,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'rgba(10,102,194,0.95)',
      color: '#fff',
      borderRadius: 999,
      padding: '10px 18px 10px 14px',
      fontFamily: fonts.mono,
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: '0.05em',
      boxShadow: '0 14px 32px rgba(10,102,194,0.45)',
      transform: `scale(${scale})`,
      transition: 'transform 0.2s',
      zIndex: 50,
    }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28,
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '50%',
        fontSize: 14,
      }}>{count}</span>
      <span>SCREENSHOT{count === 1 ? '' : 'S'} QUEUED</span>
    </div>
  )
}

// ── Caption / step label (bottom of stage) ───────────────────────
export const Caption: React.FC<{ text: string; startFrame?: number }> = ({ text, startFrame = 0 }) => {
  const frame = useCurrentFrame()
  const local = frame - startFrame
  const opacity = interpolate(local, [0, 12, 75, 88], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
  const ty = interpolate(local, [0, 12], [10, 0], { extrapolateRight: 'clamp' })
  return (
    <div style={{
      position: 'absolute',
      bottom: 40,
      left: '50%',
      transform: `translate(-50%, ${ty}px)`,
      background: 'rgba(10,16,30,0.85)',
      color: '#fff',
      padding: '10px 22px',
      borderRadius: 999,
      fontFamily: fonts.mono,
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      opacity,
      zIndex: 60,
    }}>{text}</div>
  )
}

// ── Pulsing camera-bracket corners around the chrome window ──────
export const CaptureCorners: React.FC<{ startFrame?: number }> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame()
  const local = frame - startFrame
  const opacity = interpolate(local, [0, 8, 60, 78], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
  const pulse = (Math.sin(local * 0.2) + 1) / 2 * 0.4 + 0.6
  const corner = (pos: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    width: 38, height: 38,
    border: `4px solid ${colors.brand}`,
    boxShadow: `0 0 18px rgba(10,102,194,0.7)`,
    opacity: opacity * pulse,
    ...pos,
  })
  return (
    <>
      <div style={{ ...corner({ top: 14, left: 14 }), borderRight: 'none', borderBottom: 'none', borderRadius: '8px 0 0 0' }} />
      <div style={{ ...corner({ top: 14, right: 14 }), borderLeft: 'none', borderBottom: 'none', borderRadius: '0 8px 0 0' }} />
      <div style={{ ...corner({ bottom: 14, left: 14 }), borderRight: 'none', borderTop: 'none', borderRadius: '0 0 0 8px' }} />
      <div style={{ ...corner({ bottom: 14, right: 14 }), borderLeft: 'none', borderTop: 'none', borderRadius: '0 0 8px 0' }} />
    </>
  )
}
