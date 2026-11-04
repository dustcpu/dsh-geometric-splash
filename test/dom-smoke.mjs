// Smoke test for the real lib/client.js under a minimal DOM shim.
// It verifies: cold-boot detection, real loader/connection/service milestones,
// monotonic progress, adoption into the shell.overlay seat, and fade-out cleanup.
//
// Run: node test/dom-smoke.mjs
import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/* ------------------------------------------------------------------ DOM shim */

class FakeElement {
  constructor(tag) {
    this.tagName = tag
    this.nodeType = 1
    this.children = []
    this.parentNode = null
    this.attributes = new Map()
    this.dataset = {}
    this.style = { setProperty() {}, removeProperty() {} }
    this.className = ''
    this._text = ''
    this._html = ''
    this.width = 0
    this.height = 0
    this.listeners = Object.create(null)
  }
  set textContent(value) { this._text = String(value) }
  get textContent() { return this._text }
  set innerHTML(value) { this._html = String(value) }
  get innerHTML() { return this._html }
  append(...nodes) { for (const node of nodes) this.appendChild(node) }
  appendChild(node) {
    if (node.parentNode) node.parentNode.removeChild(node)
    node.parentNode = this
    this.children.push(node)
    return node
  }
  removeChild(node) {
    const index = this.children.indexOf(node)
    if (index >= 0) this.children.splice(index, 1)
    node.parentNode = null
  }
  remove() { if (this.parentNode) this.parentNode.removeChild(this) }
  setAttribute(name, value) { this.attributes.set(name, String(value)) }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null }
  addEventListener(type, fn) {
    if (this.listeners[type] === undefined) this.listeners[type] = []
    this.listeners[type].push(fn)
  }
  removeEventListener(type, fn) {
    const list = this.listeners[type]
    if (list === undefined) return
    const index = list.indexOf(fn)
    if (index >= 0) list.splice(index, 1)
  }
  dispatch(type, event = {}) {
    const list = this.listeners[type]
    if (list === undefined) return
    for (const fn of [...list]) fn({ target: this, ...event })
  }
  getBoundingClientRect() { return { x: 0, y: 0, width: 380, height: 380, top: 0, left: 0, right: 380, bottom: 380 } }
  getContext() { return CANVAS_CONTEXT }
  querySelector(selector) { return query(this, selector) }
  querySelectorAll(selector) { return queryAll(this, selector) }
}

const CANVAS_CONTEXT = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  clearRect() {},
  setTransform() {},
  beginPath() {},
  moveTo() {},
  lineTo() {},
  closePath() {},
  fill() {},
  stroke() {}
}

function walk(node, visit) {
  visit(node)
  for (const child of node.children) walk(child, visit)
}

function matches(node, selector) {
  if (selector.startsWith('.')) return String(node.className).split(/\s+/).includes(selector.slice(1))
  if (selector.startsWith('[')) {
    const match = /^\[([^\]=]+)(?:="([^"]*)")?\]$/.exec(selector)
    if (!match) return false
    if (!node.attributes.has(match[1])) return false
    return match[2] === undefined || node.attributes.get(match[1]) === match[2]
  }
  const attrMatch = /^([\w-]+)\[([^\]=]+)(?:="([^"]*)")?\]$/.exec(selector)
  if (attrMatch) {
    if (node.tagName !== attrMatch[1]) return false
    if (!node.attributes.has(attrMatch[2])) return false
    return attrMatch[3] === undefined || node.attributes.get(attrMatch[2]) === attrMatch[3]
  }
  return node.tagName === selector
}

function query(root, selector) {
  let found = null
  walk(root, (node) => {
    if (found === null && matches(node, selector)) found = node
  })
  return found
}

function queryAll(root, selector) {
  const found = []
  walk(root, (node) => { if (matches(node, selector)) found.push(node) })
  return found
}

