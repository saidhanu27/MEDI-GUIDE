// =========================
// Backend API base — same-origin, so this works locally AND after
// deploying to the cloud (Render, etc.) without any code changes.
// =========================

const MEDIGUIDE_API_BASE = window.location.origin;

// =========================
// Group AI report HTML into per-section blocks
// (so a heading never gets separated from its content when
//  printed to PDF across a page break)
// =========================

function wrapAiSectionsForPrint(html) {

    const temp = document.createElement("div");
    temp.innerHTML = html;

    const wrapper = document.createElement("div");
    let currentSection = null;

    Array.from(temp.childNodes).forEach((node) => {

        const isHeading = node.nodeType === 1 && node.tagName === "H2";

        if (isHeading || !currentSection) {
            currentSection = document.createElement("div");
            currentSection.className = "ai-section";
            wrapper.appendChild(currentSection);
        }

        currentSection.appendChild(node.cloneNode(true));

    });

    return wrapper.innerHTML;

}

// =========================
// Translation helper — falls back to English if a key is missing
// =========================

function t(key) {
    const dict = (typeof TRANSLATIONS !== "undefined" && TRANSLATIONS[currentLanguage]) || {};
    const enDict = (typeof TRANSLATIONS !== "undefined" && TRANSLATIONS.en) || {};
    return dict[key] || enDict[key] || key;
}

// =========================
// Welcome Screen
// =========================

function closeWelcome() {

    const welcome = document.getElementById("welcomeScreen");

    if (welcome) {
        welcome.style.opacity = "0";

        setTimeout(() => {
            welcome.style.display = "none";
        }, 300);
    }

}


