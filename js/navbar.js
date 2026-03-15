document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    const loginBtn = document.querySelector(".btn-yellow");
    if (username && loginBtn) {
        loginBtn.textContent = username;
    }
});
