import pandas as pd
import os
import sys
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# ==========================================
# 1. PATH CONFIG
# ==========================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add backend folder to Python path
BACKEND_DIR = os.path.join(BASE_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

# ==========================================
# 2. IMPORT FEATURE BUILDER
# ==========================================

from feature_builder import FeatureBuilder

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

y = df["closing_rank"]

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

print("\nTraining RandomForest Model...")

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=15,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# ==========================================
# 8. EVALUATION
# ==========================================

y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\n=================================")
print("MODEL PERFORMANCE")
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