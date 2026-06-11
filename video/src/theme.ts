// Shared design tokens for the DraftIn video.
// Mirrors the landing site so the video feels native when embedded.

export const colors = {
  brand:        '#0A66C2',
  brandHi:      '#084E97',
  brandDeep:    '#1F4E96',
  brandSoft:    '#EBF3FF',
  ink:          '#0E0E10',
  text:         '#000000E6',
  textMuted:    'rgba(0,0,0,0.6)',
  textFaint:    'rgba(0,0,0,0.45)',
  liBg:         '#F4F2EE',
  liCardBg:     '#FFFFFF',
  liBorder:     'rgba(0,0,0,0.1)',
  liHover:      'rgba(0,0,0,0.05)',
  green:        '#10A37F',
  greenSoft:    'rgba(16,163,127,0.12)',
  chromeBg:     '#E1E2E4',
  cgBg:         '#212121',
  cgSidebarBg:  '#181818',
  cgBubble:     '#2F2F2F',
  white:        '#FFFFFF',
  stageBg:      '#0B1424',
  black:        '#000000',
} as const

export const fonts = {
  sans:  "'Source Sans 3', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  serif: "'Fraunces', Georgia, serif",
  mono:  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const

export const VIDEO = {
  width: 1280,
  height: 720,
  fps: 30,
} as const

// Total duration breakdown (frames):
// Act1 Capture (3 sub-screens, 90 frames each) ............ 270  (0s – 9s)
// Transition (Alt+L + thumbs converge)  ................... 30   (9s – 10s)
// Act2 Draft (ChatGPT)  ................................... 240  (10s – 18s)
// Act3 Paste & Send  ...................................... 180  (18s – 24s)
// Outro fade (loop seam)  ................................. 30   (24s – 25s)
export const DURATIONS = {
  capPer: 90,
  cap:    270,
  trans:  30,
  draft:  240,
  send:   180,
  outro:  30,
  total:  750,
} as const
