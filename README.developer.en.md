# dsh-splash · Technical details

For contributors and troubleshooting. The user-facing guide is in [README.md](README.md); the publishing flow is in [PUBLISHING.zh.md](PUBLISHING.zh.md).

## Real progress, not a timer

Progress has a single rhythm (cinematic); the theme dock no longer offers a switch, since any key skips the intro anyway:

- **Cinematic**: the target is `min(real readiness, timeline)`. The timeline advances with an ease-out over the intro length, so progress keeps moving — but it can only be slower than reality, never faster. It reaches 100 only when startup has finished *and* the timeline has run out. When the app is ready but the timeline is still running, the stage reads "Entering" rather than stalling early at 100%.
- **Real**: the target is the raw readiness. When startup is fast this reaches 100 quickly, which is what you want for troubleshooting or for seeing the original numbers.

Real readiness is five weighted milestones summing to 100:

- **Page load** (weight 5): `document.readyState === 'complete'`
- **Client plugin graph** (weight 50): `ctx.get('modules').manifest.plugins.length` plus the fiber states from `ctx.loader.entries()`
- **Host connection** (weight 17): `ctx.get('connection').state` (`connecting → connected`)
- **Workspace / session baseline** (weight 18): `phase === 'ready'` on `ctx.get('workspaces').list` and `ctx.get('sessions').list`
- **First paint + fonts** (weight 10): two post-mount rAFs plus `document.fonts.ready` (800ms cap)

Only the *displayed* value eases toward the target (`1 - e^(-dt/110)`). Stage copy shows real counts such as `Loading plugins 37/94`.

**The intro length and the progress are two different things**: 7.2s is a fixed "at least this long" timeline. When startup is fast the progress rides the timeline to the end; when startup is slow it waits on real readiness instead. Any key ends it early.

