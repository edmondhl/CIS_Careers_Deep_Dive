import pandas as pd
import os

OUTPUT_DIR = r"..\front\public"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_excel(file_path, sheet_name):
    df = pd.read_excel(file_path, sheet_name=sheet_name)
    return df

def clean_numeric_columns(df, columns):
    for col in columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col].astype(str).str.replace(",", ""), errors="coerce")
    return df

def filter_occupation(df, occupation):
    return df[df["OCC_TITLE"].str.contains(occupation, case=False, na=False)][
        ["AREA_TITLE", "OCC_TITLE", "TOT_EMP", "JOBS_1000", "A_MEDIAN"]
    ]

#Combine 21 and 24 dataframes and combines them , then calcs how much each metric changed between the years
def merge_compare(df_old, df_new, params, suffixes=("_2021", "_2024")):
    merged_comp = pd.merge(df_old, df_new, on="AREA_TITLE", suffixes=suffixes)
    for param in params:
        merged_comp[f"{param}_change_percent"] = (
            (merged_comp[f"{param}{suffixes[1]}"] - merged_comp[f"{param}{suffixes[0]}"])
            / merged_comp[f"{param}{suffixes[0]}"] * 100).round(0).astype("Int64")
    merged_comp["TOT_EMP_change_abs"] = merged_comp["TOT_EMP_change_percent"].abs()
    merged_comp = merged_comp.dropna(subset=[
        "TOT_EMP_2024",
        "A_MEDIAN_2024",
        "TOT_EMP_change_abs"
    ]) # drop incomplete rows
    return merged_comp

#code to the col in gov data where it gives overall avg of tech job in state
def tech_state_summary(df, code_prefix="15-0000"):
    techs_in_states = df[df["OCC_CODE"].astype(str).str.startswith(code_prefix)][
        ["AREA_TITLE", "TOT_EMP", "JOBS_1000", "A_MEDIAN"]
    ].reset_index(drop=True)
    return techs_in_states

def add_state_abbrev(df, abbrev_dict):
    us_states = df[df["AREA_TITLE"].isin(abbrev_dict.keys())].copy()
    us_states["state_abbrev"] = us_states["AREA_TITLE"].map(abbrev_dict)
    print("Missing abbreviations:", us_states["state_abbrev"].isna().sum())
    return us_states

#all occupations that start with 15- are tech related
def get_tech_occ_codes(df_occupation):
    return (
        df_occupation["O*NET-SOC Code"].astype(str).str.strip().loc[lambda x: x.str.startswith("15-")].unique()
    )

#returns only the technology skills data that belong to the tech occupations in dataset. also removes any whitespace in the 15- code
def filter_tech_skills(df_onet_tech, onet_occ_codes):
    df_onet_tech["O*NET-SOC Code"] = df_onet_tech["O*NET-SOC Code"].astype(str).str.strip()
    return df_onet_tech[df_onet_tech["O*NET-SOC Code"].isin(onet_occ_codes)].copy()

def classify_tech(df_filtered_tech):
    def classify(row):
        hot = str(row["Hot Technology"]).strip().upper()
        demand = str(row["In Demand"]).strip().upper()
        if hot == "Y" and demand == "Y":
            return "Hot & In Demand"
        elif hot == "Y":
            return "Hot Only"
        elif demand == "Y":
            return "In Demand Only"
        else:
            return "Neither"

    df_filtered_tech["TECH_CATEGORY"] = df_filtered_tech.apply(classify, axis=1)
    df_filtered_tech = df_filtered_tech[df_filtered_tech["TECH_CATEGORY"] != "Neither"].copy()
    return df_filtered_tech

def select_final_columns(df):
    return df[[
        "Title",
        "Example",
        "Commodity Title",
        "Hot Technology",
        "In Demand",
        "TECH_CATEGORY"
    ]]

def save_json(df, filename):
    path = os.path.join(OUTPUT_DIR, filename)
    df.to_json(path, orient="records", indent=2)
    print(f"{filename} created at {path}")

if __name__ == "__main__":
    # Load Excels
    excel_file24 = "data/state_M2024_dl.xlsx"
    excel_file21 = "data/state_M2021_dl.xlsx"
    excel_technology = "data/Technology Skills.xlsx"
    excel_occupation = "data/Occupation Data.xlsx"

    df24 = load_excel(excel_file24, "state_M2024_dl")
    df21 = load_excel(excel_file21, "All May 2021 data")
    df_tech = load_excel(excel_technology, "Technology Skills")
    df_occ = load_excel(excel_occupation, "Occupation Data")

    # ONet section
    tech_codes = get_tech_occ_codes(df_occ)
    tech_filtered = filter_tech_skills(df_tech, tech_codes)
    tech_classified = classify_tech(tech_filtered)
    final_df = select_final_columns(tech_classified)
    save_json(final_df, "tech_skills_master.json")

    # Columns to clean
    cols = ["TOT_EMP", "JOBS_1000", "A_MEDIAN", "A_MEAN"]
    df24 = clean_numeric_columns(df24, cols)
    df21 = clean_numeric_columns(df21, cols)

    # occupations in state comparison
    occupations= [ "Software Developers", "Computer Programmers", "Data Scientist", "Web Developers"]
    metrics = ["TOT_EMP", "JOBS_1000", "A_MEDIAN"]
    all_filtered = []
    for occ in occupations:
        df24_occ = filter_occupation(df24, occ)
        df21_occ = filter_occupation(df21, occ)
        merged_occ = merge_compare(df21_occ, df24_occ, metrics)
        all_filtered.append(merged_occ)

    merged_all = pd.concat(all_filtered, ignore_index=True)
    save_json(merged_all, "comparison_2021_2024.json")

    # All tech occupations by state
    tech_by_state = tech_state_summary(df24)

    state_abbrev = {
        "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
        "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
        "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
        "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
        "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
        "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
        "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
        "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
        "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
        "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI",
        "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX",
        "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
        "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
        "District of Columbia": "DC"
    }

    state_summary = add_state_abbrev(tech_by_state, state_abbrev)
    save_json(state_summary, "tech_state_summary.json")