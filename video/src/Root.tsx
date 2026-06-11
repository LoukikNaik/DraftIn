import React from 'react'
import { Composition } from 'remotion'
import { Video } from './Video'
import { OGCardScene } from './scenes/OGCard'
import { VIDEO, DURATIONS } from './theme'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video"
        component={Video}
        durationInFrames={DURATIONS.total}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="OGCard"
        component={OGCardScene}
        durationInFrames={1}
        fps={1}
        width={1200}
        height={630}
      />
    </>
  )
}
