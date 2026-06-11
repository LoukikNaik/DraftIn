import React from 'react'
import { AbsoluteFill, Series, interpolate, useCurrentFrame } from 'remotion'
import { Act1Capture } from './scenes/Act1Capture'
import { Transition } from './scenes/Transition'
import { Act2Draft } from './scenes/Act2Draft'
import { Act3Send } from './scenes/Act3Send'
import { colors, DURATIONS } from './theme'

const Outro: React.FC = () => {
  const f = useCurrentFrame()
  const opacity = interpolate(f, [0, DURATIONS.outro], [0, 1])
  return <AbsoluteFill style={{ background: colors.black, opacity }} />
}

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: colors.stageBg }}>
      <Series>
        <Series.Sequence durationInFrames={DURATIONS.cap}>
          <Act1Capture />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.trans}>
          <Transition />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.draft}>
          <Act2Draft />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.send}>
          <Act3Send />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.outro}>
          <Outro />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  )
}
