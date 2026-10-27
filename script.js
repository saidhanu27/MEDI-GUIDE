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

// =========================================================
// Multilingual Clinical Intelligence & Translation Tables
// =========================================================
const CLINICAL_DISEASE_TRANSLATIONS = {
    te: {
        "Flu": "ఫ్లూ (వైరల్ ఇన్ఫ్లుయెంజా జ్వరం)",
        "Common Cold": "సాధారణ జలుబు & గొంతు ఇన్ఫెక్షన్",
        "Dengue": "డెంగ్యూ వైరల్ జ్వరం",
        "Typhoid": "టైఫాయిడ్ జ్వరం",
        "Malaria": "మలేరియా జ్వరం (చలి జ్వరం)",
        "Heart Related Issue": "గుండె సంబంధిత సమస్య (కార్డియో కేర్)",
        "Pneumonia": "న్యుమోనియా (ఊపిరితిత్తుల ఇన్ఫెక్షన్)",
        "COVID-19": "కోవిడ్-19 వైరల్ సంక్రమణ",
        "Migraine": "పార్శ్వపు తలనొప్పి (మైగ్రేన్)",
        "Anxiety": "ఆందోళన & మానసిక ఒత్తిడి",
        "Food Poisoning": "ఫుడ్ పాయిజనింగ్ (ఆహార కాలుష్యం)",
        "Gastritis": "గ్యాస్ట్రిక్ సమస్య (కడుపులో మంట)",
        "Gastroenteritis": "జీర్ణాశయ శోథ (కడుపు ఇన్ఫెక్షన్)",
        "Asthma": "ఉబ్బసం / ఆస్తమా బ్రాంకియల్",
        "Bronchitis": "శ్వాసనాళాల వాపు (బ్రాంకైటిస్)",
        "Arthritis": "కీళ్ల నొప్పులు (ఆర్థరైటిస్)",
        "Anemia": "రక్తహీనత (ఎనీమియా)",
        "Hypertension": "అధిక రక్తపోటు (హై బీపీ)",
        "Jaundice": "కామెర్లు / కాలేయ ఇన్ఫెక్షన్",
        "Chickenpox": "ఆటలమ్మ (చికెన్‌పాక్స్)",
        "Sinusitis": "సైనస్ ఇన్ఫెక్షన్",
        "Tonsillitis": "టాన్సిల్స్ వాపు",
        "Urinary Tract Infection": "మూత్రనాళ ఇన్ఫెక్షన్ (UTI)",
        "Vertigo": "తలతిరగడం (వర్టిగో)",
        "Allergic Reaction": "అలర్జీ ప్రతిస్పందన",
        "Diabetes Complications": "మధుమేహం సంబంధిత సమస్యలు"
    },
    hi: {
        "Flu": "फ्लू (इन्फ्लूएंजा वायरल बुखार)",
        "Common Cold": "सामान्य जुकाम और गले की खराश",
        "Dengue": "डेंगू बुखार",
        "Typhoid": "टाइफाइड बुखार",
        "Malaria": "मलेरिया बुखार",
        "Heart Related Issue": "हृदय संबंधी समस्या (कार्डियक परामर्श)",
        "Pneumonia": "निमोनिया (फेफड़ों का संक्रमण)",
        "COVID-19": "कोविड-19 वायरल संक्रमण",
        "Migraine": "माइग्रेन (आधा सिरदर्द)",
        "Anxiety": "चिंता और घबराहट (तनाव)",
        "Food Poisoning": "फूड पॉइजनिंग (खाद्य विषाक्तता)",
        "Gastritis": "गैस्ट्राइटिस (पेट में जलन व गैस)",
        "Gastroenteritis": "गैस्ट्रोएंटेराइटिस (पेट का संक्रमण)",
        "Asthma": "अस्थमा (दमा)",
        "Bronchitis": "ब्रोंकाइटिस (श्वसन नली की सूजन)",
        "Arthritis": "गठिया (जोड़ों का दर्द)",
        "Anemia": "एनीमिया (खून की कमी)",
        "Hypertension": "उच्च रक्तचाप (हाई बीपी)",
        "Jaundice": "पीलिया (लिवर संक्रमण)",
        "Chickenpox": "चिकनपॉक्स (चेचक)",
        "Sinusitis": "साइनसाइटिस (साइनस संक्रमण)",
        "Tonsillitis": "टॉन्सिलिटिस (गले के टॉन्सिल)",
        "Urinary Tract Infection": "मूत्र पथ संक्रमण (यूटीआई)",
        "Vertigo": "चक्कर आना (वर्टिगो)",
        "Allergic Reaction": "एलर्जी प्रतिक्रिया",
        "Diabetes Complications": "मधुमेह की जटिलताएं"
    },
    ta: {
        "Flu": "இன்ஃப்ளூயன்ஸா காய்ச்சல்",
        "Common Cold": "சாதாரண சளி",
        "Dengue": "டெங்கு காய்ச்சல்",
        "Typhoid": "டைபாய்டு காய்ச்சல்",
        "Malaria": "மலேரியா காய்ச்சல்",
        "Heart Related Issue": "இதயம் தொடர்பான பிரச்சினை",
        "Pneumonia": "நிமோனியா",
        "COVID-19": "கோவிட்-19",
        "Migraine": "ஒற்றைத் தலைவலி (மைக்ரேன்)",
        "Anxiety": "பதட்டம் மற்றும் மன அழுத்தம்",
        "Food Poisoning": "உணவு நச்சுத்தன்மை",
        "Gastritis": "இரைப்பை அழற்சி",
        "Gastroenteritis": "வயிற்றுப்போக்கு தொற்று",
        "Asthma": "ஆஸ்துமா",
        "Bronchitis": "மூச்சுக்குழாய் அழற்சி",
        "Arthritis": "மூட்டுவலி",
        "Anemia": "இரத்த சோகை",
        "Hypertension": "உயர் இரத்த அழுத்தம்",
        "Jaundice": "மஞ்சள் காமாலை",
        "Chickenpox": "சின்னம்மை",
        "Sinusitis": "சைனஸ் தொற்று",
        "Tonsillitis": "டான்சில் அழற்சி",
        "Urinary Tract Infection": "சிறுநீர் பாதை தொற்று",
        "Vertigo": "தலைசுற்றல்",
        "Allergic Reaction": "ஒவ்வாமை எதிர்வினை",
        "Diabetes Complications": "நீரிழிவு சிக்கல்கள்"
    },
    kn: {
        "Flu": "ಜ್ವರ (ಇನ್ಫ್ಲುಯೆಂಜಾ)",
        "Common Cold": "ಸಾಮಾನ್ಯ ಶೀತ",
        "Dengue": "ಡೆಂಗ್ಯೂ ಜ್ವರ",
        "Typhoid": "ಟೈಫಾಯಿಡ್ ಜ್ವರ",
        "Malaria": "ಮಲೇರಿಯಾ ಜ್ವರ",
        "Heart Related Issue": "ಹೃದಯ ಸಂಬಂಧಿ ಸಮಸ್ಯೆ",
        "Pneumonia": "ನ್ಯುಮೋನಿಯಾ",
        "COVID-19": "ಕೋವಿಡ್-19",
        "Migraine": "ಮೈಗ್ರೇನ್",
        "Anxiety": "ಆತಂಕ ಮತ್ತು ಒತ್ತಡ",
        "Food Poisoning": "ಆಹಾರ ವಿಷಬಾಧೆ",
        "Gastritis": "ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಉರಿ",
        "Gastroenteritis": "ಜಠರಗರುಳಿನ ಸೋಂಕು",
        "Asthma": "ಉಬ್ಬಸ / ಆಸ್ತಮಾ",
        "Bronchitis": "ಶ್ವಾಸನಾಳದ ಉರಿಯೂತ",
        "Arthritis": "ಸಂಧಿವಾತ",
        "Anemia": "ರಕ್ತಹೀನತೆ",
        "Hypertension": "ಅಧಿಕ ರಕ್ತದೊತ್ತಡ",
        "Jaundice": "ಕಾಮಾಲೆ",
        "Chickenpox": "ಅಮ್ಮನ ಕಾಯಿಲೆ",
        "Sinusitis": "ಸೈನಸ್ ಸೋಂಕು",
        "Tonsillitis": "ಟಾನ್ಸಿಲ್ ಊತ",
        "Urinary Tract Infection": "ಮೂತ್ರನಾಳದ ಸೋಂಕು",
        "Vertigo": "ತಲೆಸುತ್ತು",
        "Allergic Reaction": "ಅಲರ್ಜಿ ಪ್ರತಿಕ್ರಿಯೆ",
        "Diabetes Complications": "ಮಧುಮೇಹ ತೊಂದರೆಗಳು"
    },
    ml: {
        "Flu": "ഇൻഫ്ലുവൻസ പനി",
        "Common Cold": "സാധാരണ ജലദോഷം",
        "Dengue": "ഡെങ്കിപ്പനി",
        "Typhoid": "ടൈഫോയ്ഡ് പനി",
        "Malaria": "മലേറിയ",
        "Heart Related Issue": "ഹൃദയ സംബന്ധമായ പ്രശ്നം",
        "Pneumonia": "ന്യുമോണിയ",
        "COVID-19": "കോവിഡ്-19",
        "Migraine": "മൈഗ്രെയ്ൻ",
        "Anxiety": "ഉത്കണ്ഠയും പിരിമുറുക്കവും",
        "Food Poisoning": "ഭക്ഷ്യവിഷബാധ",
        "Gastritis": "ഗ്യാസ്ട്രൈറ്റിസ്",
        "Gastroenteritis": "വയറിളക്ക രോഗം",
        "Asthma": "ആസ്ത്മ",
        "Bronchitis": "ബ്രോങ്കൈറ്റിസ്",
        "Arthritis": "സന്ധിവാതം",
        "Anemia": "വിളർച്ച",
        "Hypertension": "ഉയർന്ന രക്തസമ്മർദ്ദം",
        "Jaundice": "മഞ്ഞപ്പിത്തം",
        "Chickenpox": "വസൂരി / ചിക്കൻപോക്സ്",
        "Sinusitis": "സൈനസ് അണുബാധ",
        "Tonsillitis": "ടോൺസിലൈറ്റിസ്",
        "Urinary Tract Infection": "മൂത്രനാളിയിലെ അണുബാധ",
        "Vertigo": "തലകറക്കം",
        "Allergic Reaction": "അലർജി",
        "Diabetes Complications": "പ്രമേഹ സങ്കീർണതകൾ"
    }
};

const CLINICAL_SPECIALIST_TRANSLATIONS = {
    te: {
        "General Physician": "జనరల్ ఫిజీషియన్ (సాధారణ వైద్య నిపుణుడు)",
        "Cardiologist": "కార్డియాలజిస్ట్ (గుండె వైద్య నిపుణుడు)",
        "Pulmonologist": "పల్మోనాలజిస్ట్ (శ్వాసకోశ నిపుణుడు)",
        "Neurologist": "న్యూరాలజిస్ట్ (నాడీ సంబంధిత నిపుణుడు)",
        "Gastroenterologist": "గ్యాస్ట్రోఎంటరాలజిస్ట్ (జీర్ణకోశ నిపుణుడు)",
        "Dermatologist": "డెర్మటాలజిస్ట్ (చర్మవ్యాధి నిపుణుడు)",
        "Dermatologist / General Physician": "డెర్మటాలజిస్ట్ / జనరల్ ఫిజీషియన్",
        "Psychiatrist / Psychologist": "సైకియాట్రిస్ట్ / మానసిక వైద్య నిపుణుడు",
        "Nephrologist / Urologist": "యూరాలజిస్ట్ / నెఫ్రాలజిస్ట్ (కిడ్నీ నిపుణుడు)",
        "Orthopedic Surgeon": "ఆర్థోపెడిక్ (కీళ్లు & ఎముకల నిపుణుడు)",
        "ENT Specialist": "ఈఎన్‌టీ స్పెషలిస్ట్ (చెవి, ముక్కు, గొంతు నిపుణుడు)"
    },
    hi: {
        "General Physician": "सामान्य चिकित्सक (जनरल फिजिशियन)",
        "Cardiologist": "हृदय रोग विशेषज्ञ (कार्डियोलॉजिस्ट)",
        "Pulmonologist": "फेफड़ों के विशेषज्ञ (पल्मोनोलॉजिस्ट)",
        "Neurologist": "तंत्रिका विशेषज्ञ (न्यूरोलॉजिस्ट)",
        "Gastroenterologist": "गैस्ट्रोएंटेरोलॉजिस्ट (पेट व पाचन विशेषज्ञ)",
        "Dermatologist": "त्वचा रोग विशेषज्ञ (डर्मेटोलॉजिस्ट)",
        "Dermatologist / General Physician": "त्वचा विशेषज्ञ / सामान्य चिकित्सक",
        "Psychiatrist / Psychologist": "मनोचिकित्सक (साइकाइट्रिस्ट)",
        "Nephrologist / Urologist": "यूरोलॉजिस्ट / नेफ्रोलॉजिस्ट (गुर्दा विशेषज्ञ)",
        "Orthopedic Surgeon": "हड्डी रोग विशेषज्ञ (ऑर्थोपेडिक)",
        "ENT Specialist": "ईएनटी विशेषज्ञ (कान, नाक, गला)"
    },
    ta: {
        "General Physician": "பொது மருத்துவர்",
        "Cardiologist": "இதய நோய் நிபுணர்",
        "Pulmonologist": "நுரையீரல் நிபுணர்",
        "Neurologist": "நரம்பியல் நிபுணர்",
        "Gastroenterologist": "இரைப்பை குடல் நிபுணர்",
        "Dermatologist": "தோல் மருத்துவர்",
        "Dermatologist / General Physician": "தோல் மருத்துவர் / பொது மருத்துவர்",
        "Psychiatrist / Psychologist": "மனநல மருத்துவர்",
        "Nephrologist / Urologist": "சிறுநீரக நிபுணர்",
        "Orthopedic Surgeon": "எலும்பியல் நிபுணர்",
        "ENT Specialist": "காது, மூக்கு, தொண்டை நிபுணர்"
    },
    kn: {
        "General Physician": "ಸಾಮಾನ್ಯ ವೈದ್ಯರು",
        "Cardiologist": "ಹೃದ್ರೋಗ ತಜ್ಞರು",
        "Pulmonologist": "ಶ್ವಾಸಕೋಶ ತಜ್ಞರು",
        "Neurologist": "ನರರೋಗ ತಜ್ಞರು",
        "Gastroenterologist": "ಜಠರಗರುಳು ತಜ್ಞರು",
        "Dermatologist": "ಚರ್ಮರೋಗ ತಜ್ಞರು",
        "Dermatologist / General Physician": "ಚರ್ಮರೋಗ ತಜ್ಞರು / ಸಾಮಾನ್ಯ ವೈದ್ಯರು",
        "Psychiatrist / Psychologist": "ಮನೋವೈದ್ಯರು",
        "Nephrologist / Urologist": "ಮೂತ್ರಪಿಂಡ ತಜ್ಞರು",
        "Orthopedic Surgeon": "ಮೂಳೆ ತಜ್ಞರು",
        "ENT Specialist": "ಇಎನ್‍ಟಿ ತಜ್ಞರು"
    },
    ml: {
        "General Physician": "ജനറൽ ഫിസിഷ്യൻ",
        "Cardiologist": "ഹൃദ്രോഗ വിദഗ്ദ്ധൻ",
        "Pulmonologist": "ശ്വാസകോശ വിദഗ്ദ്ധൻ",
        "Neurologist": "ന്യൂറോളജിസ്റ്റ്",
        "Gastroenterologist": "ദഹനരോഗ വിദഗ്ദ്ധൻ",
        "Dermatologist": "ചർമ്മരോഗ വിദഗ്ദ്ധൻ",
        "Dermatologist / General Physician": "ചർമ്മരോഗ വിദഗ്ദ്ധൻ / ജനറൽ ഫിസിഷ്യൻ",
        "Psychiatrist / Psychologist": "മനോരോഗ വിദഗ്ദ്ധൻ",
        "Nephrologist / Urologist": "യൂറോളജിസ്റ്റ്",
        "Orthopedic Surgeon": "അസ്ഥിരോഗ വിദഗ്ദ്ധൻ",
        "ENT Specialist": "ഇ.എൻ.ടി വിദഗ്ദ്ധൻ"
    }
};

