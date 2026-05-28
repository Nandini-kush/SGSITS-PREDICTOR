import os
import sys
import pandas as pd
import joblib
from pathlib import Path
import numpy as np

# ==========================================
# 1. PATH CONFIG & IMPORTS
# ==========================================
# Ensure project root is in the Python search path to import backend components
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from backend.feature_builder import FeatureBuilder

# Paths
model_path = BASE_DIR / "backend" / "model.pkl"
fb_path = BASE_DIR / "backend" / "feature_builder.pkl"

# ==========================================
# 2. LOAD MODEL + FEATURE BUILDER
# ==========================================
if not model_path.exists():
    raise FileNotFoundError(f"Model not found at {model_path}. Please run 'python scripts/train_model.py' first.")

if not fb_path.exists():
    raise FileNotFoundError(f"FeatureBuilder not found at {fb_path}. Please run 'python scripts/train_model.py' first.")

print("Loading RandomForest model and FeatureBuilder pipeline...")
model = joblib.load(model_path)
feature_builder = joblib.load(fb_path)
print("[OK] Core ML components loaded successfully.\n")

# ==========================================
# 3. PREDICTION FUNCTION
# ==========================================
def predict_rank(rank: int, category: str, gender: str, year: int, branch: str, home_state: str = "MP") -> int:
    """
    Predicts the closing rank using the unified FeatureBuilder and model.
    Matches the FastAPI inference logic 100%.
    """
    # Transform raw input using the shared FeatureBuilder
    features_df = feature_builder.transform_row(
        rank=rank,
        category=category,
        gender=gender,
        year=year,
        branch=branch,
        home_state=home_state
    )
    
    # Predict using the trained model
    prediction = np.expm1(model.predict(features_df)[0])
    return round(prediction)

# ==========================================
# 4. CLI INPUT RUNNER
# ==========================================
if __name__ == "__main__":
    print("=== SGSITS Admission Rank Predictor (CLI Test Tool) ===\n")
    print("Please enter the candidate's details:")
    
    try:
        branch = input("Branch (e.g. CSE, IT, ENTC, MECH): ").strip()
        category = input("Category (e.g. UR/X/OP, OBC/X/F, ST/S/OP, or UR, OBC): ").strip()
        gender = input("Gender (OP for General pool / F for Female quota): ").strip() or "OP"
        year = int(input("Year to simulate (e.g. 2025): ").strip() or "2025")
        rank = int(input("Candidate's Entrance Rank (e.g. 35000): ").strip())
        
        result = predict_rank(
            rank=rank,
            category=category,
            gender=gender,
            year=year,
            branch=branch
        )
        
        print("\n==============================================")
        print(f"Predicted Cutoff Closing Rank: {result}")
        print("==============================================\n")
        
    except ValueError as ve:
        print(f"[ERROR] Input validation failed: {ve}. Please enter valid numbers for Year and Rank.")
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")