async function analyzeSymptoms(event) {

    if (event) event.preventDefault();

    const patientName = document.getElementById("patientName").value.trim();
    if (patientName === "") {
        alert(t("alert_enter_name"));
        return;
    }
    const analyzeBtn = document.getElementById("analyzeBtn");
    const age = parseInt(document.getElementById("age").value);

    if (isNaN(age) || age < 1 || age > 120) {
        alert(t("alert_valid_age"));
        return;
    }
    const gender = document.getElementById("gender").value;
    const extraSymptoms = document.getElementById("extraSymptoms").value;

    const result = document.getElementById("result");
    const loading = document.getElementById("loading");

    const selectedSymptoms = [];

    document.querySelectorAll(".symptoms input:checked").forEach((item) => {
        selectedSymptoms.push(item.value);
    });

    if (!age || !gender) {
        alert(t("alert_enter_age_gender"));
        return;
    }

    if (selectedSymptoms.length === 0 && extraSymptoms.trim() === "") {
        alert(t("alert_select_symptom"));
        return;
    }

    const symptoms =
        selectedSymptoms.join(", ") +
        (extraSymptoms.trim() ? ", " + extraSymptoms.trim() : "");

    loading.style.display = "block";
    result.innerHTML = "";

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = "⏳ " + t("loading_text");

    // ---------------------------------------------------------
    // STEP 1: Call our own Machine Learning backend (Random Forest)
    // This is the core ML prediction — runs BEFORE the AI text report.
    // ---------------------------------------------------------
    let mlHTML = "";

    try {

        const mlResponse = await fetch(`${MEDIGUIDE_API_BASE}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms: selectedSymptoms })
        });

        if (mlResponse.ok) {

            const mlData = await mlResponse.json();

            const mlRiskClass =
                mlData.risk_level === "High" ? "high" :
                mlData.risk_level === "Medium" ? "medium" : "low";

            mlHTML = `
            <div class="result-card ml-card">
                <h2>${t("ml_title")}</h2>
                <p><strong>${t("ml_algorithm")}:</strong> ${mlData.algorithm}</p>
                <p><strong>${t("ml_most_likely")}:</strong> ${mlData.predicted_disease}
                   (${mlData.confidence}% ${t("ml_confidence")})</p>
                <p><strong>${t("ml_risk")}:</strong>
                   <span class="risk-badge ${mlRiskClass}">${mlData.risk_level}</span>
                </p>
                <p><strong>${t("ml_specialist")}:</strong> ${mlData.recommended_specialist}</p>
                <div class="chart-wrap">
                    <h3>${t("ml_chart_title")}</h3>
                    <canvas id="mlChart" height="160"></canvas>
                </div>
            </div>
            `;

            // Stash the top predictions + disease/specialist so the chart
            // and the "Find Nearby Hospitals" button can use them later.
            window.__mlTopPredictions = mlData.top_predictions;
            window.__lastPredictedDisease = mlData.predicted_disease;
            window.__lastRecommendedSpecialist = mlData.recommended_specialist;
            window.__mlDataForHistory = mlData;

        } else {

            mlHTML = `
            <div class="result-card ml-card">
                <h2>${t("ml_title")}</h2>
                <p>${t("ml_error")}</p>
            </div>
            `;

            window.__mlTopPredictions = null;

        }

    } catch (mlError) {

        mlHTML = `
        <div class="result-card ml-card">
            <h2>${t("ml_title")}</h2>
            <p>${t("ml_unreachable")}</p>
        </div>
        `;

        window.__mlTopPredictions = null;

        console.error("ML backend error:", mlError);

    }

    const prompt = `
You are MediGuide AI.

Patient Details:

Name: ${patientName}
Age: ${age}
Gender: ${gender}

Symptoms:
${symptoms}

Respond ONLY in HTML.

Write your ENTIRE response in the ${t("_name_for_ai")} language.
Keep the section heading emojis exactly as given below, but translate the
heading words themselves and all body text into that language.

Write in SIMPLE, EASY-TO-UNDERSTAND language for a general reader.
Use short sentences and everyday words.
Avoid difficult medical or technical terms — if you must use one,
explain it in plain words right after.
Imagine you are explaining this to a person with no medical background.

Use ONLY these tags:
<h2>, <h3>, <p>, <ul>, <li>, <hr>, <strong>

Do NOT use Markdown.

Create these sections:

<h2>🩺 Possible Conditions</h2>

<h2>📊 Risk Level</h2>

<h2>💊 General Medicine Information</h2>

<h2>🥗 Food To Eat</h2>

<h2>🚫 Foods To Avoid</h2>

<h2>💧 Water Intake</h2>

<h2>🏠 Home Care Tips</h2>

<h2>👨‍⚕️ Doctor To Consult</h2>

<h2>🚨 Emergency Warning</h2>

<h2>🏥 Overall Health Assessment</h2>

<h2>📈 Health Score (0-100)</h2>

Rules:

- Mention only possible conditions.
- Never confirm diagnosis.
- Never prescribe medicines.
- Educational purpose only.
- Recommend consulting a qualified doctor.
- IMPORTANT: Keep every section SHORT — max 3-4 bullet points or 2-3 short
  sentences per section. You MUST include ALL 11 sections listed above,
  in the same order, ending with the disclaimer. Do not skip
  "Doctor To Consult" or "Emergency Warning" — these two are mandatory.

Finish with:

<hr>

<p><strong>Disclaimer:</strong>
This information is for educational purposes only and is not a medical diagnosis.
Please consult a qualified healthcare professional.</p>

Then, as the VERY LAST thing in your response, on its own line, add this
machine-readable marker (do NOT translate this line, keep it in English
exactly in this format, it will not be shown to the user):
<!-- META: RISK=LOW|MEDIUM|HIGH SCORE=0-100 -->
Replace LOW|MEDIUM|HIGH with your actual assessed risk level, and 0-100
with your actual assessed health score number.
`;

    try {

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    model: "openai/gpt-oss-120b",

                    messages: [

                        {
                            role: "system",
                            content: "You are a helpful medical AI assistant."
                        },

                        {
                            role: "user",
                            content: prompt
                        }

                    ],

                    temperature: 0.3,
                    max_tokens: 2200

                })

            }

        );

        const data = await response.json();

        loading.style.display = "none";

        if (!response.ok) {

            result.innerHTML =
                "<h3>API Error</h3><pre>" +
                JSON.stringify(data, null, 2) +
                "</pre>";

            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = "🔍 " + t("btn_analyze");

            return;

        }

        const aiTextRaw = data.choices[0].message.content;
        const aiText = wrapAiSectionsForPrint(aiTextRaw);

        // ---------- Risk & Health Score ----------
        // Read from the hidden English marker the AI appends at the end,
        // e.g. <!-- META: RISK=HIGH SCORE=62 -->
        // This works no matter which language the visible report is in.

        const metaMatch = aiTextRaw.match(/RISK=(LOW|MEDIUM|HIGH)[\s\S]*?SCORE=(\d{1,3})/i);

        let riskBadge = "low";
        let healthScore = 80;

        if (metaMatch) {

            riskBadge = metaMatch[1].toLowerCase();
            healthScore = parseInt(metaMatch[2]);

        } else {

            // Fallback (older responses without the marker, English only)
            if (aiText.toLowerCase().includes("medium")) riskBadge = "medium";
            if (aiText.toLowerCase().includes("high")) riskBadge = "high";

            const scoreMatch = aiText.match(/Health Score.*?(\d{1,3})/i);
            if (scoreMatch) healthScore = parseInt(scoreMatch[1]);

        }

        const riskClass = "risk-" + riskBadge;

        let healthStatus = t("status_healthy");

        if (healthScore < 80) {
            healthStatus = t("status_needs_care");
        }

        if (healthScore < 50) {
            healthStatus = t("status_high_risk");
        }

        let statusClass = "healthy";

        if (healthScore >= 80) {
            statusClass = "healthy";
        } else if (healthScore >= 50) {
            statusClass = "care";
        } else {
            statusClass = "risk";
        }

        result.innerHTML = `
        <div class="info-bar">
            <div class="info-item">
                <div class="info-label">${t("info_patient")}</div>
                <div class="info-value">${patientName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">${t("info_age")}</div>
                <div class="info-value">${age}</div>
            </div>
            <div class="info-item">
                <div class="info-label">${t("info_gender")}</div>
                <div class="info-value">${t("gender_" + gender.toLowerCase())}</div>
            </div>
            <div class="info-item">
                <div class="info-label">${t("info_date")}</div>
                <div class="info-value">${new Date().toLocaleDateString()}</div>
            </div>
            <div class="info-item">
                <div class="info-label">${t("info_time")}</div>
                <div class="info-value">${new Date().toLocaleTimeString()}</div>
            </div>
        </div>
        ${mlHTML}
<div class="top-dashboard">

    <div class="dashboard-card">

        <h2>❤️ ${t("health_score_word")}</h2>

        <div class="score-circle">

            <div class="score-value">
                ${healthScore}/100
            </div>

        </div>

        <div class="score-status ${statusClass}">
            ${healthStatus}
        </div>

    </div>

    <div class="risk-card">

        <h2>📊 ${t("risk_level_word")}</h2>

        <div class="risk-badge ${riskBadge}">
            ${riskClass.replace("risk-", "").toUpperCase()}
        </div>

    </div>

</div>

<div class="result-card">

    <h2>📋 AI Health Report</h2>

    <div class="ai-report risk-border-${riskBadge}">
        ${aiText}
    </div>

</div>

`;

        // Animate Health Circle

        const circle = document.querySelector(".score-circle");

        if (circle) {

            const degree = (healthScore / 100) * 360;

            setTimeout(() => {
                circle.style.setProperty("--progress", degree + "deg");
            }, 200);

        }

        // Draw ML top-predictions bar chart (if data + Chart.js available)

        if (window.__mlTopPredictions && typeof Chart !== "undefined") {

            const chartCanvas = document.getElementById("mlChart");

            if (chartCanvas) {

                const labels = window.__mlTopPredictions.map(p => p.disease);
                const values = window.__mlTopPredictions.map(p => p.confidence);

                new Chart(chartCanvas.getContext("2d"), {
                    type: "bar",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Confidence %",
                            data: values,
                            backgroundColor: ["#00e5ff", "#8b5cf6", "#00ffa3"],
                            borderRadius: 8,
                            maxBarThickness: 46
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                grid: { color: "rgba(255,255,255,.06)" },
                                ticks: { color: "#8b93a7" }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: "#8b93a7" }
                            }
                        }
                    }
                });

            }

        }

        // Save this analysis to the logged-in user's history (silently —
        // failure here should never interrupt the person's results view).
        if (window.__mlDataForHistory) {
            saveCurrentAnalysisToHistory({
                patient_name: patientName,
                age: age,
                gender: gender,
                symptoms: symptoms,
                predicted_disease: window.__mlDataForHistory.predicted_disease,
                confidence: window.__mlDataForHistory.confidence,
                risk_level: window.__mlDataForHistory.risk_level,
                health_score: healthScore
            });
        }

        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = "🔍 " + t("btn_analyze");

    }

    catch (error) {

        loading.style.display = "none";

        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = "🔍 " + t("btn_analyze");

        result.innerHTML = `
        ${mlHTML}
        <div class="result-card">
            <h2>❌ Error</h2>
            <p>${error.message}</p>
        </div>
        `;

        console.error(error);

    }

}
// =========================
// Voice Input
// =========================

function startVoiceInput() {

    const loading = document.getElementById("loading");

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert(t("voice_not_supported"));
        return;
    }

    const voiceBtn = document.getElementById("voiceBtn");

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceBtn.disabled = true;
    voiceBtn.classList.add("listening");
    voiceBtn.innerHTML = "🎙 " + t("voice_listening");

    loading.style.display = "block";

    recognition.start();

    recognition.onresult = function(event) {

        const speech = event.results[0][0].transcript;

        document.getElementById("extraSymptoms").value = speech;

    };

    recognition.onerror = function(event) {

        alert("Voice recognition failed: " + event.error);

    };

    recognition.onend = function() {

        loading.style.display = "none";

        voiceBtn.disabled = false;
        voiceBtn.classList.remove("listening");
        voiceBtn.innerHTML = "🎤 Speak Symptoms";

    };

}


// =========================
// Reset Form
// =========================

function resetForm() {

    document.getElementById("patientName").value = "";

    document.getElementById("age").value = "";

    document.getElementById("gender").selectedIndex = 0;

    document.getElementById("extraSymptoms").value = "";

    document.querySelectorAll(".symptoms input").forEach((item) => {
        item.checked = false;
    });

    document.getElementById("result").innerHTML = "";

    document.getElementById("loading").style.display = "none";

}


// =========================
// Download PDF
// =========================

function downloadPDF() {

    const element = document.getElementById("result");

    if (element.innerHTML.trim() === "") {

        alert(t("alert_analyze_first"));

        return;

    }

    // Scroll to the very top first — otherwise html2canvas can capture
    // starting from the current scroll position, which shows up as a
    // blank first page in the PDF.
    window.scrollTo(0, 0);

    const options = {

        margin: 0.4,

        filename: "MediGuide_AI_Report.pdf",

        image: {
            type: "jpeg",
            quality: 1
        },

        html2canvas: {
            scale: 2,
            useCORS: true,
            scrollX: 0,
            scrollY: 0
        },

        jsPDF: {

            unit: "in",

            format: "a4",

            orientation: "portrait"

        },

        // Avoid slicing any card/section in half between two pages
        pagebreak: {
            mode: "avoid-all"
        }

    };

    setTimeout(() => {
        html2pdf().set(options).from(element).save();
    }, 150);

}
// =========================
// Find Hospital — uses the symptoms you already selected/analyzed
// (checkboxes + extra symptoms text + last ML prediction, if available)
// =========================

function findHospitalForMySymptoms() {

    const resultBox = document.getElementById("doctorHospitalResult");
    const loading = document.getElementById("loading");

    // Build symptom text from whatever the person already entered above
    const selectedSymptoms = [];
    document.querySelectorAll(".symptoms input:checked").forEach((item) => {
        selectedSymptoms.push(item.value);
    });
    const extraSymptoms = document.getElementById("extraSymptoms").value.trim();

    const combinedText = [
        selectedSymptoms.join(", "),
        extraSymptoms,
        window.__lastPredictedDisease || ""
    ].filter(Boolean).join(", ");

    if (combinedText.trim() === "") {
        alert(t("hf_alert_enter_symptom"));
        return;
    }

    if (!navigator.geolocation) {
        alert(t("voice_not_supported"));
        return;
    }

    resultBox.innerHTML = "";
    loading.style.display = "block";

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            try {

                const response = await fetch(`${MEDIGUIDE_API_BASE}/find_doctor`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        symptom_text: combinedText,
                        specialist: window.__lastRecommendedSpecialist || null,
                        lat: lat,
                        lng: lng,
                        radius_km: 30
                    })
                });

                const data = await response.json();

                loading.style.display = "none";

                if (!response.ok || data.error) {
                    resultBox.innerHTML = `
                    <div class="result-card">
                        <h2>${t("hospital_title")}</h2>
                        <p>${t("hospital_backend_error")}: ${data.error || "Unknown error"}.
                        ${t("hospital_backend_hint")}</p>
                    </div>`;
                    return;
                }

                if (data.hospitals.length === 0) {
                    resultBox.innerHTML = `
                    <div class="result-card">
                        <h2>${t("hospital_title")}</h2>
                        <p class="hospital-specialist-note">
                            ${t("hospital_specialist_prefix")} <strong>${data.recommended_specialist}</strong>
                        </p>
                        <p>${t("hospital_none_found")}</p>
                    </div>`;
                    return;
                }

                const listHTML = data.hospitals.map(h => `
                    <div class="hospital-item ${h.nearest ? "nearest" : ""}">
                        <div class="hospital-name">
                            ${h.nearest ? "📍 " : "🏥 "}${h.name}
                            ${h.nearest ? `<span class="hospital-tag">${t("hospital_nearest")}</span>` : ""}
                            ${h.emergency ? `<span class="hospital-tag emergency">${t("hospital_emergency")}</span>` : ""}
                        </div>
                        <div class="hospital-meta">${h.address}</div>
                        <div class="hospital-meta">
                            <strong>${h.distance_km} ${t("hospital_km_away")}</strong>
                            ${h.phone ? " · " + h.phone : ""}
                            · <a href="${h.maps_link}" target="_blank" class="hospital-map-link">${t("hospital_view_map")}</a>
                        </div>
                    </div>
                `).join("");

                resultBox.innerHTML = `
                <div class="result-card">
                    <h2>${t("hospital_title")}</h2>
                    <p class="hospital-specialist-note">
                        ${t("hospital_specialist_prefix")} <strong>${data.recommended_specialist}</strong>
                        ${data.matched_specialist_facilities
                            ? " — " + t("hospital_specialist_matched")
                            : " — " + t("hospital_specialist_not_matched")}
                    </p>
                    <p class="hospital-note">
                        ${t("hospital_sorted_note")} ${data.source}.
                        ${t("hospital_no_ratings")}
                    </p>
                    ${listHTML}
                </div>`;

            } catch (err) {

                loading.style.display = "none";

                resultBox.innerHTML = `
                <div class="result-card">
                    <h2>${t("hospital_title")}</h2>
                    <p>${t("hospital_unreachable")}</p>
                </div>`;

                console.error(err);

            }

        },

        function (error) {

            loading.style.display = "none";

            resultBox.innerHTML = `
            <div class="result-card">
                <h2>${t("hospital_title")}</h2>
                <p>${t("hospital_denied")}</p>
            </div>`;

            console.error(error);

        }

    );

}
function toggleTheme(){

    document.body.classList.toggle("dark-mode");

    const btn = document.getElementById("themeBtn");

    if(document.body.classList.contains("dark-mode")){
        btn.innerHTML = "☀️ " + t("theme_light");
    }else{
        btn.innerHTML = "🌙 " + t("theme_dark");
    }

}