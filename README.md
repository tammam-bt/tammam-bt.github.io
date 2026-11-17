# Portfolio

[![Live](https://img.shields.io/badge/live-tammam--bt.github.io-087556?style=flat-square&logo=githubpages&logoColor=white)](https://tammam-bt.github.io)

Freelance portfolio for **Tammam Bettayeb**, software and automation engineer in Tunisia: websites, Shopify stores and Python automation.

## Tech Stack

Vanilla HTML + CSS + JavaScript. No dependencies, no build step. Content lives in one JSON file.

## Quick Start

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

The page loads `data/projects.json` with `fetch`, so open it through a local server rather than `file://`.

## Deployment

Push to `main`; GitHub Pages serves the repository root.

## Project Structure

```
├── index.html           # Page shell, meta and Open Graph tags
├── css/styles.css       # Dark forest design system (tokens on :root)
├── js/main.js           # Rendering, hash routes (#<project id>), devices, image viewer
├── data/projects.json   # All content: person, acts, reviews, projects, films
└── assets/
    ├── media/           # Screenshots, demo videos, films, loop film, photo, reviews, slides
    ├── og-image.jpg     # Social preview (1200×630)
    └── favicon.svg
```

## License

All rights reserved. The content, design, and assets are personal and not licensed for reuse.
