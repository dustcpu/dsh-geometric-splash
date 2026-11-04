# Publish dsh-splash to the DSH plugin market

This guide is written against the official rules in
[awesome-dsh-plugin/contributing.md](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md)
(checked 2026-11-04). The market application (`dshmarket`) is **not** the catalog:
its plugin list comes from `awesome-dsh-plugin.com/plugins.json`, generated from
one YAML file per plugin in `awesome-dsh-plugin/data/plugins/`.

This repository is `dustcpu/dsh-geometric-splash`; the commands below use `dustcpu`.
If you later rename or transfer the repository, replace the owner and repository
name consistently in `package.json` and the catalog entry.

**Short path:** create the public repo → add the `dsh-plugin` topic → wait one
day → point `repository` at it → `npm publish` → add screenshots → open one
catalog PR with one YAML file → CI + maintainer review → merged, live within a
day.

> On this machine `git` and `npm` are available, but GitHub CLI (`gh`) is not.
> Either use the github.com web UI for the repository/fork/PR, or install it
> first (`winget install --id GitHub.cli`).

## Current status

As of 2026-11-04:

- The repository is renamed to **`dustcpu/dsh-geometric-splash`** (done). GitHub
  preserves history, `v0.1.0`, the topic, and the creation date; the old URL
  redirects.
- The working tree, `package.json`, README, catalog YAML, and PR body point at
  `dustcpu/dsh-geometric-splash`; `main` and the prepared commit are pushed.
- npm CLI is authenticated as `dusttttt`; 2FA is enabled with
  `"mode": "auth-and-writes"`. **`dsh-splash@0.1.0` is published** (the current
  npm `latest`, 2026-11-04T05:05Z); `npm view dsh-splash version` returns
  `0.1.0`, and the package's `repository` points at
  `dustcpu/dsh-geometric-splash`.
- **0.2.0 is in the working tree, not published**: a 7.2s default skippable
  intro (3.8s / 10s choices) and a theme dock with ten palettes. It is testable
  through the local `link:` profile before release.
- `assets/icon-512.png` is added; the catalog YAML references it.
- `.github/workflows/smoke.yml` runs `node test/dom-smoke.mjs` on every push.
- Ready catalog entry and PR body:
  [market/dustcpu__dsh-geometric-splash.yml](market/dustcpu__dsh-geometric-splash.yml),
  [market/PR-body.md](market/PR-body.md).
- **Catalog submission is intentionally deferred.** The repository can stay
  public and the npm package is already published without listing it; open the
  catalog PR whenever you are ready (after the 24-hour age gate).

Next:

- Try 0.2.0 through the local link (Ctrl+R for the long intro; the theme dock is
  at the bottom-right). If it looks right, publish `0.2.0`:
  `npm publish --access public` (security-key prompt).
- Confirm the repository is **public**, and keep the **`dsh-plugin`** topic.
- When you decide to list, fork `awesome-dsh-plugin` and open the one-file PR
  with the prepared YAML.
- For future code changes, publish a new npm version; do not try to overwrite
  `0.1.0` or `0.2.0`.

## 0. What the reviewer needs to see

- `package.json` declares **both** `dsh.bundle` and `dsh.client` (this package
  already does). `dsh.client` alone is not installable.
- `cordis.patch.yml` sits next to `package.json` and inserts the loader row.
- Real, working code is committed — this repository is the plugin source, not a
  placeholder or a README-only repo.
- The repository is at least **1 day old** before you open the catalog PR.
- The repository has the **`dsh-plugin`** GitHub topic.
- The package's `repository` field points back at the listed repository.

## 1. Repository name

The repository was created as `dustcpu/dsh-splash` and renamed to
**`dustcpu/dsh-geometric-splash`**; history, tag, topic, and creation date are
preserved. Point the local remote at the new name and push the prepared commit:

```powershell
cd C:\Users\Lenovo\Documents\deepseek-harness\default-workspace\dsh-splash
git remote set-url origin git@github.com:dustcpu/dsh-geometric-splash.git
$env:GIT_SSH='C:\Windows\System32\OpenSSH\ssh.exe'
git push -u origin main
```

If you ever recreate it from scratch, the web UI or `gh` can create the public
repository instead:

```powershell
gh repo create dustcpu/dsh-geometric-splash --public --source . --remote origin --push
gh repo edit dustcpu/dsh-geometric-splash --add-topic dsh-plugin
```

Without `gh`: create the public repo on github.com, then:

```powershell
git remote add origin https://github.com/dustcpu/dsh-geometric-splash.git
git push -u origin main
```

and add the `dsh-plugin` topic in the repository settings.

> The **1-day repository age** is checked by CI automatically. The rename does
> not reset it. There is no deadline to open the catalog PR; open it when ready
> after the gate.

## 2. Point the package metadata at the repository

