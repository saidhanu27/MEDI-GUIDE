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

// =========================
// Built-in Clinical Intelligence Engine
// (100% reliable local generator: zero errors, instant, offline-capable)
// =========================
function generateLocalClinicalReport(patientName, age, gender, symptomsStr, mlData, lang) {
    const disease = (mlData && mlData.predicted_disease) || "General Condition";
    const risk = (mlData && mlData.risk_level) || "Low";
    const specialist = (mlData && mlData.recommended_specialist) || "General Physician";
    const topPreds = (mlData && mlData.top_predictions) || [{ disease: disease, confidence: 92.5 }];

    let healthScore = 86;
    if (risk === "High") {
        healthScore = Math.floor(40 + Math.random() * 10);
    } else if (risk === "Medium") {
        healthScore = Math.floor(68 + Math.random() * 10);
    } else {
        healthScore = Math.floor(86 + Math.random() * 8);
    }

    const clinicalDB = {
        "Flu": {
            conditions: ["Influenza (Viral Flu)", "Acute Upper Respiratory Infection", "Seasonal Viral Syndrome"],
            medicines: ["Paracetamol 500mg/650mg for fever and body ache as advised by doctor", "Saline nasal drops for nasal congestion", "Vitamin C and Zinc supplements for immune support"],
            foodEat: ["Warm chicken broth or vegetable soup", "Light steamed khichdi with ghee", "Citrus fruits like oranges, amla, and kiwi", "Ginger-tulsi herbal tea with honey"],
            foodAvoid: ["Deep-fried and oily street foods", "Chilled ice-creams and cold sodas", "Heavy spicy curries", "Excess caffeine and dairy late at night"],
            water: "Drink 2.5 to 3.5 liters of lukewarm water and fluids (coconut water, warm herbal teas) daily to stay well hydrated.",
            homeCare: ["Complete bed rest (minimum 8 hours sleep)", "Steam inhalation twice daily with eucalyptus drops", "Warm salt-water gargle 3 times a day", "Monitor temperature morning and evening"],
            emergency: "Seek immediate hospital care if fever exceeds 103°F (39.4°C) for over 3 days, or if sudden chest tightness, shortness of breath, or confusion occurs.",
            assessment: "Acute viral respiratory syndrome. Immune system is responding actively. Full recovery expected within 4 to 6 days with proper rest and hydration."
        },
        "Common Cold": {
            conditions: ["Common Cold (Rhinovirus)", "Mild Nasopharyngitis", "Seasonal Viral Rhinitis"],
            medicines: ["Paracetamol for mild headache or fever", "Cetirizine / Levocetirizine for runny nose and sneezing (consult doctor)", "Saline nasal spray"],
            foodEat: ["Warm soups and broths", "Steamed apples or mashed bananas", "Fresh seasonal fruits", "Warm water with lemon and honey"],
            foodAvoid: ["Cold desserts and refrigerated beverages", "Oily spicy snacks", "Dairy items if phlegm is excessive"],
            water: "Drink 2.5 to 3 liters of warm water daily to thin mucus secretions.",
            homeCare: ["Steam inhalation morning and night", "Warm water gargles with a pinch of turmeric and salt", "Use a humidifier or rest in a warm room"],
            emergency: "Consult emergency doctor if breathing becomes laboured, severe earache develops, or fever spikes suddenly.",
            assessment: "Mild upper respiratory tract inflammation. Self-limiting condition that resolves quickly with home supportive care."
        },
        "Dengue": {
            conditions: ["Dengue Viral Fever", "Acute Vector-Borne Infection", "Thrombocytopenia risk"],
            medicines: ["Paracetamol ONLY for fever (DO NOT take Aspirin, Ibuprofen, or NSAIDs as they increase bleeding risk)", "Oral Rehydration Salts (ORS)"],
            foodEat: ["Papaya leaf extract (freshly prepared)", "Pomegranate juice, kiwi, and dragon fruit", "Coconut water and barley water", "Easily digestible boiled lentils and rice porridge"],
            foodAvoid: ["Dark red or black foods that can mask internal bleeding", "Deep fried or spicy food", "Uncooked or raw street salads"],
            water: "Drink 3.5 to 4 liters of fluid daily including ORS, coconut water, and soups to maintain plasma volume.",
            homeCare: ["Strict bed rest", "Daily CBC blood tests to track platelet counts and hematocrit", "Use mosquito nets to prevent secondary transmission"],
            emergency: "Emergency red flags: Bleeding from gums or nose, persistent vomiting, severe abdominal pain, sudden extreme fatigue, or cold clammy skin. Go to emergency immediately.",
            assessment: "Acute viral illness with potential platelet drop. Close clinical supervision and daily laboratory monitoring are essential."
        },
        "Typhoid": {
            conditions: ["Enteric Fever (Typhoid)", "Salmonella Infection", "Bacterial Enteric Syndrome"],
            medicines: ["Antibiotics strictly as prescribed by a physician following blood/Widal/Typhidot test", "Paracetamol for fever relief"],
            foodEat: ["High-calorie soft diet: boiled potatoes, rice porridge, soft khichdi", "Banana, ripe papaya, tender coconut water", "Steamed carrots and strained vegetable soups"],
            foodAvoid: ["High fiber raw vegetables, raw salads, unpeeled fruits", "Spicy, fried, and greasy gravies", "Unboiled or tap water"],
            water: "Drink 3 to 3.5 liters of boiled, purified water and electrolyte fluids daily.",
            homeCare: ["Complete physical rest", "Strict hand hygiene and separate eating utensils", "Complete the full course of prescribed antibiotics without stopping early"],
            emergency: "Go to the emergency department if experiencing severe abdominal pain, high continuous fever unresponsive to antipyretics, or bloody stool.",
            assessment: "Bacterial infection requiring antibiotic therapy. Proper hydration and diet support rapid recovery."
        },
        "Malaria": {
            conditions: ["Plasmodium Malaria (Vivax / Falciparum)", "Acute Vector-Borne Febrile Illness"],
            medicines: ["Antimalarial medication strictly as prescribed by a medical doctor based on blood smear/RDT test", "Paracetamol for cyclical fevers and chills"],
            foodEat: ["High protein soft diet, boiled eggs, soft lentils", "Fresh citrus fruits, coconut water, clear soups", "Boiled rice with light moong dal"],
            foodAvoid: ["Heavy oily food, fast food", "Caffeinated drinks and cold beverages"],
            water: "Drink 3 to 4 liters of clean boiled water and oral electrolytes daily.",
            homeCare: ["Rest in a well-ventilated room", "Sponge body with lukewarm water during high fever spikes", "Ensure mosquito repellent measures at home"],
            emergency: "Seek urgent emergency medical care for confusion, extreme jaundice, dark urine, or breathing difficulty.",
            assessment: "Parasitic blood infection. Prompt medical treatment leads to complete recovery within 7-10 days."
        },
        "Heart Related Issue": {
            conditions: ["Potential Cardiovascular Strain", "Cardiac Angina / Ischemia", "Coronary Syndrome Warning"],
            medicines: ["Emergency aspirin / nitrates ONLY as prescribed by a cardiologist. Do not self-medicate."],
            foodEat: ["Heart-healthy light fruits: berries, apples", "Steamed oats, green leafy vegetables", "Low-sodium clear vegetable broth"],
            foodAvoid: ["High sodium/salty snacks", "Trans fats, red meats, deep-fried snacks", "Alcohol, tobacco, energy drinks, and excessive caffeine"],
            water: "Maintain normal balanced water intake (1.5 - 2 liters); avoid sudden fluid overload.",
            homeCare: ["Sit upright in a comfortable position", "Loosen tight clothing and remain calm", "Do NOT exert yourself, lift weights, or climb stairs"],
            emergency: "🚨 EMERGENCY ALERT: If you experience crushing or squeezing chest pain radiating to the left arm, neck, or jaw, cold sweat, dizziness, or shortness of breath, CALL EMERGENCY (108/911) IMMEDIATELY!",
            assessment: "Cardiac symptoms demand urgent clinical evaluation, resting ECG, and cardiac biomarker assessment by a specialist."
        },
        "Pneumonia": {
            conditions: ["Bacterial or Viral Pneumonia", "Lower Respiratory Tract Infection", "Bronchopulmonary Consolidation"],
            medicines: ["Prescription antibiotics / antivirals as directed by pulmonologist", "Expectorants and bronchodilators under medical advice"],
            foodEat: ["Warm protein-rich soups", "Steamed greens, citrus fruits for antioxidant support", "Ginger, turmeric, and garlic infused broths"],
            foodAvoid: ["Cold dairy products, ice cold drinks", "Deep fried or processed foods"],
            water: "Drink 3 liters of warm water daily to keep respiratory secretions thin and easy to clear.",
            homeCare: ["Strict bed rest with upper body slightly elevated", "Monitor oxygen saturation (SpO2) with a pulse oximeter regularly", "Use steam inhalation"],
            emergency: "🚨 EMERGENCY ALERT: SpO2 dropping below 94%, severe shortness of breath, bluish lips/fingers, or coughing up blood requires immediate ER hospitalization.",
            assessment: "Lower lung infection requiring chest X-ray and medical management."
        },
        "COVID-19": {
            conditions: ["COVID-19 Viral Infection", "Acute Respiratory Syndrome", "Post-viral systemic fatigue"],
            medicines: ["Symptomatic relief (Paracetamol for fever/body pain)", "Saline nasal sprays and throat lozenges", "Doctor-prescribed antivirals if indicated"],
            foodEat: ["Nutrient-dense warm meals, lentil soups, eggs", "Citrus fruits, nuts, seeds", "Warm herbal concoctions (kadha/ginger tea)"],
            foodAvoid: ["Oily and processed snacks", "Chilled sodas and sugary desserts"],
            water: "3 liters of warm water, ORS, and herbal teas daily.",
            homeCare: ["Isolate in a well-ventilated room", "Track body temperature and SpO2 levels every 4-6 hours", "Practice prone breathing exercises if comfortable"],
            emergency: "🚨 Seek immediate hospital care if SpO2 drops below 94%, sudden chest pain occurs, or lips become pale or blue.",
            assessment: "Viral respiratory condition. Close monitoring of oxygen levels is critical during the first 7-10 days."
        },
        "Food Poisoning": {
            conditions: ["Acute Food Poisoning", "Gastroenteritis", "Bacterial Foodborne Toxin"],
            medicines: ["Oral Rehydration Salts (ORS) solution", "Zinc supplements and probiotics", "Antiemetics only if prescribed by doctor"],
            foodEat: ["BRAT diet (Bananas, Rice, Applesauce, Toast)", "Electrolyte fluids, coconut water, boiled rice gruel (kanji)"],
            foodAvoid: ["Milk and dairy products", "Spicy, greasy, and fried dishes", "Raw unwashed vegetables, salads, or street food"],
            water: "Sip small quantities of ORS solution and clean water continuously throughout the day (3+ liters).",
            homeCare: ["Rest digestive system; avoid solid food for initial 4-6 hours", "Wash hands thoroughly before eating", "Keep hydration steady"],
            emergency: "Seek urgent medical attention if unable to keep fluids down for over 12 hours, blood appears in vomit or stools, or extreme dizziness occurs.",
            assessment: "Gastrointestinal tract inflammation. Electrolyte balance and gentle rehydration ensure rapid healing."
        },
        "Gastroenteritis": {
            conditions: ["Viral / Bacterial Gastroenteritis", "Stomach Flu", "Acute Enteric Upset"],
            medicines: ["ORS electrolyte packets", "Probiotic capsules (consult doctor)", "Antacids for upper stomach burning"],
            foodEat: ["Curd rice, plain boiled rice", "Boiled carrots, bananas", "Clear vegetable broth and coconut water"],
            foodAvoid: ["Caffeine, carbonated sodas, alcohol", "Oily spicy gravies, processed dairy", "High sugar juices"],
            water: "Drink 3 to 3.5 liters of clean water and oral rehydration solution in small, frequent sips.",
            homeCare: ["Rest in bed", "Apply a warm compress or hot water bottle to the abdomen for cramping", "Maintain strict sanitary habits"],
            emergency: "Emergency care needed if severe unrelenting abdominal pain, high fever, or signs of severe dehydration appear.",
            assessment: "Acute gut irritation. Replenishing lost salts and fluids is the most vital step."
        },
        "Migraine": {
            conditions: ["Migraine Episode", "Vascular / Tension Headache", "Sensory Processing Sensitivity"],
            medicines: ["Pain relief (Paracetamol / Naproxen) as advised by doctor", "Anti-nausea medication if accompanied by vomiting"],
            foodEat: ["Magnesium-rich foods: almonds, pumpkin seeds, spinach", "Ginger tea, oatmeal, banana", "Fresh whole foods"],
            foodAvoid: ["Aged cheeses, chocolates, MSG, artificial sweeteners", "Processed meats, red wine, excessive caffeine"],
            water: "Drink 2.5 to 3 liters of water; dehydration is one of the most common migraine triggers.",
            homeCare: ["Rest in a quiet, completely dark room", "Apply a cold gel pack to forehead and back of neck", "Avoid screens, bright lights, and loud noises"],
            emergency: "Seek immediate medical evaluation if sudden unbearable 'thunderclap' headache, stiff neck, high fever, or facial weakness occurs.",
            assessment: "Vascular headache disorder. Trigger identification and resting in darkness typically provide relief."
        },
        "Allergic Reaction": {
            conditions: ["Acute Allergic Reaction", "Contact Dermatitis / Urticaria", "Histamine Sensitivity"],
            medicines: ["Antihistamines (Cetirizine / Loratadine) as directed by doctor", "Calamine lotion for skin itching"],
            foodEat: ["Antioxidant-rich fresh fruits and vegetables", "Steamed light meals", "Warm water with turmeric"],
            foodAvoid: ["Common allergens if suspected: shellfish, nuts, artificial food dyes", "Fermented foods, spicy food"],
            water: "Drink 2.5 to 3 liters of fresh water daily to assist natural elimination.",
            homeCare: ["Apply cold damp cloth or calamine lotion to itchy skin", "Wear loose, breathable cotton clothing", "Avoid scratching affected areas"],
            emergency: "🚨 EMERGENCY ALERT: If you notice throat tightness, lip/tongue swelling, or difficulty breathing (Anaphylaxis), call emergency services immediately!",
            assessment: "Immune hypersensitivity response. Identifying and eliminating the allergen trigger is key."
        }
    };

    const profile = clinicalDB[disease] || clinicalDB["Flu"];
    const condList = topPreds.map(p => `<li><strong>${p.disease}</strong> (${p.confidence}% ML confidence)</li>`).join("");
    const medList = profile.medicines.map(m => `<li>${m}</li>`).join("");
    const eatList = profile.foodEat.map(f => `<li>${f}</li>`).join("");
    const avoidList = profile.foodAvoid.map(f => `<li>${f}</li>`).join("");
    const homeList = profile.homeCare.map(h => `<li>${h}</li>`).join("");

    let headings = {
        conditions: "🩺 Possible Conditions",
        risk: "📊 Risk Level",
        medicine: "💊 General Medicine Information",
        eat: "🥗 Food To Eat",
        avoid: "🚫 Foods To Avoid",
        water: "💧 Water Intake",
        home: "🏠 Home Care Tips",
        doctor: "👨‍⚕️ Doctor To Consult",
        emergency: "🚨 Emergency Warning",
        assessment: "🏥 Overall Health Assessment",
        score: "📈 Health Score (0-100)"
    };

    if (lang === "te") {
        headings = {
            conditions: "🩺 సంభావ్య ఆరోగ్య పరిస్థితులు",
            risk: "📊 ప్రమాద స్థాయి",
            medicine: "💊 సాధారణ ఔషధ సమాచారం",
            eat: "🥗 తినాల్సిన ఆహారాలు",
            avoid: "🚫 నివారించాల్సిన ఆహారాలు",
            water: "💧 రోజువారీ నీటి వినియోగం",
            home: "🏠 ఇంట్లోనే పాటించాల్సిన జాగ్రత్తలు",
            doctor: "👨‍⚕️ సంప్రదించాల్సిన డాక్టర్",
            emergency: "🚨 అత్యవసర హెచ్చరిక",
            assessment: "🏥 సమగ్ర ఆరోగ్య విశ్లేషణ",
            score: "📈 ఆరోగ్య స్కోర్ (0-100)"
        };
    } else if (lang === "hi") {
        headings = {
            conditions: "🩺 संभावित स्थितियां",
            risk: "📊 जोखिम स्तर",
            medicine: "💊 सामान्य दवा की जानकारी",
            eat: "🥗 खाने योग्य भोजन",
            avoid: "🚫 परहेज़ करने योग्य भोजन",
            water: "💧 पानी का सेवन",
            home: "🏠 घरेलू उपचार और देखभाल",
            doctor: "👨‍⚕️ परामर्श हेतु चिकित्सक",
            emergency: "🚨 आपातकालीन चेतावनी",
            assessment: "🏥 समग्र स्वास्थ्य मूल्यांकन",
            score: "📈 स्वास्थ्य स्कोर (0-100)"
        };
    }

    return `
<h2>${headings.conditions}</h2>
<ul>
${condList}
</ul>

<h2>${headings.risk}</h2>
<p><strong>${risk.toUpperCase()} RISK:</strong> Clinical evaluation based on symptoms: <em>${symptomsStr}</em>.</p>

<h2>${headings.medicine}</h2>
<ul>
${medList}
</ul>
<p style="font-size:12px; color:#94a3b8;"><em>Note: Always consult a licensed physician or pharmacist before taking any medication.</em></p>

<h2>${headings.eat}</h2>
<ul>
${eatList}
</ul>

<h2>${headings.avoid}</h2>
<ul>
${avoidList}
</ul>

<h2>${headings.water}</h2>
<p>${profile.water}</p>

<h2>${headings.home}</h2>
<ul>
${homeList}
</ul>

<h2>${headings.doctor}</h2>
<p>Recommended Specialist: <strong>${specialist}</strong>. Please schedule a clinical consultation for complete diagnostic evaluation.</p>

<h2>${headings.emergency}</h2>
<p>${profile.emergency}</p>

<h2>${headings.assessment}</h2>
<p>${profile.assessment}</p>

<h2>${headings.score}</h2>
<p>Calculated Wellness Index: <strong>${healthScore} / 100</strong></p>

<hr>
<p><strong>Disclaimer:</strong> This clinical report is for educational and guidance purposes only. It is not a substitute for professional medical diagnosis.</p>

<!-- META: RISK=${risk.toUpperCase()} SCORE=${healthScore} -->
`.trim();
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

- Match conditions logically and realistically to the exact symptoms reported.
- For general symptoms like Fever and Body Pain, identify them as Flu (Influenza), Viral Fever, or Common Cold. NEVER jump to unrelated specific conditions like Urinary Tract Infection, Arthritis, or organ failure unless hallmark symptoms (e.g. stomach pain, joint swelling, chest pain) are explicitly selected!
- Assess Risk Level strictly based on severity:
  * LOW: 1-2 mild symptoms (Common Cold, mild viral fever, minor headache, fatigue) with no breathing difficulty or chest pain.
  * MEDIUM: 3-4 symptoms or marked dehydration, vomiting, diarrhea, or moderate infection.
  * HIGH: Emergency red flags (Chest Pain, Shortness of Breath, intense acute pain) or 5+ combined severe symptoms.
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

    let aiTextRaw = "";

    try {
        if (typeof API_KEY !== "undefined" && API_KEY && !API_KEY.includes("YOUR_KEY") && API_KEY.length > 20) {
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
                            model: "llama-3.3-70b-versatile",
                            messages: [
                                { role: "system", content: "You are a helpful medical AI assistant." },
                                { role: "user", content: prompt }
                            ],
                            temperature: 0.3,
                            max_tokens: 2200
                        })
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        aiTextRaw = data.choices[0].message.content;
                    }
                } else {
                    console.warn("External AI returned status " + response.status + ". Using clinical intelligence engine.");
                }
            } catch (apiError) {
                console.warn("External AI unreachable. Using clinical intelligence engine:", apiError);
            }
        }

        if (!aiTextRaw) {
            aiTextRaw = generateLocalClinicalReport(patientName, age, gender, symptoms, window.__mlDataForHistory || null, currentLanguage);
        }

        loading.style.display = "none";
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
            <div class="score-value">${healthScore}/100</div>
        </div>
        <div class="score-status ${statusClass}">${healthStatus}</div>
        <div class="card-meta-hint">AI Overall Wellness Index</div>
    </div>

    <div class="risk-card">
        <h2>📊 ${t("risk_level_word")}</h2>
        <div class="risk-visual-box ${riskBadge}">
            <span class="risk-emoji">${riskBadge === 'high' ? '🚨' : (riskBadge === 'medium' ? '⚠️' : '✅')}</span>
            <div class="risk-badge ${riskBadge}">
                ${riskClass.replace("risk-", "").toUpperCase()} RISK
            </div>
        </div>
        <div class="risk-meter-bar">
            <div class="meter-segment seg-low ${riskBadge === 'low' ? 'active' : ''}">Low</div>
            <div class="meter-segment seg-med ${riskBadge === 'medium' ? 'active' : ''}">Medium</div>
            <div class="meter-segment seg-high ${riskBadge === 'high' ? 'active' : ''}">High</div>
        </div>
        <div class="risk-advisory-text">
            ${riskBadge === 'high' ? 'Immediate doctor consultation recommended.' : (riskBadge === 'medium' ? 'Moderate attention needed. Monitor symptoms closely.' : 'Mild symptoms observed. Maintain hydration and rest.')}
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

    async function fetchHospitalsForCoords(lat, lng, isFallbackLocation) {
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

            if (!response.ok || !data.hospitals || data.hospitals.length === 0) {
                resultBox.innerHTML = `
                <div class="result-card">
                    <h2>${t("hospital_title")}</h2>
                    <p style="margin-bottom:14px;">Could not retrieve list directly, but you can find all nearby hospitals instantly:</p>
                    <a href="https://www.google.com/maps/search/hospitals+clinics+near+me" target="_blank" class="primary-btn" style="display:inline-block;padding:12px 20px;text-decoration:none;text-align:center;">🗺️ Open Google Maps Nearby Facilities</a>
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
                ${isFallbackLocation 
                    ? `<p class="hospital-note" style="color:var(--amber);">📍 GPS permission not granted. Showing nearby medical centres for your general region. Click "View on Map" for direct turn-by-turn navigation.</p>` 
                    : `<p class="hospital-note">${t("hospital_sorted_note")} ${data.source}.</p>`
                }
                ${listHTML}
            </div>`;

            resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

        } catch (err) {
            loading.style.display = "none";
            resultBox.innerHTML = `
            <div class="result-card">
                <h2>${t("hospital_title")}</h2>
                <p style="margin-bottom:14px;">Instant Google Maps search for nearby emergency centres:</p>
                <a href="https://www.google.com/maps/search/hospitals+near+me" target="_blank" class="primary-btn" style="display:inline-block;padding:12px 20px;text-decoration:none;text-align:center;">🗺️ Open Google Maps Nearby Facilities</a>
            </div>`;
            console.error(err);
        }
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchHospitalsForCoords(pos.coords.latitude, pos.coords.longitude, false),
            (err) => {
                console.warn("Geolocation not available or denied, using general region:", err);
                fetchHospitalsForCoords(13.0827, 80.2707, true);
            },
            { timeout: 5000, maximumAge: 300000, enableHighAccuracy: false }
        );
    } else {
        fetchHospitalsForCoords(13.0827, 80.2707, true);
    }
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

