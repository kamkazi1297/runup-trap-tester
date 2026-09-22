(()=>{if(window.__rbStop)try{window.__rbStop()}catch(e){}
window.__rb=25;
const V="v25",DT=1/120,MEMES=["Doge","WIF","Fwog","Benny"];
let S=null,I=null,H=99,P=null,hl=-1;
const isS=v=>v&&v.platforms&&v.candles&&typeof v.alive=="boolean"&&"highestLanding"in v;
const isI=v=>v&&typeof v.left=="boolean"&&typeof v.right=="boolean"&&!Array.isArray(v);
function fibers(el){if(!el)return[];const o=[];for(const k of Object.keys(el))if(k.startsWith("__reactFiber")k.startsWith("__reactContainer")||k.startsWith("__reactInternalInstance")){o.push(el[k]);if(el[k]&&el[k]._internalRoot)o.push(el[k]._internalRoot.current)}return o}
function find(){
  const g={},q=fibers(document.getElementById("climb-stage")).concat(fibers(document.getElementById("root"))),seen=new Set();
  document.querySelectorAll("canvas").forEach(c=>{fibers(c).forEach(f=>q.push(f));if(c.parentElement)fibers(c.parentElement).forEach(f=>q.push(f))});
  let n=0;while(q.length&&n++<8e3){const f=q.pop();if(!f||typeof f!="object"||seen.has(f))continue;seen.add(f);
    let h=f.memoizedState,i=0;while(h&&i++<90){const v=h.memoizedState;if(v&&typeof v=="object"){if(isS(v)&&(!g.s||v.time>=(g.s.time||0)))g.s=v;if(isI(v))g.i=v;if(v.current&&isS(v.current)&&(!g.sr||v.current.time>=((g.sr.current&&g.sr.current.time)||0)))g.sr=v;if(v.current&&isI(v.current))g.ir=v}h=h.next}
    if(f.return)q.push(f.return);if(f.child)q.push(f.child);if(f.sibling)q.push(f.sibling)}
  S=g.sr(g.s?{current:g.s}:S);I=g.ir||(g.i?{current:g.i}:I);
}
function key(t,c,k){const e=new KeyboardEvent(t,{key:c,code:c,keyCode:k,which:k,bubbles:!0,cancelable:!0});window.dispatchEvent(e);document.dispatchEvent(e);const st=document.getElementById("climb-stage");if(st)st.dispatchEvent(e)}
function dirHold(d){if(I&&I.current){I.current.left=d===-1;I.current.right=d===1}if(d!==H){if(H<0)key("keyup","ArrowLeft",37);if(H>0)key("keyup","ArrowRight",39);H=d}if(d<0)key("keydown","ArrowLeft",37);if(d>0)key("keydown","ArrowRight",39)}
function tapBoost(s){if(!s||!s.boost||!s.alive)return;s.vy=Math.max(s.vy,650);s.boost=!1;s.boostFlash=.3;key("keydown"," ",32);key("keydown","Space",32);setTimeout(()=>{key("keyup"," ",32);key("keyup","Space",32)},40)}
function phaseOf(t){if(t<24)return"calm";const u=(t-24)%64;return u<8?"bull":u<30?"calm":u<32?"rug-warning":u<38?"rug":"calm"}
function rng(st){st.seed=Math.imul(st.seed,1664525)+1013904223>>>0;return st.seed/4294967296}
function generate(st){
  while(st.generatedY<st.camera+st.viewHeight+180){
    const id=st.nextId++,w=Math.max(98,130-id*.6),prev=st.generatedX>160?1:-1,side=id%6===0?prev:-prev;
    const x=side>0?232+rng(st)*14:38+rng(st)*20,y=st.generatedY+94+rng(st)*10;
    const kind=id>=8&&id%8===0?"moving":id>=12&&id%8===4?"crumble":undefined;
    st.platforms.push({id,x,homeX:x,y,w,green:false,kind});
    if(id>=2&&id%8===2){const gx=x>155?42:292,meme=id>=10&&id%16===10?MEMES[Math.floor((id-10)/16)%4]:undefined;st.platforms.push({id:-id,x:gx,y:y+23,w:82,green:true,risk:true,meme})}
    if(id>=6&&id%8===6)st.candles.push({x:side>0?x+3:x+w-25,y:y-58,w:22,h:78,owner:id});
    const ben=st.platforms.find(p=>p.id===-id&&p.meme==="Benny");
    if(ben)st.candles.push({x:ben.x+25,y:ben.y-50,w:20,h:70,owner:ben.id});
    st.generatedY=y;st.generatedX=x;
  }
  st.platforms=st.platforms.filter(p=>p.y>st.camera-110);
  st.candles=st.candles.filter(c=>c.y+c.h>st.camera-110);
}
function cphase(c,t){if(c.started===undefined)return 0;const o=(t-c.started)%3.3;return o<.9||o>=2.2?0:o<1.18?(o-.9)/.28:o<1.85?1:1-(o-1.85)/.35}
function gone(p,st){return !!(p.gone||(p.crackedAt!==undefined&&st.time-p.crackedAt>.65))}
function dia(p){return p.x+p.w*(p.meme?.74:.5)}
function body(p,t){const o=(t+Math.abs(p.id)*.19)%2.6,hop=p.meme==="Fwog"?Math.max(0,Math.sin(o/2.6*Math.PI*2)):0,dog=p.meme==="Doge"?Math.sin(t*1.8+p.id)*7:0;return{x:p.x+5+hop*17+dog,y:p.y+hop*37,w:27,h:29}}
function hat(p,t){if(p.meme!=="WIF")return null;const o=(t+Math.abs(p.id)*.13)%3.6;if(o<1.2||o>2.7)return null;const i=(o-1.2)/1.5,d=p.x>210?-1:1;return{x:p.x+10+d*i*90,y:p.y+40+Math.sin(i*Math.PI)*30,w:25,h:15}}
[01/07/1405 00:39] R: function hits(st,x,y,w,h){return st.x+12>x&&st.x-12<x+w&&st.y+37>y&&st.y+3<y+h}
function clone(st){return{...st,platforms:st.platforms.map(p=>({...p})),candles:st.candles.map(c=>({...c}))}}
function tick(st,dir,doB){
  if(!st.alive)return;
  if(doB&&st.boost){st.vy=Math.max(st.vy,650);st.boost=false}
  const y0=st.y,ph0=phaseOf(st.time);
  st.time+=DT;const ph=phaseOf(st.time);
  if(ph==="rug-warning")for(const p of st.platforms)if(p.risk&&Math.abs(p.id)%2===0&&p.y>=st.camera&&p.y<=st.camera+st.viewHeight)p.rugWarnedAt??=st.time;
  if(ph==="rug"&&ph0!=="rug")for(const p of st.platforms)if(p.risk&&Math.abs(p.id)%2===0&&p.rugWarnedAt!==undefined&&st.time-p.rugWarnedAt>=.9)p.gone=true;
  if(ph==="calm"&&ph0==="rug")for(const p of st.platforms)p.rugWarnedAt=undefined;
  for(const p of st.platforms)if(p.kind==="moving")p.x=(p.homeX??p.x)+Math.sin(st.time*1.5+p.id)*17;
  for(const c of st.candles)if(c.started===undefined&&st.y>c.y-155&&st.y<c.y+c.h+75)c.started=st.time;
  st.x=Math.max(19,Math.min(401,st.x+dir*255*DT));if(dir)st.facing=dir;
  st.vy-=1700*DT;st.y+=st.vy*DT;
  for(const c of st.candles){const g=cphase(c,st.time);if(g>.02&&(hits(st,c.x,c.y,c.w,c.h*g)hits(st,c.x+c.w/2-3,c.y-9*g,6,(c.h+23)*g))){st.alive=false;st.reason="candle";return}}
  for(const p of st.platforms)if(!gone(p,st)&&p.meme){const b=body(p,st.time),h=hat(p,st.time);if(hits(st,b.x,b.y,b.w,b.h)(h&&hits(st,h.x,h.y,h.w,h.h))){st.alive=false;st.reason=h&&hits(st,h.x,h.y,h.w,h.h)?"hat":p.meme;return}}
  const land=st.vy<0?st.platforms.filter(p=>!gone(p,st)&&y0>=p.y&&st.y<=p.y&&st.x+11>p.x&&st.x-11<p.x+p.w).sort((a,b)=>b.y-a.y)[0]:undefined;
  if(land){const perfect=land.y>st.highestLanding+1&&Math.abs(st.x-dia(land))<=12;st.combo=perfect?st.combo+1:0;st.bestCombo=Math.max(st.bestCombo,st.combo);st.highestLanding=Math.max(st.highestLanding,land.y);const sup=perfect&&st.combo%5===0;st.y=land.y;st.vy=sup?1060:land.green?875:ph==="bull"?760:640;st.boost=true;st.landings++;if(land.kind==="crumble")land.crackedAt??=st.time;if(sup)st.supers++;st._landed=land}else st._landed=null;
  st.peak=Math.max(st.peak,st.y);st.camera=Math.max(st.camera,st.y-st.viewHeight*.48);
  if(st.time>40){st.floor=Math.max(st.floor+(18+Math.min(16,st.time*.08))*DT,st.camera-110);if(st.y<st.floor){st.alive=false;st.reason="floor";return}}
  if(st.y+50<st.camera){st.alive=false;st.reason="miss";return}
  generate(st);
}
function px(p,t){return p.kind==="moving"?(p.homeX??p.x)+Math.sin(t*1.5+p.id)*17:p.x}
function flee(s){
  for(const c of s.candles){
    const g=cphase(c,s.time); if(g<.02) continue;
    if(s.y+37<c.y-8||s.y+3>c.y+c.h*g+8) continue;
    if(s.x+16>c.x-10&&s.x-16<c.x+c.w+10) return s.x<c.x+c.w/2?-1:1;
  }
  for(const p of s.platforms)if(!gone(p,s)&&p.meme){
    const b=body(p,s.time),h=hat(p,s.time);
    const boxes=[b]; if(h) boxes.push(h);
    if(p.meme==="Fwog") boxes.push({x:p.x+5,y:p.y,w:44,h:66});
    for(const w of boxes){
      if(s.y+37<w.y-4||s.y+3>w.y+w.h+4) continue;
      if(s.x+14>w.x-8&&s.x-14<w.x+w.w+8) return s.x<w.x+w.w/2?-1:1;
    }
  }
  return 0;
}
function steer(s,aim){const f=flee(s); if(f) return f; return s.x<aim-5?1:s.x>aim+5?-1:0}
function safeAims(st,p){
  const x=px(p,st.time),w=p.w,c=st.candles.find(z=>z.owner===p.id);
  let lo=x+16,hi=x+w-16,aims=[],walls=[];
  if(c)walls.push([c.x-16,c.x+c.w+16]);
  for(const k of st.candles){
    if(k.owner===p.id)continue;
    const owner=st.platforms.find(z=>z.id===k.owner); if(!owner)continue;
    if(owner.y<p.y-20||owner.y>p.y+140)continue;
    walls.push([k.x-14,k.x+k.w+14]);
  }
  for(const g of st.platforms){
    if(!g.green||!g.meme||gone(g,st))continue;
    if(Math.abs(g.y-p.y)>80)continue;
    const b=body(g,st.time); walls.push([b.x-8,b.x+b.w+8]);
    if(g.meme==="WIF"){const d=g.x>210?-1:1,x0=g.x+10,x1=g.x+10+d*90;walls.push([Math.min(x0,x1)-2,Math.max(x0,x1)+27]);}
  }
  let segs=[[lo,hi]];
  for(const [wl,wr] of walls){
    const next=[];
    for(const [a,b] of segs){
      if(b<wl||a>wr)next.push([a,b]);
      else{if(a<wl)next.push([a,Math.min(b,wl)]);if(b>wr)next.push([Math.max(a,wr),b])}
[01/07/1405 00:39] R: }
    segs=next.filter(s=>s[1]-s[0]>=12);
  }
  for(const [a,b] of segs){aims.push((a+b)/2);if(b-a>18){aims.push(a+7);aims.push(b-7)}}
  if(!aims.length)aims.push(c&&c.x<x+w*.5?x+w-20:x+20);
  return[...new Set(aims.map(v=>Math.round(Math.max(22,Math.min(398,v)))))];
}
function simJump(st,aim,useB){
  const s=clone(st),hl0=s.highestLanding;let used=0;
  for(let i=0;i<260;i++){
    const d=steer(s,aim);
    const doB=useB&&!used&&s.boost&&s.vy<90; if(doB)used=1;
    tick(s,d,doB);
    if(!s.alive)return{ok:0,reason:s.reason,s,y:s.y};
    if(s._landed&&s._landed.y>hl0+1){
      if(s._landed.green)return{ok:0,reason:"green",s,y:s.y};
      return{ok:1,reason:"ok",s,land:s._landed,y:s.y};
    }
  }
  return{ok:0,reason:"air",s,y:s.y};
}
function nextOk(st){
  const L=st.platforms.filter(p=>!p.green&&!gone(p,st)&&p.y>st.highestLanding+1).sort((a,b)=>a.y-b.y);
  for(let i=0;i<Math.min(2,L.length);i++){
    for(const aim of safeAims(st,L[i]).slice(0,2)){
      for(const b of[0,1]){if(simJump(st,aim,!!b).ok)return 1}
    }
  }
  return 0;
}
function think(st){
  const L=st.platforms.filter(p=>!p.green&&!gone(p,st)&&p.y>st.highestLanding+1).sort((a,b)=>a.y-b.y);
  let best=null,bestN=null;
  const cur=st.platforms.find(p=>!p.green&&Math.abs(p.y-st.highestLanding)<3);
  const crumbling=!!(cur&&cur.kind==="crumble");
  const cx=cur?px(cur,st.time):st.x;
  for(let i=0;i<Math.min(3,L.length);i++){
    const p=L[i]; if(crumbling&&p===cur)continue;
    const same=cur?((px(p,st.time)>160)===(cx>160)):false;
    for(const aim of safeAims(st,p)){
      for(const b of[0,1]){
        const r=simJump(st,aim,!!b);
        const nxt=r.ok&&nextOk(r.s)?1:0;
        const sc=(r.ok?1e7:0)+nxt*8e6+(same?6e5:0)+(r.land?r.land.y:0)*8+r.y-i*50-(b?25:0);
        const row={sc,aim,b:!!b,id:p.id,ok:r.ok,nxt,reason:r.reason,same};
        if(!best||sc>best.sc)best=row;
        if(r.ok&&nxt&&(!bestN||sc>bestN.sc))bestN=row;
      }
    }
  }
  return bestN||best||{aim:st.x,b:false,id:"?",ok:0,nxt:0,reason:"none"};
}
function snap(s){
  return{
    viewHeight:s.viewHeight,x:s.x,y:s.y,vy:s.vy,facing:s.facing,camera:s.camera,peak:s.peak,boost:s.boost,alive:s.alive,reason:s.reason||"",
    platforms:s.platforms.map(p=>({id:p.id,x:p.x,homeX:p.homeX,y:p.y,w:p.w,green:!!p.green,kind:p.kind,risk:p.risk,meme:p.meme,gone:p.gone,crackedAt:p.crackedAt,rugWarnedAt:p.rugWarnedAt})),
    candles:s.candles.map(c=>({x:c.x,y:c.y,w:c.w,h:c.h,owner:c.owner,started:c.started})),
    seed:s.seed,nextId:s.nextId,time:s.time,landings:s.landings,generatedX:s.generatedX,generatedY:s.generatedY,
    combo:s.combo,bestCombo:s.bestCombo,highestLanding:s.highestLanding,supers:s.supers,floor:s.floor,_landed:null
  };
}
function overlay(s){
  const st=document.getElementById("climb-stage"); if(!st)return;
  let ov=document.getElementById("rbov");
  if(!ov){ov=document.createElement("canvas");ov.id="rbov";ov.style.cssText="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:50";st.appendChild(ov)}
  const h=s.viewHeight||680; if(ov.width!==420||ov.height!==h){ov.width=420;ov.height=h}
  const g=ov.getContext("2d"),Y=y=>h-y+s.camera;
  g.clearRect(0,0,420,h);
  for(const c of s.candles){
    const ph=cphase(c,s.time);
    g.fillStyle=ph>.02?"rgba(255,40,80,.45)":c.started!==undefined?"rgba(255,200,40,.35)":"rgba(255,80,80,.2)";
    g.fillRect(c.x-2,Y(c.y+c.h+18),c.w+4,c.h+36);
  }
  for(const p of s.platforms){
    if(!p.meme||gone(p,s))continue;
    const b=body(p,s.time);
    g.strokeStyle="#7CFFB2"; g.lineWidth=2; g.strokeRect(b.x,Y(b.y+b.h),b.w,b.h);
    g.fillStyle="#7CFFB2"; g.font="800 10px sans-serif"; g.fillText(p.meme,b.x,Y(b.y+b.h)-4);
    const ht=hat(p,s.time);
    if(ht){g.fillStyle="rgba(255,80,180,.45)"; g.fillRect(ht.x,Y(ht.y+ht.h),ht.w,ht.h); g.fillStyle="#ff7ad9"; g.fillText("HAT",ht.x,Y(ht.y+ht.h)-2)}
  }
  if(P){g.fillStyle="#ffe085"; g.beginPath(); g.arc(P.aim,Y(s.y)-8,6,0,7); g.fill()}
}
[01/07/1405 00:39] R: const bar=document.createElement("div");
bar.id="rbbar";
bar.style.cssText="position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#7CFFB2;color:#111;padding:10px 16px;border-radius:12px;font:800 14px sans-serif;cursor:pointer";
bar.textContent=V+" ON â€” click mountain, then Start";
bar.ondblclick=()=>window.__rbStop&&window.__rbStop();
document.body.appendChild(bar);
const id=setInterval(()=>{
  const rs=document.querySelector('[aria-label="Resume game"]'); if(rs)rs.click();
  find();
  if(!S||!S.current){bar.textContent=V+" click the mountain";return}
  const s=S.current;
  if(!s.alive||s.time<.05){dirHold(0);P=null;hl=-1;bar.textContent=V+" press Start  "+Math.max(0,Math.floor((s.peak-80)*3))+"m";bar.style.background="#ffe085";return}
  if(!P||s.highestLanding>hl+1){hl=s.highestLanding;P=think(snap(s))}
  const d=steer(s,P.aim);
  dirHold(d);
  if(P.b&&s.boost&&s.vy<90){tapBoost(s);P.b=false}
  overlay(s);
  bar.style.background=P.ok?(P.same?"#9dffa8":"#7CFFB2"):"#ffd36a";
  bar.textContent=V+" "+(P.same?"UP":"ZZ")+" L"+P.id+(P.ok?"":"!")+(P.nxt?"":"?")+" "+(d>0?">":d<0?"<":".")+(P.b?" B":"")+"  "+Math.max(0,Math.floor((s.peak-80)*3))+"m";
},8);
window.__rbStop=()=>{clearInterval(id);dirHold(0);bar.remove();const ov=document.getElementById("rbov");if(ov)ov.remove();window.__rbStop=null;window.__rb=0};
window.addEventListener("keydown",e=>{if(e.code==="F2"&&window.__rbStop)window.__rbStop()});
alert(V+" ON");
})();
