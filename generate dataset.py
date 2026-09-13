"""
generate_dataset.py
=====================
Generates a synthetic symptoms -> disease dataset for MediGuide AI.

Symptoms (binary features, order matters - must match script.js checkboxes):
    Fever, Headache, Cough, Body Pain, Vomiting, Stomach Pain,
    Chest Pain, Shortness of Breath, Fatigue, Dizziness,
    Sore Throat, Skin Rash, Joint Pain, Diarrhea, Loss of Appetite

Diseases (labels): 18 conditions, listed in DISEASE_PROFILES below.
"""

import random
import pandas as pd

random.seed(42)

SYMPTOMS = [
    "Fever", "Headache", "Cough", "Body Pain", "Vomiting",
    "Stomach Pain", "Chest Pain", "Shortness of Breath",
    "Fatigue", "Dizziness", "Sore Throat", "Skin Rash",
    "Joint Pain", "Diarrhea", "Loss of Appetite"
]

# Typical symptom probability profile per disease.
# Each value = probability that symptom is present (0-1) for that disease.
# Values are illustrative approximations for an educational project,
# not clinical ground truth.
DISEASE_PROFILES = {

    "Common Cold": {
        "Fever": 0.3, "Headache": 0.4, "Cough": 0.9, "Body Pain": 0.3,
        "Vomiting": 0.05, "Stomach Pain": 0.05, "Chest Pain": 0.05,
        "Shortness of Breath": 0.05, "Fatigue": 0.5, "Dizziness": 0.1,
        "Sore Throat": 0.75, "Skin Rash": 0.02, "Joint Pain": 0.1,
        "Diarrhea": 0.05, "Loss of Appetite": 0.2
    },
    "Flu": {
        "Fever": 0.9, "Headache": 0.7, "Cough": 0.7, "Body Pain": 0.85,
        "Vomiting": 0.15, "Stomach Pain": 0.1, "Chest Pain": 0.1,
        "Shortness of Breath": 0.15, "Fatigue": 0.85, "Dizziness": 0.3,
        "Sore Throat": 0.5, "Skin Rash": 0.02, "Joint Pain": 0.4,
        "Diarrhea": 0.1, "Loss of Appetite": 0.5
    },
    "COVID-19": {
        "Fever": 0.8, "Headache": 0.5, "Cough": 0.8, "Body Pain": 0.6,
        "Vomiting": 0.1, "Stomach Pain": 0.1, "Chest Pain": 0.3,
        "Shortness of Breath": 0.6, "Fatigue": 0.8, "Dizziness": 0.2,
        "Sore Throat": 0.45, "Skin Rash": 0.05, "Joint Pain": 0.3,
        "Diarrhea": 0.15, "Loss of Appetite": 0.4
    },
    "Migraine": {
        "Fever": 0.05, "Headache": 0.95, "Cough": 0.05, "Body Pain": 0.2,
        "Vomiting": 0.4, "Stomach Pain": 0.1, "Chest Pain": 0.05,
        "Shortness of Breath": 0.05, "Fatigue": 0.4, "Dizziness": 0.6,
        "Sore Throat": 0.02, "Skin Rash": 0.01, "Joint Pain": 0.05,
        "Diarrhea": 0.05, "Loss of Appetite": 0.3
    },
    "Food Poisoning": {
        "Fever": 0.4, "Headache": 0.2, "Cough": 0.05, "Body Pain": 0.3,
        "Vomiting": 0.85, "Stomach Pain": 0.9, "Chest Pain": 0.05,
        "Shortness of Breath": 0.05, "Fatigue": 0.5, "Dizziness": 0.3,
        "Sore Throat": 0.02, "Skin Rash": 0.02, "Joint Pain": 0.05,
        "Diarrhea": 0.8, "Loss of Appetite": 0.6
    },
    "Gastritis": {
        "Fever": 0.1, "Headache": 0.15, "Cough": 0.05, "Body Pain": 0.1,
        "Vomiting": 0.5, "Stomach Pain": 0.85, "Chest Pain": 0.1,
        "Shortness of Breath": 0.05, "Fatigue": 0.35, "Dizziness": 0.15,
        "Sore Throat": 0.02, "Skin Rash": 0.01, "Joint Pain": 0.05,
        "Diarrhea": 0.3, "Loss of Appetite": 0.5
    },
    "Dengue": {
        "Fever": 0.95, "Headache": 0.7, "Cough": 0.1, "Body Pain": 0.85,
        "Vomiting": 0.4, "Stomach Pain": 0.25, "Chest Pain": 0.1,
        "Shortness of Breath": 0.1, "Fatigue": 0.7, "Dizziness": 0.3,
        "Sore Throat": 0.1, "Skin Rash": 0.45, "Joint Pain": 0.7,
        "Diarrhea": 0.15, "Loss of Appetite": 0.5
    },
    "Malaria": {
        "Fever": 0.95, "Headache": 0.6, "Cough": 0.1, "Body Pain": 0.7,
        "Vomiting": 0.5, "Stomach Pain": 0.2, "Chest Pain": 0.05,
        "Shortness of Breath": 0.15, "Fatigue": 0.75, "Dizziness": 0.4,
        "Sore Throat": 0.05, "Skin Rash": 0.05, "Joint Pain": 0.3,
        "Diarrhea": 0.2, "Loss of Appetite": 0.55
    },
    "Anxiety": {
        "Fever": 0.02, "Headache": 0.4, "Cough": 0.05, "Body Pain": 0.2,
        "Vomiting": 0.1, "Stomach Pain": 0.2, "Chest Pain": 0.4,
        "Shortness of Breath": 0.45, "Fatigue": 0.6, "Dizziness": 0.5,
        "Sore Throat": 0.05, "Skin Rash": 0.03, "Joint Pain": 0.1,
        "Diarrhea": 0.15, "Loss of Appetite": 0.3
    },
    "Heart Related Issue": {
        "Fever": 0.05, "Headache": 0.15, "Cough": 0.1, "Body Pain": 0.2,
        "Vomiting": 0.15, "Stomach Pain": 0.1, "Chest Pain": 0.9,
        "Shortness of Breath": 0.75, "Fatigue": 0.5, "Dizziness": 0.4,
        "Sore Throat": 0.02, "Skin Rash": 0.02, "Joint Pain": 0.1,
        "Diarrhea": 0.05, "Loss of Appetite": 0.2
    },
    "Typhoid": {
        "Fever": 0.9, "Headache": 0.55, "Cough": 0.15, "Body Pain": 0.5,
        "Vomiting": 0.3, "Stomach Pain": 0.6, "Chest Pain": 0.05,
        "Shortness of Breath": 0.05, "Fatigue": 0.7, "Dizziness": 0.25,
        "Sore Throat": 0.1, "Skin Rash": 0.2, "Joint Pain": 0.2,
        "Diarrhea": 0.5, "Loss of Appetite": 0.75
    },
    "Asthma": {
        "Fever": 0.05, "Headache": 0.1, "Cough": 0.7, "Body Pain": 0.1,
        "Vomiting": 0.02, "Stomach Pain": 0.02, "Chest Pain": 0.5,
        "Shortness of Breath": 0.9, "Fatigue": 0.4, "Dizziness": 0.2,
        "Sore Throat": 0.15, "Skin Rash": 0.02, "Joint Pain": 0.02,
        "Diarrhea": 0.02, "Loss of Appetite": 0.1
    },
    "Sinusitis": {
        "Fever": 0.3, "Headache": 0.75, "Cough": 0.4, "Body Pain": 0.15,
        "Vomiting": 0.05, "Stomach Pain": 0.02, "Chest Pain": 0.05,
        "Shortness of Breath": 0.1, "Fatigue": 0.4, "Dizziness": 0.25,
        "Sore Throat": 0.55, "Skin Rash": 0.02, "Joint Pain": 0.05,
        "Diarrhea": 0.02, "Loss of Appetite": 0.15
    },
    "Chickenpox": {
        "Fever": 0.7, "Headache": 0.3, "Cough": 0.1, "Body Pain": 0.35,
        "Vomiting": 0.1, "Stomach Pain": 0.1, "Chest Pain": 0.02,
        "Shortness of Breath": 0.05, "Fatigue": 0.55, "Dizziness": 0.1,
        "Sore Throat": 0.15, "Skin Rash": 0.95, "Joint Pain": 0.15,
        "Diarrhea": 0.05, "Loss of Appetite": 0.4
    },
    "Urinary Tract Infection": {
        "Fever": 0.4, "Headache": 0.15, "Cough": 0.02, "Body Pain": 0.2,
        "Vomiting": 0.15, "Stomach Pain": 0.5, "Chest Pain": 0.02,
        "Shortness of Breath": 0.02, "Fatigue": 0.4, "Dizziness": 0.15,
        "Sore Throat": 0.02, "Skin Rash": 0.02, "Joint Pain": 0.05,
        "Diarrhea": 0.1, "Loss of Appetite": 0.25
    },
    "Arthritis": {
        "Fever": 0.15, "Headache": 0.1, "Cough": 0.02, "Body Pain": 0.4,
        "Vomiting": 0.02, "Stomach Pain": 0.05, "Chest Pain": 0.05,
        "Shortness of Breath": 0.05, "Fatigue": 0.5, "Dizziness": 0.1,
        "Sore Throat": 0.02, "Skin Rash": 0.05, "Joint Pain": 0.92,
        "Diarrhea": 0.02, "Loss of Appetite": 0.15
    },
    "Bronchitis": {
        "Fever": 0.45, "Headache": 0.25, "Cough": 0.9, "Body Pain": 0.3,
        "Vomiting": 0.05, "Stomach Pain": 0.02, "Chest Pain": 0.4,
        "Shortness of Breath": 0.55, "Fatigue": 0.6, "Dizziness": 0.15,
        "Sore Throat": 0.35, "Skin Rash": 0.02, "Joint Pain": 0.1,
        "Diarrhea": 0.02, "Loss of Appetite": 0.3
    },
    "Allergic Reaction": {
        "Fever": 0.1, "Headache": 0.2, "Cough": 0.3, "Body Pain": 0.1,
        "Vomiting": 0.1, "Stomach Pain": 0.1, "Chest Pain": 0.1,
        "Shortness of Breath": 0.4, "Fatigue": 0.25, "Dizziness": 0.15,
        "Sore Throat": 0.2, "Skin Rash": 0.8, "Joint Pain": 0.05,
        "Diarrhea": 0.1, "Loss of Appetite": 0.1
    },

}

SAMPLES_PER_DISEASE = 1000

rows = []
for disease, profile in DISEASE_PROFILES.items():
    for _ in range(SAMPLES_PER_DISEASE):
        row = {}
        for symptom in SYMPTOMS:
            prob = profile[symptom]
            row[symptom] = 1 if random.random() < prob else 0
        row["Disease"] = disease
        rows.append(row)

df = pd.DataFrame(rows, columns=SYMPTOMS + ["Disease"])
df = df.sample(frac=1, random_state=42).reset_index(drop=True)  # shuffle

df.to_csv("dataset.csv", index=False)
print(f"dataset.csv generated with {len(df)} rows, {len(DISEASE_PROFILES)} disease classes, "
      f"{len(SYMPTOMS)} symptoms.")