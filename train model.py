"""
train_model.py
================
1. Loads dataset.csv
2. Compares 4 ML algorithms (Random Forest, Decision Tree, Naive Bayes,
   Logistic Regression) on the same data using identical train/test splits
3. Prints a comparison table (accuracy for each algorithm)
4. Trains the FINAL model (Random Forest, tuned) on the full training set
5. Prints detailed evaluation: accuracy, precision, recall, F1-score,
   confusion matrix, and feature importance
6. Saves the final trained Random Forest model to model.pkl

Run with:  python train_model.py
"""

import pandas as pd
import pickle
import numpy as np

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)

# =========================================================
# 1. Load data
# =========================================================

df = pd.read_csv("dataset.csv")

SYMPTOMS = [c for c in df.columns if c != "Disease"]

X = df[SYMPTOMS]
y = df["Disease"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("=" * 60)
print(f"Dataset: {len(df)} rows | {len(SYMPTOMS)} symptoms | "
      f"{y.nunique()} disease classes")
print(f"Train set: {len(X_train)} rows | Test set: {len(X_test)} rows")
print("=" * 60)

# =========================================================
# 2. Compare multiple algorithms on the SAME split
# =========================================================

candidates = {
    "Decision Tree":       DecisionTreeClassifier(max_depth=10, random_state=42),
    "Naive Bayes":         GaussianNB(),
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
    "Random Forest":       RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42),
}

print("\n--- Algorithm Comparison (same train/test split) ---\n")
comparison_results = []

for name, clf in candidates.items():
    clf.fit(X_train, y_train)
    preds = clf.predict(X_test)
    acc = accuracy_score(y_test, preds)
    f1 = f1_score(y_test, preds, average="weighted")
    comparison_results.append((name, acc, f1))
    print(f"{name:22s} | Accuracy: {acc*100:5.2f}% | Weighted F1: {f1:.3f}")

best_name, best_acc, _ = max(comparison_results, key=lambda r: r[1])
print(f"\nBest performing algorithm on this dataset: {best_name} "
      f"({best_acc*100:.2f}% accuracy)")
print("=" * 60)

# =========================================================
# 3. Hyperparameter tuning for the FINAL model (Random Forest)
# =========================================================

print("\n--- Tuning Random Forest hyperparameters (GridSearchCV) ---\n")

param_grid = {
    "n_estimators": [150, 200, 300],
    "max_depth": [8, 10, 14],
    "min_samples_split": [2, 4]
}

grid = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=3,
    scoring="accuracy",
    n_jobs=-1
)
grid.fit(X_train, y_train)

print(f"Best parameters found: {grid.best_params_}")
print(f"Best cross-validation accuracy: {grid.best_score_*100:.2f}%")

model = grid.best_estimator_

# =========================================================
# 4. Final evaluation on the held-out test set
# =========================================================

y_pred = model.predict(X_test)

acc = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

print("\n" + "=" * 60)
print("FINAL MODEL — Random Forest (tuned) — Test Set Performance")
print("=" * 60)
print(f"Accuracy:  {acc*100:.2f}%")
print(f"Precision: {precision*100:.2f}%  (weighted average)")
print(f"Recall:    {recall*100:.2f}%  (weighted average)")
print(f"F1-Score:  {f1*100:.2f}%  (weighted average)")

print("\n--- Per-class Classification Report ---\n")
print(classification_report(y_test, y_pred, zero_division=0))

print("--- Confusion Matrix (rows = actual, columns = predicted) ---\n")
labels = sorted(y.unique())
cm = confusion_matrix(y_test, y_pred, labels=labels)
cm_df = pd.DataFrame(cm, index=labels, columns=labels)
print(cm_df.to_string())

# Save confusion matrix + comparison table to CSV for the project report
cm_df.to_csv("confusion_matrix.csv")

comparison_df = pd.DataFrame(comparison_results, columns=["Algorithm", "Accuracy", "F1_Score"])
comparison_df.to_csv("algorithm_comparison.csv", index=False)

# =========================================================
# 5. Feature importance (which symptoms matter most)
# =========================================================

print("\n--- Feature Importance (which symptoms drive predictions most) ---\n")
importances = sorted(
    zip(SYMPTOMS, model.feature_importances_),
    key=lambda x: x[1], reverse=True
)
for name, score in importances:
    bar = "█" * int(score * 100)
    print(f"  {name:22s} {score:.3f}  {bar}")

feat_df = pd.DataFrame(importances, columns=["Symptom", "Importance"])
feat_df.to_csv("feature_importance.csv", index=False)

# =========================================================
# 6. Save the final trained model
# =========================================================

with open("model.pkl", "wb") as f:
    pickle.dump({
        "model": model,
        "symptoms": SYMPTOMS,
        "classes": list(model.classes_),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4)
        },
        "algorithm_comparison": comparison_results
    }, f)

print("\n" + "=" * 60)
print("model.pkl saved successfully.")
print("Also saved: confusion_matrix.csv, algorithm_comparison.csv, "
      "feature_importance.csv (use these in your project report)")
print("=" * 60)