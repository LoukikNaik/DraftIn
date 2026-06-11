import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { ChromeWindow, KbdBadge, ScreenFlash, QueueBadge, Caption, CaptureCorners } from '../components/Primitives'
import { HiringPostScreen, ProfileTopScreen, ProfileExpScreen } from '../components/LinkedInScreens'
import { DURATIONS } from '../theme'

const subScenes = [
  { url: 'linkedin.com/feed/update/urn:li:activity:7257…', caption: '01 · Hiring post',           Body: HiringPostScreen },
  { url: 'linkedin.com/in/priya-shah',                      caption: '02 · Profile · top',        Body: ProfileTopScreen },
  { url: 'linkedin.com/in/priya-shah  (scrolled)',          caption: '03 · Profile · Experience', Body: ProfileExpScreen },
]

export const Act1Capture: React.FC = () => {
  const frame = useCurrentFrame()
  const PER = DURATIONS.capPer  // 90
  const idx = Math.min(Math.floor(frame / PER), subScenes.length - 1)
  const localFrame = frame - idx * PER
  const sub = subScenes[idx]

  // Page enter animation
  const enterOpacity = interpolate(localFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const enterScale = interpolate(localFrame, [0, 14], [0.97, 1], { extrapolateRight: 'clamp' })

  // Alt+K timing within each sub-scene
  const KBD_IN = 55
  const FLASH_AT = 64
  const KBD_OUT = 84

  // Cumulative queue count: bumps right at the flash moment
  const queueCount = idx + (localFrame >= FLASH_AT ? 1 : 0)

  return (
    <AbsoluteFill style={{ background: '#0B1424' }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
        <div style={{
          flex: 1,
          opacity: enterOpacity,
          transform: `scale(${enterScale})`,
          display: 'flex',
          position: 'relative',
        }}>
          <ChromeWindow url={sub.url}>
            <sub.Body />
          </ChromeWindow>
          <CaptureCorners startFrame={idx * PER + 0} />
        </div>

        {/* White flash */}
        <ScreenFlash startFrame={idx * PER + FLASH_AT} />

        {/* Alt+K keystroke pill */}
        <KbdBadge keys={['Alt', 'K']} startFrame={idx * PER + KBD_IN} endFrame={idx * PER + KBD_OUT} bottom={64} right={64} />

        {/* Persistent queue badge — bumps at flash */}
        <QueueBadge count={queueCount} bumpFrame={idx * PER + FLASH_AT} />

        {/* Step caption */}
        <Caption text={sub.caption} startFrame={idx * PER} />
      </div>
    </AbsoluteFill>
  )
}
