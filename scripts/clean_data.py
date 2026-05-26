import pandas as pd
import os
import numpy as np

# =========================
# 1. PATH CONFIG
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

input_path = os.path.join(BASE_DIR, "backend", "data", "clean_dataset.csv")
output_path = os.path.join(BASE_DIR, "backend", "data", "clean_data_final.csv")

if not os.path.exists(input_path):
    raise FileNotFoundError(f"File not found: {input_path}")

df = pd.read_csv(input_path)

print("\nLoaded dataset:", input_path)
print("Initial shape:", df.shape)

# =========================
# 2. COLUMN CLEANING
# =========================
df.columns = df.columns.str.strip().str.lower()

# =========================
# 3. BRANCH CLEANING (SAFE - NO DATA LOSS)
# =========================
df["branch"] = df["branch"].astype(str).str.upper().str.strip()

branch_map = {
    "ELECTRONICS AND TELECOMMUNICATION": "ENTC",
    "ELECTRONICS AND TELECOMMUNICATIONS": "ENTC",
    "ELECTRONICS & TELECOMMUNICATION": "ENTC",
    "COMPUTER SCIENCE ENGINEERING": "CSE",
    "COMPUTER SCIENCE": "CSE",
    "INFORMATION TECHNOLOGY": "IT",
    "MECHANICAL ENGINEERING": "MECH",
    "CIVIL ENGINEERING": "CE",
    "ELECTRICAL ENGINEERING": "EE",
    "ELECTRONICS INSTRUMENTATION": "EI"
}

df["branch"] = df["branch"].replace(branch_map)

# ⚠️ IMPORTANT: DO NOT REMOVE UNKNOWN BRANCHES
df["branch"] = df["branch"].fillna("UNKNOWN")

# =========================
# 4. CATEGORY CLEANING (ROBUST)
# =========================
df["category"] = df["category"].astype(str).str.upper().str.strip()

def split_category(val):
    parts = str(val).split("/")
    parts += ["", "", ""]
    return parts[:3]

df[["main_category", "quota", "gender"]] = df["category"].apply(
    lambda x: pd.Series(split_category(x))
)

# safer defaults (no data loss)
df["main_category"] = df["main_category"].replace("", "UR")
df["quota"] = df["quota"].replace("", "GENERAL")
df["gender"] = df["gender"].replace("", "OP")

# =========================
# 5. NUMERIC CLEANING (SAFE)
# =========================
df["opening_rank"] = pd.to_numeric(df["opening_rank"], errors="coerce")
df["closing_rank"] = pd.to_numeric(df["closing_rank"], errors="coerce")

df = df.dropna(subset=["opening_rank", "closing_rank"])

df["opening_rank"] = df["opening_rank"].astype(int)
df["closing_rank"] = df["closing_rank"].astype(int)

# basic validity checks only
df = df[df["opening_rank"] > 0]
df = df[df["closing_rank"] > 0]

# keep logical correctness
df = df[df["closing_rank"] >= df["opening_rank"]]

# 🚫 NO QUANTILE REMOVAL (this was shrinking your dataset)
# Instead we cap extreme outliers softly
df["closing_rank"] = np.clip(df["closing_rank"], 1, 2000000)
df["opening_rank"] = np.clip(df["opening_rank"], 1, 2000000)

# =========================
# 6. YEAR CLEANING (NO OVER-FILTERING)
# =========================
df["year"] = pd.to_numeric(df["year"], errors="coerce")
df = df.dropna(subset=["year"])
df["year"] = df["year"].astype(int)

# keep all years (important for trend learning)
# but remove absurd years only
df = df[(df["year"] >= 2015) & (df["year"] <= 2026)]

# =========================
# 7. DUPLICATES (SOFT REMOVAL)
# =========================
df = df.drop_duplicates()

# =========================
# 8. FINAL CLEANING
# =========================
df = df.reset_index(drop=True)

print("\nFinal shape:", df.shape)
print("\nBranch distribution:")
print(df["branch"].value_counts().head(10))

print("\nSample data:")
print(df.head())

# =========================
# 9. SAVE OUTPUT
# =========================
df.to_csv(output_path, index=False)

print("\nClean dataset saved at:", output_path)