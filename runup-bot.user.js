// ==UserScript==
// @name         RUNUP trap tester v6
// @match        https://runup.fun/game*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(() => {
  try { window.__rbStop && window.__rbStop(); } catch (e) {}
  const VER = "v16";
  const V = 420;

  function gone(p, s) { return !!(p.gone || (p.crackedAt != null && s.time - p.crackedAt > 0.65)); }
  function platX(p, t) { return p.kind === "moving" ? (p.homeX ?? p.x) + Math.sin(t * 1.5 + p.id) * 17 : p.x; }
  function mains(s) {
    const minY = Math.min(s.highestLanding, s.y) + 1;
    return s.platforms.filter(p => !p.green && !p.risk && !gone(p, s) && p.y > minY).sort((a, b) => a.y - b.y);
  }
  function candleOf(s, p) { return p && s.candles.find(c => c.owner === p.id); }
  function growth(c, t) {
    if (!c || c.started === undefined) return 0;
    const o = (t - c.started) % 3.3;
    if (o < 0.9 || o >= 2.2) return 0;
    if (o < 1.18) return (o - 0.9) / 0.28;
    if (o < 1.85) return 1;
    return 1 - (o - 1.85) / 0.35;
  }
  function hot(c, t, h) {
    const start = c.started === undefined ? t : c.started;
    for (let d = 0; d <= h; d += 0.05) {
      const o = (t + d - start) % 3.3;
      if (o >= 0.85 && o < 2.25) return 1;
    }
    return 0;
  }
  function memeBox(p, t) {
    const o = (t + Math.abs(p.id) * 0.19) % 2.6;
    const hop = p.meme === "Fwog" ? Math.max(0, Math.sin((o / 2.6) * Math.PI * 2)) : 0;
    const sway = p.meme === "Doge" ? Math.sin(t * 1.8 + p.id) * 7 : 0;
    return { x: p.x + 5 + hop * 17 + sway, y: p.y + hop * 37, w: 27, h: 29 };
  }
  function hatBox(p, t) {
    if (p.meme !== "WIF") return null;
    const o = (t + Math.abs(p.id) * 0.13) % 3.6;
    if (o < 1.2 || o > 2.7) return null;
    const i = (o - 1.2) / 1.5, d = p.x > V / 2 ? -1 : 1;
    return { x: p.x + 10 + d * i * 90, y: p.y + 40 + Math.sin(i * Math.PI) * 30, w: 25, h: 15 };
  }
  function box(x, y, bx, by, bw, bh) {
    return x + 12 > bx && x - 12 < bx + bw && y + 37 > by && y + 3 < by + bh;
  }
  function blocked(s, x, y, t) {
    for (const c of s.candles) {
      if (box(x, y, c.x - 2, c.y, c.w + 4, c.h + 10) && hot(c, t, 0.8)) return "C";
      const g = growth(c, t);
      if (g > 0.02 && box(x, y, c.x + c.w / 2 - 4, c.y - 9 * g, 8, (c.h + 23) * g)) return "C";
    }
    for (const p of s.platforms) {
      if (gone(p, s) || !p.meme) continue;
      const m = memeBox(p, t);
      if (box(x, y, m.x - 4, m.y - 4, m.w + 8, m.h + 8)) return p.meme;
      const h = hatBox(p, t);
      if (h && box(x, y, h.x - 6, h.y - 6, h.w + 12, h.h + 12)) return "HAT";
    }
    return null;
  }
  function aimX(s, p) {
    const x = platX(p, s.time), c = candleOf(s, p);
    let lo = x + 16, hi = x + p.w - 16;
    if (c) {
      if (c.x < x + p.w * 0.5) lo = Math.max(lo, c.x + c.w + 26);
      else hi = Math.min(hi, c.x - 26);
    }
    if (hi < lo) return c && c.x < x + p.w * 0.5 ? x + p.w - 12 : x + 12;
    const nxt = mains(s).find(q => q.y > p.y + 1);
    const want = nxt ? platX(nxt, s.time) + nxt.w * 0.5 : x + p.w * 0.5;
    return Math.max(lo, Math.min(hi, want));
  }
  function plan(s) {
    const L = mains(s), n = L[0], n2 = L[1];
    if (!n) return { x: s.x, b: 0, tag: "-" };
    const from = s.platforms.find(p => !p.green && Math.abs(p.y - s.highestLanding) < 2);
    const curR = (from ? platX(from, s.time) : s.x) > 160;
    const nR = platX(n, s.time) > 160;
    const c = candleOf(s, n);
    const onCr = s.platforms.some(p => p.kind === "crumble" && p.crackedAt != null && !p.green && Math.abs(p.y - s.highestLanding) < 2);
    const a1 = aimX(s, n);
    const far = Math.abs(a1 - s.x) > 145;
    const dy = n.y - s.y;
    const skip = n2 && ((c && nR !== curR) || onCr || n.kind === "crumble");
    const T = skip ? n2 : n;
    return { x: aimX(s, T), b: skip || far || dy > 125 ? 1 : 0, tag: (skip ? "S" : "L") + T.id };
  }
  function dirTo(x, tx) { return x < tx - 6 ? 1 : x > tx + 6 ? -1 : 0; }

  function isState(v) {
    return v && Array.isArray(v.platforms) && Array.isArray(v.candles) && typeof v.alive === "boolean" && typeof v.x === "number" && "highestLanding" in v && "seed" in v;
  }
  function isInput(v) {
    return v && typeof v.left === "boolean" && typeof v.right === "boolean" && !Array.isArray(v) && Object.keys(v).every(k => k === "left" || k === "right");
  }
  function fibers(el) {
    if (!el) return [];
    const o = [];
    for (const k of Object.keys(el)) {
      if (k.startsWith("__reactFiber") || k.startsWith("__reactContainer") || k.startsWith("__reactInternalInstance")) {
        o.push(el[k]);
        if (el[k] && el[k]._internalRoot) o.push(el[k]._internalRoot.current);
      }
    }
    return o;
  }
  let stateRef = null, inputRef = null;
  function find() {
    const q = fibers(document.getElementById("climb-stage")).concat(fibers(document.getElementById("root")));
    document.querySelectorAll("#climb-stage canvas, #climb-stage *").forEach(el => fibers(el).forEach(f => q.push(f)));
    const seen = new Set();
    let snap = null, inp = null, refS = null, refI = null, n = 0;
    while (q.length && n++ < 9000) {
      const f = q.pop();
      if (!f || typeof f !== "object" || seen.has(f)) continue;
      seen.add(f);
      let h = f.memoizedState, i = 0;
      while (h && i++ < 100) {
        const v = h.memoizedState;
        if (v && typeof v === "object") {
          if (isState(v) && (!snap || v.time >= (snap.time || 0))) snap = v;
          if (isInput(v)) inp = v;
          if (v.current && isState(v.current) && (!refS || v.current.time >= ((refS.current && refS.current.time) || 0))) refS = v;
          if (v.current && isInput(v.current)) refI = v;
        }
        h = h.next;
      }
      if (f.return) q.push(f.return);
      if (f.child) q.push(f.child);
      if (f.sibling) q.push(f.sibling);
    }
    stateRef = refS || (snap ? { current: snap } : stateRef);
    inputRef = refI || (inp ? { current: inp } : inputRef);
  }

  let held = 99;
  function sendKey(type, code, keyCode) {
    const ev = new KeyboardEvent(type, { key: code === "Space" ? " " : code, code, keyCode, which: keyCode, bubbles: true, cancelable: true });
    window.dispatchEvent(ev);
    document.dispatchEvent(ev);
    const st = document.getElementById("climb-stage");
    if (st) st.dispatchEvent(ev);
  }
  function hold(dir) {
    if (inputRef && inputRef.current) {
      inputRef.current.left = dir === -1;
      inputRef.current.right = dir === 1;
    }
    if (dir === held) return;
    if (held < 0) sendKey("keyup", "ArrowLeft", 37);
    if (held > 0) sendKey("keyup", "ArrowRight", 39);
    held = dir;
    if (dir < 0) sendKey("keydown", "ArrowLeft", 37);
    if (dir > 0) sendKey("keydown", "ArrowRight", 39);
    const l = document.querySelector('[aria-label="Move left"]');
    const r = document.querySelector('[aria-label="Move right"]');
    const fire = (b, t) => b && b.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 1 }));
    fire(l, "pointerup"); fire(r, "pointerup");
    if (dir < 0) fire(l, "pointerdown");
    if (dir > 0) fire(r, "pointerdown");
  }
  function doBoost(s) {
    if (!s.boost || s.vy >= 180) return;
    s.vy = Math.max(s.vy, 650);
    s.boost = false;
    s.boostFlash = 0.3;
    sendKey("keydown", "Space", 32);
    sendKey("keyup", "Space", 32);
    document.querySelectorAll("button").forEach(btn => {
      if (/boost|space/i.test(btn.textContent || "") || btn.getAttribute("aria-label") === "Boost")
        btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1 }));
    });
  }

  const bar = document.createElement("div");
  bar.id = "rbbar";
  bar.style.cssText = "position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#7CFFB2;color:#111;padding:8px 14px;border-radius:12px;font:800 13px Inter,sans-serif;white-space:nowrap;cursor:pointer";
  bar.textContent = VER + " ON â€” click the mountain, then Start";
  document.body.appendChild(bar);

  let locked = null, lastLand = -1;
  const id = setInterval(() => {
    const rs = document.querySelector('[aria-label="Resume game"]');
    if (rs) rs.click();
    const st = document.getElementById("climb-stage");
    if (st && document.activeElement !== st) { try { st.focus({ preventScroll: true }); } catch (e) {} }
    find();
    if (!stateRef || !stateRef.current) {
      bar.textContent = VER + " waiting â€” click the mountain";
      bar.style.background = "#ffe085";
      return;
    }
    const s = stateRef.current;
    if (!s.alive || s.time < 0.05) {
      hold(0);
      locked = null;
      bar.style.background = "#ffe085";
      bar.textContent = VER + (s.alive ? " press Start" : " dead " + Math.max(0, Math.floor((s.peak - 80) * 3)) + "m " + (s.reason || ""));
      return;
    }
    if (!locked || s.landings !== lastLand) {
      locked = plan(s);
      lastLand = s.landings;
    }
    let d = dirTo(s.x, locked.x);
    if (blocked(s, s.x + d * 36, s.y, s.time) || blocked(s, s.x + d * 18, s.y + Math.min(40, s.vy * 0.08), s.time + 0.08)) d = 0;
    if (blocked(s, s.x, s.y, s.time)) {
      let away = s.x > 210 ? -1 : 1;
      for (const c of s.candles) if (s.x + 16 > c.x && s.x - 16 < c.x + c.w) away = s.x < c.x + c.w / 2 ? -1 : 1;
      d = away;
    }
    if (s.vy < 0) {
      for (const p of s.platforms) {
        if (!p.green || gone(p, s)) continue;
        if (s.y > p.y && s.y < p.y + 90 && s.x + 12 > p.x && s.x - 12 < p.x + p.w)
          d = (s.x - p.x) < (p.x + p.w - s.x) ? -1 : 1;
      }
    }
    hold(d);
    if (locked.b) doBoost(s);
    bar.style.background = "#7CFFB2";
    bar.textContent = VER + " " + locked.tag + " " + (d > 0 ? ">" : d < 0 ? "<" : ".") + (locked.b ? " B" : "") + "  " + Math.max(0, Math.floor((s.peak - 80) * 3)) + "m";
  }, 8);

  window.__rbStop = () => {
    clearInterval(id);
    hold(0);
    bar.remove();
    window.__rbStop = null;
  };
  bar.ondblclick = () => window.__rbStop && window.__rbStop();
  alert(VER + " ON â€” click the mountain, then Start. Double-click the bar to stop.");
})();
