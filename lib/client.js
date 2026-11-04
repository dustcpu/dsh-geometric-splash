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
    var DEFAULT_MIN_VISIBLE_MS = 2000;
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

    var FALLBACK = {
      "stage.plugins": "正在载入插件 {n}/{total}",
      "stage.pluginsUnknown": "正在载入插件",
      "stage.connecting": "正在连接 Harness",
      "stage.services": "正在恢复工作区与会话",
      "stage.paint": "正在准备界面",
      "stage.ready": "启动完成",
      "stage.stalled": "启动仍在继续",
      "progress.label": "启动进度"
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
        "progress.label": "启动进度"
      },
      en: {
        "stage.plugins": "Loading plugins {n}/{total}",
        "stage.pluginsUnknown": "Loading plugins",
        "stage.connecting": "Connecting to Harness",
        "stage.services": "Restoring workspaces and sessions",
        "stage.paint": "Preparing the interface",
        "stage.ready": "Ready",
        "stage.stalled": "Startup is still running",
        "progress.label": "Startup progress"
      }
    };

    /** Read dev overrides without making them part of the product surface. */
    function readOptions() {
      var options = {
        minVisibleMs: DEFAULT_MIN_VISIBLE_MS,
        force: false,
        disabled: false,
        debug: false
      };
      try {
        var injected = window.__DSH_SPLASH__;
        if (injected && typeof injected === "object") {
          if (typeof injected.minVisibleMs === "number") options.minVisibleMs = Math.max(0, injected.minVisibleMs);
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
      } catch (error) {
        /* A hostile page environment simply keeps the defaults. */
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
      style.textContent = CSS;
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
      var startedAt = now();
      var leaving = false;
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
        '<g class="dsh-splash__spin" stroke="#8f5f94" stroke-width="1.2" stroke-linejoin="round">' +
        '<polygon class="dsh-splash__pf1" points="0,68 69,68 64,60 14,60 48,0 38,0"/>' +
        '<polygon class="dsh-splash__pf2" points="0,68 4,76 84,76 48,17 43.5,23.5 69,68"/>' +
        '<polygon class="dsh-splash__pf3" points="84,76 88,68 48,0 14,60 23,60 48,17"/>' +
        "</g></svg>";

      frame.append(canvas, penrose);

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
      root.append(frame, brand);
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

      function targetValue() {
        var value = 0;
        if (state.pageDone) value += WEIGHT.page;
        value += WEIGHT.boot * bootFraction();
        if (state.connectionReady) value += WEIGHT.connection;
        if (state.servicesReady) value += WEIGHT.services;
        if (state.paintDone) value += WEIGHT.paint;
        return Math.max(0, Math.min(100, value));
      }

      function stageOf(target) {
        if (target >= 100) return { key: "ready" };
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
        if (leaving || finished) return;
        if (targetValue() < 100) return;
        var wait = Math.max(0, startedAt + options.minVisibleMs - now());
        leaving = true;
        leaveTimer = window.setTimeout(function () {
          beginLeave();
        }, wait);
      }

      function beginLeave() {
        if (finished) return;
        if (leaveTimer !== 0) {
          window.clearTimeout(leaveTimer);
          leaveTimer = 0;
        }
        root.dataset.state = "leaving";
        root.setAttribute("aria-hidden", "true");
        leaveTimer = window.setTimeout(finish, FADE_MS + 40);
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

      var ocean = createOcean(canvas);
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

      rafId = requestAnimationFrame(frameLoop);

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
        destroy: finish,
        isFinished: function () {
          return finished;
        }
      };
    }

    /**
     * The diamond ocean inside the circle. Kept structurally identical to the
     * prototype: a double sine wave displaces an isometric point grid and each
     * diamond is filled by its average height, then stroked with the brand
     * purple. DPR-aware and resize-aware.
     */
    function createOcean(canvas) {
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

      var tileLow = [212, 180, 195];
      var tileHigh = [248, 244, 238];
      var grid = [143, 95, 148];

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
            context.fillStyle = "rgba(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + "," + (0.35 + norm * 0.25).toFixed(2) + ")";
            context.beginPath();
            context.moveTo(nw.x, nw.y);
            context.lineTo(ne.x, ne.y);
            context.lineTo(se.x, se.y);
            context.lineTo(sw.x, sw.y);
            context.closePath();
            context.fill();
            context.strokeStyle = "rgba(" + grid[0] + "," + grid[1] + "," + grid[2] + ",0.18)";
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

    function apply(ctx) {
      if (controller !== null) {
        controller.destroy();
        controller = null;
      }
      var options = readOptions();
      if (options.disabled) return;
      var locale = createLocale(ctx);
      var splash = createSplash(ctx, options, locale);
      if (splash === null) {
        locale.dispose();
        return;
      }
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

      ctx.effect(function () {
        return function () {
          locale.dispose();
          if (controller === splash) controller = null;
          splash.destroy();
        };
      }, "dsh-splash: startup surface");
    }

    var name = "dsh-splash";

    exports.name = name;
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
