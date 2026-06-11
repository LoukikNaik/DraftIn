import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { ChatGPTPanel } from '../components/ChatGPTPanel'
import { Caption } from '../components/Primitives'

export const Act2Draft: React.FC = () => {
  const frame = useCurrentFrame()
  const enter = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const enterScale = interpolate(frame, [0, 14], [0.985, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ background: '#0B1424' }}>
      <div style={{
        width: '100%', height: '100%',
        display: 'flex',
        opacity: enter,
        transform: `scale(${enterScale})`,
      }}>
        <ChatGPTPanel revealFrom={0} copiedToastFrom={195} />
      </div>
      <Caption text="DRAFT · GPT-5.5 IS WRITING" startFrame={0} />
    </AbsoluteFill>
  )
}
