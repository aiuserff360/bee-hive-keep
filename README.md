# Bee Hive Keep – Control Command Center

Clickable prototype of the Bee Hive Keep dashboard: a monitoring console for a network of smart beehives.

| | Address |
|---|---|
| **Product demo** | https://aiuserff360.github.io/bee-hive-keep/ |
| **Public website** (landing page) | https://aiuserff360.github.io/bee-hive-keep/landing/ |

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

## Public website

The customer-facing landing page lives in the `landing/` folder and is built together with the product.

- `landing/Landing.tsx` holds all the text and sections.
- `landing/SmartHive.tsx` is the "Smart Hive" section, built from the HarvestWare Digital Hive Ecosystem deck.
- `landing/assets/` holds the product screenshots shown on the page, plus the Smart Hive schematic cropped from that deck.
- **Before sharing the page with customers, set the real contact address.** Change `CONTACT_EMAIL` at the top of `landing/Landing.tsx`. It is a placeholder (`hello@beehivekeep.example`) until then.
- The "Request a demo" form has no server behind it. It opens the visitor's email app with the request filled in.
- The landing page does not link to the product demo. The two are kept separate on purpose.

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
