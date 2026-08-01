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

Every player starts with **500 USD**.

Players earn, collect, trade, and manage USD-based gameplay values.

Future Markkade systems may connect game rewards into the larger Markkade ecosystem.

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

# Play

| Page | Path |
|------|------|
| Markkade hub | [`index.html`](index.html) |
| Markk'd Bills | [`games/markkdbills/`](games/markkdbills/) |

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` then launch **Markk'd Bills**.

Every player starts with **$500 USD**. Progress is saved in the browser (`localStorage`).
