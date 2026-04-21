const API_KEY = "7983383bb4f26287b16a031b0877b8b9dc1280ae42b1cf3d2b49562fe747364d";
const BASE_URL = "https://marvelrivalsapi.com/api/v1";
const IMG_BASE = "https://marvelrivalsapi.com";      // for imageUrl (already has /rivals/)
const SKIN_BASE = "https://marvelrivalsapi.com/rivals"; // for costume icons (/costumes/...)

let allHeroes = [];

async function loadHeroes() {
    const grid = document.querySelector(".hero-grid");
    if (!grid) return;

    grid.innerHTML = "<p style='color:var(--text); padding:20px;'>Loading heroes...</p>";

    try {
        const res = await fetch(`${BASE_URL}/heroes`, {
            headers: { "x-api-key": API_KEY }
        });
        const data = await res.json();
        allHeroes = Array.isArray(data) ? data : (data.heroes || []);
        renderHeroes(allHeroes, grid);
    } catch {
        grid.innerHTML = "<p style='color:var(--text); padding:20px;'>Failed to load heroes.</p>";
    }
}

function renderHeroes(heroes, grid) {
    if (!heroes.length) {
        grid.innerHTML = "<p style='color:var(--text);'>No heroes found.</p>";
        return;
    }

    grid.innerHTML = heroes.map(hero => {
        const img = hero.costumes?.[0]?.icon ? `${SKIN_BASE}${hero.costumes[0].icon}` : (hero.imageUrl ? `${IMG_BASE}${hero.imageUrl}` : "");
        const name = hero.real_name || hero.name || "Unknown";
        const hp = hero.transformations?.[0]?.health ? `HP: ${hero.transformations[0].health}` : "";
        const role = hero.role || "";

        return `
            <article class="hero-card" onclick="location.href='heroDetail.html?id=${encodeURIComponent(hero.id || hero.name)}'">
                ${img
                    ? `<img src="${img}" alt="${name}" class="hero-image" onerror="this.style.display='none'">`
                    : `<div class="hero-image-placeholder"></div>`}
                <div class="hero-info">
                    <h3>${name}</h3>
                    ${hp ? `<p>${hp}</p>` : ""}
                    ${role ? `<p class="hero-role">${role}</p>` : ""}
                </div>
            </article>
        `;
    }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    loadHeroes();

    const dropdown = document.querySelector(".sort-dropdown");
    if (dropdown) {
        dropdown.addEventListener("change", () => {
            const sorted = [...allHeroes];
            if (dropdown.value === "Name") {
                sorted.sort((a, b) => (a.real_name || a.name || "").localeCompare(b.real_name || b.name || ""));
            } else if (dropdown.value === "HP") {
                sorted.sort((a, b) => {
                    const hpA = parseInt(a.transformations?.[0]?.health) || 0;
                    const hpB = parseInt(b.transformations?.[0]?.health) || 0;
                    return hpB - hpA;
                });
            }
            renderHeroes(sorted, document.querySelector(".hero-grid"));
        });
    }
});
