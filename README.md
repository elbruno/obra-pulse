# 🏗️ ObraPulse — AI Construction Command Center

> A static web dashboard for real-time construction portfolio monitoring, built for the **AI Construction Summit 2026**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://elbruno.github.io/obra-pulse/)

🔗 **Live demo:** [https://elbruno.github.io/obra-pulse/](https://elbruno.github.io/obra-pulse/)

---

## Screenshot

<!-- Add a screenshot after first deployment -->
![ObraPulse dashboard screenshot](screenshot.png)

---

## Features

- **KPI Row** — live count-up animation for 5 portfolio metrics
- **AI Recommendations Panel** — prioritized actions generated from portfolio data
- **Interactive Charts** — RFI activity (line), schedule top movers (bar), portfolio status (donut)
- **Projects Table** — sortable, searchable, filterable by Estado / Tipo / Ubicación
- **Alerts Feed** — overdue RFIs, HSE incidents, cost overruns
- **Dark / Light mode** toggle
- **100% static** — no server, no build step, no dependencies to install

---

## Run Locally

Just open `index.html` in any modern browser — no server required:

```bash
# Option A: double-click index.html in your file explorer

# Option B: use VS Code Live Server extension
# Right-click index.html → "Open with Live Server"

# Option C: Python quick server
python -m http.server 8080
# then visit http://localhost:8080
```

---

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under *Source*, select **Deploy from a branch**.
4. Choose branch **`main`** and folder **`/ (root)`**.
5. Click **Save**.
6. Your site will be live at:

```
https://elbruno.github.io/obra-pulse/
```

> It may take 1–2 minutes for the first deploy to appear.

### Automatic Deployment (GitHub Actions)

This repository includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that automatically deploys to GitHub Pages on every push to `main`. No manual steps required after the first setup.

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|--------------------------------------------------|
| Markup      | HTML5 (semantic)                                 |
| Styling     | CSS3 (custom properties, grid, flexbox)          |
| Logic       | Vanilla JavaScript (ES2020+)                     |
| Charts      | [Chart.js](https://www.chartjs.org/) via CDN    |
| Hosting     | GitHub Pages (static)                            |

No frameworks. No build pipeline. No Node.js required.

---

## Editing the Data

All mock data lives in **`data.json`** at the repository root.

| Key             | Description                              |
|-----------------|------------------------------------------|
| `proyectos`     | Array of 8 project objects               |
| `kpis`          | Top-level portfolio KPI numbers          |
| `recomendaciones` | AI recommendation items               |
| `alertas`       | Alert feed items                         |
| `rfiActividad`  | Labels + series for the RFI line chart   |
| `topMovers`     | Projects + delay days for the bar chart  |

Edit `data.json` and refresh the browser — no rebuild needed.

---

## File Structure

```
obra-pulse/
├── index.html      ← Page structure (no inline CSS or JS)
├── styles.css      ← All visual styling
├── app.js          ← Data loading, chart rendering, interactivity
├── data.json       ← All mock data (edit here)
└── README.md       ← This file
```

---

## Credits

Demo construida con **GitHub Copilot** · Bruno Capuano · [@elbruno](https://github.com/elbruno)

> Datos ficticios con fines ilustrativos · AI Construction Summit 2026