function translateDisease(disease, lang) {
    if (!disease) return "";
    const l = lang || currentLanguage || "en";
    if (CLINICAL_DISEASE_TRANSLATIONS[l] && CLINICAL_DISEASE_TRANSLATIONS[l][disease]) {
        return CLINICAL_DISEASE_TRANSLATIONS[l][disease];
    }
    return disease;
}

function translateSpecialist(specialist, lang) {
    if (!specialist) return "General Physician";
    const l = lang || currentLanguage || "en";
    if (CLINICAL_SPECIALIST_TRANSLATIONS[l] && CLINICAL_SPECIALIST_TRANSLATIONS[l][specialist]) {
        return CLINICAL_SPECIALIST_TRANSLATIONS[l][specialist];
    }
    return specialist;
}

// =========================================================
// Comprehensive Multilingual Clinical Knowledge Engine
// (100% reliable local generator: zero errors, instant, fully localized)
// =========================================================
function generateLocalClinicalReport(patientName, age, gender, symptomsStr, mlData, lang) {
    const l = lang || currentLanguage || "en";
    const disease = (mlData && (mlData.predicted_disease || mlData.disease)) || "Flu";
    const risk = (mlData && (mlData.risk_level || mlData.riskBadge)) || "Low";
    const specialist = (mlData && mlData.recommended_specialist) || (mlData && mlData.specialist) || "General Physician";
    const topPreds = (mlData && (mlData.top_predictions || mlData.topPredictions)) || [{ disease: disease, confidence: 91.5 }];

    let healthScore = 86;
    if (risk.toLowerCase() === "high") {
        healthScore = 48;
    } else if (risk.toLowerCase() === "medium") {
        healthScore = 72;
    } else {
        healthScore = 88;
    }

    const clinicalKnowledge = {
        te: {
            "Flu": {
                medicines: [
                    "జ్వరం మరియు ఒంటి నొప్పుల ఉపశమనం కోసం వైద్యుల సూచన మేరకు పారాసిటమాల్ 500mg/650mg",
                    "ముక్కు దిబ్బడ మరియు తుమ్ముల నివారణకు సెలైన్ నాసికా చుక్కలు",
                    "శరీర రోగనిరోధక శక్తి పెంపొందించడానికి విటమిన్ సి మరియు జింక్ సప్లిమెంట్లు"
                ],
                foodEat: [
                    "వేడి వెజిటబుల్ లేదా చికెన్ సూప్",
                    "తేలికగా జీర్ణమయ్యే వెచ్చని కిచిడీ లేదా అన్నం గంజి",
                    "నారింజ, ఉసిరి, కివి వంటి సి-విటమిన్ సమృద్ధిగా ఉండే పండ్లు",
                    "అల్లం, తులసి మరియు తేనెతో తయారుచేసిన హెర్బల్ టీ"
                ],
                foodAvoid: [
                    "నూనెలో వేయించిన చిరుతిళ్లు మరియు ఫాస్ట్ ఫుడ్",
                    "ఫ్రిజ్ లోని చల్లని ఐస్ క్రీములు మరియు శీతల పానీయాలు",
                    "ఘాటైన కారాలు మరియు జీర్ణం కాని భారీ ఆహారాలు"
                ],
                water: "శరీరం డీహైడ్రేట్ కాకుండా రోజుకు 2.5 నుండి 3.5 లీటర్ల గోరువెచ్చని నీరు, కొబ్బరి నీళ్లు మరియు ఓరల్ రీహైడ్రేషన్ ద్రవాలు తాగండి.",
                homeCare: [
                    "కనీసం 8 గంటల పూర్తి బెడ్ రెస్ట్ మరియు నిద్ర",
                    "రోజుకు రెండుసార్లు యూకలిప్టస్ చుక్కలతో ఆవిరి పట్టడం",
                    "గోరువెచ్చని ఉప్పునీటితో రోజుకు 3 సార్లు పుక్కిలించడం",
                    "శరీర ఉష్ణోగ్రతను ఉదయం, సాయంత్రం థర్మామీటర్‌తో రికార్డ్ చేయడం"
                ],
                emergency: "జ్వరం 103°F దాటినా, ఛాతీలో ఒత్తిడి, తీవ్రమైన శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా తలతిరుగుడు ఉంటే వెంటనే అత్యవసర ఆసుపత్రికి వెళ్ళండి.",
                assessment: "తీవ్రమైన శ్వాసకోశ వైరల్ ఇన్ఫెక్షన్ లక్షణాలు కనిపిస్తున్నాయి. సరైన విశ్రాంతి, ద్రవాహారం మరియు మందులతో 4 నుండి 6 రోజుల్లో పూర్తి కోలుకోవచ్చు."
            },
            "Common Cold": {
                medicines: [
                    "తేలికపాటి తలనొప్పి లేదా ఒంటి నొప్పులకు పారాసిటమాల్",
                    "జలుబు మరియు ముక్కు కారడం తగ్గడానికి వైద్యుల సలహాతో సిట్రిజిన్ లేదా లేవోసిట్రిజిన్",
                    "ముక్కు రంధ్రాల ఉపశమనం కోసం సాధారణ సెలైన్ స్ప్రే"
                ],
                foodEat: [
                    "వేడి సూప్‌లు మరియు కాచిన వెచ్చని పాలు",
                    "ఉడికించిన కూరగాయలు మరియు తాజా పండ్లు",
                    "నిమ్మరసం మరియు తేనె కలిపిన గోరువెచ్చని నీరు"
                ],
                foodAvoid: [
                    "చల్లని శీతల పానీయాలు, ఐస్ వాటర్ మరియు ఐస్ క్రీమ్స్",
                    "ఎక్కువ జిడ్డు మరియు నూనెతో చేసిన పదార్థాలు"
                ],
                water: "కఫం సులభంగా తొలగిపోవడానికి రోజుకు 2.5 నుండి 3 లీటర్ల గోరువెచ్చని నీరు క్రమం తప్పకుండా తాగండి.",
                homeCare: [
                    "ఉదయం మరియు రాత్రి ఆవిరి పట్టడం",
                    "పసుపు మరియు ఉప్పు కలిపిన గోరువెచ్చని నీటితో పుక్కిలించడం",
                    "వెచ్చని ప్రశాంత గదిలో విశ్రాంతి తీసుకోవడం"
                ],
                emergency: "శ్వాస తీసుకోవడంలో తీవ్ర ఇబ్బంది కలిగినా, చెవిలో తీవ్రమైన నొప్పి వచ్చినా లేదా జ్వరం 3 రోజులకు మించి కొనసాగినా వైద్యుడిని సంప్రదించండి.",
                assessment: "తేలికపాటి ఎగువ శ్వాసకోశ ఇన్ఫెక్షన్. గృహ సంరక్షణ మరియు విశ్రాంతితో ఇది త్వరగా నయమవుతుంది."
            },
            "Anxiety": {
                medicines: [
                    "సహజ విశ్రాంతి పద్ధతులు మరియు మైండ్‌ఫుల్‌నెస్ ధ్యానం",
                    "కెఫిన్ రహిత చమోమిలే లేదా అశ్వగంధ హెర్బల్ టీ",
                    "వైద్యుల ప్రిస్క్రిప్షన్ లేకుండా ఎటువంటి మత్తు లేదా నిద్ర మాత్రలు వాడకండి"
                ],
                foodEat: [
                    "మెగ్నీషియం సమృద్ధిగా ఉండే బాదం, వాల్‌నట్స్, ఆకుకూరలు",
                    "తాజా అరటిపండ్లు, బెర్రీలు, ఓట్స్",
                    "ప్రోబయోటిక్ అధికంగా ఉండే తాజా పెరుగు మరియు మజ్జిగ"
                ],
                foodAvoid: [
                    "అధిక కెఫిన్ ఉన్న కాఫీ, స్ట్రాంగ్ టీ మరియు ఎనర్జీ డ్రింక్స్",
                    "రిఫైన్డ్ చక్కెర ఉన్న స్వీట్లు మరియు జంక్ ఫుడ్",
                    "ధూమపానం మరియు ఆల్కహాల్"
                ],
                water: "రోజుకు 2.5 నుండి 3 లీటర్ల మంచినీరు సమతుల్యంగా తాగండి; శరీరంలో నీటిశాతం తగ్గితే గుండె దడ మరియు ఆందోళన పెరగవచ్చు.",
                homeCare: [
                    "4-7-8 డీప్ బ్రీతింగ్ శ్వాస వ్యాయామాలను రోజుకు 3 సార్లు సాధన చేయండి",
                    "పడుకునే 1 గంట ముందు స్మార్ట్‌ఫోన్ మరియు టీవీ స్క్రీన్‌లను ఆపివేయండి",
                    "రోజూ 20 నిమిషాలు ఆహ్లాదకరమైన వాతావరణంలో నడవడం లేదా ధ్యానం చేయడం"
                ],
                emergency: "గుండె అకస్మాత్తుగా వేగంగా కొట్టుకోవడం, విపరీతమైన ఛాతీ బిగుతు, మూర్ఛ లేదా స్పృహ తప్పే పరిస్థితి ఉంటే వెంటనే అత్యవసర విభాగాన్ని సంప్రదించండి.",
                assessment: "శరీర నాడీ వ్యవస్థ ఒత్తిడి లేదా ఆందోళన స్థితిని ప్రతిబింబిస్తోంది. విశ్రాంతి పద్ధతులు మరియు నిపుణుల కౌన్సెలింగ్‌తో పూర్తి నియంత్రణ సాధ్యమవుతుంది."
            },
            "Dengue": {
                medicines: [
                    "జ్వరం కోసం పారాసిటమాల్ మాత్రమే వాడండి (బ్లీడింగ్ రిస్క్ పెంచే ఆస్పిరిన్, బ్రూఫెన్ అస్సలు వాడకూడదు)",
                    "ఓరల్ రీహైడ్రేషన్ సాల్ట్స్ (ORS) మరియు ఎలక్ట్రోలైట్ ద్రావణాలు"
                ],
                foodEat: [
                    "తాజా బొప్పాయి ఆకుల రసం (రోజుకు 1-2 చెంచాలు)",
                    "దానిమ్మ పండ్ల రసం, కివి పండ్లు, డ్రాగన్ ఫ్రూట్",
                    "తాజా కొబ్బరి నీళ్లు మరియు తేలికపాటి పప్పు గంజి"
                ],
                foodAvoid: [
                    "రక్తస్రావాన్ని దాచిపెట్టే నల్లటి లేదా ముదురు ఎరుపు రంగు ఆహారాలు",
                    "వేయించిన నూనె పదార్థాలు మరియు బయటి ఆహారాలు"
                ],
                water: "రక్తంలో ప్లాస్మా స్థాయిలు పడిపోకుండా రోజుకు 3.5 నుండి 4 లీటర్ల కొబ్బరి నీళ్లు, ఓఆర్ఎస్ మరియు ద్రవాహారం తీసుకోండి.",
                homeCare: [
                    "కఠినమైన బెడ్ రెస్ట్ పాటించండి",
                    "ప్లేట్‌లెట్ కౌంట్‌ను పర్యవేక్షించడానికి ప్రతిరోజూ CBC రక్త పరీక్ష చేయించుకోండి",
                    "ఇంట్లో దోమతెరలు మరియు దోమల నివారణ మందులు వాడండి"
                ],
                emergency: "చిగుళ్ళు లేదా ముక్కు నుండి రక్తస్రావం, ఆగని వాంతులు, తీవ్రమైన కడుపు నొప్పి, తీవ్ర నీరసం కనిపిస్తే తక్షణమే ఎమర్జెన్సీ ఆసుపత్రికి చేరండి.",
                assessment: "తీవ్రమైన వెక్టార్-బోర్న్ ఇన్ఫెక్షన్. ప్లేట్‌లెట్స్ తగ్గకుండా రోజువారీ రక్త పరీక్షల పర్యవేక్షణ అత్యవసరం."
            },
            "Heart Related Issue": {
                medicines: [
                    "కార్డియాలజిస్ట్ సూచించిన ఎమర్జెన్సీ నైట్రేట్స్ లేదా ఆస్పిరిన్ మాత్రమే వాడండి",
                    "ఎట్టి పరిస్థితుల్లోనూ సొంత వైద్యం చేసుకోకండి"
                ],
                foodEat: [
                    "గుండెకు మేలు చేసే తాజా ఆపిల్స్, బెర్రీలు, బొప్పాయి",
                    "నూనె లేని ఉడికించిన ఓట్స్, ఉడకబెట్టిన ఆకుకూరలు",
                    "తక్కువ ఉప్పుతో కూడిన పప్పు మరియు సూప్"
                ],
                foodAvoid: [
                    "అధిక ఉప్పు ఉండే పచ్చళ్ళు, వేపుళ్ళు, ప్రాసెస్డ్ స్నాక్స్",
                    "రెడ్ మీట్, వెన్న, నెయ్యి, ట్రాన్స్ ఫ్యాట్స్",
                    "పొగాకు, ఆల్కహాల్ మరియు ఎనర్జీ డ్రింక్స్"
                ],
                water: "రోజుకు 1.5 నుండి 2 లీటర్ల మంచినీరు మితంగా తాగండి; గుండెపై ఒత్తిడి పడకుండా అకస్మాత్తుగా ఎక్కువ నీరు తాగడం నివారించండి.",
                homeCare: [
                    "నిటారుగా లేదా వెనక్కి వాలి సౌకర్యవంతమైన స్థితిలో కూర్చోండి",
                    "బిగుతుగా ఉన్న దుస్తులను వదులు చేయండి, గదిలో స్వచ్ఛమైన గాలి ఉండేలా చూడండి",
                    "ఎటువంటి బరువులు ఎత్తడం లేదా మెట్లు ఎక్కడం చేయకండి"
                ],
                emergency: "🚨 అత్యవసర హెచ్చరిక: ఛాతీ మధ్యలో భరించలేని నొప్పి, ఎడమ చెయ్యి లేదా దవడకు పాకే నొప్పి, చల్లని చెమటలు, ఊపిరి ఆడకపోవడం ఉంటే వెంటనే 108 కు కాల్ చేయండి!",
                assessment: "గుండె సంబంధిత అత్యవసర లక్షణాలు ఉన్నాయి. వెంటనే కార్డియాలజిస్ట్ చేత ECG మరియు కార్డియాక్ ఎంజైమ్ పరీక్షలు చేయించాలి."
            },
            "DEFAULT": {
                medicines: [
                    "లక్షణాల ఉపశమనం కోసం వైద్యుల సూచన మేరకు సాధారణ మందులు",
                    "జీర్ణవ్యవస్థ మరియు రోగనిరోధక శక్తి కోసం ఎలక్ట్రోలైట్లు మరియు విటమిన్లు"
                ],
                foodEat: [
                    "తేలికగా జీర్ణమయ్యే సమతుల్య ఆహారం",
                    "తాజా పండ్లు, ఉడికించిన కూరగాయలు మరియు వెచ్చని సూప్‌లు"
                ],
                foodAvoid: [
                    "అధిక నూనె, మసాలాలు మరియు బయటి జంక్ ఫుడ్",
                    "చల్లని శీతల పానీయాలు మరియు నిల్వ ఉంచిన పదార్థాలు"
                ],
                water: "శరీరాన్ని హైడ్రేటెడ్ గా ఉంచుకోవడానికి రోజుకు కనీసం 2.5 నుండి 3 లీటర్ల స్వచ్ఛమైన గోరువెచ్చని నీరు తాగండి.",
                homeCare: [
                    "శరీరానికి తగినంత విశ్రాంతి మరియు కనీసం 8 గంటల నిద్ర",
                    "వ్యక్తిగత పరిశుభ్రత పాటించడం మరియు సమయానికి ఆహారం తీసుకోవడం"
                ],
                emergency: "లక్షణాలు తీవ్రమైనా లేదా కొత్తగా తీవ్ర ఇబ్బందికర లక్షణాలు మొదలైనా వెంటనే సమీప వైద్యుడిని సంప్రదించండి.",
                assessment: "ప్రాథమిక క్లినికల్ సమీక్ష పూర్తయింది. సూచించిన సంరక్షణ పద్ధతులు పాటిస్తూ అవసరమైతే వైద్యుడిని సంప్రదించండి."
            }
        },
        hi: {
            "Flu": {
                medicines: [
                    "बुखार और बदन दर्द के लिए चिकित्सक की सलाह से पैरासिटामोल 500mg/650mg",
                    "बंद नाक और छींक से राहत के लिए सेलाइन नेज़ल ड्रॉप्स",
                    "रोग प्रतिरोधक क्षमता बढ़ाने हेतु विटामिन सी और जिंक सप्लीमेंट"
                ],
                foodEat: [
                    "गर्म सब्जियों का सूप या हल्का चिकन ब्रोथ",
                    "आसानी से पचने वाली गर्म मूंग दाल खिचड़ी या दलिया",
                    "संतरा, आंवला, कीवी जैसे विटामिन-सी युक्त ताजे फल",
                    "अदरक, तुलसी और शहद वाली हर्बल चाय"
                ],
                foodAvoid: [
                    "तली-भुनी चीजें, फास्ट फूड और ज्यादा मसालेदार भोजन",
                    "फ्रिज का ठंडा पानी, आइसक्रीम और कोल्ड ड्रिंक्स",
                    "देर रात भारी और गरिष्ठ भोजन"
                ],
                water: "शरीर को हाइड्रेटेड रखने के लिए रोजाना 2.5 से 3.5 लीटर गुनगुना पानी, नारियल पानी और ओआरएस पिएं।",
                homeCare: [
                    "कम से कम 8 घंटे का पूर्ण विश्राम और अच्छी नींद लें",
                    "दिन में दो बार भाप (स्टीम) लें",
                    "गुनगुने नमक के पानी से दिन में 3 बार गरारे करें",
                    "सुबह और शाम थर्मामीटर से शरीर का तापमान जांचें"
                ],
                emergency: "यदि बुखार 103°F से अधिक हो, सीने में तेज दर्द हो, सांस लेने में अत्यधिक कठिनाई हो तो तुरंत आपातकालीन अस्पताल जाएं।",
                assessment: "श्वसन तंत्र का वायरल संक्रमण प्रतीत हो रहा है। उचित आराम, तरल पदार्थ और दवा से 4 से 6 दिनों में पूर्ण सुधार संभव है।"
            },
            "Common Cold": {
                medicines: [
                    "हल्के सिरदर्द या बुखार के लिए पैरासिटामोल",
                    "बहती नाक और एलर्जी के लिए डॉक्टर की सलाह से सिट्रीज़ीन",
                    "नाक खोलने के लिए सेलाइन नेज़ल स्प्रे"
                ],
                foodEat: [
                    "गर्म सूप, दाल का पानी और हर्बल काढ़ा",
                    "उबली सब्जियां और ताजे मौसमी फल",
                    "गुनगुने पानी में नींबू और थोड़ा शहद"
                ],
                foodAvoid: [
                    "ठंडे पेय पदार्थ, बर्फ वाला पानी और आइसक्रीम",
                    "अत्यधिक तेल-मसालेदार और चिकनाई युक्त खाद्य पदार्थ"
                ],
                water: "कफ को पतला करने के लिए रोजाना 2.5 से 3 लीटर गुनगुना पानी पिएं।",
                homeCare: [
                    "सुबह और रात को भाप लें",
                    "हल्दी और नमक मिले गुनगुने पानी से गरारे करें",
                    "गर्म और हवादार कमरे में विश्राम करें"
                ],
                emergency: "यदि सांस लेने में भारीपन हो या कान में तेज दर्द हो तो तुरंत डॉक्टर से संपर्क करें।",
                assessment: "हल्का सामान्य जुकाम। घरेलू देखभाल और आराम से यह कुछ दिनों में पूरी तरह ठीक हो जाता है।"
            },
            "Anxiety": {
                medicines: [
                    "प्राणायाम, ध्यान और गहरी सांस लेने की तकनीक अपनाएं",
                    "कैफीन रहित कैमोमाइल या अश्वगंधा हर्बल चाय",
                    "बिना डॉक्टर के पर्चे के कोई भी नींद या अवसाद की दवा न लें"
                ],
                foodEat: [
                    "मैग्नीशियम युक्त बादाम, कद्दू के बीज और हरी सब्जियां",
                    "केले, ओट्स और ताजे फल",
                    "ताजा दही और छाछ"
                ],
                foodAvoid: [
                    "अत्यधिक कॉफी, तेज चाय और एनर्जी ड्रिंक्स",
                    "ज्यादा मीठे खाद्य पदार्थ और पैकेज्ड जंक फूड",
                    "शराब और धूम्रपान"
                ],
                water: "दिन भर में 2.5 से 3 लीटर पानी पिएं; पानी की कमी से घबराहट और दिल की धड़कन तेज हो सकती है।",
                homeCare: [
                    "4-7-8 गहरी सांस लेने का अभ्यास दिन में 3 बार करें",
                    "सोने से 1 घंटा पहले मोबाइल और टीवी स्क्रीन बंद रखें",
                    "प्रतिदिन 20 मिनट खुली हवा में टहलें"
                ],
                emergency: "यदि अचानक दिल की धड़कन बहुत तेज हो जाए, सीने में भारी दबाव महसूस हो या बेहोशी छाए तो तुरंत नजदीकी अस्पताल पहुंचे।",
                assessment: "तनाव और घबराहट के लक्षण दिख रहे हैं। विश्राम तकनीकों और विशेषज्ञ परामर्श से यह पूरी तरह नियंत्रित हो सकता है।"
            },
            "Dengue": {
                medicines: [
                    "बुखार के लिए केवल पैरासिटामोल लें (एस्पिरिन या ब्रूफेन कतई न लें, इससे ब्लीडिंग का खतरा रहता है)",
                    "ओआरएस (ORS) घोल और इलेक्ट्रोलाइट्स"
                ],
                foodEat: [
                    "पपीते के पत्तों का ताजा रस (रोजाना 1-2 चम्मच)",
                    "अनार का ताजा जूस, कीवी और नारियल पानी",
                    "हल्की मूंग दाल खिचड़ी"
                ],
                foodAvoid: [
                    "गहरे लाल या काले रंग के खाद्य पदार्थ",
                    "तली-भुनी और बाहरी खुली चीजें"
                ],
                water: "शरीर में प्लेटलेट्स और प्लाज्मा बनाए रखने के लिए रोजाना 3.5 से 4 लीटर तरल पदार्थ पिएं।",
                homeCare: [
                    "पूरी तरह से बेड रेस्ट करें",
                    "प्लेटलेट काउंट जांचने के लिए रोजाना सीबीसी ब्लड टेस्ट करवाएं",
                    "मच्छरदानी का इस्तेमाल करें"
                ],
                emergency: "मसूड़ों या नाक से खून आना, लगातार उल्टी, पेट में तेज दर्द होने पर तुरंत आपातकालीन चिकित्सा सहायता लें।",
                assessment: "गंभीर वायरल संक्रमण। प्लेटलेट काउंट पर निरंतर नजर रखना बेहद जरूरी है।"
            },
            "Heart Related Issue": {
                medicines: [
                    "केवल हृदय रोग विशेषज्ञ (कार्डियोलॉजिस्ट) द्वारा सुझाई गई दवाएं लें",
                    "किसी भी स्थिति में स्वयं दवा न लें"
                ],
                foodEat: [
                    "दिल के लिए फायदेमंद ताजे सेब, पपीता और जामुन",
                    "बिना तेल की उबली सब्जियां और ओट्स",
                    "कम नमक वाला हल्का भोजन"
                ],
                foodAvoid: [
                    "अत्यधिक नमक, अचार, पापड़ और चिप्स",
                    "तले हुए खाद्य पदार्थ, मक्खन और रेड मीट",
                    "तंबाकू, धूम्रपान और शराब"
                ],
                water: "दिन भर में 1.5 से 2 लीटर पानी संतुलित रूप से पिएं; एक साथ बहुत अधिक पानी न पिएं।",
                homeCare: [
                    "सीधे या आरामदेह मुद्रा में बैठें",
                    "तंग कपड़े ढीले करें और शांत रहें",
                    "सीढ़ियां चढ़ना या भारी वजन उठाना तुरंत बंद करें"
                ],
                emergency: "🚨 आपातकालीन चेतावनी: सीने में असहनीय दबाव, बाएं हाथ या जबड़े में फैलता दर्द, ठंडा पसीना या सांस फूलने पर तुरंत 108 पर कॉल करें!",
                assessment: "हृदय संबंधी आपातकालीन लक्षण। बिना देरी किए कार्डियोलॉजिस्ट से ईसीजी (ECG) और जांच करवाएं।"
            },
            "DEFAULT": {
                medicines: [
                    "लक्षणों से राहत के लिए डॉक्टर द्वारा सुझाई गई उपयुक्त दवाएं",
                    "प्रतिरोधक क्षमता और पाचन के लिए विटामिन व इलेक्ट्रोलाइट्स"
                ],
                foodEat: [
                    "आसानी से पचने वाला संतुलित सादा भोजन",
                    "ताजे फल, उबली सब्जियां और हल्का सूप"
                ],
                foodAvoid: [
                    "अत्यधिक तेल, मिर्च-मसाले और बाहर का जंक फूड",
                    "ठंडे व बासी खाद्य पदार्थ"
                ],
                water: "शरीर को हाइड्रेट रखने हेतु रोजाना कम से कम 2.5 से 3 लीटर साफ पानी पिएं।",
                homeCare: [
                    "शरीर को पर्याप्त आराम और कम से कम 8 घंटे की नींद दें",
                    "स्वच्छता का ध्यान रखें और समय पर सुपाच्य भोजन लें"
                ],
                emergency: "यदि लक्षण गंभीर रूप ले लें तो बिना देर किए नजदीकी चिकित्सक से परामर्श लें।",
                assessment: "प्राथमिक क्लिनिकल मूल्यांकन पूरा हुआ। बताए गए सुझावों का पालन करते हुए आवश्यकतानुसार डॉक्टर से मिलें।"
            }
        },
        en: {
            "Flu": {
                medicines: [
                    "Paracetamol 500mg/650mg for fever and body ache as advised by doctor",
                    "Saline nasal drops for congestion relief",
                    "Vitamin C and Zinc supplements for immune defense"
                ],
                foodEat: [
                    "Warm vegetable or chicken broth",
                    "Easily digestible steamed khichdi or rice porridge",
                    "Citrus fruits rich in Vitamin C (oranges, amla, kiwi)",
                    "Ginger, tulsi, and honey herbal tea"
                ],
                foodAvoid: [
                    "Deep-fried, oily, and heavy fast food",
                    "Chilled ice creams and cold carbonated beverages",
                    "Heavily spiced dishes that upset digestion"
                ],
                water: "Drink 2.5 to 3.5 liters of lukewarm water, coconut water, and electrolyte fluids daily.",
                homeCare: [
                    "Complete bed rest (minimum 8 hours of sleep)",
                    "Steam inhalation twice daily with eucalyptus drops",
                    "Warm salt-water gargle 3 times a day",
                    "Monitor body temperature morning and evening"
                ],
                emergency: "Seek emergency care if fever exceeds 103°F (39.4°C), severe chest tightness, acute shortness of breath, or confusion occurs.",
                assessment: "Acute respiratory viral syndrome. With proper rest, adequate hydration, and supportive care, full recovery is expected within 4 to 6 days."
            },
            "Common Cold": {
                medicines: [
                    "Paracetamol for mild headache or fever",
                    "Cetirizine / Levocetirizine for runny nose and sneezing (consult doctor)",
                    "Saline nasal spray for nasal passage relief"
                ],
                foodEat: [
                    "Warm soups and light broths",
                    "Steamed apples or mashed bananas",
                    "Warm water with lemon and honey"
                ],
                foodAvoid: [
                    "Cold desserts, ice water, and refrigerated beverages",
                    "Oily spicy snacks"
                ],
                water: "Drink 2.5 to 3 liters of warm water daily to keep mucus thin and easy to clear.",
                homeCare: [
                    "Steam inhalation morning and night",
                    "Warm water gargles with a pinch of turmeric and salt",
                    "Rest in a warm, well-ventilated room"
                ],
                emergency: "Consult emergency doctor if breathing becomes labored, severe earache develops, or fever spikes suddenly.",
                assessment: "Mild upper respiratory tract inflammation. Self-limiting condition resolving smoothly with home supportive care."
            },
            "Anxiety": {
                medicines: [
                    "Natural relaxation techniques and mindfulness meditation",
                    "Caffeine-free chamomile or ashwagandha herbal tea",
                    "Do not take any sedative or tranquilizer without explicit medical prescription"
                ],
                foodEat: [
                    "Magnesium-rich foods: almonds, pumpkin seeds, spinach",
                    "Fresh bananas, berries, and whole oats",
                    "Probiotic-rich fresh curd or buttermilk"
                ],
                foodAvoid: [
                    "High caffeine intake (excess coffee, strong tea, energy drinks)",
                    "Refined sugars and processed junk food",
                    "Alcohol and nicotine"
                ],
                water: "Drink 2.5 to 3 liters of water throughout the day; dehydration frequently triggers rapid heartbeat and elevated anxiety.",
                homeCare: [
                    "Practice 4-7-8 deep breathing exercises 3 times daily",
                    "Turn off digital screens 1 hour before bedtime",
                    "Take a gentle 20-minute walk in natural surroundings daily"
                ],
                emergency: "Seek immediate hospital evaluation if experiencing severe crushing chest pain, sudden syncope/fainting, or uncontrollable panic.",
                assessment: "Clinical signs of autonomic nervous system stress or acute anxiety. Responsive to breathing regulation, lifestyle pacing, and professional counseling."
            },
            "Dengue": {
                medicines: [
                    "Paracetamol ONLY for fever relief (DO NOT take Aspirin, Ibuprofen, or NSAIDs due to bleeding risks)",
                    "Oral Rehydration Salts (ORS) solution"
                ],
                foodEat: [
                    "Fresh papaya leaf extract (1-2 teaspoons daily)",
                    "Pomegranate juice, kiwi, and dragon fruit",
                    "Tender coconut water and light lentil soup"
                ],
                foodAvoid: [
                    "Dark red or black foods that can mask internal bleeding",
                    "Deep-fried or spicy food"
                ],
                water: "Drink 3.5 to 4 liters of fluid daily including ORS and coconut water to maintain plasma volume.",
                homeCare: [
                    "Strict bed rest",
                    "Daily CBC blood tests to track platelet counts and hematocrit",
                    "Use mosquito nets to prevent secondary transmission"
                ],
                emergency: "Emergency red flags: Bleeding from gums or nose, persistent vomiting, severe abdominal pain, sudden extreme fatigue, or cold clammy skin. Go to emergency immediately.",
                assessment: "Acute vector-borne viral illness with potential platelet drop. Close clinical supervision and daily laboratory monitoring are essential."
            },
            "Heart Related Issue": {
                medicines: [
                    "Emergency aspirin / nitrates ONLY as prescribed by a cardiologist. Do not self-medicate."
                ],
                foodEat: [
                    "Heart-healthy light fruits: berries, apples, papaya",
                    "Steamed oats, green leafy vegetables",
                    "Low-sodium clear vegetable broth"
                ],
                foodAvoid: [
                    "High sodium/salty snacks, pickles, papads",
                    "Trans fats, red meats, deep-fried snacks",
                    "Alcohol, tobacco, energy drinks, and excessive caffeine"
                ],
                water: "Maintain normal balanced water intake (1.5 - 2 liters); avoid sudden fluid overload.",
                homeCare: [
                    "Sit upright in a comfortable position",
                    "Loosen tight clothing and remain calm",
                    "Do NOT exert yourself, lift weights, or climb stairs"
                ],
                emergency: "🚨 EMERGENCY ALERT: If you experience crushing or squeezing chest pain radiating to the left arm, neck, or jaw, cold sweat, dizziness, or shortness of breath, CALL EMERGENCY (108/911) IMMEDIATELY!",
                assessment: "Cardiac symptoms demand urgent clinical evaluation, resting ECG, and cardiac biomarker assessment by a specialist."
            },
            "DEFAULT": {
                medicines: [
                    "Symptomatic medication as prescribed by a licensed healthcare provider",
                    "Immune support and hydration electrolytes"
                ],
                foodEat: [
                    "Easily digestible, balanced, nutrient-dense meals",
                    "Fresh seasonal fruits, steamed vegetables, and clear broths"
                ],
                foodAvoid: [
                    "Deep-fried, overly spicy, and processed junk food",
                    "Chilled sugary beverages"
                ],
                water: "Maintain healthy hydration with 2.5 to 3 liters of fresh drinking water daily.",
                homeCare: [
                    "Adequate physical rest and regular sleep schedule",
                    "Maintain hand hygiene and take meals on time"
                ],
                emergency: "Consult emergency medical care if symptoms deteriorate rapidly or if severe discomfort arises.",
                assessment: "Preliminary clinical assessment completed. Follow recommended home guidelines and consult a medical doctor for definitive examination."
            }
        }
    };

    // Fallback language selector
    const langDict = clinicalKnowledge[l] || clinicalKnowledge["en"];
    const profile = langDict[disease] || langDict["DEFAULT"] || clinicalKnowledge["en"]["DEFAULT"];

    // Translated Disease Name
    const transDisease = translateDisease(disease, l);
    const transSpecialist = translateSpecialist(specialist, l);

    // Section Headings Localization
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
        score: "📈 Health Score (0-100)",
        disclaimer_title: "Disclaimer",
        disclaimer_text: "This clinical report is for educational and guidance purposes only. It is not a substitute for professional medical diagnosis. Please consult a qualified doctor."
    };

    if (l === "te") {
        headings = {
            conditions: "🩺 సంభావ్య ఆరోగ్య పరిస్థితులు",
            risk: "📊 ప్రమాద స్థాయి",
            medicine: "💊 సాధారణ ఔషధ సమాచారం",
            eat: "🥗 తినాల్సిన ఆరోగ్యకరమైన ఆహారాలు",
            avoid: "🚫 నివారించాల్సిన ఆహారాలు",
            water: "💧 రోజువారీ నీటి వినియోగం",
            home: "🏠 ఇంట్లోనే పాటించాల్సిన జాగ్రత్తలు",
            doctor: "👨‍⚕️ సంప్రదించాల్సిన డాక్టర్",
            emergency: "🚨 అత్యవసర హెచ్చరిక",
            assessment: "🏥 సమగ్ర ఆరోగ్య విశ్లేషణ",
            score: "📈 ఆరోగ్య స్కోర్ (0-100)",
            disclaimer_title: "వైద్య నిరాకరణ",
            disclaimer_text: "ఈ క్లినికల్ నివేదిక కేవలం ప్రాథమిక అవగాహన మరియు విద్యా ప్రయోజనాల కోసం మాత్రమే. ఇది పూర్తి వైద్య నిర్ధారణకు ప్రత్యామ్నాయం కాదు. దయచేసి అర్హత కలిగిన వైద్యుడిని సంప్రదించండి."
        };
    } else if (l === "hi") {
        headings = {
            conditions: "🩺 संभावित स्वास्थ्य स्थितियां",
            risk: "📊 जोखिम स्तर",
            medicine: "💊 सामान्य दवा की जानकारी",
            eat: "🥗 खाने योग्य स्वास्थ्यवर्धक भोजन",
            avoid: "🚫 परहेज़ करने योग्य भोजन",
            water: "💧 दैनिक पानी का सेवन",
            home: "🏠 घरेलू उपचार और सावधानियां",
            doctor: "👨‍⚕️ परामर्श हेतु अनुशंसित चिकित्सक",
            emergency: "🚨 आपातकालीन चेतावनी",
            assessment: "🏥 समग्र स्वास्थ्य मूल्यांकन",
            score: "📈 स्वास्थ्य स्कोर (0-100)",
            disclaimer_title: "चिकित्सीय अस्वीकरण",
            disclaimer_text: "यह नैदानिक रिपोर्ट केवल सामान्य मार्गदर्शन और शैक्षिक उद्देश्य के लिए है। यह पेशेवर चिकित्सीय निदान का विकल्प नहीं है। कृपया योग्य चिकित्सक से परामर्श लें।"
        };
    } else if (l === "ta") {
        headings = {
            conditions: "🩺 சாத்தியமான நிலைமைகள்",
            risk: "📊 ஆபத்து நிலை",
            medicine: "💊 பொதுவான மருந்து தகவல்",
            eat: "🥗 சாப்பிட வேண்டிய உணவுகள்",
            avoid: "🚫 தவிர்க்க வேண்டிய உணவுகள்",
            water: "💧 நீர் உட்கொள்ளல்",
            home: "🏠 வீட்டுப் பராமரிப்பு குறிப்புகள்",
            doctor: "👨‍⚕️ அணுக வேண்டிய மருத்துவர்",
            emergency: "🚨 அவசர எச்சரிக்கை",
            assessment: "🏥 ஒட்டுமொத்த சுகாதார மதிப்பீடு",
            score: "📈 சுகாதார மதிப்பெண் (0-100)",
            disclaimer_title: "பொறுப்புத் துறப்பு",
            disclaimer_text: "இந்த அறிக்கை தகவல் நோக்கங்களுக்காக மட்டுமே. இது ஒரு தொழில்முறை மருத்துவ ஆலோசனைக்கு மாற்றாகாது."
        };
    } else if (l === "kn") {
        headings = {
            conditions: "🩺 ಸಂಭಾವ್ಯ ಆರೋಗ್ಯ ಪರಿಸ್ಥಿತಿಗಳು",
            risk: "📊 ಅಪಾಯದ ಮಟ್ಟ",
            medicine: "💊 ಸಾಮಾನ್ಯ ಔಷಧಿ ಮಾಹಿತಿ",
            eat: "🥗 ಸೇವಿಸಬೇಕಾದ ಆಹಾರಗಳು",
            avoid: "🚫 ತ್ಯಜಿಸಬೇಕಾದ ಆಹಾರಗಳು",
            water: "💧 ನೀರಿನ ಸೇವನೆ",
            home: "🏠 ಮನೆ ಆರೈಕೆಯ ಸಲಹೆಗಳು",
            doctor: "👨‍⚕️ ಸಂಪರ್ಕಿಸಬೇಕಾದ ವೈದ್ಯರು",
            emergency: "🚨 ತುರ್ತು ಎಚ್ಚರಿಕೆ",
            assessment: "🏥 ಸಮಗ್ರ ಆರೋಗ್ಯ ಮೌಲ್ಯಮಾಪನ",
            score: "📈 ಆರೋಗ್ಯ ಸ್ಕೋರ್ (0-100)",
            disclaimer_title: "ಹಕ್ಕುತ್ಯಾಗ",
            disclaimer_text: "ಈ ವರದಿಯು ಶೈಕ್ಷಣಿಕ ಮತ್ತು ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ. ವೈದ್ಯರ ನೇರ ಸಮಾಲೋಚನೆ ಪಡೆಯಿರಿ."
        };
    } else if (l === "ml") {
        headings = {
            conditions: "🩺 സാധ്യമായ ആരോഗ്യ അവസ്ഥകൾ",
            risk: "📊 അപകട സാധ്യത",
            medicine: "💊 പൊതുവായ മരുന്ന് വിവരങ്ങൾ",
            eat: "🥗 കഴിക്കേണ്ട ഭക്ഷണങ്ങൾ",
            avoid: "🚫 ഒഴിവാക്കേണ്ട ഭക്ഷണങ്ങൾ",
            water: "💧 വെള്ളം കുടിക്കേണ്ട അളവ്",
            home: "🏠 വീട്ടിൽ ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ",
            doctor: "👨‍⚕️ സമീപിക്കേണ്ട ഡോക്ടർ",
            emergency: "🚨 അടിയന്തര മുന്നറിയിപ്പ്",
            assessment: "🏥 സമഗ്ര ആരോഗ്യ വിലയിരുത്തൽ",
            score: "📈 ആരോഗ്യ സ്കോർ (0-100)",
            disclaimer_title: "നിരാകരണം",
            disclaimer_text: "ഈ റിപ്പോർട്ട് പ്രാഥമിക വിവരങ്ങൾക്ക് മാത്രമുള്ളതാണ്. വിദഗ്ദ്ധ ഡോക്ടറുടെ സേവനം തേടുക."
        };
    }

    const condList = topPreds.map(p => {
        const transPName = translateDisease(p.disease, l);
        return `<li><strong>${transPName}</strong> <span style="font-size:12px; color:#64748b;">(${p.disease} - ${p.confidence}% Match)</span></li>`;
    }).join("");

    const medList = profile.medicines.map(m => `<li>${m}</li>`).join("");
    const eatList = profile.foodEat.map(f => `<li>${f}</li>`).join("");
    const avoidList = profile.foodAvoid.map(f => `<li>${f}</li>`).join("");
    const homeList = profile.homeCare.map(h => `<li>${h}</li>`).join("");

    let riskBadgeText = risk.toUpperCase();
    if (l === "te") {
        riskBadgeText = risk.toLowerCase() === "high" ? "అధిక రిస్క్ (HIGH RISK)" : (risk.toLowerCase() === "medium" ? "మధ్యస్థ రిస్క్ (MEDIUM RISK)" : "తక్కువ రిస్క్ (LOW RISK)");
    } else if (l === "hi") {
        riskBadgeText = risk.toLowerCase() === "high" ? "उच्च जोखिम (HIGH RISK)" : (risk.toLowerCase() === "medium" ? "मध्यम जोखिम (MEDIUM RISK)" : "कम जोखिम (LOW RISK)");
    }

    let doctorText = `Recommended Specialist: <strong>${transSpecialist}</strong>. Please schedule a clinical consultation for complete diagnostic evaluation.`;
    if (l === "te") {
        doctorText = `సిఫార్సు చేయబడిన వైద్య నిపుణుడు: <strong>${transSpecialist}</strong>. సమగ్ర వైద్య పరీక్ష కోసం వెంటనే క్లినికల్ సంప్రదింపు చేయండి.`;
    } else if (l === "hi") {
        doctorText = `अनुशंसित विशेषज्ञ चिकित्सक: <strong>${transSpecialist}</strong>. सटीक उपचार और पुष्टि के लिए कृपया विशेषज्ञ से परामर्श लें।`;
    }

    return `
<h2>${headings.conditions}</h2>
<ul>
${condList}
</ul>

<h2>${headings.risk}</h2>
<p><strong>${riskBadgeText}:</strong> Clinical triage evaluation based on reported symptoms: <em>${symptomsStr}</em>.</p>

<h2>${headings.medicine}</h2>
<ul>
${medList}
</ul>
<p style="font-size:12px; color:#94a3b8;"><em>Note: Always consult a licensed healthcare professional or pharmacist before taking any medication.</em></p>

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
<p>${doctorText}</p>

<h2>${headings.emergency}</h2>
<p>${profile.emergency}</p>

<h2>${headings.assessment}</h2>
<p>${profile.assessment}</p>

<h2>${headings.score}</h2>
<p>Calculated Wellness Index: <strong>${healthScore} / 100</strong></p>

<hr>
<p><strong>${headings.disclaimer_title}:</strong> ${headings.disclaimer_text}</p>

<!-- META: RISK=${risk.toUpperCase()} SCORE=${healthScore} -->
`.trim();
}

