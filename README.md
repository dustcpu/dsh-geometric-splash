# dsh-splash

A DSH startup splash: a Penrose triangle light-sweep over a living isometric diamond ocean, a progress bar driven by **real boot milestones**, and a fade-out when startup completes.

Visual harness: `preview/preview.html?mode=static` (runs the real client bundle against fake services; open it in a browser).

## What is preserved

- 24s Penrose rotation; the three faces cycle through `#f1a2aa → #8f5f94 → #d4869b` over the same 24s.
- The circle holds an isometric diamond ocean: a double-sine wave displaces the point grid; each diamond mixes the pale/pink palette by its average height and is stroked in brand purple.
- 1.6s circle emerge, 1.2s-delayed brand fade-in, same curves as the prototype.
- 640ms fade-out after completion, then canvas, styles, timers, and listeners are released.

## Real progress, not a timer

Five weighted milestones sum to 100:

| Phase | Weight | Source |
|---|---|---|
| Page load | 5 | `document.readyState === 'complete'` |
| Client plugin graph | 50 | `ctx.get('modules').manifest.plugins.length` + fiber states from `ctx.loader.entries()` |
| Host connection | 17 | `ctx.get('connection').state` (`connecting → connected`) |
| Workspace / session baseline | 18 | `phase === 'ready'` on `ctx.get('workspaces').list` and `ctx.get('sessions').list` |
| First paint + fonts | 10 | two post-mount rAFs + `document.fonts.ready` (800ms cap) |

Only the *displayed* value eases toward the target (`1 - e^(-dt/110)`); the target itself is never timer-driven. Stage copy shows real counts such as `Loading plugins 37/94`.

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
| `?dsh-splash-min=800` | Minimum visible time in ms (default 2000) |
| `window.__DSH_SPLASH__ = { minVisibleMs, force, disabled, debug }` | Programmatic form |

`minVisibleMs` only holds a completed splash; it never fabricates progress. A real startup that takes longer fades as soon as it is actually complete.

## Known boundaries

- The splash is page-level. There is no injectable moment between native window creation and page scripts; that gap remains owned by the desktop shell.
- `shell.overlay` exists only after mount, hence the two-stage body → seat adoption. If the seat disappears during a layout reload, the node is returned to `body` rather than lost.
- A startup failure is covered for at most 20s, then the splash fades so the error page is reachable. The bar never fakes 100%.
- Missing `ctx.loader`, `connection`, `workspaces`, or `sessions` capabilities are skipped after a short grace period instead of hanging the splash.

## License

MIT
