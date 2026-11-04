# Publish dsh-splash to the DSH plugin market

This guide is written against the official rules in
[awesome-dsh-plugin/contributing.md](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md)
(checked 2026-11-04). The market application (`dshmarket`) is **not** the catalog:
its plugin list comes from `awesome-dsh-plugin.com/plugins.json`, generated from
one YAML file per plugin in `awesome-dsh-plugin/data/plugins/`.

This repository is `dustcpu/dsh-splash`; the commands below use `dustcpu`.
If you later rename or transfer the repository, replace the owner and repository
name consistently in `package.json` and the catalog entry.

**Short path:** create the public repo → add the `dsh-plugin` topic → wait one
day → point `repository` at it → `npm publish` → add screenshots → open one
catalog PR with one YAML file → CI + maintainer review → merged, live within a
day.

> On this machine `git` and `npm` are available, but GitHub CLI (`gh`) is not.
> Either use the github.com web UI for the repository/fork/PR, or install it
> first (`winget install --id GitHub.cli`).

## 0. What the reviewer needs to see

- `package.json` declares **both** `dsh.bundle` and `dsh.client` (this package
  already does). `dsh.client` alone is not installable.
- `cordis.patch.yml` sits next to `package.json` and inserts the loader row.
- Real, working code is committed — this repository is the plugin source, not a
  placeholder or a README-only repo.
- The repository is at least **1 day old** before you open the catalog PR.
- The repository has the **`dsh-plugin`** GitHub topic.
- The package's `repository` field points back at the listed repository.

## 1. Create the GitHub repository

The public repository `dustcpu/dsh-splash` already exists and is empty as of
2026-11-04. The first push is the only step needed here; the commands below are
also the reference for a fresh copy.

```powershell
cd C:\Users\Lenovo\Documents\deepseek-harness\default-workspace\dsh-splash
git init -b main
git add -A
git commit -m "dsh-splash 0.1.0"
git remote add origin git@github.com:dustcpu/dsh-splash.git
$env:GIT_SSH='C:\Windows\System32\OpenSSH\ssh.exe'
git push -u origin main
```

If you ever recreate it from scratch, the web UI or `gh` can create the public
repository instead:

```powershell
gh repo create dustcpu/dsh-splash --public --source . --remote origin --push
gh repo edit dustcpu/dsh-splash --add-topic dsh-plugin
```

Without `gh`: create the public repo on github.com, then:

```powershell
git remote add origin https://github.com/dustcpu/dsh-splash.git
git push -u origin main
```

and add the `dsh-plugin` topic in the repository settings.

> The **1-day repository age** is checked by CI automatically. Create the repo
> first, finish screenshots/README in the meantime, and open the catalog PR the
> next day. Resubmitting is fine.

## 2. Point the package metadata at the repository

Do this before `npm publish`; the market links npm to the repo through this
field. The npm name `dsh-splash` is currently available, but re-check at publish
time. If it has been taken, use a scope such as `@dustcpu/dsh-splash` and keep
the same repository URL.

```powershell
npm pkg set "repository.type=git"
npm pkg set "repository.url=git+https://github.com/dustcpu/dsh-splash.git"
npm pkg set "homepage=https://github.com/dustcpu/dsh-splash"
npm pkg set "bugs.url=https://github.com/dustcpu/dsh-splash/issues"
npm pkg set "author=dustcpu"
```

## 3. Publish to npm (optional, recommended)

The market does not require npm: plugins install from GitHub as well. npm adds a
download figure and lets the market detect updates by version. Prebuilt npm
installs also skip DSH's `allowBuilds` approval.

```powershell
npm login
npm pack --dry-run     # confirm only lib/, cordis.patch.yml, README*, LICENSE are shipped
npm publish --access public
```

> If PowerShell blocks `npm.ps1` with an execution-policy error, run
> `npm.cmd publish --access public` (and the other `npm` commands as
> `npm.cmd ...`) or use a normal terminal.

Do not publish build output that is missing: `lib/client.js` is the browser half
and must be in the tarball. `package.json` `files` already lists it.

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
it at `https://raw.githubusercontent.com/dustcpu/dsh-splash/main/assets/icon-512.png`.
Replace that file and keep the same path if you want a different icon; the market
tile is a ~96px square, GitHub-hosted **raster** image (`png`/`jpg`/`jpeg`/`webp`).
SVG and third-party hosts are refused. If you remove the `icon:` line entirely,
the market falls back to the repository owner's avatar.

## 5. Add the catalog entry

The catalog entry is **one new file** in a fork of
`awesome-dsh-plugin/awesome-dsh-plugin`:

```
data/plugins/dustcpu__dsh-splash.yml
```

Content (this repository also keeps a template at
`market/dustcpu__dsh-splash.yml`):

```yaml
url: https://github.com/dustcpu/dsh-splash
name: dustcpu/dsh-splash
category: ui
description:
  en: 'Page-level startup splash: a Penrose triangle light sweep over a living isometric diamond ocean, with a progress bar driven by real DSH boot milestones; it fades out after startup completes, with a short minimum display time.'
  zh: '页面级启动开屏：彭罗斯三角在等距菱格海面上旋转受光，进度条读取真实 DSH 启动里程碑；启动完成后淡出，并有短暂的最短展示时间。'
# optional, GitHub-hosted raster only:
# icon: https://raw.githubusercontent.com/dustcpu/dsh-splash/main/assets/icon-512.png
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
# copy market/dustcpu__dsh-splash.yml to data/plugins/dustcpu__dsh-splash.yml
git add data/plugins/dustcpu__dsh-splash.yml
git commit -m "Add dsh-splash"
git push -u origin add-dsh-splash
gh pr create --repo awesome-dsh-plugin/awesome-dsh-plugin `
  --title "Add dsh-splash" `
  --body "Adds dsh-splash, a page-level DSH startup splash with a progress bar driven by real boot milestones."
```

Without `gh`: fork the repository on github.com, create
`data/plugins/dustcpu__dsh-splash.yml` with the **Add file → Create new file**
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
dsh plugin --profile web add github:dustcpu/dsh-splash
```

## 7. Updating the listing later

- **Description / category / icon:** open a PR editing your own
  `data/plugins/dustcpu__dsh-splash.yml`; change only your entry.
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