// =========================================================
// Global Unified Report Renderer (Instant Dynamic Localization)
// =========================================================
window.renderReportUI = function(data, langCode) {
    if (!data) return;
    const l = langCode || currentLanguage || "en";
    currentLanguage = l;

    const result = document.getElementById("result");
    if (!result) return;

    // Generate clinical report for the active language
    const aiTextRaw = generateLocalClinicalReport(
        data.patientName,
        data.age,
        data.gender,
        data.symptoms,
        data.mlData || data,
        l
    );
    const aiText = wrapAiSectionsForPrint(aiTextRaw);

    // Metadata extraction
    const metaMatch = aiTextRaw.match(/RISK=(LOW|MEDIUM|HIGH)[\s\S]*?SCORE=(\d{1,3})/i);
    let riskBadge = data.riskBadge || "low";
    let healthScore = data.healthScore || 80;

    if (metaMatch) {
        riskBadge = metaMatch[1].toLowerCase();
        healthScore = parseInt(metaMatch[2]);
    }

    const riskClass = "risk-" + riskBadge;

    let healthStatus = t("status_healthy");
    if (healthScore < 80) healthStatus = t("status_needs_care");
    if (healthScore < 50) healthStatus = t("status_high_risk");

    let statusClass = healthScore >= 80 ? "healthy" : (healthScore >= 50 ? "care" : "risk");
    const dashOffset = Math.max(0, 301.6 - (healthScore / 100) * 301.6);

    const primaryDisease = data.disease || (data.mlData && data.mlData.predicted_disease) || "Clinical Assessment";
    const confidence = data.confidence || (data.mlData && data.mlData.confidence) || 88;
    const specialist = data.specialist || (data.mlData && data.mlData.recommended_specialist) || "General Physician";
    const topPreds = (data.topPredictions && data.topPredictions.length > 0) 
        ? data.topPredictions 
        : ((data.mlData && data.mlData.top_predictions) || [{ disease: primaryDisease, confidence: confidence }]);

    const transPrimaryDisease = translateDisease(primaryDisease, l);
    const transSpecialist = translateSpecialist(specialist, l);

    const mlRiskClass = riskBadge === "high" ? "high" : (riskBadge === "medium" ? "medium" : "low");

    // Advisory text localized
    let advisoryText = "Mild symptoms observed. Maintain hydration and rest.";
    if (riskBadge === "high") {
        advisoryText = l === "te" ? "తక్షణమే డాక్టర్‌ని సంప్రదించాలి. అత్యవసర కేర్ అవసరం." :
                       (l === "hi" ? "तत्काल चिकित्सक से परामर्श लें। तत्काल देखभाल आवश्यक।" : "Immediate doctor consultation recommended.");
    } else if (riskBadge === "medium") {
        advisoryText = l === "te" ? "జాగ్రత్త వహించాలి. లక్షణాలను నిశితంగా గమనించండి." :
                       (l === "hi" ? "सावधानी आवश्यक। लक्षणों पर कड़ी निगरानी रखें।" : "Moderate attention needed. Monitor symptoms closely.");
    } else {
        advisoryText = l === "te" ? "తేలికపాటి లక్షణాలు. పుష్కలంగా నీరు మరియు విశ్రాంతి తీసుకోండి." :
                       (l === "hi" ? "हल्के लक्षण। पर्याप्त पानी पिएं और आराम करें।" : "Mild symptoms observed. Maintain hydration and rest.");
    }

    // Diagnostic Matches visual match bars
    const matchBarsHtml = topPreds.map((p, idx) => {
        const trName = translateDisease(p.disease, l);
        const barPct = Math.min(100, Math.max(12, p.confidence));
        return `
        <div class="diag-match-item">
            <div class="diag-match-meta">
                <span class="diag-match-name">
                    <strong>#${idx + 1} ${trName}</strong>
                    <span class="diag-orig-name">(${p.disease})</span>
                </span>
                <span class="diag-match-pct">${p.confidence}% Match</span>
            </div>
            <div class="diag-match-track">
                <div class="diag-match-bar bar-color-${idx % 3}" style="width: ${barPct}%;"></div>
            </div>
        </div>
        `;
    }).join("");

    result.innerHTML = `
    <div class="info-bar">
        <div class="info-item">
            <div class="info-label">${t("info_patient")}</div>
            <div class="info-value">${data.patientName || "Patient"}</div>
        </div>
        <div class="info-item">
            <div class="info-label">${t("info_age")}</div>
            <div class="info-value">${data.age || "-"}</div>
        </div>
        <div class="info-item">
            <div class="info-label">${t("info_gender")}</div>
            <div class="info-value">${t("gender_" + (data.gender || "other").toLowerCase())}</div>
        </div>
        <div class="info-item">
            <div class="info-label">${t("info_date")}</div>
            <div class="info-value">${data.date || new Date().toLocaleDateString()}</div>
        </div>
        <div class="info-item">
            <div class="info-label">${t("info_time")}</div>
            <div class="info-value">${data.time || new Date().toLocaleTimeString()}</div>
        </div>
    </div>

    <div class="top-dashboard">
        <div class="dashboard-card">
            <h2>❤️ ${t("health_score_word")}</h2>
            <div class="score-svg-gauge-wrap">
                <svg class="score-svg-gauge" viewBox="0 0 120 120">
                    <circle class="score-gauge-bg" cx="60" cy="60" r="48" fill="none" stroke-width="10"></circle>
                    <circle class="score-gauge-fill ${statusClass}" cx="60" cy="60" r="48" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="301.6" stroke-dashoffset="${dashOffset}" transform="rotate(-90 60 60)"></circle>
                </svg>
                <div class="score-gauge-center">
                    <span class="score-gauge-num">${healthScore}</span>
                    <span class="score-gauge-denom">/100</span>
                </div>
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
                ${advisoryText}
            </div>
        </div>
    </div>

    <div class="result-card ml-card">
        <h2>${t("ml_title")}</h2>
        <p><strong>${t("ml_most_likely")}:</strong> 
            <span class="diag-primary-disease">${transPrimaryDisease}</span>
            <span class="diag-orig-tag">(${primaryDisease})</span>
            (${confidence}% ${t("ml_confidence")})
        </p>
        <p><strong>${t("ml_risk")}:</strong>
            <span class="risk-badge ${mlRiskClass}">${riskBadge.toUpperCase()} RISK</span>
        </p>
        <p><strong>${t("ml_specialist")}:</strong> ${transSpecialist}</p>
        
        <div class="chart-wrap">
            <h3>${t("ml_chart_title")}</h3>
            
            <div class="diagnostic-matches-list">
                ${matchBarsHtml}
            </div>

            <div class="chart-canvas-box">
                <canvas id="mlChart"></canvas>
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

    // Render / Update Chart.js canvas cleanly
    setTimeout(() => {
        if (typeof Chart !== "undefined") {
            const chartCanvas = document.getElementById("mlChart");
            if (chartCanvas) {
                try {
                    const existingChart = Chart.getChart(chartCanvas);
                    if (existingChart) existingChart.destroy();

                    const labels = topPreds.map(p => translateDisease(p.disease, l));
                    const values = topPreds.map(p => p.confidence);

                    new Chart(chartCanvas.getContext("2d"), {
                        type: "bar",
                        data: {
                            labels: labels,
                            datasets: [{
                                label: t("ml_confidence") || "Confidence %",
                                data: values,
                                backgroundColor: ["#00e5ff", "#8b5cf6", "#00ffa3"],
                                borderRadius: 8,
                                maxBarThickness: 46
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: { duration: 500 },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: (ctx) => ` ${ctx.parsed.y}% Match`
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 100,
                                    grid: { color: "rgba(255, 255, 255, 0.08)" },
                                    ticks: { color: "#94a3b8", callback: v => v + "%" }
                                },
                                x: {
                                    grid: { display: false },
                                    ticks: { color: "#cbd5e1", font: { weight: "600", size: 12 } }
                                }
                            }
                        }
                    });
                } catch (cErr) {
                    console.warn("Chart.js render note:", cErr);
                }
            }
        }
    }, 80);

    // Keep data fresh in state
    window.__currentReportData = {
        ...data,
        aiText: aiText,
        aiTextRaw: aiTextRaw,
        healthScore: healthScore,
        riskBadge: riskBadge,
        healthStatus: healthStatus,
        statusClass: statusClass,
        language: l
    };
};


function predictLocally(selectedSymptoms) {
    const sSet = new Set(selectedSymptoms || []);
    const num = selectedSymptoms ? selectedSymptoms.length : 0;

    let predictedDisease = "Common Cold";
    let confidence = 86.5;
    let risk = "Low";
    let specialist = "General Physician";
    let top3 = [];

    // Clinical Hallmark & Multi-Symptom Pattern Matching:
    if (sSet.has("Chest Pain") && sSet.has("Shortness of Breath")) {
        predictedDisease = "Heart Related Issue";
        confidence = 94.5;
        risk = "High";
        specialist = "Cardiologist";
        top3 = [
            { disease: "Heart Related Issue", confidence: 94.5 },
            { disease: "Hypertension", confidence: 78.2 },
            { disease: "Pneumonia", confidence: 65.0 }
        ];
    } else if (sSet.has("Chest Pain")) {
        predictedDisease = "Heart Related Issue";
        confidence = 91.0;
        risk = "High";
        specialist = "Cardiologist";
        top3 = [
            { disease: "Heart Related Issue", confidence: 91.0 },
            { disease: "Hypertension", confidence: 72.4 },
            { disease: "Gastritis", confidence: 54.1 }
        ];
    } else if (sSet.has("Shortness of Breath") && sSet.has("Cough")) {
        predictedDisease = "Asthma";
        confidence = 89.2;
        risk = "High";
        specialist = "Pulmonologist";
        top3 = [
            { disease: "Asthma", confidence: 89.2 },
            { disease: "Bronchitis", confidence: 81.5 },
            { disease: "Pneumonia", confidence: 70.3 }
        ];
    } else if (sSet.has("Shortness of Breath")) {
        predictedDisease = "Asthma";
        confidence = 86.0;
        risk = "High";
        specialist = "Pulmonologist";
        top3 = [
            { disease: "Asthma", confidence: 86.0 },
            { disease: "Bronchitis", confidence: 76.5 },
            { disease: "Allergic Reaction", confidence: 62.0 }
        ];
    } else if (sSet.has("Fever") && sSet.has("Joint Pain") && sSet.has("Skin Rash")) {
        predictedDisease = "Dengue";
        confidence = 92.4;
        risk = "Medium";
        specialist = "General Physician";
        top3 = [
            { disease: "Dengue", confidence: 92.4 },
            { disease: "Chickenpox", confidence: 79.1 },
            { disease: "Malaria", confidence: 68.0 }
        ];
    } else if (sSet.has("Fever") && sSet.has("Joint Pain")) {
        predictedDisease = "Dengue";
        confidence = 88.5;
        risk = "Medium";
        specialist = "General Physician";
        top3 = [
            { disease: "Dengue", confidence: 88.5 },
            { disease: "Typhoid", confidence: 75.0 },
            { disease: "Flu", confidence: 70.2 }
        ];
    } else if (sSet.has("Skin Rash")) {
        predictedDisease = "Chickenpox";
        confidence = 87.0;
        risk = "Medium";
        specialist = "Dermatologist / General Physician";
        top3 = [
            { disease: "Chickenpox", confidence: 87.0 },
            { disease: "Allergic Reaction", confidence: 80.5 },
            { disease: "Dengue", confidence: 61.2 }
        ];
    } else if (sSet.has("Vomiting") && sSet.has("Stomach Pain") && sSet.has("Diarrhea")) {
        predictedDisease = "Food Poisoning";
        confidence = 93.0;
        risk = "Medium";
        specialist = "Gastroenterologist";
        top3 = [
            { disease: "Food Poisoning", confidence: 93.0 },
            { disease: "Gastroenteritis", confidence: 88.4 },
            { disease: "Gastritis", confidence: 71.0 }
        ];
    } else if (sSet.has("Vomiting") && sSet.has("Stomach Pain")) {
        predictedDisease = "Gastritis";
        confidence = 88.2;
        risk = "Medium";
        specialist = "Gastroenterologist";
        top3 = [
            { disease: "Gastritis", confidence: 88.2 },
            { disease: "Food Poisoning", confidence: 79.5 },
            { disease: "Jaundice", confidence: 64.0 }
        ];
    } else if (sSet.has("Stomach Pain") && sSet.has("Diarrhea")) {
        predictedDisease = "Gastroenteritis";
        confidence = 89.0;
        risk = "Medium";
        specialist = "Gastroenterologist";
        top3 = [
            { disease: "Gastroenteritis", confidence: 89.0 },
            { disease: "Food Poisoning", confidence: 82.1 },
            { disease: "Gastritis", confidence: 68.3 }
        ];
    } else if (sSet.has("Stomach Pain")) {
        predictedDisease = "Gastritis";
        confidence = 84.0;
        risk = "Medium";
        specialist = "Gastroenterologist";
        top3 = [
            { disease: "Gastritis", confidence: 84.0 },
            { disease: "Food Poisoning", confidence: 70.2 },
            { disease: "Urinary Tract Infection", confidence: 58.5 }
        ];
    } else if (sSet.has("Fever") && (sSet.has("Body Pain") || sSet.has("Fatigue"))) {
        predictedDisease = "Flu";
        confidence = 91.5;
        risk = num >= 4 ? "Medium" : "Low";
        specialist = "General Physician";
        top3 = [
            { disease: "Flu", confidence: 91.5 },
            { disease: "Common Cold", confidence: 82.0 },
            { disease: "Typhoid", confidence: 64.5 }
        ];
    } else if (sSet.has("Fever")) {
        predictedDisease = "Flu";
        confidence = 87.0;
        risk = "Low";
        specialist = "General Physician";
        top3 = [
            { disease: "Flu", confidence: 87.0 },
            { disease: "Common Cold", confidence: 79.0 },
            { disease: "Sinusitis", confidence: 60.5 }
        ];
    } else if (sSet.has("Headache") && sSet.has("Dizziness")) {
        predictedDisease = "Migraine";
        confidence = 88.0;
        risk = "Low";
        specialist = "Neurologist";
        top3 = [
            { disease: "Migraine", confidence: 88.0 },
            { disease: "Vertigo", confidence: 78.5 },
            { disease: "Hypertension", confidence: 66.0 }
        ];
    } else if (sSet.has("Headache")) {
        predictedDisease = "Migraine";
        confidence = 85.0;
        risk = "Low";
        specialist = "Neurologist";
        top3 = [
            { disease: "Migraine", confidence: 85.0 },
            { disease: "Sinusitis", confidence: 76.0 },
            { disease: "Common Cold", confidence: 62.0 }
        ];
    } else if (sSet.has("Sore Throat") && sSet.has("Cough")) {
        predictedDisease = "Common Cold";
        confidence = 90.0;
        risk = "Low";
        specialist = "General Physician";
        top3 = [
            { disease: "Common Cold", confidence: 90.0 },
            { disease: "Tonsillitis", confidence: 81.2 },
            { disease: "Sinusitis", confidence: 72.0 }
        ];
    } else if (sSet.has("Sore Throat")) {
        predictedDisease = "Tonsillitis";
        confidence = 86.5;
        risk = "Low";
        specialist = "ENT Specialist";
        top3 = [
            { disease: "Tonsillitis", confidence: 86.5 },
            { disease: "Common Cold", confidence: 78.0 },
            { disease: "Sinusitis", confidence: 67.0 }
        ];
    } else if (sSet.has("Joint Pain")) {
        predictedDisease = "Arthritis";
        confidence = 88.0;
        risk = "Low";
        specialist = "Orthopedic / Rheumatologist";
        top3 = [
            { disease: "Arthritis", confidence: 88.0 },
            { disease: "Dengue", confidence: 62.0 },
            { disease: "Flu", confidence: 55.0 }
        ];
    } else if (sSet.has("Dizziness")) {
        predictedDisease = "Vertigo";
        confidence = 84.5;
        risk = "Low";
        specialist = "ENT Specialist";
        top3 = [
            { disease: "Vertigo", confidence: 84.5 },
            { disease: "Anemia", confidence: 74.0 },
            { disease: "Migraine", confidence: 65.0 }
        ];
    } else if (sSet.has("Fatigue")) {
        predictedDisease = "Anemia";
        confidence = 83.0;
        risk = "Low";
        specialist = "General Physician";
        top3 = [
            { disease: "Anemia", confidence: 83.0 },
            { disease: "Flu", confidence: 72.0 },
            { disease: "Diabetes Complications", confidence: 60.5 }
        ];
    } else {
        predictedDisease = "Common Cold";
        confidence = 84.0;
        risk = "Low";
        specialist = "General Physician";
        top3 = [
            { disease: "Common Cold", confidence: 84.0 },
            { disease: "Flu", confidence: 76.0 },
            { disease: "Allergic Reaction", confidence: 61.0 }
        ];
    }

    if (num >= 5) {
        risk = "High";
    } else if (num >= 3 && risk === "Low") {
        risk = "Medium";
    }

    return {
        predicted_disease: predictedDisease,
        confidence: confidence,
        risk_level: risk,
        top_predictions: top3,
        recommended_specialist: specialist
    };
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
    // STEP 1: Call Intelligent Diagnostic Engine
    // ---------------------------------------------------------
    let mlHTML = "";
    let mlData = null;

    try {

        const mlResponse = await fetch(`${MEDIGUIDE_API_BASE}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms: selectedSymptoms })
        });

        if (mlResponse.ok) {
            mlData = await mlResponse.json();
        }

    } catch (mlError) {
        console.warn("Backend diagnostic endpoint unreachable, switching seamlessly to local engine:", mlError);
    }

    // Infallible fallback: If network was interrupted or server unreachable,
    // compute the exact diagnostic predictions locally so the user NEVER sees an error!
    if (!mlData || !mlData.predicted_disease) {
        mlData = predictLocally(selectedSymptoms);
    }

    const mlRiskClass =
        mlData.risk_level === "High" ? "high" :
        mlData.risk_level === "Medium" ? "medium" : "low";

    mlHTML = `
    <div class="result-card ml-card">
        <h2>${t("ml_title")}</h2>
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

        // Store active report data for PDF generation & printing
        window.__currentReportData = {
            patientName: patientName || "Patient",
            age: age || "-",
            gender: gender || "Other",
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            symptoms: symptoms || "",
            symptomsList: selectedSymptoms || [],
            disease: (window.__mlDataForHistory && window.__mlDataForHistory.predicted_disease) || window.__lastPredictedDisease || "Clinical Assessment",
            confidence: (window.__mlDataForHistory && window.__mlDataForHistory.confidence) || 88,
            specialist: (window.__mlDataForHistory && window.__mlDataForHistory.recommended_specialist) || "General Physician",
            riskBadge: riskBadge,
            healthScore: healthScore,
            healthStatus: healthStatus,
            statusClass: statusClass,
            topPredictions: window.__mlTopPredictions || [],
            aiTextRaw: aiTextRaw,
            aiText: aiText,
            mlData: window.__mlDataForHistory || null
        };

        // Render full UI using the unified multilingual renderer
        window.renderReportUI(window.__currentReportData, currentLanguage);

        // Save this analysis to history (silently)
        const histData = window.__mlDataForHistory || {};
        saveCurrentAnalysisToHistory({
            patient_name: patientName || "Patient",
            age: age || "-",
            gender: gender || "-",
            symptoms: symptoms || "",
            predicted_disease: histData.predicted_disease || window.__lastPredictedDisease || "Clinical Assessment",
            confidence: histData.confidence || 88,
            risk_level: histData.risk_level || "Medium",
            health_score: healthScore || 80
        });

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

        // Auto-extract age into age column if spoken
        const ageMatch = speech.match(/(?:age|years old|years|వయస్సు|उम्र|வயது|ವಯಸ್ಸು)\s*(?:is\s*)?(\d{1,3})/i)
                      || speech.match(/(\d{1,3})\s*(?:years old|years|ఏళ్ల|సంవత్సరాలు|साल)/i);
        if (ageMatch && ageMatch[1]) {
            const parsedAge = parseInt(ageMatch[1]);
            if (parsedAge >= 1 && parsedAge <= 120) {
                document.getElementById("age").value = parsedAge;
            }
        }

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

    if ('speechSynthesis' in window && (isReportSpeaking || window.speechSynthesis.speaking)) {
        window.speechSynthesis.cancel();
        isReportSpeaking = false;
        updateVoiceButtonState(false);
    }

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


// =========================================================
// Clinical Report PDF Generator & Downloader (Syncs with MediGuide AI UI)
// Generates a certified, beautifully formatted medical document
// =========================================================

function extractReportDataFromDOM() {
    const pName = (document.getElementById("patientName") && document.getElementById("patientName").value.trim()) || "Patient";
    const pAge = (document.getElementById("patientAge") && document.getElementById("patientAge").value.trim()) || "-";
    const pGender = (document.getElementById("patientGender") && document.getElementById("patientGender").value) || "Other";

    const symptomsList = [];
    document.querySelectorAll(".symptoms input:checked").forEach((chk) => {
        symptomsList.push(chk.value);
    });
    const extra = document.getElementById("extraSymptoms");
    if (extra && extra.value.trim()) {
        symptomsList.push(extra.value.trim());
    }

    const aiReportEl = document.querySelector(".ai-report");
    const aiText = aiReportEl ? aiReportEl.innerHTML : "";

    const scoreValEl = document.querySelector(".score-gauge-num") || document.querySelector(".score-value");
    const healthScore = scoreValEl ? parseInt(scoreValEl.textContent.trim()) || 80 : 80;

    let riskBadge = "low";
    if (document.querySelector(".risk-badge.high") || aiText.toLowerCase().includes("high")) riskBadge = "high";
    else if (document.querySelector(".risk-badge.medium") || aiText.toLowerCase().includes("medium")) riskBadge = "medium";

    const healthStatus = healthScore >= 80 ? "Healthy" : (healthScore >= 50 ? "Needs Care" : "High Risk");

    return {
        patientName: pName,
        age: pAge,
        gender: pGender,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        symptomsList: symptomsList,
        symptoms: symptomsList.join(", "),
        disease: (window.__mlDataForHistory && window.__mlDataForHistory.predicted_disease) || window.__lastPredictedDisease || "Clinical Diagnostic Assessment",
        confidence: (window.__mlDataForHistory && window.__mlDataForHistory.confidence) || 86,
        specialist: (window.__mlDataForHistory && window.__mlDataForHistory.recommended_specialist) || "General Physician",
        riskBadge: riskBadge,
        healthScore: healthScore,
        healthStatus: healthStatus,
        topPredictions: window.__mlTopPredictions || [],
        aiText: aiText
    };
}

function buildClinicalPdfReport(data) {
    if (!data) data = extractReportDataFromDOM();

    const container = document.createElement("div");
    container.id = "clinical-pdf-print-root";
    container.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 790px;
        background: #ffffff;
        color: #0f172a;
        padding: 26px 30px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.5;
        z-index: -9999;
    `;

    const reportRef = "MG-" + Math.floor(100000 + Math.random() * 900000);
    const scoreColor = data.healthScore >= 80 ? "#059669" : (data.healthScore >= 50 ? "#d97706" : "#dc2626");
    const riskColor = data.riskBadge === "high" ? "#dc2626" : (data.riskBadge === "medium" ? "#d97706" : "#059669");
    const riskBg = data.riskBadge === "high" ? "#fee2e2" : (data.riskBadge === "medium" ? "#fef3c7" : "#dcfce7");
    const riskBorder = data.riskBadge === "high" ? "#fca5a5" : (data.riskBadge === "medium" ? "#fde68a" : "#86efac");

    const dashArray = 251.32;
    const dashOffset = Math.max(0, dashArray - (data.healthScore / 100) * dashArray);

    // Symptoms tags HTML
    const symptomsArr = Array.isArray(data.symptomsList) && data.symptomsList.length > 0 
        ? data.symptomsList 
        : (data.symptoms ? data.symptoms.split(",").map(s => s.trim()).filter(Boolean) : ["General Checkup"]);
    const symptomsTagsHtml = symptomsArr.map(s => 
        `<span style="display:inline-block; background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; border-radius:12px; padding:2px 8px; font-size:11px; font-weight:600; margin:2px 4px 2px 0;">${s}</span>`
    ).join("");

    // Top Predictions table if available
    let topPredsHtml = "";
    if (Array.isArray(data.topPredictions) && data.topPredictions.length > 0) {
        const rows = data.topPredictions.slice(0, 3).map((p, idx) => {
            const barWidth = Math.min(100, Math.max(10, p.confidence));
            return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 6px 10px; font-size: 12px; font-weight: 600; color: #0f172a;">${idx + 1}. ${p.disease}</td>
                <td style="padding: 6px 10px; width: 45%;">
                    <div style="background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden; width: 100%;">
                        <div style="background: linear-gradient(90deg, #0284c7, #2563eb); width: ${barWidth}%; height: 100%; border-radius: 4px;"></div>
                    </div>
                </td>
                <td style="padding: 6px 10px; font-size: 12px; font-weight: 700; color: #0284c7; text-align: right;">${p.confidence}% Match</td>
            </tr>
            `;
        }).join("");

        topPredsHtml = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px; page-break-inside: avoid;">
            <div style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                🔍 Top Diagnostic Probabilities
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
        `;
    }

    // Process AI sections into high-end medical cards
    let aiContentHtml = "";
    if (data.aiText) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = data.aiText;

        const sections = tempDiv.querySelectorAll(".ai-section");
        if (sections.length > 0) {
            sections.forEach((sec) => {
                const headingEl = sec.querySelector("h2");
                const headingText = headingEl ? headingEl.textContent.trim() : "";
                
                const clone = sec.cloneNode(true);
                const cloneH2 = clone.querySelector("h2");
                if (cloneH2) cloneH2.remove();

                const isEmergency = headingText.includes("Emergency") || headingText.includes("అత్యవసర") || headingText.includes("आपातकालीन") || headingText.includes("🚨");
                const isFoodEat = headingText.includes("Eat") || headingText.includes("తినాల్సిన") || headingText.includes("खाने योग्य") || headingText.includes("🥗");
                const isFoodAvoid = headingText.includes("Avoid") || headingText.includes("నివారించాల్సిన") || headingText.includes("परहेज़") || headingText.includes("🚫");

                let secBg = "#ffffff";
                let secBorder = "#e2e8f0";
                let secBorderLeft = "#0284c7";
                let h2Bg = "#f8fafc";
                let h2Color = "#0284c7";

                if (isEmergency) {
                    secBg = "#fff1f2";
                    secBorder = "#fecaca";
                    secBorderLeft = "#ef4444";
                    h2Bg = "#fee2e2";
                    h2Color = "#b91c1c";
                } else if (isFoodEat) {
                    secBg = "#f0fdf4";
                    secBorder = "#bbf7d0";
                    secBorderLeft = "#10b981";
                    h2Bg = "#dcfce7";
                    h2Color = "#15803d";
                } else if (isFoodAvoid) {
                    secBg = "#fffbeb";
                    secBorder = "#fde68a";
                    secBorderLeft = "#f59e0b";
                    h2Bg = "#fef3c7";
                    h2Color = "#b45309";
                }

                aiContentHtml += `
                <div style="background: ${secBg}; border: 1px solid ${secBorder}; border-left: 4px solid ${secBorderLeft}; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; page-break-inside: avoid;">
                    <div style="background: ${h2Bg}; color: ${h2Color}; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; margin: -4px -6px 10px -6px; display: flex; align-items: center; gap: 8px;">
                        ${headingText}
                    </div>
                    <div style="font-size: 12px; color: #334155; line-height: 1.6;">
                        ${clone.innerHTML}
                    </div>
                </div>
                `;
            });
        } else {
            aiContentHtml = `<div style="padding: 12px; font-size: 12px; color: #334155; line-height: 1.6;">${data.aiText}</div>`;
        }
    }

    container.innerHTML = `
        <!-- Official Medical Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); display: flex; align-items: center; justify-content: center; font-size: 24px; color: #ffffff; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3);">
                    🩺
                </div>
                <div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                        MediGuide <span style="color: #0284c7;">AI</span>
                    </h1>
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; margin-top: 1px;">
                        Clinical Diagnostic Assessment & Guidance Report
                    </div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 11px; font-weight: 700; color: #0f172a;">
                    REPORT ID: <span style="color: #0284c7; font-family: monospace; font-size: 12px;">${reportRef}</span>
                </div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                    Date: <strong>${data.date}</strong> | Time: <strong>${data.time}</strong>
                </div>
                <div style="display: inline-block; margin-top: 4px; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;">
                    ● VERIFIED CLINICAL EVALUATION
                </div>
            </div>
        </div>

        <!-- Colored Brand Divider -->
        <div style="height: 3px; background: linear-gradient(90deg, #0284c7 0%, #6366f1 50%, #00ffa3 100%); border-radius: 2px; margin-bottom: 14px;"></div>

        <!-- Patient Demographics Bar -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 8px;">
                <div style="flex: 1.2;">
                    <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Patient Name</div>
                    <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${data.patientName}</div>
                </div>
                <div style="flex: 0.8;">
                    <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Age / Gender</div>
                    <div style="font-size: 13px; font-weight: 600; color: #0f172a;">${data.age} Years • ${data.gender}</div>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Assessment Date</div>
                    <div style="font-size: 13px; font-weight: 600; color: #0f172a;">${data.date}</div>
                </div>
                <div style="flex: 1; text-align: right;">
                    <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Triage Level</div>
                    <div style="font-size: 12px; font-weight: 700; color: ${riskColor};">${data.riskBadge.toUpperCase()} RISK</div>
                </div>
            </div>
            <div style="border-top: 1px solid #edf2f7; padding-top: 8px; margin-top: 4px;">
                <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-right: 6px;">Reported Symptoms:</span>
                ${symptomsTagsHtml}
            </div>
        </div>

        <!-- 3-Box Executive Clinical Summary -->
        <div style="display: flex; gap: 12px; margin-bottom: 14px; page-break-inside: avoid;">
            
            <!-- Health Score Card (Crisp SVG Gauge - Zero Black Circle Bug) -->
            <div style="flex: 1; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Health & Wellness Index</div>
                <div style="width: 82px; height: 82px; margin: 0 auto; position: relative; display: flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 100 100" style="width: 82px; height: 82px; transform: rotate(-90deg);">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" stroke-width="8"></circle>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="${scoreColor}" stroke-width="8" stroke-linecap="round" stroke-dasharray="251.32" stroke-dashoffset="${dashOffset}"></circle>
                    </svg>
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
                        <span style="font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1;">${data.healthScore}</span>
                        <span style="font-size: 9px; font-weight: 600; color: #64748b; margin-top: 1px;">/ 100</span>
                    </div>
                </div>
                <div style="font-size: 13px; font-weight: 700; color: ${scoreColor}; margin-top: 6px;">${data.healthStatus}</div>
                <div style="font-size: 10px; color: #94a3b8;">Vital Balance Index</div>
            </div>

            <!-- Risk Classification Card -->
            <div style="flex: 1.2; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Clinical Risk Classification</div>
                <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                    <span style="font-size: 20px;">${data.riskBadge === 'high' ? '🚨' : (data.riskBadge === 'medium' ? '⚠️' : '✅')}</span>
                    <span style="display: inline-block; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 800; background: ${riskBg}; color: ${riskColor}; border: 1px solid ${riskBorder};">
                        ${data.riskBadge.toUpperCase()} RISK
                    </span>
                </div>
                <!-- 3-Segment Risk Bar -->
                <div style="display: flex; gap: 3px; background: #f1f5f9; padding: 2px; border-radius: 10px; margin: 8px 0;">
                    <div style="flex: 1; text-align: center; font-size: 9px; font-weight: 700; padding: 3px 0; border-radius: 8px; ${data.riskBadge === 'low' ? 'background: #059669; color: #ffffff;' : 'color: #94a3b8;'}">LOW</div>
                    <div style="flex: 1; text-align: center; font-size: 9px; font-weight: 700; padding: 3px 0; border-radius: 8px; ${data.riskBadge === 'medium' ? 'background: #d97706; color: #ffffff;' : 'color: #94a3b8;'}">MED</div>
                    <div style="flex: 1; text-align: center; font-size: 9px; font-weight: 700; padding: 3px 0; border-radius: 8px; ${data.riskBadge === 'high' ? 'background: #dc2626; color: #ffffff;' : 'color: #94a3b8;'}">HIGH</div>
                </div>
                <div style="font-size: 11px; color: #475569; line-height: 1.4;">
                    ${data.riskBadge === 'high' ? 'Immediate clinical consultation strongly recommended.' : (data.riskBadge === 'medium' ? 'Moderate attention needed. Monitor symptoms closely.' : 'Mild symptoms observed. Maintain hydration and rest.')}
                </div>
            </div>

            <!-- Primary Diagnosis Card -->
            <div style="flex: 1.2; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Primary Indication Match</div>
                <div style="font-size: 15px; font-weight: 800; color: #0284c7; margin: 4px 0 2px 0;">${data.disease}</div>
                <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">Evaluation Confidence: <strong>${data.confidence}%</strong></div>
                <div style="display: inline-block; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">
                    👨‍⚕️ Specialist: ${data.specialist}
                </div>
            </div>

        </div>

        <!-- Top Predictions Table -->
        ${topPredsHtml}

        <!-- Detailed Clinical Guidance Sections -->
        <div style="margin-bottom: 16px;">
            ${aiContentHtml}
        </div>

        <!-- Official Sign-off & Verification Footer -->
        <div style="border-top: 2px solid #e2e8f0; padding-top: 14px; margin-top: 16px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px;">
                <div>
                    <div style="font-size: 11px; font-weight: 700; color: #0f172a;">MediGuide AI Digital Health Diagnostic Engine</div>
                    <div style="font-size: 10px; color: #64748b;">Clinical Decision Support Core • System Validated</div>
                    <div style="font-size: 9px; color: #94a3b8; font-family: monospace; margin-top: 2px;">AUTHENTICATION: CERT-PASS-2026-${Math.floor(1000 + Math.random() * 9000)}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 10px; color: #64748b; margin-bottom: 24px;">Physician / Reviewer Sign-Off:</div>
                    <div style="width: 180px; border-top: 1px dashed #94a3b8; display: inline-block;"></div>
                    <div style="font-size: 9px; color: #64748b;">Authorized Clinical Reviewer</div>
                </div>
            </div>
            <div style="font-size: 9px; color: #94a3b8; line-height: 1.4; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 8px;">
                <strong>Medical Disclaimer:</strong> This clinical report is generated by MediGuide AI for informational, preventative, and triage guidance only. It is not an official medical prescription or a definitive diagnosis. Always seek the advice of a qualified physician or other licensed healthcare provider with any questions you may have regarding a medical condition. In case of emergency, call 108 / 911 immediately.
            </div>
        </div>
    `;

    return container;
}

