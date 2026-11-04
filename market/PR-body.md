Adds `dsh-splash`, a page-level startup splash for DSH.

- Repository: https://github.com/dustcpu/dsh-geometric-splash
- Category: `ui`
- Manifest: `dsh.bundle` + `dsh.client`, root `cordis.patch.yml`
- Entry file: `data/plugins/dustcpu__dsh-geometric-splash.yml` (this PR adds only that file)
- Icon: `assets/icon-512.png` (GitHub-hosted)
- Tests: `node test/dom-smoke.mjs`; the repository also runs it in
  `.github/workflows/smoke.yml`

The progress bar is driven by real boot milestones (client plugin graph via
`ctx.loader.entries()`, Host connection state, workspace/session baselines, and
first paint), not by a timer. It covers the boot page, adopts the same DOM node
into `shell.overlay` when the frame mounts, and fades out after startup completes
with a 2s minimum display time.
