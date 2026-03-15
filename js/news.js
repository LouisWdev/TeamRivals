const API_KEY = "7983383bb4f26287b16a031b0877b8b9dc1280ae42b1cf3d2b49562fe747364d";
const BASE_URL = "https://marvelrivalsapi.com/api/v1";

async function loadEvents() {
    const grid = document.querySelector("#events-grid");
    if (!grid) return;

    grid.innerHTML = "<p style='color:var(--text);'>Loading events...</p>";

    try {
        const res = await fetch(`${BASE_URL}/events`, {
            headers: { "x-api-key": API_KEY }
        });
        const data = await res.json();
        const events = Array.isArray(data) ? data : (data.events || []);

        if (!events.length) {
            grid.innerHTML = "<p style='color:var(--text);'>No events found.</p>";
            return;
        }

        grid.innerHTML = events.slice(0, 4).map(ev => `
            <article class="news-card">
                <div class="card-content">
                    <p class="title">${ev.name || ev.title || "Event"}</p>
                    <p class="description">${ev.description || ""}</p>
                </div>
            </article>
        `).join("");
    } catch {
        grid.innerHTML = "<p style='color:var(--text);'>Failed to load events.</p>";
    }
}

async function loadPatchNotes() {
    const grid = document.querySelector("#patches-grid");
    if (!grid) return;

    grid.innerHTML = "<p style='color:var(--text);'>Loading patch notes...</p>";

    try {
        const res = await fetch(`${BASE_URL}/patch-notes`, {
            headers: { "x-api-key": API_KEY }
        });
        const data = await res.json();
        const patches = Array.isArray(data) ? data : (data.patch_notes || data.patchNotes || []);

        if (!patches.length) {
            grid.innerHTML = "<p style='color:var(--text);'>No patch notes found.</p>";
            return;
        }

        grid.innerHTML = patches.slice(0, 4).map(p => `
            <article class="news-card">
                <div class="card-content">
                    <p class="title">${p.title || p.name || "Patch"}</p>
                    <p class="description">${p.description || p.summary || ""}</p>
                </div>
            </article>
        `).join("");
    } catch {
        grid.innerHTML = "<p style='color:var(--text);'>Failed to load patch notes.</p>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadEvents();
    loadPatchNotes();
});