Do this before `npm publish`; the market links npm to the repo through this
field. The npm name `dsh-splash` is currently available, but re-check at publish
time. If it has been taken, use a scope such as `@dusttttt/dsh-splash` and keep
the same repository URL.

```powershell
npm pkg set "repository.type=git"
npm pkg set "repository.url=git+https://github.com/dustcpu/dsh-geometric-splash.git"
npm pkg set "homepage=https://github.com/dustcpu/dsh-geometric-splash"
npm pkg set "bugs.url=https://github.com/dustcpu/dsh-geometric-splash/issues"
npm pkg set "author=dustcpu"
```

## 3. Publish to npm (optional, recommended)

The market does not require npm: plugins install from GitHub as well. npm adds a
download figure and lets the market detect updates by version. Prebuilt npm
installs also skip DSH's `allowBuilds` approval.

The CLI on this machine is already authenticated as **`dusttttt`**. Run the
publish **after** the repository rename, so the package's `repository` field
points at the final URL:

```powershell
npm whoami              # dusttttt
npm pack --dry-run      # lib/, cordis.patch.yml, README*, LICENSE, assets/icon-512.png
npm publish --access public
```

> `npm login` is only needed on a new machine. If PowerShell blocks `npm.ps1`
> with an execution-policy error, run `npm.cmd publish --access public` (and the
> other `npm` commands as `npm.cmd ...`) or use a normal terminal.

Do not publish build output that is missing: `lib/client.js` is the browser half
and must be in the tarball. `package.json` `files` already lists it.

### npm publish and 2FA

2FA is enabled on the npm account with `"mode": "auth-and-writes"`. This account
uses a **security key / passkey**, not a TOTP authenticator: `npm publish` prints
a CLI authentication URL and waits. Press Enter, complete the Windows Hello /
security-key prompt in the browser, then return to the terminal.

```powershell
cd C:\Users\Lenovo\Documents\deepseek-harness\default-workspace\dsh-splash
npm publish --access public
# Press ENTER, then complete the security-key prompt in the browser
```

If your PowerShell blocks `npm.ps1`, use `npm.cmd publish --access public`.

The registry processes a new package asynchronously. The first `0.1.0` publish
returned `PUT 202` and briefly created a `0.0.0-stage` placeholder; about four
minutes later `0.1.0` became `latest`. If you see the placeholder linger in the
version list, it is harmless — `npm view dsh-splash version` and
`npm view dsh-splash dist-tags` are the source of truth.

Alternative: create a **granular access token with bypass 2FA** (npmjs.com →
Access Tokens → Generate New Token → Granular Access Token):

- Packages: allow `dsh-splash` (or all packages) with **read and write**.
- Enable **Bypass 2FA** / "allow this token to bypass 2FA".
- Set a short expiry, create it, and copy the token.

Set it in the **user** npm config (not this repo), then publish:

```powershell
npm config set //registry.npmjs.org/:_authToken=<token>
npm whoami
npm publish --access public
```

`.npmrc` is already in `.gitignore`; never commit the token, never paste it into
chat, and revoke it after publishing if you do not need it.

You can also skip npm entirely: the market listing works with a GitHub install,
`dsh plugin --profile web add github:dustcpu/dsh-geometric-splash`. npm only
adds the download figure and npm-based installation.

After publishing:

```powershell
npm view dsh-splash version
```

should print `0.1.0`.

### Updating later

npm versions are immutable. You cannot replace `0.1.0`; publish a new version:

```powershell
npm version patch      # 0.1.0 -> 0.1.1, or minor for behavior changes
git push --follow-tags
npm publish --access public
```

The market compares the npm version (or the locked commit for GitHub installs)
and offers an update. Users choose when to update.

## 4. Screenshots and icon (optional, recommended)

### Screenshots

Create 1–8 images, commit them under `assets/`, and add `screenshots.json` next
to `package.json`:

```json
[
  "assets/splash-progress.png",
  "assets/splash-ready.png"
]
```

Rules: 1–8 images; paths relative to `screenshots.json`, no leading `/`, no
`..`; absolute URLs must be GitHub-hosted HTTPS. If omitted, storefronts extract
images from the README.

A practical way to capture a stable frame: open
`preview/preview.html?mode=static` in a browser and screenshot the frozen
mid-boot state, or temporarily raise `DEFAULT_MIN_VISIBLE_MS` in
`lib/client.js` to 8000, reload DSH, capture the real splash, then restore it.

### Icon

The repository already ships `assets/icon-512.png` (a cream circle with the
Penrose triangle in the splash palette), and the ready catalog entry references
it at `https://raw.githubusercontent.com/dustcpu/dsh-geometric-splash/main/assets/icon-512.png`.
Replace that file and keep the same path if you want a different icon; the market
tile is a ~96px square, GitHub-hosted **raster** image (`png`/`jpg`/`jpeg`/`webp`).
SVG and third-party hosts are refused. If you remove the `icon:` line entirely,
the market falls back to the repository owner's avatar.