Because `shell.overlay` only exists after the React app mounts, the plugin paints its own DOM on `document.body` during `apply` (covering the kernel's "Loading plugins…" page), then re-parents that exact node into the `shell.overlay` seat when the frame mounts. One DOM tree, no flash, and the plugin-loading half of boot is still visible.

## Rendering details

- The Penrose triangle rotates in place once every 18s, its three faces cycling through the palette's light/mid/dark colours over the same 18s. The ocean is a double-sine wave displacing an isometric diamond grid; each diamond mixes the palette's low/high colours by its average height and is stroked in the grid colour.
- The frame emerges over the intro's first ~1.6s and grows with the progress.
- On 100% the sheet dissolves and the triangle flies to the composer's left edge; canvas, styles, timers and listeners are all released.
- The resident mark turns at a constant rate (18s per revolution, no drift), reads DSH's own `data-process-activity` attribute, and switches **colour only, never pace**, across four working states — changing the pace would read as struggling. Its speed follows the reasoning effort alone, and the four steps are far apart (`Off 0.5x / Low 0.72x / High 1x / Max 1.7x`, i.e. 36s down to 10.6s per revolution). It hides itself when the viewport is narrow, the left gutter is too small, or a settings page replaces the composer.
- The theme entry is the small Penrose icon in the conversation header's utilities (next to the folder / more / panel buttons); hovering highlights it but leaves the spin rate alone — changing it would snap the angle. The panel offers ten palettes, an intro-length slider, a once-a-day switch, a resident-mark switch and a preview; nothing closes it, and it is still open after a preview finishes. Palette changes apply live while the splash is on screen; the intro length takes effect on the next splash.
- Palettes drive the background, frame, text, ocean tiles/grid and the three Penrose faces; dark palettes also flip text/border contrast. The resident mark keeps the palette's own triangle colours while idle, and switches to four fixed working colours (cool steel blue / cyan / amber / violet) once the agent works, so the states stay distinguishable on any palette. Settings live in `localStorage` (`dsh-splash:settings`) — they never touch the host config and do not sync across devices.
- Rotation is accumulated frame by frame rather than run as a CSS animation: changing `animation-duration` mid-flight makes the angle jump, which reads as a stutter.

## The theme dock

The entry lives in the conversation header's utilities (next to the folder / more / panel buttons) as a small Penrose icon. Hovering highlights it, but the spin rate stays put — changing it would snap the angle.

The panel offers ten palettes, an intro-length slider (1-12s), a once-a-day switch, a resident-mark switch and a local preview. Nothing closes the panel; it is still open after a preview finishes.

Palette changes apply live while the splash is on screen; the intro length takes effect on the next splash. Settings live in `localStorage` (`dsh-splash:settings`) — they never touch the host config and do not sync across devices.

Where the palettes come from:

- **Monument Valley** (`E:\mv-refs\palette.json`): 丁香之绽 (default), 紫金一瞬, 青绿山水, 陶土记忆, 月下幽紫.
- **Geometric Islands** (`E:\web\Geometric Islands\style.css`): 碧空如洗, 芽头新绿, 风起黄昏, 薰衣旧梦, 夜生白露.

## Development workflow

Source layout:

```
dsh-splash/
  package.json          # dsh.client / dsh.bundle declarations
  cordis.patch.yml      # loader row inserted by a bundle install
  lib/index.js          # host half: empty plugin, just an entry for the Loader
  lib/client.js         # browser half: __ModuleLoader__ factory bundle
  preview/preview.html  # real bundle + fake React/services visual harness
  test/dom-smoke.mjs    # Node DOM smoke test
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

This executes the real `lib/client.js` under a Node DOM shim and verifies cold-boot detection, real loader counts, monotonic progress, `shell.overlay` adoption, fade-out and cleanup, the theme dock (ten palettes, the length slider, both switches, the preview lifecycle), and the resident mark's five states with their reasoning-effort multipliers. `preview/preview.html?mode=static` is a pure front-end visual harness (real bundle + fake services); open it in a browser.

## Debugging switches

The product exposes no switches; these exist for development and troubleshooting:

- `?dsh-splash=off` — do not show this load
- `?dsh-splash=force` — show even when the page is already mounted
- `?dsh-splash-min=3800` — intro minimum in ms (default 7200)
- `?dsh-splash-palette=island-night` — force a palette for this load
- `?dsh-splash-progress=real` — use raw real progress (default `cinematic`)
- `window.__DSH_SPLASH__ = { minVisibleMs, palette, progress, force, disabled, debug }` — programmatic form

`minVisibleMs` is the intro timeline; it never fabricates progress. Normal users change the settings through the theme icon in the top navigation bar and never need to hand-write a query.

## Known boundaries

- The splash is page-level. There is no injectable moment between native window creation and page scripts; that gap remains owned by the desktop shell.
- `shell.overlay` exists only after mount, hence the two-stage body → seat adoption. If the seat disappears during a layout reload, the node is returned to `body` rather than lost.
- A startup failure is covered for at most 20s, then the splash fades so the error page is reachable. Progress never fakes 100%.
- Missing `ctx.loader`, `connection`, `workspaces`, or `sessions` capabilities are skipped after a short grace period instead of hanging the splash.
- The 7.2s intro is a default, not a lock: the theme dock offers a 1-12s slider, and any bare key exits immediately. Theme settings live in this page origin's `localStorage`; they do not sync across devices.
- Everything is drawn in code (canvas + SVG) — no image or video assets, so the package stays small and scales to any resolution.

## How the resident mark finds its anchor

The mark anchors to the composer's **bottom edge**, not its vertical centre: the card grows upward when a screenshot is attached or a line wraps, so its bottom stays put while its centre climbs. Centring made the mark slide up on every paste.

Two more rules:

- Only `[contenteditable="true"]` qualifies as the composer. **Do not fall back to `<textarea>`** — the plugin settings page's env-var box is a `<textarea>`, and the fallback would park the mark beside that panel and ride along with its scroll.
- The mark hides the moment its card leaves the viewport entirely.

A link install also writes the profile's `package.json` and `pnpm-lock.yaml`. DSH's HMR watches the profile patch and recomposes; the browser receives the new module graph over `/plugins/events`. Reload the page (Ctrl+R) to see the splash.

## Rollback

Remove the `dsh-splash` row from the profile's `cordis.patch.yml`, then:

```powershell
dsh plugin --profile desktop remove dsh-splash
```
