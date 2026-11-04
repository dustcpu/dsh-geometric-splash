# dsh-splash

<p align="center"><img src="assets/icon-512.png" width="128" alt="dsh-splash icon"></p>

DSH 启动开屏插件：彭罗斯三角在等距菱格海面上旋转受光，底部进度条读取 **真实启动进度**，启动完成后淡出。

视觉测试台：`preview/preview.html?mode=static`（用真实 bundle 跑假服务，可直接用浏览器打开）。

## 效果保持

- 彭罗斯三角 24s 一圈旋转，三块面做 24s 循环受光（`#f1a2aa → #8f5f94 → #d4869b`）。
- 圆形框内是等距菱格海面：双正弦波位移网格，按平均高度混合浅色/粉色并描紫色细线。
- 圆形框 1.6s 弹入、品牌区 1.2s 延迟淡入，全部沿用原型的曲线与时长。
- 启动完成后 640ms 淡出，释放 canvas、样式与计时器。

## 真实进度，不是假进度

进度条由五个加权里程碑组成，总和 100：

| 阶段 | 权重 | 数据来源 |
|---|---|---|
| 页面装载 | 5 | `document.readyState === 'complete'` |
| 客户端插件图 | 50 | `ctx.get('modules').manifest.plugins.length` 与 `ctx.loader.entries()` 的 fiber 状态 |
| 连接 Host | 17 | `ctx.get('connection').state`（`connecting → connected`） |
| 工作区 / 会话基线 | 18 | `ctx.get('workspaces').list` 与 `ctx.get('sessions').list` 的 `phase === 'ready'` |
| 首帧与字体 | 10 | 挂载后的两帧 rAF + `document.fonts.ready`（最多等 800ms） |

没有任何“按时间跑百分比”的逻辑。显示值只对目标值做视觉缓动（`1 - e^(-dt/110)`），目标值本身完全来自上述状态；阶段文案会显示 `正在载入插件 37/94` 这类真实计数。

因为 `shell.overlay` 只在 React 应用挂载后才存在，插件在 `apply` 阶段先把自己的 DOM 画到 `document.body` 上（盖住内核自带的 “Loading plugins…” 启动页），等 `shell.overlay` 的 seat 挂载后，把**同一个 DOM 节点**重新挂到 seat 里，视觉上零闪烁。这样启动前半程（插件图装载）也能显示真实进度。

## 安装到本地 profile

插件是普通的 DSH 客户端插件包：host 半为一个空 Cordis 插件，`package.json` 的 `dsh.client` 让 `dsh-client-modules` 把 `lib/client.js` 作为浏览器 bundle 提供。`dsh.bundle.patch` 让它也能作为 bundle 被插件市场安装。

### 本地开发版（link）

```powershell
# 1. 把包链接进 profile（会写 package.json / pnpm-lock.yaml）
dsh plugin --profile desktop add "link:C:\path\to\dsh-splash"

# 2. 在 profile 的 cordis.patch.yml 末尾登记一行
#    （若通过插件市场/ bundle 方式安装，这一步由 cordis.patch.yml 自动完成）
- id: dsh-splash
  name: dsh-splash
```

DSH 的 HMR 会监听 profile patch 的变化并重组；浏览器端通过 `/plugins/events` 收到新的模块图。**刷新页面（Ctrl+R）** 后即可看到开屏。

### 发布版

```powershell
dsh plugin --profile desktop add dsh-splash
```

如果通过 DSH 插件市场安装，包的 `cordis.patch.yml` 会插入同样的 row，无需手写。

### 回滚

从 profile 的 `cordis.patch.yml` 删除 `dsh-splash` row，再执行：

```powershell
dsh plugin --profile desktop remove dsh-splash
```

## 开发流程

