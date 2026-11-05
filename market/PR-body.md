Adds `dsh-splash`, a page-level startup splash for DSH.

- Repository: https://github.com/dustcpu/dsh-geometric-splash
- Category: `ui`
- Manifest: `dsh.bundle` + `dsh.client`, root `cordis.patch.yml`
- Entry file: `data/plugins/dustcpu__dsh-geometric-splash.yml` (this PR adds only that file)
- Icon: `assets/icon-512.png` (GitHub-hosted)
- Tests: `node test/dom-smoke.mjs`; the repository also runs it in
  `.github/workflows/smoke.yml`

The splash covers the boot page, adopts the same DOM node into `shell.overlay`
when the frame mounts, and then plays an intro whose **frame is the progress
gauge**: it grows from a 380px porthole to the full window as the percentage
climbs. That number is paced by the intro timeline but **capped by real boot
milestones** (client plugin graph via `ctx.loader.entries()`, Host connection
state, workspace/session baselines, and first paint) - it can move slower than
reality, never faster, and only reaches 100 when both the intro and startup
finish. A **Real** mode keeps the raw milestone reading. The intro length is a
1-12s slider, and any bare key skips it.

When the intro ends the triangle does not disappear: it flies to the left edge
of the composer and stays as a small status mark, driven by DSH's own
`data-streaming` / `data-process-activity` attributes (five states, plus a spin
speed tied to the reasoning effort). A theme entry in the conversation header
utilities offers ten palettes derived from Monument Valley and Geometric
Islands, live palette/pacing changes, local preview, and `localStorage`
persistence.
