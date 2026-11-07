# Changelog

## 0.2.5 — 2026-11-07

- **The resident mark now reports seven states.** `questions` gets its own
  `waiting` state, and `read` / `readImage` get a `read` state instead of being
  folded into search. The activity comes from the live process group's
  `data-shimmer` title, so a running read/write/command no longer falls back to
  idle just because no text is streaming; closed historical groups are ignored.
- **State no longer recolours the triangle.** Every state keeps the selected
  palette. State is carried by a white highlight layer on the geometry instead:
  a short segment loops the perimeter for thinking and quickly for acting,
  search lights one whole edge at a time, waiting breathes the full outline,
  and reading pulses the right edge.
- **The faces light the way the website avatar does.** A fixed upper-left light
  runs each arm through the original `lit1/2/3` phase table as the mark turns,
  so the bright and dark faces actually alternate. It is computed from the same
  angle as the rotation, so reasoning-effort changes do not desynchronise the
  light.
- **The triangle flips for editing** instead of flashing a vertex: the whole SVG
  turns 180° over 720ms and holds until the state ends. The outline is thinner
  (2.4 instead of 6), closer to the site avatar.
- **State changes sparkle, they do not spray.** A change lights 8–10 small
  stars in the area around the mark for about 0.8s; there is no particle burst,
  no movement, and no sparkle at idle.
- **A stale HMR mark is removed** before a new one is mounted, so two triangles
  can no longer overlap after the client plugin reloads.
- **Four palettes were refreshed** and three names changed: `island-amber` is now
  「落日熔金」 / Molten Sunset, `island-night` is 「白露未晞」 / Dew Before Dawn,
  `warm-gold` is 「荷塘晓色」 / Lotus Dawn. IDs are unchanged, so saved choices
  survive. The 0.2.4 README split and install rewrite are included in this
  release because 0.2.4 was committed but never published.

## 0.2.4 — 2026-11-06

- **The palette picker is a wall of colour cards, not a ten-row list.** Every
  palette shows four stops — the background, then the triangle's three faces
  from dark to light — so the choice can be made by looking instead of reading.
  Names surface on hover and stay on the selected card; the list cost ten rows
  of height, the 2x5 grid costs five.
- **The dock now says whether a newer version exists.** It asks the market's
  public update API (v1) what is installed and whether anything newer is
  published, and offers the update when there is one. Nothing is invented when
  the market is not there: the row hides itself, a linked checkout is reported
  as a local build rather than "up to date" because there is nothing to compare
  it against, and a host-managed install is labelled as such instead of
  pretending a button would stick.
- **The plugin speaks Chinese in the plugin manager.** `locale/zh.json` and
  `locale/en.json` carry the title and description the manager reads without
  activating the plugin; the Chinese line is 「不可能三角开屏动画，让每一次启动
  充满仪式感」.
- **The exit is one motion instead of two.** The triangle's flight to the
  composer and the fade of the full-screen sheet now start on the same frame
  and run for the same 900ms. Before, the sheet finished first and the last
  thing on screen was a fully opaque surface, so removing the node read as a
  cut. What fades is the painting, not the surface: background colour, frame
  colour, the sea and the glow, while the triangle stays fully opaque above
  them — fading the root instead would have dissolved the thing that is meant
  to be flying.
- **The plugin page no longer reads like a wall of text.** DSH renders
  `README.md` verbatim into the plugin page, and the file used to carry all
  6170 characters of it — prose, development notes and milestone tables — to
  anyone who only wanted to know what the plugin does. The README now holds
  the intro, the effects at a glance, installation, configuration and the
  known boundaries (1585 characters); everything else moved to
  `README.developer.md`, which the README links to. The English pair mirrors
  the split.
- **Two things that were buttons on GitHub but read as plain text in the app
  are gone.** The `**简体中文** | [English]` switch pointed nowhere in DSH —
  it only ever reads `README.md`, whose pattern (`/^readme(?:\.md|\.markdown)?$/i`)
  never matches `README.en.md`, and there is no locale picker. The centred
  `<p align="center"><img>` icon was ignored by the layout engine and sat hard
  left, duplicating the icon the page already shows.
- **The parameter tables are lists now.** GFM tables render, but those columns
  were wide enough to squeeze in the plugin page's narrow container.