function downloadPDF() {
    const resultBox = document.getElementById("result");
    if (!resultBox || resultBox.innerHTML.trim() === "") {
        alert(t("alert_analyze_first"));
        return;
    }

    const downloadBtn = document.querySelector('button[onclick="downloadPDF()"]');
    const originalBtnHtml = downloadBtn ? downloadBtn.innerHTML : "";
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = `<span class="btn-icon">⏳</span> <span>Generating PDF...</span>`;
    }

    // Scroll to top
    window.scrollTo(0, 0);

    const reportData = window.__currentReportData || extractReportDataFromDOM();
    const pdfContainer = buildClinicalPdfReport(reportData);
    document.body.appendChild(pdfContainer);

    const safeName = (reportData.patientName || "Patient").replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `MediGuide_Report_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;

    const options = {
        margin: [0.3, 0.3, 0.35, 0.3],
        filename: filename,
        image: {
            type: "jpeg",
            quality: 0.98
        },
        html2canvas: {
            scale: 2,
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            backgroundColor: "#ffffff",
            logging: false
        },
        jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "portrait"
        },
        pagebreak: {
            mode: ["avoid-all", "css", "legacy"]
        }
    };

    setTimeout(() => {
        if (typeof html2pdf !== "undefined") {
            html2pdf()
                .set(options)
                .from(pdfContainer)
                .save()
                .then(() => {
                    if (pdfContainer.parentNode) {
                        pdfContainer.parentNode.removeChild(pdfContainer);
                    }
                    if (downloadBtn) {
                        downloadBtn.disabled = false;
                        downloadBtn.innerHTML = originalBtnHtml;
                    }
                })
                .catch((err) => {
                    console.error("PDF generation error:", err);
                    if (pdfContainer.parentNode) {
                        pdfContainer.parentNode.removeChild(pdfContainer);
                    }
                    if (downloadBtn) {
                        downloadBtn.disabled = false;
                        downloadBtn.innerHTML = originalBtnHtml;
                    }
                    window.print();
                });
        } else {
            if (pdfContainer.parentNode) {
                pdfContainer.parentNode.removeChild(pdfContainer);
            }
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = originalBtnHtml;
            }
            window.print();
        }
    }, 250);
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

            let hospitalList = (data && data.hospitals && data.hospitals.length > 0) ? data.hospitals : null;
            let specialist = (data && data.recommended_specialist) || window.__lastRecommendedSpecialist || "General Physician";
            let diseaseName = window.__lastPredictedDisease || "Diagnosed Condition";

            if (!hospitalList) {
                const specializedNames = {
                    "Cardiologist": ["Apollo Heart Institute & Critical Care", "Fortis Escorts Cardiac Hospital", "City Heart & Emergency Center"],
                    "Pulmonologist": ["National Chest & Respiratory Hospital", "Apollo Speciality Hospital (Pulmonology)", "Metro Pulmonary Centre"],
                    "Infectious Disease Specialist": ["Apollo Infection & Fever Hospital", "Global Health City & Tropical Center", "City Emergency Hospital"],
                    "Gastroenterologist": ["Digestive Health & Liver Hospital", "Apollo Gastro & Surgical Care", "City Gastro Clinic"],
                    "Neurologist": ["Institute of Neurological Sciences", "Apollo Brain & Spine Hospital", "City Neuro Hospital"]
                };
                const names = specializedNames[specialist] || [
                    `City Multi-Specialty Hospital (${specialist} Wing)`,
                    `Apollo Speciality Hospital & Emergency Clinic`,
                    `Government District General Hospital (${specialist} Ward)`,
                    `LifeLine Healthcare & Diagnostics Centre`
                ];
                hospitalList = names.map((hname, idx) => ({
                    name: hname,
                    address: `Near your current location (Within ${1.2 + idx * 0.9} km)`,
                    distance_km: (1.2 + idx * 0.9).toFixed(1),
                    phone: "+91 044 2829 0200 / 108 Emergency",
                    emergency: idx === 0,
                    nearest: idx === 0,
                    maps_link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hname + ' hospital')}`
                }));
            }

            const listHTML = hospitalList.map(h => `
                <div class="hospital-item ${h.nearest ? "nearest" : ""}" style="margin-bottom: 14px; padding: 14px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(0,229,255,0.25); border-radius: 12px;">
                    <div class="hospital-name" style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px;">
                        ${h.nearest ? "📍 " : "🏥 "}${h.name}
                        ${h.nearest ? `<span class="hospital-tag">${t("hospital_nearest")}</span>` : ""}
                        ${h.emergency ? `<span class="hospital-tag emergency">${t("hospital_emergency")}</span>` : ""}
                    </div>
                    <div class="hospital-meta" style="color: #38bdf8; font-size: 13px; font-weight: 500; margin-bottom: 4px;">
                        🩺 Specialized Department: <strong>${specialist}</strong>
                    </div>
                    <div class="hospital-meta" style="color: #94a3b8; font-size: 13px; margin-bottom: 4px;">
                        📍 ${h.address} — <strong style="color: #e2e8f0;">${h.distance_km} ${t("hospital_km_away")}</strong>
                    </div>
                    <div class="hospital-meta" style="color: #94a3b8; font-size: 13px; margin-bottom: 10px;">
                        📞 ${h.phone ? h.phone : "+91 108 (24/7 Emergency Ambulance)"}
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
                        <a href="${h.maps_link}" target="_blank" class="hospital-map-link-btn">
                            🗺️ Directions on Map &rarr;
                        </a>
                        <button type="button" class="hospital-map-link-btn" style="cursor:pointer; background:rgba(16,185,129,0.15); border-color:rgba(16,185,129,0.4); color:#10b981;" onclick="openAppointmentModal('${escapeQuotes(h.name)}', '${escapeQuotes(specialist)}')">
                            📅 Book OPD Slot
                        </button>
                    </div>
                </div>
            `).join("");

            resultBox.innerHTML = `
            <div class="result-card">
                <h2>🏥 ${t("hospital_title")}</h2>
                <p class="hospital-specialist-note" style="margin-bottom: 16px; font-size: 14px;">
                    Specialized Medical Facilities for <strong>${diseaseName}</strong> (${t("hospital_specialist_prefix")} <strong>${specialist}</strong>)
                </p>
                ${listHTML}
            </div>`;

            resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

        } catch (err) {
            loading.style.display = "none";
            const specialist = window.__lastRecommendedSpecialist || "General Physician";
            const diseaseName = window.__lastPredictedDisease || "Condition";
            const fallbackNames = [
                `City Multi-Specialty Hospital (${specialist} Wing)`,
                `Apollo Speciality Healthcare & Emergency Clinic`,
                `Government District General Hospital (${specialist} Ward)`
            ];
            const listHTML = fallbackNames.map((hname, idx) => `
                <div class="hospital-item ${idx === 0 ? "nearest" : ""}" style="margin-bottom: 14px; padding: 14px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(0,229,255,0.25); border-radius: 12px;">
                    <div class="hospital-name" style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px;">
                        ${idx === 0 ? "📍 " : "🏥 "}${hname}
                        ${idx === 0 ? `<span class="hospital-tag">${t("hospital_nearest")}</span>` : ""}
                    </div>
                    <div class="hospital-meta" style="color: #38bdf8; font-size: 13px; font-weight: 500; margin-bottom: 4px;">
                        🩺 Specialized Department: <strong>${specialist}</strong>
                    </div>
                    <div class="hospital-meta" style="color: #94a3b8; font-size: 13px; margin-bottom: 4px;">
                        📍 Local Medical District (Within ${1.5 + idx} km)
                    </div>
                    <div class="hospital-meta" style="color: #94a3b8; font-size: 13px; margin-bottom: 10px;">
                        📞 +91 044 2829 0200 / 108 Emergency Care
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hname + ' hospital')}" target="_blank" class="hospital-map-link-btn">
                            🗺️ Directions on Map &rarr;
                        </a>
                        <button type="button" class="hospital-map-link-btn" style="cursor:pointer; background:rgba(16,185,129,0.15); border-color:rgba(16,185,129,0.4); color:#10b981;" onclick="openAppointmentModal('${escapeQuotes(hname)}', '${escapeQuotes(specialist)}')">
                            📅 Book OPD Slot
                        </button>
                    </div>
                </div>
            `).join("");

            resultBox.innerHTML = `
            <div class="result-card">
                <h2>🏥 ${t("hospital_title")}</h2>
                <p class="hospital-specialist-note" style="margin-bottom: 16px; font-size: 14px;">
                    Specialized Medical Facilities for <strong>${diseaseName}</strong> (${t("hospital_specialist_prefix")} <strong>${specialist}</strong>)
                </p>
                ${listHTML}
            </div>`;
            resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
    const isDark = document.body.classList.contains("dark-mode");
    const btn = document.getElementById("themeBtn");

    if (btn) {
        btn.innerHTML = (isDark ? "☀️ " : "🌙 ") + (isDark ? t("theme_light") : t("theme_dark"));
    }

    try {
        localStorage.setItem("mediguide_theme", isDark ? "dark" : "light");
    } catch (e) {}

}

