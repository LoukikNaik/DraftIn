import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fonts } from '../theme'

const DRAFTED = `Hey Priya — saw the Search Infra hiring post.

Spent the last 5 years on backend search/storage at Rubrik. Most relevant to what you're describing: cut p99 on a metadata hot path from 1.2s → 280ms by reshaping the index. No planner rewrite, shipped at full traffic, no rollback.

Resume and a short writeup of the fix below. Happy to chat whenever works for you.`

type Props = {
  // Frame offsets relative to the scene's start
  pasteFrom: number       // when the message pastes in
  sendFrom: number        // when the user clicks "Send"
  deliveredFrom: number   // when "Delivered ✓" appears
}

export const DMPanel: React.FC<Props> = ({ pasteFrom, sendFrom, deliveredFrom }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Compose-box state
  const pasted = frame >= pasteFrom
  const pasteHighlightOpacity = pasted
    ? interpolate(frame, [pasteFrom, pasteFrom + 6, pasteFrom + 32, pasteFrom + 44], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
    : 0
  const composeTextOpacity = pasted
    ? interpolate(frame, [pasteFrom, pasteFrom + 5], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  const sent = frame >= sendFrom
  // After send: compose empties, message appears in thread as outbound bubble
  const composeOpacity = sent
    ? interpolate(frame, [sendFrom, sendFrom + 6], [1, 0], { extrapolateRight: 'clamp' })
    : 1
  const sentBubbleProgress = sent
    ? spring({ frame: frame - sendFrom, fps, config: { damping: 12, stiffness: 200 } })
    : 0
  const sentBubbleY = interpolate(sentBubbleProgress, [0, 1], [40, 0])
  const sentBubbleOp = interpolate(sentBubbleProgress, [0, 1], [0, 1])

  const delivered = frame >= deliveredFrom
  const deliveredOp = delivered
    ? interpolate(frame, [deliveredFrom, deliveredFrom + 6], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  // Send-button press animation
  const sendBtnScale = sent
    ? (frame - sendFrom < 6 ? interpolate(frame, [sendFrom, sendFrom + 3, sendFrom + 6], [1, 0.92, 1]) : 1)
    : 1

  return (
    <div style={{
      width: 520,
      maxHeight: '88%',
      margin: 'auto',
      background: colors.white,
      borderRadius: '12px 12px 0 0',
      overflow: 'hidden',
      boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.06)',
      fontFamily: fonts.sans,
      color: colors.text,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: `1px solid ${colors.liBorder}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: colors.brandDeep, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16,
            letterSpacing: '-0.02em',
          }}>PS</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, lineHeight: 1.1 }}>Priya Shah</div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.green }} />
              Active 2h ago
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.textFaint, fontSize: 18 }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📹</span>
          <span style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⋯</span>
          <span style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, lineHeight: 1 }}>×</span>
        </div>
      </div>

      {/* Thread body */}
      <div style={{ padding: '16px 18px 10px', minHeight: 240, position: 'relative' }}>
        <div style={{
          textAlign: 'center',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
          color: colors.textFaint,
          marginBottom: 14,
        }}>TODAY</div>

        {/* Inbound (their) message */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{
            maxWidth: '78%',
            background: '#F3F2EF',
            color: colors.text,
            padding: '10px 14px',
            borderRadius: 18,
            borderBottomLeftRadius: 4,
            fontSize: 14,
            lineHeight: 1.45,
          }}>Always open to chatting infra. Send a note when you have one.</div>
          <div style={{ fontSize: 11, color: colors.textFaint, paddingLeft: 6, marginTop: 4 }}>10:42 AM</div>
        </div>

        {/* Outbound sent bubble — appears after send */}
        {sent && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
            marginTop: 14,
            opacity: sentBubbleOp,
            transform: `translateY(${sentBubbleY}px)`,
          }}>
            <div style={{
              maxWidth: '82%',
              background: colors.brand,
              color: '#fff',
              padding: '12px 16px',
              borderRadius: 18,
              borderBottomRightRadius: 4,
              fontSize: 13.5,
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
              boxShadow: '0 8px 22px rgba(10,102,194,0.25)',
            }}>{DRAFTED}</div>
            <div style={{
              fontSize: 11, color: colors.textFaint,
              paddingRight: 6, marginTop: 4,
              opacity: deliveredOp,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>Delivered <span style={{ color: colors.green }}>✓</span></div>
          </div>
        )}
      </div>

      {/* Compose area */}
      <div style={{
        borderTop: `1px solid ${colors.liBorder}`,
        padding: '12px 18px 14px',
        opacity: composeOpacity,
        pointerEvents: sent ? 'none' : 'auto',
      }}>
        {/* "Just pasted" tag */}
        {pasted && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: colors.greenSoft,
            border: `1px solid rgba(16,163,127,0.3)`,
            color: colors.green,
            fontFamily: fonts.mono,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 999,
            marginBottom: 10,
            opacity: composeTextOpacity,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors.green }} />
            Just pasted from clipboard
          </div>
        )}

        {/* The drafted message text in compose */}
        <div style={{
          fontSize: 13.5,
          lineHeight: 1.55,
          color: colors.text,
          background: pasted ? `rgba(16,163,127,${0.06 + pasteHighlightOpacity * 0.18})` : 'transparent',
          borderLeft: pasted ? `2px solid ${colors.green}` : '2px solid transparent',
          padding: pasted ? '10px 12px' : '10px 0',
          borderRadius: 4,
          whiteSpace: 'pre-wrap',
          minHeight: 50,
          opacity: composeTextOpacity,
          transition: 'background 0.2s',
        }}>{pasted ? DRAFTED : ''}</div>

        {/* Compose bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 10,
          paddingTop: 6,
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', gap: 6, color: colors.textMuted, fontSize: 18 }}>
            <span>😊</span><span>🖼</span><span>📎</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, fontWeight: 800, border: '1.5px solid rgba(0,0,0,0.5)', borderRadius: 4, padding: '0 4px', height: 18, display: 'inline-flex', alignItems: 'center' }}>GIF</span>
          </div>
          <button style={{
            background: pasted ? colors.brand : 'rgba(0,0,0,0.05)',
            color: pasted ? '#fff' : colors.textFaint,
            border: 'none',
            borderRadius: 999,
            padding: '8px 24px',
            fontFamily: fonts.sans, fontWeight: 700, fontSize: 14,
            transform: `scale(${sendBtnScale})`,
            boxShadow: pasted ? '0 6px 18px rgba(10,102,194,0.35)' : 'none',
            cursor: 'pointer',
          }}>Send</button>
        </div>
      </div>
    </div>
  )
}