const body = new FakeElement('body')
const head = new FakeElement('head')
body.parentNode = null
const document = {
  readyState: 'complete',
  body,
  head,
  documentElement: new FakeElement('html'),
  createElement: (tag) => new FakeElement(tag),
  querySelector: (selector) => query(body, selector) ?? query(head, selector),
  querySelectorAll: (selector) => [...queryAll(body, selector), ...queryAll(head, selector)],
  addEventListener() {},
  removeEventListener() {}
}

let rafId = 0
const rafTimers = new Map()
function requestAnimationFrame(callback) {
  const id = ++rafId
  const timer = setTimeout(() => {
    rafTimers.delete(id)
    callback(performance.now())
  }, 16)
  rafTimers.set(id, timer)
  return id
}
function cancelAnimationFrame(id) {
  const timer = rafTimers.get(id)
  if (timer !== undefined) clearTimeout(timer)
  rafTimers.delete(id)
}

class ResizeObserver {
  observe() {}
  disconnect() {}
}

const window = {
  location: { search: '' },
  devicePixelRatio: 2,
  requestAnimationFrame,
  cancelAnimationFrame,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  addEventListener() {},
  removeEventListener() {},
  matchMedia: () => ({ matches: false }),
  __DSH_SPLASH__: { minVisibleMs: 2000 },
  __ModuleLoader__: {
    load(registration) { window.__registration = registration }
  }
}

const sandbox = {
  window,
  document,
  console,
  performance,
  Promise,
  URLSearchParams,
  requestAnimationFrame,
  cancelAnimationFrame,
  ResizeObserver,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Math,
  Date
}
sandbox.globalThis = sandbox
vm.createContext(sandbox)
vm.runInContext(fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8'), sandbox, { filename: 'lib/client.js' })

assert.ok(window.__registration, 'bundle called __ModuleLoader__.load')
assert.equal(window.__registration.id, 'dsh-splash')

/* ------------------------------------------------------------- fake React */

const pendingEffects = []
const fakeReact = {
  createElement(type, props) {
    const el = new FakeElement(type)
    if (props && props.ref) props.ref.current = el
    return el
  },
  useRef: (initial) => ({ current: initial }),
  useLayoutEffect: (fn) => pendingEffects.push(fn)
}

const module = window.__registration.factory((request) => {
  if (request === 'react') return fakeReact
  throw new Error(`unexpected require: ${request}`)
})
assert.equal(module.name, 'dsh-splash')
assert.deepEqual([...module.inject], ['slots', 'locale'])

/* --------------------------------------------------------- fake DSH client */

const TOTAL = 32
const entries = Array.from({ length: TOTAL }, () => ({ fiber: { state: 0 } }))
function setActive(count) {
  for (let i = 0; i < TOTAL; i += 1) entries[i].fiber.state = i < count ? 2 : 1
}

const connectionListeners = new Set()
let connectionState = 'connecting'
const connection = {
  state: {
    getSnapshot: () => connectionState,
    subscribe(fn) { connectionListeners.add(fn); return () => connectionListeners.delete(fn) }
  }
}

function phaseService() {
  const state = { phase: 'loading' }
  const listeners = new Set()
  return {
    list: {
      getSnapshot: () => ({ phase: state.phase }),
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) }
    },
    set(phase) {
      state.phase = phase
      for (const fn of [...listeners]) fn()
    }
  }
}
const workspaces = phaseService()
const sessions = phaseService()

const services = {
  modules: { manifest: { plugins: new Array(TOTAL).fill(0) } },
  connection,
  workspaces,
  sessions
}

let capturedComponent = null
const capturedComponents = {}
const ctx = {
  get: (name) => services[name],
  loader: { entries: () => entries },
  locale: { register: () => () => {}, bind: () => null },
  effect(fn) { return fn() },
  slots: {
    inject: (_name, register) => register(),
    register(options, component) {
      capturedComponents[options.id] = component
      capturedComponent = component
      return () => {}
    }
  }
}

/* -------------------------------------------------------------------- run */

async function waitFor(check, timeoutMs, label) {
  const started = Date.now()
  while (!check()) {
    if (Date.now() - started > timeoutMs) throw new Error(`timeout waiting for ${label}`)
    await sleep(25)
  }
}

