# Markkade

## Overview

Markkade is a gaming ecosystem built around original casino-style, arcade, and interactive games.

The platform connects multiple games under one player identity, allowing players to track progress, earn rewards, and participate in the Markkade ecosystem.

---

# Vision

Markkade combines:

- Casino-style entertainment
- Arcade gaming
- Competitive gameplay
- Player progression
- Rewards systems
- Cross-game experiences

The goal is to create a complete digital gaming universe.

---

# Launch Game

## Markk'dBills 🎰

Markk'dBills is the first official Markkade game — a **5-slot machine** where players spin currency symbols, trade through a global exchange, and cash out to Markkade.

It introduces the Markkade gameplay style, economy systems, and player experience.

Full game design: [`MARKKD_BILLS.md`](MARKKD_BILLS.md)

---

# Currency System

## USD

USD is the starting currency system used inside Markkade games.

Players do **not** receive play money automatically.

Each player must be **approved by the founder**. Approved players receive **$10,000 USD** from the house bank.

Players earn, collect, trade, and manage USD-based gameplay values.

Future Markkade systems may connect game rewards into the larger Markkade ecosystem.

---

# Founder House Bank

The founder starts with a house bank of **$100,000,000,000**.

| Flow | Effect on house bank |
|------|----------------------|
| Founder approves a player | **$10,000** paid **from** house bank |
| Player wager / loss | Added **to** house bank |
| Player win / payout | Paid **from** house bank |

The founder **cannot play any games**.

The founder can log in to **Live Ops** to:

- Approve / reject player access requests
- Watch live player scores
- Watch house bank + wager/payout charts
- Follow the streaming activity feed

All panels update live as players play.

| Page | Path |
|------|------|
| Founder login / Live Ops | [`founder/`](founder/) |

Default demo login: `founder` / `markkade-founder`

---

# Platform Structure

```
Markkade

├── Games
│
├── Player Accounts
│
├── Wallet System
│
├── Achievements
│
├── Leaderboards
│
├── Rewards
│
└── Future Game Releases
```

---

# Player System

Players have:

- Profile
- Username
- Avatar
- Statistics
- Game History
- Achievements
- Wallet
- Rankings

---

# Platform Experiences

## Mobile

Designed for:

- Touch controls
- Fast gameplay
- Vertical layouts
- One-handed use

---

## Tablet

Designed for:

- Larger gameplay areas
- Enhanced controls
- Expanded dashboards

---

## Desktop

Designed for:

- Full casino experience
- Large animations
- Multiple panels
- Premium visuals

---

# Design Direction

Markkade should feel:

- Premium
- Futuristic
- Animated
- Interactive
- Casino inspired

Style:

- Dark environments
- Neon effects
- Gold accents
- Glass interfaces
- Smooth animations

---

# Future Expansion

Future Markkade games will share:

- Player accounts
- Rewards
- Achievements
- Progression
- Social features

---

# Play (Next.js + Supabase)

This project is a **Next.js** App Router app with **Supabase** auth/session helpers.

| Page | Path |
|------|------|
| Markkade slots lobby (responsive dashboard) | `/` |
| Markk'd Bills | `/games/markkdbills` |
| Founder Live Ops | `/founder` |
| Supabase todos sample | `/todos` |

The home lobby mimics a full slots website shell:

- **Mobile** — bottom dock, stacked hero / list / tournaments / finance
- **Tablet** — dual-pane content + coming soon / popular
- **Desktop** — 3-column shell (nav · lobby · balance/finance)

Brand accents are **green + yellow** on dark panels.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

```bash
npm run build
npm start
```

Supabase helpers live in `utils/supabase/` (`client.ts`, `server.ts`, `middleware.ts`). Root `middleware.ts` refreshes sessions.

Players request access, wait for founder approval, then receive **$10,000 USD**. Progress is saved in the browser (`localStorage`).
