// ==UserScript==
// @name         RUNUP trap tester v6
// @match        https://runup.fun/game*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(()=>{if(window.rbStop)try{window.rbStop()}catch(e){}
window.__rb=1;
let S=null,I=null,H=99,LOCK={aim:210,b:0,hl:-1,id:0};
const isS=v=>v&&v.platforms&&v.candles&&typeof v.alive=="boolean"&&"highestLanding"in v;
const isI=v=>v&&typeof v.left=="boolean"&&typeof v.right=="boolean"&&!Array.isArray(v);
function fibers(el){if(!el)return[];const o=[];for(const k of Object.keys(el))if(k.startsWith("reactFiber")k.startsWith("reactInternalInstance")k.startsWith("__reactContainer")){o.push(el[k]);if(el[k]&&el[k]._internalRoot)o.push(el[k]._internalRoot.current)}return o}
function find(){const q=fibers(document.getElementById("climb-stage")).concat(fibers(document.getElementById("root")));document.querySelectorAll("canvas").forEach(c=>{fibers(c).forEach(f=>q.push(f));fibers(c.parentElement).forEach(f=>q.push(f))});const seen=new Set();let g={};let n=0;
while(q.length&&n++<9000){const f=q.pop();if(!ftypeof f!="object"seen.has(f))continue;seen.add(f);
let h=f.memoizedState,i=0;while(h&&i++<90){const v=h.memoizedState;if(v&&typeof v=="object"){if(isS(v)&&(!g.sv.time>=(g.s.time0)))g.s=v;if(isI(v))g.i=v;if(v.current&&isS(v.current)&&(!g.srv.current.time>=((g.sr.current&&g.sr.current.time)0)))g.sr=v;if(v.current&&isI(v.current))g.ir=v}h=h.next}
if(f.return)q.push(f.return);if(f.child)q.push(f.child);if(f.sibling)q.push(f.sibling)}
S=g.sr(g.s?{current:g.s}:S);I=g.ir(g.i?{current:g.i}:I)}
function K(t,c,k){const o={key:c,code:c,keyCode:k,which:k,bubbles:!0,cancelable:!0};window.dispatchEvent(new KeyboardEvent(t,o));document.dispatchEvent(new KeyboardEvent(t,o));const st=document.getElementById("climb-stage");if(st)st.dispatchEvent(new KeyboardEvent(t,o))}
function dir(d){if(I&&I.current){I.current.left=d===-1;I.current.right=d===1}if(d!==H){if(H<0)K("keyup","ArrowLeft",37);if(H>0)K("keyup","ArrowRight",39);H=d}if(d<0)K("keydown","ArrowLeft",37);if(d>0)K("keydown","ArrowRight",39);const L=document.querySelector('[aria-label="Move left"]'),R=document.querySelector('[aria-label="Move right"]');const ev=(b,t)=>b&&b.dispatchEvent(new PointerEvent(t,{bubbles:!0,pointerId:7}));if(d!==0){ev(L,"pointerup");ev(R,"pointerup");if(d<0)ev(L,"pointerdown");if(d>0)ev(R,"pointerdown")}}
function boost(){K("keydown","Space",32);const b=document.querySelector('[aria-label="Boost"]')||document.querySelector(".climb-boost");if(b){b.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,pointerId:8}));setTimeout(()=>b.dispatchEvent(new PointerEvent("pointerup",{bubbles:!0,pointerId:8})),40)}setTimeout(()=>K("keyup","Space",32),50)}
function gone(p,t){return!!(p.gone||p.crackedAt!=null&&t-p.crackedAt>.65)}
function candle(s,id){return s.candles.find(c=>c.owner===id)}
function mains(s){return s.platforms.filter(p=>!p.green&&!p.risk&&!gone(p,s.time)&&p.y>s.highestLanding+1).sort((a,b)=>a.y-b.y)}
function aims(p,s){let lo=p.x+18,hi=p.x+p.w-18;const c=candle(s,p.id);if(c){if(c.x<p.x+p.w*.5)lo=Math.max(lo,c.x+c.w+18);else hi=Math.min(hi,c.x-18)}if(hi<lo)return[];return[(lo+hi)/2,lo,hi]}
function Hbox(x,y,bx,by,bw,bh){return x+12>bx&&x-12<bx+bw&&y+37>by&&y+3<by+bh}
function memeAt(p,t){const o=(t+Math.abs(p.id)*.19)%2.6,i=p.meme==="Fwog"?Math.max(0,Math.sin(o/2.6*Math.PI*2)):0,d=p.meme==="Doge"?Math.sin(t*1.8+p.id)*7:0;return{x:p.x+5+i*17+d,y:p.y+i*37,w:27,h:29}}
function hatAt(p,t){if(p.meme!=="WIF")return null;const o=(t+Math.abs(p.id)*.13)%3.6;if(o<1.2||o>2.7)return null;const i=(o-1.2)/1.5,d=p.x>210?-1:1;return{x:p.x+10+d*i*90,y:p.y+40+Math.sin(i*Math.PI)*30,w:25,h:15}}
function px(p,t){return p.kind==="moving"?(p.homeX??p.x)+Math.sin(t*1.5+p.id)*17:p.x}
function fly(s,aim,useB){let x=s.x,y=s.y,vy=s.vy,t=s.time,b=s.boost,used=0;for(let k=0;k<170;k++){t+=1/120;if(useB&&b&&!used&&vy<90){vy=Math.max(vy,650);b=0;used=1}const d=x<aim-6?1:x>aim+6?-1:0;x=Math.max(19,Math.min(401,x+d*255/120));vy-=1700/120;const y0=y;y+=vy/120;
[31/06/1405 16:05] R: for(const c of s.candles){if(Hbox(x,y,c.x,c.y,c.w,c.h)||Hbox(x,y,c.x+c.w/2-3,c.y-9,6,c.h+23))return{ok:0}}
for(const p of s.platforms){if(gone(p,t)!p.meme)continue;const m=memeAt(p,t),h=hatAt(p,t);if(Hbox(x,y,m.x,m.y,m.w,m.h)h&&Hbox(x,y,h.x,h.y,h.w,h.h))return{ok:0}}
if(vy<0){let best=null;for(const p of s.platforms){if(gone(p,t)p.green)continue;const qx=px(p,t);if(y0>=p.y&&y<=p.y&&x+11>qx&&x-11<qx+p.w)if(!bestp.y>best.y)best=p}if(best)return{ok:1,land:best,x,aim}}}
return{ok:0}}
function plan(s){const L=mains(s);let best=null;for(let i=0;i<Math.min(5,L.length);i++){const p=L[i];for(const a of aims(p,s)){const bs=i>0?[0,1]:[0];for(const b of bs){const r=fly(s,a,!!b);if(r.ok&&r.land&&r.land.y>s.highestLanding+1){const sc=r.land.y-i*10-(b?4:0);if(!best||sc>best.sc)best={sc,a,b:!!b,id:r.land.id}}}}}
if(best)return best;if(L[0])return{a:L[0].x+L[0].w*.5,b:0,id:L[0].id};return{a:s.x,b:0,id:0}}
const bar=document.createElement("div");
bar.style.cssText="position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#7CFFB2;color:#111;padding:10px 16px;border-radius:12px;font:800 14px sans-serif;cursor:pointer";
bar.textContent="v16 ON — click mountain, then Start";
bar.ondblclick=()=>window.rbStop&&window.rbStop();
document.body.appendChild(bar);
const id=setInterval(()=>{const rs=document.querySelector('[aria-label="Resume game"]');if(rs)rs.click();find();if(!S!S.current){bar.textContent="v16 click the mountain";return}const s=S.current;if(!s.alives.time<.05){dir(0);bar.textContent="v16 press Start  "+Math.max(0,Math.floor((s.peak-80)*3))+"m";LOCK.hl=-1;return}
if(LOCK.hl!==s.highestLanding){const p=plan(s);LOCK.aim=p.a;LOCK.b=p.b;LOCK.hl=s.highestLanding;LOCK.id=p.id}
const d=s.x<LOCK.aim-6?1:s.x>LOCK.aim+6?-1:0;dir(d);if(LOCK.b&&s.boost&&s.vy<90)boost();
bar.textContent="v16 T"+LOCK.id+" "+(d>0?">":d<0?"<":".")+(LOCK.b?" B":"")+"  "+Math.max(0,Math.floor((s.peak-80)*3))+"m"},8);
window.rbStop=()=>{clearInterval(id);dir(0);bar.remove();window.rb=0;window.__rbStop=null};
alert("v16 ON");
})();
