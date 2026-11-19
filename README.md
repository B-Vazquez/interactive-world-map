# Interactive World Map

An Angular application for exploring country information on an interactive world map. Select a country or search by name to view its capital, region, income level, and geographic coordinates.

The app is hosted at [https://b-vazquez.github.io/interactive-world-map/](https://b-vazquez.github.io/interactive-world-map/).

## Requirements

- Node.js `^22.22.3`, `^24.15.0`, or `>=26.0.0` (Angular 22 supported versions)
- npm 8 or later

The application uses Angular 22.3, TypeScript 6.0, and Zone.js 0.16.

## Run locally

From the project directory, install dependencies and start the development server:

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200). The Angular development server reloads the app when source files change.

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Angular development server. |
| `npm run build` | Create a production build in `dist/d280-map`. |
| `npm run build:github-pages` | Build the production app into ignored `dist/github-pages/` with the Pages base path. |
| `npm test` | Run unit tests with Vitest and jsdom; Chrome/Chromium is not required. |

The unit tests cover the map and information panel, map asset loading and clicks, and World Bank requests, including search errors and superseded requests. Use `npm test -- --watch=false` to run tests once.

## How it works

- `src/assets/world-map.svg` contains the checked-in map geometry. `MapApiService` loads it as a static asset, and `MapComponent` displays it and handles country-path clicks.
- Clicking a country fetches that country's record from the World Bank API.
- Searching matches a country name case-insensitively against the World Bank country list, fetched in one request per search.
- The map emits country details to `AppComponent`, which passes them to `MapInfoComponent` for display.
- API and map-loading errors are shown in the interface. New searches or country selections cancel earlier requests so stale responses do not replace newer results.

The app uses the public World Bank V2 API:

- Country selection: `https://api.worldbank.org/v2/country/{countryCode}?format=json`
- Country search: `https://api.worldbank.org/v2/country?format=json&per_page=400`

No API key or additional environment configuration is required. Map loading and country data both require a network connection.

## Project layout

- `src/app/map/` — interactive map, search, and related unit tests.
- `src/app/map-info/` — country information display and unit tests.
- `src/app/map-api.service.ts` — SVG asset and World Bank API requests.
- `src/app/*.spec.ts` — service and application unit tests.
- `src/assets/world-map.svg` — source map asset.
