const API_KEY = "7983383bb4f26287b16a031b0877b8b9dc1280ae42b1cf3d2b49562fe747364d";
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
        el.textContent = `${heroes.length} Heroes available`;
    } catch {
        el.textContent = "";
    }
});
