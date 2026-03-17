const API_KEY =
  "7983383bb4f26287b16a031b0877b8b9dc1280ae42b1cf3d2b49562fe747364d";
const BASE_URL = "https://marvelrivalsapi.com/api/v1";
const IMG_BASE = "https://marvelrivalsapi.com";
const SKIN_BASE = "https://marvelrivalsapi.com/rivals";

async function loadGameStats() {
  try {
    const res = await fetch(`${BASE_URL}/heroes`, {
      headers: { "x-api-key": API_KEY },
    });
    const data = await res.json();
    const heroes = Array.isArray(data) ? data : data.heroes || [];

    const roles = {};
    heroes.forEach((h) => {
      const role = h.role || "Unknown";
      roles[role] = (roles[role] || 0) + 1;
    });

    const heroCountEl = document.querySelector("#hero-count-stat");
    if (heroCountEl) {
      heroCountEl.innerHTML = `
                <p class="stat-number">${heroes.length}</p>
                <p class="stat-label">Heroes in the roster</p>
                <div class="role-breakdown">
                    ${Object.entries(roles)
                      .map(
                        ([role, count]) =>
                          `<span class="role-tag">${role}: ${count}</span>`,
                      )
                      .join("")}
                </div>
            `;
    }

    const featuredEl = document.querySelector("#featured-heroes");
    if (featuredEl) {
      const byRole = {};
      heroes.forEach((h) => {
        if (!byRole[h.role]) byRole[h.role] = h;
      });

      featuredEl.innerHTML = Object.values(byRole)
        .slice(0, 3)
        .map((hero) => {
          const img = hero.costumes?.[0]?.icon
            ? `${SKIN_BASE}${hero.costumes[0].icon}`
            : hero.imageUrl
              ? `${IMG_BASE}${hero.imageUrl}`
              : "";
          const name = hero.real_name || hero.name || "Unknown";
          return `
                    <div class="featured-hero" onclick="location.href='heroDetail.html?id=${encodeURIComponent(hero.id || hero.name)}'">
                        ${img ? `<img src="${img}" alt="${name}" onerror="this.style.display='none'">` : ""}
                        <p><strong>${name}</strong></p>
                        <p class="hero-role">${hero.role || ""}</p>
                    </div>
                `;
        })
        .join("");
    }
  } catch {
    const heroCountEl = document.querySelector("#hero-count-stat");
    if (heroCountEl) heroCountEl.textContent = "Could not load game stats.";
  }
}

async function searchPlayer() {
  const input = document.querySelector("#player-search");
  const resultsArea = document.querySelector(".results-area");
  if (!input || !resultsArea) return;

  const username = input.value.trim();
  if (!username) return;

  resultsArea.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(
      `${BASE_URL}/player/${encodeURIComponent(username)}`,
      {
        headers: { "x-api-key": API_KEY },
      },
    );

    const data = await res.json();
    console.log("Player API response:", data);

    if (res.status === 429) {
      resultsArea.innerHTML = "<p>Too many requests. Please wait a moment and try again.</p>";
      return;
    }

    if (!res.ok || data.error || data.message) {
      const msg = data.message || data.error || "Player not found.";
      resultsArea.innerHTML = `<p>${msg}</p>`;
      return;
    }

    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      resultsArea.innerHTML = "<p>No data returned for this player.</p>";
      return;
    }

    renderPlayer(data, resultsArea);
  } catch (err) {
    console.error("Search error:", err);
    resultsArea.innerHTML = "<p>An error occurred while searching. Please try again.</p>";
  }
}

function renderPlayer(data, container) {
  const player = data.player || {};
  const name = data.name || player.name || "Unknown";
  const level = player.level || "—";

  // Rank
  const rank = player.rank?.rank || "Unranked";
  const rankImg = player.rank?.image ? `${SKIN_BASE}${player.rank.image}` : null;

  // Player icon
  const iconImg = player.icon?.player_icon ? `${SKIN_BASE}${player.icon.player_icon}` : null;

  // Overall stats (all-time, not just last season)
  const overall = data.overall_stats || {};
  const totalMatches = overall.total_matches ?? "—";
  const totalWins = overall.total_wins ?? "—";
  const totalLosses = (typeof totalMatches === "number" && typeof totalWins === "number")
    ? totalMatches - totalWins
    : "—";

  const ranked = overall.ranked || {};
  const unranked = overall.unranked || {};

  // Top heroes (combine ranked + unranked, sorted by matches)
  const allHeroes = [...(data.heroes_ranked || []), ...(data.heroes_unranked || [])];
  allHeroes.sort((a, b) => (b.matches ?? 0) - (a.matches ?? 0));
  const topHeroes = allHeroes.slice(0, 3);

  container.innerHTML = `
    <div class="player-result">

      <div class="player-header">
        ${iconImg ? `<img class="player-icon" src="${iconImg}" alt="${name}">` : ""}
        <div class="player-identity">
          <h3>${name}</h3>
          <span class="player-level">Level ${level}</span>
        </div>
        <div class="rank-display">
          ${rankImg ? `<img src="${rankImg}" alt="${rank}">` : ""}
          <span>${rank}</span>
        </div>
      </div>

      <div class="player-stats-grid">
        <div class="stat-box">
          <p class="stat-number">${totalMatches}</p>
          <p class="stat-label">Total Matches</p>
        </div>
        <div class="stat-box">
          <p class="stat-number">${totalWins}</p>
          <p class="stat-label">Wins</p>
        </div>
        <div class="stat-box">
          <p class="stat-number">${totalLosses}</p>
          <p class="stat-label">Losses</p>
        </div>
      </div>

      <div class="player-mode-grid">
        <div class="mode-box">
          <span class="mode-label">Ranked</span>
          <span class="mode-record">${ranked.total_wins ?? 0}W — ${(ranked.total_matches ?? 0) - (ranked.total_wins ?? 0)}L</span>
        </div>
        <div class="mode-box">
          <span class="mode-label">Unranked</span>
          <span class="mode-record">${unranked.total_wins ?? 0}W — ${(unranked.total_matches ?? 0) - (unranked.total_wins ?? 0)}L</span>
        </div>
      </div>

      ${topHeroes.length ? `
        <div class="top-heroes">
          <p class="top-heroes-title">Most Played</p>
          <div class="top-heroes-list">
            ${topHeroes.map(h => `
              <div class="hero-chip">
                <span class="hero-chip-name">${h.hero_name || h.name || "—"}</span>
                <span class="hero-chip-matches">${h.matches ?? "—"} matches</span>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}

    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  loadGameStats();

  const input = document.querySelector("#player-search");
  const btn = document.querySelector("#search-btn");

  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchPlayer();
  });
  btn?.addEventListener("click", searchPlayer);
});
