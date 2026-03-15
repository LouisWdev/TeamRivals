const API_KEY = "7983383bb4f26287b16a031b0877b8b9dc1280ae42b1cf3d2b49562fe747364d";
const BASE_URL = "https://marvelrivalsapi.com/api/v1";
const IMG_BASE = "https://marvelrivalsapi.com";
const SKIN_BASE = "https://marvelrivalsapi.com/rivals";

// ── Game stats section ─────────────────────────────────────────────────────

async function loadGameStats() {
    try {
        const res = await fetch(`${BASE_URL}/heroes`, {
            headers: { "x-api-key": API_KEY }
        });
        const data = await res.json();
        const heroes = Array.isArray(data) ? data : (data.heroes || []);

        // Count heroes per role
        const roles = {};
        heroes.forEach(h => {
            const role = h.role || "Unknown";
            roles[role] = (roles[role] || 0) + 1;
        });

        // Hero count stat
        const heroCountEl = document.querySelector("#hero-count-stat");
        if (heroCountEl) {
            heroCountEl.innerHTML = `
                <p class="stat-number">${heroes.length}</p>
                <p class="stat-label">Heroes in the roster</p>
                <div class="role-breakdown">
                    ${Object.entries(roles).map(([role, count]) =>
                        `<span class="role-tag">${role}: ${count}</span>`
                    ).join("")}
                </div>
            `;
        }

        // Featured heroes (one per role)
        const featuredEl = document.querySelector("#featured-heroes");
        if (featuredEl) {
            const byRole = {};
            heroes.forEach(h => {
                if (!byRole[h.role]) byRole[h.role] = h;
            });

            featuredEl.innerHTML = Object.values(byRole).slice(0, 3).map(hero => {
                const img = hero.costumes?.[0]?.icon ? `${SKIN_BASE}${hero.costumes[0].icon}` : (hero.imageUrl ? `${IMG_BASE}${hero.imageUrl}` : "");
                const name = hero.real_name || hero.name || "Unknown";
                return `
                    <div class="featured-hero" onclick="location.href='heroDetail.html?id=${encodeURIComponent(hero.id || hero.name)}'">
                        ${img ? `<img src="${img}" alt="${name}" onerror="this.style.display='none'">` : ""}
                        <p><strong>${name}</strong></p>
                        <p class="hero-role">${hero.role || ""}</p>
                    </div>
                `;
            }).join("");
        }

    } catch {
        const heroCountEl = document.querySelector("#hero-count-stat");
        if (heroCountEl) heroCountEl.textContent = "Could not load game stats.";
    }
}

// ── Player search ──────────────────────────────────────────────────────────

async function searchPlayer() {
    const input = document.querySelector("#player-search");
    const resultsArea = document.querySelector(".results-area");
    if (!input || !resultsArea) return;

    const username = input.value.trim();
    if (!username) return;

    resultsArea.innerHTML = "<p>Loading...</p>";

    try {
        const res = await fetch(`${BASE_URL}/player/${encodeURIComponent(username)}`, {
            headers: { "x-api-key": API_KEY }
        });

        if (!res.ok) {
            resultsArea.innerHTML = "<p>Player not found.</p>";
            return;
        }

        const data = await res.json();
        renderPlayer(data, resultsArea);
    } catch {
        resultsArea.innerHTML = "<p>Failed to fetch player data.</p>";
    }
}

function renderPlayer(data, container) {
    const player = data.player || data;
    const name = player.name || player.username || player.player_name || "Unknown";
    const rank = player.rank_info?.rank_name || player.rank || "Unranked";
    const wins = player.stats?.wins ?? player.wins ?? "—";
    const losses = player.stats?.losses ?? player.losses ?? "—";
    const mvp = player.stats?.mvp_count ?? player.mvp ?? "—";

    const heroes = player.ranked_heroes || player.hero_stats || [];
    const topHero = heroes[0];
    const topHeroImg = topHero?.imageUrl ? `${IMG_BASE}${topHero.imageUrl}` : null;

    container.innerHTML = `
        <div class="player-result">
            <h3>${name}</h3>
            <p><strong>Rank:</strong> ${rank}</p>
            <p><strong>Wins:</strong> ${wins} &nbsp;|&nbsp; <strong>Losses:</strong> ${losses}</p>
            <p><strong>MVP count:</strong> ${mvp}</p>
            ${topHero ? `
                <div class="top-hero">
                    <p><strong>Most played:</strong> ${topHero.hero_name || topHero.real_name || topHero.name || "—"}</p>
                    ${topHeroImg ? `<img src="${topHeroImg}" alt="${topHero.hero_name || ''}" style="height:60px; border-radius:8px;">` : ""}
                </div>
            ` : ""}
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    loadGameStats();

    const input = document.querySelector("#player-search");
    const btn = document.querySelector("#search-btn");

    input?.addEventListener("keydown", e => {
        if (e.key === "Enter") searchPlayer();
    });
    btn?.addEventListener("click", searchPlayer);
});
