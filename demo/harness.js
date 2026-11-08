(function () {
  "use strict";

  var state = window.DEMO_STATE || "read";
  var transition = window.DEMO_TRANSITION === true;
  var sequence = ["idle", "thinking", "waiting", "read", "search", "act", "edit"];
  var sequenceIndex = 0;

  var stateName = document.getElementById("state-name");
  var effectName = document.getElementById("effect-name");
  var hint = document.getElementById("hint");
  var tileState = document.getElementById("tile-state");
  var replay = document.getElementById("replay");
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-dot]"));
  var activity = null;
  var mark = null;

  var labels = {
    idle: ["IDLE", "空闲", "主题色 · 无叠加"],
    thinking: ["THINKING", "思考", "白色短高光沿外缘 · 2.4s/圈"],
    waiting: ["WAITING", "等待操作", "整圈白边呼吸 · 2.6s"],
    read: ["READ", "读取文件", "右边整边白色呼吸 · 3.2s"],
    search: ["SEARCH", "逐边亮起", "三条边依次整边亮起 · 2.4s/轮"],
    act: ["ACT", "执行 / 工具", "整圈白色高光快走 · 1.2s/圈"],
    edit: ["EDIT", "编辑文件", "循环翻转 180° · 保持后翻回"],
    transition: ["STATE TRANSITION", "idle → thinking → waiting → read → search → act → edit", "每 2.6s 切换一次"]
  };

  function setLabel(value) {
    var row = labels[value] || labels[state];
    if (stateName) stateName.textContent = row[0];
    if (effectName) effectName.textContent = row[1];
    if (hint) hint.textContent = row[2];
    if (tileState) tileState.textContent = row[0];
    dots.forEach(function (dot, index) {
      dot.setAttribute("data-on", String(sequence[index] === value));
    });
  }

  function setState(value, quiet) {
    state = value;
    if (activity === null) return;
    if (value === "idle") activity.removeAttribute("data-process-activity");
    else activity.setAttribute("data-process-activity", value === "waiting" ? "questions" : value);
    if (!quiet) setLabel(value);
  }

  function ensureActivity() {
    if (activity !== null) return;
    activity = document.createElement("button");
    activity.id = "fx-activity";
    activity.setAttribute("aria-hidden", "true");
    var shimmer = document.createElement("span");
    shimmer.setAttribute("data-shimmer", "");
    activity.appendChild(shimmer);
    document.body.appendChild(activity);
  }

  // ---- fake React: enough for the slot components the bundle touches -------
  var fakeReact = {
    createElement: function (type, props) {
      var el = document.createElement(type);
      if (props && props.ref) props.ref.current = el;
      return el;
    },
    useRef: function (initial) { return { current: initial }; },
    useLayoutEffect: function (fn) { fn(); }
  };

  var registration = null;
  window.__ModuleLoader__ = {
    load: function (value) { registration = value; }
  };

  // ---- fake boot / services ------------------------------------------------
  var bootEntries = [];
  for (var bootIndex = 0; bootIndex < 48; bootIndex += 1) {
    bootEntries.push({ fiber: { state: 2 } });
  }

  var connectionListeners = new Set();
  var connection = {
    state: {
      getSnapshot: function () { return "connected"; },
      subscribe: function (fn) { connectionListeners.add(fn); return function () { connectionListeners.delete(fn); }; }
    }
  };
  var workspaces = {
    list: {
      getSnapshot: function () { return { phase: "ready" }; },
      subscribe: function () { return function () {}; }
    }
  };
  var sessions = {
    list: {
      getSnapshot: function () { return { phase: "ready" }; },
      subscribe: function () { return function () {}; }
    }
  };
  var services = {
    modules: { manifest: { plugins: new Array(48).fill(0) } },
    connection: connection,
    workspaces: workspaces,
    sessions: sessions
  };

  var ctx = {
    get: function (name) { return services[name]; },
    loader: { entries: function () { return bootEntries; } },
    locale: {
      register: function () { return function () {}; },
      bind: function () { return null; }
    },
    effect: function (fn) { return fn(); },
    slots: {
      inject: function (name, register) { return register(); },
      register: function (options, component) { return function () {}; }
    }
  };

  // ---- preferences for the preview instance --------------------------------
  try {
    localStorage.setItem("dsh-splash:settings", JSON.stringify({
      paletteId: "swamp",
      introMs: 1000,
      progressMode: "cinematic",
      dailyOnce: false,
      mark: true,
      lastLaunchDate: ""
    }));
  } catch (error) {
    /* storage can be disabled on file:// */
  }

  function afterApply() {
    window.setTimeout(function () {
      mark = document.querySelector(".dsh-mark");
      if (mark === null) {
        if (hint) hint.textContent = "mark did not mount";
        return;
      }
      mark.dataset.visible = "true";
      mark.style.opacity = "1";
      mark.style.display = "";
      /* Enlarge the 46px mark for screen recording without touching the
         production geometry: grow to the left, away from the composer. */
      mark.style.transformOrigin = "right center";
      mark.style.transform = "scale(2.2)";

      var splash = document.querySelector(".dsh-splash");
      if (splash !== null) splash.style.display = "none";

      ensureActivity();
      if (transition) {
        setState(sequence[0]);
        window.setInterval(function () {
          sequenceIndex = (sequenceIndex + 1) % sequence.length;
          setState(sequence[sequenceIndex]);
        }, 2600);
      } else if (state === "edit") {
        setState("read", true);
        window.setTimeout(function () { setState("edit"); }, 1000);
      } else if (state === "idle") {
        setLabel("idle");
      } else {
        setState(state);
      }
    }, 500);
  }

  var script = document.createElement("script");
  script.src = "../lib/client.js";
  script.onload = function () {
    if (registration === null) {
      if (hint) hint.textContent = "bundle did not register";
      return;
    }
    var module;
    try {
      module = registration.factory(function (request) {
        if (request === "react") return fakeReact;
        throw new Error("unexpected require: " + request);
      });
    } catch (error) {
      if (hint) hint.textContent = "bundle factory failed: " + error.message;
      return;
    }
    try {
      module.apply(ctx);
    } catch (error) {
      if (hint) hint.textContent = "apply failed: " + error.message;
      return;
    }
    afterApply();
  };
  script.onerror = function () {
    if (hint) hint.textContent = "could not load ../lib/client.js";
  };
  document.head.appendChild(script);

  if (replay) {
    replay.addEventListener("click", function () {
      if (activity === null) return;
      if (transition) {
        sequenceIndex = 0;
        setState(sequence[0]);
        return;
      }
      setState("read", true);
      window.setTimeout(function () { setState("edit"); }, 900);
    });
  }
})();
