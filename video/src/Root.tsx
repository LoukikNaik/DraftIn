import React from 'react'
import { Composition } from 'remotion'
import { Video } from './Video'
import { VIDEO, DURATIONS } from './theme'

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Video"
      component={Video}
      durationInFrames={DURATIONS.total}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  )
}