- **The install section says what actually works.** DSH manages the desktop
  profile itself, so a command-line install can land in a profile the desktop
  app never reads. It also gives profiles pnpm's release-age wait, so a fresh
  version can be held back — naming the version gets the latest one and pnpm
  then allows it automatically.

## 0.2.3 — 2026-11-05

- **Fixed: the mark no longer follows settings pages.** The composer lookup
  used to fall back to any `<textarea>`, and the plugin settings page has one
  (the env-var box) — the mark parked itself beside that panel and rode along
  with its scroll. Only the rich-text editor qualifies as an anchor now, and
  a card that has left the viewport hides the mark entirely.
- **Fixed: the mark no longer slides when the composer grows.** Pasting a
  screenshot or wrapping a long line grows the card upward, so its vertical
  centre climbs. The mark is anchored to the bottom edge instead — the one
  line that does not move — and only falls back to centring on cards shorter
  than the mark itself.

## 0.2.2 — 2026-11-05

- **The resident mark reports state by colour alone.** Speed is now one constant
  18s rev for every state, and the vertical drift is gone entirely: a mark that
  changes pace while you are not touching it reads as struggling rather than
  working. The five states still differ, but only in their three-tone palette.
- **Reasoning effort has a much wider spread**: `Off` 0.5x / `Low` 0.72x /
  `High` 1x / `Max` 1.7x, i.e. 36s to 10.6s per revolution instead of 29s-12s.
- **The handover is seamless.** The mark inherits the splash's exact rotation
  angle at landing (read from the animated matrix), so the triangle no longer
  rewinds to 0 degrees the moment it arrives.
- **The flight re-aims every frame**, and each frame is measured back and
  corrected, so the triangle lands exactly where the mark sits instead of
  snapping a few pixels at handover.
- **The mark disappears within a frame when the composer unmounts** (settings
  and plugin pages), instead of hovering over the new page for up to 400ms.
- **The theme-header icon keeps a constant rate** (14s) and only brightens on
  hover; shortening `animation-duration` there had the same angle-snap problem.
- **Removed the Cinematic / Real pacing control.** Any bare key skips the intro,
  so a manual "Real" mode had no audience; cinematic is fixed. The
  `?dsh-splash-progress=real` query parameter remains for debugging.
- **Palette names are final**: 丁香之绽 / 碧空如洗 / 芽头新绿 / 风起黄昏 /
  薰衣旧梦 / 夜生白露 / 紫金一瞬 / 青绿山水 / 陶土记忆 / 月下幽紫, with English
  equivalents. Palette ids are unchanged, so saved choices survive.

## 0.2.1 — 2026-11-05

- **The frame is the progress gauge.** Removed the progress bar and the two
  splash buttons; the percentage is now a large numeral inside the frame's
  bottom edge, scaling with its width. The frame grows from a 380px porthole to
  the full window as progress climbs (`(p/100)^1.7`), so 100% leaves nothing but
  the mark and the sea.
- **Skip is keyboard-only**: any bare key. Modifier chords (`Ctrl+R`, `Ctrl+K`,
  `Ctrl+Shift+I`) and `F1`-`F12` are ignored so the app stays usable, while a
  plain key still exits — a stuck splash can never trap the user.
- **The triangle no longer scales** with the frame, and spins at 18s instead of
  24s.
- **Intro length is a 1-12s slider** instead of three presets. The theme panel
  also gained a **full intro once a day** switch: the first launch of the day
  plays the full ceremony, later launches the same day are capped at 2.2s.
- **New resident mark.** When the intro ends the triangle flies to the left edge
  of the composer and stays there as a small status mark. It reads DSH's own
  `data-streaming` / `data-process-activity` attributes — no text scraping, so it
  works in any UI language — and folds fifteen activities into five states
  (idle / thinking / search / act / edit), each with its own spin speed and
  three-tone palette. Spin speed is multiplied by the reasoning effort read from
  the model trigger (`Off` / `Low` / `High` / `Max`). Rotation is accumulated
  frame by frame rather than driven by a CSS animation, so changing speed never
  snaps the angle back.
- **New icon**: a transparent 512x512 RGBA Penrose triangle instead of the old
  "splash page thumbnail", so it sits properly beside DSH's dark plugin icons.
- Settings gained `dailyOnce` and `mark`; both are exposed in the theme panel.
- README is Chinese by default; the English version lives in `README.en.md`.

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
