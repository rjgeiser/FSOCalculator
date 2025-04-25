# 🇺🇸 FSO Separation Benefits Calculator – Version 2

This Progressive Web App helps Foreign Service Officers estimate their separation benefits, including retirement options, severance, FEHB continuation, and projected lifetime annuities. Built with privacy, portability, and precision in mind, this tool can be run entirely offline.

---

## 🚀 What’s New in Version 2

### 🧠 Functional Upgrades
- **Distinct VERA and TERA Retirement Scenarios**  
  New eligibility logic, reduction calculations, and output estimates for **Voluntary Early Retirement Authority (VERA)** and **Temporary Early Retirement Authority (TERA)**.
- **2025 FEHB Premium Updates**  
  Reflects the most recent Federal Employees Health Benefits (FEHB) plan year premiums.
- **Additional FEHB Plans Supported**  
  Includes **NALC** and **GEHA HDHP** options with employer/employee contribution breakdowns.
- **Lifetime Annuity Scenarios Enhanced**  
  Now includes ineligible comparisons with explanations and reduced annuity estimates.

### 🎨 UI/UX and Platform Enhancements
- **Modernized UI Layout**: Two-column layout for better separation of form and results.
- **Dark Mode Support**: Toggle between light and dark themes with a visual slider (🌞/🌕).
- **Sticky Toggle Placement**: Theme switcher remains fixed to the top-right for non-intrusive access.
- **Responsive & Mobile-Friendly**: Seamless experience across iPad, tablet, and desktop.
- **Scroll-Independent Columns**: Form and results panes scroll independently for better usability.

---

## 🧭 Core Features

- **Benefit Tabs**:
  - Severance Estimate
  - Retirement Options (Immediate, VERA, TERA, MRA+10, Deferred)
  - Health Premium Impact
  - Lifetime Total Annuity Projections

- **Custom Input Support**:
  - Age, grade, step, SCD override, high-3 salary, leave balances
  - Health insurance plan selection & home state

- **Policy-Linked Logic**:
  - Adheres to FSPS and USG early retirement rules
  - Dynamic SRS eligibility with explanation of reductions

---

## 📦 Project Structure

```
FSOCalculator/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── data/
│   └── fehb-2025.json
├── assets/
│   ├── icons/
│   │   └── sun.svg, moon.svg
├── README.md
└── ...
```

---

## 🛠️ Getting Started

1. **Clone or download the repo**:
   ```bash
   git clone https://github.com/rjgeiser/FSOCalculator.git
   cd FSOCalculator
   ```

2. **Open in browser**:
   - Open `index.html` in your preferred browser
   - No build steps or backend required

3. **Use offline**:
   - Fully self-contained: no data is stored or transmitted
   - Works offline as a local file or installed as a PWA

---

## 📸 Screenshots

*Include screenshots of light and dark modes, lifetime report outputs, and the new toggle placement.*

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 📜 Version 1 Archive (2024)

[Legacy content preserved below for reference]


## Foreign Service Officer Separation Benefits Calculator

This calculator helps U.S. Foreign Service Officers estimate the financial benefits associated with separation or retirement from federal service. It calculates:

- **FSPS annuity** based on service years, grade, and high-three salary
- **Severance pay**, if applicable
- **Health insurance continuation** costs and options
- **Eligibility for retirement paths**: Immediate, V/TERA, MRA+10, Deferred
- **Lifetime value** of retirement benefits through age 85

## Features

### ✅ Retirement Scenario Comparison
Compares all available retirement paths side-by-side:
- Displays eligibility with detailed notes
- Shows annuity amount, start age, and any early reductions
- Includes V/TERA option with user-adjustable eligibility thresholds

### ✅ Lifetime Report
Generates a clear summary of total projected retirement benefits received through age 85:
- Two-column layout: Type and Total Value
- Inline assumptions (annuity × years, start age)
- Specific ineligibility reasons for each type (e.g., "requires 20 years of service" or "grade below FS-01")
- One-time severance payment if applicable

### ✅ Customizable Health Insurance Output
- Reflects current plan and coverage selection
- Calculates continuation costs under FEHB/COBRA

### ✅ Clear Eligibility Descriptions
- Dynamic messages explain why a user does or does not qualify for each retirement type
- Adjusts based on user-entered age, years of service, and grade

## Technical Details

- Built entirely with HTML, JavaScript, and CSS
- No backend required
- Responsive layout for mobile and desktop
- Dark mode support available but disabled by default for stability

## How to Use

1. Clone or download the repository.
2. Open `index.html` in a modern browser.
3. Enter your service details, including age, years of service, FS grade, salary history, and insurance plan.
4. View detailed results across all retirement options.
5. Review the "Lifetime Report" tab for total projected value through age 85.

## Limitations

- Assumes uninterrupted creditable service
- Does not currently include Social Security or TSP projections
- V/TERA and involuntary separation rules may vary depending on agency-specific policies

## Legal Reference
- MRA is capped at **57** based on FSPS regulation. See [AFSA FSPS Guide (PDF)](https://afsa.org/sites/default/files/foreign-service-pension-system-fsps-grb-inc.pdf)

## Credits
Created by [Roy Geiser] for personal and professional use. Not an official State Department tool.

---
For questions, updates, or suggestions, please contact via GitHub Issues or pull request.
