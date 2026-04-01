# Brazil Climate & Emissions Dashboard

A data-driven interactive dashboard tracking Brazil's climate and emissions trends from 2003–2022, featuring real-time data visualization, AI-powered insights, and comprehensive policy analysis.

## Overview

This dashboard provides an in-depth look at Brazil's emissions landscape, driven primarily by land-use change and deforestation. Explore historical trends, compare Brazil to global peers, and interact with visualizations powered by real climate data.

## Features

- **Interactive Year Selector** — Slide through 2003–2022 to see how metrics evolve
- **KPI Cards** — Track total CO₂, per-capita emissions, deforestation rates, and forest coverage
- **Multi-chart Visualization** — Sector breakdowns, energy growth, income-emissions relationships, and more
- **AI Assistant** — Ask questions about trends, drivers, comparisons, and policy impact; get instant insights
- **Global Comparison** — See how Brazil stacks up against other nations
- **Policy Tracking** — Integrated CCPI and CAT scores for policy context

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to view the dashboard.

### Build for Production

```bash
npm run build
npm run preview
```

## Documentation

For a detailed guide on using the dashboard, interpreting data, and understanding key metrics, see:

- **On-site Docs** — Navigate to the [Documentation](/docs) page in the dashboard
- **[Full Documentation PDF](Brazil_Dashboard_Documentation.pdf)** — Download the complete guide

## Secure AI API Configuration

The dashboard now uses a secure server-side flow:

Frontend -> `/api/chat` -> Gemini API

This keeps API keys off the client and out of browser-visible bundles.

1. Remove any previously used `VITE_*` AI API key variables from local `.env` and your deployment settings.
2. Regenerate your AI key if it was ever exposed client-side.
3. Set the server-side secret:

```env
GEMINI_API_KEY=your_primary_gemini_key_here
GEMINI_API_KEY_1=optional_fallback_key_1
GEMINI_API_KEY_2=optional_fallback_key_2
GEMINI_API_KEY_3=optional_fallback_key_3
GEMINI_API_KEY_4=optional_fallback_key_4
GEMINI_API_KEY_5=optional_fallback_key_5
GEMINI_API_KEY_6=optional_fallback_key_6
GEMINI_ACTIVE_KEY_INDEX=0
GEMINI_ENABLE_KEY_FAILOVER=true
```

4. Deploy with the included serverless function at `api/chat.js`.

Manual rotation behavior:
- `GEMINI_ACTIVE_KEY_INDEX` picks which configured key starts first (`0` = `GEMINI_API_KEY`, `1` = `GEMINI_API_KEY_1`, etc.).
- Set `GEMINI_ENABLE_KEY_FAILOVER=false` to force only the active key (fully manual rotation).
- Keep `GEMINI_ENABLE_KEY_FAILOVER=true` to start from your selected key and fall back to others on transient/upstream key errors.

Optional for custom local setups:

```env
VITE_CHAT_API_URL=http://localhost:3000/api/chat
```

`VITE_CHAT_API_URL` is safe because it is only an endpoint URL, not a credential.

## Project Structure

```
src/
├── climate-dashboard/
│   ├── components/      # Dashboard visualization components
│   ├── data/           # Data sources (Brazil, comparisons)
├── pages/              # Main pages (Dashboard, Docs)
├── utils/              # Utilities (Gemini AI client)
├── App.jsx             # Main app component
└── index.css           # Global styles
```

## Data Sources

All climate and emissions data is sourced from publicly available datasets covering Brazil's environmental metrics from 2003–2022.

## Technology Stack

- **React 18** — UI framework
- **Vite** — Build tool and dev server
- **React Router** — Client-side routing
- **Google Gemini API** — AI-powered chat assistance via serverless backend
- **CSS3** — Custom styling with design tokens

## License

This project is open source and available under the MIT License.