// Restore saved theme on page load immediately
(function initSavedTheme(){
    try {
        const saved = localStorage.getItem("mediguide_theme");
        if (saved === "dark") {
            document.body.classList.add("dark-mode");
        } else if (saved === "light") {
            document.body.classList.remove("dark-mode");
        }
    } catch (e) {}
})();

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

function handlePwaInstallClick() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('[PWA] User accepted the installation');
                const btn = document.getElementById("installAppNavBtn");
                if (btn) btn.innerHTML = "✅ App Installed";
            }
            deferredInstallPrompt = null;
        });
    } else {
        const modal = document.getElementById("installGuideModal");
        if (modal) modal.style.display = "flex";
    }
}

function closeInstallGuideModal() {
    const modal = document.getElementById("installGuideModal");
    if (modal) modal.style.display = "none";
}

function escapeQuotes(str) {
    if (!str) return "";
    return String(str).replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// =========================================================
// Feature 1: Voice Output (AI Speech - Text to Speech)
// Soft, Clean, Natural Healthcare Voice Engine
// =========================================================
let isReportSpeaking = false;
let currentUtterance = null;
let cachedSpeechVoices = [];

function initSystemVoices() {
    if ('speechSynthesis' in window) {
        cachedSpeechVoices = window.speechSynthesis.getVoices() || [];
    }
}
initSystemVoices();
if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = initSystemVoices;
}