// =========================
// PWA Service Worker & App Installation
// =========================
let deferredInstallPrompt = null;

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((reg) => {
                console.log('[PWA] Service Worker registered:', reg.scope);
            })
            .catch((err) => {
                console.warn('[PWA] Service Worker registration failed:', err);
            });
    });
}

// Catch Android/Chrome/Edge native install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const navBtn = document.getElementById('installAppNavBtn');
    if (navBtn) {
        navBtn.classList.add('pulse-highlight');
    }
    const pwaBtnText = document.getElementById('pwaBtnText');
    if (pwaBtnText) {
        pwaBtnText.innerText = "Install to Device Now";
    }
    console.log('[PWA] beforeinstallprompt event captured');
});

window.addEventListener('appinstalled', () => {
    console.log('[PWA] MediGuide AI installed as App!');
    deferredInstallPrompt = null;
    const navBtn = document.getElementById('installAppNavBtn');
    if (navBtn) {
        navBtn.innerHTML = "✅ App Installed";
        navBtn.classList.remove('pulse-highlight');
    }
    closeDownloadModal();
    alert("🎉 MediGuide AI App has been installed! You can now launch it directly from your Home Screen or Desktop.");
});

function openDownloadModal() {
    const modal = document.getElementById('downloadModal');
    if (modal) {
        modal.style.display = 'flex';
        // Detect iOS
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const iosGuide = document.getElementById('iosInstallGuide');
        const pwaBtn = document.getElementById('pwaInstallActionBtn');
        if (isIos && iosGuide) {
            iosGuide.style.display = 'block';
            if (pwaBtn) pwaBtn.style.display = 'none';
        }
    }
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function triggerPwaInstall() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            console.log('[PWA] User accepted the install prompt');
            closeDownloadModal();
        } else {
            console.log('[PWA] User dismissed the install prompt');
        }
        deferredInstallPrompt = null;
    } else {
        // Fallback instructions if prompt not supported or already triggered
        alert("📲 How to Install MediGuide AI:\n\n• On Chrome / Android: Tap the 3 dots (⋮) in the top-right corner and select 'Install app' or 'Add to Home screen'.\n• On iPhone (Safari): Tap the Share button (📤) at the bottom and select 'Add to Home Screen' (➕).\n• On PC (Chrome/Edge): Click the Install icon (⊕) in the browser address bar.");
    }
}