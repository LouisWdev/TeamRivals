const SKIN_BASE = "https://marvelrivalsapi.com/rivals";

async function searchPlayer() {
    const input = document.querySelector("#player-search");
    const resultsArea = document.querySelector(".results-area");
    if (!input || !resultsArea) return;

    const username = input.value.trim();
    if (!username) return;

    resultsArea.innerHTML = `
        <div class="loading-spinner">
            <p>Searching for ${username}...</p>
        </div>`;

    try {
        // Fetch from YOUR server, not the external API
        const res = await fetch(`/stats/api/player/${encodeURIComponent(username)}`);
        const data = await res.json();

        if (!res.ok) {
            resultsArea.innerHTML = `<p class="error">Player not found or API limit reached.</p>`;
            return;
        }

        renderPlayer(data, resultsArea);
    } catch (err) {
        resultsArea.innerHTML = `<p class="error">An error occurred while searching.</p>`;
    }
}

function renderPlayer(data, container) {
    const player = data.player || {};
    const name = data.name || player.name || "Unknown";
    const overall = data.overall_stats || {};
    
    // Rank and Icon
    const rankImg = player.rank?.image ? `${SKIN_BASE}${player.rank.image}` : null;
    const iconImg = player.icon?.player_icon ? `${SKIN_BASE}${player.icon.player_icon}` : null;

    // Stats calculation
    const totalMatches = overall.total_matches ?? 0;
    const totalWins = overall.total_wins ?? 0;
    const totalLosses = totalMatches - totalWins;

    container.innerHTML = `
        <div class="player-result fade-in">
            <div class="player-header">
                ${iconImg ? `<img class="player-icon" src="${iconImg}" alt="icon">` : ""}
                <div class="player-identity">
                    <h3>${name}</h3>
                    <span class="player-level">Level ${player.level || "—"}</span>
                </div>
                <div class="rank-display">
                    ${rankImg ? `<img src="${rankImg}" alt="rank">` : ""}
                    <span>${player.rank?.rank || "Unranked"}</span>
                </div>
            </div>

            <div class="player-stats-grid">
                <div class="stat-box"><strong>${totalMatches}</strong><br>Matches</div>
                <div class="stat-box"><strong>${totalWins}</strong><br>Wins</div>
                <div class="stat-box"><strong>${totalLosses}</strong><br>Losses</div>
            </div>

            <div class="player-mode-grid">
                <div class="mode-box">
                    <span>Ranked:</span> <strong>${overall.ranked?.total_wins || 0}W</strong>
                </div>
                <div class="mode-box">
                    <span>Unranked:</span> <strong>${overall.unranked?.total_wins || 0}W</strong>
                </div>
            </div>
        </div>
    `;
}

// Attach listeners
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector("#search-btn");
    const input = document.querySelector("#player-search");

    btn?.addEventListener("click", searchPlayer);
    input?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") searchPlayer();
    });
});