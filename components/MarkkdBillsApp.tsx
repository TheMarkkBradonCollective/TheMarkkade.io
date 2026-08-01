"use client";

import { useEffect } from "react";
import Link from "next/link";
import "@/styles/markkdbills.css";

export default function MarkkdBillsApp() {
  useEffect(() => {
    let active = true;
    (async () => {
      const { initMarkkdBills } = await import("@/lib/markkdbills-app");
      if (active) initMarkkdBills();
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="fx-layer" aria-hidden="true" />

      <header className="topbar">
        <Link className="back" href="/">
          ← Markkade
        </Link>
        <div className="topbar-brand">
          <span className="brand-name">Markk&apos;d Bills</span>
          <span className="brand-sub">5-Slot Currency Machine</span>
        </div>
        <div className="top-balances">
          <div className="pill" title="USD for spins">
            <span className="pill-label">USD</span>
            <strong id="usdBalance">$0.00</strong>
          </div>
          <div className="pill pill-markkade" title="Markkade balance">
            <span className="pill-label">MKD</span>
            <strong id="markkadeBalance">0.00</strong>
          </div>
        </div>
      </header>

      <main className="game">
        <section className="machine" aria-label="Five reel slot machine">
          <div className="machine-frame">
            <div className="payline-label">PAYLINE</div>
            <div className="reels" id="reels" role="img" aria-label="Slot reels">
              <div className="reel" data-reel="0">
                <div className="reel-window">
                  <span className="symbol">$</span>
                </div>
              </div>
              <div className="reel" data-reel="1">
                <div className="reel-window">
                  <span className="symbol">€</span>
                </div>
              </div>
              <div className="reel" data-reel="2">
                <div className="reel-window">
                  <span className="symbol">£</span>
                </div>
              </div>
              <div className="reel" data-reel="3">
                <div className="reel-window">
                  <span className="symbol">¥</span>
                </div>
              </div>
              <div className="reel" data-reel="4">
                <div className="reel-window">
                  <span className="symbol">₿</span>
                </div>
              </div>
            </div>
            <div className="payline" aria-hidden="true" />
          </div>

          <p className="result" id="resultMsg" aria-live="polite">
            Match 3+ currency symbols to earn bills.
          </p>

          <div className="controls">
            <label className="bet">
              <span>Spin Cost</span>
              <select id="betSelect" defaultValue="2">
                <option value="1">$1</option>
                <option value="2">$2</option>
                <option value="5">$5</option>
                <option value="10">$10</option>
              </select>
            </label>
            <button className="spin-btn" id="spinBtn" type="button">
              SPIN
            </button>
            <button className="ghost-btn" id="autoBtn" type="button">
              AUTO
            </button>
          </div>
        </section>

        <aside className="panels">
          <section className="panel wallet-panel">
            <div className="panel-head">
              <h2>🏦 Wallet</h2>
              <button className="text-btn" id="cashOutBtn" type="button">
                USD → Markkade
              </button>
            </div>
            <ul className="wallet-list" id="walletList" />
          </section>

          <section className="panel exchange-panel">
            <div className="panel-head">
              <h2>💱 Global Exchange</h2>
              <div className="timer" id="marketTimer" aria-live="polite">
                <span className="timer-icon">⏱️</span>
                <strong id="timerValue">05:00</strong>
              </div>
            </div>
            <p className="exchange-meta" id="exchangeMeta">
              12 Available · 8 Locked
            </p>
            <div className="routes" id="routes" />
            <div className="trade-box" id="tradeBox" hidden>
              <div className="panel-head">
                <p className="trade-title" id="tradeTitle">
                  Trade
                </p>
                <button className="text-btn" id="cancelTradeBtn" type="button">
                  Close
                </button>
              </div>
              <div className="trade-row">
                <input id="tradeAmount" type="number" min={0} step="any" placeholder="Amount" />
                <button className="spin-btn compact" id="confirmTradeBtn" type="button">
                  Exchange
                </button>
              </div>
              <p className="trade-hint" id="tradeHint" />
            </div>
          </section>
        </aside>
      </main>

      <div className="toast" id="toast" hidden />

      <dialog className="modal" id="cashOutModal">
        <form method="dialog" className="modal-card">
          <h3>💵 USD → Markkade</h3>
          <p>
            Convert USD into Markkade at <strong>1 USD = 1 MKD</strong>.
          </p>
          <label>
            Amount (USD)
            <input id="cashOutAmount" type="number" min={1} step="0.01" />
          </label>
          <div className="modal-actions">
            <button value="cancel" className="ghost-btn" type="submit">
              Cancel
            </button>
            <button id="confirmCashOut" className="spin-btn compact" value="default" type="submit">
              Convert
            </button>
          </div>
        </form>
      </dialog>

      <div className="founder-block" id="founderBlock" hidden>
        <div className="founder-block-card">
          <h2>Founder watch mode only</h2>
          <p>The founder account cannot play games. Open Live Ops to watch scores and charts.</p>
          <Link className="spin-btn compact" href="/founder">
            Open Founder Live Ops
          </Link>
          <button className="ghost-btn" id="founderLogoutBtn" type="button">
            Log out founder
          </button>
        </div>
      </div>

      <div className="founder-block" id="accessBlock" hidden>
        <div className="founder-block-card" id="accessCard">
          <h2 id="accessTitle">Request access</h2>
          <p id="accessCopy">
            The founder must approve you. Approved players receive <strong>$10,000</strong> from the
            house bank.
          </p>
          <form id="registerForm" className="access-form">
            <label>
              Player name
              <input
                id="playerNameInput"
                name="playerName"
                maxLength={24}
                placeholder="Your display name"
                autoComplete="nickname"
              />
            </label>
            <button className="spin-btn compact" type="submit">
              Request Approval
            </button>
          </form>
          <div id="pendingWait" hidden>
            <p className="pending-pulse">⏳ Waiting for founder approval…</p>
            <p className="trade-hint" id="pendingName" />
          </div>
          <Link className="text-btn" href="/">
            ← Back to Markkade
          </Link>
        </div>
      </div>
    </>
  );
}
