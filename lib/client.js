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
    /** Range the theme dock's intro slider exposes (milliseconds). */
    var INTRO_MIN_MS = 1000;
    var INTRO_MAX_MS = 12000;
    /** Later launches on the same day get this instead of the full ceremony. */
    var RETURNING_INTRO_MS = 2200;
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
        name: { zh: "丁香之绽（默认）", en: "Lilac Bloom (default)" },
        bg: "#e8e3cf", frame: "#efe9d8", brand: "#8f5f94", text: "#6f4674", muted: "#9a7f9b",
        barTrack: "rgba(143, 95, 148, .16)", shadow: "rgba(143, 95, 148, .25)",
        pf: { light: "#f1a2aa", mid: "#d4869b", dark: "#8f5f94" },
        ocean: { low: [212, 180, 195], high: [248, 244, 238], grid: [143, 95, 148] }
      },
      {
        id: "island-blue",
        name: { zh: "碧空如洗", en: "Clear Sky" },
        bg: "#f4f9ff", frame: "#ffffff", brand: "#3d7fc4", text: "#1f3a5c", muted: "#6d8bab",
        barTrack: "rgba(61, 127, 196, .16)", shadow: "rgba(36, 85, 140, .18)",
        pf: { light: "#a8cff0", mid: "#5b9bd5", dark: "#24558c" },
        ocean: { low: [207, 228, 247], high: [255, 255, 255], grid: [61, 127, 196] }
      },
      {
        id: "island-green",
        name: { zh: "芽头新绿", en: "New Sprout" },
        bg: "#f0f9f0", frame: "#ffffff", brand: "#4a9e4a", text: "#1a3d1a", muted: "#5a8060",
        barTrack: "rgba(74, 158, 74, .16)", shadow: "rgba(45, 107, 45, .18)",
        pf: { light: "#a8d8a8", mid: "#6bb06b", dark: "#2d6b2d" },
        ocean: { low: [212, 237, 212], high: [255, 255, 255], grid: [74, 158, 74] }
      },
      {
        id: "island-amber",
        name: { zh: "落日熔金", en: "Molten Sunset" },
        bg: "#fff8f0", frame: "#ffffff", brand: "#c89a20", text: "#5c3310", muted: "#9a7550",
        barTrack: "rgba(217, 140, 58, .18)", shadow: "rgba(181, 101, 29, .20)",
        pf: { light: "#fde8a8", mid: "#ebc34a", dark: "#c89a20" },
        ocean: { low: [245, 224, 196], high: [255, 253, 248], grid: [217, 140, 58] }
      },
      {
        id: "island-purple",
        name: { zh: "薰衣旧梦", en: "Lavender Reverie" },
        bg: "#f6f2fb", frame: "#ffffff", brand: "#8b6bc0", text: "#3a2560", muted: "#7a6898",
        barTrack: "rgba(139, 107, 192, .16)", shadow: "rgba(107, 74, 158, .20)",
        pf: { light: "#c8b5e4", mid: "#a085cc", dark: "#6b4a9e" },
        ocean: { low: [224, 212, 240], high: [255, 255, 255], grid: [139, 107, 192] }
      },
      {
        id: "island-night",
        name: { zh: "白露未晞", en: "Dew Before Dawn" },
        bg: "#0b0f18", frame: "#151b28", brand: "#6b95c8", text: "#c8d4e8", muted: "#6e8098",
        barTrack: "rgba(107, 149, 200, .18)", shadow: "rgba(0, 0, 0, .55)",
        pf: { light: "#9fbce0", mid: "#5a82b0", dark: "#282b56" },
        ocean: { low: [30, 42, 61], high: [45, 63, 88], grid: [107, 149, 200] }
      },
      {
        id: "warm-gold",
        name: { zh: "荷塘晓色", en: "Lotus Dawn" },
        bg: "#faf1e2", frame: "#fdf0dc", brand: "#60cbc5", text: "#3a6060", muted: "#8aa8a8",
        barTrack: "rgba(96, 203, 197, .16)", shadow: "rgba(120, 180, 180, .20)",
        pf: { light: "#f8e0e4", mid: "#f8a8b8", dark: "#60cbc5" },
        ocean: { low: [180, 220, 215], high: [255, 248, 245], grid: [96, 203, 197] }
      },
      {
        id: "teal-frame",
        name: { zh: "青绿山水", en: "Blue-Green Landscape" },
        bg: "#eef5ee", frame: "#e3f1ea", brand: "#247089", text: "#183e66", muted: "#6e8a94",
        barTrack: "rgba(36, 112, 137, .16)", shadow: "rgba(24, 62, 102, .20)",
        pf: { light: "#88ecb9", mid: "#2e909d", dark: "#183e66" },
        ocean: { low: [159, 216, 208], high: [240, 250, 245], grid: [36, 112, 137] }
      },
      {
        id: "sunset",
        name: { zh: "陶土记忆", en: "Terracotta Memory" },
        bg: "#fff1e6", frame: "#ffe7d4", brand: "#b05040", text: "#7f4439", muted: "#a88a7a",
        barTrack: "rgba(189, 100, 79, .16)", shadow: "rgba(127, 68, 57, .20)",
        pf: { light: "#f0b8a0", mid: "#b05040", dark: "#6b3a2e" },
        ocean: { low: [242, 183, 155], high: [255, 246, 236], grid: [189, 100, 79] }
      },
      {
        id: "dark-room",
        name: { zh: "月下幽紫", en: "Moonlit Violet" },
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
      return Math.min(INTRO_MAX_MS, Math.max(INTRO_MIN_MS, Math.round(value)));
    }

    /** 7200 -> "7.2", 12000 -> "12": drop the decimal when it carries nothing. */
    function formatIntro(ms) {
      var seconds = ms / 1000;
      return seconds === Math.round(seconds) ? String(seconds) : seconds.toFixed(1);
    }

    function readSettings() {
      var settings = {
        paletteId: "swamp",
        introMs: DEFAULT_MIN_VISIBLE_MS,
        progressMode: "cinematic",
        dailyOnce: true,
        mark: true,
        lastLaunchDate: ""
      };
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
          if (parsed && typeof parsed.lastLaunchDate === "string") {
            settings.lastLaunchDate = parsed.lastLaunchDate;
          }
          if (parsed && typeof parsed.dailyOnce === "boolean") {
            settings.dailyOnce = parsed.dailyOnce;
          }
          if (parsed && typeof parsed.mark === "boolean") {
            settings.mark = parsed.mark;
          }
        }
      } catch (error) {
        /* localStorage can be unavailable in a hardened page; use defaults. */
      }
      return settings;
    }

    /** Local calendar day, not UTC: "today" should mean the user's today. */
    function todayStamp() {
      var now = new Date();
      return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    }

    /**
     * Claim the full intro for the first launch of the day. Returns false when
     * the ceremony already played today, so later launches can go short.
     */
    function claimFirstLaunchToday(settings) {
      var today = todayStamp();
      if (settings.lastLaunchDate === today) return false;
      settings.lastLaunchDate = today;
      writeSettings(settings);
      return true;
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
          '.dsh-splash[data-palette="' + id + '"] .dsh-splash__pf3 { animation-name:dsh-splash-pf3-' + id + '; }',
          /* The resident mark takes its palette through inline custom properties
             (see applyColors), so only the brand stroke needs a stylesheet
             fallback here. */
          '.dsh-mark[data-palette="' + id + '"] { --dsh-mark-brand:' + palette.brand + '; }'
        ].join("\n");
      }).join("\n");
    }


    /** Seconds per revolution of the mark. The three face-lighting keyframes
        share this duration so the light keeps pace with the rotation. */
    var SPIN_S = 18;
    /** Opacity transition length for the plain exit (no mark to hand over). */
    var FADE_MS = 640;
    /** The exit with a mark to hand over: the triangle flies to its corner and
        the sheet fades underneath it as ONE motion, so a single number drives
        both and they finish together.
        The root's own opacity is not what fades — that would take the triangle
        with it. What fades is every layer that paints the scene: the root's
        background colour, the frame's, the sea and the glow. All of those are
        plain colours or canvases, so they are transitionable; the mark above
        them stays fully opaque for the whole flight. */
    var EXIT_MS = 900;
    /** Beat held on the fully-expanded scene before the last fade. */
    var HOLD_MS = 300;
    /** Never sit on the settled scene longer than this, even if the last
        fraction of a percent is still easing in. */
    var SETTLE_MAX_MS = 900;
    /** Progress at which the bar and labels hand over to the scene. Late enough
        that the count is still readable almost to the end, early enough that
        nothing but the mark and the sea remain at 100. */
    var BRAND_OUT_AT = 92;
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
  background: linear-gradient(180deg, #e8e3cf 0%, #e8e3cf 100%);
  color: #8f5f94;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
  pointer-events: auto;
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  /* The frame ends up exactly window-sized; clip so a sub-pixel rounding error
     never flashes a scrollbar at the very end of the growth. */
  overflow: hidden;
  opacity: 1;
  visibility: visible;
  /* Opacity only. visibility used to ride along in this transition, and a
     discrete property flips at the halfway point of its duration — so the second
     half of every fade happened after the element had already gone invisible.
     The node is removed when the fade ends, which makes the flag redundant. */
  transition: opacity ${FADE_MS}ms cubic-bezier(.4, 0, .2, 1);
  will-change: opacity;
}
.dsh-splash[data-state="leaving"] {
  opacity: 0;
  /* Still on screen for the length of the fade, so it must stop swallowing
     clicks the moment the exit begins. */
  pointer-events: none;
}
/* Natural finish with a resident mark to hand over to: the triangle flies to its
   corner while the sheet fades under it, both on EXIT_MS. The root's opacity is
   left alone on purpose — the triangle is inside it, so fading the root would
   dissolve the very thing that is supposed to be flying. Only the painting
   layers fade: the root's background colour, the frame's, the sea and the glow.
   They are stacked, so they have to share one duration and one curve, otherwise
   the last one to finish would still be opaque when the node is removed. */
.dsh-splash[data-state="flying"] {
  pointer-events: none;
  background-color: transparent;
  transition: background-color ${EXIT_MS}ms cubic-bezier(.4, 0, .2, 1);
}
.dsh-splash[data-state="flying"] .dsh-splash__frame {
  background-color: transparent;
  box-shadow: none;
  transition: background-color ${EXIT_MS}ms cubic-bezier(.4, 0, .2, 1),
              box-shadow ${EXIT_MS}ms cubic-bezier(.4, 0, .2, 1);
}
.dsh-splash[data-state="flying"] .dsh-splash__ocean {
  opacity: 0;
  transition: opacity ${EXIT_MS}ms cubic-bezier(.4, 0, .2, 1);
}
/* The glow owns its opacity through a running keyframe animation, so dropping
   the animation hands the property back and the transition takes it from the
   value it was at. */