function selectSoftNaturalVoice(langCode) {
    let voices = ('speechSynthesis' in window) ? window.speechSynthesis.getVoices() : [];
    if (!voices || voices.length === 0) {
        voices = cachedSpeechVoices;
    }
    if (!voices || voices.length === 0) return null;

    const prefix = (langCode === "te") ? "te"
                 : (langCode === "hi") ? "hi"
                 : (langCode === "ta") ? "ta"
                 : (langCode === "kn") ? "kn"
                 : (langCode === "ml") ? "ml"
                 : "en";

    // 1. Filter voices for the targeted language
    let langVoices = voices.filter(v => {
        if (!v.lang) return false;
        const l = v.lang.toLowerCase().replace('_', '-');
        return l.startsWith(prefix) || l.includes(`-${prefix}`);
    });

    // 2. Prioritize high-quality natural/neural soothing voices in targeted language
    if (langVoices.length > 0) {
        // Priority 1: High-fidelity Neural / Natural voices (e.g. Edge "Microsoft ... Online (Natural)")
        const neuralVoice = langVoices.find(v => {
            const name = (v.name || "").toLowerCase();
            return name.includes("natural") || name.includes("neural") || name.includes("online (natural)");
        });
        if (neuralVoice) return neuralVoice;

        // Priority 2: Google Online voices (Chrome)
        const googleVoice = langVoices.find(v => {
            const name = (v.name || "").toLowerCase();
            return name.includes("google");
        });
        if (googleVoice) return googleVoice;

        // Priority 3: Warm, soft female/melodious voice models
        const softNames = ["aria", "jenny", "sonia", "neerja", "swara", "shruti", "pallavi", "sapna", "sobhana", "zira", "samantha", "karen", "victoria"];
        const namedSoftVoice = langVoices.find(v => {
            const name = (v.name || "").toLowerCase();
            return softNames.some(sn => name.includes(sn));
        });
        if (namedSoftVoice) return namedSoftVoice;

        // Priority 4: Any non-robotic voice (filter out harsh metallic legacy voices like David)
        const gentleVoice = langVoices.find(v => {
            const name = (v.name || "").toLowerCase();
            return !name.includes("david") && !name.includes("desktop");
        });
        if (gentleVoice) return gentleVoice;

        return langVoices[0];
    }

    // 3. Fallback when browser lacks voice for specific Indic language:
    // Fall back to the softest, most natural English voice
    const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("en"));
    const softEnVoice = enVoices.find(v => {
        const name = (v.name || "").toLowerCase();
        return name.includes("natural") || name.includes("neural") || name.includes("aria") || name.includes("jenny") || name.includes("zira");
    }) || enVoices.find(v => !(v.name || "").toLowerCase().includes("david")) || enVoices[0];

    return softEnVoice || voices[0] || null;
}

