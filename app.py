"""
app.py
========
Flask REST API + static file server for MediGuide AI.

This single Flask app does TWO jobs:
  1. Serves the frontend (index.html, script.js, style.css, etc.)
  2. Serves the ML/auth/hospital-finder REST API

This means the whole project is ONE deployment with ONE URL —
works the same on a laptop, a phone, or any other device, as long
as that device can reach the internet.

Run locally with:  python app.py
Then open:          http://127.0.0.1:5000
"""

import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pickle
import numpy as np
import math
import requests
import re

import database

# The frontend files (index.html, script.js, style.css, ...) live one
# folder up from this file (backend/app.py -> ../index.html)
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)  # harmless to keep even when same-origin; avoids issues if opened separately

database.init_db()


@app.route("/")
def serve_index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:filename>")
def serve_frontend_files(filename):
    """
    Serves any other frontend file (script.js, style.css, translations.js,
    auth.js, config.js, assets/medical-bg.svg, ...) directly by name.
    API routes defined below (e.g. /predict, /login) take priority over
    this because Flask matches more specific routes first.
    """
    full_path = os.path.join(FRONTEND_DIR, filename)
    if os.path.isfile(full_path):
        return send_from_directory(FRONTEND_DIR, filename)
    return jsonify({"error": "Not found"}), 404


