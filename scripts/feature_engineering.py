import pandas as pd
import os
import numpy as np

# =========================
# 1. LOAD DATA
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

input_path = os.path.join(BASE_DIR, "backend", "data", "clean_data_final.csv")
output_path = os.path.join(BASE_DIR, "backend", "data", "featured_data.csv")

df = pd.read_csv(input_path)

print("Loaded data:", df.shape)

# =========================
# 2. BASIC FEATURE ENGINEERING
# =========================

# Rank gap (important for cutoff spread)
df["rank_gap"] = df["closing_rank"] - df["opening_rank"]

# Average rank (central tendency)
df["avg_rank"] = (df["closing_rank"] + df["opening_rank"]) / 2

# =========================
# 3. CATEGORICAL FEATURES
# =========================

# Reserved category flag
df["is_reserved"] = df["main_category"].apply(
    lambda x: 0 if str(x).upper() == "UR" else 1
)

# Female flag
df["is_female"] = df["gender"].apply(
    lambda x: 1 if str(x).upper() == "F" else 0
)

# Home State / Special quota flag
df["is_special_quota"] = df["quota"].apply(
    lambda x: 1 if str(x).upper() in ["S", "H", "NCC", "FF"] else 0
)

# =========================
# 4. BRANCH ENCODING (VERY IMPORTANT)
# =========================

# Convert branch into ML-friendly numeric IDs
df["branch_encoded"] = df["branch"].astype("category").cat.codes

branch_mapping = dict(enumerate(df["branch"].astype("category").cat.categories))
print("\nBranch Encoding Map:")
print(branch_mapping)

# =========================
# 5. CATEGORY ENCODING
# =========================

df["main_category_encoded"] = df["main_category"].astype("category").cat.codes

df["quota_encoded"] = df["quota"].astype("category").cat.codes

# =========================
# 6. YEAR FEATURE (TREND LEARNING)
# =========================

df["year_normalized"] = df["year"] - df["year"].min()

# =========================
# 7. LOG TRANSFORM (VERY IMPORTANT FOR RANKS)
# =========================

df["log_closing_rank"] = np.log1p(df["closing_rank"])
df["log_opening_rank"] = np.log1p(df["opening_rank"])

# =========================
# 8. INTERACTION FEATURES (POWERFUL)
# =========================

df["branch_year"] = df["branch_encoded"] * df["year_normalized"]
df["category_branch"] = df["main_category_encoded"] * df["branch_encoded"]

# =========================
# 9. FINAL CLEANUP
# =========================

df = df.dropna()
df = df.reset_index(drop=True)

print("\nFinal dataset shape:", df.shape)
print(df.head())

# =========================
# 10. SAVE FEATURED DATASET
# =========================

df.to_csv(output_path, index=False)

print("\nSaved engineered dataset at:", output_path)