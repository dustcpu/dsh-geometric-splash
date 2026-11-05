# dsh-splash

[简体中文](README.md) | **English**

<p align="center"><img src="assets/icon-512.png" width="128" alt="dsh-splash icon"></p>

A DSH startup splash: a Penrose triangle light-sweep over a living isometric diamond ocean. The frame itself is the progress gauge, driven by **real boot milestones**; the 7.2s intro can be dismissed with any key, and ten palettes ship with it. When the intro ends the triangle does not disappear - it shrinks to a small resident mark beside the composer and reports what the agent is doing.

Visual harness: `preview/preview.html?mode=static` (runs the real client bundle against fake services; open it in a browser).

## Intro and themes

- **No progress bar, no buttons.** The frame is the gauge: width, height and radius grow from 380px to the full window as progress climbs, and the percentage is a large numeral inside its bottom edge.
- The default **7.2s** is a fixed minimum timeline, not a timer-driven boot bar; the theme dock has a 1-12s slider. **Any bare key** dismisses the splash (modifier-only presses do not, and `F5` / `Ctrl+R` stay usable, so a reload never eats the intro).
- The theme entry lives in the **conversation header utilities** (the app's top navigation bar, next to the folder / more / panel buttons) as a rotating Penrose icon; hover highlights it and leaves the spin rate alone (changing it would snap the angle). The panel floats above the splash: ten palettes derived from Monument Valley and Geometric Islands, the intro slider, a once-a-day switch, a resident-mark switch, a preview action, and `localStorage` persistence. Nothing closes the panel.
- Palettes drive the background, frame, text, ocean tiles/grid, and the three Penrose faces; dark palettes also flip text/border contrast.
- Progress is cinematic only - the panel no longer offers a Real mode, since any key skips the intro anyway. It follows the intro timeline (ease-out) but is clamped by real readiness: it can be slower than reality, never faster, and only reaches 100 when both the intro and startup finish.

## The resident mark

When the intro reaches 100% the sheet clears and the triangle flies to the left edge of the composer, where it stays as a small mark.

- It reads DSH's own `data-streaming` / `data-process-activity` attributes, so it never scrapes rendered text and works in any UI language.
- Five states: `idle`, `thinking`, `search`, `act`, `edit` - one constant 18s spin with no drift, and each state differs **only in colour**, never in pace. Working states use fixed cool / cyan / amber / violet tones so they stay distinguishable on any palette; idle keeps the palette's own colours.
- Spin speed is multiplied by the reasoning effort read off the model trigger (`Off / Low / High / Max`, 0.5x to 1.7x, i.e. 36s to 10.6s per revolution) - the one pace change the user asked for, so it is the only one left.
- Rotation is accumulated frame by frame rather than run as a CSS animation: changing `animation-duration` mid-flight makes the angle jump, which reads as a stutter.
- Hidden when the viewport is narrow, the left gutter is too small, or a settings page replaces the composer.

## What is preserved

- 18s Penrose rotation; the three faces cycle through the palette's light/mid/dark colours over the same 18s.
- The frame holds an isometric diamond ocean: a double-sine wave displaces the point grid; each diamond mixes the palette's low/high colours by its average height and is stroked in the grid colour.
- The frame emerges over the intro's first ~1.6s and grows with the progress.
- After 100% the sheet dissolves and the mark flies to its corner; canvas, styles, timers and listeners are released.

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
- A startup failure is covered for at most 20s, then the splash fades so the error page is reachable. Progress never fakes 100%.
- The 7.2s intro is a default, not a lock: the theme dock offers a 1-12s slider, and any bare key exits immediately. Theme settings live in this page origin's `localStorage`; they do not sync across devices.
- Everything is drawn in code (canvas + SVG) — no image or video assets, so the package stays small and scales to any resolution.
- Missing `ctx.loader`, `connection`, `workspaces`, or `sessions` capabilities are skipped after a short grace period instead of hanging the splash.

## License

MIT
