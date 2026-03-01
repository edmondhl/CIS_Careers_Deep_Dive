import pandas as pd
import plotly.express as px

def load_excel(file_path, sheet_name):
    df = pd.read_excel(file_path, sheet_name=sheet_name)
    return df


def clean_numeric_columns(df, columns):
    #string vals to numeric
    for col in columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col].astype(str).str.replace(",", ""), errors="coerce")
    return df


def filter_occupation(df, occupation):
    #filter by occupation name
    return df[df["OCC_TITLE"].str.contains(occupation, case=False, na=False)][
        ["AREA_TITLE", "TOT_EMP", "JOBS_1000", "A_MEDIAN"]
    ]


def merge_compare(df_old, df_new, params, suffixes=("_2021", "_2024")):
    #Merge dataframes and calc %s
    merged_comp = pd.merge(df_old, df_new, on="AREA_TITLE", suffixes=suffixes)
    for param in params:
        merged_comp[f"{param}_change_%"] = (
            (merged_comp[f"{param}{suffixes[1]}"] - merged_comp[f"{param}{suffixes[0]}"])
            / merged_comp[f"{param}{suffixes[0]}"]* 100).round(0).astype("Int64")  # percent change in 2021-2024 and rounding to whole numbers
    merged_comp["TOT_EMP_change_abs"] = merged_comp["TOT_EMP_change_%"].abs()
    merged_comp = merged_comp.dropna(subset=[
        "TOT_EMP_2024",
        "A_MEDIAN_2024",
        "TOT_EMP_change_abs"
    ])
    # merged_comp["TOT_EMP_2024"] = merged_comp["TOT_EMP_2024"].fillna(merged_comp["TOT_EMP_2021"])
    # merged_comp["A_MEDIAN_2024"] = merged_comp["A_MEDIAN_2024"].fillna(merged_comp["A_MEDIAN_2021"])
    return merged_comp


def tech_state_summary(df, code_prefix="15-0000"):
    #tech based on OCC-Code
    techs_in_states = df[df["OCC_CODE"].astype(str).str.startswith(code_prefix)][
        ["AREA_TITLE", "TOT_EMP", "JOBS_1000", "A_MEDIAN"]
    ].reset_index(drop=True)
    return techs_in_states


def add_state_abbrev(df, abbrev_dict):
    # only us states + DC
    us_states = df[df["AREA_TITLE"].isin(abbrev_dict.keys())].copy()  # copy for safety when adding new cols
    us_states["state_abbrev"] = us_states["AREA_TITLE"].map(abbrev_dict)
    # check missing abbrevs
    print("Missing abbreviations:", us_states["state_abbrev"].isna().sum())
    return us_states


def plot_tech_map(final_summary, output_file="us_tech_map.html"):
    fig = px.choropleth(
        final_summary,
        locations="state_abbrev",
        locationmode="USA-states",
        color="TOT_EMP",
        scope="usa",
        hover_data={
            "AREA_TITLE": True,
            "TOT_EMP": ":,",
            "A_MEDIAN": ":,.0f",
            "state_abbrev": False
        },
        color_continuous_scale="Oranges",
        title="Tech Employment by State (2024)"
    )
    fig.show()
    fig.write_html(output_file)

def get_tech_occ_codes(df_occupation):
    #ONet function
    #get all 15-xxxx codes
    return (
        df_occupation["O*NET-SOC Code"].astype(str).str.strip().loc[lambda x: x.str.startswith("15-")].unique()
    )

def filter_tech_skills(df_onet_tech, onet_occ_codes):
    #ONet function
    #return all rows that are in the already filtered onet_occ_codes, so just 15-XXXX
    df_onet_tech["O*NET-SOC Code"] = df_onet_tech["O*NET-SOC Code"].astype(str).str.strip()
    return df_onet_tech[df_onet_tech["O*NET-SOC Code"].isin(onet_occ_codes)].copy()

def classify_tech(df_filtered_tech):
    # Onet func, filter hot, in demand and both.
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

    # axis = 1 feeds each row into classify function
    df_filtered_tech["TECH_CATEGORY"] = df_filtered_tech.apply(classify, axis=1)

    # remove useless rows
    df_filtered_tech = df_filtered_tech[df_filtered_tech["TECH_CATEGORY"] != "Neither"].copy()

    return df_filtered_tech

def select_final_columns(df):
    # ONet func
    # keep needed cols, cleaner later on
    return df[[
        "Title",
        "Commodity Title",
        "Hot Technology",
        "In Demand",
        "TECH_CATEGORY"
    ]]


if __name__ == "__main__":
    # Load Excels
    excel_file24 = "data/state_M2024_dl.xlsx"
    excel_file21 = "data/state_M2021_dl.xlsx"
    excel_technology= "data/Technology Skills.xlsx"
    excel_occupation= "data/Occupation Data.xlsx"

    df24 = load_excel(excel_file24, "state_M2024_dl")
    df21 = load_excel(excel_file21, "All May 2021 data")
    df_tech = load_excel(excel_technology, "Technology Skills")
    df_occ = load_excel(excel_occupation, "Occupation Data")

    # ONet section
    # get tech occupation codes
    tech_codes = get_tech_occ_codes(df_occ)

    # filter tech skills
    tech_filtered = filter_tech_skills(df_tech, tech_codes)

    # classify
    tech_classified = classify_tech(tech_filtered)

    # final columns
    final_df = select_final_columns(tech_classified)

    final_df.to_csv("tech_skills_master.csv", index=False)
    fig = px.treemap(
        final_df,
        path=["Title", "TECH_CATEGORY", "Commodity Title"],
        title="Hot & In-Demand Tech Skills by Occupation"
    )
    fig.update_layout(
        font= dict(
            family= "Comic Sans MS",
            size =14,
            color= "black",
        )
    )
    fig.show()
    fig.write_html("tech_skills_master.html")
    # end of onet



    # Columns to clean
    cols = ["TOT_EMP", "JOBS_1000", "A_MEDIAN", "A_MEAN"]
    df24 = clean_numeric_columns(df24, cols)
    df21 = clean_numeric_columns(df21, cols)

    # Testing Software Developers only
    software_dev_filtered24 = filter_occupation(df24, "Software Developers")
    software_dev_filtered21 = filter_occupation(df21, "Software Developers")

    # Merge 2021 and 2024 of specifically soft dev for comparison
    metrics = ["TOT_EMP", "JOBS_1000", "A_MEDIAN"]
    merged = merge_compare(software_dev_filtered21, software_dev_filtered24, metrics)
    merged.to_csv("comparison_2021_2024.csv", index=False)
    print("comparison_2021_2024.csv created.")

    # All tech occupations according to OEWS by state
    tech_by_state = tech_state_summary(df24)
    tech_by_state.to_csv("tech_state_summary.csv", index=False)
    print("tech_state_summary.csv created")

    # State abbreviations for Plotly
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

    # Keep only US states + DC for now
    state_summary = add_state_abbrev(tech_by_state, state_abbrev)

    # Test map
    plot_tech_map(state_summary)

    #software dev chart
    scatter = px.scatter(
        merged,
        x="TOT_EMP_2024",
        y="A_MEDIAN_2024",
        size="TOT_EMP_change_abs",
        color="JOBS_1000_2024",
        hover_name="AREA_TITLE",
        title="Software Developer Market Strength by State (2024)",
    )

    scatter.update_traces(
        marker=dict(line=dict(width=1, color="black")),  # outline bubbles
        selector=dict(mode="markers")
    )

    scatter.show()
    scatter.write_html("software_dev.html")