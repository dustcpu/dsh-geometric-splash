window.__ModuleLoader__.load({
  id: "dsh-splash",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var React = require("react");
    var h = React.createElement;

    /* ------------------------------------------------------------------ *
     * dsh-splash — client half.
     *
     * A cold page boot runs in two visible stretches:
     *
     *   1. the shell boot page ("Loading plugins…") while the browser
     *      materialises every client entry from the boot graph;
     *   2. the app frame after `uiRenderer.mount`, while the wire connects
     *      and the Workspace/Session baselines load.
     *
     * A `shell.overlay` seat only exists in stretch 2, so this plugin paints
     * its own DOM as soon as it activates and adopts that same node into the
     * overlay seat when the frame mounts. One DOM tree, no flash, no second
     * copy. The progress bar reads real milestones only — loader entry states,
     * the connection generation, workspace/session snapshot phases, and the
     * first painted frame. There is no timer-driven "fake" percentage.
     * ------------------------------------------------------------------ */

    var MODULE_ID = "dsh-splash";
    var NS = "dsh-splash";
    var STYLE_ATTR = "data-plugin-css";
    var STYLE_ID = "dsh-splash/style.css";

    /** Weighted milestones. Sum = 100. */
    var WEIGHT = { page: 5, boot: 50, connection: 17, services: 18, paint: 10 };

    /** The brand moment: keep the completed splash up at least this long. */
    var DEFAULT_MIN_VISIBLE_MS = 7200;
    /** Intro length choices exposed by the theme dock (milliseconds). */
    var INTRO_CHOICES = [3800, 7200, 10000];
    /** localStorage key for the splash theme; per page origin. */
    var SETTINGS_KEY = "dsh-splash:settings";

    /**
     * Palettes derived from the user's references:
     * E:\mv-refs\palette.json (Monument Valley registers) and
     * E:\web\Geometric Islands\style.css (island themes).
     *
     * pf: { light, mid, dark } are the three Penrose faces in the same roles as
     * the prototype's 24s light sweep. ocean: [r, g, b] arrays for the canvas.
     */
    var PALETTES = [
      {
        id: "swamp",
        name: { zh: "沼泽（默认）", en: "Swamp (default)" },
        bg: "#e8e3cf", frame: "#efe9d8", brand: "#8f5f94", text: "#6f4674", muted: "#9a7f9b",
        barTrack: "rgba(143, 95, 148, .16)", shadow: "rgba(143, 95, 148, .25)",
        pf: { light: "#f1a2aa", mid: "#d4869b", dark: "#8f5f94" },
        ocean: { low: [212, 180, 195], high: [248, 244, 238], grid: [143, 95, 148] }
      },
      {
        id: "island-blue",
        name: { zh: "岛屿蓝", en: "Island Blue" },
        bg: "#f4f9ff", frame: "#ffffff", brand: "#3d7fc4", text: "#1f3a5c", muted: "#6d8bab",
        barTrack: "rgba(61, 127, 196, .16)", shadow: "rgba(36, 85, 140, .18)",
        pf: { light: "#a8cff0", mid: "#5b9bd5", dark: "#24558c" },
        ocean: { low: [207, 228, 247], high: [255, 255, 255], grid: [61, 127, 196] }
      },
      {
        id: "island-green",
        name: { zh: "岛屿绿", en: "Island Green" },
        bg: "#f0f9f0", frame: "#ffffff", brand: "#4a9e4a", text: "#1a3d1a", muted: "#5a8060",
        barTrack: "rgba(74, 158, 74, .16)", shadow: "rgba(45, 107, 45, .18)",
        pf: { light: "#a8d8a8", mid: "#6bb06b", dark: "#2d6b2d" },
        ocean: { low: [212, 237, 212], high: [255, 255, 255], grid: [74, 158, 74] }
      },
      {
        id: "island-amber",
        name: { zh: "岛屿琥珀", en: "Island Amber" },
        bg: "#fff8f0", frame: "#ffffff", brand: "#d98c3a", text: "#5c3310", muted: "#9a7550",
        barTrack: "rgba(217, 140, 58, .18)", shadow: "rgba(181, 101, 29, .20)",
        pf: { light: "#ecc89a", mid: "#e0a050", dark: "#b5651d" },
        ocean: { low: [245, 224, 196], high: [255, 253, 248], grid: [217, 140, 58] }
      },
      {
        id: "island-purple",
        name: { zh: "岛屿紫", en: "Island Purple" },
        bg: "#f6f2fb", frame: "#ffffff", brand: "#8b6bc0", text: "#3a2560", muted: "#7a6898",
        barTrack: "rgba(139, 107, 192, .16)", shadow: "rgba(107, 74, 158, .20)",
        pf: { light: "#c8b5e4", mid: "#a085cc", dark: "#6b4a9e" },
        ocean: { low: [224, 212, 240], high: [255, 255, 255], grid: [139, 107, 192] }
      },
      {
        id: "island-night",
        name: { zh: "岛屿夜", en: "Island Night" },
        bg: "#0b0f18", frame: "#151b28", brand: "#6b95c8", text: "#c8d4e8", muted: "#6e8098",
        barTrack: "rgba(107, 149, 200, .18)", shadow: "rgba(0, 0, 0, .55)",
        pf: { light: "#9fbce0", mid: "#5a82b0", dark: "#2a3f5c" },
        ocean: { low: [30, 42, 61], high: [45, 63, 88], grid: [107, 149, 200] }
      },
      {
        id: "warm-gold",
        name: { zh: "暖金塔楼", en: "Warm Gold" },
        bg: "#faf1e2", frame: "#fdf0dc", brand: "#b26fc7", text: "#6a3490", muted: "#9b86a8",
        barTrack: "rgba(178, 111, 199, .16)", shadow: "rgba(106, 52, 144, .20)",
        pf: { light: "#fcc390", mid: "#d780c4", dark: "#6a3490" },
        ocean: { low: [232, 183, 165], high: [255, 243, 228], grid: [178, 111, 199] }
      },
      {
        id: "teal-frame",
        name: { zh: "青绿框架", en: "Teal Frame" },
        bg: "#eef5ee", frame: "#e3f1ea", brand: "#247089", text: "#183e66", muted: "#6e8a94",
        barTrack: "rgba(36, 112, 137, .16)", shadow: "rgba(24, 62, 102, .20)",
        pf: { light: "#88ecb9", mid: "#2e909d", dark: "#183e66" },
        ocean: { low: [159, 216, 208], high: [240, 250, 245], grid: [36, 112, 137] }
      },
      {
        id: "sunset",
        name: { zh: "橙粉云海", en: "Sunset Cloud" },
        bg: "#fff1e6", frame: "#ffe7d4", brand: "#bd644f", text: "#7f4439", muted: "#a88a7a",
        barTrack: "rgba(189, 100, 79, .16)", shadow: "rgba(127, 68, 57, .20)",
        pf: { light: "#fdccae", mid: "#dc9072", dark: "#7f4439" },
        ocean: { low: [242, 183, 155], high: [255, 246, 236], grid: [189, 100, 79] }
      },
      {
        id: "dark-room",
        name: { zh: "暗室三窗", en: "Dark Room" },
        bg: "#20212d", frame: "#2b2c3a", brand: "#9d7cb3", text: "#e8dae9", muted: "#8f86a8",
        barTrack: "rgba(232, 218, 233, .16)", shadow: "rgba(0, 0, 0, .50)",
        pf: { light: "#9d7cb3", mid: "#53507d", dark: "#3c374e" },
        ocean: { low: [32, 33, 45], high: [60, 55, 78], grid: [157, 124, 179] }
      }
    ];

    function getPalette(id) {
      for (var index = 0; index < PALETTES.length; index += 1) {
        if (PALETTES[index].id === id) return PALETTES[index];
      }
      return null;
    }

    function clampIntro(value) {
      return Math.min(12000, Math.max(1000, Math.round(value)));
    }

    function readSettings() {
      var settings = { paletteId: "swamp", introMs: DEFAULT_MIN_VISIBLE_MS, progressMode: "cinematic" };
      try {
        var raw = window.localStorage.getItem(SETTINGS_KEY);
        if (raw !== null) {
          var parsed = JSON.parse(raw);
          if (parsed && typeof parsed.paletteId === "string" && getPalette(parsed.paletteId) !== null) {
            settings.paletteId = parsed.paletteId;
          }
          if (parsed && typeof parsed.introMs === "number" && Number.isFinite(parsed.introMs)) {
            settings.introMs = clampIntro(parsed.introMs);
          }
          if (parsed && (parsed.progressMode === "real" || parsed.progressMode === "cinematic")) {
            settings.progressMode = parsed.progressMode;
          }
        }
      } catch (error) {
        /* localStorage can be unavailable in a hardened page; use defaults. */
      }
      return settings;
    }

    function writeSettings(settings) {
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        /* In-memory settings still apply for this page. */
      }
    }

    /** Per-palette CSS variables and Penrose light-sweep keyframes. */
    function paletteCss() {
      return PALETTES.map(function (palette) {
        var vars = [
          "--dsh-splash-bg:" + palette.bg,
          "--dsh-splash-frame:" + palette.frame,
          "--dsh-splash-brand:" + palette.brand,
          "--dsh-splash-text:" + palette.text,
          "--dsh-splash-muted:" + palette.muted,
          "--dsh-splash-bar-track:" + palette.barTrack,
          "--dsh-splash-shadow:" + palette.shadow
        ].join(";");
        var light = palette.pf.light;
        var mid = palette.pf.mid;
        var dark = palette.pf.dark;
        var id = palette.id;
        return [
          '.dsh-splash[data-palette="' + id + '"] {' + vars + '}',
          "@keyframes dsh-splash-pf1-" + id + " { 0%{fill:" + light + "} 50.14%{fill:" + dark + "} 66.89%{fill:" + mid + "} 100%{fill:" + light + "} }",
          "@keyframes dsh-splash-pf2-" + id + " { 0%{fill:" + mid + "} 33.11%{fill:" + light + "} 83.25%{fill:" + dark + "} 100%{fill:" + mid + "} }",
          "@keyframes dsh-splash-pf3-" + id + " { 0%{fill:" + dark + "} 16.75%{fill:" + mid + "} 49.86%{fill:" + light + "} 100%{fill:" + dark + "} }",
          '.dsh-splash[data-palette="' + id + '"] .dsh-splash__pf1 { animation-name:dsh-splash-pf1-' + id + '; }',
          '.dsh-splash[data-palette="' + id + '"] .dsh-splash__pf2 { animation-name:dsh-splash-pf2-' + id + '; }',
          '.dsh-splash[data-palette="' + id + '"] .dsh-splash__pf3 { animation-name:dsh-splash-pf3-' + id + '; }'
        ].join("\n");
      }).join("\n");
    }


    /** Opacity/visibility transition length; keep in sync with the stylesheet. */
    var FADE_MS = 640;
    /** Give up covering the app after this long, even if a milestone never lands. */
    var HARD_STOP_MS = 20000;
    /** How often loader/connection/service milestones are re-read. */
    var POLL_MS = 100;

    var CSS = `
.dsh-splash {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-bottom: 60px;
  background: linear-gradient(180deg, #e8e3cf 0%, #e8e3cf 100%);
  color: #8f5f94;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
  pointer-events: auto;
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  opacity: 1;
  visibility: visible;
  transition: opacity ${FADE_MS}ms cubic-bezier(.4, 0, .2, 1), visibility ${FADE_MS}ms;
  will-change: opacity;
}
.dsh-splash[data-state="leaving"] {
  opacity: 0;
  visibility: hidden;
}
.dsh-splash__frame {
  width: min(70vmin, 380px);
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  background: #efe9d8;
  box-shadow: 0 20px 50px rgba(143, 95, 148, .25);
  animation: dsh-splash-emerge 1.6s cubic-bezier(.22, .9, .3, 1) .3s both;
}
.dsh-splash__ocean {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
.dsh-splash__penrose {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dsh-splash__spin {
  transform-box: view-box;
  transform-origin: 44px 48px;
  animation: dsh-splash-spin 24s linear infinite;
}
.dsh-splash__pf1 { animation: dsh-splash-lit1 24s linear infinite; }
.dsh-splash__pf2 { animation: dsh-splash-lit2 24s linear infinite; }
.dsh-splash__pf3 { animation: dsh-splash-lit3 24s linear infinite; }
.dsh-splash__brand {
  margin-top: 24px;
  width: min(70vmin, 320px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  opacity: 0;
  animation: dsh-splash-brand-in 1.2s ease 1.5s forwards;
}
.dsh-splash__bar {
  width: 100%;
  height: 6px;
  background: rgba(143, 95, 148, .15);
  border-radius: 3px;
  overflow: hidden;
}
.dsh-splash__fill {
  display: block;
  height: 100%;
  width: 0;
  background: #8f5f94;
  border-radius: 3px;
  transition: width 140ms linear;
}
.dsh-splash__pct {
  color: #8f5f94;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1px;
  font-variant-numeric: tabular-nums;
  line-height: 18px;
}
.dsh-splash__stage {
  min-height: 15px;
  color: rgba(143, 95, 148, .62);
  font-size: 11px;
  line-height: 15px;
  letter-spacing: .04em;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.dsh-splash__seat {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .dsh-splash__frame,
  .dsh-splash__brand,
  .dsh-splash__spin,
  .dsh-splash__pf1,
  .dsh-splash__pf2,
  .dsh-splash__pf3 {
    animation: none;
  }
  .dsh-splash__brand { opacity: 1; }
  .dsh-splash__fill { transition: none; }
}
@keyframes dsh-splash-emerge {
  0%   { opacity: 0; transform: scale(.8); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes dsh-splash-spin { to { transform: rotate(360deg); } }
@keyframes dsh-splash-brand-in { to { opacity: 1; } }
@keyframes dsh-splash-lit1 {
  0%     { fill: #f1a2aa; }
  50.14% { fill: #8f5f94; }
  66.89% { fill: #d4869b; }
  100%   { fill: #f1a2aa; }
}
@keyframes dsh-splash-lit2 {
  0%     { fill: #d4869b; }
  33.11% { fill: #f1a2aa; }
  83.25% { fill: #8f5f94; }
  100%   { fill: #d4869b; }
}
@keyframes dsh-splash-lit3 {
  0%     { fill: #8f5f94; }
  16.75% { fill: #d4869b; }
  49.86% { fill: #f1a2aa; }
  100%   { fill: #8f5f94; }
}
`;

    var THEME_CSS = `
.dsh-splash {
  --dsh-splash-bg: #e8e3cf;
  --dsh-splash-frame: #efe9d8;
  --dsh-splash-brand: #8f5f94;
  --dsh-splash-text: #6f4674;
  --dsh-splash-muted: #9a7f9b;
  --dsh-splash-bar-track: rgba(143, 95, 148, .16);
  --dsh-splash-shadow: rgba(143, 95, 148, .25);
  --dsh-splash-intro: 7200ms;
  background: var(--dsh-splash-bg);
  color: var(--dsh-splash-text);
}
.dsh-splash__hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dsh-splash__glow {
  position: absolute;
  width: min(78vmin, 430px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, var(--dsh-splash-brand) 0%, transparent 68%);
  opacity: 0;
  filter: blur(26px);
  pointer-events: none;
  animation: dsh-splash-glow var(--dsh-splash-intro) ease-in-out .3s both;
}
.dsh-splash__frame {
  background: var(--dsh-splash-frame);
  box-shadow: 0 20px 50px var(--dsh-splash-shadow);
  animation: dsh-splash-intro var(--dsh-splash-intro) cubic-bezier(.22, .9, .3, 1) .3s both;
}
.dsh-splash__bar { background: var(--dsh-splash-bar-track); }
.dsh-splash__fill { background: var(--dsh-splash-brand); }
.dsh-splash__pct { color: var(--dsh-splash-text); }
.dsh-splash__stage { color: var(--dsh-splash-muted); }
.dsh-splash__skip {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 3;
  padding: 6px 13px;
  border: 1px solid var(--dsh-splash-muted);
  border-radius: 999px;
  background: transparent;
  color: var(--dsh-splash-muted);
  font: inherit;
  font-size: 12px;
  letter-spacing: .04em;
  cursor: pointer;
  pointer-events: auto;
  transition: color .2s, border-color .2s, background .2s;
}
.dsh-splash__skip:hover {
  color: var(--dsh-splash-text);
  border-color: var(--dsh-splash-text);
  background: rgba(127, 127, 127, .08);
}
.dsh-splash__skip[hidden] { display: none; }
@keyframes dsh-splash-intro {
  0%   { opacity: 0; transform: scale(.8); }
  22%  { opacity: 1; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.035); }
}
@keyframes dsh-splash-glow {
  0%   { opacity: 0; transform: scale(.9); }
  30%  { opacity: .16; }
  100% { opacity: .09; transform: scale(1.06); }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-splash__frame { animation: none; }
  .dsh-splash__glow { animation: none; opacity: .12; }
}
`;
    var DOCK_CSS = `
.dsh-splash-dock-host {
  position: fixed;
  inset: 0;
  z-index: 2147483001;
  pointer-events: none;
}
.dsh-splash-dock {
  position: fixed;
  top: 48px;
  right: 18px;
  left: auto;
  bottom: auto;
  z-index: 2147483001;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
  pointer-events: none;
}
.dsh-splash-dock__button {
  pointer-events: auto;
  width: auto;
  height: 28px;
  padding: 0 10px 0 8px;
  border-radius: 999px;
  border: 1px solid var(--dock-accent, rgba(255, 255, 255, .18));
  background: rgba(22, 24, 30, .72);
  color: #f4efe4;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: inherit;
  font-size: 11px;
  letter-spacing: .04em;
  cursor: pointer;
  opacity: .55;
  transition: opacity .2s, transform .2s;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 18px rgba(0, 0, 0, .22);
}
.dsh-splash-dock__button:hover { opacity: 1; transform: translateY(-1px); }
.dsh-splash-dock__button svg { display: block; flex: none; }
.dsh-splash-dock__button-text { white-space: nowrap; }
.dsh-splash-dock__panel {
  position: absolute;
  right: 0;
  left: auto;
  top: 40px;
  bottom: auto;
  width: 280px;
  max-height: min(70vh, 560px);
  overflow: auto;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, .12);
  background: rgba(22, 24, 30, .94);
  color: #f3efe6;
  box-shadow: 0 18px 50px rgba(0, 0, 0, .4);
  pointer-events: auto;
  backdrop-filter: blur(12px);
}
.dsh-splash-dock__panel[hidden] { display: none; }
.dsh-splash-dock__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.dsh-splash-dock__title { font-size: 13px; font-weight: 600; letter-spacing: .02em; }
.dsh-splash-dock__close {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: rgba(243, 239, 230, .6);
  font: inherit;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}
.dsh-splash-dock__close:hover { background: rgba(255, 255, 255, .08); color: #f3efe6; }
.dsh-splash-dock__list { display: flex; flex-direction: column; gap: 3px; }
.dsh-splash-dock__preset {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 8px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}
.dsh-splash-dock__preset:hover { background: rgba(255, 255, 255, .07); }
.dsh-splash-dock__preset[data-selected="true"] {
  border-color: var(--dock-accent);
  background: rgba(255, 255, 255, .08);
}
.dsh-splash-dock__swatches { display: flex; gap: 3px; margin-left: auto; }
.dsh-splash-dock__swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, .2);
}
.dsh-splash-dock__label {
  margin: 12px 0 6px;
  color: rgba(243, 239, 230, .52);
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.dsh-splash-dock__durations { display: flex; gap: 6px; }
.dsh-splash-dock__duration {
  flex: 1;
  padding: 6px 4px;
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 7px;
  background: transparent;
  color: rgba(243, 239, 230, .72);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.dsh-splash-dock__duration:hover { background: rgba(255, 255, 255, .06); }
.dsh-splash-dock__duration[data-selected="true"] {
  border-color: var(--dock-accent);
  color: var(--dock-accent);
}
.dsh-splash-dock__preview {
  width: 100%;
  margin-top: 10px;
  padding: 8px 10px;
  border: 0;
  border-radius: 8px;
  background: var(--dock-accent);
  color: #fff;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dsh-splash-dock__preview:hover { filter: brightness(1.08); }
.dsh-splash-dock__note {
  margin-top: 8px;
  color: rgba(243, 239, 230, .45);
  font-size: 10px;
  line-height: 1.5;
}
.dsh-splash-dock__reset {
  margin-top: 6px;
  border: 0;
  background: transparent;
  color: rgba(243, 239, 230, .55);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  text-decoration: underline;
}
`;

    var FALLBACK = {
      "stage.plugins": "正在载入插件 {n}/{total}",
      "stage.pluginsUnknown": "正在载入插件",
      "stage.connecting": "正在连接 Harness",
      "stage.services": "正在恢复工作区与会话",
      "stage.paint": "正在准备界面",
      "stage.ready": "启动完成",
      "stage.stalled": "启动仍在继续",
      "progress.label": "启动进度",
      "skip": "跳过",
      "theme.button": "开屏主题",
      "theme.shortButton": "主题",
      "theme.title": "开屏主题",
      "theme.palette": "色板",
      "theme.intro": "停留时长",
      "theme.short": "短 3.8s",
      "theme.normal": "标准 7.2s",
      "theme.long": "长 10s",
      "theme.preview": "预览开屏",
      "theme.reset": "恢复默认",
      "theme.note": "主题保存在本地，下次启动生效"
    };

    var DICT = {
      zh: {
        "stage.plugins": "正在载入插件 {n}/{total}",
        "stage.pluginsUnknown": "正在载入插件",
        "stage.connecting": "正在连接 Harness",
        "stage.services": "正在恢复工作区与会话",
        "stage.paint": "正在准备界面",
        "stage.ready": "启动完成",
        "stage.stalled": "启动仍在继续",
        "progress.label": "启动进度",
        "skip": "跳过",
        "theme.button": "开屏主题",
      "theme.shortButton": "主题",
        "theme.title": "开屏主题",
        "theme.palette": "色板",
        "theme.intro": "停留时长",
        "theme.short": "短 3.8s",
        "theme.normal": "标准 7.2s",
        "theme.long": "长 10s",
        "theme.preview": "预览开屏",
        "theme.reset": "恢复默认",
        "theme.note": "主题保存在本地，下次启动生效"
      },
      en: {
        "stage.plugins": "Loading plugins {n}/{total}",
        "stage.pluginsUnknown": "Loading plugins",
        "stage.connecting": "Connecting to Harness",
        "stage.services": "Restoring workspaces and sessions",
        "stage.paint": "Preparing the interface",
        "stage.ready": "Ready",
        "stage.stalled": "Startup is still running",
        "progress.label": "Startup progress",
        "skip": "Skip",
        "theme.button": "Splash theme",
        "theme.shortButton": "Theme",
        "theme.title": "Splash theme",
        "theme.palette": "Palette",
        "theme.intro": "Intro length",
        "theme.short": "Short 3.8s",
        "theme.normal": "Normal 7.2s",
        "theme.long": "Long 10s",
        "theme.preview": "Preview splash",
        "theme.reset": "Reset",
        "theme.note": "Saved locally; applies on the next launch"
      }
    };

    /** Read dev overrides and the stored theme without making them part of the product surface. */
    function readOptions() {
      var stored = readSettings();
      var options = {
        minVisibleMs: stored.introMs,
        paletteId: stored.paletteId,
        palette: getPalette(stored.paletteId) || PALETTES[0],
        progressMode: stored.progressMode,
        force: false,
        disabled: false,
        debug: false
      };
      try {
        var injected = window.__DSH_SPLASH__;
        if (injected && typeof injected === "object") {
          if (typeof injected.minVisibleMs === "number") options.minVisibleMs = Math.max(0, injected.minVisibleMs);
          if (typeof injected.palette === "string" && getPalette(injected.palette) !== null) options.paletteId = injected.palette;
          if (typeof injected.paletteId === "string" && getPalette(injected.paletteId) !== null) options.paletteId = injected.paletteId;
          if (injected.progress === "real" || injected.progress === "cinematic") options.progressMode = injected.progress;
          if (injected.progressMode === "real" || injected.progressMode === "cinematic") options.progressMode = injected.progressMode;
          if (injected.force === true) options.force = true;
          if (injected.disabled === true) options.disabled = true;
          if (injected.debug === true) options.debug = true;
        }
        var search = new URLSearchParams(window.location.search);
        var flag = search.get("dsh-splash");
        if (flag === "off") options.disabled = true;
        if (flag === "force") options.force = true;
        var rawMin = search.get("dsh-splash-min");
        if (rawMin !== null && rawMin.trim() !== "") {
          var min = Number(rawMin);
          if (Number.isFinite(min) && min >= 0) options.minVisibleMs = min;
        }
        var queryPalette = search.get("dsh-splash-palette");
        if (queryPalette !== null && getPalette(queryPalette) !== null) options.paletteId = queryPalette;
        var queryProgress = search.get("dsh-splash-progress");
        if (queryProgress === "real" || queryProgress === "cinematic") options.progressMode = queryProgress;
      } catch (error) {
        /* A hostile page environment simply keeps the defaults. */
      }
      options.palette = getPalette(options.paletteId) || PALETTES[0];
      try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          options.minVisibleMs = Math.min(options.minVisibleMs, 1500);
        }
      } catch (error) {
        /* reduced-motion detection is best effort */
      }
      return options;
    }

    function safeGet(ctx, name) {
      try {
        return ctx.get(name);
      } catch (error) {
        return undefined;
      }
    }

    function now() {
      return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
    }

    /** Mount/read a stylesheet owned by this plugin. */
    function installStyle() {
      var existing = document.querySelector("style[" + STYLE_ATTR + "=" + JSON.stringify(STYLE_ID) + "]");
      if (existing !== null) return existing;
      var style = document.createElement("style");
      style.setAttribute("data-plugin", MODULE_ID);
      style.setAttribute(STYLE_ATTR, STYLE_ID);
      style.textContent = CSS + THEME_CSS + paletteCss();
      document.head.appendChild(style);
      return style;
    }

    /** Mount/read the persistent theme-dock stylesheet (kept apart from the splash). */
    function installDockStyle() {
      var id = "dsh-splash/dock.css";
      var existing = document.querySelector("style[" + STYLE_ATTR + "=" + JSON.stringify(id) + "]");
      if (existing !== null) return existing;
      var style = document.createElement("style");
      style.setAttribute("data-plugin", MODULE_ID);
      style.setAttribute(STYLE_ATTR, id);
      style.textContent = DOCK_CSS;
      document.head.appendChild(style);
      return style;
    }

    /**
     * The imperative splash surface. It owns its DOM, so it can be attached to
     * `document.body` during boot and re-parented into the shell overlay seat
     * later without re-rendering anything.
     */
    function createSplash(ctx, options, locale) {
      var bootPage = document.querySelector("[data-dsh-boot]");
      if (bootPage === null && options.force !== true) return null;
      if (document.body === null) return null;

      var style = installStyle();
      var settings = readSettings();
      var palette = options.palette || getPalette(options.paletteId) || getPalette(settings.paletteId) || PALETTES[0];
      var progressMode = options.progressMode === "real" ? "real" : "cinematic";
      var startedAt = now();
      var leaving = false;
      var leaveScheduled = false;
      var finished = false;
      var displayed = 0;
      var lastFrame = 0;
      var rafId = 0;
      var leaveTimer = 0;
      var hardStopTimer = 0;
      var pollTimer = 0;
      var connectionUnsub = null;
      var servicesUnsub = [];
      var pageLoadBound = false;
      var seat = null;
      var mountedAt = 0;
      var connectionMissingAt = 0;
      var servicesMissingAt = 0;
      var skipTimer = 0;
      var skipListener = null;

      var state = {
        pageDone: document.readyState === "complete",
        bootDone: false,
        bootActive: 0,
        bootTotal: 0,
        connectionReady: false,
        servicesReady: false,
        paintDone: false
      };

      /* ---------------- DOM ---------------- */

      var root = document.createElement("div");
      root.className = "dsh-splash";
      root.dataset.dshSplash = "";
      root.dataset.state = "entering";
      root.dataset.palette = palette.id;
      root.style.setProperty("--dsh-splash-intro", String(Math.max(1000, options.minVisibleMs)) + "ms");
      root.setAttribute("aria-hidden", "false");

      var frame = document.createElement("div");
      frame.className = "dsh-splash__frame";

      var canvas = document.createElement("canvas");
      canvas.className = "dsh-splash__ocean";
      canvas.setAttribute("aria-hidden", "true");

      var penrose = document.createElement("div");
      penrose.className = "dsh-splash__penrose";
      penrose.setAttribute("aria-hidden", "true");
      penrose.innerHTML =
        '<svg width="180" height="180" viewBox="-6 -2 100 100" fill="none">' +
        '<g class="dsh-splash__spin" stroke="' + palette.brand + '" stroke-width="1.2" stroke-linejoin="round">' +
        '<polygon class="dsh-splash__pf1" points="0,68 69,68 64,60 14,60 48,0 38,0"/>' +
        '<polygon class="dsh-splash__pf2" points="0,68 4,76 84,76 48,17 43.5,23.5 69,68"/>' +
        '<polygon class="dsh-splash__pf3" points="84,76 88,68 48,0 14,60 23,60 48,17"/>' +
        "</g></svg>";
      var spinGroup = penrose.querySelector(".dsh-splash__spin");

      frame.append(canvas, penrose);

      var hero = document.createElement("div");
      hero.className = "dsh-splash__hero";
      var glow = document.createElement("div");
      glow.className = "dsh-splash__glow";
      hero.append(glow, frame);

      var brand = document.createElement("div");
      brand.className = "dsh-splash__brand";

      var bar = document.createElement("div");
      bar.className = "dsh-splash__bar";
      bar.setAttribute("role", "progressbar");
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", "100");
      bar.setAttribute("aria-valuenow", "0");
      bar.setAttribute("aria-label", translate("progress.label"));

      var fill = document.createElement("span");
      fill.className = "dsh-splash__fill";
      bar.appendChild(fill);

      var pct = document.createElement("div");
      pct.className = "dsh-splash__pct";
      pct.textContent = "0%";

      var stage = document.createElement("div");
      stage.className = "dsh-splash__stage";
      stage.setAttribute("aria-live", "polite");

      brand.append(bar, pct, stage);

      var skip = document.createElement("button");
      skip.type = "button";
      skip.className = "dsh-splash__skip";
      skip.hidden = true;
      skip.textContent = translate("skip");

      root.append(hero, brand, skip);
      document.body.appendChild(root);

      /* ---------------- labels ---------------- */

      var lastStageKey = "";
      var lastStageText = "";
      var lastPercent = -1;

      function translate(key, params) {
        if (locale && locale.t) {
          try {
            var text = locale.t(key, params);
            if (typeof text === "string" && text !== "") return text;
          } catch (error) {
            /* fall through to the built-in dictionary */
          }
        }
        var template = FALLBACK[key] || key;
        if (params) {
          return template.replace(/\{(\w+)\}/g, function (match, name) {
            return params[name] === undefined ? match : String(params[name]);
          });
        }
        return template;
      }

      /* ---------------- real milestone sources ---------------- */

      function readBoot() {
        var total = 0;
        var active = 0;
        var modules = safeGet(ctx, "modules");
        try {
          var manifest = modules && modules.manifest;
          if (manifest && Array.isArray(manifest.plugins)) total = manifest.plugins.length;
        } catch (error) {
          total = 0;
        }
        try {
          var entries = ctx.loader && typeof ctx.loader.entries === "function" ? ctx.loader.entries() : [];
          if (total === 0) total = entries.length;
          for (var index = 0; index < entries.length; index += 1) {
            var fiber = entries[index] && entries[index].fiber;
            if (fiber && fiber.state === 2) active += 1;
          }
        } catch (error) {
          /* Keep the last known counts. */
        }
        if (total <= 0) total = 0;
        if (active > total && total > 0) active = total;
        return { active: active, total: total };
      }

      function pollBoot() {
        var snapshot = readBoot();
        state.bootActive = snapshot.active;
        state.bootTotal = snapshot.total;
        if (!state.bootDone && document.querySelector("[data-dsh-boot]") === null) {
          /* The kernel removed the boot page; adoption sets this too, but a
             boot-page disappearance without a seat must still finish cleanly. */
          state.bootDone = true;
        }
      }

      function bindPageLoad() {
        if (state.pageDone || pageLoadBound) return;
        pageLoadBound = true;
        window.addEventListener("load", onLoad, { once: true });
      }

      function onLoad() {
        state.pageDone = true;
        pageLoadBound = false;
      }

      function readConnection() {
        var connection = safeGet(ctx, "connection");
        if (!connection || !connection.state || typeof connection.state.getSnapshot !== "function") return false;
        var value = connection.state.getSnapshot();
        state.connectionReady = value === "connected";
        if (connectionUnsub === null && typeof connection.state.subscribe === "function") {
          connectionUnsub = connection.state.subscribe(readConnection);
        }
        return true;
      }

      function pollConnection() {
        if (state.connectionReady) return;
        if (readConnection()) {
          connectionMissingAt = 0;
          return;
        }
        if (mountedAt !== 0 && connectionMissingAt === 0) connectionMissingAt = now();
        /* A composition without the connection service is not "connecting";
           complete the phase by absence after a short grace period. */
        if (connectionMissingAt !== 0 && now() - connectionMissingAt > 4000) state.connectionReady = true;
      }

      function readServices() {
        var workspaces = safeGet(ctx, "workspaces");
        var sessions = safeGet(ctx, "sessions");
        if (!workspaces || !workspaces.list || !sessions || !sessions.list) return false;
        var read = function () {
          var workspacePhase = workspaces.list.getSnapshot() && workspaces.list.getSnapshot().phase;
          var sessionPhase = sessions.list.getSnapshot() && sessions.list.getSnapshot().phase;
          state.servicesReady = workspacePhase === "ready" && sessionPhase === "ready";
        };
        read();
        if (servicesUnsub.length === 0) {
          if (typeof workspaces.list.subscribe === "function") servicesUnsub.push(workspaces.list.subscribe(read));
          if (typeof sessions.list.subscribe === "function") servicesUnsub.push(sessions.list.subscribe(read));
        }
        return true;
      }

      function pollServices() {
        if (state.servicesReady) return;
        if (readServices()) {
          servicesMissingAt = 0;
          return;
        }
        if (mountedAt !== 0 && servicesMissingAt === 0) servicesMissingAt = now();
        if (servicesMissingAt !== 0 && now() - servicesMissingAt > 4000) state.servicesReady = true;
      }

      function markPaint() {
        var done = function () {
          state.paintDone = true;
        };
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            if (document.fonts && typeof document.fonts.ready === "object" && typeof document.fonts.ready.then === "function") {
              var cap = new Promise(function (resolve) {
                window.setTimeout(resolve, 800);
              });
              Promise.race([document.fonts.ready, cap]).then(done, done);
            } else {
              done();
            }
          });
        });
      }

      /* ---------------- progress model ---------------- */

      function bootFraction() {
        if (state.bootDone) return 1;
        if (state.bootTotal <= 0) return 0;
        return Math.max(0, Math.min(1, state.bootActive / state.bootTotal));
      }

      function realTargetValue() {
        var value = 0;
        if (state.pageDone) value += WEIGHT.page;
        value += WEIGHT.boot * bootFraction();
        if (state.connectionReady) value += WEIGHT.connection;
        if (state.servicesReady) value += WEIGHT.services;
        if (state.paintDone) value += WEIGHT.paint;
        return Math.max(0, Math.min(100, value));
      }

      /**
       * Cinematic pacing: the bar follows the intro timeline (ease-out) but is
       * clamped by real readiness. It can never claim a milestone the app has
       * not reached; it only reaches 100 when both the intro and the app finish.
       */
      function timelineValue() {
        var duration = Math.max(1000, options.minVisibleMs);
        var progress = Math.min(1, Math.max(0, (now() - startedAt) / duration));
        return (1 - Math.pow(1 - progress, 2)) * 100;
      }

      function targetValue() {
        var real = realTargetValue();
        if (progressMode === "real") return real;
        return Math.min(real, timelineValue());
      }

      function stageOf(target) {
        var real = realTargetValue();
        if (target >= 100) return { key: "ready" };
        if (real >= 100) return { key: "entering" };
        if (!state.bootDone) {
          return { key: state.bootTotal > 0 ? "plugins" : "pluginsUnknown", n: state.bootActive, total: state.bootTotal };
        }
        if (!state.connectionReady) return { key: "connecting" };
        if (!state.servicesReady) return { key: "services" };
        return { key: "paint" };
      }

      function render(target) {
        var percent = Math.round(displayed);
        if (percent !== lastPercent) {
          lastPercent = percent;
          pct.textContent = percent + "%";
          fill.style.width = Math.max(0, Math.min(100, displayed)).toFixed(2) + "%";
          bar.setAttribute("aria-valuenow", String(percent));
        }
        var info = stageOf(target);
        if (info.key !== lastStageKey) {
          lastStageKey = info.key;
          var text = translate("stage." + info.key, info);
          lastStageText = text;
          stage.textContent = text;
        } else if (info.key === "plugins" && stage.textContent !== translate("stage.plugins", info)) {
          /* The count changes inside the same stage; update without re-announcing. */
          stage.textContent = translate("stage.plugins", info);
        }
        root.dataset.bootActive = String(state.bootActive);
        root.dataset.bootTotal = String(state.bootTotal);
        root.dataset.phase = info.key;
      }

      function scheduleLeave() {
        if (leaving || leaveScheduled || finished) return;
        if (targetValue() < 100) return;
        var wait = Math.max(0, startedAt + options.minVisibleMs - now());
        leaveScheduled = true;
        leaveTimer = window.setTimeout(function () {
          leaveScheduled = false;
          beginLeave();
        }, wait);
      }

      function beginLeave() {
        if (finished) return;
        leaving = true;
        leaveScheduled = false;
        if (leaveTimer !== 0) {
          window.clearTimeout(leaveTimer);
          leaveTimer = 0;
        }
        if (skipTimer !== 0) {
          window.clearTimeout(skipTimer);
          skipTimer = 0;
        }
        skip.hidden = true;
        root.dataset.state = "leaving";
        root.setAttribute("aria-hidden", "true");
        leaveTimer = window.setTimeout(finish, FADE_MS + 40);
      }

      function requestSkip() {
        if (finished || leaving) return;
        beginLeave();
      }

      function finish() {
        if (finished) return;
        finished = true;
        cleanup();
        if (root.parentNode !== null) root.parentNode.removeChild(root);
        if (seat !== null) seat.style.display = "none";
        if (style.parentNode !== null) style.parentNode.removeChild(style);
      }

      function cleanup() {
        if (rafId !== 0) cancelAnimationFrame(rafId);
        rafId = 0;
        if (pollTimer !== 0) window.clearInterval(pollTimer);
        pollTimer = 0;
        if (leaveTimer !== 0) window.clearTimeout(leaveTimer);
        leaveTimer = 0;
        if (skipTimer !== 0) window.clearTimeout(skipTimer);
        skipTimer = 0;
        if (skipListener !== null) {
          window.removeEventListener("keydown", skipListener);
          skipListener = null;
        }
        if (hardStopTimer !== 0) window.clearTimeout(hardStopTimer);
        hardStopTimer = 0;
        if (connectionUnsub !== null) {
          try { connectionUnsub(); } catch (error) { /* disposed */ }
          connectionUnsub = null;
        }
        for (var index = 0; index < servicesUnsub.length; index += 1) {
          try { servicesUnsub[index](); } catch (error) { /* disposed */ }
        }
        servicesUnsub = [];
        if (pageLoadBound) {
          window.removeEventListener("load", onLoad);
          pageLoadBound = false;
        }
        if (ocean) ocean.dispose();
      }

      /* ---------------- ocean + frame loop ---------------- */

      var ocean = createOcean(canvas, palette);
      var reducedMotion = false;
      try {
        reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch (error) {
        reducedMotion = false;
      }

      function frameLoop(timestamp) {
        if (finished) return;
        rafId = requestAnimationFrame(frameLoop);
        var delta = lastFrame === 0 ? 16 : Math.min(64, timestamp - lastFrame);
        lastFrame = timestamp;
        var target = targetValue();
        var factor = 1 - Math.exp(-delta / 110);
        displayed += (target - displayed) * factor;
        if (Math.abs(target - displayed) < 0.05) displayed = target;
        render(target);
        ocean.draw(reducedMotion ? 0 : (timestamp - startedAt) / 1000);
        scheduleLeave();
      }

      /* ---------------- lifecycle ---------------- */

      bindPageLoad();
      pollBoot();
      pollConnection();
      pollServices();
      pollTimer = window.setInterval(function () {
        pollBoot();
        pollConnection();
        pollServices();
        if (!state.bootDone && mountedAt === 0 && now() - startedAt > HARD_STOP_MS) {
          state.bootDone = true;
        }
      }, POLL_MS);

      hardStopTimer = window.setTimeout(function () {
        if (finished) return;
        if (targetValue() < 100) {
          lastStageKey = "stalled";
          stage.textContent = translate("stage.stalled");
        }
        beginLeave();
      }, HARD_STOP_MS);

      skip.addEventListener("click", requestSkip);
      skipListener = function (event) {
        if (event.key === "Escape") requestSkip();
      };
      window.addEventListener("keydown", skipListener);
      skipTimer = window.setTimeout(function () {
        skipTimer = 0;
        if (!finished && !leaving) skip.hidden = false;
      }, 800);

      rafId = requestAnimationFrame(frameLoop);

      if (options.preview === true) {
        /* A preview rides on an already-mounted app: there is no boot page and
           no shell.overlay seat to adopt, so complete those phases explicitly. */
        state.pageDone = true;
        state.bootDone = true;
        state.bootActive = state.bootTotal;
        markPaint();
      }

      if (options.debug) {
        console.info("[dsh-splash] cold boot detected; milestones: loader entries, connection, workspace/session, first paint");
      }

      return {
        root: root,
        /** Move the already-running surface into the shell overlay seat. */
        adopt: function (host) {
          if (finished || host === null) return;
          if (seat === host && root.parentNode === host) return;
          seat = host;
          seat.style.display = "";
          host.appendChild(root);
          mountedAt = now();
          /* The frame has mounted: the document is interactive and all roster
             entries settled, so page loading is done for startup purposes even
             if a late subresource keeps `load` from firing. */
          state.pageDone = true;
          state.bootDone = true;
          state.bootActive = state.bootTotal;
          readConnection();
          readServices();
          markPaint();
        },
        /** React may remount its seat; the DOM stays in the last seat until then. */
        release: function (host) {
          if (finished) return;
          if (seat === host && root.parentNode === host && host.parentNode === null) {
            /* The seat itself is gone; put the surface back on the body. */
            document.body.appendChild(root);
            seat = null;
          }
        },
        /** Live palette switch from the theme dock, even during the intro. */
        applyPalette: function (next) {
          if (finished || !next) return;
          palette = next;
          root.dataset.palette = next.id;
          if (spinGroup !== null) spinGroup.setAttribute("stroke", next.brand);
          if (ocean !== null && typeof ocean.setPalette === "function") ocean.setPalette(next.ocean);
        },
        /** Switch between cinematic pacing and the raw real-progress mode. */
        setProgressMode: function (mode) {
          if (finished) return;
          progressMode = mode === "real" ? "real" : "cinematic";
        },
        destroy: finish,
        isFinished: function () {
          return finished;
        }
      };
    }

    /**
     * The diamond ocean inside the circle. Kept structurally identical to the
     * prototype: a double sine wave displaces an isometric point grid and each
     * diamond is filled by its average height, then stroked with the palette's
     * grid colour. DPR-aware and resize-aware.
     */
    function createOcean(canvas, palette) {
      var context = canvas.getContext("2d");
      if (context === null) {
        return { draw: function () {}, dispose: function () {} };
      }
      var TW = 34;
      var TH = 19;
      var width = 1;
      var height = 1;
      var cols = 1;
      var rows = 1;
      var points = [];
      var ratio = 1;
      var disposed = false;
      var observer = null;

      var ocean = palette && palette.ocean ? palette.ocean : PALETTES[0].ocean;
      var tileLow = ocean.low;
      var tileHigh = ocean.high;
      var grid = ocean.grid;

      function setPalette(next) {
        ocean = next || PALETTES[0].ocean;
        tileLow = ocean.low;
        tileHigh = ocean.high;
        grid = ocean.grid;
      }

      function resize() {
        if (disposed) return;
        ratio = Math.min(window.devicePixelRatio || 1, 2);
        var rect = canvas.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        cols = Math.ceil(width / (TW * 2)) + 4;
        rows = Math.ceil(height / (TH * 2)) + 5;
        points = [];
        for (var i = 0; i <= rows; i += 1) {
          var row = [];
          for (var j = 0; j <= cols; j += 1) row.push({ x: 0, y: 0, h: 0 });
          points.push(row);
        }
      }

      function wave(i, j, t) {
        return Math.sin(i * 0.5 + t * 1.15) * 7 + Math.sin(j * 0.42 - t * 0.9 + 1.7) * 6;
      }

      function iso(i, j) {
        return { x: (j - i) * TW, y: (j + i) * TH };
      }

      function draw(t) {
        if (disposed) return;
        context.clearRect(0, 0, width, height);
        var cx = width / 2 - ((cols - rows) / 2) * TW;
        var cy = height * 0.35;
        var i;
        var j;
        for (i = 0; i <= rows; i += 1) {
          for (j = 0; j <= cols; j += 1) {
            var p = iso(i, j);
            var h = wave(i, j, t);
            var point = points[i][j];
            point.x = cx + p.x;
            point.y = cy + p.y - h;
            point.h = h;
          }
        }
        for (i = 0; i < rows; i += 1) {
          for (j = 0; j < cols; j += 1) {
            var nw = points[i][j];
            var ne = points[i][j + 1];
            var se = points[i + 1][j + 1];
            var sw = points[i + 1][j];
            var average = (nw.h + ne.h + se.h + sw.h) / 4;
            var norm = Math.max(0, Math.min(1, (average + 13) / 26));
            var r = tileLow[0] + (tileHigh[0] - tileLow[0]) * norm;
            var g = tileLow[1] + (tileHigh[1] - tileLow[1]) * norm;
            var b = tileLow[2] + (tileHigh[2] - tileLow[2]) * norm;
            context.fillStyle = "rgba(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + "," + (0.42 + norm * 0.28).toFixed(2) + ")";
            context.beginPath();
            context.moveTo(nw.x, nw.y);
            context.lineTo(ne.x, ne.y);
            context.lineTo(se.x, se.y);
            context.lineTo(sw.x, sw.y);
            context.closePath();
            context.fill();
            context.strokeStyle = "rgba(" + grid[0] + "," + grid[1] + "," + grid[2] + ",0.26)";
            context.lineWidth = 1;
            context.stroke();
          }
        }
      }

      resize();
      if (typeof ResizeObserver === "function") {
        observer = new ResizeObserver(resize);
        observer.observe(canvas);
      } else {
        window.addEventListener("resize", resize);
      }

      return {
        draw: draw,
        setPalette: setPalette,
        dispose: function () {
          disposed = true;
          if (observer !== null) observer.disconnect();
          else window.removeEventListener("resize", resize);
        }
      };
    }

    /* ------------------------------------------------------------------ *
     * Cordis client plugin
     * ------------------------------------------------------------------ */

    var inject = ["slots", "locale"];

    /** The one live surface for this page. */
    var controller = null;

    /**
     * The `shell.overlay` seat. It renders one empty positioned box; the
     * controller owns the children, so adopting the pre-mount surface is a
     * re-parent rather than a second render.
     */
    function SplashSeat() {
      var hostRef = React.useRef(null);
      React.useLayoutEffect(function () {
        var host = hostRef.current;
        if (host !== null && controller !== null) controller.adopt(host);
        return function () {
          if (controller !== null) controller.release(host);
        };
      }, []);
      return h("div", { className: "dsh-splash__seat", ref: hostRef });
    }

    /** Register the locale dictionary and bind a translator for this namespace. */
    function createLocale(ctx) {
      var disposed = false;
      if (ctx.locale && typeof ctx.locale.register === "function") {
        try {
          var off = ctx.locale.register(NS, DICT);
          if (typeof off === "function") {
            ctx.effect(function () {
              return off;
            }, "dsh-splash: locale dictionary");
          }
        } catch (error) {
          /* The built-in fallback still renders. */
        }
      }
      var bound = null;
      try {
        if (ctx.locale && typeof ctx.locale.bind === "function") bound = ctx.locale.bind(NS);
      } catch (error) {
        bound = null;
      }
      return {
        t: typeof bound === "function" ? function (key, params) { return bound(key, params); } : null,
        dispose: function () {
          if (!disposed) disposed = true;
        }
      };
    }

    /** The currently running theme preview, if any. */
    var previewController = null;

    function getLocaleLang(ctx) {
      try {
        var snapshot = ctx.locale && ctx.locale.getSnapshot ? ctx.locale.getSnapshot() : null;
        if (snapshot && snapshot.active === "en") return "en";
      } catch (error) {
        /* fall through to zh */
      }
      return "zh";
    }

    function dockTranslate(locale, key) {
      if (locale && locale.t) {
        try {
          var text = locale.t(key);
          if (typeof text === "string" && text !== "") return text;
        } catch (error) {
          /* fall through to the built-in dictionary */
        }
      }
      return FALLBACK[key] || key;
    }

    function paletteLabel(palette, lang) {
      return palette.name && palette.name[lang] ? palette.name[lang] : palette.id;
    }

    /** Play a short preview of a palette on top of the running app. */
    function previewSplash(ctx, locale, palette, introMs, progressMode) {
      if (previewController !== null) {
        previewController.destroy();
        previewController = null;
      }
      var controller = createSplash(ctx, {
        force: true,
        preview: true,
        minVisibleMs: Math.min(Math.max(introMs || 3200, 1800), 4000),
        paletteId: palette.id,
        palette: palette,
        progressMode: progressMode === "real" ? "real" : "cinematic"
      }, locale);
      if (controller === null) return;
      previewController = controller;
      var guard = window.setInterval(function () {
        if (controller.isFinished()) {
          window.clearInterval(guard);
          if (previewController === controller) previewController = null;
        }
      }, 500);
    }

    /**
     * The persistent theme dock. It is imperative DOM inside a React seat so the
     * splash controller can keep owning its own DOM and the dock can survive
     * splash fade-out without another render pass.
     */
    function mountThemeDock(host, ctx, locale) {
      var style = installDockStyle();
      var settings = readSettings();
      var lang = getLocaleLang(ctx);
      var root = document.createElement("div");
      root.className = "dsh-splash-dock";

      var button = document.createElement("button");
      button.type = "button";
      button.className = "dsh-splash-dock__button";
      button.title = dockTranslate(locale, "theme.button");
      button.setAttribute("aria-label", button.title);
      button.setAttribute("aria-expanded", "false");
      button.innerHTML =
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 3a9 9 0 1 0 0 18h1.6a2.4 2.4 0 0 0 0-4.8H12a3.2 3.2 0 0 1 0-6.4h4.6A4.4 4.4 0 0 0 21 5.4 2.4 2.4 0 0 0 18.6 3H12Z"/>' +
        '<circle cx="7.5" cy="10" r="1"/><circle cx="10" cy="6.5" r="1"/><circle cx="14.5" cy="6.5" r="1"/>' +
        "</svg>";
      var buttonText = document.createElement("span");
      buttonText.className = "dsh-splash-dock__button-text";
      buttonText.textContent = dockTranslate(locale, "theme.shortButton");
      button.append(buttonText);

      var panel = document.createElement("div");
      panel.className = "dsh-splash-dock__panel";
      panel.hidden = true;

      var head = document.createElement("div");
      head.className = "dsh-splash-dock__head";
      var title = document.createElement("div");
      title.className = "dsh-splash-dock__title";
      title.textContent = dockTranslate(locale, "theme.title");
      var close = document.createElement("button");
      close.type = "button";
      close.className = "dsh-splash-dock__close";
      close.textContent = "×";
      close.title = "Close";
      close.setAttribute("aria-label", "Close");
      head.append(title, close);

      var paletteLabelNode = document.createElement("div");
      paletteLabelNode.className = "dsh-splash-dock__label";
      paletteLabelNode.textContent = dockTranslate(locale, "theme.palette");

      var list = document.createElement("div");
      list.className = "dsh-splash-dock__list";

      var introLabel = document.createElement("div");
      introLabel.className = "dsh-splash-dock__label";
      introLabel.textContent = dockTranslate(locale, "theme.intro");

      var durations = document.createElement("div");
      durations.className = "dsh-splash-dock__durations";

      var progressLabel = document.createElement("div");
      progressLabel.className = "dsh-splash-dock__label";
      progressLabel.textContent = dockTranslate(locale, "theme.progress");

      var progresses = document.createElement("div");
      progresses.className = "dsh-splash-dock__durations";

      var preview = document.createElement("button");
      preview.type = "button";
      preview.className = "dsh-splash-dock__preview";
      preview.textContent = dockTranslate(locale, "theme.preview");

      var note = document.createElement("div");
      note.className = "dsh-splash-dock__note";
      note.textContent = dockTranslate(locale, "theme.note");

      var reset = document.createElement("button");
      reset.type = "button";
      reset.className = "dsh-splash-dock__reset";
      reset.textContent = dockTranslate(locale, "theme.reset");

      panel.append(head, paletteLabelNode, list, introLabel, durations, progressLabel, progresses, preview, note, reset);
      root.append(button, panel);
      host.appendChild(root);

      function applyLive(next) {
        if (controller !== null && !controller.isFinished()) controller.applyPalette(next);
        if (previewController !== null && !previewController.isFinished()) previewController.applyPalette(next);
      }

      function applyProgressLive(mode) {
        if (controller !== null && !controller.isFinished()) controller.setProgressMode(mode);
        if (previewController !== null && !previewController.isFinished()) previewController.setProgressMode(mode);
      }

      function render() {
        var current = getPalette(settings.paletteId) || PALETTES[0];
        root.style.setProperty("--dock-accent", current.brand);
        list.textContent = "";
        PALETTES.forEach(function (palette) {
          var row = document.createElement("button");
          row.type = "button";
          row.className = "dsh-splash-dock__preset";
          row.dataset.palette = palette.id;
          row.dataset.selected = String(palette.id === settings.paletteId);
          var name = document.createElement("span");
          name.textContent = paletteLabel(palette, lang);
          var swatches = document.createElement("span");
          swatches.className = "dsh-splash-dock__swatches";
          [palette.bg, palette.brand, palette.pf.light, palette.pf.dark].forEach(function (color) {
            var swatch = document.createElement("span");
            swatch.className = "dsh-splash-dock__swatch";
            swatch.style.background = color;
            swatches.appendChild(swatch);
          });
          row.append(name, swatches);
          row.addEventListener("click", function () {
            settings.paletteId = palette.id;
            writeSettings(settings);
            render();
            applyLive(palette);
          });
          list.appendChild(row);
        });
        durations.textContent = "";
        INTRO_CHOICES.forEach(function (ms) {
          var key = ms === 3800 ? "theme.short" : ms === 10000 ? "theme.long" : "theme.normal";
          var option = document.createElement("button");
          option.type = "button";
          option.className = "dsh-splash-dock__duration";
          option.dataset.selected = String(settings.introMs === ms);
          option.textContent = dockTranslate(locale, key);
          option.addEventListener("click", function () {
            settings.introMs = clampIntro(ms);
            writeSettings(settings);
            render();
          });
          durations.appendChild(option);
        });
        progresses.textContent = "";
        [["cinematic", "theme.cinematic"], ["real", "theme.real"]].forEach(function (entry) {
          var mode = entry[0];
          var option = document.createElement("button");
          option.type = "button";
          option.className = "dsh-splash-dock__duration";
          option.dataset.selected = String(settings.progressMode === mode);
          option.textContent = dockTranslate(locale, entry[1]);
          option.addEventListener("click", function () {
            settings.progressMode = mode;
            writeSettings(settings);
            render();
            applyProgressLive(mode);
          });
          progresses.appendChild(option);
        });
      }

      function setOpen(open) {
        panel.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
      }

      function onDocClick(event) {
        if (panel.hidden) return;
        if (event.target instanceof Node && root.contains(event.target)) return;
        setOpen(false);
      }

      function onKey(event) {
        if (event.key === "Escape" && !panel.hidden) setOpen(false);
      }

      button.addEventListener("click", function () {
        setOpen(panel.hidden);
      });
      close.addEventListener("click", function () {
        setOpen(false);
      });
      preview.addEventListener("click", function () {
        var current = getPalette(settings.paletteId) || PALETTES[0];
        setOpen(false);
        if (controller !== null && !controller.isFinished()) {
          /* While the intro is on screen, "preview" means apply the selection
             live instead of stacking a second splash on top of it. */
          controller.applyPalette(current);
          controller.setProgressMode(settings.progressMode);
          return;
        }
        previewSplash(ctx, locale, current, settings.introMs, settings.progressMode);
      });
      reset.addEventListener("click", function () {
        settings = { paletteId: "swamp", introMs: DEFAULT_MIN_VISIBLE_MS, progressMode: "cinematic" };
        writeSettings(settings);
        render();
        applyLive(getPalette("swamp") || PALETTES[0]);
        applyProgressLive("cinematic");
      });
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKey);
      render();

      return function dispose() {
        document.removeEventListener("click", onDocClick);
        document.removeEventListener("keydown", onKey);
        if (root.parentNode !== null) root.parentNode.removeChild(root);
        if (style.parentNode !== null) style.parentNode.removeChild(style);
      };
    }

    function apply(ctx) {
      if (controller !== null) {
        controller.destroy();
        controller = null;
      }
      var options = readOptions();
      if (options.disabled) return;
      var locale = createLocale(ctx);

      function ThemeDock() {
        var hostRef = React.useRef(null);
        React.useLayoutEffect(function () {
          var host = hostRef.current;
          if (host === null) return undefined;
          return mountThemeDock(host, ctx, locale);
        }, []);
        return h("div", { className: "dsh-splash-dock-host", ref: hostRef });
      }

      ctx.effect(function () {
        var dispose = ctx.slots.inject("shell.overlay", function () {
          return ctx.slots.register({
            name: "shell.overlay",
            id: "dsh-splash-theme",
            order: 999,
            label: function () { return dockTranslate(locale, "theme.button"); }
          }, ThemeDock);
        });
        return function () {
          if (typeof dispose === "function") dispose();
        };
      }, "dsh-splash: theme dock");

      var splash = createSplash(ctx, options, locale);
      if (splash !== null) {
        controller = splash;
        ctx.effect(function () {
          var dispose = ctx.slots.inject("shell.overlay", function () {
            return ctx.slots.register({
              name: "shell.overlay",
              id: "dsh-splash",
              order: 1000,
              label: function () { return "DSH Splash"; }
            }, SplashSeat);
          });
          return function () {
            if (typeof dispose === "function") dispose();
          };
        }, "dsh-splash: shell.overlay seat");
      }

      ctx.effect(function () {
        return function () {
          locale.dispose();
          if (previewController !== null) {
            previewController.destroy();
            previewController = null;
          }
          if (controller === splash) controller = null;
          if (splash !== null) splash.destroy();
        };
      }, "dsh-splash: lifecycle");
    }

    var name = "dsh-splash";

    exports.name = name;
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
