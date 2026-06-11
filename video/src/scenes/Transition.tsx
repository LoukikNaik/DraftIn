import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fonts } from '../theme'

// "Alt+L pressed → screenshots converge into one bundle → fade to ChatGPT"
export const Transition: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 30-frame scene total
  const bgGlow = interpolate(frame, [0, 12, 20, 30], [0, 0.55, 0.85, 1])
  const kbdSpring = spring({ frame, fps, config: { damping: 10, stiffness: 240 } })
  const kbdScale = interpolate(kbdSpring, [0, 1], [0.4, 1])
  const kbdOpacity = interpolate(frame, [0, 6, 22, 30], [0, 1, 1, 0])

  // Thumbnails converge from corners to center
  const cs = (delay: number) => {
    const local = Math.max(0, frame - delay)
    const t = interpolate(local, [0, 18], [0, 1], { extrapolateRight: 'clamp' })
    return t
  }
  const positions = [
    { from: { x: -360, y: -200, r: -12 }, delay: 0 },
    { from: { x:  360, y: -180, r:  10 }, delay: 2 },
    { from: { x:    0, y:  240, r:   6 }, delay: 4 },
  ]

  return (
    <AbsoluteFill style={{ background: '#0B1424' }}>
      {/* Brand-blue radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at center, rgba(10,102,194,${0.35 * bgGlow}), transparent 60%)`,
      }} />

      {/* Center point with the 3 thumbnails converging */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 0, height: 0,
      }}>
        {positions.map((p, i) => {
          const t = cs(p.delay)
          const x = interpolate(t, [0, 1], [p.from.x, 0])
          const y = interpolate(t, [0, 1], [p.from.y, 0])
          const r = interpolate(t, [0, 1], [p.from.r, 0])
          const s = interpolate(t, [0, 0.6, 1], [1, 0.95, 0.85])
          return (
            <div key={i} style={{
              position: 'absolute',
              width: 110, height: 140,
              top: -70, left: -55,
              transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 14px 36px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
              zIndex: 10 - i,
              overflow: 'hidden',
            }}>
              <div style={{
                height: 32,
                background: `linear-gradient(135deg, ${colors.brandDeep}, #4A7BC8)`,
              }} />
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: colors.brandDeep, color: '#fff',
                fontWeight: 800, fontSize: 11,
                border: '2.5px solid #fff',
                margin: '-14px 0 0 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                letterSpacing: '-0.02em',
              }}>PS</div>
              <div style={{ padding: '10px 12px 0' }}>
                <div style={{ width: '70%', height: 5, background: 'rgba(0,0,0,0.6)', borderRadius: 2 }} />
                <div style={{ width: '80%', height: 4, background: 'rgba(0,0,0,0.22)', borderRadius: 2, marginTop: 5 }} />
                <div style={{ width: '55%', height: 4, background: 'rgba(0,0,0,0.22)', borderRadius: 2, marginTop: 4 }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Alt+L center keystroke */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, calc(-50% + 180px)) scale(${kbdScale})`,
        opacity: kbdOpacity,
        display: 'flex', gap: 12,
        filter: 'drop-shadow(0 14px 32px rgba(10,102,194,0.55))',
      }}>
        {['Alt', 'L'].map(k => (
          <span key={k} style={{
            fontFamily: fonts.mono,
            fontSize: 32, fontWeight: 700, color: '#fff',
            background: 'rgba(10,102,194,0.95)',
            border: '2.5px solid rgba(255,255,255,0.4)',
            borderBottomWidth: 5,
            borderRadius: 12,
            minWidth: 60,
            textAlign: 'center',
            padding: '10px 16px',
          }}>{k}</span>
        ))}
      </div>
    </AbsoluteFill>
  )
}
