document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".navbar");
  if (!nav) return;

  nav.innerHTML = `
    <a href="../pages/landing.html" class="nav-logo">Rivals Track</a>
    <div class="nav-links">
      <a href="heroes.html">Helden</a>
      <a href="statpage.html">Statistieken</a>
      <a href="newsPage.html">Nieuws</a>
      <a href="loginPage.html" class="btn-yellow login-link">Log In</a>
    </div>
  `;

  // Highlight active page
  const current = window.location.pathname.split("/").pop();
  nav.querySelectorAll(".nav-links a:not(.btn-yellow)").forEach((link) => {
    if (link.getAttribute("href") === current) {
      link.classList.add("nav-active");
    }
  });

  // Show username if logged in
  const username = localStorage.getItem("username");
  const loginBtn = nav.querySelector(".login-link");
  if (username && loginBtn) {
    loginBtn.textContent = username;
  }
});