const bootPage = new FakeElement('div')
bootPage.setAttribute('data-dsh-boot', '')
body.appendChild(bootPage)

module.apply(ctx)
const splash = document.querySelector('.dsh-splash')
assert.ok(splash, 'cold boot paints the splash')

// The persistent theme dock is an independent overlay entry; mount it with the
// same fake React seat to exercise its imperative DOM builder.
assert.ok(capturedComponents['dsh-splash-theme'], 'theme dock registered')
const dockHost = new FakeElement('div')
body.appendChild(dockHost)
pendingEffects.length = 0
const dockSeat = capturedComponents['dsh-splash-theme']()
dockHost.appendChild(dockSeat)
for (const effect of pendingEffects.splice(0)) effect()
const dock = document.querySelector('.dsh-splash-dock')
assert.ok(dock, 'theme dock mounted')
assert.equal(dock.querySelectorAll('.dsh-splash-dock__preset').length, 10, 'all palettes are listed')
assert.equal(dock.querySelectorAll('.dsh-splash-dock__duration').length, 3, 'three intro lengths are listed')
assert.ok(document.querySelector('style[data-plugin-css="dsh-splash/dock.css"]'), 'dock stylesheet exists')
assert.equal(splash.parentNode, body)
assert.ok(capturedComponent, 'shell.overlay seat registered while booting')

const pct = () => Number((document.querySelector('.dsh-splash__pct')?.textContent ?? '0%').replace('%', ''))
const hasSplash = () => document.querySelector('.dsh-splash') !== null

setActive(8)
await sleep(300)
const firstPct = pct()
assert.ok(firstPct > 0 && firstPct < 55, `boot-only progress stays below the 55% boot ceiling (got ${firstPct})`)
assert.equal(splash.dataset.bootActive, '8', 'loader active count is read from real entries')

const samples = [firstPct]
let lastVisible = firstPct
const sampler = setInterval(() => {
  if (!hasSplash()) return
  lastVisible = pct()
  samples.push(lastVisible)
}, 40)

setActive(TOTAL)
await sleep(120)

// App mount: boot page disappears and the frame renders the overlay seat.
bootPage.remove()
const seatHost = new FakeElement('div')
body.appendChild(seatHost)
const seat = capturedComponent()
seatHost.appendChild(seat)
for (const effect of pendingEffects.splice(0)) effect()
assert.equal(splash.parentNode, seat, 'same DOM node adopted into shell.overlay')

await waitFor(() => pct() >= 55, 2000, 'boot weight to settle after mount')

connectionState = 'connected'
for (const listener of [...connectionListeners]) listener()
workspaces.set('ready')
sessions.set('ready')
await waitFor(() => pct() >= 99, 3000, 'connection + workspace + paint weights')

const midPct = pct()
assert.ok(midPct >= 99, `services contribute their weight (got ${midPct})`)

await waitFor(() => !hasSplash(), 5000, 'splash fade-out')
clearInterval(sampler)

for (let i = 1; i < samples.length; i += 1) {
  assert.ok(samples[i] >= samples[i - 1], `progress is monotonic (${samples[i - 1]} -> ${samples[i]})`)
}
assert.equal(samples[samples.length - 1], 100, `displayed progress reaches 100 before removal (got ${samples[samples.length - 1]})`)
assert.equal(seat.style.display, 'none', 'seat hidden after completion')
assert.equal(document.querySelector('style[data-plugin-css="dsh-splash/style.css"]'), null, 'owned stylesheet removed')

// The theme dock's preview button must paint a second, self-disposing splash.
const previewButton = dock.querySelector('.dsh-splash-dock__preview')
assert.ok(previewButton, 'preview button exists')
previewButton.dispatch('click')
assert.ok(document.querySelector('.dsh-splash'), 'theme preview paints a splash')
await waitFor(() => document.querySelector('.dsh-splash') === null, 7000, 'theme preview fade-out')
console.log('ok: theme preview lifecycle complete')

console.log(`ok: ${samples.length} progress samples, monotonic, splash lifecycle complete (peak ${samples[samples.length - 1]}%)`)
