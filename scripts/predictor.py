import pandas as pd

# Load dataset
df = pd.read_csv("processed/final_dataset.csv")

print("\n====== SGSITS Admission Predictor ======\n")

# Student Inputs
student_rank = int(input("Enter Your Rank: "))

student_category = input(
    "Enter Category (UR/OBC/SC/ST/EWS): "
).upper()

student_gender = input(
    "Enter Gender (F/OP): "
).upper()

print("\nChecking Eligibility...\n")

# Filter dataset
filtered_df = df[
    (df["Main_Category"] == student_category) &
    (df["Gender"] == student_gender)
]

# Empty result list
results = []

# Prediction Logic
for _, row in filtered_df.iterrows():

    branch = row["Branch"]

    opening_rank = row["Opening_Rank"]

    closing_rank = row["Closing_Rank"]

    # Check eligibility
    if student_rank <= closing_rank:

        difference = closing_rank - student_rank

        # Prediction strength
        if difference > 50000:
            status = "SAFE"

        elif difference > 10000:
            status = "MODERATE"

        else:
            status = "DREAM"

        results.append({
            "Branch": branch,
            "Opening Rank": opening_rank,
            "Closing Rank": closing_rank,
            "Prediction": status
        })

# Convert to dataframe
results_df = pd.DataFrame(results)

# Remove duplicate branches
results_df = results_df.drop_duplicates(
    subset=["Branch"]
)

# Sort by closing rank
results_df = results_df.sort_values(
    by="Closing Rank"
)

# Reset index
results_df.reset_index(drop=True, inplace=True)

# Final Output
if len(results_df) == 0:

    print("No Eligible Branches Found")

else:

    print("\n====== Eligible Branches ======\n")

    print(results_df)

    # Save predictions
    results_df.to_csv(
        "processed/predictions.csv",
        index=False
    )

    print(
        "\nPredictions saved in processed/predictions.csv"
    )