```
dsh-splash/
  package.json          # dsh.client / dsh.bundle 声明
  cordis.patch.yml      # bundle 安装时插入的 loader row
  lib/index.js          # host 半：空插件，只为让 Loader 有 entry
  lib/client.js         # 浏览器半：__ModuleLoader__ factory bundle
  preview/preview.html  # 用假 React/假服务跑真实 client.js 的测试台
  test/dom-smoke.mjs    # Node DOM 仿真冒烟测试（进度、adopt、淡出）
```

关键点：

1. **host 半必须存在**。`dsh-client-modules` 只扫描已启用的 Loader entry；没有 host row 就不会有浏览器 bundle。空 `apply()` 就够了。
2. **client 入口由 `exports["./client"]` 指定**，内容必须是 `window.__ModuleLoader__.load({ id, factory })` 形式；`factory(require)` 里只能 `require` 平台基线模块（`react`、`react/jsx-runtime`、`@deepseek-ai/dsh-client-ui-primitives` 等）。需要额外模块时写进 `dsh.client.external`。
3. **用 `ctx.slots.inject('shell.overlay', ...)` 注册**，不要直接注册 `root`。`shell.overlay` 是 root 作用域的 list slot，天然叠加、默认点击穿透，条目自己决定是否接收指针事件。
4. **改完 `lib/client.js` 后**，HMR 会按文件 revision 重载该插件；如果没有自动刷新，重启页面。开发期间可用 `?dsh-splash=force` 在已启动的页面上强制显示，用 `?dsh-splash=off` 关闭。
5. **测试**：

```powershell
node test/dom-smoke.mjs
```

会用 Node 的 DOM 仿真执行真实的 `lib/client.js`，验证冷启动检测、真实 loader 计数、进度单调、`shell.overlay` adopt、淡出与清理。`preview/preview.html?mode=static` 是纯前端视觉测试台（真实 bundle + 假服务），可直接用浏览器打开。

## 配置

产品默认不暴露开关；开发和排障可用：

| 入口 | 作用 |
|---|---|
| `?dsh-splash=off` | 本次不显示 |
| `?dsh-splash=force` | 即使页面已经挂载也显示（用于开发） |
| `?dsh-splash-min=800` | 最短展示时间（毫秒），默认 2000 |
| `window.__DSH_SPLASH__ = { minVisibleMs, force, disabled, debug }` | 脚本注入方式 |

`minVisibleMs` 只影响“已经 100% 后还停留多久”，不会伪造进度；如果真实启动耗时超过它，就以真实完成为准立即淡出。

## 已知边界

- 开屏是**页面级**的：Electron 原生窗口创建到页面脚本执行之间没有可注入的时机；这段仍由桌面壳自己的窗口背景承担。
- 首次加载后 `shell.overlay` 才存在，所以采用“先画到 body，再 adopt 进 seat”的两段式；如果布局插件重载导致 seat 消失，会把节点放回 body，不会丢画面。
- 启动失败时最多覆盖 20s，然后淡出，避免把错误页永久盖住；进度条不会假报 100%。
- 依赖 `ctx.loader.entries()`、`ctx.connection`、`workspaces`/`sessions` 服务；任何一项缺失都会在短暂宽限后按“能力不存在”跳过该阶段，而不是卡死。

## 发布到插件市场

市场的数据源是 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 的 `data/plugins/`（一个插件一个 YAML），不是 dshmarket 仓库。完整流程——GitHub 仓库、`dsh-plugin` topic、npm 发布、收录 PR、CI 与后续更新——见 [PUBLISHING.zh.md](PUBLISHING.zh.md)。

仓库已建为 [dustcpu/dsh-splash](https://github.com/dustcpu/dsh-splash)，收录 YAML 已备好：[market/dustcpu__dsh-splash.yml](market/dustcpu__dsh-splash.yml)。本包已声明 `dsh.bundle`、`dsh.client`、`engines.dsh`，并带有 `cordis.patch.yml`，满足收录的 manifest 要求。

## License

MIT
