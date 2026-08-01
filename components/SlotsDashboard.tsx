"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import "@/styles/dashboard.css";

const GAMES = [
  {
    id: "markkdbills",
    title: "Markk'd Bills",
    subtitle: "5-reel currency slots · Live now",
    href: "/games/markkdbills",
    thumb: "$",
    thumbClass: "g1",
    tag: "Slots",
    tagClass: "green",
  },
  {
    id: "exchange",
    title: "Global Exchange",
    subtitle: "Trade routes refresh every 5:00",
    href: "/games/markkdbills",
    thumb: "💱",
    thumbClass: "g2",
    tag: "Market",
    tagClass: "yellow",
  },
  {
    id: "wallet",
    title: "Currency Wallet",
    subtitle: "Hold EUR · GBP · BTC · more",
    href: "/games/markkdbills",
    thumb: "🏦",
    thumbClass: "g3",
    tag: "Wallet",
    tagClass: "soft-green",
  },
  {
    id: "founder",
    title: "Founder Live Ops",
    subtitle: "Scores · charts · approvals",
    href: "/founder",
    thumb: "📡",
    thumbClass: "g4",
    tag: "Ops",
    tagClass: "soft-yellow",
  },
];

const TOURNAMENTS = [
  { title: "Dollar Rush", viewers: "12.4k", rating: "4.9", progress: 72, cls: "t1", emoji: "💵" },
  { title: "Crypto Spin", viewers: "8.1k", rating: "4.7", progress: 45, cls: "t2", emoji: "₿" },
  { title: "Euro Heat", viewers: "6.6k", rating: "4.8", progress: 88, cls: "t3", emoji: "€" },
];

const FILTERS = ["Newest", "Free to play", "Multiplayer", "Slots", "Tournaments", "Live"];

