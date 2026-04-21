const API_KEY = "7983383bb4f26287b16a031b0877b8b9dc1280ae42b1cf3d2b49562fe747364d";
const BASE_URL = "https://marvelrivalsapi.com/api/v1";
const IMG_BASE = "https://marvelrivalsapi.com";
const SKIN_BASE = "https://marvelrivalsapi.com/rivals";

async function loadHeroDetail() {
    const params = new URLSearchParams(window.location.search);
    const heroId = params.get("id");
    if (!heroId) return;

    try {
        const res = await fetch(`${BASE_URL}/heroes/hero/${encodeURIComponent(heroId)}`, {
            headers: { "x-api-key": API_KEY }
        });
        const data = await res.json();
        const hero = data.hero || data;

        renderHero(hero);
        loadOtherHeroes(heroId);
    } catch {
        document.querySelector(".hero-text-content h1").textContent = "Failed to load hero.";
    }
}

function renderHero(hero) {
    const name = hero.real_name || hero.name || "Unknown Hero";
    const hp = hero.transformations?.[0]?.health || "—";
    const role = hero.role || "—";
    const attackType = hero.attack_type || "";
    const difficulty = hero.difficulty ? `Difficulty: ${hero.difficulty}/5` : "";
    const description = hero.bio || hero.lore || "";
    const img = hero.costumes?.[0]?.icon ? `${SKIN_BASE}${hero.costumes[0].icon}` : (hero.imageUrl ? `${IMG_BASE}${hero.imageUrl}` : null);

    document.querySelector(".hero-text-content h1").textContent = name;
    document.querySelector(".stats-list").innerHTML = `
        <p><strong>HP:</strong> ${hp}</p>
        <p><strong>Role:</strong> ${role}</p>
        ${attackType ? `<p><strong>Attack type:</strong> ${attackType}</p>` : ""}
        ${difficulty ? `<p><strong>${difficulty}</strong></p>` : ""}
    `;
    if (description) {
        document.querySelector(".hero-description").textContent = description;
    }

    const imgContainer = document.querySelector(".hero-large-image");
    if (img) {
        imgContainer.innerHTML = `<img src="${img}" alt="${name}">`;
    } else {
        imgContainer.textContent = name;
    }

    document.title = `${name} - Rivals Track`;
}

async function loadOtherHeroes(currentId) {
    const miniGrid = document.querySelector(".hero-grid-mini");
    if (!miniGrid) return;

    try {
        const res = await fetch(`${BASE_URL}/heroes`, {
            headers: { "x-api-key": API_KEY }
        });
        const data = await res.json();
        const heroes = (Array.isArray(data) ? data : (data.heroes || []))
            .filter(h => String(h.id || h.name) !== String(currentId))
            .slice(0, 4);

        miniGrid.innerHTML = heroes.map(hero => {
            const img = hero.costumes?.[0]?.icon ? `${SKIN_BASE}${hero.costumes[0].icon}` : (hero.imageUrl ? `${IMG_BASE}${hero.imageUrl}` : "");
            const name = hero.real_name || hero.name || "Unknown";
            const hp = hero.transformations?.[0]?.health;
            return `
                <article class="mini-card" onclick="location.href='heroDetail.html?id=${encodeURIComponent(hero.id || hero.name)}'">
                    ${img
                        ? `<img src="${img}" alt="${name}" class="mini-img" onerror="this.style.display='none'">`
                        : `<div class="mini-img-placeholder"></div>`}
                    <div class="mini-info">
                        <h3>${name}</h3>
                        ${hp ? `<p>HP: ${hp}</p>` : ""}
                        ${hero.role ? `<p>${hero.role}</p>` : ""}
                    </div>
                </article>
            `;
        }).join("");
    } catch {
        miniGrid.innerHTML = "<p style='color:var(--text);'>Failed to load other heroes.</p>";
    }
}

document.addEventListener("DOMContentLoaded", loadHeroDetail);
