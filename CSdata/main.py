import pandas as pd

excel_file24 = "data/state_M2024_dl.xlsx"
excel_file21 = "data/state_M2021_dl.xlsx"

df24 = pd.read_excel(excel_file24, sheet_name="state_M2024_dl")
df21 = pd.read_excel(excel_file21, sheet_name="All May 2021 data")

# Filter immediately
software_dev_filtered24 = df24[
    df24["OCC_TITLE"].str.contains("Software Developer", case=False, na=False)
][["AREA_TITLE", "TOT_EMP", "JOBS_1000", "A_MEDIAN"]]

software_dev_filtered21 = df21[
    df21["OCC_TITLE"].str.contains("Software Developer", case=False, na=False)
][["AREA_TITLE", "TOT_EMP", "JOBS_1000", "A_MEDIAN"]]

# Merge
merged = pd.merge(
    software_dev_filtered21,
    software_dev_filtered24,
    on="AREA_TITLE",
    suffixes=("_2021", "_2024")
)

# Convert to numeric
numeric_cols = [
    "TOT_EMP_2021", "TOT_EMP_2024",
    "JOBS_1000_2021", "JOBS_1000_2024",
    "A_MEDIAN_2021", "A_MEDIAN_2024"
]

for col in numeric_cols:
    merged[col] = (
        merged[col]
        .astype(str)
        .str.replace(",", "")
    )
    merged[col] = pd.to_numeric(merged[col], errors="coerce")


# Percentage change
merged["TOT_EMP_change_%"] = (
    (merged["TOT_EMP_2024"] - merged["TOT_EMP_2021"])
    / merged["TOT_EMP_2021"]
) * 100

merged["JOBS_1000_change_%"] = (
    (merged["JOBS_1000_2024"] - merged["JOBS_1000_2021"])
    / merged["JOBS_1000_2021"]
) * 100

merged["A_MEDIAN_change_%"] = (
    (merged["A_MEDIAN_2024"] - merged["A_MEDIAN_2021"])
    / merged["A_MEDIAN_2021"]
) * 100

merged.to_csv("comparison_2021_2024.csv", index=False)
