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
    tag: "Live",
    tagClass: "green",
  },
  {
    id: "exchange",
    title: "Global Exchange",
    subtitle: "Trade routes refresh every 5:00",
    href: "/games/markkdbills",
    thumb: "FX",
    thumbClass: "g2",
    tag: "Update",
    tagClass: "yellow",
  },
  {
    id: "wallet",
    title: "Currency Wallet",
    subtitle: "Hold EUR · GBP · BTC · more",
    href: "/games/markkdbills",
    thumb: "W",
    thumbClass: "g3",
    tag: "Soon",
    tagClass: "soft",
  },
  {
    id: "founder",
    title: "Founder Live Ops",
    subtitle: "Scores · charts · approvals",
    href: "/founder",
    thumb: "OPS",
    thumbClass: "g4",
    tag: "Live",
    tagClass: "green",
  },
];

const TOURNAMENTS = [
  { title: "Dollar Rush", viewers: "12.4k", rating: "4.9", progress: 72, cls: "t1", mark: "$" },
  { title: "Crypto Spin", viewers: "8.1k", rating: "4.7", progress: 45, cls: "t2", mark: "B" },
  { title: "Euro Heat", viewers: "6.6k", rating: "4.8", progress: 88, cls: "t3", mark: "E" },
];

const POPULAR = [
  { id: "p1", title: "Markk'd Bills", tag: "Slots", href: "/games/markkdbills", art: "g1", mark: "$" },
  { id: "p2", title: "Exchange Desk", tag: "Market", href: "/games/markkdbills", art: "g2", mark: "FX" },
  { id: "p3", title: "Wallet Run", tag: "Wallet", href: "/games/markkdbills", art: "g3", mark: "W" },
  { id: "p4", title: "House Watch", tag: "Ops", href: "/founder", art: "g4", mark: "OPS" },
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
        filter === "Slots" ||
        (filter === "Live" && g.tag === "Live") ||
        (filter === "Tournaments" && true) ||
        hay.includes(filter.toLowerCase());
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  const games = filteredGames.length ? filteredGames : GAMES;

  return (
    <div className="dash-page">
      <div className="dash-shell">
        <header className="top-chrome">
          <Link className="brand-lockup" href="/">
            <span className="brand-mark">M</span>
            <span className="brand-text">
              <strong>Markkade</strong>
              <small>Slots Lobby</small>
            </span>
          </Link>
          <nav className="icon-nav" aria-label="Quick">
            <Link className="icon-btn is-active" href="/" aria-label="Home">
              ⌂
            </Link>
            <Link className="icon-btn" href="/games/markkdbills" aria-label="Library">
              ▦
            </Link>
            <Link className="icon-btn" href="/founder" aria-label="Stats">
              ◈
            </Link>
            <Link className="icon-btn" href="/todos" aria-label="Account">
              ◉
            </Link>
            <Link className="icon-btn" href="/founder" aria-label="Settings">
              ⚙
            </Link>
          </nav>
          <div className="top-chrome-actions">
            <Link className="icon-btn" href="/founder" aria-label="Alerts">
              ⌕
              <i className="dot-badge" />
            </Link>
            <span className="avatar self">MB</span>
          </div>
        </header>

        <div className="dash-grid">
          <aside className="left-rail">
            <Link className="brand-lockup side" href="/">
              <span className="brand-mark">M</span>
              <span className="brand-text">
                <strong>Markkade</strong>
                <small>House Bank Live</small>
              </span>
            </Link>
            <nav className="side-nav" aria-label="Primary">
              <Link className="is-active" href="/">
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
            <div className="side-promo">
              <strong>Get your reward!</strong>
              <p>Approved players receive $10,000 from the house bank.</p>
              <Link href="/games/markkdbills">Redeem</Link>
            </div>
          </aside>

          <main className="dash-main">
            <div className="mobile-top">
              <div className="mobile-row">
                <div className="avatar-stack" aria-hidden="true">
                  <span className="avatar">A</span>
                  <span className="avatar">J</span>
                  <span className="avatar self">MB</span>
                </div>
                <div className="mobile-actions">
                  <Link className="icon-btn" href="/founder" aria-label="Alerts">
                    ⌕
                    <i className="dot-badge" />
                  </Link>
                  <Link className="icon-btn" href="/todos" aria-label="Profile">
                    ◉
                  </Link>
                </div>
              </div>
              <label className="searchbar">
                <span className="search-ico" aria-hidden="true">
                  ⌕
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search games..."
                  aria-label="Search games"
                />
              </label>
            </div>

            <div className="desktop-welcome">
              <div className="welcome-copy">
                <p>Welcome back</p>
                <h1>Markkade Slots Lobby</h1>
              </div>
              <label className="searchbar wide">
                <span className="search-ico" aria-hidden="true">
                  ⌕
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Game Search..."
                  aria-label="Game search"
                />
              </label>
            </div>

            <div className="category-tabs" role="tablist" aria-label="Filters">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  className={`cat-tab ${filter === f ? "is-active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="lobby-grid">
              <section className="area-featured">
                <Link className="hero-live" href="/games/markkdbills">
                  <span className="hero-media" aria-hidden="true" />
                  <span className="live-badge">
                    <i className="live-dot" /> 27.5k watching
                  </span>
                  <span className="hero-play" aria-hidden="true">
                    ▶
                  </span>
                  <span className="hero-foot">
                    <span>
                      <strong>Markk&apos;d Bills</strong>
                      <small>5-reel currency slots · match · trade · cash out</small>
                    </span>
                    <span className="hero-timer">02:05:87</span>
                  </span>
                </Link>

                <div className="coming-card">
                  <span className="coming-art" aria-hidden="true" data-mark="MK" />
                  <div className="coming-copy">
                    <p className="coming-kicker">COMING SOON</p>
                    <h2>Markkade Season 2</h2>
                    <div className="tag-row">
                      <span className="pill soft-green">Slots</span>
                      <span className="pill soft-yellow">Crypto</span>
                      <span className="pill soft-green">Exchange</span>
                    </div>
                    <p>New seasonal markets, rare currency drops, and early exchange scanner access.</p>
                    <Link className="cta-fill" href="/games/markkdbills">
                      PRE-ORDERING
                    </Link>
                  </div>
                </div>
              </section>

              <section className="panel area-games">
                <div className="panel-head">
                  <h2>Today Tournament (3)</h2>
                  <Link href="/games/markkdbills">Swords (4)</Link>
                </div>
                <div className="game-list">
                  {games.map((game) => (
                    <Link key={game.id} className="game-row" href={game.href}>
                      <span className={`game-thumb ${game.thumbClass}`}>{game.thumb}</span>
                      <span className="game-meta">
                        <strong>{game.title}</strong>
                        <small>{game.subtitle}</small>
                      </span>
                      <span className={`pill ${game.tagClass}`}>{game.tag}</span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="panel area-trends">
                <div className="panel-head">
                  <h2>Trends</h2>
                  <Link href="/founder">see all</Link>
                </div>
                <div className="trends-body">
                  <div className="trend-stat">
                    <strong>56</strong>
                    <small>Active rooms tonight</small>
                  </div>
                  <div className="orbit" aria-hidden="true">
                    <span className="avatar">A</span>
                    <span className="avatar">J</span>
                    <span className="avatar">K</span>
                    <span className="avatar self">MB</span>
                  </div>
                </div>
              </section>

              <section className="panel area-tourney">
                <div className="panel-head">
                  <h2>Tournaments</h2>
                  <Link href="/games/markkdbills">see all</Link>
                </div>
                <div className="tourney-grid">
                  {TOURNAMENTS.map((t) => (
                    <Link key={t.title} className={`tourney-card ${t.cls}`} href="/games/markkdbills">
                      <span className="tourney-art" data-mark={t.mark} />
                      <span className="tourney-body">
                        <strong>{t.title}</strong>
                        <span className="tourney-meta">
                          <span>{t.viewers}</span>
                          <span>★ {t.rating}</span>
                        </span>
                        <span className="progress" aria-label={`${t.progress}%`}>
                          <i style={{ width: `${t.progress}%` }} />
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="panel area-popular">
                <div className="panel-head">
                  <h2>Popular Choice&apos;s</h2>
                  <Link href="/games/markkdbills">see all</Link>
                </div>
                <div className="popular-grid">
                  {POPULAR.map((g) => (
                    <Link key={g.id} className="pop-card" href={g.href}>
                      <span className={`pop-art ${g.art}`} data-mark={g.mark} />
                      <span className="pop-body">
                        <strong>{g.title}</strong>
                        <small>{g.tag}</small>
                        <span className="pop-row">
                          <span className="price">Play</span>
                          <span className="cart">→</span>
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="panel area-finance mobile-finance">
                <FinancePanel />
              </section>
            </div>
          </main>

          <aside className="right-rail">
            <div className="panel profile-card">
              <span className="avatar self lg">MB</span>
              <div>
                <strong>Markk Player</strong>
                <small className="online">● Online</small>
              </div>
            </div>

            <div className="panel balance-card">
              <div className="balance-label">
                <span>YOUR BALANCE</span>
                <button className="plus-btn" type="button" aria-label="Add funds">
                  +
                </button>
              </div>
              <strong>$10,000</strong>
              <Link className="receipt" href="/founder">
                Check detail your receipt.
              </Link>
            </div>

            <div className="panel finance-side">
              <FinancePanel compact />
            </div>

            <div className="panel progress-card">
              <h3>Updating...</h3>
              <ul className="progress-list">
                <li>
                  <strong>
                    Markk&apos;d Bills <span>78%</span>
                  </strong>
                  <span className="progress">
                    <i style={{ width: "78%" }} />
                  </span>
                </li>
                <li>
                  <strong>
                    Exchange Market <span>42%</span>
                  </strong>
                  <span className="progress">
                    <i style={{ width: "42%" }} />
                  </span>
                </li>
              </ul>
            </div>

            <div className="panel notify-card">
              <h3>Notifications</h3>
              <ul className="notify-list">
                <li>
                  <span className="avatar">A</span>
                  <div>
                    <strong>Ava joined Dollar Rush</strong>
                    <small>2 min ago</small>
                  </div>
                </li>
                <li>
                  <span className="avatar">J</span>
                  <div>
                    <strong>Jordan cashed EUR → USD</strong>
                    <small>11 min ago</small>
                  </div>
                </li>
              </ul>
            </div>

            <div className="panel friends-card">
              <h3>Friend Activity</h3>
              <ul className="friend-list">
                <li>
                  <span className="avatar">A</span>
                  <div>
                    <strong>Ava</strong>
                    <small>Playing Markk&apos;d Bills</small>
                  </div>
                  <i className="online-dot" />
                </li>
                <li>
                  <span className="avatar">J</span>
                  <div>
                    <strong>Jordan</strong>
                    <small>Trading EUR → USD</small>
                  </div>
                  <i className="online-dot" />
                </li>
              </ul>
              <div className="invite-card">
                <strong>Game Invite</strong>
                <p>Join Markk&apos;d Bills spin room now.</p>
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
      </div>

      <nav className="mobile-dock" aria-label="Mobile">
        <Link href="/">
          <span>⌂</span>
          Home
        </Link>
        <Link href="/founder">
          <span>◈</span>
          Chart
        </Link>
        <Link className="dock-fab" href="/games/markkdbills" aria-label="Games">
          ▶
        </Link>
        <Link className="is-active" href="/">
          <span>▦</span>
          Games
        </Link>
        <Link href="/todos">
          <span>⚙</span>
          Settings
        </Link>
      </nav>
    </div>
  );
}

function FinancePanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`finance-panel ${compact ? "is-compact" : ""}`}>
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
      {!compact && (
        <div className="spark" aria-hidden="true">
          <svg viewBox="0 0 200 40" preserveAspectRatio="none">
            <path
              d="M0 28 C 20 24, 30 12, 50 16 S 80 34, 100 20 S 140 6, 160 14 S 180 28, 200 10"
              fill="none"
              stroke="#3dffb0"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      <Link className="analysis-btn" href="/founder">
        Analysis
      </Link>
    </div>
  );
}
