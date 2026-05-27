import os
import camelot
import pandas as pd

# Folder containing PDFs
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pdf_folder = os.path.join(BASE_DIR, "backend", "data", "raw_pdfs")

# Store all cleaned data
all_data = []

print("\n====== PROCESSING ALL PDFs ======\n")

# Process each PDF
for pdf_file in os.listdir(pdf_folder):

    if pdf_file.endswith(".pdf"):

        pdf_path = os.path.join(
            pdf_folder,
            pdf_file
        )

        print(f"\nProcessing: {pdf_file}")

        try:

            # ---------- TRY LATTICE ----------
            try:

                tables = camelot.read_pdf(
                    pdf_path,
                    pages="all",
                    flavor="lattice"
                )

                total_rows = sum(
                    len(table.df)
                    for table in tables
                )

                # Switch to stream if extraction weak
                if total_rows < 50:

                    print(
                        "Weak extraction detected."
                    )

                    print(
                        "Switching to STREAM mode..."
                    )

                    tables = camelot.read_pdf(
                        pdf_path,
                        pages="all",
                        flavor="stream"
                    )

            except:

                print(
                    "Lattice failed."
                )

                print(
                    "Using STREAM mode..."
                )

                tables = camelot.read_pdf(
                    pdf_path,
                    pages="all",
                    flavor="stream"
                )

            print(f"Tables Found: {tables.n}")

            # Show row count
            for idx, table in enumerate(tables):

                print(
                    f"Table {idx} Rows: "
                    f"{len(table.df)}"
                )

            # ---------- PROCESS TABLES ----------
            for table_number, table in enumerate(tables):

                print(
                    f"\nProcessing Table "
                    f"{table_number}"
                )

                df = table.df

                # Skip empty table
                if df.empty:
                    continue

                # Convert all to string
                df = df.astype(str)

                # ---------- FIND HEADER ----------
                header_index = None

                for i in range(len(df)):

                    row_text = " ".join(
                        df.iloc[i]
                    ).upper()

                    if (
                        "BRANCH" in row_text and
                        "OPENING" in row_text and
                        "CLOSING" in row_text
                    ):

                        header_index = i
                        break

                # Skip if header missing
                if header_index is None:

                    print(
                        "Header not found."
                    )

                    continue

                # Set header row
                df.columns = df.iloc[
                    header_index
                ]

                # Remove upper rows
                df = df.iloc[
                    header_index + 1:
                ]

                # Reset index
                df.reset_index(
                    drop=True,
                    inplace=True
                )

                # ---------- CLEAN COLUMN NAMES ----------
                df.columns = [

                    str(col)
                    .replace("\n", " ")
                    .replace("\r", " ")
                    .replace(".", "")
                    .replace("  ", " ")
                    .strip()
                    .upper()

                    for col in df.columns
                ]

                print(
                    "\nDetected Columns:"
                )

                print(
                    df.columns.tolist()
                )

                # ---------- DYNAMIC COLUMN MAPPING ----------
                column_mapping = {}

                for col in df.columns:

                    clean_col = (
                        col.upper().strip()
                    )

                    # Branch
                    if "BRANCH" in clean_col:

                        column_mapping[col] = (
                            "Branch"
                        )

                    # Opening Rank
                    elif (
                        "OPENING" in clean_col and
                        "RANK" in clean_col
                    ):

                        column_mapping[col] = (
                            "Opening_Rank"
                        )

                    # Closing Rank
                    elif (
                        "CLOSING" in clean_col and
                        "RANK" in clean_col
                    ):

                        column_mapping[col] = (
                            "Closing_Rank"
                        )

                    # Category
                    elif (
                        "CATEGORY"
                        in clean_col
                    ):

                        column_mapping[col] = (
                            "Category"
                        )



                # Rename columns
                df.rename(
                    columns=column_mapping,
                    inplace=True
                )

                print(
                    "\nMapped Columns:"
                )

                print(
                    df.columns.tolist()
                )

                # ---------- REQUIRED COLUMNS ----------
                required_columns = [
                    "Branch",
                    "Opening_Rank",
                    "Closing_Rank",
                    "Category"
                ]

                # Skip invalid table
                if not all(
                    col in df.columns
                    for col in required_columns
                ):

                    print(
                        "Required columns missing."
                    )

                    continue

                # Keep only required columns
                df = df[
                    required_columns
                ]

                # ---------- CLEAN VALUES ----------
                for col in df.columns:

                    df[col] = (
                        df[col]
                        .astype(str)
                        .str.strip()
                    )

                # ---------- SPLIT CATEGORY ----------
                split_cols = (
                    df["Category"]
                    .str.split(
                        "/",
                        expand=True
                    )
                )

                df["Main_Category"] = (
                    split_cols[0]
                )

                # Quota
                if split_cols.shape[1] > 1:

                    df["Quota"] = (
                        split_cols[1]
                    )

                else:

                    df["Quota"] = None

                # Gender
                if split_cols.shape[1] > 2:

                    df["Gender"] = (
                        split_cols[2]
                    )

                else:

                    df["Gender"] = None

                # ---------- CONVERT RANKS ----------
                df["Opening_Rank"] = (
                    pd.to_numeric(
                        df["Opening_Rank"],
                        errors="coerce"
                    )
                )

                df["Closing_Rank"] = (
                    pd.to_numeric(
                        df["Closing_Rank"],
                        errors="coerce"
                    )
                )

                # Remove invalid rows
                df.dropna(
                    subset=[
                        "Opening_Rank",
                        "Closing_Rank"
                    ],
                    inplace=True
                )

                # Remove duplicates
                df.drop_duplicates(
                    inplace=True
                )

                # ---------- ADD METADATA ----------
                year = pdf_file[:4]

                df["Year"] = year

                df["Source_File"] = (
                    pdf_file
                )

                print(
                    f"Rows Added: "
                    f"{len(df)}"
                )

                # Store dataframe
                all_data.append(df)

        except Exception as e:

            print(
                f"\nError processing "
                f"{pdf_file}"
            )

            print(e)

# ---------- FINAL MERGE ----------
if len(all_data) > 0:

    final_df = pd.concat(
        all_data,
        ignore_index=True
    )

    # Final cleanup
    final_df.drop_duplicates(
        inplace=True
    )

    final_df.reset_index(
        drop=True,
        inplace=True
    )

    # Save dataset
    output_csv = os.path.join(BASE_DIR, "processed", "final_dataset.csv")
    final_df.to_csv(
        output_csv,
        index=False
    )

    print("\n====== SUCCESS ======")

    print(
        "\nFINAL DATASET CREATED!"
    )

    print("\nDataset Shape:")

    print(final_df.shape)

    print("\nSample Data:")

    print(final_df.head())

else:

    print(
        "\nNo valid data extracted."
    )