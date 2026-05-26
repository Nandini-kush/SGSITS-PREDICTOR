import pandas as pd
import numpy as np
import os

class FeatureBuilder:
    """
    A unified, production-style feature engineering class for the SGSITS Predictor.
    It acts as the single source of truth for both model training and live API inference,
    ensuring that feature names, order, types, and encodings match 100% at all times.
    """
    def __init__(self):
        # Mappings learned during .fit()
        self.branch_map = {}
        self.category_map = {}
        self.quota_map = {}
        self.min_year = 2015  # Fallback minimum year, overridden during fit()
        
        # Standardize branch names and map typical full forms to shortcodes
        self.branch_aliases = {
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

    def _normalize_category(self, cat: str) -> str:
        """Standardizes category nomenclature to match the clean training dataset."""
        cat = str(cat).strip().upper()
        mapping = {
            "GEN": "UR",
            "GENERAL": "UR",
            "OPEN": "UR"
        }
        return mapping.get(cat, cat)

    def _clean_branch(self, branch: str) -> str:
        """Cleans and standardizes the branch input using mapping aliases."""
        branch = str(branch).strip().upper()
        return self.branch_aliases.get(branch, branch)

    def _parse_category_parts(self, category_str: str, gender_input: str = "OP") -> tuple:
        """
        Parses categories (e.g. 'UR/X/OP' or 'ST/S/F') into main_category, quota, and gender.
        If a category does not contain a split, treats it as main_category with default quota.
        """
        category_str = str(category_str).strip().upper()
        gender_input = str(gender_input).strip().upper()
        
        if "/" in category_str:
            parts = category_str.split("/")
            parts += ["", "", ""]  # Safeguard list length
            main_cat = parts[0].strip()
            quota_val = parts[1].strip()
            gender_val = parts[2].strip()
        else:
            main_cat = category_str
            quota_val = "GENERAL"
            gender_val = gender_input

        # Normalize category
        main_cat = self._normalize_category(main_cat)
        
        # Apply robust defaults for missing values
        if not main_cat or main_cat == "NAN":
            main_cat = "UR"
        if not quota_val or quota_val == "NAN":
            quota_val = "GENERAL"
        if not gender_val or gender_val == "NAN":
            gender_val = "OP"
            
        gender_val = "F" if gender_val in ["F", "FEMALE"] else "OP"
        
        return main_cat, quota_val, gender_val

    def fit(self, df: pd.DataFrame):
        """
        Learns min_year and maps unique values for categorical features from the training dataset.
        Guarantees that label encodings remain consistent during training and prediction.
        """
        # Save training year baseline
        self.min_year = int(df["year"].min())
        
        # Learn unique branches (sorted for determinism, add fallback)
        unique_branches = sorted(df["branch"].dropna().astype(str).unique())
        if "UNKNOWN" not in unique_branches:
            unique_branches.append("UNKNOWN")
        self.branch_map = {branch: idx for idx, branch in enumerate(unique_branches)}
        
        # Learn main category mapping
        unique_categories = sorted(df["main_category"].dropna().astype(str).unique())
        if "UR" not in unique_categories:
            unique_categories.append("UR")
        self.category_map = {cat: idx for idx, cat in enumerate(unique_categories)}
        
        # Learn quota mappings
        unique_quotas = sorted(df["quota"].dropna().astype(str).unique())
        if "GENERAL" not in unique_quotas:
            unique_quotas.append("GENERAL")
        self.quota_map = {quota: idx for idx, quota in enumerate(unique_quotas)}
        
        print("FeatureBuilder successfully fitted:")
        print(f"  Min Year: {self.min_year}")
        print(f"  Branches mapped: {len(self.branch_map)}")
        print(f"  Categories mapped: {len(self.category_map)}")
        print(f"  Quotas mapped: {len(self.quota_map)}")
        return self

    def transform_df(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Processes a whole pandas DataFrame (vectorized).
        Used by the training pipeline script.
        """
        transformed = df.copy()
        
        # Clean branch names
        transformed["branch"] = transformed["branch"].apply(self._clean_branch)
        
        # Parse raw category column if splits are not present
        if "main_category" not in transformed.columns or "quota" not in transformed.columns or "gender" not in transformed.columns:
            parsed = transformed.apply(
                lambda row: self._parse_category_parts(
                    row.get("category", "UR"), 
                    row.get("gender", "OP")
                ),
                axis=1
            )
            transformed["main_category"] = [p[0] for p in parsed]
            transformed["quota"] = [p[1] for p in parsed]
            transformed["gender"] = [p[2] for p in parsed]
        else:
            transformed["main_category"] = transformed["main_category"].apply(self._normalize_category)
            transformed["gender"] = transformed["gender"].apply(lambda g: "F" if str(g).upper() in ["F", "FEMALE"] else "OP")
            transformed["quota"] = transformed["quota"].astype(str).str.strip().str.upper()

        # Build clean boolean flags
        transformed["is_reserved"] = transformed["main_category"].apply(
            lambda x: 1 if x in ["SC", "ST", "OBC", "EWS"] else 0
        )
        transformed["is_female"] = transformed["gender"].apply(
            lambda x: 1 if x == "F" else 0
        )
        transformed["is_special_quota"] = transformed["quota"].apply(
            lambda x: 1 if x in ["S", "H", "NCC", "FF"] else 0
        )

        # Apply label encoding maps with robust fallback to standard categories
        transformed["branch_encoded"] = transformed["branch"].apply(
            lambda x: self.branch_map.get(x, self.branch_map.get("UNKNOWN", 0))
        )
        transformed["main_category_encoded"] = transformed["main_category"].apply(
            lambda x: self.category_map.get(x, self.category_map.get("UR", 0))
        )
        transformed["quota_encoded"] = transformed["quota"].apply(
            lambda x: self.quota_map.get(x, self.quota_map.get("GENERAL", 0))
        )

        # Engineering continuous and interaction features
        transformed["year_normalized"] = transformed["year"] - self.min_year
        transformed["log_opening_rank"] = np.log1p(transformed["opening_rank"])
        
        # Interactions
        transformed["branch_year"] = transformed["branch_encoded"] * transformed["year_normalized"]
        transformed["category_branch"] = transformed["main_category_encoded"] * transformed["branch_encoded"]

        # Exact features returned in deterministic, fixed column order
        features_list = [
            "opening_rank",
            "year",
            "year_normalized",
            "branch_encoded",
            "main_category_encoded",
            "quota_encoded",
            "is_reserved",
            "is_female",
            "is_special_quota",
            "log_opening_rank",
            "branch_year",
            "category_branch"
        ]
        
        return transformed[features_list]

    def transform_row(self, rank: int, category: str, gender: str, year: int, branch: str) -> pd.DataFrame:
        """
        Transforms a single live inference API request into a single-row DataFrame.
        Guarantees EXACT matching columns and encoding maps.
        """
        # Clean branch
        clean_br = self._clean_branch(branch)
        
        # Parse category details
        main_cat, quota_val, gender_val = self._parse_category_parts(category, gender)
        
        # Compute boolean flags
        is_reserved = 1 if main_cat in ["SC", "ST", "OBC", "EWS"] else 0
        is_female = 1 if gender_val == "F" else 0
        is_special_quota = 1 if quota_val in ["S", "H", "NCC", "FF"] else 0
        
        # Encode categoricals using fitted maps
        branch_encoded = self.branch_map.get(clean_br, self.branch_map.get("UNKNOWN", 0))
        main_category_encoded = self.category_map.get(main_cat, self.category_map.get("UR", 0))
        quota_encoded = self.quota_map.get(quota_val, self.quota_map.get("GENERAL", 0))
        
        # Compute normalized numeric values
        year_normalized = int(year) - self.min_year
        log_opening_rank = np.log1p(float(rank))
        
        # Compute interactions
        branch_year = branch_encoded * year_normalized
        category_branch = main_category_encoded * branch_encoded
        
        row_dict = {
            "opening_rank": [float(rank)],
            "year": [int(year)],
            "year_normalized": [int(year_normalized)],
            "branch_encoded": [int(branch_encoded)],
            "main_category_encoded": [int(main_category_encoded)],
            "quota_encoded": [int(quota_encoded)],
            "is_reserved": [int(is_reserved)],
            "is_female": [int(is_female)],
            "is_special_quota": [int(is_special_quota)],
            "log_opening_rank": [float(log_opening_rank)],
            "branch_year": [int(branch_year)],
            "category_branch": [int(category_branch)]
        }
        
        features_list = [
            "opening_rank",
            "year",
            "year_normalized",
            "branch_encoded",
            "main_category_encoded",
            "quota_encoded",
            "is_reserved",
            "is_female",
            "is_special_quota",
            "log_opening_rank",
            "branch_year",
            "category_branch"
        ]
        
        df = pd.DataFrame(row_dict)
        return df[features_list]
