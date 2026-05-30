import os
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
import joblib
from pathlib import Path
import pandas as pd
import numpy as np

# ==========================================
# 1. PYTHON PATH & IMPORTS CONFIG
# ==========================================
# Ensure the project root directory is in the Python search path to import backend components
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))


from backend.feature_builder import FeatureBuilder

# Initialize FastAPI App with premium Swagger metadata
app = FastAPI(
    title="SGSITS Predictor API",
    description="Production-style FastAPI prediction API for engineering cutoffs at SGSITS Indore using Machine Learning (RandomForest).",
    version="1.0.0"
)

# Enable CORS for smooth web frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths for serialized model components
MODEL_PATH = BASE_DIR / "model.pkl"
FEATURE_BUILDER_PATH = BASE_DIR / "feature_builder.pkl"

model = None
feature_builder = None

# ==========================================
# 2. LIFECYCLE EVENT - MODEL LOADING
# ==========================================
@app.on_event("startup")
def startup_load_models():
    """Loads RandomForest and FeatureBuilder artifacts at API startup."""
    global model, feature_builder
    try:
        if not MODEL_PATH.exists() or not FEATURE_BUILDER_PATH.exists():
            print(f"[WARNING] Serialized artifacts not found at {BASE_DIR}. Please run 'python scripts/train_model.py' first.")
            return
        model = joblib.load(MODEL_PATH)
        feature_builder = joblib.load(FEATURE_BUILDER_PATH)
        print("[OK] RandomForest model and FeatureBuilder pipeline loaded successfully.")
    except Exception as e:
        print(f"[ERROR] Error loading serialized artifacts: {e}")

# ==========================================
# 3. REQUEST SCHEMA & VALIDATION
# ==========================================
class PredictionPayload(BaseModel):
    rank: int = Field(..., gt=0, description="Entrance exam merit rank (e.g. MP DTE / JEE Main).", example=35000)
    category: str = Field(..., description="Seat allotment category (e.g. 'UR/X/OP', 'OBC/X/F', or main category 'UR', 'OBC').", example="UR/X/OP")
    gender: str = Field(..., description="Allotment gender (e.g. 'OP' for open pool or 'F' for female quota).", example="OP")
    year: int = Field(..., ge=2015, le=2026, description="Year to simulate cutoffs.", example=2025)
    branch: str = Field(..., description="Target engineering branch shortcode or name (e.g. 'CSE', 'IT', 'ENTC').", example="CSE")
    home_state: str = Field("MP", description="Candidate home state / domicile.", example="MP")

    class Config:
        json_schema_extra = {
            "example": {
                "rank": 35000,
                "category": "UR/X/OP",
                "gender": "OP",
                "year": 2025,
                "branch": "CSE",
                "home_state": "MP"
            }
        }

class BulkPredictionPayload(BaseModel):
    rank: int = Field(..., gt=0, description="Entrance exam merit rank (e.g. MP DTE / JEE Main).", example=35000)
    category: str = Field(..., description="Seat allotment category (e.g. 'UR/X/OP', 'OBC/X/F', or main category 'UR', 'OBC').", example="UR/X/OP")
    gender: str = Field(..., description="Allotment gender (e.g. 'OP' for open pool or 'F' for female quota).", example="OP")
    year: int = Field(..., ge=2015, le=2026, description="Year to simulate cutoffs.", example=2025)
    home_state: str = Field("MP", description="Candidate home state / domicile.", example="MP")

    class Config:
        json_schema_extra = {
            "example": {
                "rank": 35000,
                "category": "UR/X/OP",
                "gender": "OP",
                "year": 2025,
                "home_state": "MP"
            }
        }

# ==========================================
# 4. ENDPOINTS
# ==========================================
@app.get("/", tags=["Health"])
def home():
    """Root endpoint to check API status and verify if model is loaded."""
    status = "healthy"
    model_loaded = (model is not None) and (feature_builder is not None)
    return {
        "status": status,
        "message": "SGSITS Predictor API is running",
        "model_loaded": model_loaded,
        "api_docs_url": "/docs"
    }
@app.post("/predict", tags=["ML Prediction"])
def predict(payload: PredictionPayload):
    global model, feature_builder

    if model is None or feature_builder is None:
        raise HTTPException(
            status_code=503,
            detail="ML model or FeatureBuilder pipeline is not loaded."
        )

    try:
        # Create dataframe
        input_df = pd.DataFrame([{
            "rank": payload.rank,
            "category": payload.category,
            "gender": payload.gender,
            "year": payload.year,
            "branch": payload.branch,
            "home_state": payload.home_state
        }])

        # Transform using transform_now
        features_df = feature_builder.transform_now(input_df)

        # Predict using model
        prediction = np.expm1(model.predict(features_df)[0])

        return {
            "status": "success",
            "predicted_closing_rank": int(prediction),
            "input_parameters": {
                "rank": payload.rank,
                "category": payload.category,
                "gender": payload.gender,
                "year": payload.year,
                "branch": payload.branch,
                "home_state": payload.home_state
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@app.post("/predict_all", tags=["ML Prediction"])
def predict_all(payload: BulkPredictionPayload):
    global model, feature_builder

    if model is None or feature_builder is None:
        raise HTTPException(
            status_code=503,
            detail="ML model or FeatureBuilder pipeline is not loaded."
        )

    try:
        predictions = []
        # Predict for all unique branches in the feature builder mapping
        # Sort keys to ensure deterministic ordering
        branches = sorted(feature_builder.unique_branches)
        
        for br in branches:
            if br == "UNKNOWN":
                continue
            
            # Create dataframe
            input_df = pd.DataFrame([{
                "rank": payload.rank,
                "category": payload.category,
                "gender": payload.gender,
                "year": payload.year,
                "branch": br,
                "home_state": payload.home_state
            }])
            
            # Call transform_now
            features_df = feature_builder.transform_now(input_df)
            
            # Predict using model
            pred = np.expm1(model.predict(features_df)[0])
                
            predictions.append({
                "branch": br,
                "predicted_closing_rank": int(pred)
            })

        return {
            "status": "success",
            "results": predictions,
            "predictions": predictions,  # For React frontend compatibility
            "input_parameters": {
                "rank": payload.rank,
                "category": payload.category,
                "gender": payload.gender,
                "year": payload.year,
                "home_state": payload.home_state
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Bulk prediction failed: {str(e)}"
        )


   