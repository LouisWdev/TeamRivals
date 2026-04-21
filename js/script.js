let login = "rivalsteam@rivals.com";
let password = "rivals2026";

function handleLogin() {
    let LoginEmail = document.querySelector("#email");
    let LoginPassword = document.querySelector("#password");
    let errorMsg = document.querySelector("#login-error");

    if (LoginEmail.value === login && LoginPassword.value === password) {
        const username = LoginEmail.value.split("@")[0];
        localStorage.setItem("username", username);
        window.location.href = "./landing.html";
    } else {
        errorMsg.style.display = "block";
    }
}