def get_logged_in_user():
    """Reads the Authorization: Bearer <token> header and returns the
    matching user dict, or None if not logged in / invalid token."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.replace("Bearer ", "", 1).strip()
    return database.get_user_from_token(token)


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True)
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "Username, email and password are all required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"error": "Please enter a valid email address."}), 400

    result = database.create_user(username, email, password)

    if not result["success"]:
        return jsonify({"error": result["error"]}), 409

    token = database.create_session(result["user_id"])
    user = database.get_user_by_id(result["user_id"])

    return jsonify({"token": token, "user": user})


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    username_or_email = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username_or_email or not password:
        return jsonify({"error": "Username/email and password are required."}), 400

    user = database.verify_user(username_or_email, password)

    if not user:
        return jsonify({"error": "Incorrect username/email or password."}), 401

    token = database.create_session(user["id"])

    return jsonify({
        "token": token,
        "user": {"id": user["id"], "username": user["username"], "email": user["email"]}
    })


@app.route("/logout", methods=["POST"])
def logout():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "", 1).strip()
        database.delete_session(token)
    return jsonify({"success": True})


@app.route("/me", methods=["GET"])
def me():
    user = get_logged_in_user()
    if not user:
        return jsonify({"error": "Not logged in."}), 401
    return jsonify({"user": user})


@app.route("/save_history", methods=["POST"])
def save_history():
    user = get_logged_in_user()
    if not user:
        return jsonify({"error": "Not logged in."}), 401

    data = request.get_json(force=True)

    database.add_history_entry(
        user_id=user["id"],
        patient_name=data.get("patient_name"),
        age=data.get("age"),
        gender=data.get("gender"),
        symptoms=data.get("symptoms"),
        predicted_disease=data.get("predicted_disease"),
        confidence=data.get("confidence"),
        risk_level=data.get("risk_level"),
        health_score=data.get("health_score")
    )

    return jsonify({"success": True})


@app.route("/get_history", methods=["GET"])
def get_history():
    user = get_logged_in_user()
    if not user:
        return jsonify({"error": "Not logged in."}), 401

    history = database.get_history_for_user(user["id"])
    return jsonify({"history": history})

with open("model.pkl", "rb") as f:
    saved = pickle.load(f)

model = saved["model"]
SYMPTOMS = saved["symptoms"]      # fixed feature order
CLASSES = saved["classes"]

# Basic disease -> risk level mapping (used alongside model confidence)
HIGH_RISK_DISEASES = {"Dengue", "Malaria", "Heart Related Issue", "COVID-19", "Typhoid"}
MEDIUM_RISK_DISEASES = {"Flu", "Food Poisoning", "Gastritis", "Asthma", "Bronchitis",
                         "Chickenpox", "Urinary Tract Infection", "Allergic Reaction"}

# Disease -> recommended specialist doctor / department.
# Used to tell the person WHICH kind of doctor/hospital department to look
# for, since OpenStreetMap rarely tags hospitals with department-level detail.
DISEASE_TO_SPECIALIST = {
    "Common Cold":              "General Physician",
    "Flu":                      "General Physician",
    "COVID-19":                 "Pulmonologist",
    "Migraine":                 "Neurologist",
    "Food Poisoning":           "Gastroenterologist",
    "Gastritis":                "Gastroenterologist",
    "Dengue":                   "General Physician",
    "Malaria":                  "General Physician",
    "Anxiety":                  "Psychiatrist / Psychologist",
    "Heart Related Issue":      "Cardiologist",
    "Typhoid":                  "General Physician",
    "Asthma":                   "Pulmonologist",
    "Sinusitis":                "ENT Specialist",
    "Chickenpox":               "Dermatologist / General Physician",
    "Urinary Tract Infection":  "Urologist",
    "Arthritis":                "Orthopedic / Rheumatologist",
    "Bronchitis":               "Pulmonologist",
    "Allergic Reaction":        "Allergist / Dermatologist",
}

# Map each specialist to OpenStreetMap healthcare:speciality tag values
# worth trying when searching, and to an amenity=hospital fallback.
SPECIALIST_TO_OSM_SPECIALITY = {
    "Cardiologist":                        ["cardiology"],
    "Neurologist":                         ["neurology"],
    "Gastroenterologist":                  ["gastroenterology"],
    "Psychiatrist / Psychologist":         ["psychiatry", "psychology"],
    "Pulmonologist":                       ["pulmonology"],
    "ENT Specialist":                      ["otolaryngology", "ent"],
    "Dermatologist / General Physician":   ["dermatology"],
    "Urologist":                           ["urology"],
    "Orthopedic / Rheumatologist":         ["orthopaedics", "rheumatology"],
    "Allergist / Dermatologist":           ["allergology", "dermatology"],
    "Dentist":                             ["dentistry"],
    "Ophthalmologist":                     ["ophthalmology"],
    "Gynecologist":                        ["gynaecology", "gynecology"],
    "Pediatrician":                        ["paediatrics", "pediatrics"],
    "Nephrologist":                        ["nephrology"],
    "Endocrinologist":                     ["endocrinology"],
    "General Physician":                   [],
}

# Fallback: many Indian hospitals put their specialty right in the NAME
# (e.g. "Centre For Vision and Eye Surgery") without ever adding a formal
# healthcare:speciality tag. Matching on the name catches a lot more
# real, relevant results than the tag alone.
SPECIALIST_TO_NAME_KEYWORDS = {
    "Cardiologist":                        ["heart", "cardiac", "cardio"],
    "Neurologist":                         ["neuro", "brain"],
    "Gastroenterologist":                  ["gastro", "digestive", "liver"],
    "Psychiatrist / Psychologist":         ["mental", "psychiatr", "psycholog", "mind"],
    "Pulmonologist":                       ["chest", "lung", "respiratory", "pulmo"],
    "ENT Specialist":                      ["e\\.?n\\.?t\\.?", "ear nose", "throat"],
    "Dermatologist / General Physician":   ["skin", "derma"],
    "Urologist":                           ["urology", "kidney", "urologist"],
    "Orthopedic / Rheumatologist":         ["ortho", "bone", "joint"],
    "Allergist / Dermatologist":           ["allerg", "skin", "derma"],
    "Dentist":                             ["dental", "dentist", "tooth"],
    "Ophthalmologist":                     ["eye", "vision", "ophthal", "optical"],
    "Gynecologist":                        ["gynec", "gynaec", "maternity", "women"],
    "Pediatrician":                        ["child", "pediatric", "paediatric", "kids"],
    "Nephrologist":                        ["nephro", "kidney", "dialysis"],
    "Endocrinologist":                     ["endocrin", "diabetes", "thyroid"],
    "General Physician":                   ["general", "multi.?speciality", "clinic"],
}

# =========================================================
# Free-text symptom -> specialist keyword map
# (used by /find_doctor, where the person can type ANY symptom,
# not just the 15 checkboxes used by the ML model)
# =========================================================
SYMPTOM_TEXT_TO_SPECIALIST = [
    # (list of keywords to look for in the free text, specialist to recommend)
    # Checked in order — first match wins — so more specific keywords are listed first.
    (["tooth", "teeth", "gum", "cavity", "dental"], "Dentist"),
    (["eye", "vision", "blurry vision", "red eye"], "Ophthalmologist"),
    (["ear pain", "earache", "hearing"], "ENT Specialist"),
    (["nose", "sinus", "throat", "tonsil"], "ENT Specialist"),
    (["chest pain", "heart", "palpitation", "bp", "blood pressure"], "Cardiologist"),
    (["breath", "asthma", "wheeze", "lung", "cough"], "Pulmonologist"),
    (["stomach", "vomit", "nausea", "gastric", "acidity", "digestion", "liver"], "Gastroenterologist"),
    (["diarrhea", "diarrhoea", "loose motion"], "Gastroenterologist"),
    (["skin", "rash", "itch", "acne", "allergy"], "Dermatologist / General Physician"),
    (["joint", "bone", "fracture", "back pain", "knee", "arthritis"], "Orthopedic / Rheumatologist"),
    (["urine", "urinary", "kidney stone", "bladder"], "Urologist"),
    (["dialysis", "kidney"], "Nephrologist"),
    (["diabetes", "thyroid", "sugar level"], "Endocrinologist"),
    (["pregnan", "period", "menstrual", "gynec"], "Gynecologist"),
    (["child", "baby", "infant", "kid"], "Pediatrician"),
    (["headache", "migraine", "dizziness", "seizure", "numbness"], "Neurologist"),
    (["anxiety", "depress", "stress", "panic", "mental"], "Psychiatrist / Psychologist"),
    (["fever", "cold", "body pain", "weakness", "fatigue"], "General Physician"),
]


def resolve_specialist_from_text(text):
    """Looks for known keywords in free-text symptom description and
    returns the best-matching specialist, or 'General Physician' if
    nothing specific is recognised."""
    text_lower = text.lower()
    for keywords, specialist in SYMPTOM_TEXT_TO_SPECIALIST:
        for kw in keywords:
            if kw in text_lower:
                return specialist
    return "General Physician"


OVERPASS_HEADERS = {
    "Content-Type": "text/plain",
    "User-Agent": "MediGuideAI-StudentProject/1.0 (educational use)"
}

OVERPASS_SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
]


def run_overpass_query(query_text):
    last_err = None
    for server_url in OVERPASS_SERVERS:
        try:
            resp = requests.post(server_url, data=query_text, headers=OVERPASS_HEADERS, timeout=20)
            resp.raise_for_status()
            return resp.json().get("elements", []), None
        except Exception as e:
            last_err = e
            continue
    return None, last_err


def search_hospitals_for_specialist(lat, lng, resolved_specialist, radius_m=30000):
    """
    Core hospital search used by both /nearby_hospitals and /find_doctor.
    Returns (hospitals_list, match_type, error_message_or_None).
    match_type is one of: "speciality_tag", "name_match", "general", "none"
    """
    speciality_values = SPECIALIST_TO_OSM_SPECIALITY.get(resolved_specialist, [])
    name_keywords = SPECIALIST_TO_NAME_KEYWORDS.get(resolved_specialist, [])

    speciality_filter = ""
    if speciality_values:
        regex = "|".join(speciality_values)
        speciality_filter = f'["healthcare:speciality"~"{regex}",i]'

    name_filter = ""
    if name_keywords:
        regex = "|".join(name_keywords)
        name_filter = f'["name"~"{regex}",i]'

    tag_query = f"""
    [out:json][timeout:15];
    (
      node["amenity"~"hospital|clinic|doctors"]{speciality_filter}(around:{radius_m},{lat},{lng});
      way["amenity"~"hospital|clinic|doctors"]{speciality_filter}(around:{radius_m},{lat},{lng});
    );
    out center;
    """

    name_query = f"""
    [out:json][timeout:15];
    (
      node["amenity"~"hospital|clinic|doctors"]{name_filter}(around:{radius_m},{lat},{lng});
      way["amenity"~"hospital|clinic|doctors"]{name_filter}(around:{radius_m},{lat},{lng});
    );
    out center;
    """

    general_query = f"""
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:{radius_m},{lat},{lng});
      way["amenity"="hospital"](around:{radius_m},{lat},{lng});
    );
    out center;
    """

    elements = None
    last_error = None
    match_type = "none"

    if speciality_filter:
        elements, last_error = run_overpass_query(tag_query)
        if elements:
            match_type = "speciality_tag"

    if not elements and name_filter:
        elements, last_error = run_overpass_query(name_query)
        if elements:
            match_type = "name_match"

    # Only fall back to unrelated general hospitals when NO specialist
    # was resolved at all (e.g. plain General Physician case).
    if not elements and resolved_specialist in (None, "General Physician") and not name_filter:
        elements, last_error = run_overpass_query(general_query)
        match_type = "general"

    # IMPORTANT: If a specialist WAS expected but neither the tag nor name
    # search found anything, still show the closest general hospitals
    # rather than an empty result — but mark match_type as "general" so
    # the frontend can clearly tell the person this isn't a confirmed
    # specialty match, and to call ahead.
    if not elements:
        elements, last_error = run_overpass_query(general_query)
        if elements:
            match_type = "general"

    # Extra safety net for the demo: if even the general hospital search
    # comes back empty at this radius (very rural area), widen the search
    # once more before giving up.
    if not elements:
        wider_query = f"""
        [out:json][timeout:20];
        (
          node["amenity"="hospital"](around:70000,{lat},{lng});
          way["amenity"="hospital"](around:70000,{lat},{lng});
        );
        out center;
        """
        elements, last_error = run_overpass_query(wider_query)
        if elements:
            match_type = "general"

    if elements is None and last_error is not None:
        return None, match_type, str(last_error)

    if elements is None:
        elements = []

    hospitals = []

    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name", "Unnamed Hospital")

        if el.get("type") == "node":
            h_lat, h_lng = el.get("lat"), el.get("lon")
        else:
            center = el.get("center", {})
            h_lat, h_lng = center.get("lat"), center.get("lon")

        if h_lat is None or h_lng is None:
            continue

        address_parts = [
            tags.get("addr:housenumber", ""),
            tags.get("addr:street", ""),
            tags.get("addr:suburb", ""),
            tags.get("addr:city", "")
        ]
        address = ", ".join([p for p in address_parts if p])
        maps_link = f"https://www.google.com/maps?q={h_lat},{h_lng}"

        if not address:
            address = "Exact address not tagged on OpenStreetMap"

        distance_km = round(haversine_km(lat, lng, h_lat, h_lng), 2)

        hospitals.append({
            "name": name,
            "address": address,
            "maps_link": maps_link,
            "distance_km": distance_km,
            "phone": tags.get("phone") or tags.get("contact:phone"),
            "emergency": tags.get("emergency") == "yes"
        })

    hospitals.sort(key=lambda h: h["distance_km"])
    hospitals = hospitals[:8]

    for i, h in enumerate(hospitals):
        h["nearest"] = (i == 0)

    return hospitals, match_type, None


@app.route("/find_doctor", methods=["POST"])
def find_doctor():
    """
    Takes ANY free-text symptom description (e.g. "toothache", "eye pain",
    "chest pain since morning") and:
      1. Resolves which kind of doctor/specialist is relevant
         (or uses the "specialist" field directly if already known,
         e.g. from a prior ML prediction)
      2. Searches OpenStreetMap for nearby hospitals/clinics matching
         that specialist (within `radius_km`, default 30km)
    """
    data = request.get_json(force=True)
    symptom_text = (data.get("symptom_text") or "").strip()
    given_specialist = data.get("specialist")
    lat = data.get("lat")
    lng = data.get("lng")
    radius_km = data.get("radius_km", 30)

    if not symptom_text and not given_specialist:
        return jsonify({"error": "Please describe your symptom."}), 400

    if lat is None or lng is None:
        return jsonify({"error": "lat and lng are required"}), 400

    if given_specialist and given_specialist in SPECIALIST_TO_OSM_SPECIALITY:
        resolved_specialist = given_specialist
    else:
        resolved_specialist = resolve_specialist_from_text(symptom_text)

    hospitals, match_type, error = search_hospitals_for_specialist(
        lat, lng, resolved_specialist, radius_m=int(radius_km * 1000)
    )

    if error is not None:
        return jsonify({"error": f"Could not reach OpenStreetMap: {error}"}), 502

    return jsonify({
        "symptom_text": symptom_text,
        "recommended_specialist": resolved_specialist,
        "source": "OpenStreetMap (free, no ratings available)",
        "count": len(hospitals),
        "hospitals": hospitals,
        "match_type": match_type,
        "matched_specialist_facilities": match_type in ("speciality_tag", "name_match"),
        "search_radius_km": radius_km
    })


@app.route("/api/status", methods=["GET"])
def api_status():
    return jsonify({
        "status": "ok",
        "message": "MediGuide AI backend is running.",
        "endpoints": ["/predict (POST)", "/find_doctor (POST)", "/signup (POST)",
                      "/login (POST)", "/save_history (POST)", "/get_history (GET)"]
    })


def haversine_km(lat1, lng1, lat2, lng2):
    """Distance in km between two lat/lng points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)

    selected_symptoms = data.get("symptoms", [])
    if not isinstance(selected_symptoms, list) or len(selected_symptoms) == 0:
        return jsonify({"error": "Please provide a non-empty 'symptoms' list."}), 400

    # Build the feature vector in the exact order the model was trained on
    feature_vector = [1 if s in selected_symptoms else 0 for s in SYMPTOMS]
    X = np.array(feature_vector).reshape(1, -1)

    probabilities = model.predict_proba(X)[0]
    predicted_index = int(np.argmax(probabilities))
    predicted_disease = CLASSES[predicted_index]
    confidence = round(float(probabilities[predicted_index]) * 100, 2)

    # Top 3 possible diseases, sorted by probability
    top3_idx = np.argsort(probabilities)[::-1][:3]
    top3 = [
        {"disease": CLASSES[i], "confidence": round(float(probabilities[i]) * 100, 2)}
        for i in top3_idx
    ]

    if predicted_disease in HIGH_RISK_DISEASES:
        risk = "High"
    elif predicted_disease in MEDIUM_RISK_DISEASES:
        risk = "Medium"
    else:
        risk = "Low"

    specialist = DISEASE_TO_SPECIALIST.get(predicted_disease, "General Physician")

    return jsonify({
        "predicted_disease": predicted_disease,
        "confidence": confidence,
        "risk_level": risk,
        "top_predictions": top3,
        "recommended_specialist": specialist,
        "algorithm": "Random Forest Classifier (scikit-learn)"
    })


if __name__ == "__main__":
    # Render (and most cloud hosts) tell the app which port to bind to
    # via the PORT environment variable. Locally, this defaults to 5000.
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    app.run(debug=debug_mode, host="0.0.0.0", port=port)