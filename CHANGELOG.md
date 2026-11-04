# Changelog

## 0.2.0 — 2026-11-04

- Cinematic intro timeline: 7.2s default, 3.8s / 10s choices, with a visible
  **Skip** button and Esc to exit early.
- Theme dock in `shell.overlay`: ten palettes derived from
  `E:\mv-refs\palette.json` (swamp, warm gold, teal, sunset, dark room) and
  `E:\web\Geometric Islands\style.css` (blue, green, amber, purple, night).
- Palette-aware ocean canvas and Penrose light sweep; stronger ocean grid
  contrast.
- Settings persisted in `localStorage` (`dsh-splash:settings`), with a live
  **Preview splash** action that does not require a restart.
- New dev overrides: `?dsh-splash-palette=<id>` and `?dsh-splash-min=<ms>`.
- Reduced-motion shortens the intro and disables the decorative animation.
- Smoke test now mounts the theme dock, checks all ten palettes / three intro
  lengths, and verifies the preview splash lifecycle.

## 0.1.0 — 2026-11-04

- Initial release.
- Page-level startup splash with a `shell.overlay` seat and a pre-mount
  `document.body` surface adopted into it.
- Penrose triangle rotation and three-face light sweep (24s), isometric diamond
  ocean with a double-sine wave, DPR and resize handling.
- Progress bar driven by real milestones: page load, client plugin graph
  (`ctx.loader.entries()`), Host connection (`ctx.connection.state`), workspace
  and session baselines (`phase === 'ready'`), and first paint + fonts.
- 2s minimum display after completion, 640ms fade-out, and a 20s failure cap.
- `engines.dsh: >=0.2.1-rc.5 <0.3.0`.
- Brand icon at `assets/icon-512.png` (cream circle + Penrose, matching the splash palette).
- Node DOM smoke test covering cold-boot detection, monotonic progress,
  `shell.overlay` adoption, fade-out, and cleanup.
