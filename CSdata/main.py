import pandas as pd

# Load Excels
excel_file24 = "data/state_M2024_dl.xlsx"
excel_file21 = "data/state_M2021_dl.xlsx"

df24 = pd.read_excel(excel_file24, sheet_name="state_M2024_dl")
df21 = pd.read_excel(excel_file21, sheet_name="All May 2021 data")

#cols
cols = ["TOT_EMP", "JOBS_1000", "A_MEDIAN", "A_MEAN"]

#to convert the string values into a number in each col and to replace the comma
for col in cols:
    for df in [df24, df21]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col].astype(str).str.replace(",", ""), errors="coerce")


# testing soft dev only
software_dev_filtered24 = df24[df24["OCC_TITLE"].str.contains("Software Developer", case=False, na=False)][
    ["AREA_TITLE", "TOT_EMP", "JOBS_1000", "A_MEDIAN"]
]
software_dev_filtered21 = df21[df21["OCC_TITLE"].str.contains("Software Developer", case=False, na=False)][
    ["AREA_TITLE", "TOT_EMP", "JOBS_1000", "A_MEDIAN"]
]

# merge 2021 and 2024 of specifically soft dev for comparison
merged = pd.merge(
    software_dev_filtered21,
    software_dev_filtered24,
    on="AREA_TITLE",
    suffixes=("_2021", "_2024")
)

# % growth calcs
metrics = ["TOT_EMP", "JOBS_1000", "A_MEDIAN"]
for metric in metrics:
    merged[f"{metric}_change_%"] = (
        (merged[f"{metric}_2024"] - merged[f"{metric}_2021"])
        / merged[f"{metric}_2021"]
        * 100
    ).round(0).astype("Int64")


# save to csv
merged.to_csv("comparison_2021_2024.csv", index=False)
print("✅ comparison_2021_2024.csv created.")



#all tech occupations according to OEWS by state
tech_by_state = df24[df24["OCC_CODE"].astype(str).str.startswith("15-0000")][["AREA_TITLE", "TOT_EMP", "JOBS_1000", "A_MEDIAN"]]

# csv
tech_by_state.to_csv("tech_state_summary.csv", index=False)
print("✅ tech_state_summary.csv created")
