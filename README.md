# Bee Hive Keep – Control Command Center

Clickable prototype of the Bee Hive Keep dashboard: a monitoring console for a network of smart beehives.

**Live site:** https://aiuserff360.github.io/bee-hive-keep/

## What is in the prototype

| Screen | Address |
|---|---|
| Dashboard | `#/` |
| Hives list | `#/hives` |
| Map | `#/map` |
| Health & Sensors | `#/health-sensors` |
| AI Insights | `#/ai-insights` |
| Alerts | `#/alerts` |
| Honey Production | `#/honey-production` |
| Tasks & Field Ops | `#/tasks` |
| People & Communities | `#/people` |
| Reports | `#/reports` |
| Sustainability | `#/sustainability` |
| Settings | `#/settings` |
| Hive detail (nine tabs) | `#/hives/BGL-042` |

Every one of the 248 hives opens its own detail page with nine tabs: Overview, Live Data, Brood & Colony Health, Honey Production, Environment, Activity & Tasks, History, AI Insights and Notes.

Six screens follow the original design mockups (Dashboard, Hives list, and the Overview, Brood, Honey and Activity tabs). The others were designed to match them.

## Things to know

- **All data is mock data.** It lives in `src/data/`. There is no backend.
- **The date is fixed** at 23 Sep 2026, 10:24 AM so that every timestamp in the mock data stays consistent.
- **Changes are kept only until the page is reloaded.** This covers tasks, alert status and settings. Add Hive, Add Keeper, Log Activity and Upload Photos show their forms but save nothing.
- **Reports download real CSV files** built from the mock data. PDF reports are not generated.
- **"Live" camera views are still photos.**

## Run it on your computer

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

## Publish

Every push to `main` builds the site and publishes it to GitHub Pages (see `.github/workflows/deploy.yml`).

## Built with

React, TypeScript, Vite, Tailwind CSS, Chart.js and Leaflet. Map imagery from Esri and OpenStreetMap. Photo credits are in [CREDITS.md](CREDITS.md).
