# CIS Careers Deep Dive

A data analysis and visualization project that explores tech employment trends, salary changes, and in-demand technologies across U.S. states using government-provided labor and occupation data.

---

## Overview

This project pulls from two main data sources — BLS/OEWS for employment and salary statistics, and O\*NET for technology skill classifications. The Python backend processes and exports the data as JSON, which is then consumed by a Next.js frontend that renders an interactive choropleth map and state-level occupation breakdowns.

---

## Project Structure

```
CSDeepDive/
├── CSdata/                  # Python backend
│   ├── main.py              # Main data processing script
│   ├── requirements.txt
│   └── data/                # Raw Excel source files (2021-2024)
│       ├── state_M2024_dl.xlsx
│       ├── state_M2020_dl.xlsx
│       ├── state_M2021_dl.xlsx
│       ├── Technology Skills.xlsx
│       ├── Occupation Data.xlsx
│       └── RPP2021-2024.xlsx       
│
└── front/                   # Next.js frontend
├── app/
│   ├── page.tsx                    # Choropleth map home page with national highlights
│   └── state/[state]/page.tsx      # State detail page
├── components/
│   └── choroplethMap.tsx           # Plotly choropleth component
└── public/                         # JSON output from Python script
├── comparison_2020_2024.json
├── comparison_2021_2024.json
├── tech_state_summary.json
└──tech_skills_master.json

```

---

---

## Data Pipeline
The Python script (`main.py`) processes raw Excel files and outputs four JSON files into `front/public/`:

| Output File | Description |
|---|---|
| `comparison_2021_2024.json` | 2021 vs 2024 employment, jobs per 1k, median salary by occupation and state + RPP|
| `comparison_2020_2024.json` | 2020 vs 2024 employment, jobs per 1k, median salary by occupation and state + RPP|
| `tech_state_summary.json` | Total tech employment and median salary aggregated by state (SOC 15-XXXX) |
| `tech_skills_master.json` | Hot and in-demand technology skills by occupation from O*NET |

---

## Backend Setup
**Requirements:** Python 3.8+

Install dependencies:
```bash
pip install -r requirements.txt
```

Place raw Excel files in `CSdata/data/` then run:
```bash
python main.py
```

JSON files will be written to `../front/public`.

---

## Frontend Setup
**Requirements:** Node.js 18+

```bash
cd front
npm install
npm run dev
```

Open localhost

### Key Pages

| Route | Description |
|---|---|
| `/` | Choropleth map of total tech employment by state with national highlights (top paying state, most growth, best buying power). Click a state to drill down. |
| `/state/[state]` | Per-occupation breakdown with bar charts and % change cards for employment, jobs per 1k, and median salary (2021 vs 2024). Includes cost of living adjusted salary in the state header. |
| `/skills/[occupation]` | In-demand and hot technology skills for a given occupation. |

---

## Tech Stack

**Backend**
- Python — pandas, plotly

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Plotly (choropleth map, etc)
- Custom SVG charts (state detail bar charts)

---

## Data Sources
- [U.S. Bureau of Labor Statistics (BLS)](https://www.bls.gov/)
- [Occupational Employment and Wage Statistics (OEWS)](https://www.bls.gov/oes/)
- [O*NET Resource Center](https://www.onetcenter.org/)
- [U.S. Bureau of Economic Analysis (BEA) — Regional Price Parities](https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area)

---

## Status
Work in progress — occupations and skill visualizations actively being expanded.

---

## Author
Edmond Liu

