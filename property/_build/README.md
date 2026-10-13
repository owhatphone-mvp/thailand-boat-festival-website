# Phuket Property Expo pages — generator (not served: /property/_build/* returns 404, see netlify.toml)

Edit the strings or templates here and rebuild; don't hand-edit property/index.html, property/th/, property/preview/ — a rebuild overwrites them.

- `build_v3.py` — EN/TH string dictionaries (all copy, hours, contacts) + v3 "layered" template render. Live /property/ is v3.
  `python3 -I property/_build/build_v3.py . property/_build /property/ "index,follow"`
- `build_v5.py` — v5 "sales gallery" (reuses build_v3.py strings, adds v5 keys, wraps Thai loanwords in .nw). Preview:
  `python3 -I property/_build/build_v5.py . property/_build /property/preview/`
  To make v5 live: `python3 -I property/_build/build_v5.py . property/_build /property/ "index,follow"`
- Hours appear in build_v3.py (f2, v1, ld_desc, EN+TH), in the templates' JSON-LD startDate/endDate, in v5_template.html (.hours list), and in netlify/functions/property-lead.js (auto-reply).
- Assets for v5 live in property/assets/v5/. `render_model.js` (turntable frames, plan) and `render_mass.js` (illustrative massing models) render them with Playwright + three.js from a copy of property/3d/index.html that exposes `window.ppxModel`; see the project doc claude/PPX_2027_Design_System.md for the full provenance and the design system.

## Hero render (Blender Cycles), 14 Oct 2026
- `export_scene.js` (Playwright) opens a copy of property/3d/index.html that exposes `window.ppxModel` (booth signs set to current categories) and writes scene.json (meshes in world space, materials, sign/panel textures).
- `render_hall.py` (pip `bpy` 5.2, Cycles CPU, OIDN denoise) rebuilds the hall with real materials (polished stone floor, lacquered joinery, oak, brass), dark venue shell via env `WALL=1d3a3c CEIL=22393a WORLD=0.25`, area lights + stage spots, bevelled edges, DOF.
  Desktop: `render_hall.py out.png 1920 1080 96 "4.5,2.9,0" "44,1.0,0" 54 14` (~17 min on 2 cores). Mobile: `... 1080 1920 96 "4.5,2.6,0" "44,0.6,0" 70 14`.
- Outputs → property/assets/v5/hall-hero.webp (1920), hall-hero-1280.webp, hall-hero-m.webp (1080×1920).
