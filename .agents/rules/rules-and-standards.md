---
trigger: manual
---

# TechFlow Project Rules & Architecture Standards

## Project Context

- TechFlow is a Laptop Comparison & Review Hub designed specifically for non-tech-literate students.
- All code lives in a single `techflow_journal.html` file using HTML5, Tailwind CSS (via CDN), FontAwesome 6, and Vanilla JavaScript.

## Code Structure & Constraints

1. **Single File Standard**: Keep all HTML, custom `<style>` rules, and JavaScript embedded inside `techflow_journal.html`. Do not break code out into separate external `.css` or `.js` files unless explicitly requested.
2. **Styling Engine**: Use Tailwind CSS classes for all layout and design elements. Limit `<style>` block usage to custom animations, scrollbars, and dynamic background shapes.
3. **Dynamic Theme Engine**:
   - Productivity Laptops = Light Mode
   - Gaming Laptops = Dark Mode
   - Smooth transition animations must be preserved when switching themes.

## Full Analysis View Guidelines (STRICT)

1. **No Prose Summaries**: NEVER write paragraph-long reviews.
2. **Configuration Pod Strategy**:
   - Laptop spec variations must be organized into configuration tiers.
   - Use the custom animated dropdown formatted as `CPU + GPU` (e.g., `Intel Core i7-13650HX + GeForce RTX 5060 8GB`).
   - Selecting a tier updates the specs table and pricing dynamically without jarring full-page animations.
3. **Spec Table Layout**:
   - Highlight **CPU** and **GPU** prominently in distinct tiles at the top.
   - Include CPU Architecture inside the CPU badge and GPU TGP inside the GPU badge.
   - Pair specs horizontally on the same row (e.g., `RAM Capacity` next to `RAM Generation`, `Storage Capacity` next to `Storage Type`).
4. **Content Sections Only**:
   - Header & Dropdown Selector
   - Pricing Banner (Separate Original and Discounted/Second-hand prices)
   - System Architecture (Capability Graphs + Spec Table)
   - Strengths
   - Considerations

## Sorting & Navigation Rules

- Categories: Brand -> Series Category (Productivity / Gaming) -> Model -> Configuration Tier.
- Series cards under Productivity and Gaming must be sorted strictly from left to right based on `priceTier` (Budget -> High-End).
