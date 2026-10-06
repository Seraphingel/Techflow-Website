# TechFlow

> TechFlow solves the fragmentation and opacity of modern laptop hardware specifications and used-market pricing by providing an interactive chip-level architecture catalog and a real-time Philippine secondary market valuation engine.

---

## Tech Stack

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![BeautifulSoup](https://img.shields.io/badge/BeautifulSoup-59666C?style=for-the-badge&logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JSON / Excel](https://img.shields.io/badge/Data-JSON%20%2F%20Excel-217346?style=for-the-badge&logo=microsoft-excel&logoColor=white)

- **Scraping & Data Telemetry**: Python, Playwright, BeautifulSoup
- **Frontend & UI/UX**: Vanilla JavaScript (ES6+), Tailwind CSS, FontAwesome 6
- **Data Architecture**: Structured JSON & Master Excel Registry (`nanoreview_master.xlsx`)

---

## Features & Roadmap

### Functional Features
- **Comprehensive Hardware Index**: Curated catalog covering 35 series and 339 laptop models across ASUS, Lenovo (including ThinkPad), MSI, and HP.
- **Interactive Silicon Configurator**: Dynamic CPU and GPU configuration switching that instantly updates device specifications.
- **Philippine Resale Valuation Engine**: Algorithmic secondary market valuation factoring in introductory SRP, silicon tiering, generation age, and halo tier bonuses.
- **Spec Bento & Calculated Capability Metrics**: Six-card architectural bento grid alongside 0–100 capability ratings for Computing, Gaming, Display Fidelity, and Battery Mobility.
- **Command Palette Spotlight Search**: Keyboard-first search overlay (`Ctrl+K` / `Cmd+K`) supporting live navigation with Arrow keys and instant filtering.
- **Monochrome & Accessible Design**: Concentric rounded geometry, tactile button feedback (`scale(0.96)`), `:focus-visible` accessibility rings, and seamless Light/Dark mode toggling with transition suppression.

### Roadmap / In Progress
- **Scraping Speed & Concurrency**: Transitioning from sequential browser automation to asynchronous batch extraction using `httpx` and Playwright connection pooling.
- **Cloudflare Challenge & Anti-Bot Optimization**: Implementing stealth browser fingerprinting and session caching to eliminate 403 blocks during mass data crawls.
- **Telemetry Database Migration**: Moving local JSON/Excel data stores to SQLite / PostgreSQL for scalable querying and model comparison queries.
- **Automated Price Syncing**: Background scrapers to continuously track second-hand Philippine listings (TipidPC, Carousell, FB Marketplace) for active market calibration.

---

## Author

Created and maintained by [**@Seraphingel**](https://github.com/Seraphingel).