export default function SlotsDashboard() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Slots");

  const filteredGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((g) => {
      const hay = `${g.title} ${g.subtitle} ${g.tag}`.toLowerCase();
      const matchesQuery = !q || hay.includes(q);
      const matchesFilter =
        filter === "Newest" ||
        filter === "Free to play" ||
        filter === "Multiplayer" ||
        filter === "Live" ||
        hay.includes(filter.toLowerCase()) ||
        (filter === "Slots" && g.tag === "Slots");
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return (
    <div className="dash-shell">
      <div className="dash-frame">
        {/* LEFT SIDEBAR — desktop */}
        <aside className="dash-left panel">
          <Link className="dash-logo" href="/">
            <span className="dash-logo-mark">M</span>
            <span>Markkade</span>
          </Link>
          <nav className="side-nav" aria-label="Primary">
            <Link className="active" href="/">
              <span>▣</span> Dashboard
            </Link>
            <Link href="/games/markkdbills">
              <span>♠</span> Library
            </Link>
            <Link href="/founder">
              <span>◈</span> Statistic
            </Link>
            <Link href="/todos">
              <span>◎</span> Account
            </Link>
            <Link href="/games/markkdbills">
              <span>◆</span> Redeem
            </Link>
            <Link href="/founder">
              <span>⚙</span> Setting
            </Link>
          </nav>
          <div className="promo-card">
            <div style={{ fontSize: "2rem", marginBottom: "0.35rem" }}>🎰</div>
            <h3>Get your reward!</h3>
            <p>Approved players receive $10,000 from the house bank.</p>
            <Link className="preorder" href="/games/markkdbills" style={{ width: "100%", justifyContent: "center" }}>
              Redeem
            </Link>
          </div>
        </aside>

        {/* MAIN */}
        <div className="dash-main">
          {/* Mobile top bar */}
          <div className="dash-topbar mobile-only">
            <Link className="dash-logo" href="/">
              <span className="dash-logo-mark">M</span>
            </Link>
            <label className="dash-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games..."
                aria-label="Search games"
              />
            </label>
            <Link className="dash-icon-btn" href="/founder" aria-label="Notifications" style={{ position: "relative" }}>
              ⌂
              <span className="badge" />
            </Link>
            <Link className="dash-icon-btn" href="/todos" aria-label="Profile">
              ◉
            </Link>
          </div>

          {/* Desktop header */}
          <div className="desktop-only desktop-top">
            <div>
              <p className="welcome">Welcome back</p>
              <h1 className="dash-title">Markkade Slots Lobby</h1>
            </div>
            <label className="dash-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Game Search..."
                aria-label="Game search"
              />
            </label>
            <div className="top-filters">
              <select className="select-pill" aria-label="Genre" defaultValue="slots">
                <option value="slots">Genre · Slots</option>
                <option value="arcade">Genre · Arcade</option>
              </select>
              <select className="select-pill" aria-label="Level" defaultValue="all">
                <option value="all">Level · All</option>
                <option value="pro">Level · Pro</option>
              </select>
            </div>
          </div>

          <div className="filter-row tablet-up">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`chip ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Featured + list */}
          <section className="hero-with-list">
            <Link className="hero-card" href="/games/markkdbills">
              <span className="hero-live">
                <span className="dot" /> 27.5k watching
              </span>
              <span className="hero-play" aria-hidden="true">
                ▶
              </span>
              <div className="hero-meta">
                <div>
                  <h2>Markk&apos;d Bills</h2>
                  <p>5-reel currency slots · match · trade · cash out</p>
                </div>
                <span className="hero-time">02:05:87</span>
              </div>
            </Link>

            <div className="panel">
              <div className="section-head">
                <h2>Today Tournament (3)</h2>
                <Link className="section-link" href="/games/markkdbills">
                  Swords (4)
                </Link>
              </div>
              <div className="game-list">
                {(filteredGames.length ? filteredGames : GAMES).map((game) => (
                  <Link key={game.id} className="game-row" href={game.href}>
                    <span className={`game-thumb ${game.thumbClass}`}>{game.thumb}</span>
                    <span className="game-copy">
                      <strong>{game.title}</strong>
                      <span>{game.subtitle}</span>
                    </span>
                    <span className={`pill ${game.tagClass}`}>{game.tag}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Coming soon — desktop/tablet accent from mock 3 */}
          <section className="coming-card tablet-up">
            <p className="eyebrow">COMING SOON</p>
            <h2>Markkade Season 2</h2>
            <div className="tag-row">
              <span className="pill soft-green">Slots</span>
              <span className="pill soft-yellow">Crypto</span>
              <span className="pill soft-green">Exchange</span>
            </div>
            <p>
              New seasonal markets, rare currency drops, and cross-game Markkade rewards. Pre-order seat
              unlocks early exchange scanner access.
            </p>
            <Link className="preorder" href="/games/markkdbills">
              PRE-ORDERING
            </Link>
            <span className="coming-art" aria-hidden="true">
              🪙
            </span>
          </section>

          <section className="panel">
            <div className="section-head">
              <h2>Tournaments</h2>
              <Link className="section-link" href="/games/markkdbills">
                see all
              </Link>
            </div>
            <div className="tour-scroller">
              {TOURNAMENTS.map((t) => (
                <Link key={t.title} className={`tour-card ${t.cls}`} href="/games/markkdbills">
                  <span className="emoji" aria-hidden="true">
                    {t.emoji}
                  </span>
                  <h3>{t.title}</h3>
                  <div className="meta">
                    <span>👁 {t.viewers}</span>
                    <span>★ {t.rating}</span>
                  </div>
                  <div className="progress" aria-label={`${t.progress}% complete`}>
                    <i style={{ width: `${t.progress}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <div className="finance-inline mobile-only">
            <FinancePanel />
            <section className="panel trends">
              <span className="orbit">€</span>
              <span className="orbit">£</span>
              <span className="orbit">¥</span>
              <span className="orbit">₿</span>
              <div className="trends-number">56</div>
            </section>
          </div>

          <section className="panel tablet-up">
            <div className="section-head">
              <h2>Popular Choice&apos;s</h2>
              <Link className="section-link" href="/games/markkdbills">
                see all
              </Link>
            </div>
            <div className="popular-grid">
              {GAMES.slice(0, 3).map((g) => (
                <Link key={g.id} className="popular-card" href={g.href}>
                  <div className={`popular-art ${g.thumbClass}`}>{g.thumb}</div>
                  <div className="body">
                    <h3>{g.title}</h3>
                    <div className="tag-row">
                      <span className={`pill ${g.tagClass}`}>{g.tag}</span>
                    </div>
                    <div className="price-row">
                      <span className="price">Play</span>
                      <span className="cart-btn" aria-hidden="true">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR — desktop */}
        <aside className="dash-right">
          <div className="panel">
            <div className="profile-block">
              <div className="avatar">MB</div>
              <div>
                <strong>Markk Player</strong>
                <div className="online">● Online</div>
              </div>
            </div>
            <div className="balance-label">
              <span>YOUR BALANCE</span>
              <button className="plus-btn" type="button" aria-label="Add funds">
                +
              </button>
            </div>
            <div className="balance-value">$10,000</div>
            <Link className="receipt-link" href="/founder">
              Check detail your receipt.
            </Link>
          </div>

          <FinancePanel />

          <div className="panel">
            <div className="section-head">
              <h3>Updating...</h3>
            </div>
            <ul className="note-list">
              <li>
                <span className="game-thumb g1">$</span>
                <div>
                  <strong>Markk&apos;d Bills</strong>
                  <div className="bar">
                    <i style={{ width: "78%" }} />
                  </div>
                </div>
              </li>
              <li>
                <span className="game-thumb g2">💱</span>
                <div>
                  <strong>Exchange Market</strong>
                  <div className="bar">
                    <i style={{ width: "42%" }} />
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="panel">
            <div className="section-head">
              <h3>Friend Activity</h3>
            </div>
            <ul className="friend-list">
              <li>
                <span className="avatar">A</span>
                <div>
                  <strong>Ava</strong>
                  <div style={{ color: "var(--dash-muted)", fontSize: "0.78rem" }}>
                    Playing Markk&apos;d Bills
                  </div>
                </div>
              </li>
              <li>
                <span className="avatar">J</span>
                <div>
                  <strong>Jordan</strong>
                  <div style={{ color: "var(--dash-muted)", fontSize: "0.78rem" }}>
                    Trading EUR → USD
                  </div>
                </div>
              </li>
            </ul>
            <div className="invite-card">
              <strong>Game Invite</strong>
              <p style={{ margin: "0.35rem 0 0", color: "var(--dash-muted)", fontSize: "0.82rem" }}>
                Join Markk&apos;d Bills spin room now.
              </p>
              <div className="invite-actions">
                <Link className="btn-join" href="/games/markkdbills">
                  I&apos;M JOIN
                </Link>
                <button className="btn-decline" type="button">
                  NO, DECLINE
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <nav className="dash-bottom" aria-label="Mobile">
        <Link href="/">
          <span className="ico">⌂</span>
          Home
        </Link>
        <Link href="/founder">
          <span className="ico">🛡</span>
          Chart
        </Link>
        <Link className="fab" href="/games/markkdbills" aria-label="Games">
          ▶
        </Link>
        <Link className="active" href="/">
          <span className="ico">▦</span>
          Games
        </Link>
        <Link href="/todos">
          <span className="ico">⚙</span>
          Settings
        </Link>
      </nav>
    </div>
  );
}

function FinancePanel() {
  return (
    <section className="panel finance-card">
      <h2>Financial Game</h2>
      <div className="ring-wrap" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="#3dffb0"
            strokeWidth="12"
            strokeDasharray="90 200"
            strokeLinecap="round"
          />
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="#f5d76e"
            strokeWidth="12"
            strokeDasharray="55 200"
            strokeDashoffset="-95"
            strokeLinecap="round"
          />
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="#17c784"
            strokeWidth="12"
            strokeDasharray="40 200"
            strokeDashoffset="-155"
            strokeLinecap="round"
          />
        </svg>
        <div className="ring-center">
          <div className="ring-mascot">🎰</div>
          <strong>$180</strong>
          <span>Total Income</span>
        </div>
      </div>
      <div className="finance-stats">
        <div>
          <strong>25%</strong>
          <span>Gifts</span>
        </div>
        <div>
          <strong>18%</strong>
          <span>Income</span>
        </div>
        <div>
          <strong>18%</strong>
          <span>Expenses</span>
        </div>
      </div>
      <div className="spark">
        <svg viewBox="0 0 200 54" preserveAspectRatio="none">
          <path
            d="M0 40 C 20 36, 30 20, 50 24 S 80 48, 100 30 S 140 10, 160 22 S 180 40, 200 18"
            fill="none"
            stroke="#3dffb0"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <Link className="analysis-btn" href="/founder" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}>
        Analysis
      </Link>
    </section>
  );
}
