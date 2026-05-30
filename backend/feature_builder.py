import pandas as pd
import numpy as np

class FeatureBuilder:
    """
    A unified, production-style feature engineering class for the SGSITS Predictor.
    It acts as the single source of truth for both model training and live API inference,
    ensuring that feature names, order, types, and encodings match 100% at all times.
    Uses one-hot encoding for all categoricals, including Domicile, to prevent category grouping bugs.
    """
    def __init__(self):
        self.min_year = 2015
        self.branch_aliases = {
            "ELECTRONICS AND TELECOMMUNICATION": "ENTC",
            "ELECTRONICS AND TELECOMMUNICATIONS": "ENTC",
            "ELECTRONICS & TELECOMMUNICATION": "ENTC",
            "ELECTRONICS AND TELECOMMUNIC ATIONS": "ENTC",
            "COMPUTER SCIENCE ENGINEERING": "CSE",
            "COMPUTER SCIENCE": "CSE",
            "INFORMATION TECHNOLOGY": "IT",
            "MECHANICAL ENGINEERING": "MECH",
            "CIVIL ENGINEERING": "CE",
            "ELECTRICAL ENGINEERING": "EE",
            "ELECTRONICS INSTRUMENTATION": "EI"
        }
        
        # Unique categories learned in fit()
        self.unique_branches = []
        self.unique_categories = []
        self.unique_quotas = []
        self.unique_genders = []
        self.unique_domiciles = []
        self.feature_columns = []

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
        import re
        branch = re.sub(r"\s+", " ", str(branch)).strip().upper()
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
            parts += ["", "", ""]
            main_cat = parts[0].strip()
            quota_val = parts[1].strip()
            gender_val = parts[2].strip()
        else:
            main_cat = category_str
            quota_val = "GENERAL"
            gender_val = gender_input

        main_cat = self._normalize_category(main_cat)
        
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
        """
        self.min_year = int(df["year"].min())
        
        # Learn branches
        self.unique_branches = sorted(list(df["branch"].dropna().astype(str).unique()))
        
        # Learn categories
        df_parsed = df.copy()
        if "main_category" not in df_parsed.columns or "quota" not in df_parsed.columns or "gender" not in df_parsed.columns:
            parsed = df_parsed.apply(
                lambda row: self._parse_category_parts(row.get("category", "UR"), row.get("gender", "OP")),
                axis=1
            )
            df_parsed["main_category"] = [p[0] for p in parsed]
            df_parsed["quota"] = [p[1] for p in parsed]
            df_parsed["gender"] = [p[2] for p in parsed]
            
        self.unique_categories = sorted(list(df_parsed["main_category"].dropna().astype(str).unique()))
        self.unique_quotas = sorted(list(df_parsed["quota"].dropna().astype(str).unique()))
        self.unique_genders = sorted(list(df_parsed["gender"].dropna().astype(str).unique()))
        self.unique_domiciles = sorted(list(df["domicile"].dropna().astype(str).unique())) if "domicile" in df.columns else ["Y", "AI"]
        
        # Build list of feature columns
        self.feature_columns = ["year", "year_normalized", "is_reserved", "is_female", "is_special_quota"]
        for br in self.unique_branches:
            self.feature_columns.append(f"branch_{br}")
        for cat in self.unique_categories:
            self.feature_columns.append(f"main_category_{cat}")
        for gender in self.unique_genders:
            self.feature_columns.append(f"gender_{gender}")
        for q in self.unique_quotas:
            self.feature_columns.append(f"quota_{q}")
        for dom in self.unique_domiciles:
            self.feature_columns.append(f"domicile_{dom}")
            
        print("FeatureBuilder fitted successfully with one-hot columns:")
        print(f"Total features: {len(self.feature_columns)}")
        return self

    def transform_df(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Processes a whole pandas DataFrame (vectorized).
        Used by the training pipeline script.
        """
        transformed = df.copy()
        
        transformed["branch"] = transformed["branch"].apply(self._clean_branch)
        
        if "main_category" not in transformed.columns or "quota" not in transformed.columns or "gender" not in transformed.columns:
            parsed = transformed.apply(
                lambda row: self._parse_category_parts(row.get("category", "UR"), row.get("gender", "OP")),
                axis=1
            )
            transformed["main_category"] = [p[0] for p in parsed]
            transformed["quota"] = [p[1] for p in parsed]
            transformed["gender"] = [p[2] for p in parsed]
        else:
            transformed["main_category"] = transformed["main_category"].apply(self._normalize_category)
            transformed["gender"] = transformed["gender"].apply(lambda g: "F" if str(g).upper() in ["F", "FEMALE"] else "OP")
            transformed["quota"] = transformed["quota"].astype(str).str.strip().str.upper()

        transformed["is_reserved"] = transformed["main_category"].apply(
            lambda x: 1 if x in ["SC", "ST", "OBC", "EWS"] else 0
        )
        transformed["is_female"] = transformed["gender"].apply(
            lambda x: 1 if x == "F" else 0
        )
        transformed["is_special_quota"] = transformed["quota"].apply(
            lambda x: 1 if x in ["S", "H", "NCC", "FF"] else 0
        )


        transformed["year_normalized"] = transformed["year"] - self.min_year

        # Create one-hot columns
        for br in self.unique_branches:
            transformed[f"branch_{br}"] = (transformed["branch"] == br).astype(int)
        for cat in self.unique_categories:
            transformed[f"main_category_{cat}"] = (transformed["main_category"] == cat).astype(int)
        for gender in self.unique_genders:
            transformed[f"gender_{gender}"] = (transformed["gender"] == gender).astype(int)
        for q in self.unique_quotas:
            transformed[f"quota_{q}"] = (transformed["quota"] == q).astype(int)
        for dom in self.unique_domiciles:
            transformed[f"domicile_{dom}"] = (transformed["domicile"] == dom).astype(int) if "domicile" in transformed.columns else 0

        # Fill missing dummy columns with 0
        for col in self.feature_columns:
            if col not in transformed.columns:
                transformed[col] = 0

        return transformed[self.feature_columns]

    def transform_row(self, rank: int, category: str, gender: str, year: int, branch: str, home_state: str = "MP") -> pd.DataFrame:
        """
        Transforms a single live inference API request into a single-row DataFrame.
        """
        clean_br = self._clean_branch(branch)
        main_cat, quota_val, gender_val = self._parse_category_parts(category, gender)
        
        is_reserved = 1 if main_cat in ["SC", "ST", "OBC", "EWS"] else 0
        is_female = 1 if gender_val == "F" else 0
        is_special_quota = 1 if quota_val in ["S", "H", "NCC", "FF"] else 0
        
        year_normalized = int(year) - self.min_year
        dom_val = 'AI' if str(home_state).upper() == 'OTHER' else 'Y'
        
        row_dict = {
            "year": [int(year)],
            "year_normalized": [int(year_normalized)],
            "is_reserved": [int(is_reserved)],
            "is_female": [int(is_female)],
            "is_special_quota": [int(is_special_quota)]
        }
        
        # Populate dummy variables
        for br in self.unique_branches:
            row_dict[f"branch_{br}"] = [1 if clean_br == br else 0]
        for cat in self.unique_categories:
            row_dict[f"main_category_{cat}"] = [1 if main_cat == cat else 0]
        for g in self.unique_genders:
            row_dict[f"gender_{g}"] = [1 if gender_val == g else 0]
        for q in self.unique_quotas:
            row_dict[f"quota_{q}"] = [1 if quota_val == q else 0]
        for dom in self.unique_domiciles:
            row_dict[f"domicile_{dom}"] = [1 if dom_val == dom else 0]
            
        df = pd.DataFrame(row_dict)
        return df[self.feature_columns]

    def transform_now(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transforms an input DataFrame containing raw fields (e.g. from API payload)
        into the fully engineered feature DataFrame.
        """
        transformed = df.copy()
        if "domicile" not in transformed.columns and "home_state" in transformed.columns:
            transformed["domicile"] = transformed["home_state"].apply(
                lambda hs: 'AI' if str(hs).upper() == 'OTHER' else 'Y'
            )
        return self.transform_df(transformed)

