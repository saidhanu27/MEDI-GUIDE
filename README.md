# 🩺 MediGuide AI — Smart Clinical Health Assistant

MediGuide AI is an intelligent clinical diagnostic and triage healthcare assistant that provides real-time symptom analysis, clinical risk assessment, wellness scoring, multilingual speech synthesis, OPD doctor consultation booking with digital tokens, and disease-specific hospital routing.

---

## 📁 Project Directory Structure

The project is cleanly modularized into dedicated **Frontend** and **Backend** directories for structured maintainability and presentation:

```text
MEDI-GUIDE/
├── frontend/                     # Client-side user interface & assets
│   ├── index.html                # Main clinical dashboard & triage UI
│   ├── style.css                 # Medical UI styling, animations & dark/light themes
│   ├── script.js                 # Clinical logic, diagnostic match visualization & TTS
│   ├── translations.js           # Multilingual i18n dictionaries (Telugu, Hindi, English, etc.)
│   ├── auth.js                   # Patient login, signup & guest mode session handler
│   ├── bg-animation.js           # Dynamic medical particle canvas animation
│   ├── config.js                 # Frontend API configuration
│   ├── manifest.json             # PWA (Progressive Web App) manifest
│   ├── sw.js                     # Service Worker for offline capability & caching
│   ├── logo.png                  # App icon & logo
│   ├── project_chart.html        # Interactive presentation chart web poster
│   └── assets/                   # Medical graphics, badges & icons
│
├── backend/                      # Server-side API, database & diagnostic engine
│   ├── app.py                    # Flask REST API & static file web server
│   ├── database.py               # SQLite database manager (users, history, tokens)
│   ├── model.pkl                 # Trained diagnostic prediction model
│   ├── mediguide.db              # SQLite database storage
│   ├── requirements.txt          # Python backend dependencies
│   ├── dataset.csv               # Comprehensive clinical symptom-to-condition dataset
│   ├── train model.py            # Model training & validation pipeline
│   ├── generate dataset.py       # Clinical dataset generation script
│   ├── build_presentation_pdf.py # High-resolution presentation PDF builder
│   ├── create_presentation_graphics.py # Medical diagram generator script
│   ├── chart_assets/             # High-res diagrams & flowcharts
│   ├── MediGuide_AI_Project_Presentation_Chart.pdf # Printable 3-page chart
│   └── PROJECT_CHART.md          # Comprehensive project presentation documentation
│
├── start_app.bat                 # 1-Click launcher for local execution
├── start_fixed_link.bat          # 1-Click launcher with fixed public tunnel
├── Procfile                      # Render cloud deployment specification
├── render.yaml                   # Render Blueprint infrastructure configuration
└── requirements.txt              # Root dependency reference
```

---

## 🚀 How to Run MediGuide AI

### Option 1: 1-Click Desktop Launcher
Simply double-click:
```cmd
start_app.bat
```
This automatically verifies dependencies and launches MediGuide AI in your browser at `http://127.0.0.1:5050`.

### Option 2: Running via Python
From the project root:
```cmd
pip install -r requirements.txt
python app.py
```
Or directly from the backend directory:
```cmd
cd backend
pip install -r requirements.txt
python app.py
```

### Option 3: Fixed Public Tunnel
Double click `start_fixed_link.bat` to launch the app and generate a fixed public link.

---

## 🌟 Key Features
- **Intelligent Clinical Assessment**: Analyzes selected symptoms and returns primary indications with confidence percentages.
- **Dual-Layer Diagnostic Visualization**: Animated progress meter bars and interactive comparison graphs.
- **Instant Multilingual Switching**: Dynamically translates the entire clinical report into Telugu, Hindi, English, and regional languages.
- **Clinical PDF Generation**: Generates high-resolution patient reports with SVG wellness gauges and printable clinical layouts.
- **OPD Appointment Booking**: Generates digital consultation tokens with QR codes.
- **Hospital Locator**: Routes to nearby specialist medical centers using live geolocation and Google Maps navigation.
