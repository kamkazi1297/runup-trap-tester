// ==UserScript==
// @name         RUNUP trap tester v6
// @match        https://runup.fun/game*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(() => {
  if (window.__rbStop) try { window.__rbStop(); } catch (e) {}
  window.__rb = 1;
  const V = 420, DT = 1 / 120, G = 1700, SPD = 255;
  let S = null, I = null, H = 99, boostedAt = -1, lastThink = 0;
  let dec = { d: 0, b: 0, m: "…", aim: 210 };

  const isS = (v) => v && v.platforms && v.candles && typeof v.alive == "boolean" && "highestLanding" in v;
  const isI = (v) => v && typeof v.left == "boolean" && typeof v.right == "boolean" && !Array.isArray(v) && !("platforms" in v);

  function fibers(el) {
    if (!el) return [];
    const o = [];
    for (const k of Object.keys(el))
      if (k.startsWith("__reactFiber") || k.startsWith("__reactContainer") || k.startsWith("__reactInternalInstance")) {
        o.push(el[k]);
        if (el[k] && el[k]._internalRoot) o.push(el[k]._internalRoot.current);
      }
    return o;
  }
  function find() {
    const q = fibers(document.getElementById("climb-stage")).concat(fibers(document.getElementById("root")));
    document.querySelectorAll("#climb-stage canvas, canvas").forEach((c) => {
      fibers(c).forEach((f) => q.push(f));
      fibers(c.parentElement).forEach((f) => q.push(f));
    });
    const seen = new Set();
    let sr = null, ir = null, n = 0;
    while (q.length && n++ < 9000) {
      const f = q.pop();
      if (!f || typeof f != "object" || seen.has(f)) continue;
      seen.add(f);
      let h = f.memoizedState, i = 0;
      while (h && i++ < 100) {
        const v = h.memoizedState;
        if (v && typeof v == "object") {
          if (v.current && isS(v.current) && (!sr || v.current.time >= (sr.current.time || 0))) sr = v;
          if (v.current && isI(v.current)) ir = v;
        }
        h = h.next;
      }
      if (f.return) q.push(f.return);
      if (f.child) q.push(f.child);
      if (f.sibling) q.push(f.sibling);
    }
    if (sr) S = sr;
    if (ir) I = ir;
  }

  function z(e) {
    if (e < 24) return { phase: "calm" };
    const t = (e - 24) % 64;
    return t < 8 ? { phase: "bull" } : t < 30 ? { phase: "calm" } : t < 32 ? { phase: "rug-warning" } : t < 38 ? { phase: "rug" } : { phase: "calm" };
  }
  function He(p) { return p.x + p.w * (p.meme ? 0.74 : 0.5); }
  function ne(p) { return !!(p.risk && Math.abs(p.id) % 2 === 0); }
  function oe(p, t) { return !!(p.gone || (p.crackedAt != null && t.time - p.crackedAt > 0.65)); }
  function re(c, t) {
    if (c.started == null) return 0;
    const o = (t - c.started) % 3.3;
    return o < 0.9 || o >= 2.2 ? 0 : o < 1.18 ? (o - 0.9) / 0.28 : o < 1.85 ? 1 : 1 - (o - 1.85) / 0.35;
  }
  function De(p, t) {
    const o = (t + Math.abs(p.id) * 0.19) % 2.6;
    const i = p.meme === "Fwog" ? Math.max(0, Math.sin((o / 2.6) * Math.PI * 2)) : 0;
    const d = p.meme === "Doge" ? Math.sin(t * 1.8 + p.id) * 7 : 0;
    return { x: p.x + 5 + i * 17 + d, y: p.y + i * 37, w: 27, h: 29 };
  }
  function le(p) {
    if (p.meme !== "WIF") return null;
    const d = p.x > V / 2 ? -1 : 1;
    const x0 = p.x + 10, x1 = p.x + 10 + d * 90;
    return { x: Math.min(x0, x1), y: p.y + 28, w: 90, h: 50 };
  }
  function hit(e, x, y, w, h) { return e.x + 12 > x && e.x - 12 < x + w && e.y + 37 > y && e.y + 3 < y + h; }
  function px(p, t) { return p.kind === "moving" ? (p.homeX ?? p.x) + Math.sin(t * 1.5 + p.id) * 17 : p.x; }
  function gone(p, t) { return !!(p.gone || (p.crackedAt != null && t - p.crackedAt > 0.65)); }
  function candleOf(s, id) { return s.candles.find((c) => c.owner === id); }
  function mains(s) {
    return s.platforms.filter((p) => !p.green && !p.risk && !gone(p, s.time) && p.y > s.highestLanding + 1).sort((a, b) => a.y - b.y);
  }

  function clone(s) {
    return {
      viewHeight: s.viewHeight, x: s.x, y: s.y, vy: s.vy, facing: s.facing, camera: s.camera, peak: s.peak,
      boost: s.boost, alive: true, reason: "", seed: s.seed, nextId: s.nextId, time: s.time, landings: s.landings,
      boostFlash: 0, generatedX: s.generatedX, generatedY: s.generatedY, combo: s.combo, bestCombo: s.bestCombo,
      highestLanding: s.highestLanding, supers: s.supers, floor: s.floor, land: null,
      platforms: s.platforms.map((p) => ({
        id: p.id, x: p.x, homeX: p.homeX, y: p.y, w: p.w, green: p.green, risk: p.risk, kind: p.kind,
        gone: p.gone, crackedAt: p.crackedAt, meme: p.meme, rugWarnedAt: p.rugWarnedAt,
      })),
      candles: s.candles.map((c) => ({ x: c.x, y: c.y, w: c.w, h: c.h, owner: c.owner, started: c.started })),
    };
  }

  function step(e, dir) {
    if (!e.alive) return;
    const y0 = e.y, prev = z(e.time).phase;
    e.time += DT;
    const ph = z(e.time).phase;
    e.land = null;
    if (ph === "rug-warning")
      for (const p of e.platforms) ne(p) && p.y >= e.camera && p.y <= e.camera + e.viewHeight && (p.rugWarnedAt ??= e.time);
    if (ph === "rug" && prev !== "rug")
      for (const p of e.platforms) ne(p) && p.rugWarnedAt != null && e.time - p.rugWarnedAt >= 0.9 && (p.gone = true);
    if (ph === "calm" && prev === "rug") for (const p of e.platforms) p.rugWarnedAt = undefined;
    for (const p of e.platforms) if (p.kind === "moving") p.x = (p.homeX ?? p.x) + Math.sin(e.time * 1.5 + p.id) * 17;
    for (const c of e.candles) if (c.started == null && e.y > c.y - 155 && e.y < c.y + c.h + 75) c.started = e.time;
    e.x = Math.max(19, Math.min(V - 19, e.x + dir * SPD * DT));
    e.vy -= G * DT;
    e.y += e.vy * DT;
    for (const c of e.candles) {
      const g = re(c, e.time);
      if (g > 0.02 && (hit(e, c.x, c.y, c.w, c.h * g) || hit(e, c.x + c.w / 2 - 3, c.y - 9 * g, 6, (c.h + 23) * g))) {
        e.alive = false; e.reason = "candle"; return;
      }
    }
    for (const p of e.platforms) {
      if (oe(p, e) || !p.meme) continue;
      const m = De(p, e.time), hat = le(p);
      if (hit(e, m.x, m.y, m.w, m.h) || (hat && hit(e, hat.x, hat.y, hat.w, hat.h))) {
        e.alive = false; e.reason = "meme"; return;
      }
    }
    if (e.vy < 0) {
      let best = null;
      for (const p of e.platforms) {
        if (oe(p, e)) continue;
        if (y0 >= p.y && e.y <= p.y && e.x + 11 > p.x && e.x - 11 < p.x + p.w)
          if (!best || p.y > best.y) best = p;
      }
      if (best) {
        const perfect = best.y > e.highestLanding + 1 && Math.abs(e.x - He(best)) <= 12;
        e.combo = perfect ? e.combo + 1 : 0;
        e.highestLanding = Math.max(e.highestLanding, best.y);
        const sup = perfect && e.combo % 5 === 0;
        e.y = best.y;
        e.vy = sup ? 1060 : best.green ? 875 : ph === "bull" ? 760 : 640;
        e.boost = true;
        if (best.kind === "crumble") best.crackedAt ??= e.time;
        e.land = best;
      }
    }
    e.peak = Math.max(e.peak, e.y);
    e.camera = Math.max(e.camera, e.y - e.viewHeight * 0.48);
    if (e.time > 40) {
      e.floor = Math.max(e.floor + (18 + Math.min(16, e.time * 0.08)) * DT, e.camera - 110);
      if (e.y < e.floor) { e.alive = false; e.reason = "liq"; return; }
    }
    if (e.y + 50 < e.camera) { e.alive = false; e.reason = "miss"; }
  }

  function wifBands(s, y) {
    const bands = [];
    for (const p of s.platforms) {
      if (p.meme !== "WIF") continue;
      if (p.y + 90 < y - 20 || p.y > y + 140) continue;
      const d = p.x > 210 ? -1 : 1;
      const x0 = p.x + 10, x1 = p.x + 10 + d * 90;
      bands.push([Math.min(x0, x1) - 12, Math.max(x0, x1) + 12]);
    }
    return bands;
  }
  function spots(p, c, t, nxt, nxtC, wif) {
    const x = px(p, t), w = p.w, mid = x + w * 0.5;
    const outerR = x + w - 15, outerL = x + 15;
    const out = [];
    const avoid = c || nxtC;
    if (avoid) {
      const src = c || nxtC;
      const refX = c ? mid : px(nxt, t) + nxt.w * 0.5;
      if (src.x + 11 < refX) out.push(outerR, mid + 22);
      else out.push(outerL, mid - 22);
    } else if (nxt) {
      const nx = px(nxt, t + 0.7) + nxt.w * 0.5;
      if (nx > mid) out.push(outerR, mid + 18);
      else out.push(outerL, mid - 18);
    } else out.push(mid + 18, mid - 18);
    out.push(outerL, outerR);
    let list = [...new Set(out.map((v) => Math.max(x + 13, Math.min(x + w - 13, v))))];
    if (wif && wif.length) {
      const f = list.filter((v) => !wif.some(([a, b]) => v > a && v < b));
      if (f.length) list = f;
    }
    return list;
  }
  function dodgeDir(s, desired) {
    for (const c of s.candles) {
      const g = re(c, s.time);
      const warn = c.started != null && g <= 0.02 && re(c, s.time + 0.3) > 0.02;
      if (g <= 0.02 && !warn) continue;
      const gh = g > 0.02 ? g : 0.7;
      const near =
        hit(s, c.x - 10, c.y - 6, c.w + 20, c.h * gh + 12) ||
        hit(s, c.x + c.w / 2 - 7, c.y - 12 * gh, 14, (c.h + 24) * gh);
      if (!near) continue;
      const owner = s.platforms.find((p) => p.id === c.owner);
      if (owner) {
        const ox = px(owner, s.time);
        if (s.x + 12 > ox && s.x - 12 < ox + owner.w) return s.x < ox + owner.w * 0.5 ? 1 : -1;
      }
      return desired;
    }
    return desired;
  }
  function hopToward(s, targetX, useB, frames) {
    const e = clone(s);
    let used = 0;
    for (let i = 0; i < frames; i++) {
      if (useB && e.boost && !used && e.vy < 60) {
        e.vy = Math.max(e.vy, 650); e.boost = false; used = 1;
      }
      let dir = e.x < targetX - 4 ? 1 : e.x > targetX + 4 ? -1 : 0;
      dir = dodgeDir(e, dir);
      step(e, dir);
      if (!e.alive) return { ok: 0, e, land: null, used, why: e.reason, x: e.x };
      if (e.land) return { ok: 1, e, land: e.land, used, why: "land", x: e.x };
    }
    return { ok: e.alive ? 1 : 0, e, land: null, used, why: e.alive ? "air" : e.reason, x: e.x };
  }
  function brain(s) {
    const L = mains(s);
    const n = L[0], n2 = L[1];
    if (!n) return { d: 0, b: 0, m: "none", aim: s.x };
    const candidates = [];
    const add = (p, useB, tag, nxt) => {
      const c = candleOf(s, p.id);
      const nc = nxt ? candleOf(s, nxt.id) : undefined;
      const wif = wifBands(s, p.y);
      for (const ax of spots(p, c, s.time, nxt, nc, wif)) {
        const r = hopToward(s, ax, useB, 180);
        let sc;
        if (!r.ok) sc = r.e.y - 4e6;
        else if (!r.land) sc = r.e.y - 2e5;
        else if (r.land.green || r.land.risk) sc = r.land.y - 3e4;
        else {
          sc = 2e6 + r.land.y * 3 + Math.min(22, Math.min(r.x - r.land.x, r.land.x + r.land.w - r.x)) * 8;
          if (Math.abs(r.x - He(r.land)) <= 13) sc -= 250;
          const follow = L.find((q) => q.y > r.land.y + 1);
          if (follow) {
            const fx = px(follow, r.e.time + 0.7);
            const inner = r.x < fx ? fx + 16 : fx + follow.w - 16;
            sc += Math.max(-240, 210 - Math.abs(inner - r.x));
          }
          if (r.land.kind === "crumble") sc -= 25;
          if (r.used) sc -= 4;
        }
        candidates.push({ sc, aim: ax, b: useB, m: tag });
      }
    };
    add(n, 0, "L" + n.id, n2);
    if (s.boost) add(n, 1, "L" + n.id + "B", n2);
    if (n2) {
      add(n2, 0, "S" + n2.id, L[2]);
      if (s.boost) add(n2, 1, "S" + n2.id + "B", L[2]);
    }
    candidates.sort((a, b) => b.sc - a.sc);
    const safe = candidates.filter((c) => c.sc > 1e6);
    const best = safe.find((c) => !c.b) || safe[0] || candidates[0] || { aim: s.x, b: 0, m: "?" };
    const desired = s.x < best.aim - 4 ? 1 : s.x > best.aim + 4 ? -1 : 0;
    const d = dodgeDir(s, desired);
    return { d, b: best.b, m: best.m, aim: best.aim };
  }

  function kev(type, code, key, kc) {
    const o = { key, code, keyCode: kc, which: kc, bubbles: true, cancelable: true };
    const st = document.getElementById("climb-stage");
    if (st) st.dispatchEvent(new KeyboardEvent(type, o));
    window.dispatchEvent(new KeyboardEvent(type, o));
  }
  function hold(d) {
    if (I && I.current) {
      I.current.left = d === -1;
      I.current.right = d === 1;
    }
    const l = document.querySelector('[aria-label="Move left"]');
    const r = document.querySelector('[aria-label="Move right"]');
    const ev = (b, t) => { if (b) try { b.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 7, isPrimary: true })); } catch (e) {} };
    if (d !== H) {
      if (H < 0) kev("keyup", "ArrowLeft", "ArrowLeft", 37);
      if (H > 0) kev("keyup", "ArrowRight", "ArrowRight", 39);
      ev(l, "pointerup"); ev(r, "pointerup");
      H = d;
      if (d < 0) { kev("keydown", "ArrowLeft", "ArrowLeft", 37); ev(l, "pointerdown"); }
      if (d > 0) { kev("keydown", "ArrowRight", "ArrowRight", 39); ev(r, "pointerdown"); }
    }
  }
  function fireBoost(s) {
    if (!s || !s.boost || !s.alive) return;
    const st = document.getElementById("climb-stage");
    if (st) st.focus({ preventScroll: true });
    const btn = document.querySelector(".climb-boost-button");
    if (btn && !btn.disabled) {
      btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 8, isPrimary: true }));
      btn.click();
    }
    kev("keydown", "Space", " ", 32);
    kev("keyup", "Space", " ", 32);
    if (s.boost) {
      s.vy = Math.max(s.vy, 650);
      s.boost = false;
      s.boostFlash = 0.3;
    }
  }

  const bar = document.createElement("div");
  bar.style.cssText = "position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#7CFFB2;color:#111;padding:10px 16px;border-radius:12px;font:800 14px/1.2 sans-serif;box-shadow:0 8px 30px #0006;pointer-events:none";
  bar.textContent = "BOT v6 — روی کوه کلیک کن، بعد Start";
  document.body.appendChild(bar);

  const id = setInterval(() => {
    const rs = document.querySelector('[aria-label="Resume game"]');
    if (rs) rs.click();
    const st = document.getElementById("climb-stage");
    if (st && document.activeElement !== st) st.focus({ preventScroll: true });
    find();
    if (!S || !S.current) {
      bar.style.background = "#ffe085";
      bar.textContent = "روی خود بازی کلیک کن";
      return;
    }
    const s = S.current;
    const score = Math.max(0, Math.floor((s.peak - 80) * 3));
    if (!s.alive || s.time < 0.05) {
      hold(0);
      bar.style.background = "#ffe085";
      bar.textContent = (s.alive ? "Start را بزن  " : "باخت  ") + score + "m";
      return;
    }
    const now = performance.now();
    if (s.land || now - lastThink > 40) {
      try { dec = brain(s); } catch (err) { dec = { d: 0, b: 0, m: "ERR", aim: s.x }; }
      lastThink = now;
    }
    hold(dec.d);
    if (dec.b && s.boost && s.vy < 80 && s.time - boostedAt > 0.15) {
      fireBoost(s);
      boostedAt = s.time;
    }
    bar.style.background = String(dec.m).startsWith("S") ? "#9ad0ff" : "#7CFFB2";
    bar.textContent = "v6 " + dec.m + "  " + (dec.d > 0 ? ">" : dec.d < 0 ? "<" : ".") + (dec.b ? " B" : "") + "  " + score + "m";
  }, 8);

  window.__rbStop = () => {
    clearInterval(id);
    hold(0);
    bar.remove();
    window.__rb = 0;
    window.__rbStop = null;
  };
  window.addEventListener("keydown", (e) => {
    if (e.code === "F2" && window.__rbStop) window.__rbStop();
  });
})();
