const API_KEY = typeof process !== "undefined" ? process.env.RIVALS_API_KEY : "";
const BASE_URL = "https://marvelrivalsapi.com/api/v1";

async function loadPatchNotes() {
  const grid = document.querySelector("#patches-grid");
  if (!grid) return;

  grid.innerHTML = "<p style='color:var(--text);'>Loading patch notes...</p>";

  try {
    const res = await fetch(`${BASE_URL}/patch-notes`, {
      headers: { "x-api-key": API_KEY },
    });

    if (res.status === 429) {
      grid.innerHTML =
        "<p style='color:var(--text);'>Too many requests. Try again later.</p>";
      return;
    }

    const data = await res.json();
    console.log("Patch notes API response:", data);

    if (!res.ok) {
      grid.innerHTML = `<p style='color:var(--text);'>${data.message || "Failed to load patch notes."}</p>`;
      return;
    }

    const patches = Array.isArray(data)
      ? data
      : data.formatted_patches || data.patch_notes || data.data || [];

    if (!patches.length) {
      grid.innerHTML =
        "<p style='color:var(--text);'>No patch notes found.</p>";
      return;
    }

    grid.innerHTML = patches
      .slice(0, 4)
      .map(
        (p) => `
            <article class="news-card">
                <div class="card-content">
                    <p class="title">${p.title || p.name || "Patch"}</p>
                    <p class="description">${p.overview || p.description || ""}</p>
                    <p class="patch-date">${p.date || ""}</p>
                </div>
            </article>
        `,
      )
      .join("");
  } catch (err) {
    console.error("Patch notes error:", err);
    grid.innerHTML =
      "<p style='color:var(--text);'>Failed to load patch notes.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPatchNotes();
});