.dsh-splash[data-state="flying"] .dsh-splash__glow {
  animation: none;
  /* Pinned to the value its keyframes finished on, so dropping the animation
     does not snap the glow back a size as it fades. */
  transform: scale(1.06);
  opacity: 0;
  transition: opacity ${EXIT_MS}ms cubic-bezier(.4, 0, .2, 1);
}
/* The frame is a porthole: it widens as the progress bar fills, so at 100% the
   sea covers the window and only the mark is left. Sizing is driven from JS by
   progress, which is why there is no transition on width/height here. */
.dsh-splash__brand[data-out] {
  animation: dsh-splash-brand-out 460ms ease forwards;
}
@keyframes dsh-splash-brand-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
.dsh-splash__frame {
  --dsh-splash-frame-size: min(70vmin, 380px);
  width: var(--dsh-splash-frame-size);
  height: var(--dsh-splash-frame-size);
  aspect-ratio: 1;
  border-radius: calc(var(--dsh-splash-frame-size) / 2);
  overflow: hidden;
  position: relative;
  background: #efe9d8;
  box-shadow: 0 20px 50px rgba(143, 95, 148, .25);
  animation: dsh-splash-emerge 1.6s cubic-bezier(.22, .9, .3, 1) .3s both;
}
/* Painted once at window size and simply clipped by the frame. Sizing the
   canvas to the frame instead would re-lay-out the lattice on every step of the
   growth, and the whole sea would hop a tile sideways each time the grid count
   changed. A window-sized buffer keeps every tile pinned in place. */
.dsh-splash__ocean {
  position: absolute;
  left: 50%;
  top: 50%;
  display: block;
  width: 100vw;
  height: 100vh;
  transform: translate(-50%, -50%);
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
  animation: dsh-splash-spin ${SPIN_S}s linear infinite;
}
.dsh-splash__pf1 { animation: dsh-splash-lit1 ${SPIN_S}s linear infinite; }
.dsh-splash__pf2 { animation: dsh-splash-lit2 ${SPIN_S}s linear infinite; }
.dsh-splash__pf3 { animation: dsh-splash-lit3 ${SPIN_S}s linear infinite; }
/* The readout lives inside the frame and rides its bottom edge, so the numeral
   travels down with the rim as the porthole opens instead of being pushed off
   the window. There is no bar any more, so this is the only progress feedback. */
.dsh-splash__brand {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  opacity: 0;
  pointer-events: none;
  color: var(--dsh-splash-brand);
  animation: dsh-splash-brand-in 1.2s ease 1.5s forwards;
}
.dsh-splash__pct {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 3px;
  color: inherit;
  font-size: 76px;
  font-weight: 600;
  letter-spacing: -.01em;
  line-height: .9;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 26px var(--dsh-splash-bg);
}
.dsh-splash__pct-unit {
  font-size: .26em;
  font-weight: 600;
  opacity: .7;
  transform: translateY(-.42em);
}
.dsh-splash__stage {
  min-height: 15px;
  color: inherit;
  opacity: .62;
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
.dsh-splash__pct,
.dsh-splash__stage { color: inherit; }
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
/* Ten palettes as a wall of cards, not a list. Each card shows what the palette
   actually looks like before it is picked, and the grid costs five rows where
   the list cost ten. */
.dsh-splash-dock__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}
.dsh-splash-dock__preset {
  position: relative;
  display: block;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 9px;
  background: rgba(255, 255, 255, .045);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition: background 200ms ease, border-color 220ms ease,
              transform 220ms cubic-bezier(.22, .61, .36, 1);
}
.dsh-splash-dock__preset:hover {
  background: rgba(255, 255, 255, .085);
  transform: translateY(-1px);
}
/* A white hairline rather than the accent colour: the chosen card's own band
   often *is* that colour, and a purple ring on a purple chip disappears. */
