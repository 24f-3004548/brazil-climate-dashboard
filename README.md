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

## Gemini API Key Failover

The app supports multiple Gemini API keys and automatically falls back to the next key when one is rate-limited, quota-limited, or invalid.

1. Copy `.env.example` to `.env`.
2. Add your keys in priority order.

Example:

```env
VITE_GEMINI_API_KEY=your_primary_key_here
VITE_GEMINI_API_KEY_1=your_fallback_key_1
VITE_GEMINI_API_KEY_2=your_fallback_key_2
VITE_GEMINI_API_KEY_3=your_fallback_key_3
VITE_GEMINI_API_KEY_4=your_fallback_key_4
VITE_GEMINI_API_KEY_5=your_fallback_key_5
VITE_GEMINI_API_KEY_6=your_fallback_key_6
```

The client uses keys in this order and stops as soon as a request succeeds.

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
- **Google Gemini** — AI-powered chat assistance
- **CSS3** — Custom styling with design tokens

## License

This project is open source and available under the MIT License.
