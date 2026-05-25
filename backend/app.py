from fastapi import FastAPI
import pandas as pd

app = FastAPI()

# Load dataset
df = pd.read_csv(
    "processed/final_dataset.csv"
)

@app.get("/")
def home():

    return {
        "message": "SGSITS Predictor Running"
    }

@app.get("/predict")
def predict(
    rank: int,
    category: str,
    gender: str
):

    # Filter dataset
    filtered_df = df[
        (df["Main_Category"].str.upper() == category.upper()) &
        (df["Gender"].str.upper() == gender.upper())
    ]

    results = []

    # Prediction logic
    for _, row in filtered_df.iterrows():

        if rank <= row["Closing_Rank"]:

            difference = (
                row["Closing_Rank"] - rank
            )

            # Classification
            if difference > 50000:

                prediction = "SAFE"

            elif difference > 10000:

                prediction = "MODERATE"

            else:

                prediction = "DREAM"

            results.append({

                "Branch": row["Branch"],

                "Closing_Rank":
                int(row["Closing_Rank"]),

                "Prediction":
                prediction,

                "Year":
                row["Year"]

            })

    return {
        "eligible_branches": results
    }