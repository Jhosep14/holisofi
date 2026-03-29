# Holisofi TV

A dynamic, Disney+ style streaming portal that aggregates and categorizes Anime, Movies, and Streams from diverse sources, featuring a clean modern UI with progressive enhancement and content hydration.

## Features
- **Disney+ Style UI**: Interactive hero carousel, grouped card presentation, smooth hover animations and shimmering loaders.
- **Smart Data Deduplication**: Aliases and varying titles are consolidated automatically via an alias mapping logic (`alias_map.js`).
- **Wikipedia Knowledge Graph Integration**: Automatically downloads thumbnails, cover arts, and high-quality descriptions matching the normalized canonical names.
- **Content Organization**: Episodes automatically grouped by seasons (Z, GT, Super, OVA, Movies), parts or chapter ranges into logical viewing order.
- **Client-Side Heavy**: Runs mostly on modern HTML/CSS/JS without needing a backend other than a static file server to deliver the bundled data. Data hydration relies on localStorage for persistent caching.

## How to Run locally
You can serve the folder using any static web server:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

## Tech Stack
- Vanilla HTML / CSS / JavaScript
- LocalStorage caching
- `fetch` with Wikipedia REST API for progressive content metadata hydration
