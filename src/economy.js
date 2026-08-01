/**
 * Markkade shared economy — founder house bank + live activity ledger.
 * Player winnings are paid FROM the house bank. Player losses are added TO it.
 */


  const STORAGE_KEY = "markkade_economy_v1";
  const SESSION_KEY = "markkade_session_v1";
  const CHANNEL_NAME = "markkade_economy";
  /** Founder house bank starting balance: $100,000,000,000 */
  const FOUNDER_STARTING_BANK = 100_000_000_000;
  const MAX_EVENTS = 400;
  const MAX_BANK_HISTORY = 240;
  /** USD granted only after founder approval */
  const PLAYER_APPROVAL_GRANT_USD = 10_000;

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

  function normalizePlayer(player) {
    if (!player) return player;
    // Migrate legacy auto-funded players as already approved.
    if (!player.status) {
      player.status = player.starterFunded ? "approved" : "pending";
    }
    return player;
  }

  function getPlayer(playerId) {
    const economy = loadEconomy();
    return normalizePlayer(economy.players[playerId] || null);
  }

  function isPlayerApproved(playerId) {
    const player = getPlayer(playerId);
    return Boolean(player && player.status === "approved" && player.starterFunded);
  }

  /**
   * Register / touch a player. New players start PENDING — no funds until founder approves.
   */
  function ensurePlayer(playerId, displayName) {
    const economy = loadEconomy();
    if (!economy.players[playerId]) {
      economy.players[playerId] = {
        id: playerId,
        name: displayName || `Player-${playerId.slice(-4)}`,
        createdAt: now(),
        lastSeenAt: now(),
        status: "pending",
        startingUsd: 0,
        starterFunded: false,
        approvedAt: null,
        wageredUsd: 0,
        wonUsd: 0,
        lostUsd: 0,
        netUsd: 0,
        spins: 0,
        games: { markkdbills: { spins: 0, wins: 0, score: 0 } },
      };
      economy.scores[playerId] = {
        playerId,
        name: economy.players[playerId].name,
        score: 0,
        spins: 0,
        wins: 0,
        status: "pending",
        updatedAt: now(),
      };
      pushEvent(economy, {
        id: uid("evt"),
        type: "player_join",
        at: now(),
        message: `${economy.players[playerId].name} requested access — awaiting founder approval`,
        amountUsd: 0,
        playerId,
        game: null,
        meta: { status: "pending" },
      });
      saveEconomy(economy);
    } else {
      normalizePlayer(economy.players[playerId]);
      economy.players[playerId].lastSeenAt = now();
      if (displayName) {
        economy.players[playerId].name = displayName;
        if (economy.scores[playerId]) economy.scores[playerId].name = displayName;
      }
      saveEconomy(economy, false);
    }
    return economy.players[playerId];
  }

  /**
   * Founder approves a pending player and pays $10,000 from the house bank.
   */
  function approvePlayer(playerId) {
    if (!isFounder()) {
      return { ok: false, error: "Only the founder can approve players." };
    }
    const economy = loadEconomy();
    const player = normalizePlayer(economy.players[playerId]);
    if (!player) return { ok: false, error: "Player not found." };
    if (player.status === "approved" && player.starterFunded) {
      return { ok: true, already: true, player, grantUsd: player.startingUsd || PLAYER_APPROVAL_GRANT_USD };
    }

    const grant = Math.min(PLAYER_APPROVAL_GRANT_USD, economy.houseBankUsd);
    if (grant < PLAYER_APPROVAL_GRANT_USD) {
      return { ok: false, error: "House bank cannot fund a full $10,000 approval grant." };
    }

    economy.houseBankUsd -= grant;
    economy.totalPaidOutUsd += grant;
    player.status = "approved";
    player.approvedAt = now();
    player.startingUsd = grant;
    player.starterFunded = true;
    player.lastSeenAt = now();
    player.netUsd = (player.netUsd || 0) + grant;

    if (economy.scores[playerId]) {
      economy.scores[playerId].status = "approved";
      economy.scores[playerId].updatedAt = now();
    } else {
      economy.scores[playerId] = {
        playerId,
        name: player.name,
        score: 0,
        spins: 0,
        wins: 0,
        status: "approved",
        updatedAt: now(),
      };
    }

    pushHistory(economy);
    pushEvent(economy, {
      id: uid("evt"),
      type: "player_approved",
      at: now(),
      message: `Founder approved ${player.name} — $${grant.toLocaleString()} granted from house bank`,
      amountUsd: grant,
      playerId,
      game: null,
      meta: { houseBankUsd: economy.houseBankUsd, status: "approved" },
    });
    saveEconomy(economy);
    return { ok: true, player, grantUsd: grant };
  }

  function rejectPlayer(playerId) {
    if (!isFounder()) {
      return { ok: false, error: "Only the founder can reject players." };
    }
    const economy = loadEconomy();
    const player = normalizePlayer(economy.players[playerId]);
    if (!player) return { ok: false, error: "Player not found." };
    if (player.status === "approved" && player.starterFunded) {
      return { ok: false, error: "Player already approved and funded." };
    }
    player.status = "rejected";
    player.lastSeenAt = now();
    if (economy.scores[playerId]) {
      economy.scores[playerId].status = "rejected";
      economy.scores[playerId].updatedAt = now();
    }
    pushEvent(economy, {
      id: uid("evt"),
      type: "player_rejected",
      at: now(),
      message: `Founder rejected ${player.name}`,
      amountUsd: 0,
      playerId,
      game: null,
      meta: { status: "rejected" },
    });
    saveEconomy(economy);
    return { ok: true, player };
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
    if (!isPlayerApproved(playerId)) {
      return { ok: false, error: "Player is not approved to play." };
    }
    const eco = loadEconomy();
    const p = normalizePlayer(eco.players[playerId]);
    if (!p) return { ok: false, error: "Player not found." };

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
    return { ok: true, economy: eco };
  }

  /**
   * Pay a win FROM the house bank to the player (USD-equivalent).
   * Returns false if house cannot cover (still pays what it can / clamps).
   */
  function recordPayout({ playerId, game, amountUsd, meta = {} }) {
    let amount = Math.max(0, Number(amountUsd) || 0);
    if (!isPlayerApproved(playerId)) {
      return { ok: false, paidUsd: 0, error: "Player is not approved to play." };
    }
    const economy = loadEconomy();
    const player = normalizePlayer(economy.players[playerId]);
    if (!player) return { ok: false, paidUsd: 0, error: "Player not found." };

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
    return { ok: true, economy, paidUsd: amount };
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
        redirect: "/founder/",
        founder: true,
      };
    }
    const session = getSession();
    if (!session || session.role !== "player") {
      return {
        ok: false,
        needsRegistration: true,
        error: "Register a player name to request founder approval.",
      };
    }
    const player = ensurePlayer(session.playerId, session.name);
    if (player.status !== "approved" || !player.starterFunded) {
      return {
        ok: false,
        pendingApproval: true,
        rejected: player.status === "rejected",
        session,
        player,
        error:
          player.status === "rejected"
            ? "Your access request was rejected by the founder."
            : "Waiting for founder approval. Approved players receive $10,000.",
      };
    }
    return { ok: true, session, player };
  }

  function getSnapshot() {
    const economy = loadEconomy();
    const players = Object.values(economy.players || {}).map(normalizePlayer);
    const scores = Object.values(economy.scores || {}).sort((a, b) => b.score - a.score);
    const recent = (economy.events || []).slice(0, 50);
    const activeCutoff = now() - 5 * 60 * 1000;
    const activePlayers = players.filter((p) => p.status === "approved" && p.lastSeenAt >= activeCutoff);
    const pendingPlayers = players
      .filter((p) => p.status === "pending")
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const approvedPlayers = players.filter((p) => p.status === "approved");
    return {
      houseBankUsd: economy.houseBankUsd,
      startingBankUsd: FOUNDER_STARTING_BANK,
      approvalGrantUsd: PLAYER_APPROVAL_GRANT_USD,
      totalWageredUsd: economy.totalWageredUsd,
      totalPaidOutUsd: economy.totalPaidOutUsd,
      totalPlayerLossesUsd: economy.totalPlayerLossesUsd,
      netHouseEdgeUsd: economy.houseBankUsd - FOUNDER_STARTING_BANK,
      playerCount: players.length,
      pendingCount: pendingPlayers.length,
      approvedCount: approvedPlayers.length,
      activePlayers: activePlayers.length,
      pendingPlayers,
      approvedPlayers,
      scores,
      recent,
      bankHistory: economy.bankHistory || [],
      players,
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

export const MarkkadeEconomy = {
  FOUNDER_STARTING_BANK,
  PLAYER_APPROVAL_GRANT_USD,
  FOUNDER_USER,
  loadEconomy,
  getSnapshot,
  subscribe,
  ensurePlayer,
  getPlayer,
  isPlayerApproved,
  approvePlayer,
  rejectPlayer,
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

export default MarkkadeEconomy;
