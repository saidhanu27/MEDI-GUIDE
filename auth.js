// =========================================================
// MediGuide AI — Authentication (Login / Signup / History)
// =========================================================

// Same-origin by default — this makes the app work identically whether
// it's running locally (python app.py) or deployed to the cloud
// (e.g. Render), since the frontend and backend are served from the
// same Flask app / same URL.
const AUTH_API_BASE = window.location.origin;

function getAuthToken() {
    try {
        return localStorage.getItem("mediguide_token");
    } catch (e) {
        return null;
    }
}

function setAuthToken(token) {
    try {
        localStorage.setItem("mediguide_token", token);
    } catch (e) {
        // ignore if storage unavailable
    }
}

function clearAuthToken() {
    try {
        localStorage.removeItem("mediguide_token");
    } catch (e) {
        // ignore
    }
}

function switchAuthTab(tab) {

    const loginTabBtn = document.getElementById("loginTabBtn");
    const signupTabBtn = document.getElementById("signupTabBtn");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const authError = document.getElementById("authError");

    authError.textContent = "";

    if (tab === "login") {
        loginTabBtn.classList.add("active");
        signupTabBtn.classList.remove("active");
        loginForm.style.display = "flex";
        signupForm.style.display = "none";
    } else {
        signupTabBtn.classList.add("active");
        loginTabBtn.classList.remove("active");
        signupForm.style.display = "flex";
        loginForm.style.display = "none";
    }

}

async function handleSignup() {

    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const authError = document.getElementById("authError");

    authError.textContent = "";

    if (!username || !email || !password) {
        authError.textContent = t("auth_error_fill_all");
        return;
    }

    try {

        const response = await fetch(`${AUTH_API_BASE}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            authError.textContent = data.error || t("auth_error_generic");
            return;
        }

        setAuthToken(data.token);
        onLoginSuccess(data.user);

    } catch (err) {
        authError.textContent = t("auth_error_backend_unreachable");
        console.error(err);
    }

}

async function handleLogin() {

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const authError = document.getElementById("authError");

    authError.textContent = "";

    if (!username || !password) {
        authError.textContent = t("auth_error_fill_all");
        return;
    }

    try {

        const response = await fetch(`${AUTH_API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            authError.textContent = data.error || t("auth_error_generic");
            return;
        }

        setAuthToken(data.token);
        onLoginSuccess(data.user);

    } catch (err) {
        authError.textContent = t("auth_error_backend_unreachable");
        console.error(err);
    }

}

async function handleLogout() {

    const token = getAuthToken();

    try {
        await fetch(`${AUTH_API_BASE}/logout`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
    } catch (e) {
        // ignore network errors on logout — clear locally regardless
    }

    clearAuthToken();
    window.__currentUser = null;
    location.reload();

}

function onLoginSuccess(user) {
    window.__currentUser = user;
    document.getElementById("authScreen").style.display = "none";
    document.getElementById("welcomeScreen").style.display = "flex";
    updateLoggedInLabel();
}

function updateLoggedInLabel() {
    const label = document.getElementById("loggedInUserLabel");
    if (label && window.__currentUser) {
        label.textContent = "👤 " + window.__currentUser.username;
    }
}

async function checkExistingSession() {

    const token = getAuthToken();

    if (!token) {
        return false;
    }

    try {

        const response = await fetch(`${AUTH_API_BASE}/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            clearAuthToken();
            return false;
        }

        const data = await response.json();
        window.__currentUser = data.user;
        return true;

    } catch (e) {
        // Backend not reachable yet — don't log the person out just for
        // that; let them see the login screen and try again.
        return false;
    }

}

// =========================
// History
// =========================

async function loadHistory() {

    const listBox = document.getElementById("historyList");
    const token = getAuthToken();

    if (!listBox) return;

    if (!token) {
        listBox.innerHTML = `<p>${t("history_login_required")}</p>`;
        return;
    }

    listBox.innerHTML = `<p>${t("loading_text")}</p>`;

    try {

        const response = await fetch(`${AUTH_API_BASE}/get_history`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            listBox.innerHTML = `<p>${data.error || t("auth_error_generic")}</p>`;
            return;
        }

        if (data.history.length === 0) {
            listBox.innerHTML = `<p>${t("history_empty")}</p>`;
            return;
        }

        listBox.innerHTML = data.history.map(h => `
            <div class="history-item">
                <div class="history-item-header">
                    <strong>${h.predicted_disease || "-"}</strong>
                    <span class="hospital-meta">${new Date(h.created_at).toLocaleString()}</span>
                </div>
                <div class="hospital-meta">
                    ${t("info_patient")}: ${h.patient_name || "-"} ·
                    ${t("info_age")}: ${h.age || "-"} ·
                    ${t("info_gender")}: ${h.gender || "-"}
                </div>
                <div class="hospital-meta">${h.symptoms || ""}</div>
                <div class="hospital-meta">
                    ${t("ml_confidence")}: ${h.confidence != null ? h.confidence + "%" : "-"} ·
                    ${t("risk_level_word")}: ${h.risk_level || "-"} ·
                    ${t("health_score_word")}: ${h.health_score != null ? h.health_score : "-"}
                </div>
            </div>
        `).join("");

    } catch (err) {
        listBox.innerHTML = `<p>${t("auth_error_backend_unreachable")}</p>`;
        console.error(err);
    }

}

// =========================
// Save the current analysis to history (called from analyzeSymptoms)
// =========================

async function saveCurrentAnalysisToHistory(payload) {

    const token = getAuthToken();
    if (!token) return; // not logged in somehow — silently skip

    try {
        await fetch(`${AUTH_API_BASE}/save_history`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Could not save history:", e);
    }

}

// =========================
// On page load: check session, show login or app accordingly
// =========================

document.addEventListener("DOMContentLoaded", async function () {

    const isLoggedIn = await checkExistingSession();

    if (isLoggedIn) {
        document.getElementById("authScreen").style.display = "none";
        document.getElementById("welcomeScreen").style.display = "flex";
        updateLoggedInLabel();
    } else {
        document.getElementById("authScreen").style.display = "flex";
        document.getElementById("welcomeScreen").style.display = "none";
    }

});