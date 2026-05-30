import pandas as pd
import os
import sys
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import numpy as np

# ==========================================
# 1. PATH CONFIG
# ==========================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add project root folder to Python path
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# ==========================================
# 2. IMPORT FEATURE BUILDER
# ==========================================

from backend.feature_builder import FeatureBuilder

# ==========================================
# 3. FILE PATHS
# ==========================================

input_data_path = os.path.join(
    BASE_DIR,
    "backend",
    "data",
    "clean_data_final.csv"
)

model_path = os.path.join(
    BASE_DIR,
    "backend",
    "model.pkl"
)

fb_path = os.path.join(
    BASE_DIR,
    "backend",
    "feature_builder.pkl"
)

# ==========================================
# 4. LOAD DATASET
# ==========================================

if not os.path.exists(input_data_path):
    raise FileNotFoundError(
        f"Dataset not found: {input_data_path}"
    )

df = pd.read_csv(input_data_path)

print(f"\nLoaded dataset: {input_data_path}")
print(f"Dataset shape: {df.shape}")

# ==========================================
# 5. FEATURE ENGINEERING
# ==========================================

print("\nFitting FeatureBuilder...")

feature_builder = FeatureBuilder()

feature_builder.fit(df)

X = feature_builder.transform_df(df)

y = np.log1p(df["closing_rank"])

print("\nFeatures generated successfully")
print(f"Features shape: {X.shape}")

print("\nFeature Columns:")
print(list(X.columns))

# ==========================================
# 6. TRAIN TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# ==========================================
# 7. MODEL TRAINING
# ==========================================

print("\nTraining RandomForestRegressor Model...")

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=12,
    random_state=42
)

model.fit(X_train, y_train)

# ==========================================
# 8. EVALUATION
# ==========================================

y_pred = model.predict(X_test)

# Convert back from log-scale for evaluation
y_test_orig = np.expm1(y_test)
y_pred_orig = np.expm1(y_pred)

mae = mean_absolute_error(y_test_orig, y_pred_orig)
r2 = r2_score(y_test_orig, y_pred_orig)

print("\n=================================")
print("MODEL PERFORMANCE (Original Rank Scale)")
print("=================================")
print(f"MAE Score : {mae:.2f}")
print(f"R2 Score  : {r2:.4f}")
print("=================================")

# ==========================================
# 9. SAVE MODEL
# ==========================================

joblib.dump(model, model_path)

print(f"\nModel saved at:")
print(model_path)

# ==========================================
# 10. SAVE FEATURE BUILDER
# ==========================================

joblib.dump(feature_builder, fb_path)

print(f"\nFeatureBuilder saved at:")
print(fb_path)

print("\nTRAINING COMPLETED SUCCESSFULLY")