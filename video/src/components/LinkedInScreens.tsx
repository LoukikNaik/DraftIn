import React from 'react'
import { colors, fonts } from '../theme'
import { LinkedInNav } from './Primitives'

// ── Hiring post (Priya's feed post about hiring) ──────────────────
export const HiringPostScreen: React.FC = () => (
  <div style={{
    width: '100%', height: '100%',
    background: colors.liBg,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fonts.sans,
  }}>
    <LinkedInNav />
    <div style={{ flex: 1, padding: '24px 0', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: 560,
        background: colors.white,
        borderRadius: 10,
        border: `1px solid ${colors.liBorder}`,
        overflow: 'hidden',
      }}>
        {/* Post header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '18px 18px 8px' }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: '50%',
            background: colors.brandDeep,
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 20,
            letterSpacing: '-0.02em',
            flexShrink: 0,
          }}>PS</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: colors.text }}>
              Priya Shah <span style={{ fontWeight: 400, fontSize: 14, color: colors.textMuted }}>· 2nd</span>
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2, lineHeight: 1.35 }}>
              Eng Manager · Search Infra at Helix · ex-Pier
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>3d · 🌐</div>
          </div>
          <div style={{ fontSize: 22, color: colors.textFaint, lineHeight: 1 }}>⋯</div>
        </div>

        {/* Post body */}
        <div style={{ padding: '4px 18px 14px', fontSize: 15, lineHeight: 1.55, color: colors.text }}>
          <p style={{ margin: 0 }}><strong>We are hiring 2 backend engineers on the Helix Search Infra team.</strong></p>
          <p style={{ marginTop: 10, marginBottom: 0 }}>
            If you have shipped narrow, surgical wins on a hot path (index reshapes,
            query rewrites, p99 cuts under real load), I want to talk. DMs open.
            Reposts appreciated 🙏
          </p>
        </div>

        {/* Reactions */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 18px',
          fontSize: 13, color: colors.textMuted,
          borderTop: `1px solid rgba(0,0,0,0.05)`,
        }}>
          <span style={{ display: 'inline-flex' }}>
            {[colors.brand, '#DF704D', '#F5BB5C'].map((bg, i) => (
              <span key={i} style={{
                width: 22, height: 22,
                borderRadius: '50%',
                background: bg,
                border: '2px solid #fff',
                marginLeft: i === 0 ? 0 : -6,
                display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
              }}>{['👍','❤️','💡'][i]}</span>
            ))}
          </span>
          <span style={{ marginLeft: 6 }}>247</span>
          <span style={{ marginLeft: 'auto' }}>32 comments · 8 reposts</span>
        </div>

        {/* Action bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: `1px solid rgba(0,0,0,0.08)`,
          padding: '6px 8px',
        }}>
          {['👍 Like', '💬 Comment', '🔁 Repost', '➤ Send'].map(label => (
            <div key={label} style={{
              textAlign: 'center',
              fontSize: 14, fontWeight: 600, color: colors.textMuted,
              padding: '10px 0',
            }}>{label}</div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// ── Profile top - Priya's profile head section ────────────────────
export const ProfileTopScreen: React.FC = () => (
  <div style={{
    width: '100%', height: '100%',
    background: colors.liBg,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fonts.sans,
  }}>
    <LinkedInNav />
    <div style={{ flex: 1, padding: '24px 0', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: 560,
        background: colors.white,
        borderRadius: 10,
        border: `1px solid ${colors.liBorder}`,
        overflow: 'hidden',
      }}>
        {/* Cover banner */}
        <div style={{
          height: 110,
          background: `linear-gradient(120deg, ${colors.brandDeep} 0%, #4A7BC8 55%, #84A9DE 100%)`,
        }} />
        {/* Avatar + identity */}
        <div style={{ padding: '0 24px 18px', position: 'relative' }}>
          <div style={{
            width: 120, height: 120,
            borderRadius: '50%',
            background: colors.brandDeep,
            border: '5px solid #fff',
            margin: '-60px 0 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 42,
            letterSpacing: '-0.02em',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
          }}>PS</div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: 28, color: colors.text }}>Priya Shah</h4>
            <span style={{ color: colors.textMuted, fontSize: 14 }}>· 2nd</span>
          </div>

          <p style={{ margin: '6px 0 0', fontSize: 16, color: colors.text }}>
            Engineering Manager, Search Infra at Helix. Previously at Pier.
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: colors.textMuted }}>
            San Francisco, California · <span style={{ color: colors.brand, fontWeight: 600 }}>Contact info</span>
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>
            <span style={{ color: colors.brand, fontWeight: 600 }}>500+ connections</span>
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button style={{
              background: colors.brand, color: '#fff',
              border: 'none', borderRadius: 999,
              padding: '8px 22px',
              fontFamily: fonts.sans, fontSize: 15, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              cursor: 'pointer',
            }}>+ Connect</button>
            <button style={{
              background: 'transparent', color: colors.brand,
              border: `1.5px solid ${colors.brand}`, borderRadius: 999,
              padding: '7px 22px',
              fontFamily: fonts.sans, fontSize: 15, fontWeight: 600,
              cursor: 'pointer',
            }}>Message</button>
            <button style={{
              background: 'transparent', color: colors.textMuted,
              border: '1.5px solid rgba(0,0,0,0.5)', borderRadius: 999,
              padding: '7px 14px',
              fontFamily: fonts.sans, fontSize: 15, fontWeight: 600,
              cursor: 'pointer',
            }}>⋯</button>
          </div>
        </div>

        {/* About preview */}
        <div style={{ borderTop: `1px solid ${colors.liBorder}`, padding: '18px 24px' }}>
          <h5 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: colors.text }}>About</h5>
          <p style={{ margin: '10px 0 0', fontSize: 14, color: colors.text, lineHeight: 1.55 }}>
            I lead Search Infrastructure at Helix. We recently shipped the workspace
            search rewrite and cut p99 from 1.8s to 350ms without touching the query…
            <span style={{ color: colors.textMuted, fontWeight: 600 }}> see more</span>
          </p>
        </div>
      </div>
    </div>
  </div>
)

// ── Profile experience - scrolled down ────────────────────────────
export const ProfileExpScreen: React.FC = () => (
  <div style={{
    width: '100%', height: '100%',
    background: colors.liBg,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fonts.sans,
  }}>
    <LinkedInNav />
    <div style={{ flex: 1, padding: '24px 0', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: 560,
        background: colors.white,
        borderRadius: 10,
        border: `1px solid ${colors.liBorder}`,
        padding: '22px 24px',
      }}>
        <h5 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: colors.text }}>Experience</h5>

        {/* Entry 1: Helix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, marginTop: 22 }}>
          <div style={{
            width: 60, height: 60,
            background: colors.ink, color: '#fff',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 26,
          }}>N</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: colors.text }}>
              Engineering Manager, Search Infrastructure
            </div>
            <div style={{ fontSize: 14, color: colors.text, marginTop: 2 }}>
              Helix · Full-time
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
              Mar 2022 to Present · 3 yrs 3 mos
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
              San Francisco, California
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '20px 0' }} />

        {/* Entry 2: Pier */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16 }}>
          <div style={{
            width: 60, height: 60,
            background: '#635BFF', color: '#fff',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 26,
          }}>S</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: colors.text }}>
              Senior Software Engineer
            </div>
            <div style={{ fontSize: 14, color: colors.text, marginTop: 2 }}>
              Pier · Full-time
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
              Jul 2018 to Mar 2022 · 3 yrs 9 mos
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
