# dsh-splash

<p align="center"><img src="assets/icon-512.png" width="128" alt="dsh-splash icon"></p>

A DSH startup splash: a Penrose triangle light-sweep over a living isometric diamond ocean, a progress bar driven by **real boot milestones**, a 7.2s skippable intro, and a theme dock with ten palettes.

Visual harness: `preview/preview.html?mode=static` (runs the real client bundle against fake services; open it in a browser).

## Intro and themes

- The default **7.2s** is a fixed minimum timeline, not a timer-driven boot bar: choose 3.8s / 7.2s / 10s in the theme dock, or exit early with the **Skip** button / Esc.
- The theme entry lives in the **conversation header utilities** (the app's top navigation bar, next to the folder / more / panel buttons) as a rotating Penrose icon; hover highlights it and speeds up the spin. During the splash a **Theme** button also appears at the bottom-left. The panel floats above the splash: ten palettes derived from Monument Valley (`E:\mv-refs\palette.json`) and Geometric Islands (`E:\web\Geometric Islands\style.css`), **Short / Standard / Long** intro length (no seconds shown), **Cinematic / Real** progress pacing, a preview action, and `localStorage` persistence. Palette/pacing changes and preview no longer close the panel; intro length applies to the next launch.
- Palettes drive the background, frame, progress bar, text, ocean tiles/grid, and the three Penrose faces; dark palettes also flip text/border contrast.
- Cinematic progress follows the intro timeline (ease-out) but is clamped by real readiness: it can be slower than reality, never faster, and only reaches 100 when both the intro and startup finish.

## What is preserved

- 24s Penrose rotation; the three faces cycle through the palette's light/mid/dark colours over the same 24s.
- The circle holds an isometric diamond ocean: a double-sine wave displaces the point grid; each diamond mixes the palette's low/high colours by its average height and is stroked in the grid colour.
- The circle emerges over the intro's first ~1.6s and slowly zooms; the brand fades in at 1.5s.
- 640ms fade-out after the intro/startup, then canvas, styles, timers, and listeners are released.

## Real progress, not a timer

Five weighted milestones sum to 100:

| Phase | Weight | Source |
|---|---|---|
| Page load | 5 | `document.readyState === 'complete'` |
| Client plugin graph | 50 | `ctx.get('modules').manifest.plugins.length` + fiber states from `ctx.loader.entries()` |
| Host connection | 17 | `ctx.get('connection').state` (`connecting → connected`) |
| Workspace / session baseline | 18 | `phase === 'ready'` on `ctx.get('workspaces').list` and `ctx.get('sessions').list` |
| First paint + fonts | 10 | two post-mount rAFs + `document.fonts.ready` (800ms cap) |

Only the *displayed* value eases toward the target (`1 - e^(-dt/110)`). In the default **cinematic** mode the target is `min(real readiness, timeline)`; the timeline only makes the bar slower and can never pass real readiness. The **Real** mode uses the raw target. Stage copy shows real counts such as `Loading plugins 37/94`; when the app is ready but the intro timeline is still running, the stage reads "Entering".

`shell.overlay` only exists after the React app mounts. The plugin therefore paints its own DOM on `document.body` during `apply` (covering the kernel's "Loading plugins…" page), then re-parents that exact node into the `shell.overlay` seat when the frame mounts. One DOM tree, no flash, and the plugin-loading half of boot is still visible.

## Install into a local profile

The package is an ordinary DSH client plugin: the host half is an empty Cordis plugin, and `dsh.client` tells `dsh-client-modules` to serve `lib/client.js` as the browser bundle. `dsh.bundle.patch` also lets it install as a bundle.

### Local link

```powershell
dsh plugin --profile desktop add "link:C:\path\to\dsh-splash"
```

Then append a loader row to the profile's `cordis.patch.yml`:

```yaml
- id: dsh-splash
  name: dsh-splash
```

DSH HMR watches the profile patch and recomposes; the browser receives the new module graph over `/plugins/events`. Reload the page (Ctrl+R) to see the splash.

### Published

```powershell
dsh plugin --profile desktop add dsh-splash
```

As of 2026-11-04, npm `latest` is **0.1.0**; the 0.2.0 long-intro/theme-dock work is currently the local `link:` dev build. Publishing 0.2.0 makes this command pick it up.

Installing through the DSH plugin market applies the package's `cordis.patch.yml`, so no manual row is needed.

### Rollback

Remove the `dsh-splash` row from `cordis.patch.yml`, then:

```powershell
dsh plugin --profile desktop remove dsh-splash
```

## Development

```
dsh-splash/
  package.json          # dsh.client / dsh.bundle declarations
  cordis.patch.yml      # loader row inserted by a bundle install
  lib/index.js          # host half: empty plugin, just an entry for the Loader
  lib/client.js         # browser half: __ModuleLoader__ factory bundle
  preview/preview.html  # real bundle + fake React/services visual harness
  test/dom-smoke.mjs    # Node DOM smoke test (progress, adopt, fade)
```

Rules that matter:

1. **The host half must exist.** `dsh-client-modules` scans enabled Loader entries; without a row there is no browser bundle. An empty `apply()` suffices.
2. **The client entry is `exports["./client"]`** and must be a `window.__ModuleLoader__.load({ id, factory })` bundle. `factory(require)` may require only platform baseline modules (`react`, `react/jsx-runtime`, `@deepseek-ai/dsh-client-ui-primitives`, …). Non-baseline requests belong in `dsh.client.external`.
3. **Register into `shell.overlay`**, never `root`. It is a root-scoped list slot: additive, click-through by default, and the entry opts into pointer events.
4. **After editing `lib/client.js`**, HMR reloads the plugin by file revision; reload the page if it does not. During development use `?dsh-splash=force` on an already-mounted page or `?dsh-splash=off` to disable.
5. **Test**:

```powershell
node test/dom-smoke.mjs
```

This executes the real `lib/client.js` under a Node DOM shim and verifies cold-boot detection, real loader counts, monotonic progress, `shell.overlay` adoption, fade-out, and cleanup.

## Configuration

Development-only switches:

| Entry | Effect |
|---|---|
| `?dsh-splash=off` | Do not show this load |
| `?dsh-splash=force` | Show even when the page is already mounted |
| `?dsh-splash-min=3800` | Intro minimum in ms (default 7200) |
| `?dsh-splash-palette=island-night` | Force a palette for this load |
| `?dsh-splash-progress=real` | Use raw real progress (default `cinematic`) |
| `window.__DSH_SPLASH__ = { minVisibleMs, palette, progress, force, disabled, debug }` | Programmatic form |

`minVisibleMs` is the intro timeline; it never fabricates progress.

## Known boundaries

- The splash is page-level. There is no injectable moment between native window creation and page scripts; that gap remains owned by the desktop shell.
- `shell.overlay` exists only after mount, hence the two-stage body → seat adoption. If the seat disappears during a layout reload, the node is returned to `body` rather than lost.
- A startup failure is covered for at most 20s, then the splash fades so the error page is reachable. The bar never fakes 100%.
- The 7.2s intro is a default, not a lock: the theme dock offers 3.8s / 7.2s / 10s, and the Skip button / Esc exits immediately. Theme settings live in this page origin's `localStorage`; they do not sync across devices.
- The animation is code-drawn, not a video. A 15–18s video-style intro would need an optional video asset or a native launcher window; that is a separate step.
- Missing `ctx.loader`, `connection`, `workspaces`, or `sessions` capabilities are skipped after a short grace period instead of hanging the splash.

## License

MIT