.dsh-splash-dock__preset[data-selected="true"] {
  border-color: rgba(255, 255, 255, .82);
  background: rgba(255, 255, 255, .1);
  box-shadow: 0 0 0 1px var(--dock-accent, #d4869b), 0 3px 14px rgba(0, 0, 0, .34);
}
.dsh-splash-dock__preset:focus-visible {
  outline: 2px solid var(--dock-accent, #d4869b);
  outline-offset: 1px;
}
/* The band is the palette itself: four stops, no label, the way a paint chip
   reads. The inset hairline keeps light palettes from bleeding into the card. */
.dsh-splash-dock__band {
  display: flex;
  height: 42px;
  border-radius: 8px;
  overflow: hidden;
  /* A light hairline, not a dark one: the darkest palettes start on a near-black
     stop that would otherwise merge into the card behind it. */
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .1);
  transition: filter 220ms ease;
}
.dsh-splash-dock__band > span {
  flex: 1 1 0;
}
.dsh-splash-dock__preset:hover .dsh-splash-dock__band { filter: brightness(1.1); }
/* The name rides on the band instead of taking a row of its own: ten of them
   side by side is the whole point, and a caption per card doubled the height
   for text nobody needs once the colours are visible. It surfaces on hover, and
   stays put on the chosen one so the panel always says what is active. */
.dsh-splash-dock__name {
  position: absolute;
  left: 5px;
  bottom: 5px;
  max-width: calc(100% - 10px);
  padding: 2px 6px;
  border-radius: 5px;
  background: rgba(10, 10, 14, .55);
  color: #fff;
  font-size: 10px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transform: translateY(3px);
  transition: opacity 180ms ease, transform 180ms cubic-bezier(.22, .61, .36, 1);
  pointer-events: none;
}
.dsh-splash-dock__preset:hover .dsh-splash-dock__name,
.dsh-splash-dock__preset[data-selected="true"] .dsh-splash-dock__name {
  opacity: 1;
  transform: none;
}
/* The chosen card's band settles with a small overshoot, so the selection reads
   from the colours as well as from the border. */
@keyframes dsh-splash-band-pick {
  0%   { transform: scale(.94); }
  60%  { transform: scale(1.035); }
  100% { transform: scale(1); }
}
.dsh-splash-dock__preset[data-selected="true"] .dsh-splash-dock__band {
  animation: dsh-splash-band-pick 300ms cubic-bezier(.22, .61, .36, 1) backwards;
}
@media (prefers-reduced-motion: reduce) {
  .dsh-splash-dock__preset[data-selected="true"] .dsh-splash-dock__band { animation: none; }
  .dsh-splash-dock__preset:hover { transform: none; }
}
.dsh-splash-dock__label {
  margin: 12px 0 6px;
  color: rgba(243, 239, 230, .52);
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
/* Intro length as a continuous slider. The three presets made "short" and
   "long" mean whatever the author decided; a range lets people land on the
   length they actually want. */
.dsh-splash-dock__slider { padding: 1px 2px 0; }
.dsh-splash-dock__readout {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 3px;
  margin-bottom: 8px;
  color: var(--dock-accent);
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.dsh-splash-dock__readout small {
  font-size: 10px;
  font-weight: 500;
  opacity: .66;
}
.dsh-splash-dock__range {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  width: 100%;
  height: 20px;
  margin: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
}
/* The fill is painted by a gradient whose stop follows --fill, set on input.
   Chromium has no ::-webkit-range-progress, so this is the portable way. */
.dsh-splash-dock__range::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--dock-accent) 0 var(--fill, 50%),
    rgba(255, 255, 255, .14) var(--fill, 50%) 100%
  );
}
.dsh-splash-dock__range::-moz-range-track {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .14);
}
.dsh-splash-dock__range::-moz-range-progress {
  height: 8px;
  border-radius: 999px;
  background: var(--dock-accent);
}
.dsh-splash-dock__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -5px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .38);
}
.dsh-splash-dock__range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .38);
}
.dsh-splash-dock__range:focus-visible { outline: none; }
.dsh-splash-dock__range:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, .3), 0 2px 6px rgba(0, 0, 0, .38);
}
.dsh-splash-dock__ends {
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
  color: rgba(243, 239, 230, .38);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
/* Once-a-day ceremony switch: a bare icon-ish control rather than another
   segmented row, so it reads as a preference about the slider above it. */
.dsh-splash-dock__switchrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 11px;
  color: rgba(243, 239, 230, .72);
  font-size: 11px;
  line-height: 16px;
}
.dsh-splash-dock__switch {
  position: relative;
  flex: none;
  width: 32px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, .16);
  cursor: pointer;
  transition: background .18s ease;
}
.dsh-splash-dock__switch[aria-checked="true"] { background: var(--dock-accent); }
.dsh-splash-dock__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  transition: transform .18s cubic-bezier(.4, 0, .2, 1);
}
.dsh-splash-dock__switch[aria-checked="true"] .dsh-splash-dock__knob { transform: translateX(14px); }
.dsh-splash-dock__switch:focus-visible {
  outline: 2px solid var(--dock-accent);
  outline-offset: 2px;
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
.dsh-splash-dock__update {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  padding: 7px 9px;
  border-radius: 8px;
  background: rgba(255, 255, 255, .055);
  color: rgba(243, 239, 230, .82);
  font-size: 11px;
  line-height: 1.45;
}
.dsh-splash-dock__update[hidden] {
  display: none;
}
.dsh-splash-dock__update-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-splash-dock__update-action {
  flex: none;
  border: 0;
  border-radius: 999px;
  padding: 4px 11px;
  background: var(--dock-accent, #d4869b);
  color: #16161b;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.dsh-splash-dock__update-action:hover {
  filter: brightness(1.08);
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
.dsh-splash-theme-action-host {
  display: inline-flex;
  align-items: center;
}
.dsh-splash-theme-action {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: .68;
  transition: opacity .2s, background .2s, color .2s, border-color .2s;
}
.dsh-splash-theme-action:hover,
.dsh-splash-theme-action:focus-visible {
  opacity: 1;
  color: var(--dsh-theme-accent, inherit);
  background: rgba(127, 127, 127, .16);
  border-color: var(--dsh-theme-accent, transparent);
}
.dsh-splash-theme-action:focus-visible {
  outline: 2px solid var(--dsh-theme-accent, currentColor);
  outline-offset: 2px;
}
.dsh-splash-theme-action svg { display: block; }
.dsh-splash-theme-action .dsh-theme-spin {
  transform-box: view-box;
  transform-origin: 44px 48px;
  /* One constant rate. Changing animation-duration on hover looks like a
     speed-up, but the browser recomputes progress from the same elapsed time,
     so the icon snaps to a new angle the moment the pointer arrives. */
  animation: dsh-splash-theme-spin 14s linear infinite;
}.dsh-theme-pf1 { fill: currentColor; fill-opacity: .14; }
.dsh-theme-pf2 { fill: currentColor; fill-opacity: .28; }
.dsh-theme-pf3 { fill: currentColor; fill-opacity: .06; }
@keyframes dsh-splash-theme-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .dsh-splash-theme-action .dsh-theme-spin { animation: none; }
}
.dsh-splash-theme-panel {
  position: fixed;
  z-index: 2147483002;
  left: auto;
  right: auto;
  top: auto;
  bottom: auto;
}
`;

    var FALLBACK = {
      "stage.plugins": "正在载入插件 {n}/{total}",
      "stage.pluginsUnknown": "正在载入插件",
      "stage.connecting": "正在连接 Harness",
      "stage.services": "正在恢复工作区与会话",
      "stage.paint": "正在准备界面",
      "stage.ready": "启动完成",
      "stage.entering": "正在进入",
      "stage.stalled": "启动仍在继续",
      "progress.label": "启动进度",
      "skip": "跳过",
      "theme.button": "开屏主题",
      "theme.shortButton": "主题",
      "theme.title": "开屏主题",
      "theme.palette": "色板",
      "theme.intro": "停留时长",
      "theme.introUnit": "秒",
      "theme.dailyOnce": "每天只播一次完整版",
      "theme.mark": "开屏后留在界面",
      "theme.preview": "预览开屏",
      "theme.reset": "恢复默认",
      "theme.note": "色板/节奏实时生效；停留时长下次启动生效"
    };

    var DICT = {
      zh: {
        "stage.plugins": "正在载入插件 {n}/{total}",
        "stage.pluginsUnknown": "正在载入插件",
        "stage.connecting": "正在连接 Harness",
        "stage.services": "正在恢复工作区与会话",
        "stage.paint": "正在准备界面",
        "stage.ready": "启动完成",
      "stage.entering": "正在进入",
        "stage.stalled": "启动仍在继续",
        "progress.label": "启动进度",
        "skip": "跳过",
        "theme.button": "开屏主题",
      "theme.shortButton": "主题",
        "theme.title": "开屏主题",
        "theme.palette": "色板",
        "theme.intro": "停留时长",
        "theme.introUnit": "秒",
        "theme.dailyOnce": "每天只播一次完整版",
        "theme.mark": "开屏后留在界面",
        "theme.preview": "预览开屏",
        "theme.reset": "恢复默认",
        "theme.note": "色板/节奏实时生效；停留时长下次启动生效",
        "update.checking": "正在检查更新",
        "update.uptodate": "已是最新",
        "update.available": "有新版",
        "update.action": "更新",
        "update.running": "正在更新",
        "update.done": "已更新，重启 DSH 生效",
        "update.failed": "更新失败",
        "update.retry": "重试",
        "update.local": "本地开发版",
        "update.managed": "由桌面端管理"
      },
      en: {
        "stage.plugins": "Loading plugins {n}/{total}",
        "stage.pluginsUnknown": "Loading plugins",
        "stage.connecting": "Connecting to Harness",
        "stage.services": "Restoring workspaces and sessions",
        "stage.paint": "Preparing the interface",
        "stage.ready": "Ready",
        "stage.entering": "Entering",
        "stage.stalled": "Startup is still running",
        "progress.label": "Startup progress",
        "skip": "Skip",
        "theme.button": "Splash theme",
        "theme.shortButton": "Theme",
        "theme.title": "Splash theme",
        "theme.palette": "Palette",
        "theme.intro": "Intro length",
        "theme.introUnit": "s",
        "theme.dailyOnce": "Full intro once a day",
        "theme.mark": "Keep the mark on screen",
        "theme.preview": "Preview splash",
        "theme.reset": "Reset",
        "theme.note": "Palette/pacing apply live; intro length applies on the next launch",
        "update.checking": "Checking for updates",
        "update.uptodate": "Up to date",
        "update.available": "Update available",
        "update.action": "Update",
        "update.running": "Updating",
        "update.done": "Updated — restart DSH",
        "update.failed": "Update failed",
        "update.retry": "Retry",
        "update.local": "Local dev build",
        "update.managed": "Managed by the desktop app"
      }
    };

    /** Read dev overrides and the stored theme without making them part of the product surface. */
    function readOptions() {
      var stored = readSettings();
      /* One full ceremony per day. Later launches the same day get a short
         version, so the ritual never turns into a tax. Dev overrides below
         still win outright — a query flag is a debugging tool, not a habit. */
      var introMs = stored.introMs;
      if (stored.dailyOnce && !claimFirstLaunchToday(stored)) {
        introMs = Math.min(introMs, RETURNING_INTRO_MS);
      }
      var options = {
        minVisibleMs: introMs,
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
      /** True when the mark actually flew to its corner, not just faded out. */
      var arrived = false;
      /** Guards the handover: it must happen once, whether it is the flight or
          the plain fade that gets there first. */
      var handedOff = false;
      var leaveScheduled = false;
      var finished = false;
      var displayed = 0;
      /** When the full-bleed scene was reached; the dwell is measured from here. */
      var settledAt = 0;
      var lastFrame = 0;
      var rafId = 0;
      var leaveTimer = 0;
      var hardStopTimer = 0;
      var flyRaf = 0;
      var pollTimer = 0;
      var connectionUnsub = null;
      var servicesUnsub = [];
      var pageLoadBound = false;
      var seat = null;
      var mountedAt = 0;
      var connectionMissingAt = 0;
      var servicesMissingAt = 0;
      var skipListener = null;
      var reduceMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

      var pct = document.createElement("div");
      pct.className = "dsh-splash__pct";
      pct.setAttribute("role", "progressbar");
      pct.setAttribute("aria-valuemin", "0");
      pct.setAttribute("aria-valuemax", "100");
      pct.setAttribute("aria-valuenow", "0");
      pct.setAttribute("aria-label", translate("progress.label"));

      var pctNum = document.createElement("span");
      pctNum.className = "dsh-splash__pct-num";
      pctNum.textContent = "0";

      var pctUnit = document.createElement("span");
      pctUnit.className = "dsh-splash__pct-unit";
      pctUnit.textContent = "%";

      pct.append(pctNum, pctUnit);

      var stage = document.createElement("div");
      stage.className = "dsh-splash__stage";
      stage.setAttribute("aria-live", "polite");

      brand.append(pct, stage);
      /* Inside the frame on purpose: the readout has to ride the bottom rim. */
      frame.appendChild(brand);

      /* No on-screen controls: the splash is meant to read as a single scene,
         and a floating button in the corner breaks it. Keyboard is the only
         escape hatch, see the keydown listener below. */
      root.append(hero);
      document.body.appendChild(root);

      /* ---------------- labels ---------------- */

      var lastStageKey = "";
      var lastStageText = "";
      var lastPercent = -1;

      function translate(key, params) {
        if (locale && locale.t) {
          try {
            var text = locale.t(key, params);
            if (typeof text === "string" && text !== "" && text !== key) return text;
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
          pctNum.textContent = String(percent);
          pct.setAttribute("aria-valuenow", String(percent));
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
          beginLeave(true);
        }, wait);
      }

      function beginLeave(expand) {
        if (finished) return;
        leaving = true;
        leaveScheduled = false;
        if (leaveTimer !== 0) {
          window.clearTimeout(leaveTimer);
          leaveTimer = 0;
        }
        root.setAttribute("aria-hidden", "true");
        if (expand && !reduceMotion) {
          /* The rim grew with the readout, so by 100 the scene is complete.
             Hold it for a beat, then dissolve the whole thing. The dump to 100
             is left to the frame loop: jumping `displayed` here would snap the
             rim the last few percent all at once. */
          root.dataset.state = "settled";
          settledAt = now();
          leaveTimer = window.setTimeout(startFade, SETTLE_MAX_MS);
          return;
        }
        root.dataset.state = "leaving";
        leaveTimer = window.setTimeout(finish, FADE_MS + 40);
      }

      /** Dissolve the settled scene. Split out so both the dwell timer and the
          frame loop can trigger it, whichever comes first. */
      function startFade() {
        if (finished || root.dataset.state === "leaving" || root.dataset.state === "flying") return;
        if (leaveTimer !== 0) {
          window.clearTimeout(leaveTimer);
          leaveTimer = 0;
        }
        /* If a resident mark is waiting for this triangle, do not fade the
           sheet as a whole — the mark would fade with it. Clear the sheet and
           fly the mark out instead. */
        var target = typeof options.markTarget === "function" ? options.markTarget() : null;
        /* .dsh-splash__penrose is an inset:0 flex box; the SVG inside it is the
           thing that actually has a size, so measure and move that. */
        var flyer = penrose.querySelector("svg");
        if (target !== null && !reduceMotion && flyer !== null) {
          root.dataset.state = "flying";
          /* Pin the sheet open before measuring: a frame still a fraction short
             of the window would clip the mark on its way to the corner. */
          frame.style.width = "100vw";
          frame.style.height = "100vh";
          frame.style.borderRadius = "0";
          var from = flyer.getBoundingClientRect();
          if (from.width < 1) {
            flyer = null;
          } else {
            /* The splash draws the mark at 180px with a hairline outline; at
               46px that line would vanish, so its weight grows as it shrinks. */
            if (spinGroup !== null) {
              spinGroup.style.transition = "stroke-width " + EXIT_MS + "ms ease";
              spinGroup.style.strokeWidth = "6";
            }
            flyer.style.transformOrigin = "50% 50%";
            /* Re-aim every frame instead of committing to one transform up
               front. The destination is measured live, so any drift while the
               sheet settles — a scrollbar appearing, the composer re-laying
               out — bends the path slightly instead of leaving a gap that
               snaps shut at handover. */
            var flyStart = 0;
            var flyFrom = from;

            /**
             * Place the flyer, then measure where it actually landed and correct
             * the offset in the same frame.
             *
             * Pure arithmetic is not trustworthy here: the SVG's transform-origin
             * resolves against its view-box, and the view-box origin is negative
             * (-6 -2), so "50% 50%" is not necessarily the box centre the maths
             * assumes. Instead of reasoning about it, read the result back — two
             * style writes and one rect per frame for half a second is cheap, and
             * it converges whatever the browser decides the origin is.
             */
            function placeFlyer(moveX, moveY, scale, wantX, wantY) {
              var css = function (extraX, extraY) {
                return "translate(" + (moveX + extraX).toFixed(2) + "px," + (moveY + extraY).toFixed(2) +
                  "px) scale(" + scale.toFixed(4) + ")";
              };
              flyer.style.transform = css(0, 0);
              var box = flyer.getBoundingClientRect();
              var fixX = wantX - (box.left + box.width / 2);
              var fixY = wantY - (box.top + box.height / 2);
              if (Math.abs(fixX) > 0.1 || Math.abs(fixY) > 0.1) {
                flyer.style.transform = css(fixX, fixY);
              }
            }

            var now = target;
            function flyFrame(timestamp) {
              if (finished) return;
              if (flyStart === 0) flyStart = timestamp;
              var progress = Math.min(1, (timestamp - flyStart) / EXIT_MS);
              var eased = 1 - Math.pow(1 - progress, 3);
              var fresh = typeof options.markTarget === "function" ? options.markTarget() : null;
              if (fresh !== null) now = fresh;
              var ratio = now.width / flyFrom.width;
              var fromX = flyFrom.left + flyFrom.width / 2;
              var fromY = flyFrom.top + flyFrom.height / 2;
              var moveX = ((now.left + now.width / 2) - fromX) * eased;
              var moveY = ((now.top + now.height / 2) - fromY) * eased;
              /* The frame's intended centre is the lerp, not the destination:
                 correcting toward the destination would jump there on frame 1. */
              placeFlyer(moveX, moveY, 1 + (ratio - 1) * eased, fromX + moveX, fromY + moveY);
              if (progress < 1) {
                flyRaf = requestAnimationFrame(flyFrame);
                return;
              }
              arrived = true;
              /* The triangle has landed and the sheet has finished fading beside
                 it, so nothing opaque is left: the node can go as soon as the
                 resident mark has taken the seat. A short hold covers the last
                 frame of the transition rather than cutting into it. */
              flyer.style.visibility = "hidden";
              handOff();
              finish(60);
            }
            flyRaf = requestAnimationFrame(flyFrame);
            return;
          }
        }
        root.dataset.state = "leaving";
        leaveTimer = window.setTimeout(finish, FADE_MS + 40);
      }

      function requestSkip() {
        if (finished || leaving) return;
        beginLeave(false);
      }

      /**
       * The splash's current rotation, in degrees.
       *
       * The spin is a CSS animation, so the browser owns the angle; the resident
       * mark accumulates its own. Reading the animated matrix at handover is the
       * only way to make the two agree — otherwise the mark starts at 0deg and
       * the triangle appears to rewind the moment it lands.
       */
      function readSpinAngle() {
        if (spinGroup === null || typeof window.getComputedStyle !== "function") return 0;
        var raw = "";
        try {
          raw = window.getComputedStyle(spinGroup).transform || "";
        } catch (error) {
          return 0;
        }
        var matched = /^matrix\(([^)]+)\)$/.exec(raw);
        if (matched === null) return 0;
        var parts = matched[1].split(",");
        if (parts.length < 2) return 0;
        var a = parseFloat(parts[0]);
        var b = parseFloat(parts[1]);
        if (!isFinite(a) || !isFinite(b)) return 0;
        var deg = (Math.atan2(b, a) * 180) / Math.PI;
        return deg < 0 ? deg + 360 : deg;
      }

      /** Reveal the resident mark exactly once. The flight hands over the moment
          the triangle lands: waiting for the dissolve to finish would leave the
          corner empty for most of a second. */
      function handOff() {
        if (handedOff) return;
        handedOff = true;
        /* Read the angle while the CSS animation still runs. */
        var handoffAngle = readSpinAngle();
        if (typeof options.onArrive === "function") {
          try { options.onArrive(arrived, handoffAngle); } catch (error) { /* the mark is optional */ }
        }
      }

      function finish(holdSheetMs) {
        if (finished) return;
        finished = true;
        handOff();
        cleanup();
        var teardown = function () {
          if (root.parentNode !== null) root.parentNode.removeChild(root);
          if (seat !== null) seat.style.display = "none";
          if (style.parentNode !== null) style.parentNode.removeChild(style);
        };
        var hold = typeof holdSheetMs === "number" && holdSheetMs > 0 ? holdSheetMs : 0;
        if (hold > 0) {
          /* The stylesheet goes with the node, never before it: removing it
             first would drop the transition this wait exists to let finish. */
          window.setTimeout(teardown, hold);
        } else {
          teardown();
        }
      }

      function cleanup() {
        if (rafId !== 0) cancelAnimationFrame(rafId);
        rafId = 0;
        if (pollTimer !== 0) window.clearInterval(pollTimer);
        pollTimer = 0;
        if (leaveTimer !== 0) window.clearTimeout(leaveTimer);
        leaveTimer = 0;
        if (flyRaf !== 0) cancelAnimationFrame(flyRaf);
        flyRaf = 0;
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
      var lastExpandKey = "";

      /**
       * The frame doubles as the progress gauge: it opens from a small porthole
       * to the whole window across 0..100. The easing is slow at the start so
       * the first few percent do not balloon it.
       */
      function applyExpansion() {
        if (reduceMotion) return;
        /* Keep easing while the scene settles; freeze once it is leaving, and
           freeze during the flight so the frame cannot twitch under the mark. */
        if (root.dataset.state === "leaving" || root.dataset.state === "flying") return;
        var t = Math.min(1, Math.max(0, displayed / 100));
        var ease = Math.pow(t, 1.7);
        var viewW = window.innerWidth > 0 ? window.innerWidth : 1280;
        var viewH = window.innerHeight > 0 ? window.innerHeight : 800;
        var base = Math.min(Math.min(viewW, viewH) * 0.7, 380);
        var width = base + (viewW - base) * ease;
        var height = base + (viewH - base) * ease;
        var key = width.toFixed(1) + "x" + height.toFixed(1);
        if (key === lastExpandKey) return;
        lastExpandKey = key;
        frame.style.width = width.toFixed(1) + "px";
        frame.style.height = height.toFixed(1) + "px";
        frame.style.borderRadius = ((base / 2) * (1 - ease)).toFixed(1) + "px";
        /* The mark keeps its size and spins in place: scaling it with the rim
           made it balloon into the corners once the sea went full-bleed. */
        pct.style.fontSize = Math.round(Math.min(168, Math.max(76, width * 0.16))) + "px";
      }

      function applyBrandOut() {
        if (brand.dataset.out === "1") return;
        if (displayed < BRAND_OUT_AT) return;
        brand.dataset.out = "1";
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
        applyExpansion();
        applyBrandOut();
        ocean.draw(reduceMotion ? 0 : (timestamp - startedAt) / 1000);
        scheduleLeave();
        /* Wait for the rim to actually reach the window edge, then honour the
           dwell — a late milestone must not cut the full-bleed scene short. */
        if (root.dataset.state === "settled" && displayed >= 99.5 && now() - settledAt >= HOLD_MS) {
          startFade();
        }
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
        /* Stalled boot is not a finish worth celebrating; leave without expanding. */
        beginLeave(false);
      }, HARD_STOP_MS);

      /* Any key skips. Modifier-only presses and the function keys are ignored:
         bare Shift/Ctrl should not dismiss the splash by accident, and F5/Ctrl+R
         have to stay usable for a reload while the overlay is up. */
      skipListener = function (event) {
        if (event.repeat) return;
        var key = event.key || "";
        if (key === "Shift" || key === "Control" || key === "Alt" || key === "Meta") return;
        if (/^F\d{1,2}$/.test(key)) return;
        /* Chords belong to the app, not to us: Ctrl+R reloads, Ctrl+K opens the
           command palette, Ctrl+Shift+I opens devtools. None of them should be
           read as "dismiss the splash". A bare key still skips, so a stuck
           splash can never trap the user. */
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        requestSkip();
      };
      window.addEventListener("keydown", skipListener);

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
        return { draw: function () {}, dispose: function () {}, setPalette: function () {} };
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
     * The resident mark
     *
     * The splash ends by shrinking its mark into a small resident one beside
     * the composer, where it keeps turning and reports what the agent is doing.
     *
     * The activity comes from DSH itself: the live process header carries
     * `data-process-activity`, and a running turn sets `data-streaming`. Both
     * are semantic attributes the host writes, not text we scrape, so the mark
     * does not care which language the UI is in.
     * ------------------------------------------------------------------ */

    /** Rendered size of the resident mark, and the gutter it sits in. */
    var MARK_SIZE = 46;
    var MARK_GAP = 16;
    var MARK_EDGE = 8;
    /** Inset from the composer's bottom edge when anchoring the mark. */
    var MARK_BOTTOM_GAP = 10;
    /** Below this viewport width there is no gutter left; the mark hides. */
    var MARK_MIN_VIEWPORT = 880;
    /** Flight from the splash to the corner, and the fade that follows it. */
    var MARK_REVEAL_MS = 220;
    /** Transient sparkles on state changes, and the canvas they live on. */
    var MARK_FX_SIZE = 96;
    var MARK_FX_PAD = 25;
    var MARK_STAR_COUNT = 10;
    var MARK_STAR_MS = 760;

    /** Fourteen host activities folded into six working states plus idle. */
    var ACTIVITY_STATE = {
      thinking: "thinking",
      questions: "waiting",
      search: "search",
      webSearch: "search",
      webFetch: "search",
      read: "read",
      readImage: "read",
      commands: "act",
      code: "act",
      tools: "act",
      subagents: "act",
      edit: "edit",
      write: "edit",
      plan: "edit"
    };

    /**
     * Rotation is one constant speed, whatever the state: the mark reports what
     * the agent is doing through colour alone. Speed was per-state for one
     * revision and it read as instability — something that changes pace while
     * you are not touching it looks like it is struggling, not working. The
     * only thing that still moves the rate is the reasoning effort, which the
     * user set on purpose.
     *
     * Driven by a frame loop rather than a CSS animation: changing
     * `animation-duration` mid-flight makes the angle jump, because the browser
     * recomputes progress from the same elapsed time. Accumulating the angle
     * ourselves means a speed change is just a different increment.
     */
    var MARK_SPIN_SECONDS = 18;
    /**
     * Three face tones per working state. Fixed rather than derived from the
     * palette: hue-shifting ten different palettes produced mud (a purple
     * rotated 80° is brown), and a status light has to be readable at a glance
     * no matter which scheme is selected. All tones sit mid-range so they hold
     * up on both a white and a near-black shell. Idle keeps the palette itself,
     * so at rest the mark still belongs to the chosen theme.
     */
    /**
     * State is carried by the white highlight layer, not by recolouring the
     * triangle. The three faces always keep the selected palette's own ramp.
     */
    var MARK_OVERLAY = "#ffffff";

    /**
     * Face lighting, copied from the Geometric Islands avatar. A fixed light
     * sits upper-left; each arm runs through light -> dark -> mid as it turns
     * through that light, with the three original phase offsets. The mark's
     * angle drives these, so changing reasoning effort changes the rotation and
     * the lighting together instead of letting a CSS animation drift.
     */
    var FACE_LIGHTING = [
      [[0, 0], [0.5014, 2], [0.6689, 1], [1, 0]],
      [[0, 1], [0.3311, 0], [0.8325, 2], [1, 1]],
      [[0, 2], [0.1675, 1], [0.4986, 0], [1, 2]]
    ];

    /** Reasoning effort scales the spin: max turns fastest. */
    /**
     * Reasoning effort multiplies the one spin rate. The spread is deliberately
     * wide: at 18s per revolution the old range (0.62-1.45) produced 29s vs 12s,
     * which reads as "the same speed" at 46px. Now it is 36s vs 10.6s.
     */
    var EFFORT_SPEED = { off: 0.5, low: 0.72, high: 1, max: 1.7 };

    var MARK_CSS = `
.dsh-mark {
  position: fixed;
  z-index: 30;
  width: ${MARK_SIZE}px;
  height: ${MARK_SIZE}px;
  opacity: 0;
  overflow: visible;
  pointer-events: none;
  transition: opacity ${MARK_REVEAL_MS}ms ease;
}
.dsh-mark[data-visible="true"] { opacity: 1; }
.dsh-mark svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform-origin: 50% 50%;
  transition: transform 720ms cubic-bezier(.2, .8, .2, 1);
}
/* Rotation is driven frame by frame in JS (see spinFrame), so a speed change is
   a different increment instead of a jump: recomputing a CSS animation-duration
   mid-flight makes the angle snap. */
.dsh-mark__spin {
  transform-box: view-box;
  transform-origin: 44px 48px;
  stroke: var(--dsh-mark-brand, #8f5f94);
  transition: stroke 460ms ease;
  will-change: transform;
}
.dsh-mark__pf1 { fill: var(--dsh-mark-f1, var(--dsh-mark-c1, #f1a2aa)); }
.dsh-mark__pf2 { fill: var(--dsh-mark-f2, var(--dsh-mark-c2, #d4869b)); }
.dsh-mark__pf3 { fill: var(--dsh-mark-f3, var(--dsh-mark-c3, #8f5f94)); }
/* State is carried by white overlays on the triangle, never by recolouring it.
   The dark drop shadow keeps the white readable on the light themes too. */
.dsh-mark__trace,
.dsh-mark__edge-a,
.dsh-mark__edge-b,
.dsh-mark__edge-c,
.dsh-mark__read-edge,
.dsh-mark__outline {
  fill: none;
  stroke: ${MARK_OVERLAY};
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, .55)) drop-shadow(0 0 3px rgba(255, 255, 255, .55));
}
.dsh-mark__trace {
  stroke-width: 3.2;
  stroke-dasharray: 18 82;
}
.dsh-mark__edge-a,
.dsh-mark__edge-b,
.dsh-mark__edge-c { stroke-width: 3.2; }
.dsh-mark__read-edge { stroke-width: 3.0; }
.dsh-mark__outline { stroke-width: 3.2; }
/* A bright segment runs around the perimeter much faster than the triangle
   itself turns. */
.dsh-mark[data-state="thinking"] .dsh-mark__trace {
  opacity: 1;
  animation: dsh-mark-trace 2.4s linear infinite;
}
.dsh-mark[data-state="act"] .dsh-mark__trace {
  opacity: 1;
  animation: dsh-mark-trace 1.2s linear infinite;
}
/* Search lights one whole edge at a time, in sequence. */
.dsh-mark[data-state="search"] .dsh-mark__edge-a {
  animation: dsh-mark-edge 2.4s linear infinite;
  animation-delay: 0s;
}
.dsh-mark[data-state="search"] .dsh-mark__edge-b {
  animation: dsh-mark-edge 2.4s linear infinite;
  animation-delay: .8s;
}
.dsh-mark[data-state="search"] .dsh-mark__edge-c {
  animation: dsh-mark-edge 2.4s linear infinite;
  animation-delay: 1.6s;
}
.dsh-mark[data-state="read"] .dsh-mark__read-edge {
  animation: dsh-mark-read 3.2s ease-in-out infinite;
}
/* Waiting breathes the whole outer edge, not a circular ring. */
.dsh-mark[data-state="waiting"] .dsh-mark__outline {
  animation: dsh-mark-breathe 2.6s ease-in-out infinite;
}
/* Edit turns the whole triangle over and holds it there until the state ends. */
.dsh-mark[data-state="edit"] svg { transform: rotate(180deg); }
/* The burst is transient: it only exists for the few frames after a change. */
.dsh-mark__fx {
  position: absolute;
  left: -${MARK_FX_PAD}px;
  top: -${MARK_FX_PAD}px;
  width: ${MARK_FX_SIZE}px;
  height: ${MARK_FX_SIZE}px;
  z-index: 2;
  pointer-events: none;
}
@keyframes dsh-mark-trace {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -100; }
}
@keyframes dsh-mark-edge {
  0%, 20% { opacity: 0; }
  26%, 46% { opacity: 1; }
  54%, 100% { opacity: 0; }
}
@keyframes dsh-mark-read {
  0%, 100% { opacity: .12; }
  50% { opacity: .9; }
}
@keyframes dsh-mark-breathe {
  0%, 100% { opacity: .12; }
  50% { opacity: .95; }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-mark__trace,
  .dsh-mark__edge-a,
  .dsh-mark__edge-b,
  .dsh-mark__edge-c,
  .dsh-mark__read-edge,
  .dsh-mark__outline { animation: none !important; opacity: 0 !important; }
  .dsh-mark svg { transition: none !important; }
  .dsh-mark[data-state="edit"] svg { transform: none !important; }
}
`;

    var MARK_STYLE_ID = "dsh-splash/mark.css";

    function installMarkStyle() {
      var existing = document.querySelector("style[" + STYLE_ATTR + "=" + JSON.stringify(MARK_STYLE_ID) + "]");
      if (existing !== null) return existing;
      var style = document.createElement("style");
      style.setAttribute("data-plugin", MODULE_ID);
      style.setAttribute(STYLE_ATTR, MARK_STYLE_ID);
      /* paletteCss() carries the per-palette ramp and the light keyframes; the
         splash drops its own copy when the intro ends, so the mark needs one. */
      style.textContent = MARK_CSS + paletteCss();
      document.head.appendChild(style);
      return style;
    }

    /**
     * The left edge of the blank strip between the sidebar and the composer.
     *
     * Three candidates, because none of them is guaranteed: the shell's sidebar
     * column, the conversation column, and a data attribute. A CSS-module class
     * survives rebuilds through its authored local name — only the hash prefix
     * changes — so `[class*="_sidebarCol"]` is a stable hook in a way that a
     * literal `.mP3x-q_sidebarCol` would not be.
     */
    function findGutterLeft(cardLeft) {
      var probes = [
        ['[class*="_sidebarCol"]', "right"],
        ['[class*="_centerCol"]', "left"],
        ["[data-sidebar-chat]", "right"]
      ];
      for (var index = 0; index < probes.length; index += 1) {
        var node = document.querySelector(probes[index][0]);
        if (node === null) continue;
        var rect = node.getBoundingClientRect();
        if (rect.width < 40) continue;
        var edge = probes[index][1] === "right" ? rect.right : rect.left;
        if (edge > 0 && cardLeft - edge >= MARK_SIZE + 16) return edge;
      }
      return null;
    }

    /**
     * The composer card: the nearest ancestor of the editor that has both a
     * real background and a corner radius. Walking up beats guessing a hashed
     * class name, and every candidate is read from computed style, so a theme
     * change cannot break it.
     */
    function findComposerCard() {
      if (typeof window.getComputedStyle !== "function") return null;
      /* Two anchors, because the editor is not always mounted (empty hero page)
         while the model trigger usually is. */
      var anchors = [];
      /* Only the rich-text editor qualifies. A bare <textarea> is not a safe
         fallback: every settings page is full of them (the env-var box is one),
         and latching onto one parks the mark beside a panel it has nothing to do
         with — it then follows that panel's scroll, which reads as a bug. */
      var editor = document.querySelector('[contenteditable="true"]');
      if (editor !== null) anchors.push(editor);
      var trigger =
        document.querySelector('[aria-label*="推理等级"]') ||
        document.querySelector('[aria-label*="reasoning effort"]');
      if (trigger !== null) anchors.push(trigger);
      for (var index = 0; index < anchors.length; index += 1) {
        var node = anchors[index];
        var best = null;
        var firstWidth = 0;
        for (var depth = 0; depth < 8 && node !== null && node !== document.body; depth += 1) {
          var style = window.getComputedStyle(node);
          var radius = parseFloat(style.borderTopLeftRadius);
          var background = style.backgroundColor;
          /* Gradients live in background-image, so a card painted with one has
             a transparent background-color and would otherwise be skipped. */
          /* A composer card can be a fill-only element, or a transparent shell
             whose border and shadow draw the visible edge while an inner layer
             carries the tint. Both count, otherwise the walk stops one level too
             deep and the mark ends up inside the card instead of beside it. */
          var painted =
            (background !== "" && background !== "transparent" && background !== "rgba(0, 0, 0, 0)") ||
            (style.backgroundImage !== "" && style.backgroundImage !== "none") ||
            (parseFloat(style.borderTopWidth) || 0) > 0 ||
            (style.boxShadow !== "" && style.boxShadow !== "none");
          var width = node.getBoundingClientRect().width;
          if (radius >= 8 && painted && width >= 200) {
            /* Keep the outermost match: the composer has inner wrappers with
               their own radius and fill, and anchoring to one of those pushes
               the mark inside the visual card instead of beside it. */
            if (best === null) firstWidth = width;
            if (width <= firstWidth * 2) best = node;
          }
          node = node.parentElement;
        }
        if (best !== null) return best;
      }
      return null;
    }

    /** Which of the five states the host is in right now. */
    /**
     * A process group is live only while its title shimmer is active. Closed
     * historical groups also carry `data-process-activity`, so taking the last
     * one blindly reported a stale tool after it had finished. Tool execution
     * often has no `data-streaming` at all; `data-shimmer` is the reliable
     * "this group is running" marker.
     */
    function liveProcessHeader() {
      var nodes = document.querySelectorAll("[data-process-activity]");
      for (var index = nodes.length - 1; index >= 0; index -= 1) {
        var node = nodes[index];
        var marked = typeof node.getAttribute === "function" && node.getAttribute("data-shimmer") !== null;
        var child = typeof node.querySelector === "function" && node.querySelector("[data-shimmer]") !== null;
        if (marked || child) return node;
      }
      return null;
    }

    function readMarkState() {
      var live = liveProcessHeader();
      if (live !== null) {
        var activity = live.getAttribute("data-process-activity");
        return ACTIVITY_STATE[activity] || "act";
      }
      /* A command block can still be running without a live process group. */
      if (document.querySelector("[data-running]") !== null) return "act";
      /* Reasoning / assistant text: no tool activity is known yet. */
      if (document.querySelector("[data-streaming]") !== null) return "thinking";
      return "idle";
    }

    /** Read the reasoning effort off the model trigger's accessible label. */
    function readMarkEffort() {
      var trigger =
        document.querySelector('[aria-label*="推理等级"]') ||
        document.querySelector('[aria-label*="reasoning effort"]');
      if (trigger === null) return 1;
      var label = trigger.getAttribute("aria-label") || "";
      var match = /推理等级\s*([^\s，,;；]+)/.exec(label) || /reasoning effort\s+([^\s,;]+)/i.exec(label);
      if (match === null) return 1;
      var name = String(match[1]).toLowerCase();
      if (name.indexOf("max") !== -1) return EFFORT_SPEED.max;
      if (name.indexOf("high") !== -1) return EFFORT_SPEED.high;
      if (name.indexOf("low") !== -1) return EFFORT_SPEED.low;
      if (name.indexOf("off") !== -1) return EFFORT_SPEED.off;
      return 1;
    }

    var markController = null;

    /**
     * HMR can leave the old module's mark in the page because the old module
     * never runs its dispose. Remove any uncontrolled mark before mounting the
     * new one; one live page must have exactly one resident triangle.
     */
    function removeStaleMarks() {
      var stale = document.querySelectorAll(".dsh-mark");
      for (var index = 0; index < stale.length; index += 1) {
        if (stale[index].parentNode !== null) stale[index].parentNode.removeChild(stale[index]);
      }
    }

    function createMark(startPalette) {
      installMarkStyle();
      var palette = startPalette;
      var el = document.createElement("div");
      el.className = "dsh-mark";
      el.setAttribute("aria-hidden", "true");
      el.dataset.state = "idle";
      el.dataset.palette = palette.id;
      el.dataset.effort = "1";
      el.innerHTML =
        '<svg viewBox="-6 -2 100 100" fill="none">' +
        '<g class="dsh-mark__spin" stroke-width="2.4" stroke-linejoin="round">' +
        '<polygon class="dsh-mark__pf1" points="0,68 69,68 64,60 14,60 48,0 38,0"/>' +
        '<polygon class="dsh-mark__pf2" points="0,68 4,76 84,76 48,17 43.5,23.5 69,68"/>' +
        '<polygon class="dsh-mark__pf3" points="84,76 88,68 48,0 14,60 23,60 48,17"/>' +
        '<path class="dsh-mark__trace" d="M48 0 L84 76 L4 76 Z" pathLength="100"/>' +
        '<path class="dsh-mark__edge-a" d="M48 0 L84 76"/>' +
        '<path class="dsh-mark__edge-b" d="M84 76 L4 76"/>' +
        '<path class="dsh-mark__edge-c" d="M4 76 L48 0"/>' +
        '<path class="dsh-mark__read-edge" d="M48 0 L84 76"/>' +
        '<path class="dsh-mark__outline" d="M48 0 L84 76 L4 76 Z"/>' +
        "</g>" +
        "</svg>";
      var fxCanvas = null;
      var fx = null;
      try {
        fxCanvas = document.createElement("canvas");
        fxCanvas.className = "dsh-mark__fx";
        el.appendChild(fxCanvas);
        if (typeof fxCanvas.getContext === "function") {
          var dpr = Math.min(2, window.devicePixelRatio || 1);
          fxCanvas.width = MARK_FX_SIZE * dpr;
          fxCanvas.height = MARK_FX_SIZE * dpr;
          fx = fxCanvas.getContext("2d");
          if (fx !== null && typeof fx.scale === "function") fx.scale(dpr, dpr);
        }
      } catch (error) {
        fx = null;
      }
      removeStaleMarks();
      document.body.appendChild(el);

      var spinEl = el.querySelector(".dsh-mark__spin");
      var faceEls = [
        el.querySelector(".dsh-mark__pf1"),
        el.querySelector(".dsh-mark__pf2"),
        el.querySelector(".dsh-mark__pf3")
      ];

      var card = null;
      var state = "idle";
      var effort = 1;
      var colorKey = "";
      var angle = 0;
      var fxStars = [];
      var fxDirty = false;
      var lastFrame = 0;
      var rafId = 0;
      var disposed = false;
      var timer = 0;
      var observer = null;
      var pending = 0;
      var reduceMotion = false;
      try {
        reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches === true;
      } catch (error) {
        reduceMotion = false;
      }

      function place() {
        if (disposed) return;
        if (card === null || !card.isConnected) card = findComposerCard();
        if (card === null || window.innerWidth < MARK_MIN_VIEWPORT) {
          el.style.display = "none";
          return;
        }
        var rect = card.getBoundingClientRect();
        /* A card that has been scrolled out of the viewport is not a place to
           sit: without this the mark would ride along with whatever page is
           currently scrollable. */
        if (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth) {
          el.style.display = "none";
          return;
        }
        var left = rect.left - MARK_GAP - MARK_SIZE;
        /* Centre in the blank strip when there is one. The card is built from
           several nested wrappers and the one that answers to "rounded and
           painted" sits a padding inside the visible edge, so a fixed offset
           from it lands half on the card; centring does not care which wrapper
           was found. */
        var gutterLeft = findGutterLeft(rect.left);
        if (gutterLeft !== null) {
          left = gutterLeft + (rect.left - gutterLeft - MARK_SIZE) / 2;
        }
        el.dataset.anchorLeft = String(Math.round(rect.left));
        el.dataset.gutterLeft = gutterLeft === null ? "" : String(Math.round(gutterLeft));
        if (left < MARK_EDGE || rect.height < 24) {
          el.style.display = "none";
          return;
        }
        el.style.display = "";
        /* Anchor to the bottom edge, not the vertical centre.
           The composer grows upwards when a screenshot is attached or the text
           wraps: its bottom stays put while its centre climbs. Centring made the
           mark slide up on every paste, which reads as the mark moving on its
           own. The bottom edge is the one line that does not move. */
        var top = rect.bottom - MARK_SIZE - MARK_BOTTOM_GAP;
        if (top < rect.top) top = rect.top + (rect.height - MARK_SIZE) / 2;
        el.style.left = Math.round(left) + "px";
        el.style.top = Math.round(top) + "px";
      }

      function hexChannels(color) {
        var value = parseInt(String(color).replace("#", ""), 16);
        if (!isFinite(value)) return [255, 255, 255];
        return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
      }

      function mixHex(from, to, amount) {
        var a = hexChannels(from);
        var b = hexChannels(to);
        return "rgb(" +
          Math.round(a[0] + (b[0] - a[0]) * amount) + "," +
          Math.round(a[1] + (b[1] - a[1]) * amount) + "," +
          Math.round(a[2] + (b[2] - a[2]) * amount) + ")";
      }

      function faceLightColor(stops, phase, tones) {
        var progress = ((phase % 1) + 1) % 1;
        for (var index = 0; index < stops.length - 1; index += 1) {
          var from = stops[index];
          var to = stops[index + 1];
          if (progress >= from[0] && progress <= to[0]) {
            var span = to[0] - from[0];
            var amount = span === 0 ? 0 : (progress - from[0]) / span;
            return mixHex(tones[from[1]], tones[to[1]], amount);
          }
        }
        return tones[stops[0][1]];
      }

      /** Apply the same orientation-driven lighting as the website avatar. */
      function paintLighting() {
        if (faceEls[0] === null || faceEls[1] === null || faceEls[2] === null) return;
        var phase = (((angle % 360) + 360) % 360) / 360;
        var tones = [palette.pf.light, palette.pf.mid, palette.pf.dark];
        for (var index = 0; index < 3; index += 1) {
          el.style.setProperty("--dsh-mark-f" + (index + 1), faceLightColor(FACE_LIGHTING[index], phase, tones));
        }
      }

      /**
       * The palette itself is the only face colour source. State is carried by
       * the white overlays; switching state must never recolour the triangle.
       */
      function applyColors() {
        var key = palette.id;
        if (key === colorKey) return;
        colorKey = key;
        el.style.setProperty("--dsh-mark-c1", palette.pf.light);
        el.style.setProperty("--dsh-mark-c2", palette.pf.mid);
        el.style.setProperty("--dsh-mark-c3", palette.pf.dark);
        el.style.setProperty("--dsh-mark-brand", palette.brand);
        paintLighting();
      }

      function clearStars() {
        fxStars.length = 0;
        fxDirty = false;
        if (fx !== null && typeof fx.clearRect === "function") {
          fx.clearRect(0, 0, MARK_FX_SIZE, MARK_FX_SIZE);
        }
      }

      /**
       * A handful of sparkles in the area around the mark, not a particle
       * shower. They stay put, twinkle once and fade; idle never sparkles.
       */
      function spawnStars() {
        if (fx === null || reduceMotion || state === "idle") return;
        if (typeof fx.clearRect !== "function" || typeof fx.beginPath !== "function") return;
        for (var index = 0; index < MARK_STAR_COUNT; index += 1) {
          var angle = Math.random() * Math.PI * 2;
          var radius = 26 + Math.random() * 16;
          var ttl = MARK_STAR_MS * (0.85 + Math.random() * 0.3);
          fxStars.push({
            x: MARK_FX_SIZE / 2 + Math.cos(angle) * radius,
            y: MARK_FX_SIZE / 2 + Math.sin(angle) * radius,
            rotation: Math.random() * Math.PI,
            phase: Math.random() * Math.PI * 2,
            life: ttl,
            ttl: ttl,
            size: 1.4 + Math.random() * 1.8
          });
        }
        if (fxStars.length > 20) fxStars.splice(0, fxStars.length - 20);
        fxDirty = true;
      }

      function drawStar(x, y, radius, rotation, alpha) {
        fx.save();
        fx.translate(x, y);
        fx.rotate(rotation);
        fx.globalAlpha = alpha * 0.28;
        fx.fillStyle = "rgba(0, 0, 0, .45)";
        fx.beginPath();
        fx.arc(0, 0, radius * 1.8, 0, Math.PI * 2);
        fx.fill();
        fx.globalAlpha = alpha;
        fx.fillStyle = "#fff";
        fx.shadowColor = "rgba(255, 255, 255, .9)";
        fx.shadowBlur = 3;
        fx.beginPath();
        for (var point = 0; point < 8; point += 1) {
          var spoke = point * Math.PI / 4;
          var spokeRadius = point % 2 === 0 ? radius : radius * 0.3;
          var px = Math.cos(spoke) * spokeRadius;
          var py = Math.sin(spoke) * spokeRadius;
          if (point === 0) fx.moveTo(px, py);
          else fx.lineTo(px, py);
        }
        fx.closePath();
        fx.fill();
        fx.restore();
      }

      function stepStars(delta) {
        if (fx === null) return;
        if (fxStars.length === 0) {
          if (fxDirty) {
            fx.clearRect(0, 0, MARK_FX_SIZE, MARK_FX_SIZE);
            fxDirty = false;
          }
          return;
        }
        fx.clearRect(0, 0, MARK_FX_SIZE, MARK_FX_SIZE);
        fxDirty = true;
        for (var index = fxStars.length - 1; index >= 0; index -= 1) {
          var star = fxStars[index];
          star.life -= delta;
          if (star.life <= 0) {
            fxStars.splice(index, 1);
            continue;
          }
          var progress = 1 - star.life / star.ttl;
          var alpha = Math.sin(Math.PI * progress);
          var twinkle = 0.85 + 0.15 * Math.sin(progress * Math.PI * 5 + star.phase);
          drawStar(star.x, star.y, star.size * twinkle, star.rotation + progress * 0.2, alpha);
        }
        fx.globalAlpha = 1;
      }

      function paint() {
        if (disposed) return;
        var next = readMarkState();
        if (next !== state) {
          state = next;
          el.dataset.state = next;
          if (next !== "idle") spawnStars();
        }
        var speed = readMarkEffort();
        if (speed !== effort) {
          effort = speed;
          el.dataset.effort = String(speed);
        }
        applyColors();
      }

      /**
       * Rotation and drift, frame by frame.
       *
       * A CSS animation is the obvious choice and the wrong one here: shortening
       * animation-duration makes the browser recompute progress from the same
       * elapsed time, so the mark snaps to a new angle the instant the speed
       * changes. Accumulating the angle ourselves makes a speed change nothing
       * more than a smaller increment.
       */
      function spinFrame(timestamp) {
        if (disposed) return;
        rafId = requestAnimationFrame(spinFrame);
        /* The composer unmounts when the app switches to a settings page, and
           the slow poll below would leave the mark sitting on top of that page
           for up to 400ms. `isConnected` costs no layout — unlike the rect the
           poll needs — so the liveness check runs every frame. */
        if (card !== null && card.isConnected === false) {
          el.style.display = "none";
          card = null;
        }
        if (document.hidden || el.style.display === "none") {
          clearStars();
          lastFrame = timestamp;
          return;
        }
        var delta = lastFrame === 0 ? 16 : Math.min(64, timestamp - lastFrame);
        lastFrame = timestamp;
        angle = (angle + (360 / MARK_SPIN_SECONDS) * effort * (delta / 1000)) % 360;
        spinEl.style.transform = "rotate(" + angle.toFixed(2) + "deg)";
        paintLighting();
        stepStars(delta);
      }

      function schedule() {
        if (disposed || pending !== 0) return;
        pending = requestAnimationFrame(function () {
          pending = 0;
          paint();
        });
      }

      /* Attributes change in bursts while a turn streams; one paint per frame
         keeps the observer from becoming a busy loop. */
      if (typeof MutationObserver === "function") {
        observer = new MutationObserver(schedule);
        observer.observe(document.body, {
          subtree: true,
          attributes: true,
          attributeFilter: ["data-process-activity", "data-streaming", "data-running", "data-shimmer", "aria-label"]
        });
      }

      applyColors();
      paint();
      place();
      /* Both handles must exist: a host that strips the markup should cost the
         animation, not throw on the first frame. */
      if (!reduceMotion && spinEl !== null && typeof requestAnimationFrame === "function") {
        rafId = requestAnimationFrame(spinFrame);
      }
      /* The composer grows while typing and the card is replaced on session
         switch, so the anchor is re-checked on a slow beat rather than trusted
         forever. */
      timer = window.setInterval(function () {
        place();
        paint();
      }, 400);
      /* Browser timers are numbers; only Node returns a handle. Letting a test
         process exit is worth the one line. */
      if (timer !== null && typeof timer === "object" && typeof timer.unref === "function") timer.unref();
      window.addEventListener("resize", place);

      return {
        setPalette: function (next) {
          if (disposed || !next) return;
          palette = next;
          el.dataset.palette = next.id;
          colorKey = "";
          applyColors();
        },
        /** Where the mark lands, in viewport coordinates; null when hidden. */
        targetRect: function () {
          place();
          if (el.style.display === "none") return null;
          var rect = el.getBoundingClientRect();
          if (rect.width < 1) return null;
          return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        },
        reveal: function (instant, startAngle) {
          if (disposed) return;
          /* Take over the angle the splash handed over: without this the mark
             starts from 0deg and the triangle visibly rewinds the instant it
             lands, which reads as a glitch rather than a landing. */
          if (typeof startAngle === "number" && isFinite(startAngle)) {
            angle = ((startAngle % 360) + 360) % 360;
            if (spinEl !== null) spinEl.style.transform = "rotate(" + angle.toFixed(2) + "deg)";
          }
          if (instant === true) {
            /* Landing: the flying triangle is removed in this same frame, so a
               220ms fade here would leave a visible hole. Swap outright. */
            el.style.transition = "none";
            el.dataset.visible = "true";
            void el.offsetWidth;
            el.style.transition = "";
          } else {
            el.dataset.visible = "true";
          }
        },
        dispose: function () {
          if (disposed) return;
          disposed = true;
          clearStars();
          if (observer !== null) observer.disconnect();
          if (rafId !== 0) cancelAnimationFrame(rafId);
          if (pending !== 0) cancelAnimationFrame(pending);
          if (timer !== 0) window.clearInterval(timer);
          window.removeEventListener("resize", place);
          if (el.parentNode !== null) el.parentNode.removeChild(el);
          var style = document.querySelector("style[" + STYLE_ATTR + "=" + JSON.stringify(MARK_STYLE_ID) + "]");
          if (style !== null && style.parentNode !== null) style.parentNode.removeChild(style);
        }
      };
    }

    function ensureMark(palette) {
      if (markController !== null) {
        if (palette) markController.setPalette(palette);
        return markController;
      }
      markController = createMark(palette || PALETTES[0]);
      return markController;
    }

    function dropMark() {
      if (markController !== null) {
        markController.dispose();
        markController = null;
      }
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
    var previewSerial = 0;
    /** The open/hidden theme panel owned by the conversation header action. */
    var themePanelController = null;

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
          if (typeof text === "string" && text !== "" && text !== key) return text;
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
    function previewSplash(ctx, locale, palette, introMs, progressMode, done) {
      var serial = ++previewSerial;
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
      if (controller === null) {
        if (serial === previewSerial && typeof done === "function") done();
        return;
      }
      previewController = controller;
      var guard = window.setInterval(function () {
        if (controller.isFinished()) {
          window.clearInterval(guard);
          if (previewController === controller) previewController = null;
          if (serial === previewSerial && typeof done === "function") done();
        }
      }, 500);
    }

    /**
     * The theme entry in the conversation header utilities (the app's own
     * navigation bar). The trigger is inline in the slot, so it can never cover
     * the sidebar avatar; the panel is a fixed popover mounted on <body>.
     */
    function mountThemeAction(host, ctx, locale) {
      var style = installDockStyle();
      var settings = readSettings();
      var lang = getLocaleLang(ctx);

      var button = document.createElement("button");
      button.type = "button";
      button.className = "dsh-splash-theme-action";
      button.title = dockTranslate(locale, "theme.button");
      button.setAttribute("aria-label", button.title);
      button.setAttribute("aria-expanded", "false");
      button.innerHTML =
        '<svg width="18" height="18" viewBox="-6 -2 100 100" fill="none" aria-hidden="true">' +
        '<g class="dsh-theme-spin" stroke="currentColor" stroke-width="6" stroke-linejoin="round">' +
        '<polygon class="dsh-theme-pf1" points="0,68 69,68 64,60 14,60 48,0 38,0"/>' +
        '<polygon class="dsh-theme-pf2" points="0,68 4,76 84,76 48,17 43.5,23.5 69,68"/>' +
        '<polygon class="dsh-theme-pf3" points="84,76 88,68 48,0 14,60 23,60 48,17"/>' +
        "</g></svg>";
      host.appendChild(button);

      var panel = document.createElement("div");
      panel.className = "dsh-splash-dock__panel dsh-splash-theme-panel";
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

      var slider = document.createElement("div");
      slider.className = "dsh-splash-dock__slider";

      var readout = document.createElement("div");
      readout.className = "dsh-splash-dock__readout";
      var readoutValue = document.createElement("span");
      readoutValue.className = "dsh-splash-dock__readout-value";
      var readoutUnit = document.createElement("small");
      readoutUnit.textContent = dockTranslate(locale, "theme.introUnit");
      readout.append(readoutValue, readoutUnit);

      var range = document.createElement("input");
      range.type = "range";
      range.className = "dsh-splash-dock__range";
      range.min = String(INTRO_MIN_MS);
      range.max = String(INTRO_MAX_MS);
      range.step = "100";
      range.setAttribute("aria-label", dockTranslate(locale, "theme.intro"));

      var ends = document.createElement("div");
      ends.className = "dsh-splash-dock__ends";
      var endsMin = document.createElement("span");
      var endsMax = document.createElement("span");
      endsMin.textContent = formatIntro(INTRO_MIN_MS);
      endsMax.textContent = formatIntro(INTRO_MAX_MS);
      ends.append(endsMin, endsMax);

      /** A labelled switch row; returns the row and its toggle button. */
      function makeSwitchRow(labelKey) {
        var row = document.createElement("div");
        row.className = "dsh-splash-dock__switchrow";
        var label = document.createElement("span");
        label.className = "dsh-splash-dock__switchlabel";
        label.textContent = dockTranslate(locale, labelKey);
        var toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "dsh-splash-dock__switch";
        toggle.setAttribute("role", "switch");
        toggle.setAttribute("aria-label", label.textContent);
        var dot = document.createElement("span");
        dot.className = "dsh-splash-dock__knob";
        toggle.appendChild(dot);
        row.append(label, toggle);
        return { row: row, toggle: toggle };
      }

      var ceremonySwitch = makeSwitchRow("theme.dailyOnce");
      var ceremony = ceremonySwitch.toggle;
      var markSwitch = makeSwitchRow("theme.mark");
      var markToggle = markSwitch.toggle;

      slider.append(readout, range, ends, ceremonySwitch.row, markSwitch.row);

      /** Paint the readout and the filled part of the track; returns the value
          the range actually settled on, so off-grid stored values get snapped. */
      function paintIntro(ms) {
        range.value = String(ms);
        var settled = Number(range.value);
        readoutValue.textContent = formatIntro(settled);
        var ratio = (settled - INTRO_MIN_MS) / (INTRO_MAX_MS - INTRO_MIN_MS);
        range.style.setProperty("--fill", (ratio * 100).toFixed(2) + "%");
        return settled;
      }

      var preview = document.createElement("button");
      preview.type = "button";
      preview.className = "dsh-splash-dock__preview";
      preview.textContent = dockTranslate(locale, "theme.preview");

      /* Version row. It asks the market's public update API about this package
         and offers the update when one exists. Every request is guarded: a
         profile without that market, or one older than the API, simply leaves
         the row hidden rather than putting a dead control in the panel. */
      function createUpdateRow() {
        var API = "/dsh-market/api/v1";
        var PACKAGE = "dsh-splash";

        var el = document.createElement("div");
        el.className = "dsh-splash-dock__update";
        el.hidden = true;

        var label = document.createElement("span");
        label.className = "dsh-splash-dock__update-text";

        var action = document.createElement("button");
        action.type = "button";
        action.className = "dsh-splash-dock__update-action";
        action.hidden = true;

        el.append(label, action);

        function say(key, suffix) {
          var word = dockTranslate(locale, key);
          label.textContent = suffix ? word + " · " + suffix : word;
          el.hidden = false;
        }

        function hide() {
          el.hidden = true;
          action.hidden = true;
        }

        /** JSON in, `{ ok, body }` out; never throws past the caller's catch. */
        function request(url, options) {
          return fetch(url, options).then(function (response) {
            return response.json().then(function (body) {
              return { ok: response.ok, body: body };
            });
          });
        }

        function offerRetry() {
          action.textContent = dockTranslate(locale, "update.retry");
          action.hidden = false;
          action.onclick = function () { check(true); };
        }

        function poll(operationId, tries) {
          if (tries > 150) {
            say("update.failed");
            offerRetry();
            return;
          }
          request(API + "/operations?operationId=" + encodeURIComponent(operationId))
            .then(function (result) {
              var operation = result.ok && result.body ? result.body.operation : null;
              if (operation === null || operation === undefined) {
                say("update.failed");
                offerRetry();
                return;
              }
              if (operation.status === "succeeded") {
                say("update.done", operation.installedVersion || "");
                action.hidden = true;
                return;
              }
              if (operation.status === "failed" || operation.status === "cancelled" || operation.status === "rolled-back") {
                say("update.failed");
                offerRetry();
                return;
              }
              say("update.running");
              window.setTimeout(function () { poll(operationId, tries + 1); }, 1200);
            })
            .catch(function () {
              say("update.failed");
              offerRetry();
            });
        }

        function start() {
          action.hidden = true;
          action.onclick = null;
          say("update.running");
          request(API + "/updates", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ packageName: PACKAGE })
          })
            .then(function (result) {
              var body = result.body || {};
              var id = body.operationId ||
                (body.operation !== null && body.operation !== undefined ? body.operation.operationId : undefined);
              if (!result.ok || typeof id !== "string" || id === "") {
                say("update.failed");
                offerRetry();
                return;
              }
              poll(id, 0);
            })
            .catch(function () {
              say("update.failed");
              offerRetry();
            });
        }

        function check(force) {
          say("update.checking");
          action.hidden = true;
          request(API + "/updates?name=" + PACKAGE + (force ? "&force=1" : ""))
            .then(function (result) {
              var info = result.ok && result.body ? result.body.package : null;
              if (info === null || info === undefined) { hide(); return; }
              var have = info.installedVersion || "";
              if (info.updateAvailable === true && info.latestVersion) {
                say("update.available", have + " → " + info.latestVersion);
                action.textContent = dockTranslate(locale, "update.action");
                action.hidden = false;
                action.onclick = function () { start(); };
                return;
              }
              /* A linked checkout has no published counterpart to compare
                 against; saying "up to date" there would be a guess. */
              if (info.source === "linked" || info.source === "local" || info.source === "file") {
                say("update.local", have);
                return;
              }
              /* The desktop host reconciles these itself on the next boot, so an
                 update button here would appear to work and then silently revert. */
              if (info.source === "generation") {
                say("update.managed", have);
                return;
              }
              say("update.uptodate", have);
            })
            .catch(hide);
        }

        return { el: el, check: check };
      }

      var updateRow = createUpdateRow();

      var note = document.createElement("div");
      note.className = "dsh-splash-dock__note";
      note.textContent = dockTranslate(locale, "theme.note");

      var reset = document.createElement("button");
      reset.type = "button";
      reset.className = "dsh-splash-dock__reset";
      reset.textContent = dockTranslate(locale, "theme.reset");

      panel.append(head, paletteLabelNode, list, introLabel, slider, preview, note, updateRow.el, reset);
      document.body.appendChild(panel);

      function applyLive(next) {
        if (controller !== null && !controller.isFinished()) controller.applyPalette(next);
        if (previewController !== null && !previewController.isFinished()) previewController.applyPalette(next);
        if (markController !== null) markController.setPalette(next);
      }

      /** Turn the resident mark on or off from the panel, no reload needed. */
      function syncMark() {
        if (!settings.mark) {
          dropMark();
          return;
        }
        var current = getPalette(settings.paletteId) || PALETTES[0];
        ensureMark(current).reveal(false);
      }

      function render() {
        var current = getPalette(settings.paletteId) || PALETTES[0];
        panel.style.setProperty("--dock-accent", current.brand);
        button.style.setProperty("--dock-accent", current.brand);
        button.style.setProperty("--dsh-theme-accent", current.brand);
        list.textContent = "";
        PALETTES.forEach(function (palette) {
          var tile = document.createElement("button");
          tile.type = "button";
          tile.className = "dsh-splash-dock__preset";
          tile.dataset.palette = palette.id;
          tile.dataset.selected = String(palette.id === settings.paletteId);
          var label = paletteLabel(palette, lang);
          tile.setAttribute("aria-label", label);
          var band = document.createElement("span");
          band.className = "dsh-splash-dock__band";
          /* Background first, then the triangle's three faces from dark to light.
             Taking brand instead would repeat a face: brand IS pf.dark on some
             palettes and pf.light on others, which put two identical stops side
             by side and read as a rendering bug. */
          [palette.bg, palette.pf.dark, palette.pf.mid, palette.pf.light].forEach(function (color) {
            var stop = document.createElement("span");
            stop.style.background = color;
            band.appendChild(stop);
          });
          var name = document.createElement("span");
          name.className = "dsh-splash-dock__name";
          name.textContent = label;
          tile.append(band, name);
          tile.addEventListener("click", function () {
            settings.paletteId = palette.id;
            writeSettings(settings);
            keepPanelOpen();
            render();
            applyLive(palette);
          });
          list.appendChild(tile);
        });
        /* Not rebuilt on every render: replacing an <input> mid-drag would drop
           the pointer capture and the thumb would stick. */
        settings.introMs = paintIntro(settings.introMs);
        ceremony.setAttribute("aria-checked", String(settings.dailyOnce));
        markToggle.setAttribute("aria-checked", String(settings.mark));
      }

      function positionPanel() {
        var rect = button.getBoundingClientRect();
        var margin = 8;
        var panelHeight = Math.min(window.innerHeight * 0.7, 560);
        var right = Math.max(margin, window.innerWidth - rect.right);
        var top = rect.bottom + margin;
        if (top + panelHeight > window.innerHeight - margin) {
          top = Math.max(margin, window.innerHeight - panelHeight - margin);
        }
        panel.style.top = top + "px";
        panel.style.right = right + "px";
        panel.style.left = "auto";
        panel.style.bottom = "auto";
      }

      function setOpen(open) {
        if (open) {
          panel.style.visibility = "";
          panel.style.zIndex = "2147483002";
          positionPanel();
          /* Re-checked on every open: a version published after the page
             loaded should show up without restarting anything. */
          updateRow.check(false);
        }
        panel.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
      }

      var handle = {
        open: function () { setOpen(true); },
        close: function () { setOpen(false); },
        toggle: function () { setOpen(panel.hidden); }
      };
      themePanelController = handle;

      var suppressDocClose = false;

      function keepPanelOpen() {
        suppressDocClose = true;
        window.setTimeout(function () {
          suppressDocClose = false;
        }, 0);
      }

      function onDocClick(event) {
        if (panel.hidden) return;
        if (panel.style.visibility === "hidden") return;
        if (suppressDocClose) return;
        /* Rebuilding the list removes the clicked row before the document
           listener runs; composedPath still contains the panel, so keep the
           panel open after a palette/duration/progress click. */
        var path = typeof event.composedPath === "function" ? event.composedPath() : null;
        if (path !== null && (path.indexOf(panel) !== -1 || path.indexOf(button) !== -1)) return;
        if (event.target instanceof Node && (panel.contains(event.target) || button.contains(event.target))) return;
        setOpen(false);
      }

      function onKey(event) {
        if (event.key === "Escape" && !panel.hidden) {
          event.stopPropagation();
          setOpen(false);
        }
      }

      button.addEventListener("click", function () {
        setOpen(panel.hidden);
      });
      close.addEventListener("click", function () {
        setOpen(false);
      });
      range.addEventListener("input", function () {
        /* Repaint the readout and track only. Calling render() here would
           rebuild the list on every pointer move and kill the drag. */
        settings.introMs = paintIntro(Number(range.value));
      });
      range.addEventListener("change", function () {
        /* Persist on release (and on each keyboard step) instead of on every
           input event, which would write localStorage dozens of times. */
        settings.introMs = clampIntro(Number(range.value));
        /* Re-arm the ceremony: without this, changing the length mid-day would
           only ever be seen in its shortened form. */
        settings.lastLaunchDate = "";
        writeSettings(settings);
      });
      ceremony.addEventListener("click", function () {
        settings.dailyOnce = !settings.dailyOnce;
        /* Turning it back on should give the next launch a full intro, not
           silently skip straight to "already played today". */
        if (settings.dailyOnce) settings.lastLaunchDate = "";
        writeSettings(settings);
        ceremony.setAttribute("aria-checked", String(settings.dailyOnce));
        keepPanelOpen();
      });
      markToggle.addEventListener("click", function () {
        settings.mark = !settings.mark;
        writeSettings(settings);
        markToggle.setAttribute("aria-checked", String(settings.mark));
        keepPanelOpen();
        syncMark();
      });
      preview.addEventListener("click", function () {
        var current = getPalette(settings.paletteId) || PALETTES[0];
        if (controller !== null && !controller.isFinished()) {
          /* While the intro is on screen, "preview" means apply the selection
             live instead of stacking a second splash on top of it. */
          controller.applyPalette(current);
          controller.setProgressMode(settings.progressMode);
          return;
        }
        /* Keep the panel open; hide it under the full-screen preview and
           restore it when the preview ends, so no extra click is needed. */
        panel.style.visibility = "hidden";
        previewSplash(ctx, locale, current, settings.introMs, settings.progressMode, function () {
          panel.style.visibility = "";
        });
      });
      reset.addEventListener("click", function () {
        settings = { paletteId: "swamp", introMs: DEFAULT_MIN_VISIBLE_MS, progressMode: "cinematic", dailyOnce: true, mark: true, lastLaunchDate: "" };
        writeSettings(settings);
        keepPanelOpen();
        render();
        applyLive(getPalette("swamp") || PALETTES[0]);
        syncMark();
      });
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKey);
      render();

      return function dispose() {
        document.removeEventListener("click", onDocClick);
        document.removeEventListener("keydown", onKey);
        if (themePanelController === handle) themePanelController = null;
        if (panel.parentNode !== null) panel.parentNode.removeChild(panel);
        if (button.parentNode !== null) button.parentNode.removeChild(button);
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

      /* The resident mark exists before the splash ends: its corner position is
         what the splash aims at, so it has to be laid out already. */
      var stored = readSettings();
      if (stored.mark) ensureMark(getPalette(stored.paletteId) || PALETTES[0]);

      options.markTarget = function () {
        return markController !== null ? markController.targetRect() : null;
      };
      options.onArrive = function (instant, angle) {
        if (markController !== null) markController.reveal(instant === true, angle);
      };

      function ThemeAction() {
        var hostRef = React.useRef(null);
        React.useLayoutEffect(function () {
          var host = hostRef.current;
          if (host === null) return undefined;
          return mountThemeAction(host, ctx, locale);
        }, []);
        return h("span", { className: "dsh-splash-theme-action-host", ref: hostRef });
      }

      ctx.effect(function () {
        var dispose = ctx.slots.inject("conversation.session.header.utilities", function () {
          return ctx.slots.register({
            name: "conversation.session.header.utilities",
            id: "dsh-splash-theme",
            order: -20,
            locale: NS,
            inject: function () { return {}; }
          }, ThemeAction);
        });
        return function () {
          if (typeof dispose === "function") dispose();
        };
      }, "dsh-splash: theme action in the conversation header");

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
      } else {
        /* Warm start: no intro to sit through, so the mark is simply there. */
        if (markController !== null) markController.reveal(false);
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
          dropMark();
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
