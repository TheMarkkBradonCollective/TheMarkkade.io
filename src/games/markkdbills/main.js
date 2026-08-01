import { MarkkadeEconomy } from "../../economy.js";
import "../../styles/markkdbills.css";

  const STORAGE_KEY = "markkdbills_v1";
  const MARKET_DURATION_MS = 5 * 60 * 1000; // 05:00 as documented
  const OPEN_ROUTE_COUNT = 12;
  const REEL_COUNT = 5;
  const APPROVAL_GRANT_USD = MarkkadeEconomy.PLAYER_APPROVAL_GRANT_USD || 10_000;

  /** @typedef {{ code: string, symbol: string, name: string, usdRate: number, weight: number, decimals: number }} Currency */

  /** @type {Currency[]} */
  const CURRENCIES = [
    { code: "USD", symbol: "$", name: "US Dollar", usdRate: 1, weight: 18, decimals: 2 },
    { code: "EUR", symbol: "€", name: "Euro", usdRate: 1.15, weight: 14, decimals: 2 },
    { code: "GBP", symbol: "£", name: "British Pound", usdRate: 1.35, weight: 12, decimals: 2 },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", usdRate: 0.006, weight: 12, decimals: 0 },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan", usdRate: 0.14, weight: 10, decimals: 2 },
    { code: "CHF", symbol: "₣", name: "Swiss Franc", usdRate: 1.2, weight: 8, decimals: 2 },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar", usdRate: 0.73, weight: 8, decimals: 2 },
    { code: "AUD", symbol: "A$", name: "Australian Dollar", usdRate: 0.67, weight: 8, decimals: 2 },
    { code: "INR", symbol: "₹", name: "Indian Rupee", usdRate: 0.012, weight: 7, decimals: 2 },
    { code: "KRW", symbol: "₩", name: "South Korean Won", usdRate: 0.0007, weight: 6, decimals: 0 },
    { code: "RUB", symbol: "₽", name: "Russian Ruble", usdRate: 0.011, weight: 5, decimals: 2 },
    { code: "BRL", symbol: "R$", name: "Brazilian Real", usdRate: 0.18, weight: 6, decimals: 2 },
    { code: "TRY", symbol: "₺", name: "Turkish Lira", usdRate: 0.025, weight: 5, decimals: 2 },
    { code: "PHP", symbol: "₱", name: "Philippine Peso", usdRate: 0.017, weight: 5, decimals: 2 },
    { code: "VND", symbol: "₫", name: "Vietnamese Dong", usdRate: 0.00004, weight: 4, decimals: 0 },
    { code: "BTC", symbol: "₿", name: "Bitcoin", usdRate: 65000, weight: 1, decimals: 6 },
    { code: "ETH", symbol: "Ξ", name: "Ethereum", usdRate: 3500, weight: 2, decimals: 5 },
  ];

  const byCode = Object.fromEntries(CURRENCIES.map((c) => [c.code, c]));
  const totalWeight = CURRENCIES.reduce((sum, c) => sum + c.weight, 0);

  const els = {
    reels: Array.from(document.querySelectorAll(".reel")),
    resultMsg: document.getElementById("resultMsg"),
    spinBtn: document.getElementById("spinBtn"),
    autoBtn: document.getElementById("autoBtn"),
    betSelect: document.getElementById("betSelect"),
    usdBalance: document.getElementById("usdBalance"),
    markkadeBalance: document.getElementById("markkadeBalance"),
    walletList: document.getElementById("walletList"),
    routes: document.getElementById("routes"),
    exchangeMeta: document.getElementById("exchangeMeta"),
    timerValue: document.getElementById("timerValue"),
    tradeBox: document.getElementById("tradeBox"),
    tradeTitle: document.getElementById("tradeTitle"),
    tradeAmount: document.getElementById("tradeAmount"),
    tradeHint: document.getElementById("tradeHint"),
    confirmTradeBtn: document.getElementById("confirmTradeBtn"),
    cancelTradeBtn: document.getElementById("cancelTradeBtn"),
    cashOutBtn: document.getElementById("cashOutBtn"),
    cashOutModal: document.getElementById("cashOutModal"),
    cashOutAmount: document.getElementById("cashOutAmount"),
    confirmCashOut: document.getElementById("confirmCashOut"),
    toast: document.getElementById("toast"),
  };

  /** @type {{ wallet: Record<string, number>, markkade: number, market: { open: string[], endsAt: number, flashUntil: number }, selectedRoute: string | null }} */
  let state = loadState();
  let spinning = false;
  let autoSpin = false;
  let selectedRoute = null;
  let toastTimer = null;
  let playerSession = null;
  let accessUnsub = null;
  let gameReady = false;

  function economyUsdValue(code, amount) {
    const c = byCode[code];
    if (!c) return 0;
    return (Number(amount) || 0) * c.usdRate;
  }

  function guardFounder() {
    if (MarkkadeEconomy.isFounder()) {
      const block = document.getElementById("founderBlock");
      if (block) block.hidden = false;
      const logoutBtn = document.getElementById("founderLogoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          MarkkadeEconomy.logout();
          location.href = "/founder/";
        });
      }
      return true;
    }
    return false;
  }

  function showAccess(mode, player) {
    const block = document.getElementById("accessBlock");
    const form = document.getElementById("registerForm");
    const pending = document.getElementById("pendingWait");
    const title = document.getElementById("accessTitle");
    const copy = document.getElementById("accessCopy");
    const pendingName = document.getElementById("pendingName");
    block.hidden = false;
    if (mode === "register") {
      title.textContent = "Request access";
      copy.innerHTML =
        "The founder must approve you. Approved players receive <strong>$10,000</strong> from the house bank.";
      form.hidden = false;
      pending.hidden = true;
    } else if (mode === "rejected") {
      title.textContent = "Access rejected";
      copy.textContent = "The founder rejected this player request.";
      form.hidden = true;
      pending.hidden = true;
    } else {
      title.textContent = "Awaiting approval";
      copy.innerHTML =
        "Hang tight — once the founder approves you, <strong>$10,000</strong> is paid from the house bank and you can play.";
      form.hidden = true;
      pending.hidden = false;
      pendingName.textContent = player?.name ? `Signed in as ${player.name}` : "";
    }
  }

  function hideAccess() {
    const block = document.getElementById("accessBlock");
    if (block) block.hidden = true;
  }

  function applyApprovalGrant(player) {
    if (!player || state.approvalFunded) return false;
    const grant = Number(player.startingUsd) || APPROVAL_GRANT_USD;
    // First approval credit is exactly the founder grant.
    state.wallet.USD = grant;
    state.approvalFunded = true;
    saveState();
    renderBalances();
    renderWallet();
    showToast(`✅ Approved!\n$${grant.toLocaleString()} added to your wallet`);
    return true;
  }

  function watchApproval(session) {
    if (accessUnsub) accessUnsub();
    accessUnsub = MarkkadeEconomy.subscribe(() => {
      const player = MarkkadeEconomy.getPlayer(session.playerId);
      if (!player) return;
      if (player.status === "approved" && player.starterFunded) {
        hideAccess();
        playerSession = session;
        applyApprovalGrant(player);
        if (!gameReady) startGame();
      } else if (player.status === "rejected") {
        showAccess("rejected", player);
      } else {
        showAccess("pending", player);
      }
    });
  }

  function ensurePlayerSession() {
    const result = MarkkadeEconomy.requirePlayerForGames();
    if (result.founder && result.redirect) {
      location.href = result.redirect;
      return null;
    }
    if (result.needsRegistration) {
      showAccess("register");
      return null;
    }
    if (result.pendingApproval || result.rejected) {
      playerSession = result.session;
      showAccess(result.rejected ? "rejected" : "pending", result.player);
      watchApproval(result.session);
      return null;
    }
    if (!result.ok) {
      showAccess("register");
      return null;
    }
    playerSession = result.session;
    hideAccess();
    applyApprovalGrant(result.player);
    return playerSession;
  }

  function defaultWallet() {
    const wallet = Object.fromEntries(CURRENCIES.map((c) => [c.code, 0]));
    wallet.USD = 0;
    return wallet;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createFreshState();
      const parsed = JSON.parse(raw);
      const wallet = defaultWallet();
      for (const code of Object.keys(wallet)) {
        if (typeof parsed.wallet?.[code] === "number") wallet[code] = parsed.wallet[code];
      }
      return {
        wallet,
        markkade: Number(parsed.markkade) || 0,
        approvalFunded: Boolean(parsed.approvalFunded),
        market: {
          open: Array.isArray(parsed.market?.open) ? parsed.market.open : [],
          endsAt: Number(parsed.market?.endsAt) || 0,
          flashUntil: Number(parsed.market?.flashUntil) || 0,
        },
      };
    } catch {
      return createFreshState();
    }
  }

  function createFreshState() {
    return {
      wallet: defaultWallet(),
      markkade: 0,
      approvalFunded: false,
      market: {
        open: [],
        endsAt: 0,
        flashUntil: 0,
      },
    };
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        wallet: state.wallet,
        markkade: state.markkade,
        approvalFunded: Boolean(state.approvalFunded),
        market: state.market,
      })
    );
  }

  function pickSymbol() {
    let roll = Math.random() * totalWeight;
    for (const c of CURRENCIES) {
      roll -= c.weight;
      if (roll <= 0) return c.code;
    }
    return "USD";
  }

  function formatAmount(code, amount) {
    const c = byCode[code];
    if (!c) return String(amount);
    const n = Number(amount) || 0;
    if (c.decimals === 0) return `${c.symbol}${Math.round(n).toLocaleString()}`;
    if (code === "BTC" || code === "ETH") return `${n.toFixed(c.decimals)} ${c.symbol}`;
    return `${c.symbol}${n.toFixed(c.decimals)}`;
  }

  function rewardForMatch(code, count) {
    const c = byCode[code];
    if (!c) return 0;
    const tiers = { 3: 1, 4: 3, 5: 10 };
    let units = tiers[count] || 0;
    if (code === "BTC") units = { 3: 0.0001, 4: 0.0004, 5: 0.0015 }[count] || 0;
    if (code === "ETH") units = { 3: 0.002, 4: 0.008, 5: 0.03 }[count] || 0;
    if (code === "JPY" || code === "KRW" || code === "VND") {
      units = { 3: 100, 4: 400, 5: 1500 }[count] || 0;
      if (code === "VND") units *= 100;
    }
    return units;
  }

  function analyzePayline(codes) {
    const counts = {};
    for (const code of codes) counts[code] = (counts[code] || 0) + 1;
    let best = null;
    for (const [code, count] of Object.entries(counts)) {
      if (count < 3) continue;
      if (!best || count > best.count) best = { code, count };
    }
    return best;
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function showToast(message) {
    els.toast.hidden = false;
    els.toast.textContent = message;
    requestAnimationFrame(() => els.toast.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove("show");
      setTimeout(() => {
        els.toast.hidden = true;
      }, 280);
    }, 3200);
  }

  function setResult(text, kind) {
    els.resultMsg.textContent = text;
    els.resultMsg.classList.remove("win", "lose");
    if (kind) els.resultMsg.classList.add(kind);
  }

  function renderBalances() {
    els.usdBalance.textContent = formatAmount("USD", state.wallet.USD);
    els.markkadeBalance.textContent = Number(state.markkade).toFixed(2);
  }

  function renderWallet() {
    const held = CURRENCIES.filter((c) => c.code === "USD" || (state.wallet[c.code] || 0) > 0);
    held.sort((a, b) => {
      const av = (state.wallet[a.code] || 0) * a.usdRate;
      const bv = (state.wallet[b.code] || 0) * b.usdRate;
      return bv - av;
    });

    els.walletList.innerHTML = held
      .map((c) => {
        const amt = state.wallet[c.code] || 0;
        return `<li class="${amt > 0 ? "has-balance" : ""}">
          <span class="wallet-sym">${c.symbol}</span>
          <span class="wallet-name">${c.name}<span class="wallet-code">${c.code}</span></span>
          <span class="wallet-amt">${formatAmount(c.code, amt)}</span>
        </li>`;
      })
      .join("");
  }

  function allPossibleRoutes() {
    const routes = [];
    for (const from of CURRENCIES) {
      for (const to of CURRENCIES) {
        if (from.code === to.code) continue;
        routes.push(`${from.code}->${to.code}`);
      }
    }
    return routes;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function refreshMarket({ announce = true, flash = false } = {}) {
    const pool = shuffle(allPossibleRoutes());
    // Bias useful routes: anything involving USD/EUR/GBP more often
    const preferred = pool.filter((r) => /USD|EUR|GBP/.test(r));
    const rest = pool.filter((r) => !preferred.includes(r));
    const open = shuffle([...preferred.slice(0, 8), ...rest]).slice(0, OPEN_ROUTE_COUNT);

    state.market.open = open;
    state.market.endsAt = Date.now() + MARKET_DURATION_MS;
    let didFlash = false;
    if (flash || Math.random() < 0.08) {
      state.market.flashUntil = Date.now() + 60_000;
      state.market.open = allPossibleRoutes();
      didFlash = true;
    } else {
      state.market.flashUntil = 0;
    }

    selectedRoute = null;
    els.tradeBox.hidden = true;
    saveState();
    renderExchange();
    if (didFlash) {
      showToast("⚡ FLASH MARKET\nAll exchanges unlocked for 60 seconds");
    } else if (announce) {
      showToast("🌎 GLOBAL MARKET UPDATED\nNew exchanges are available!\nCheck your wallet.");
    }
  }

  function isFlashActive() {
    return Date.now() < (state.market.flashUntil || 0);
  }

  function isRouteOpen(routeKey) {
    if (isFlashActive()) return true;
    return state.market.open.includes(routeKey);
  }

  function convertAmount(fromCode, toCode, amount) {
    const from = byCode[fromCode];
    const to = byCode[toCode];
    if (!from || !to || amount <= 0) return 0;
    const usdValue = amount * from.usdRate;
    return usdValue / to.usdRate;
  }

  function renderExchange() {
    const all = allPossibleRoutes();
    const openSet = new Set(isFlashActive() ? all : state.market.open);

    // Show open routes first, then a sample of locked (matches design UI counts)
    const openRoutes = (isFlashActive() ? shuffle(all).slice(0, 16) : state.market.open).slice(0, OPEN_ROUTE_COUNT);
    const lockedSample = shuffle(all.filter((r) => !openSet.has(r))).slice(0, 8);
    const display = [
      ...openRoutes.map((r) => ({ key: r, open: true })),
      ...lockedSample.map((r) => ({ key: r, open: false })),
    ];

    els.exchangeMeta.textContent = isFlashActive()
      ? `⚡ FLASH · All exchanges unlocked`
      : `${openRoutes.length} Available · ${lockedSample.length} Locked`;

    els.routes.innerHTML = display
      .map(({ key, open }) => {
        const [from, to] = key.split("->");
        const fc = byCode[from];
        const tc = byCode[to];
        const rate = convertAmount(from, to, 1);
        return `<button class="route ${open ? "open" : "locked"}" data-route="${key}" ${open ? "" : "disabled"}>
          <span>
            <span class="route-pair">${fc.symbol} ${from} → ${tc.symbol} ${to}</span>
            <span class="route-rate">1 ${from} ≈ ${rate < 0.01 ? rate.toPrecision(2) : rate.toFixed(4)} ${to}</span>
          </span>
          <span class="route-state">${open ? "OPEN" : "LOCKED"}</span>
        </button>`;
      })
      .join("");

    els.routes.querySelectorAll(".route.open").forEach((btn) => {
      btn.addEventListener("click", () => selectRoute(btn.dataset.route));
    });
  }

  function selectRoute(routeKey) {
    if (!isRouteOpen(routeKey)) return;
    selectedRoute = routeKey;
    const [from, to] = routeKey.split("->");
    const available = state.wallet[from] || 0;
    els.tradeBox.hidden = false;
    els.tradeTitle.textContent = `Trade ${from} → ${to}`;
    els.tradeAmount.value = available > 0 ? String(Number(available.toFixed(byCode[from].decimals))) : "";
    els.tradeHint.textContent = `Available: ${formatAmount(from, available)} · You choose when to trade.`;
    els.tradeAmount.focus();
  }

  function executeTrade() {
    if (!selectedRoute || !isRouteOpen(selectedRoute)) {
      showToast("That exchange is locked. Wait for the next market update.");
      return;
    }
    const [from, to] = selectedRoute.split("->");
    const amount = Number(els.tradeAmount.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("Enter a valid trade amount.");
      return;
    }
    if ((state.wallet[from] || 0) < amount) {
      showToast(`Not enough ${from} in your wallet.`);
      return;
    }

    const received = convertAmount(from, to, amount);
    state.wallet[from] -= amount;
    state.wallet[to] = (state.wallet[to] || 0) + received;
    // Tiny market jitter after trade
    const jitter = 1 + (Math.random() * 0.04 - 0.02);
    byCode[from].usdRate *= jitter;

    saveState();
    renderBalances();
    renderWallet();
    selectRoute(selectedRoute);
    showToast(`Exchanged ${formatAmount(from, amount)}\n→ ${formatAmount(to, received)}`);
  }

  function updateTimer() {
    const now = Date.now();
    if (!state.market.endsAt || state.market.open.length === 0) {
      refreshMarket({ announce: false });
    }

    if (state.market.flashUntil && now >= state.market.flashUntil && isFlashActive() === false) {
      // flash ended; keep remaining market until normal timer
      state.market.flashUntil = 0;
      if (state.market.open.length > OPEN_ROUTE_COUNT) {
        state.market.open = shuffle(state.market.open).slice(0, OPEN_ROUTE_COUNT);
      }
      saveState();
      renderExchange();
      showToast("Flash market ended.\nRoutes locked again.");
    }

    if (now >= state.market.endsAt) {
      refreshMarket({ announce: true });
    }

    const remaining = Math.max(0, state.market.endsAt - Date.now());
    const totalSec = Math.ceil(remaining / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    els.timerValue.textContent = `${mm}:${ss}`;
  }

  function setReelSymbol(reelEl, code) {
    const c = byCode[code];
    const span = reelEl.querySelector(".symbol");
    span.textContent = c.symbol;
    span.title = c.code;
    reelEl.dataset.code = code;
  }

  async function spinReels() {
    if (spinning) return;
    const bet = Number(els.betSelect.value) || 2;
    if ((state.wallet.USD || 0) < bet) {
      setResult("Not enough USD to spin. Trade currencies or lower the bet.", "lose");
      autoSpin = false;
      els.autoBtn.classList.remove("active");
      return;
    }

    spinning = true;
    els.spinBtn.disabled = true;
    els.reels.forEach((r) => r.classList.remove("win"));
    setResult("Spinning...", null);

    state.wallet.USD -= bet;
    // Player loss / wager is added to the founder house bank
    if (playerSession?.playerId) {
      MarkkadeEconomy.recordWager({
        playerId: playerSession.playerId,
        game: "markkdbills",
        amountUsd: bet,
        meta: { bet },
      });
    }
    renderBalances();
    renderWallet();
    saveState();

    els.reels.forEach((r) => r.classList.add("spinning"));

    const results = [];
    for (let i = 0; i < REEL_COUNT; i++) {
      await sleep(180 + i * 140);
      const code = pickSymbol();
      results.push(code);
      const reel = els.reels[i];
      reel.classList.remove("spinning");
      setReelSymbol(reel, code);
    }

    const match = analyzePayline(results);
    if (match) {
      const payout = rewardForMatch(match.code, match.count);
      const payoutUsd = economyUsdValue(match.code, payout);
      // Winnings are paid FROM the founder house bank
      if (playerSession?.playerId) {
        MarkkadeEconomy.recordPayout({
          playerId: playerSession.playerId,
          game: "markkdbills",
          amountUsd: payoutUsd,
          meta: { code: match.code, units: payout, match: match.count },
        });
      }
      state.wallet[match.code] = (state.wallet[match.code] || 0) + payout;
      els.reels.forEach((reel) => {
        if (reel.dataset.code === match.code) reel.classList.add("win");
      });
      setResult(
        `${match.count}× ${byCode[match.code].symbol} ${match.code} → +${formatAmount(match.code, payout)}`,
        "win"
      );
      showToast(`💰 +${formatAmount(match.code, payout)}\nPaid from house bank`);
    } else {
      setResult("No match — try another spin.", "lose");
    }

    saveState();
    renderBalances();
    renderWallet();
    spinning = false;
    els.spinBtn.disabled = false;

    if (autoSpin) {
      await sleep(650);
      if (autoSpin) spinReels();
    }
  }

  function openCashOut() {
    const usd = state.wallet.USD || 0;
    if (usd <= 0) {
      showToast("No USD to convert. Trade into USD first.");
      return;
    }
    els.cashOutAmount.value = String(Number(usd.toFixed(2)));
    els.cashOutModal.showModal();
  }

  function confirmCashOut(event) {
    if (event.submitter?.id !== "confirmCashOut") return;
    event.preventDefault();
    const amount = Number(els.cashOutAmount.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("Enter a valid USD amount.");
      return;
    }
    if ((state.wallet.USD || 0) < amount) {
      showToast("Not enough USD.");
      return;
    }
    state.wallet.USD -= amount;
    state.markkade += amount; // 1 USD = 1 MKD
    if (playerSession?.playerId) {
      MarkkadeEconomy.recordCashOut({
        playerId: playerSession.playerId,
        amountUsd: amount,
      });
    }
    saveState();
    renderBalances();
    renderWallet();
    els.cashOutModal.close();
    showToast(`$${amount.toFixed(2)} USD\nConverted into\n${amount.toFixed(2)} Markkade`);
  }

  function bindEvents() {
    els.spinBtn.addEventListener("click", () => spinReels());
    els.autoBtn.addEventListener("click", () => {
      autoSpin = !autoSpin;
      els.autoBtn.classList.toggle("active", autoSpin);
      if (autoSpin && !spinning) spinReels();
    });
    els.confirmTradeBtn.addEventListener("click", executeTrade);
    els.cancelTradeBtn.addEventListener("click", () => {
      selectedRoute = null;
      els.tradeBox.hidden = true;
    });
    els.cashOutBtn.addEventListener("click", openCashOut);
    els.cashOutModal.addEventListener("submit", confirmCashOut);
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "SELECT") {
        e.preventDefault();
        spinReels();
      }
    });
  }

  function initReels() {
    const starter = ["USD", "EUR", "GBP", "JPY", "BTC"];
    els.reels.forEach((reel, i) => setReelSymbol(reel, starter[i]));
  }

  function startGame() {
    if (gameReady) return;
    gameReady = true;
    bindEvents();
    initReels();
    renderBalances();
    renderWallet();
    if (!state.market.endsAt || state.market.open.length === 0 || Date.now() >= state.market.endsAt) {
      refreshMarket({ announce: false });
    } else {
      renderExchange();
    }
    updateTimer();
    setInterval(updateTimer, 250);
  }

  function bindAccessForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("playerNameInput").value.trim();
      if (!name) {
        showToast("Enter a player name to request approval.");
        return;
      }
      const result = MarkkadeEconomy.loginPlayer(name);
      if (!result.ok) {
        showToast(result.error || "Could not register.");
        return;
      }
      playerSession = result.session;
      // Reset local wallet until founder approves this player.
      state = createFreshState();
      saveState();
      renderBalances();
      renderWallet();
      showAccess("pending", MarkkadeEconomy.getPlayer(result.session.playerId));
      watchApproval(result.session);
    });
  }

  function init() {
    if (guardFounder()) return;
    bindAccessForm();
    const session = ensurePlayerSession();
    if (!session) return;
    startGame();
  }

  init();