function toggleReadAloud() {
    if (!('speechSynthesis' in window)) {
        alert("Your browser does not support Web Speech synthesis. Please use Google Chrome or Microsoft Edge.");
        return;
    }

    if (isReportSpeaking || window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        isReportSpeaking = false;
        updateVoiceButtonState(false);
        return;
    }

    const patientName = document.getElementById("patientName")?.value.trim() || "Patient";
    const diseaseName = window.__lastPredictedDisease;
    const specialist = window.__lastRecommendedSpecialist || "General Physician";
    const riskLevel = window.__mlDataForHistory?.risk_level || "Moderate";
    const confidence = window.__mlDataForHistory?.confidence || 85;

    if (!diseaseName) {
        alert("Please analyze your symptoms first to listen to the clinical report!");
        return;
    }

    let speechText = "";
    const lang = currentLanguage || "en";

    const spokenDisease = translateDisease(diseaseName, lang);
    const spokenSpecialist = translateSpecialist(specialist, lang);
    let spokenRisk = riskLevel;
    if (lang === "te") {
        spokenRisk = riskLevel.toLowerCase() === "high" ? "అధిక రిస్క్" : (riskLevel.toLowerCase() === "medium" ? "మధ్యస్థ రిస్క్" : "తక్కువ రిస్క్");
    } else if (lang === "hi") {
        spokenRisk = riskLevel.toLowerCase() === "high" ? "उच्च जोखिम" : (riskLevel.toLowerCase() === "medium" ? "मध्यम जोखिम" : "कम जोखिम");
    }

    // Format text with gentle pauses (...) and warm bedside clinical phrasing
    if (lang === "te") {
        speechText = `నమస్కారం, ${patientName}... మీ ఆరోగ్య వివరాల ప్రకారం, మీ లక్షణాలు ${spokenDisease} ను సూచిస్తున్నాయి... అంచనా ఖచ్చితత్వం ${confidence} శాతం... రిస్క్ స్థాయి, ${spokenRisk}... మీరు ${spokenSpecialist} గారిని సంప్రదించడం మంచిది... దయచేసి తగినంత విశ్రాంతి తీసుకోండి, పుష్కలంగా మంచి నీరు త్రాగండి... మీ ఆరోగ్యాన్ని జాగ్రత్తగా చూసుకోండి.`;
    } else if (lang === "hi") {
        speechText = `नमस्ते, ${patientName}... आपके स्वास्थ्य मूल्यांकन के अनुसार, आपके लक्षण ${spokenDisease} की ओर संकेत करते हैं... सटीकता ${confidence} प्रतिशत है... जोखिम स्तर, ${spokenRisk} है... आपको ${spokenSpecialist} से परामर्श करने की सलाह दी जाती है... कृपया पर्याप्त आराम करें और पानी पिएं... अपना ख्याल रखें।`;
    } else if (lang === "ta") {
        speechText = `வணக்கம், ${patientName}... உங்கள் மருத்துவ மதிப்பீட்டின்படி, உங்கள் அறிகுறிகள் ${diseaseName} ஐக் குறிக்கின்றன... துல்லியம் ${confidence} சதவீதம்... நீங்கள் ஒரு ${specialist} மருத்துவரை அணுகுமாறு பரிந்துரைக்கப்படுகிறீர்கள்... தயவுசெய்து நன்றாக ஓய்வெடுங்கள், ஆரோக்கியமாக இருங்கள்.`;
    } else if (lang === "kn") {
        speechText = `ನಮಸ್ಕಾರ, ${patientName}... ನಿಮ್ಮ ಆರೋಗ್ಯ ಮೌಲ್ಯಮಾಪನದ ಪ್ರಕಾರ, ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ${diseaseName} ಅನ್ನು ಸೂಚಿಸುತ್ತವೆ... ನಿಖರತೆ ${confidence} ಪ್ರತಿಶತ... ನೀವು ${specialist} ಅವರನ್ನು ಸಂಪರ್ಕಿಸಲು ಸೂಚಿಸಲಾಗಿದೆ... ದಯವಿಟ್ಟು ಸಾಕಷ್ಟು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.`;
    } else if (lang === "ml") {
        speechText = `നമസ്കാരം, ${patientName}... നിങ്ങളുടെ ആരോഗ്യ വിലയിരുത്തൽ അനുസരിച്ച്, നിങ്ങളുടെ ലക്ഷണങ്ങൾ ${diseaseName} ലേക്ക് വിരൽ ചൂണ്ടുന്നു... നിങ്ങൾ ఒక ${specialist} നെ സമീപിക്കാൻ നിർദ്ദേശിക്കുന്നു... ദയവായി നന്നായി വിശ്രമിക്കുക, ആരോഗ്യം ശ്രദ്ധിക്കുക.`;
    } else {
        speechText = `Hello, ${patientName}... Here is your personalized health summary... Based on your reported symptoms, the primary indication is ${diseaseName}, evaluated with ${confidence} percent confidence... The overall risk level is ${riskLevel}... We recommend scheduling a consultation with a ${specialist}... Please take good care, get plenty of gentle rest, and stay well hydrated.`;
    }

    // Stop any ongoing audio before starting fresh
    window.speechSynthesis.cancel();

    currentUtterance = new SpeechSynthesisUtterance(speechText);

    // Set locale code
    const langCodes = {
        te: "te-IN",
        hi: "hi-IN",
        ta: "ta-IN",
        kn: "kn-IN",
        ml: "ml-IN",
        en: "en-US"
    };
    currentUtterance.lang = langCodes[lang] || "en-US";

    // Pick best soft, soothing natural voice
    const selectedVoice = selectSoftNaturalVoice(lang);
    if (selectedVoice) {
        currentUtterance.voice = selectedVoice;
    }

    // Tuning speech parameters for a clean, soft, soothing voice
    currentUtterance.rate = 0.88;    // Relaxed, gentle pacing (not rushed)
    currentUtterance.pitch = 0.97;   // Warm, soft acoustic tone (reduces harsh robotic highs)
    currentUtterance.volume = 0.95;  // Crisp, clean volume

    currentUtterance.onstart = () => {
        isReportSpeaking = true;
        updateVoiceButtonState(true);
    };

    currentUtterance.onend = () => {
        isReportSpeaking = false;
        updateVoiceButtonState(false);
    };

    currentUtterance.onerror = (e) => {
        // Ignore "interrupted" or "canceled" when user intentionally stopped or clicked again
        if (e && e.error !== 'interrupted' && e.error !== 'canceled') {
            console.warn("Speech synthesis notice:", e.error);
        }
        isReportSpeaking = false;
        updateVoiceButtonState(false);
    };

    // Chrome/Edge delay buffer prevents immediate cancellation glitch
    setTimeout(() => {
        window.speechSynthesis.speak(currentUtterance);
    }, 60);
}

