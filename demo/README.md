# dsh-splash recording demos

用于录屏展示常驻标记的效果。所有页面加载**真实的 `lib/client.js`**，不是手绘 mock；标记按 2.2× 放大，背景和 composer 只是录制用的假壳。

## 推荐：一页看全

打开：

```text
demo/all.html
```

同屏展示：

- `idle`
- `thinking`
- `waiting`
- `read`
- `search`
- `act`
- `edit`
- `state switch`（自动 `idle → thinking → waiting → read → search → act → edit`，每 2.6s 切换）

窗口建议 **1440×900**。七个状态和状态切换同时运行，直接录这一页即可。

## 单个状态

`demo/index.html` 可以单独打开：

- `00-idle.html`
- `01-read.html`
- `02-search.html`
- `03-act.html`
- `04-edit.html`
- `05-transition.html`
- `06-thinking.html`
- `07-waiting.html`

`edit` 页会先短暂处于 read，然后在 edit 状态下循环翻转（翻到 180°、保持、再翻回）；页面里的「重播翻转」可以重来。`edit` 页也可以直接录翻转过程。

## 如果 iframe 不加载

某些浏览器对 `file://` 下的 iframe 有限制。在 `dsh-splash` 目录起一个静态服务器：

```powershell
python -m http.server 8799
```

然后打开：

```text
http://127.0.0.1:8799/demo/all.html
```

## 说明

- 标记放大只改录制页；生产插件仍是 46px。
- 三角始终使用主题色；白色边缘高光、翻转、星星负责状态。
- 这组 demo 不随 npm 包发布，也不修改生产代码。
