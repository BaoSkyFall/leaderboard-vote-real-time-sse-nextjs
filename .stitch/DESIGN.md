---
name: GEM Rap Battle Live
colors:
  background: '#0A1633'
  on-background: '#FFFFFF'
  surface: '#0A1633'
  surface-dim: '#070F24'
  surface-bright: '#1A2540'
  surface-container-lowest: '#070F24'
  surface-container-low: '#0F1A37'
  surface-container: '#131D33'
  surface-container-high: '#1A2540'
  surface-container-highest: '#202A3B'
  on-surface: '#FFFFFF'
  on-surface-variant: '#A8B4D0'
  inverse-surface: '#F5F7FB'
  inverse-on-surface: '#0A1633'
  outline: '#3A4466'
  outline-variant: '#27314F'
  surface-tint: '#1452F5'
  primary: '#1452F5'
  on-primary: '#FFFFFF'
  primary-container: '#0B2A8F'
  on-primary-container: '#DCE7FF'
  inverse-primary: '#1452F5'
  secondary: '#FF8A35'
  on-secondary: '#0A1633'
  secondary-container: '#7A3A08'
  on-secondary-container: '#FFE5D2'
  tertiary: '#FF8A35'
  on-tertiary: '#0A1633'
  tertiary-container: '#7A3A08'
  on-tertiary-container: '#FFE5D2'
  error: '#FF4D4D'
  on-error: '#FFFFFF'
  error-container: '#5C0A0A'
  on-error-container: '#FFDAD6'
  primary-fixed: '#DCE7FF'
  primary-fixed-dim: '#9BB6FF'
  on-primary-fixed: '#06143F'
  on-primary-fixed-variant: '#0B2A8F'
  secondary-fixed: '#FFE5D2'
  secondary-fixed-dim: '#FFB98A'
  on-secondary-fixed: '#2A1300'
  on-secondary-fixed-variant: '#7A3A08'
  tertiary-fixed: '#FFE5D2'
  tertiary-fixed-dim: '#FFB98A'
  on-tertiary-fixed: '#2A1300'
  on-tertiary-fixed-variant: '#7A3A08'
  surface-variant: '#202A3B'
typography:
  display-lg:
    fontFamily: Aptos
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 58px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Aptos
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 42px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Aptos
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 31px
    letterSpacing: '0'
  body-base:
    fontFamily: Aptos
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: '0'
  body-bold:
    fontFamily: Aptos
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: '0'
  label-caps:
    fontFamily: Aptos
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  stat-lg:
    fontFamily: Aptos
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
rounded:
  sm: 0.375rem
  DEFAULT: 0.75rem
  md: 1rem
  lg: 1.25rem
  xl: 1.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
---

## Brand & Style

This is the live voting experience for **GEM Corporation's internal rap battle**.
The personality is **energetic, electric, and celebratory** — a live-stage feel
built on GEM's corporate color DNA (electric blue, deep navy, accent orange).
Think a sports/esports scoreboard meets a concert stage: dark navy backdrop so
the candidates and live vote counts glow, with motion and momentum everywhere.

Mobile-first is mandatory: every screen is designed for a phone held in one hand
during a fast 4-5 minute live vote. Layouts are single-column, thumb-reachable,
and the most important live data (countdown, leaderboard positions, vote counts)
must stay legible at a glance.

## Colors

The canvas is **Deep Navy (#0A1633)** — a dark "stage" that makes everything pop.
**Primary Blue (#1452F5)** drives interactivity (buttons, active states, the
voter's chosen candidate, progress bars). **Accent Orange (#FF8A35)** is the
energy/highlight color: it crowns the current #1 candidate, fuels the celebration
confetti, and marks live/urgent states (countdown turning urgent, "VOTE NOW").

Use glows and subtle gradients of blue→navy and orange flares to create energy —
this is the one context where richer gradients and motion are encouraged. Keep
text high-contrast white (#FFFFFF) / muted slate (#A8B4D0) on the dark surfaces.

## Typography

**Aptos** throughout (GEM's brand typeface), with a bold, athletic feel. Display
and stat styles are heavy (700) with tight tracking to read as a live scoreboard.
Vote counts and the countdown use the `stat-lg` style — big, punchy numerals.
Labels are uppercase with wide tracking for an "event broadcast" feel.

## Layout & Spacing

Single-column mobile-first layouts on a strict 4px/8px rhythm. Generous safe
areas and oversized touch targets (minimum 48x48px) since users tap fast during
the live window. Sticky header holds the countdown; the leaderboard fills the
scrollable body; the primary CTA (cast vote) is a full-width sticky button.

## Elevation & Depth

Depth comes from layered dark surfaces (navy → charcoal) plus colored glows
rather than heavy gray shadows. The leading candidate card carries an orange glow;
the voter's selected card carries a blue glow ring. Cards use rounded-lg corners.

## Shapes

Bold rounded corners (rounded-lg / rounded-xl) for a tactile, energetic feel.
Rank badges and live chips are pill-shaped (rounded-full). Avatars are circular
with a colored ring indicating rank (#1 orange, others blue/slate).

## Components

### Buttons
Primary action ("Cast Vote", "Start Vote") is a full-width solid Primary Blue
button, 52px+ tall, with a subtle glow on hover/press. The winning/confirm action
may use Accent Orange. Secondary actions use outlined blue.

### Leaderboard Candidate Card
Horizontal row: rank badge, circular avatar (with rank-colored ring), Rap Name,
animated vote-count and a progress bar that fills toward the leader. The #1 row is
visually elevated with an orange glow and a crown/flame accent. Rows animate
(slide/reorder) when ranks change in real time.

### Countdown Timer
Large `stat-lg` numerals in a sticky header pill. Turns from blue to accent orange
in the final 30 seconds to signal urgency, with a soft pulse animation.

### ID Login Field
Single text field on a focused, centered card over the navy stage. Large label
above, blue bottom-border that lights up on focus. Inline error if the ID is not
on the roster.

### Waiting / Lobby State
Centered hero: event title, "Waiting for the organizer to start" message, a live
"online voters" count, and an animated pulsing indicator. BTC users additionally
see the control panel here.

### BTC Control Panel
A distinct elevated card (charcoal surface) with duration input and Start / Stop /
Reset buttons. Clearly separated from the voter experience and labeled "Organizer
Controls (BTC)".

### Results / Celebration
Podium layout (top 3) with the #1 candidate centered and largest, orange glow,
crown, confetti burst across the screen, and final vote tallies in `stat-lg`.
