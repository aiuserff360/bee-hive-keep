# Bee Hive Keep – Control Command Center

Clickable prototype of the Bee Hive Keep dashboard: a monitoring console for a network of smart beehives.

**Live site:** https://aiuserff360.github.io/bee-hive-keep/

## What is in the prototype

| Screen | Address |
|---|---|
| Dashboard | `#/` |
| Hives list | `#/hives` |
| Map | `#/map` |
| Hive – Overview | `#/hives/BGL-042` |
| Hive – Brood & Colony Health | `#/hives/BGL-042/brood` |
| Hive – Honey Production | `#/hives/BGL-042/honey` |
| Hive – Activity & Tasks | `#/hives/BGL-042/activity` |

Every one of the 248 hives opens its own detail page. Screens that have no design yet show a "coming soon" page.

## Things to know

- **All data is mock data.** It lives in `src/data/`. There is no backend.
- **The date is fixed** at 23 Sep 2026, 10:24 AM so that every timestamp in the mock data stays consistent.
- **Tasks you add are kept only until the page is reloaded.** Add Hive, Log Activity and Upload Photos show their forms but save nothing.
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
