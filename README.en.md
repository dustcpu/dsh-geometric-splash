# dsh-splash

A DSH startup splash: a Penrose triangle light-sweep over a living isometric diamond ocean. **The frame itself is the progress gauge**, driven by real boot milestones. The intro runs 7.2s and any key dismisses it. When it ends the triangle does not disappear — it shrinks to a small resident mark beside the composer, reporting what the agent is doing.

## At a glance

- **No progress bar, no buttons.** The frame is the gauge: width, height and radius grow from 380px to the full window as progress climbs, and the percentage is a large numeral inside its bottom edge.
- **The progress is real.** Five weighted milestones drive it (plugin graph load, Host connection, workspace readiness, first paint and fonts), summing to 100. The cinematic pacing only makes it move smoothly along the timeline — it can never run ahead of real readiness.
- **Any key skips it.** `F5` / `Ctrl+R` stay usable, so a reload never eats the intro.
- **The ending:** on 100% it holds for a beat, then the triangle flies to the left edge of the composer and shrinks into the resident mark.
- **The resident mark** turns at a constant rate across six working states — thinking, waiting, reading, searching, acting and editing — and **always keeps the selected theme colour**; changing state no longer recolours the triangle. Its speed follows the reasoning effort (`Off / Low / High / Max`).
- **State cues:** a white/bright highlight travels on the triangle's edges (thinking/act loop, search lights one edge at a time, waiting breathes the whole outline); edit flips the triangle over. State changes sparkle a few small stars around it instead of emitting particles. The three faces also alternate light/dark with angle, matching the original page's fixed-upper-left lighting.
- **Ten palettes**, derived from Monument Valley and Geometric Islands, live in the theme dock behind a small Penrose icon in the conversation header.

## Install

**DSH Desktop**: open the **Plugins** page, find dsh-splash in the plugin market and click install.

**Command line** (DSH Web, or when you know your profile name):

```sh
dsh plugin --profile <your profile name> add dsh-splash
```

> ⚠️ Desktop manages its own profile. A wrong profile name on the command line installs into a profile the desktop app never reads, so the plugin will not appear there. On Desktop, use the market install above.
>
> ⚠️ DSH gives profiles pnpm's **release-age wait** (`minimumReleaseAge`), so a freshly published version can be held back and `add dsh-splash` may pick an older one. Name the version to get the latest: `add dsh-splash@0.2.5` — pnpm then adds it to the profile's `minimumReleaseAgeExclude` automatically.

**Local development build** (link):

```powershell
dsh plugin --profile desktop add "link:C:\path\to\dsh-splash"
```

> A link install needs one loader row appended to the profile's `cordis.patch.yml`; a market / bundle install applies that automatically.
>
> ```yaml
> - id: dsh-splash
>   name: dsh-splash
> ```

Reload the page (Ctrl+R) and the splash appears.

## Configuration

Day-to-day settings live in the theme dock (the Penrose icon in the conversation header): switch palettes, adjust the intro length (1-12s), toggle the resident mark. Settings are kept in this page origin's `localStorage`; they never touch the host config and do not sync across devices.

Query parameters for development and troubleshooting:

- `?dsh-splash=off` — do not show this load
- `?dsh-splash=force` — show even when the page is already mounted
- `?dsh-splash-min=3800` — intro minimum in ms (default 7200)
- `?dsh-splash-palette=island-night` — force a palette for this load
- `?dsh-splash-progress=real` — use raw real progress (debug only)

## Known boundaries

- The splash is page-level. There is no injectable moment between native window creation and page scripts; that gap remains owned by the desktop shell.
- A startup failure is covered for at most 20s, then the splash fades so the error page is reachable. Progress never fakes 100%.
- Everything is drawn in code (canvas + SVG) — no image or video assets, so the package stays small and scales to any resolution.

## More

- How the real progress is computed, milestone weights, the development workflow and the full debugging switches → [README.developer.md](README.developer.md)
- Publishing to the plugin market → [PUBLISHING.zh.md](PUBLISHING.zh.md)
- Changelog → [CHANGELOG.md](CHANGELOG.md)

## License

MIT
