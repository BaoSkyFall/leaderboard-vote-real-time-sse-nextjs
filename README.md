# GEM Rap Battle — Live Vote

An internal, mobile-first real-time voting site for the **GEM Rap Battle**. Employees
log in with an ID against a hardcoded roster, the organizer (BTC) kicks off a timed
vote, and every connected client syncs live via **Server-Sent Events (SSE)** — the
server is the single source of truth for both state and the clock. The leaderboard
animates as the 3 candidates race for #1, and when time is up a podium + confetti
celebration crowns the champion.

- **1 vote per person**, pick 1 candidate, irrevocable.
- **Early joiners** flip to voting instantly when the BTC starts.
- **Late joiners** receive the correct remaining time (server-authoritative).
- **Reconnects self-heal**: `EventSource` auto-reconnects and immediately gets a fresh snapshot.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- SSE via a Node.js route handler (`/api/stream`)
- Persistence: **Upstash Redis** in production, **in-memory** fallback for local dev
- `framer-motion` (leaderboard reorder), `canvas-confetti` (celebration)
- Font: Hanken Grotesk (via `next/font`), with `Aptos` listed first for installs that have the GEM brand font

## Run locally (zero config)

```bash
npm install
npm run dev
# open http://localhost:3000
```

With no environment variables set, the app uses an **in-memory store** and a dev
session secret — perfect for a single-process local demo. State resets when the dev
server restarts.

### Try it

Sample roster IDs live in `config/roster.ts`:

| ID         | Role  |
|------------|-------|
| `baoppq`   | voter |
| `hoanv`    | voter |
| `minhtt`   | voter |
| `lannp`    | voter |
| `tuanda`   | voter |
| `btcadmin` | **btc** (sees the control panel) |

Log in as `btcadmin` to set a duration and press **Bắt đầu**; log in as a voter in
another browser/incognito window to vote. Lookup is case-insensitive.

Edit `config/roster.ts`, `config/candidates.ts`, and `config/event.ts` to supply the
real lists and event settings.

## Build

```bash
npm run build
npm run start   # serve the production build
```

## Deploy to Vercel

1. Push this repo to GitHub and **Import Project** at https://vercel.com/new.
2. Framework preset auto-detects **Next.js** — no build overrides needed.
3. Add the environment variables below in **Project → Settings → Environment Variables**.
4. Deploy.

> **SSE note:** `/api/stream` sets `maxDuration = 300`. On Vercel Hobby the function
> cap is lower; the client auto-reconnects and re-snapshots on every drop, so the UI
> self-heals regardless. For long uninterrupted streams use a Pro plan.

### Upstash Redis setup

In-memory state is **not durable or shared** across serverless invocations, so Redis
is required in production:

1. Create a free database at https://console.upstash.com/ → **Redis**.
2. Open the database → **REST API** section.
3. Copy **`UPSTASH_REDIS_REST_URL`** and **`UPSTASH_REDIS_REST_TOKEN`**.
4. Set them as Vercel env vars (see below). When both are present the app switches to
   Redis automatically.

### Environment variables

See `.env.example`.

| Variable                   | Required | Purpose                                                        |
|----------------------------|----------|----------------------------------------------------------------|
| `UPSTASH_REDIS_REST_URL`   | prod     | Upstash REST endpoint. If unset, in-memory store is used.      |
| `UPSTASH_REDIS_REST_TOKEN` | prod     | Upstash REST token. Both URL + token must be set to use Redis. |
| `SESSION_SECRET`           | prod     | HMAC secret for the signed session cookie (`openssl rand -hex 32`). |

## How it works

- **Auth** (`lib/session.ts`): `POST /api/login` validates the ID against the roster
  and sets an httpOnly, HMAC-signed `gem_session` cookie `{userId, role}`.
- **Store** (`lib/store.ts`): election lifecycle (`start`/`stop`/`reset`), atomic
  vote casting (1 per user), tally, and ranking with a timestamp tie-break — the
  candidate who *reached* a tying count first ranks higher. A `running` election whose
  `endsAt` has passed auto-closes to `ended` on read.
- **SSE** (`/api/stream`): sends a `snapshot` immediately on connect, then polls the
  store every second and emits a new `snapshot` only when something changed, with a
  `:heartbeat` comment every 15s.
- **Clock**: the client derives the countdown from `endsAt - (serverNow + drift)`, so
  it never trusts the local clock for vote validity. The server re-checks `now < endsAt`
  on every vote.

## Project structure

```
app/
  layout.tsx              # root layout, fonts, viewport
  page.tsx                # login (redirects to /event if already signed in)
  event/page.tsx          # authed event page → <EventClient/>
  api/
    login/ logout/        # auth
    vote/                 # cast a vote (guarded)
    admin/start|stop|reset# BTC-only controls
    stream/               # SSE snapshot stream
components/                # LoginForm, EventClient, Lobby, Voting, Results, ...
config/                    # roster, candidates, event (placeholders)
lib/                       # store, session, snapshot, types, useCountdown
public/avatars/            # placeholder candidate avatars
```
