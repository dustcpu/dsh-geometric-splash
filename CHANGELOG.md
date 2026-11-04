# Changelog

## 0.2.0 — 2026-11-04

- Cinematic intro timeline: 7.2s default, 3.8s / 10s choices, with a visible
  **Skip** button and Esc to exit early.
- Progress pacing: **Cinematic** (default) follows the intro timeline but is
  clamped by real readiness, so the bar keeps moving yet only reaches 100 when
  startup actually completes; **Real** mode keeps the raw milestone bar. The
  "Entering" stage covers the gap between app-ready and intro-end.
- Theme entry in `conversation.session.header.utilities`: a rotating Penrose
  icon in the conversation header (hover highlights it and speeds up the spin;
  no overlay over the sidebar avatar), plus a **Theme** button during the splash.
  Ten palettes derived from `E:\mv-refs\palette.json` (swamp, warm gold, teal,
  sunset, dark room) and `E:\web\Geometric Islands\style.css` (blue, green,
  amber, purple, night). Palette and pacing changes apply live during the intro.
- Theme panel stays open after palette, duration, progress-mode, reset, and
  preview actions; preview temporarily hides the panel and restores it. Intro
  buttons read **短 / 标准 / 长** (no seconds), and the progress labels are
  localized instead of raw locale keys.
- Palette-aware ocean canvas and Penrose light sweep; stronger ocean grid
  contrast.
- Settings persisted in `localStorage` (`dsh-splash:settings`), with a live
  **Preview splash** action that does not require a restart.
- New dev overrides: `?dsh-splash-palette=<id>`, `?dsh-splash-min=<ms>`, and
  `?dsh-splash-progress=real`.
- Reduced-motion shortens the intro and disables the decorative animation.
- Smoke test now mounts the theme dock, checks all ten palettes / three intro
  lengths / two progress modes, switches palette live, and verifies the preview
  splash lifecycle.

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
