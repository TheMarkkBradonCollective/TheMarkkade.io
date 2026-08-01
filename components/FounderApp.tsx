"use client";

import { useEffect } from "react";
import Link from "next/link";
import "@/styles/founder.css";

export default function FounderApp() {
  useEffect(() => {
    let active = true;
    (async () => {
      const { initFounderApp } = await import("@/lib/founder-app");
      if (active) initFounderApp();
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div id="loginView" className="login-view">
        <form className="login-card" id="loginForm" noValidate>
          <p className="eyebrow">Markkade</p>
          <h1>Founder Login</h1>
          <p className="sub">Live watch only — founders cannot play games.</p>
          <label>
            Username
            <input id="username" name="username" autoComplete="username" placeholder="founder" />
          </label>
          <label>
            Password
            <input id="password" name="password" type="password" autoComplete="current-password" />
          </label>
          <p className="error" id="loginError" hidden>
            {" "}
          </p>
          <button className="btn-primary" type="submit">
            Enter Live Ops
          </button>
          <Link className="back-link" href="/">
            ← Back to Markkade
          </Link>
        </form>
      </div>

      <div id="dashView" className="dash-view" hidden>
        <header className="dash-top">
          <div>
            <Link className="brand" href="/">
              Markkade
            </Link>
            <h1>Founder Live Ops</h1>
            <p className="sub">
              Approve players ($10,000 each), then watch scores & charts live. Play is disabled for
              founder.
            </p>
          </div>
          <div className="top-actions">
            <span className="live-pill" id="livePill">
              <span className="dot" /> LIVE
            </span>
            <button className="ghost" id="logoutBtn" type="button">
              Log out
            </button>
          </div>
        </header>

        <section className="stat-grid">
          <article className="stat hero-stat">
            <p className="stat-label">House Bank</p>
            <p className="stat-value" id="houseBank">
              $100,000,000,000
            </p>
            <p className="stat-foot" id="houseDelta">
              vs start
            </p>
          </article>
          <article className="stat">
            <p className="stat-label">Total Wagered</p>
            <p className="stat-value sm" id="totalWagered">
              $0
            </p>
          </article>
          <article className="stat">
            <p className="stat-label">Total Paid Out</p>
            <p className="stat-value sm" id="totalPaid">
              $0
            </p>
          </article>
          <article className="stat">
            <p className="stat-label">Active Players</p>
            <p className="stat-value sm" id="activePlayers">
              0
            </p>
          </article>
        </section>

        <section className="panel approvals-panel">
          <div className="panel-head">
            <h2>Pending Approvals</h2>
            <span className="muted" id="pendingMeta">
              0 waiting · $10,000 grant each
            </span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Requested</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="pendingBody" />
            </table>
          </div>
        </section>

        <section className="charts">
          <article className="panel">
            <div className="panel-head">
              <h2>House Bank</h2>
              <span className="muted">Live</span>
            </div>
            <canvas id="bankChart" height={120} />
          </article>
          <article className="panel">
            <div className="panel-head">
              <h2>Wagers vs Payouts</h2>
              <span className="muted">Cumulative</span>
            </div>
            <canvas id="flowChart" height={120} />
          </article>
        </section>

        <section className="split">
          <article className="panel">
            <div className="panel-head">
              <h2>Live Scores</h2>
              <span className="muted" id="scoreMeta">
                0 players
              </span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Score</th>
                    <th>Wins</th>
                    <th>Spins</th>
                  </tr>
                </thead>
                <tbody id="scoreBody" />
              </table>
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Live Activity</h2>
              <span className="muted">Streaming</span>
            </div>
            <ul className="feed" id="activityFeed" />
          </article>
        </section>

        <p className="founder-note">
          Founder play is locked. Open player games in a separate browser/profile to generate live
          traffic.
        </p>
      </div>
    </>
  );
}
