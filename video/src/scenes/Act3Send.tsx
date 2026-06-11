import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { DMPanel } from '../components/DMPanel'
import { Caption, KbdBadge } from '../components/Primitives'

export const Act3Send: React.FC = () => {
  const frame = useCurrentFrame()
  const enter = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const enterScale = interpolate(frame, [0, 14], [0.985, 1], { extrapolateRight: 'clamp' })

  // Timing within the 180-frame send scene
  const PASTE = 28
  const SEND  = 120
  const DELIVERED = 138

  return (
    <AbsoluteFill style={{ background: '#0B1424' }}>
      <div style={{
        width: '100%', height: '100%',
        display: 'flex',
        opacity: enter,
        transform: `scale(${enterScale})`,
      }}>
        <DMPanel pasteFrom={PASTE} sendFrom={SEND} deliveredFrom={DELIVERED} />
      </div>

      {/* ⌘V keystroke around the paste moment */}
      <KbdBadge keys={['⌘', 'V']} startFrame={PASTE - 8} endFrame={PASTE + 30} bottom={64} right={64} />

      <Caption text="PASTE · ⌘V → SEND" startFrame={0} />
    </AbsoluteFill>
  )
}