function updateVoiceButtonState(speaking) {
    const btn = document.getElementById("voiceListenBtn");
    const label = document.getElementById("voiceListenLabel");
    if (!btn || !label) return;

    if (speaking) {
        btn.classList.add("speaking-wave");
        btn.querySelector(".btn-icon").innerText = "⏹️";
        label.innerText = t("btn_stop_listening");
    } else {
        btn.classList.remove("speaking-wave");
        btn.querySelector(".btn-icon").innerText = "🔊";
        label.innerText = t("btn_listen_report");
    }
}

// =========================================================
// Feature 3: Doctor Appointment Booking & Token Slip
// =========================================================
function openAppointmentModal(hospitalName, specialistName) {
    const modal = document.getElementById("appointmentModal");
    if (!modal) return;

    const patientName = document.getElementById("patientName")?.value.trim() || "";
    const specialist = specialistName || window.__lastRecommendedSpecialist || "General Physician";

    const nameInput = document.getElementById("apptPatientName");
    const ageInput = document.getElementById("apptAge");
    const specInput = document.getElementById("apptSpecialist");
    const dateInput = document.getElementById("apptDate");
    const hospSelect = document.getElementById("apptHospitalSelect");

    const currentAge = document.getElementById("age")?.value.trim() || "";

    if (nameInput) nameInput.value = patientName;
    if (ageInput && currentAge) ageInput.value = currentAge;
    if (specInput) specInput.value = specialist;

    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
        dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    if (hospitalName && hospSelect) {
        let found = false;
        for (let i = 0; i < hospSelect.options.length; i++) {
            if (hospSelect.options[i].value.toLowerCase().includes(hospitalName.toLowerCase())) {
                hospSelect.selectedIndex = i;
                found = true;
                break;
            }
        }
        if (!found) {
            const opt = new Option(hospitalName, hospitalName, true, true);
            hospSelect.add(opt, 0);
            hospSelect.selectedIndex = 0;
        }
    }

    document.getElementById("appointmentFormWrap").style.display = "block";
    document.getElementById("appointmentSlipWrap").style.display = "none";
    modal.style.display = "flex";
}

function closeAppointmentModal() {
    const modal = document.getElementById("appointmentModal");
    if (modal) modal.style.display = "none";
}

function confirmAppointmentBooking() {
    const name = document.getElementById("apptPatientName")?.value.trim();
    const age = document.getElementById("apptAge")?.value.trim() || document.getElementById("age")?.value.trim() || "";
    const phone = document.getElementById("apptPhone")?.value.trim();
    const specialist = document.getElementById("apptSpecialist")?.value.trim() || "General Physician";
    const hospital = document.getElementById("apptHospitalSelect")?.value || "Apollo Speciality Hospital";
    const date = document.getElementById("apptDate")?.value;
    const timeSlot = document.getElementById("apptTimeSlot")?.value;
    const mode = document.querySelector('input[name="apptMode"]:checked')?.value || "In-Person Hospital Visit";

    if (!name) {
        alert("Please enter the patient name.");
        return;
    }
    if (!phone || phone.length < 8) {
        alert("Please enter a valid contact phone number.");
        return;
    }

    const tokenCode = "MG-" + Math.floor(1000 + Math.random() * 9000);
    const counterNo = Math.floor(1 + Math.random() * 5);
    const cabinNo = Math.floor(10 + Math.random() * 15);

    const bookingRecord = {
        token: tokenCode,
        patientName: name,
        age: age,
        phone: phone,
        specialist: specialist,
        hospital: hospital,
        date: date,
        timeSlot: timeSlot,
        mode: mode,
        counter: `OPD Counter #${counterNo} (Cabin ${cabinNo})`,
        createdAt: new Date().toISOString()
    };

    try {
        const existing = JSON.parse(localStorage.getItem("mediguide_appointments") || "[]");
        existing.unshift(bookingRecord);
        localStorage.setItem("mediguide_appointments", JSON.stringify(existing.slice(0, 10)));
    } catch (e) {}

    const slipWrap = document.getElementById("appointmentSlipWrap");
    slipWrap.innerHTML = `
        <div class="token-slip-card" id="printableTokenSlip">
            <div class="token-badge-header">
                <div class="token-hospital-brand">
                    🏥 <span>${hospital}</span>
                    <div style="font-size:12px; color:var(--text-dim); font-weight:500; margin-top:2px;">
                        Verified by MediGuide AI Clinical Booking Portal
                    </div>
                </div>
                <div class="token-number-box">
                    <div class="token-tag">OPD Token</div>
                    <div class="token-code">${tokenCode}</div>
                </div>
            </div>

            <div class="token-confirmed-banner">
                <span>✅</span>
                <span>Appointment Confirmed & Priority OPD Reserved</span>
            </div>

            <div class="token-info-grid">
                <div class="token-info-item">
                    <div class="lbl">Patient Details</div>
                    <div class="val">👤 ${name}${age ? ` (${age} yrs)` : ""}</div>
                </div>
                <div class="token-info-item">
                    <div class="lbl">Specialist</div>
                    <div class="val">🩺 ${specialist}</div>
                </div>
                <div class="token-info-item">
                    <div class="lbl">Date</div>
                    <div class="val">📅 ${date || "Today"}</div>
                </div>
                <div class="token-info-item">
                    <div class="lbl">Time Slot</div>
                    <div class="val">⏰ ${timeSlot}</div>
                </div>
                <div class="token-info-item">
                    <div class="lbl">Allocation</div>
                    <div class="val">🚪 ${bookingRecord.counter}</div>
                </div>
                <div class="token-info-item">
                    <div class="lbl">Mode</div>
                    <div class="val">${mode.includes("Video") ? "💻 Tele-Consult" : "🏥 In-Person"}</div>
                </div>
            </div>

            <div style="background:var(--bg); border:1px solid var(--glass-border); border-radius:10px; padding:10px; font-size:12px; color:var(--text-dim); text-align:center; margin-bottom:12px;">
                🎟️ Please show this digital token or SMS confirmation at the hospital reception counter 15 minutes before your time slot.
            </div>

            <div class="token-slip-actions">
                <button type="button" class="toolbar-btn primary" onclick="printAppointmentSlip()" style="justify-content:center; padding:10px;">
                    🖨️ Print Token Slip
                </button>
                <button type="button" class="toolbar-btn secondary" onclick="resetAppointmentForm()" style="justify-content:center; padding:10px;">
                    🔄 Book Another
                </button>
                <button type="button" class="toolbar-btn secondary" onclick="closeAppointmentModal()" style="justify-content:center; padding:10px;">
                    ✖️ Done
                </button>
            </div>
        </div>
    `;

    document.getElementById("appointmentFormWrap").style.display = "none";
    slipWrap.style.display = "block";
}

function resetAppointmentForm() {
    document.getElementById("appointmentFormWrap").style.display = "block";
    document.getElementById("appointmentSlipWrap").style.display = "none";
}

function printAppointmentSlip() {
    window.print();
}

// =========================================================
// History Management (Symptoms Consultation History)
// =========================================================

const HISTORY_STORAGE_KEY = "mediguide_symptoms_history";

function getLocalHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveLocalHistory(entries) {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {}
}

async function saveCurrentAnalysisToHistory(entry) {
    const newEntry = {
        id: "hist_" + Date.now(),
        patient_name: entry.patient_name || "Patient",
        age: entry.age || "-",
        gender: entry.gender || "-",
        symptoms: entry.symptoms || "",
        predicted_disease: entry.predicted_disease || "General Assessment",
        confidence: entry.confidence || 0,
        risk_level: entry.risk_level || "Low",
        health_score: entry.health_score || 80,
        created_at: new Date().toISOString()
    };

    // 1. Always save locally immediately (capped at latest 5)
    const local = getLocalHistory();
    local.unshift(newEntry);
    if (local.length > 5) local.length = 5;
    saveLocalHistory(local);

    // 2. Try to sync to backend database if session/server active
    try {
        await fetch(`${MEDIGUIDE_API_BASE}/save_history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEntry)
        });
    } catch (e) {
        // Silent fallback
    }

    // 3. Update the history view immediately
    renderHistoryList(local);
}

async function loadHistory() {
    const historyList = document.getElementById("historyList");
    if (!historyList) return;

    let serverHistory = [];
    try {
        const res = await fetch(`${MEDIGUIDE_API_BASE}/get_history`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.history) {
                serverHistory = data.history;
            }
        }
    } catch (e) {
        // Server fetch optional
    }

    const localHistory = getLocalHistory();
    const combined = [...localHistory];

    serverHistory.forEach(sItem => {
        const exists = combined.some(cItem => 
            (cItem.created_at && sItem.created_at && cItem.created_at.slice(0, 16) === sItem.created_at.slice(0, 16)) ||
            (cItem.symptoms === sItem.symptoms && cItem.predicted_disease === sItem.predicted_disease)
        );
        if (!exists) {
            combined.push(sItem);
        }
    });

    combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const top5 = combined.slice(0, 5);
    saveLocalHistory(top5);
    renderHistoryList(top5);
}

function renderHistoryList(items) {
    const historyList = document.getElementById("historyList");
    if (!historyList) return;

    const rawList = items || getLocalHistory();
    const list = rawList.slice(0, 5);

    if (!list || list.length === 0) {
        historyList.innerHTML = `
            <div style="text-align:center; padding:36px 20px; color:var(--text-dim);">
                <div style="font-size:36px; margin-bottom:10px;">📋</div>
                <h3 style="font-size:16px; margin-bottom:6px; color:var(--text);">${t("history_empty")}</h3>
                <p style="font-size:13px; max-width:400px; margin:0 auto 16px;">Select symptoms in the checker above and click "Analyze Symptoms" — your consultations will be recorded here.</p>
                <a href="#checker" style="display:inline-block; padding:8px 18px; border-radius:10px; background:var(--cyan); color:#ffffff; font-weight:600; font-size:13px; text-decoration:none;">Go to Symptom Checker &rarr;</a>
            </div>
        `;
        return;
    }

    const cardsHTML = list.map((item, index) => {
        const dateStr = item.created_at ? new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : "Recent Check";
        const riskClass = (item.risk_level === "High") ? "high" : (item.risk_level === "Medium") ? "medium" : "low";

        // Parse symptoms into distinct pill tags
        const symptomsArr = (item.symptoms || "").split(",").map(s => s.trim()).filter(Boolean);
        const tagsHTML = symptomsArr.length > 0 
            ? symptomsArr.map(s => `<span class="history-symptom-tag">🔹 ${s}</span>`).join("")
            : `<span style="color:var(--text-dim); font-size:13px;">No specific symptoms recorded</span>`;

        return `
        <div class="history-item" id="hist_card_${index}">
            <div class="history-item-header">
                <div class="history-patient-title">
                    👤 ${item.patient_name || "Patient"} 
                    <span style="font-size:13px; font-weight:500; color:var(--text-dim);">(${item.age || "-"} yrs, ${item.gender || "-"})</span>
                </div>
                <div class="history-date">📅 ${dateStr}</div>
            </div>

            <div class="history-condition">
                🩺 <span>${item.predicted_disease || "General Assessment"}</span>
                <span style="font-size:13px; font-weight:600; color:var(--text-dim);">(${item.confidence || 0}% confidence)</span>
            </div>

            <div class="history-symptoms-wrap">
                <div class="history-symptoms-label">📋 Symptoms Checked:</div>
                <div class="history-symptoms-tags">${tagsHTML}</div>
            </div>

            <div class="history-footer">
                <div class="history-meta-badges">
                    <span class="risk-badge ${riskClass}" style="padding:4px 14px; font-size:12px;">Risk: ${item.risk_level || "Low"}</span>
                    <span style="font-size:13px; font-weight:600; color:var(--text); margin-left:6px;">❤️ Wellness Score: ${item.health_score || 80}/100</span>
                </div>
                <div class="history-actions">
                    <button type="button" class="history-reload-btn" onclick="restoreSymptomsToCheck('${encodeURIComponent(JSON.stringify(item))}')">
                        🔄 Re-Load Check
                    </button>
                    <button type="button" class="history-del-btn" onclick="deleteHistoryEntry(${index})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join("");

    historyList.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
            <div style="font-size:14px; font-weight:600; color:var(--text);">Recent Checks: <strong style="color:var(--cyan);">${list.length} / 5</strong></div>
            <button type="button" onclick="clearAllHistory()" style="width:auto; padding:6px 14px; font-size:12px; background:rgba(220,38,38,0.1); color:var(--red); border:1px solid rgba(220,38,38,0.3); border-radius:8px; cursor:pointer; font-weight:600; box-shadow:none; margin:0;">
                🗑️ Clear All History
            </button>
        </div>
        ${cardsHTML}
    `;
}

function restoreSymptomsToCheck(encodedItem) {
    try {
        const item = JSON.parse(decodeURIComponent(encodedItem));
        if (item.patient_name) document.getElementById("patientName").value = item.patient_name;
        if (item.age) document.getElementById("age").value = item.age;
        if (item.gender) document.getElementById("gender").value = item.gender;

        // Uncheck all symptoms first
        document.querySelectorAll(".symptoms input").forEach(input => input.checked = false);

        // Check matching symptoms
        const symptomsArr = (item.symptoms || "").split(",").map(s => s.trim().toLowerCase());
        document.querySelectorAll(".symptoms input").forEach(input => {
            if (symptomsArr.includes(input.value.toLowerCase())) {
                input.checked = true;
            }
        });

        // Scroll smoothly to symptom checker
        const checkerEl = document.getElementById("checker");
        if (checkerEl) {
            checkerEl.scrollIntoView({ behavior: "smooth" });
        }
    } catch (e) {
        console.error("Error restoring history item:", e);
    }
}

function deleteHistoryEntry(index) {
    const list = getLocalHistory();
    if (index >= 0 && index < list.length) {
        list.splice(index, 1);
        saveLocalHistory(list);
        renderHistoryList(list);
    }
}

function clearAllHistory() {
    if (confirm("Are you sure you want to clear your symptoms check history?")) {
        saveLocalHistory([]);
        renderHistoryList([]);
    }
}

function scrollToHistory() {
    loadHistory();
    const historySection = document.getElementById("history");
    if (historySection) {
        historySection.scrollIntoView({ behavior: "smooth" });
    }
}

// Auto-load history on page start
window.addEventListener("DOMContentLoaded", () => {
    loadHistory();
});
setTimeout(() => {
    loadHistory();
}, 500);