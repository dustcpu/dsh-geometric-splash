# dsh-splash

DSH 启动开屏插件：彭罗斯三角在等距菱格海面上旋转受光，**取景框本身就是进度计**，读的是真实启动进度。默认 7.2 秒，按任意键可跳过。开屏结束后三角不消失——它缩到输入框左侧常驻，变成一枚会跟着工作状态变化的小标记。

## 效果速览

- **没有进度条、没有按钮**：取景框就是进度计，宽高与圆角随进度从 380px 推到铺满窗口，百分比是框内底部的大号数字。
- **进度是真的**：由五个加权里程碑驱动（插件图装载、Host 连接、工作区就绪、首帧字体），总和 100。电影节奏只让它按时间线平滑走，**永远不会超过真实完成度**。
- **按任意键跳过**：`F5` / `Ctrl+R` 仍然可用，所以刷新不会把开屏吞掉。
- **收尾**：100% 时停留一拍，三角自己飞向输入框左侧外缘，缩成常驻标记。
- **常驻标记**：恒定慢转，按思考 / 等待 / 读取 / 查找 / 执行 / 改文件六种工作状态切换；三角**始终使用当前主题色，不再随状态换色**。转速只受推理强度影响（Off / Low / High / Max 四档）。
- **状态提示**：白色/亮色高光在三角边缘行走（thinking/act 环行、search 逐边亮起、waiting 整圈呼吸），edit 整体翻转；状态切换时周围点亮小星星，不再喷射粒子。三角三面的明暗会按网页原版的受光相位随角度交替。
- **10 套主题色板**：来自 Monument Valley 与 Geometric Islands，会话顶部导航栏的小三角图标进入主题坞。

## 安装

**DSH 桌面版**：打开「插件」页，在插件市场里找到 dsh-splash，点安装即可。

**命令行**（DSH Web 版，或你知道自己的 profile 名时）：

```sh
dsh plugin --profile <你的 profile 名> add dsh-splash
```

> ⚠️ 桌面版的 profile 由应用自己管理，命令行里的 profile 名写错会装到别的 profile 去，在桌面版里看不到。桌面版请直接用上面的市场安装。
>
> ⚠️ DSH 给 profile 配了 pnpm 的**发布等待期**（`minimumReleaseAge`），刚发布的新版本在等待期里会被挡住，`add dsh-splash` 可能装到较旧的版本。想装最新版就指定版本号：`add dsh-splash@0.2.5`——pnpm 会自动把它加进 profile 的 `minimumReleaseAgeExclude` 放行。

**本地开发版**（link）：

```powershell
dsh plugin --profile desktop add "link:C:\path\to\dsh-splash"
```

> link 安装需要在 profile 的 `cordis.patch.yml` 末尾登记一行；走市场 / bundle 方式安装时这一步会自动完成。
>
> ```yaml
> - id: dsh-splash
>   name: dsh-splash
> ```

装完**刷新页面（Ctrl+R）**即可看到开屏。

## 配置

日常使用通过会话顶部导航栏的主题坞即可：切换色板、调整开屏时长（1–12 秒）、开关常驻标记。设置存在当前页面的 `localStorage`，不写宿主配置，也不跨设备同步。

开发与排障用的 query 参数：

- `?dsh-splash=off` — 本次不显示
- `?dsh-splash=force` — 即使页面已挂载也显示
- `?dsh-splash-min=3800` — 本次开屏最短展示时间（毫秒），默认 7200
- `?dsh-splash-palette=island-night` — 本次强制使用某套色板
- `?dsh-splash-progress=real` — 本次切到真实进度（仅调试用）

## 已知边界

- 开屏是**页面级**的：Electron 原生窗口创建到页面脚本执行之间没有可注入的时机，这段由桌面壳自己的窗口背景承担。
- 启动失败时最多覆盖 20 秒然后淡出，避免把错误页永久盖住；进度不会假报 100%。
- 画面全部由代码绘制（canvas + SVG），不带任何图片或视频资产，所以包体很小、任意分辨率都清晰。

## 更多

- 真实进度的计算方式、里程碑权重、开发流程与调试参数详解 → [README.developer.md](README.developer.md)
- 提交到插件市场的流程 → [PUBLISHING.zh.md](PUBLISHING.zh.md)
- 变更记录 → [CHANGELOG.md](CHANGELOG.md)

## License

MIT
