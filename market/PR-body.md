Adds `dsh-splash`, a page-level startup splash for DSH.

- Repository: https://github.com/dustcpu/dsh-geometric-splash
- Category: `ui`
- Manifest: `dsh.bundle` + `dsh.client`, root `cordis.patch.yml`
- Entry file: `data/plugins/dustcpu__dsh-geometric-splash.yml` (this PR adds only that file)
- Icon: `assets/icon-512.png` (GitHub-hosted)
- Tests: `node test/dom-smoke.mjs`; the repository also runs it in
  `.github/workflows/smoke.yml`

The progress bar is paced by the intro timeline but **capped by real boot
milestones** (client plugin graph via `ctx.loader.entries()`, Host connection
state, workspace/session baselines, and first paint); it can move slower than
reality, never faster, and only reaches 100 when both the intro and startup
finish. A **Real** mode keeps the raw milestone bar. It covers the boot page,
adopts the same DOM node into `shell.overlay` when the frame mounts, and then
plays a **7.2s skippable intro** (3.8s / 10s options) before fading into the app.
A theme dock floats above the splash at the top-right and offers ten palettes
derived from Monument Valley and Geometric Islands, live palette/pacing changes,
local preview, and `localStorage` persistence.
