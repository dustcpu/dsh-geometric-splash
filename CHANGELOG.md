# Changelog

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