## 5. Add the catalog entry

The catalog entry is **one new file** in a fork of
`awesome-dsh-plugin/awesome-dsh-plugin`:

```
data/plugins/dustcpu__dsh-geometric-splash.yml
```

Content (this repository also keeps a template at
`market/dustcpu__dsh-geometric-splash.yml`):

```yaml
url: https://github.com/dustcpu/dsh-geometric-splash
name: dustcpu/dsh-geometric-splash
category: ui
description:
  en: 'Page-level startup splash: a Penrose triangle light sweep over a living isometric diamond ocean, with a progress bar driven by real DSH boot milestones; it fades out after startup completes, with a short minimum display time.'
  zh: '页面级启动开屏：彭罗斯三角在等距菱格海面上旋转受光，进度条读取真实 DSH 启动里程碑；启动完成后淡出，并有短暂的最短展示时间。'
# optional, GitHub-hosted raster only:
# icon: https://raw.githubusercontent.com/dustcpu/dsh-geometric-splash/main/assets/icon-512.png
```

Rules that matter:

- File name **must** equal the URL slug: `dustcpu__<repo>.yml`.
- `name` **must** be `dustcpu/<repo>`.
- `category` must be one of the fixed values; for an overlay/UI effect, `ui` is
  the closest. A maintainer may adjust it.
- Only `description.en` is required; `zh` is optional but this plugin has one.
- Do **not** add an `npm:` key. The registry mapping is picked up automatically
  from the published package's `repository` field; a hand-written `npm:` key is
  rejected.
- Quote any description containing `: ` (colon + space).
- Do not edit the generated `README.md` / `README.zh.md`; CI regenerates them.
- One PR may add at most 3 entries; this is one entry.

Open the PR:

```powershell
gh repo fork awesome-dsh-plugin/awesome-dsh-plugin --clone
cd awesome-dsh-plugin
git checkout -b add-dsh-splash
# copy market/dustcpu__dsh-geometric-splash.yml to data/plugins/dustcpu__dsh-geometric-splash.yml
git add data/plugins/dustcpu__dsh-geometric-splash.yml
git commit -m "Add dsh-splash"
git push -u origin add-dsh-splash
gh pr create --repo awesome-dsh-plugin/awesome-dsh-plugin `
  --title "Add dsh-splash" `
  --body "Adds dsh-splash, a page-level DSH startup splash with a progress bar driven by real boot milestones."
```

Without `gh`: fork the repository on github.com, create
`data/plugins/dustcpu__dsh-geometric-splash.yml` with the **Add file → Create new file**
button, commit to a new branch, and use the website's **Compare & pull request**
button. The content is the same; the filename and one-file-only shape are what
matter.

## 6. CI and review

CI checks, in order:

1. At most 3 entries in the PR.
2. `dsh.bundle` exists in the repository's `package.json`.
3. The repository is at least 1 day old.
4. `awesome-lint` and the site build (locale parity, separators, dates,
   screenshots).

A green CI run is a precondition, not acceptance. A maintainer reads the
repository and checks that the description matches the code. If changes are
needed they apply a `held: author` label; push fixes to the same branch and
leave one comment. Do not open a new PR.

After merge the site rebuilds automatically; `plugins.json` refreshes daily, and
the market fetches it live. Users can then install from the market or with:

```powershell
# from npm
dsh plugin --profile web add dsh-splash

# or straight from GitHub
dsh plugin --profile web add github:dustcpu/dsh-geometric-splash
```

## 7. Updating the listing later

- **Description / category / icon:** open a PR editing your own
  `data/plugins/dustcpu__dsh-geometric-splash.yml`; change only your entry.
- **Screenshots:** push `screenshots.json` and the images to your repository; no
  catalog PR, the next nightly build picks them up.
- **Code / new version:** push to GitHub, bump the npm version, publish. The
  market offers updates; old versions keep working.
- **DSH compatibility:** the package declares
  `"engines": { "dsh": ">=0.2.1-rc.5 <0.3.0" }`. When you rely on newer Host
  APIs, widen/bump that range in the same release and test on the new Host.
  Hosts outside the range are shown as incompatible (and the plugin manager can
  grant an exact-version exemption for testing).

## 8. Common rejection reasons

- Only `dsh.client`, no `dsh.bundle` / `cordis.patch.yml` — not installable.
- Repo created minutes before the PR — the 1-day bar.
- Missing `dsh-plugin` topic.
- Inaccurate or marketing description; numbers/APIs that do not exist.
- Hand-written `npm:` key in the YAML.
- Editing generated READMEs or unrelated entries.
- More than 3 entries in one PR.
- `repository` in the npm package does not point back at the listed repo.
