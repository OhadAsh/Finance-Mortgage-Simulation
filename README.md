# Assets & Mortgage Simulator

A client-side web app for personal financial planning — cash-flow simulation, mortgage modeling, income scenarios, and optional AI insights.

**Live demo:** [ohadash.github.io/Finance-Mortgage-Simulation](https://ohadash.github.io/Finance-Mortgage-Simulation/)

---

## Features

- **Asset management** — add, edit, delete, and import from Excel
- **Mortgage** — apartment value, equity, interest rate, move-in month
- **Income scenarios** — three profiles (full / partial / minimal) with primary and secondary income
- **Charts** — assets, net equity, and LTV over 30 months
- **AI insights** — preset prompts and free-text questions (via OpenRouter, optional)
- **Local persistence** — all data stays in browser `localStorage` only
- **Export** — PDF report with charts, or Excel with data as entered (savings / mortgage / scenarios)

> **Privacy:** No backend. Your data never leaves the browser (except AI API calls if you add a key).

---

## Quick start

### Use the live site (no install)

1. Open the [live demo](https://ohadash.github.io/Finance-Mortgage-Simulation/)
2. Add assets manually or import from Excel (see below)
3. Fill in mortgage parameters and an income scenario
4. Review charts and metrics

### Run locally

```bash
git clone https://github.com/OhadAsh/Finance-Mortgage-Simulation.git
cd Finance-Mortgage-Simulation
npm install
npm run dev
```

The app runs at `http://localhost:5173`

### Production build

```bash
npm run build
npm run preview
```

---

## Importing assets — Excel

The app supports **Excel (`.xlsx`)** only.

### Template

[assets-template.xlsx](public/assets-template.xlsx)

From the live site: `https://ohadash.github.io/Finance-Mortgage-Simulation/assets-template.xlsx`

---

### Sheet format (`חסכונות`)

Tabular layout — **one column per partner**:

| מוצר/שם (product) | שותף א׳ (partner A) | שותף ב׳ (partner B) | נזיל/לא נזיל (liquidity) | הערות (notes) |
|-------------------|---------------------|---------------------|--------------------------|---------------|
| קרן השתלמות | 150000 | 120000 | לא נזיל | נפתח בעתיד |
| עובר ושב | 25000 | 8000 | נזיל | |

**Rules:**
- First row is the header (Hebrew column names as shown)
- Partner columns: each cell with amount > 0 becomes a separate asset
- `נזיל` → liquid | `לא נזיל` → semi-liquid
- If notes contain **"לא כולל מיסים"** — 25% tax is applied automatically
- Summary rows (`סך הכל`, `ביחד`, etc.) are skipped automatically
- You can add more partner columns (partner C, D, …)

**Usage:**
1. Download `assets-template.xlsx` or copy the structure into your own file
2. Fill data on the **חסכונות** sheet (or the first sheet)
3. In the app: **Financial assets → Import Excel**
4. Choose **Replace all** or **Merge**

---

## AI insights (optional)

1. Create a key at [OpenRouter](https://openrouter.ai/)
2. In the app: click **API Key** and paste it
3. The key is stored only in your browser
4. Pick a preset question or ask your own

---

## Deploy to GitHub Pages

The repo includes an automated workflow (`.github/workflows/deploy.yml`).

1. Push to the `main` branch
2. On GitHub: **Settings → Pages → Source:** Deploy from branch → `gh-pages` / root
3. The site updates automatically on every push

---

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand (state + persist)
- Recharts (charts)
- SheetJS / xlsx (Excel)
- OpenRouter API (AI)

---

## Project structure

```
src/
├── components/   # UI — assets, mortgage, scenarios, charts, AI
├── hooks/        # useSimulation, useAiInsights, useExportReport
├── lib/          # calculations, excelParser, exportReport, aiInsights
├── store/        # Zustand stores
└── types/        # TypeScript interfaces
```

---

## License

Open source for personal use and learning.
