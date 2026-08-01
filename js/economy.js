/**
 * Markkade shared economy — founder house bank + live activity ledger.
 * Player winnings are paid FROM the house bank. Player losses are added TO it.
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "markkade_economy_v1";
  const SESSION_KEY = "markkade_session_v1";
  const CHANNEL_NAME = "markkade_economy";
  /** Founder house bank starting balance: $100,000,000,000 */
  const FOUNDER_STARTING_BANK = 100_000_000_000;
  const MAX_EVENTS = 400;
  const MAX_BANK_HISTORY = 240;
  const PLAYER_STARTING_USD = 500;

  // Demo founder credentials (client-side gate for the watch dashboard).
  // Username is case-insensitive. Change before any public launch.
  const FOUNDER_USER = "founder";
  const FOUNDER_PASS = "markkade-founder";

  function now() {
    return Date.now();
  }

  function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${now().toString(36)}`;
  }

  function defaultEconomy() {
    const t = now();
    return {
      version: 1,
      houseBankUsd: FOUNDER_STARTING_BANK,
      totalWageredUsd: 0,
      totalPaidOutUsd: 0,
      totalPlayerLossesUsd: 0,
      players: {},
      events: [
        {
          id: uid("evt"),
          type: "system",
          at: t,
          message: "Founder house bank initialized",
          amountUsd: FOUNDER_STARTING_BANK,
          playerId: null,
          game: null,
          meta: { houseBankUsd: FOUNDER_STARTING_BANK },
        },
      ],
      bankHistory: [{ t, v: FOUNDER_STARTING_BANK }],
      scores: {},
    };
  }

  function loadEconomy() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = defaultEconomy();
        saveEconomy(fresh, false);
        return fresh;
      }
      const parsed = JSON.parse(raw);
      if (typeof parsed.houseBankUsd !== "number") parsed.houseBankUsd = FOUNDER_STARTING_BANK;
      parsed.players = parsed.players || {};
      parsed.events = Array.isArray(parsed.events) ? parsed.events : [];
      parsed.bankHistory = Array.isArray(parsed.bankHistory) ? parsed.bankHistory : [];
      parsed.scores = parsed.scores || {};
      parsed.totalWageredUsd = Number(parsed.totalWageredUsd) || 0;
      parsed.totalPaidOutUsd = Number(parsed.totalPaidOutUsd) || 0;
      parsed.totalPlayerLossesUsd = Number(parsed.totalPlayerLossesUsd) || 0;
      return parsed;
    } catch {
      return defaultEconomy();
    }
  }

  function saveEconomy(economy, broadcast = true) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(economy));
    if (broadcast) {
      try {
        const ch = new BroadcastChannel(CHANNEL_NAME);
        ch.postMessage({ type: "economy_updated", at: now() });
        ch.close();
      } catch {
        /* BroadcastChannel unsupported */
      }
      try {
        localStorage.setItem("markkade_economy_ping", String(now()));
      } catch {
        /* ignore */
      }
    }
  }

  function pushHistory(economy) {
    economy.bankHistory.push({ t: now(), v: economy.houseBankUsd });
    if (economy.bankHistory.length > MAX_BANK_HISTORY) {
      economy.bankHistory = economy.bankHistory.slice(-MAX_BANK_HISTORY);
    }
  }

  function pushEvent(economy, event) {
    economy.events.unshift(event);
    if (economy.events.length > MAX_EVENTS) {
      economy.events = economy.events.slice(0, MAX_EVENTS);
    }
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setSession(session) {
    if (!session) sessionStorage.removeItem(SESSION_KEY);
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function ensurePlayer(playerId, displayName) {
    const economy = loadEconomy();
    if (!economy.players[playerId]) {
      const starter = Math.min(PLAYER_STARTING_USD, economy.houseBankUsd);
      economy.houseBankUsd -= starter;
      economy.totalPaidOutUsd += starter;

      economy.players[playerId] = {
        id: playerId,
        name: displayName || `Player-${playerId.slice(-4)}`,
        createdAt: now(),
        lastSeenAt: now(),
        startingUsd: starter,
        starterFunded: true,
        wageredUsd: 0,
        wonUsd: starter,
        lostUsd: 0,
        netUsd: starter,
        spins: 0,
        games: { markkdbills: { spins: 0, wins: 0, score: 0 } },
      };
      economy.scores[playerId] = {
        playerId,
        name: economy.players[playerId].name,
        score: 0,
        spins: 0,
        wins: 0,
        updatedAt: now(),
      };
      pushHistory(economy);
      pushEvent(economy, {
        id: uid("evt"),
        type: "player_join",
        at: now(),
        message: `${economy.players[playerId].name} joined — starter $${starter.toFixed(2)} paid from house bank`,
        amountUsd: starter,
        playerId,
        game: null,
        meta: { houseBankUsd: economy.houseBankUsd },
      });
      saveEconomy(economy);
    } else {
      economy.players[playerId].lastSeenAt = now();
      if (displayName) {
        economy.players[playerId].name = displayName;
        if (economy.scores[playerId]) economy.scores[playerId].name = displayName;
      }
      saveEconomy(economy, false);
    }
    return economy.players[playerId];
  }

  function getOrCreateLocalPlayerId() {
    const key = "markkade_player_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = uid("ply");
      localStorage.setItem(key, id);
    }
    return id;
  }

  /**
   * Record a wager (player loss to house / bet placed).
   * Adds `amountUsd` to the founder house bank.
   */
  function recordWager({ playerId, game, amountUsd, meta = {} }) {
    const amount = Math.max(0, Number(amountUsd) || 0);
    const economy = loadEconomy();
    const player = economy.players[playerId] || ensurePlayer(playerId);
    // ensurePlayer may have saved; reload
    const eco = loadEconomy();
    const p = eco.players[playerId] || player;

    eco.houseBankUsd += amount;
    eco.totalWageredUsd += amount;
    eco.totalPlayerLossesUsd += amount;
    p.wageredUsd += amount;
    p.lostUsd += amount;
    p.netUsd -= amount;
    p.lastSeenAt = now();
    if (game) {
      p.games[game] = p.games[game] || { spins: 0, wins: 0, score: 0 };
      p.games[game].spins += 1;
      p.spins += 1;
    }

    if (eco.scores[playerId]) {
      eco.scores[playerId].spins = p.spins;
      eco.scores[playerId].updatedAt = now();
    }

    pushHistory(eco);
    pushEvent(eco, {
      id: uid("evt"),
      type: "wager",
      at: now(),
      message: `${p.name} wagered $${amount.toFixed(2)} on ${game || "game"}`,
      amountUsd: amount,
      playerId,
      game: game || null,
      meta: { ...meta, houseBankUsd: eco.houseBankUsd },
    });
    saveEconomy(eco);
    return eco;
  }

  /**
   * Pay a win FROM the house bank to the player (USD-equivalent).
   * Returns false if house cannot cover (still pays what it can / clamps).
   */
  function recordPayout({ playerId, game, amountUsd, meta = {} }) {
    let amount = Math.max(0, Number(amountUsd) || 0);
    const eco = loadEconomy();
    const p = eco.players[playerId] || ensurePlayer(playerId);
    const economy = loadEconomy();
    const player = economy.players[playerId] || p;

    if (amount > economy.houseBankUsd) {
      amount = Math.max(0, economy.houseBankUsd);
    }

    economy.houseBankUsd -= amount;
    economy.totalPaidOutUsd += amount;
    player.wonUsd += amount;
    player.netUsd += amount;
    player.lastSeenAt = now();
    if (game) {
      player.games[game] = player.games[game] || { spins: 0, wins: 0, score: 0 };
      player.games[game].wins += 1;
      // Score: cumulative USD-equivalent won in this game
      player.games[game].score = Number((player.games[game].score + amount).toFixed(2));
    }

    if (economy.scores[playerId]) {
      economy.scores[playerId].wins = Object.values(player.games).reduce((s, g) => s + (g.wins || 0), 0);
      economy.scores[playerId].score = Object.values(player.games).reduce((s, g) => s + (g.score || 0), 0);
      economy.scores[playerId].updatedAt = now();
    }

    pushHistory(economy);
    pushEvent(economy, {
      id: uid("evt"),
      type: "payout",
      at: now(),
      message: `${player.name} won $${amount.toFixed(2)} from ${game || "game"}`,
      amountUsd: amount,
      playerId,
      game: game || null,
      meta: { ...meta, houseBankUsd: economy.houseBankUsd },
    });
    saveEconomy(economy);
    return { economy, paidUsd: amount };
  }

  function recordCashOut({ playerId, amountUsd, meta = {} }) {
    const amount = Math.max(0, Number(amountUsd) || 0);
    const economy = loadEconomy();
    const player = economy.players[playerId];
    if (!player) return economy;
    pushEvent(economy, {
      id: uid("evt"),
      type: "cashout",
      at: now(),
      message: `${player.name} converted $${amount.toFixed(2)} USD → Markkade`,
      amountUsd: amount,
      playerId,
      game: "markkdbills",
      meta: { ...meta, houseBankUsd: economy.houseBankUsd },
    });
    player.lastSeenAt = now();
    saveEconomy(economy);
    return economy;
  }

  function loginFounder(username, password) {
    const u = String(username || "").trim().toLowerCase();
    const p = String(password || "");
    if (u === FOUNDER_USER && p === FOUNDER_PASS) {
      const session = {
        role: "founder",
        user: FOUNDER_USER,
        name: "Founder",
        at: now(),
      };
      setSession(session);
      const economy = loadEconomy();
      pushEvent(economy, {
        id: uid("evt"),
        type: "founder_login",
        at: now(),
        message: "Founder logged in to live ops dashboard",
        amountUsd: 0,
        playerId: null,
        game: null,
        meta: {},
      });
      saveEconomy(economy);
      return { ok: true, session };
    }
    return { ok: false, error: "Invalid founder credentials" };
  }

  function loginPlayer(displayName) {
    const session = getSession();
    if (session?.role === "founder") {
      return { ok: false, error: "Founder accounts cannot play games. Log out first." };
    }
    const playerId = getOrCreateLocalPlayerId();
    const name = String(displayName || "").trim() || `Player-${playerId.slice(-4)}`;
    ensurePlayer(playerId, name);
    const playerSession = {
      role: "player",
      user: playerId,
      name,
      playerId,
      at: now(),
    };
    setSession(playerSession);
    return { ok: true, session: playerSession };
  }

  function logout() {
    setSession(null);
  }

  function isFounder() {
    return getSession()?.role === "founder";
  }

  function requirePlayerForGames() {
    if (isFounder()) {
      return {
        ok: false,
        error: "Founder cannot play games. Live watch only.",
        redirect: "../../founder/",
      };
    }
    const session = getSession();
    if (!session || session.role !== "player") {
      const playerId = getOrCreateLocalPlayerId();
      return loginPlayer(`Player-${playerId.slice(-4)}`);
    }
    ensurePlayer(session.playerId, session.name);
    return { ok: true, session };
  }

  function getSnapshot() {
    const economy = loadEconomy();
    const scores = Object.values(economy.scores || {}).sort((a, b) => b.score - a.score);
    const recent = (economy.events || []).slice(0, 50);
    const activeCutoff = now() - 5 * 60 * 1000;
    const activePlayers = Object.values(economy.players || {}).filter((p) => p.lastSeenAt >= activeCutoff);
    return {
      houseBankUsd: economy.houseBankUsd,
      startingBankUsd: FOUNDER_STARTING_BANK,
      totalWageredUsd: economy.totalWageredUsd,
      totalPaidOutUsd: economy.totalPaidOutUsd,
      totalPlayerLossesUsd: economy.totalPlayerLossesUsd,
      netHouseEdgeUsd: economy.houseBankUsd - FOUNDER_STARTING_BANK,
      playerCount: Object.keys(economy.players || {}).length,
      activePlayers: activePlayers.length,
      scores,
      recent,
      bankHistory: economy.bankHistory || [],
      players: Object.values(economy.players || {}),
    };
  }

  function subscribe(callback) {
    const handler = () => callback(getSnapshot());
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY || e.key === "markkade_economy_ping") handler();
    });
    let channel;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = handler;
    } catch {
      channel = null;
    }
    const poll = setInterval(handler, 1500);
    handler();
    return () => {
      clearInterval(poll);
      if (channel) channel.close();
    };
  }

  function formatUsd(n) {
    const v = Number(n) || 0;
    return v.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: v >= 1000 ? 0 : 2,
    });
  }

  global.MarkkadeEconomy = {
    FOUNDER_STARTING_BANK,
    PLAYER_STARTING_USD,
    FOUNDER_USER,
    loadEconomy,
    getSnapshot,
    subscribe,
    ensurePlayer,
    getOrCreateLocalPlayerId,
    recordWager,
    recordPayout,
    recordCashOut,
    loginFounder,
    loginPlayer,
    logout,
    getSession,
    isFounder,
    requirePlayerForGames,
    formatUsd,
  };
})(window);
