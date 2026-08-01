(() => {
  "use strict";

  const loginView = document.getElementById("loginView");
  const dashView = document.getElementById("dashView");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");

  let bankChart;
  let flowChart;
  let unsub = null;

  function showDash() {
    loginView.hidden = true;
    dashView.hidden = false;
    startLive();
  }

  function showLogin() {
    if (unsub) unsub();
    unsub = null;
    dashView.hidden = true;
    loginView.hidden = false;
  }

  function initCharts() {
    const bankCtx = document.getElementById("bankChart");
    const flowCtx = document.getElementById("flowChart");
    const grid = "rgba(255,255,255,0.08)";
    const tick = "#9aa3b2";

    bankChart = new Chart(bankCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "House Bank (USD)",
            data: [],
            borderColor: "#e2b657",
            backgroundColor: "rgba(226, 182, 87, 0.15)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      },
      options: chartOptions(grid, tick, true),
    });

    flowChart = new Chart(flowCtx, {
      type: "bar",
      data: {
        labels: ["Wagered", "Paid Out", "Net to House"],
        datasets: [
          {
            label: "USD",
            data: [0, 0, 0],
            backgroundColor: ["#e2b657", "#3dffb0", "#7aa2ff"],
            borderRadius: 8,
          },
        ],
      },
      options: chartOptions(grid, tick, false),
    });
  }

  function chartOptions(grid, tick, isTime) {
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { color: tick, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
          grid: { color: grid },
        },
        y: {
          ticks: {
            color: tick,
            callback: (v) => {
              if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
              if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
              if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
              return `$${v}`;
            },
          },
          grid: { color: grid },
        },
      },
      animation: isTime ? { duration: 400 } : { duration: 300 },
    };
  }

  function render(snapshot) {
    const { formatUsd } = window.MarkkadeEconomy;
    document.getElementById("houseBank").textContent = formatUsd(snapshot.houseBankUsd);
    const delta = snapshot.netHouseEdgeUsd;
    const foot = document.getElementById("houseDelta");
    foot.textContent =
      delta >= 0
        ? `+${formatUsd(delta)} vs start (player losses)`
        : `${formatUsd(delta)} vs start (paid to players)`;
    foot.className = `stat-foot ${delta >= 0 ? "up" : "down"}`;

    document.getElementById("totalWagered").textContent = formatUsd(snapshot.totalWageredUsd);
    document.getElementById("totalPaid").textContent = formatUsd(snapshot.totalPaidOutUsd);
    document.getElementById("activePlayers").textContent = String(snapshot.activePlayers);

    document.getElementById("scoreMeta").textContent = `${snapshot.scores.length} players`;
    const body = document.getElementById("scoreBody");
    if (!snapshot.scores.length) {
      body.innerHTML = `<tr><td colspan="5">No player scores yet — waiting for live play…</td></tr>`;
    } else {
      body.innerHTML = snapshot.scores
        .slice(0, 25)
        .map(
          (s, i) => `<tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(s.name)}</td>
            <td>${Number(s.score || 0).toFixed(2)}</td>
            <td>${s.wins || 0}</td>
            <td>${s.spins || 0}</td>
          </tr>`
        )
        .join("");
    }

    const feed = document.getElementById("activityFeed");
    feed.innerHTML = (snapshot.recent || [])
      .slice(0, 40)
      .map((e) => {
        const cls = e.type === "payout" ? "payout" : e.type === "wager" ? "wager" : "";
        return `<li class="${cls}">
          <strong>${escapeHtml(e.message || e.type)}</strong>
          <span class="when">${new Date(e.at).toLocaleTimeString()} · ${e.type}</span>
        </li>`;
      })
      .join("");

    // Charts
    const history = snapshot.bankHistory || [];
    const labels = history.map((h) => new Date(h.t).toLocaleTimeString());
    const values = history.map((h) => h.v);
    if (bankChart) {
      bankChart.data.labels = labels;
      bankChart.data.datasets[0].data = values;
      bankChart.update("none");
    }
    if (flowChart) {
      flowChart.data.datasets[0].data = [
        snapshot.totalWageredUsd,
        snapshot.totalPaidOutUsd,
        snapshot.netHouseEdgeUsd,
      ];
      flowChart.update("none");
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function startLive() {
    if (!bankChart) initCharts();
    if (unsub) unsub();
    unsub = window.MarkkadeEconomy.subscribe(render);
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginError.hidden = true;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const result = window.MarkkadeEconomy.loginFounder(username, password);
    if (!result.ok) {
      loginError.hidden = false;
      loginError.textContent = result.error || "Login failed";
      return;
    }
    showDash();
  });

  logoutBtn.addEventListener("click", () => {
    window.MarkkadeEconomy.logout();
    showLogin();
  });

  function boot() {
    const session = window.MarkkadeEconomy.getSession();
    if (session?.role === "founder") showDash();
    else showLogin();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
