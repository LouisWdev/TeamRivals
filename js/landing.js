const API_KEY = typeof process !== "undefined" ? process.env.RIVALS_API_KEY : "";
const BASE_URL = "https://marvelrivalsapi.com/api/v1";

document.addEventListener("DOMContentLoaded", async () => {
    const el = document.querySelector("#hero-count");
    if (!el) return;

    try {
        const res = await fetch(`${BASE_URL}/heroes`, {
            headers: { "x-api-key": API_KEY }
        });
        const data = await res.json();
        const heroes = Array.isArray(data) ? data : (data.heroes || []);
        el.textContent = `${heroes.length} Helden Beschikbaar`;
    } catch {
        el.textContent = "";
    }
});
