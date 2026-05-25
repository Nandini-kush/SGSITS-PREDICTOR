import pandas as pd

# Load cleaned CSV
df = pd.read_csv("processed/cleaned_table.csv")

print("Original Shape:", df.shape)

# Keep important columns only
df = df[[
    "BRANCH",
    "OPENING RANK",
    "CLOSING RANK",
    "ALLOTTED \nCATEGORY"
]]

# Rename columns
df.columns = [
    "Branch",
    "Opening_Rank",
    "Closing_Rank",
    "Category"
]

# Split category column
split_cols = df["Category"].str.split("/", expand=True)

df["Main_Category"] = split_cols[0]
df["Quota"] = split_cols[1]
df["Gender"] = split_cols[2]

# Remove missing values
df.dropna(inplace=True)

# Convert ranks to numeric
df["Opening_Rank"] = pd.to_numeric(
    df["Opening_Rank"],
    errors="coerce"
)

df["Closing_Rank"] = pd.to_numeric(
    df["Closing_Rank"],
    errors="coerce"
)

# Remove invalid rows
df.dropna(inplace=True)

# Reset index
df.reset_index(drop=True, inplace=True)

print("\nCleaned Data:")
print(df.head())

# Save final dataset
df.to_csv(
    "processed/final_dataset.csv",
    index=False
)

print("\nFinal dataset saved!")