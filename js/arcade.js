"use strict";
// ======================= ARCADE DE LA OFICINA · selector de juego + utilidades compartidas =======================
// Cada juego vive en su propia función (sin variables globales compartidas). Solo se arranca el que se elige.
const ARCADE=(()=>{
 const BAD=new Set(['__proto__','constructor','prototype']);
 // copia profunda de datos recibidos por la red: sin claves peligrosas, con límites de tamaño y profundidad
 function clean(v,d){d=d||0;if(d>10)return null;const t=typeof v;
  if(v===null||t==='boolean')return v;
  if(t==='number')return Number.isFinite(v)?v:0;
  if(t==='string')return v.length>400?v.slice(0,400):v;
  if(Array.isArray(v)){const n=Math.min(v.length,600),o=new Array(n);for(let i=0;i<n;i++)o[i]=clean(v[i],d+1);return o;}
  if(t==='object'){const o={};let n=0;for(const k of Object.keys(v)){if(BAD.has(k)||k.length>40)continue;if(++n>200)break;o[k]=clean(v[k],d+1);}return o;}
  return null;}
 const cache=new WeakMap();
 // limpia una sola vez por objeto recibido (mantiene la identidad entre cuadros)
 function cleanOnce(v){if(!v||typeof v!=='object')return clean(v);let c=cache.get(v);if(!c){c=clean(v);cache.set(v,c);}return c;}
 // apodos: solo letras, números y signos simples, máximo 12
 function nick(s){return String(s==null?'':s).toUpperCase().normalize('NFC').replace(/[^A-Z0-9ÁÉÍÓÚÑÜ .\-_]/g,'').trim().slice(0,12);}
 function num(v,lo,hi,d){return typeof v==='number'&&Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):d;}
 function back(){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}location.reload();}
 return {clean,cleanOnce,nick,num,back,game:null};
})();

const ARCADE_GAMES={};
(function(){
 const cv=document.getElementById('c'),g=cv.getContext('2d'),W=256,H=144;g.imageSmoothingEnabled=false;
 const P=["#000000","#1D2B53","#7E2553","#008751","#AB5236","#5F574F","#C2C3C7","#FFF1E8","#FF004D","#FFA300","#FFEC27","#00E436","#29ADFF","#83769C","#FF77A8","#FFCCAA"];
 const col=c=>typeof c==='number'?P[c]:c;
 function fit(){const s=Math.min(innerWidth/W,innerHeight/H);const k=s>=4?Math.floor(s):s;cv.style.width=(W*k)+'px';cv.style.height=(H*k)+'px';}
 function R(x,y,w,h,c){g.fillStyle=col(c);g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
 const F={A:"01110100011000111111100011000110001",B:"11110100011000111110100011000111110",C:"01110100011000010000100001000101110",D:"11110100011000110001100011000111110",E:"11111100001000011110100001000011111",F:"11111100001000011110100001000010000",G:"01110100011000010111100011000101111",H:"10001100011000111111100011000110001",I:"01110001000010000100001000010001110",J:"00111000100001000010000101001001100",K:"10001100101010011000101001001010001",L:"10000100001000010000100001000011111",M:"10001110111010110101100011000110001",N:"10001100011100110101100111000110001",O:"01110100011000110001100011000101110",P:"11110100011000111110100001000010000",Q:"01110100011000110001101011001001101",R:"11110100011000111110101001001010001",S:"01111100001000001110000010000111110",T:"11111001000010000100001000010000100",U:"10001100011000110001100011000101110",V:"10001100011000110001100010101000100",W:"10001100011000110101101011010101010",X:"10001100010101000100010101000110001",Y:"10001100010101000100001000010000100",Z:"11111000010001000100010001000011111",
 "0":"01110100011001110101110011000101110","1":"00100011000010000100001000010001110","2":"01110100010000100010001000100011111","3":"11111000100010000010000011000101110","4":"00010001100101010010111110001000010","5":"11111100001111000001000011000101110","6":"00110010001000011110100011000101110","7":"11111000010001000100010000100001000","8":"01110100011000101110100011000101110","9":"01110100011000101111000010001001100",
 " ":"00000000000000000000000000000000000",".":"00000000000000000000000000000000100",":":"00000001000000000000000000010000000","-":"00000000000000001110000000000000000","·":"00000000000000000100000000000000000","!":"00100001000010000100001000000000100","?":"01110100010000100010001000000000100","▶":"01000011000111001111011100110001000","←":"00000001000100011111010000010000000","→":"00000001000001011111000100010000000","¡":"00100000000010000100001000010000100","/":"00001000010001000100010001000010000","+":"00000001000010011111001000010000000"};
 const ACC={"Á":"A","É":"E","Í":"I","Ó":"O","Ú":"U","Ñ":"N"};
 function T(s,x,y,c,sc=1,sh=null){s=String(s).toUpperCase();for(let k=0;k<s.length;k++){let ch=s[k],mark=null;if(ACC[ch]){mark=ch==="Ñ"?["01101"]:["00010","00100"];ch=ACC[ch];}const gl=F[ch]||F["?"];const ox=x+k*6*sc;for(const [cc,d] of (sh!==null?[[sh,1],[c,0]]:[[c,0]])){for(let i=0;i<35;i++)if(gl[i]==="1")R(ox+(i%5+d)*sc,y+(Math.floor(i/5)+d)*sc,sc,sc,cc);if(mark)mark.forEach((mr,mj)=>{for(let i=0;i<5;i++)if(mr[i]==="1")R(ox+(i+d)*sc,y+(-mark.length-1+mj+d)*sc,sc,sc,cc);});}}}
 const TW=(s,sc=1)=>String(s).length*6*sc-sc;
 const TC=(s,y,c,sc=1,sh=null,cx=W/2)=>T(s,Math.round(cx-TW(s,sc)/2),y,c,sc,sh);
 function SPR(rows,x,y,map,flip,sc=2){for(let j=0;j<rows.length;j++){const r=flip?[...rows[j]].reverse().join(''):rows[j];for(let i=0;i<r.length;i++){const m=map[r[i]];if(m!==undefined)R(x+i*sc,y+j*sc,sc,sc,m);}}}
 // dos boxeadores y un kart, en el mismo estilo pixel de los juegos
 const B1=["....hhhh......","...hhhhhh.....","...hsssss.....","...sesses.gg..","...ssssss.ggg.","....ssss.sgg..","..tttttts.....",".gtttttt......",".ggtttttt.....","..sttttt......","...tttttt.....","...pppppp.....","...pp..pp.....","...pp..pp.....","..pp....pp....",".bbb....bbb..."];
 const B2=["....hhhh......","...hhhhhh.....","...hsssss.....","...sesses.....","...ssssss.....","....ssss......","..ttttttsssggg",".gttttttt..ggg",".ggtttttt.....","..sttttt......","...tttttt.....","...pppppp.....","...pp..pp.....","...pp..pp.....","..pp....pp....",".bbb....bbb..."];
 const KART=["......hhhh......",".....hsssss.....",".....sesses.....","......ssss......","....kkwwkk......","..rrkkkkkkrr....",".rrrrrrrrrrrrr..","rrryyrrrrrrrrrr.","rrrrrrrrrrrrrrrr","00.rrrrrrrrr.00.","000.........000.","00...........00."];
 const STARS=[];{let a=7;const r=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};for(let i=0;i<50;i++)STARS.push([Math.floor(r()*W),Math.floor(r()*70),r()*6]);}
 const GAMES=[{id:'dm',n:'DEATHMATCH',s:'PELEA 1 VS 1',l:['9 LUCHADORES','FATALITIES','ONLINE 1 VS 1'],c:8,bg:'#3A0E1C'},{id:'kart',n:'DEATHKART',s:'CARRERAS',l:['9 PILOTOS','3 PISTAS · ÍTEMS','ONLINE HASTA 4'],c:12,bg:'#0E2A48'}];
 let sel=0,alive=true;try{const v=localStorage.getItem('arcade_last');if(v==='kart')sel=1;}catch(e){}
 function draw(now){if(!alive)return;const t=now/1000;
  for(let y=0;y<H;y+=6)R(0,y,W,6,y<60?"#0B1020":(y<100?"#101838":"#141C36"));for(const [x,y,ph] of STARS)if(Math.sin(t*3+ph)>-0.3)R(x,y,1,1,Math.sin(t*2+ph)>0.6?7:6);
  R(0,6,W,28,"rgba(0,0,0,0.55)");TC("ARCADE DE LA OFICINA",9,10,2,2);TC("ELIGE UN JUEGO",26,7,1,0);
  GAMES.forEach((G,i)=>{const x=10+i*124,y=38,w=112,h=86,s=i===sel;R(x-2,y-2,w+4,h+4,s?(Math.floor(t*4)%2?10:9):1);R(x,y,w,h,G.bg);
   T(G.n,x+Math.round((w-TW(G.n))/2),y+4,s?10:7,1,0);T(G.s,x+Math.round((w-TW(G.s))/2),y+13,G.c,1,0);
   if(G.id==='dm'){const b=Math.round(Math.sin(t*6)),hit=Math.floor(t*3)%2;R(x+14,y+54,w-28,2,5);SPR(hit?B2:B1,x+20+(hit?3:0),y+23+b,{h:"#3B2A20",s:15,e:0,t:"#1E1E24",g:8,p:1,b:7});SPR(hit?B1:B2,x+64-(hit?0:3),y+23-b,{h:"#111111",s:"#8D5524",e:0,t:"#3C8C4A",g:12,p:"#20202A",b:7},true);if(hit){R(x+55,y+31,3,3,10);R(x+53,y+29,1,1,7);R(x+59,y+35,1,1,7);}}
   else{const kx=x+40+Math.round(Math.sin(t*2)*8);R(x+6,y+50,w-12,6,5);for(let k=0;k<6;k++)R(x+8+((k*20+Math.floor(t*90))%(w-24)),y+52,8,1,7);SPR(KART,kx,y+27,{h:"#3B2A20",s:15,e:0,k:"#16213E",w:7,r:8,y:10,"0":0});for(let q=0;q<3;q++){const ph=(t*3+q/3)%1;R(kx-4-ph*14,y+44-ph*4,2+ph*3,2+ph*3,ph<0.5?9:6);}}
   G.l.forEach((l,j)=>T(l,x+Math.round((w-TW(l))/2),y+60+j*8,s?7:6,1,0));});
  R(0,H-14,W,14,"#0B1020");R(0,H-14,W,1,12);TC(Math.floor(t*2)%2?"← → ELIGE · ENTER O TOCA PARA JUGAR":"ONLINE: CREA UNA SALA Y COMPARTE EL LINK",H-10,7);
  requestAnimationFrame(draw);}
 function go(i){if(!alive)return;alive=false;const G=GAMES[i];try{localStorage.setItem('arcade_last',G.id);}catch(e){}
  removeEventListener('keydown',onKey);cv.removeEventListener('pointerdown',onPtr);removeEventListener('resize',fit);
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);ARCADE.game=G.id;
  cv.setAttribute('aria-label',G.id==='dm'?'DeathMatch. Juego de pelea arcade. Enter para elegir, Esc para pausar.':'DeathKart. Juego de carreras. Flechas para conducir, Enter para elegir, Esc para pausar.');
  document.title=G.id==='dm'?'DeathMatch · Arcade de la Oficina':'DeathKart · Arcade de la Oficina';
  ARCADE_GAMES[G.id]();}
 function onKey(e){const k=e.code;if(['ArrowLeft','ArrowRight','Space'].includes(k))e.preventDefault();if(k==='ArrowLeft'||k==='ArrowRight'||k==='KeyA'||k==='KeyD')sel=1-sel;else if(k==='Enter'||k==='Space')go(sel);}
 function onPtr(e){e.preventDefault();const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;if(y<36)return;const i=x<W/2?0:1;if(i===sel||e.pointerType!=='mouse')go(i);else sel=i;}
 ARCADE.start=function(){
  // un link de sala abre directo el juego correspondiente
  const h=location.hash||'';if(/[#&]sala=/.test(h)){go(1);return;}if(/[#&]pelea=/.test(h)){go(0);return;}if(h==='#bot'){go(0);return;}
  addEventListener('keydown',onKey);cv.addEventListener('pointerdown',onPtr);addEventListener('resize',fit);fit();cv.focus();requestAnimationFrame(draw);};
})();

// ======================= VERSIÓN INDEPENDIENTE (GitHub Pages, sin claude.ai) =======================
// Online: salas por código/link con PeerJS (WebRTC, conexión directa entre navegadores).
// Ranking, tiempos y fantasmas: se guardan solo en este navegador (localStorage).
// Seguridad: todo lo que llega por la red se limita en tamaño, se parsea como JSON y se limpia con ARCADE.clean
// (sin claves __proto__/constructor), con tope de mensajes por segundo y de personas por sala.
const ARCADE_SA=(()=>{
 const LS=(()=>{try{return window.localStorage;}catch(e){return null;}})();
 const store={get(k,d){try{const v=LS&&LS.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{LS&&LS.setItem(k,JSON.stringify(v));}catch(e){}}};
 const rnd=n=>{const a='abcdefghjkmnpqrstuvwxyz23456789',b=new Uint8Array(n);crypto.getRandomValues(b);let s='';for(const x of b)s+=a[x%a.length];return s;};
 let myUid=store.get('arc_uid',null)||store.get('dk_uid',null);if(!myUid||!/^[a-z0-9]{4,16}$/.test(myUid)){myUid='u'+rnd(10);}store.set('arc_uid',myUid);
 const NAMES={};NAMES[myUid]=ARCADE.nick(store.get('arc_name','')||store.get('dk_name',''));
 function ensureName(){if(!NAMES[myUid]){let n='';try{n=prompt('Tu apodo para el online (máx. 12 letras):','')||'';}catch(e){}NAMES[myUid]=ARCADE.nick(n)||('JUGADOR '+rnd(2).toUpperCase());store.set('arc_name',NAMES[myUid]);}return NAMES[myUid];}
 function code(){return rnd(6);}
 function validCode(c){c=String(c||'').trim().toLowerCase();const m=c.match(/(?:sala|pelea)=([a-z0-9]{4,12})/);if(m)return m[1];return /^[a-z0-9]{4,12}$/.test(c)?c:null;}
 function link(key,c){return location.origin+location.pathname+'#'+key+'='+c;}
 async function copy(txt){try{await navigator.clipboard.writeText(txt);return true;}catch(e){try{prompt('Copia este link y compártelo:',txt);}catch(_){}return false;}}
 // ---- base de datos local (misma forma que la de claude.ai, para que el juego no note la diferencia)
 const subs=[];const all=()=>store.get('arc_db',null)||store.get('dk_db',{});
 const notify=()=>{const d=all();for(const [c,f] of subs){try{f({docs:Object.keys(d).filter(p=>p.startsWith(c+'/')).map(p=>({id:p.split('/')[1],exists:true,data:()=>d[p]}))});}catch(e){}}};
 const db={doc:p=>({get:async()=>{const d=all();return {exists:p in d,data:()=>d[p]};},set:async v=>{const d=all();d[p]=ARCADE.clean(v);store.set('arc_db',d);notify();}}),
  collection:c=>{const q={orderBy:()=>q,limit:()=>q,where:()=>q,onSnapshot:f=>{subs.push([c,f]);setTimeout(notify,0);return()=>{};}};return q;}};
 const user={id:async()=>myUid,profiles:async ids=>Object.fromEntries(ids.map(i=>[i,{name:NAMES[i]||(i===myUid?'TÚ':'JUGADOR')}]))};
 // ---- sala en tiempo real (el anfitrión es el centro; los invitados se conectan a él)
 const MAX_BYTES=24000,MAX_RATE=240;
 const TOPICS=new Set(['ev','ctl','challenge','answer']);
 function parse(raw){if(typeof raw!=='string'||raw.length>MAX_BYTES)return null;let m;try{m=JSON.parse(raw);}catch(e){return null;}m=ARCADE.clean(m);if(!m||typeof m!=='object')return null;
  if(m.t==='p')return m.p&&typeof m.p==='object'&&!Array.isArray(m.p)?m:null;if(m.t==='e')return typeof m.topic==='string'&&TOPICS.has(m.topic)?m:null;return null;}
 function limiter(){let n=0,t0=performance.now();return ()=>{const t=performance.now();if(t-t0>1000){t0=t;n=0;}return ++n<=MAX_RATE;};}
 function peerRoom(prefix,c,host,maxGuests){return new Promise((res,rej)=>{if(typeof Peer==='undefined'){rej(new Error('NO SE PUDO CARGAR EL MÓDULO ONLINE'));return;}
  const hostId=prefix+c;let peer;try{peer=host?new Peer(hostId):new Peer();}catch(e){rej(new Error('NO SE PUDO INICIAR EL ONLINE'));return;}
  // por cada invitado: canal 'u' rápido sin garantía (estado) y canal 'r' confiable (eventos)
  const conns=new Map(),pres=new Map(),ons={};let myId=null,myPres={},hc={u:null,r:null},done=false,pT=0,pTimer=null;
  const fail=e=>{if(!done){done=true;try{peer.destroy();}catch(_){}rej(e);}};
  setTimeout(()=>fail(new Error(host?'NO SE PUDO CREAR LA SALA (RED)':'NO SE ENCONTRÓ LA SALA')),15000);
  const deliver=(from,m)=>{if(m.t==='p'){const p=m.p;if(p.p&&p.p.nm)p.p.nm=ARCADE.nick(p.p.nm);if(p.nm)p.nm=ARCADE.nick(p.nm);pres.set(from,p);if(p.p&&p.p.u&&p.p.nm&&/^[a-z0-9]{4,16}$/.test(p.p.u))NAMES[p.p.u]=p.p.nm;}
   else for(const h of (ons[m.topic]||[])){try{h({topic:m.topic,data:m.data,peer:from,by:null,isMe:false,kind:'viewer'});}catch(e){}}};
  const sendTo=(ch,obj)=>{const s=JSON.stringify(obj);if(s.length>MAX_BYTES)return;if(host){for(const c of conns.values()){const k=c[ch];if(k&&k.open)try{k.send(s);}catch(e){}}}else{const k=hc[ch];if(k&&k.open)try{k.send(s);}catch(e){}}};
  const flushP=()=>{pTimer=null;pT=performance.now();sendTo('u',{t:'p',p:myPres});};
  const api={name:prefix+c,
   emit:async(topic,data)=>{if(TOPICS.has(topic))sendTo('r',{t:'e',topic,data});},
   on:(topic,h)=>{(ons[topic]=ons[topic]||[]).push(h);return()=>{};},
   presence:async p=>{if(p&&p.p&&!p.p.nm)p=Object.assign({},p,{p:Object.assign({},p.p,{nm:NAMES[myUid]||'JUGADOR',u:p.p.u||myUid})});myPres=Object.assign({},myPres,p);
    // máximo ~30 envíos por segundo (el último estado siempre se envía)
    const dt=performance.now()-pT;if(dt>=33)flushP();else if(!pTimer)pTimer=setTimeout(flushP,33-dt);},
   peers:()=>{const out=[{peer:myId,by:myUid,isMe:true,kind:'viewer',presence:myPres}];
    if(host){for(const [id,c] of conns)if(c.u&&c.u.open)out.push({peer:id,by:(pres.get(id)||{}).p&&pres.get(id).p.u||null,isMe:false,kind:'viewer',presence:pres.get(id)||{}});}
    else if(hc.u&&hc.u.open)out.push({peer:hostId,by:null,isMe:false,kind:'viewer',presence:pres.get(hostId)||{}});return out;},
   onPeers:()=>()=>{},leave:async()=>{done=true;if(pTimer)clearTimeout(pTimer);try{peer.destroy();}catch(e){}},connected:()=>!peer.destroyed,onConnection:()=>()=>{}};
  const wireConn=(k,from)=>{const ok=limiter();k.on('data',raw=>{if(!ok())return;const m=parse(raw);if(m)deliver(from,m);});};
  peer.on('open',id=>{myId=id;if(host){done=true;res(api);return;}
   const opts=(ch,rel)=>({reliable:rel,serialization:'raw',metadata:{ch}});
   hc.u=peer.connect(hostId,opts('u',false));hc.r=peer.connect(hostId,opts('r',true));let n=0;
   for(const ch of ['u','r']){const k=hc[ch];wireConn(k,hostId);k.on('open',()=>{if(++n===2){done=true;sendTo('u',{t:'p',p:myPres});res(api);}});k.on('close',()=>{pres.delete(hostId);});k.on('error',()=>{});}
   setTimeout(()=>fail(new Error('NO SE ENCONTRÓ LA SALA')),12000);});
  if(host)peer.on('connection',k=>{const ch=k.metadata&&k.metadata.ch;if(ch!=='u'&&ch!=='r'){k.close();return;}
   const cur=conns.get(k.peer);if(!cur&&conns.size>=maxGuests){k.on('open',()=>{try{k.send(JSON.stringify({t:'e',topic:'ctl',data:{full:true}}));}catch(e){}setTimeout(()=>k.close(),300);});return;}
   const e=cur||{u:null,r:null};if(e[ch]){k.close();return;}e[ch]=k;conns.set(k.peer,e);wireConn(k,k.peer);
   k.on('open',()=>{if(ch==='u'&&Object.keys(myPres).length)try{k.send(JSON.stringify({t:'p',p:myPres}));}catch(_){}});
   k.on('close',()=>{const x=conns.get(k.peer);if(x&&x[ch]===k){conns.delete(k.peer);pres.delete(k.peer);try{(ch==='u'?x.r:x.u)&&(ch==='u'?x.r:x.u).close();}catch(_){}}});k.on('error',()=>{});});
  peer.on('error',e=>{const t=e&&e.type;if(t==='unavailable-id')fail(new Error('ESE CÓDIGO YA ESTÁ EN USO'));else if(t==='peer-unavailable')fail(new Error('NO SE ENCONTRÓ LA SALA'));else if(t==='browser-incompatible')fail(new Error('TU NAVEGADOR NO SOPORTA EL ONLINE'));else if(t==='network'||t==='server-error'||t==='socket-error')fail(new Error('LA RED BLOQUEA LA CONEXIÓN'));else if(!done)fail(new Error('NO SE PUDO CONECTAR'));});});}
 // sala "lobby" falsa: en esta versión no hay lista de conectados, se entra por código
 function lobbyRoom(){const me={peer:'yo',by:myUid,isMe:true,kind:'viewer',presence:{}};return {onPeers:h=>{setTimeout(()=>h({peers:[me],joined:[],left:[],updated:[]}),0);return()=>{};},on:()=>()=>{},emit:async()=>{},presence:async p=>{me.presence=Object.assign({},me.presence,p);},peers:()=>[me],
  join:async(name,opt)=>{opt=opt||{};const m=String(name).match(/^(dkr|dm)-([a-z0-9]{4,12})$/);if(!m)throw new Error('SALA INVÁLIDA');return peerRoom(m[1]==='dkr'?'deathkart-':'deathmatch-',m[2],!!opt.host,m[1]==='dkr'?3:1);},leave:async()=>{}};}
 window.claude={use:async n=>n==='room'?lobbyRoom():(n==='user'?user:(n==='db'?db:null))};
 return {store,NAMES,myUid,ensureName,code,validCode,link,copy};
})();

ARCADE_GAMES.dm=function(){
"use strict";
// ======================= base =======================
const W=256,H=144, cv=document.getElementById('c'), g=cv.getContext('2d');
g.imageSmoothingEnabled=false;
const P=["#000000","#1D2B53","#7E2553","#008751","#AB5236","#5F574F","#C2C3C7","#FFF1E8","#FF004D","#FFA300","#FFEC27","#00E436","#29ADFF","#83769C","#FF77A8","#FFCCAA"];
const col=c=>typeof c==='number'?P[c]:c;
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,u)=>a+(b-a)*u;
function fit(){const s=Math.min(innerWidth/W,innerHeight/H);const k=s>=4?Math.floor(s):s;cv.style.width=(W*k)+'px';cv.style.height=(H*k)+'px';}
addEventListener('resize',fit);fit();
let OUTL=null;
function R(x,y,w,h,c){g.fillStyle=col(OUTL||c);g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function PX(x,y,c){R(x,y,1,1,c);}
function BOXL(x,y,w,h,c){R(x,y,w,1,c);R(x,y+h-1,w,1,c);R(x,y,1,h,c);R(x+w-1,y,1,h,c);}
function LN(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;g.fillStyle=col(OUTL||c);for(let i=0;i<800;i++){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function SPR(rows,x,y,map,sc=1,flip=false){for(let j=0;j<rows.length;j++){const r=flip?[...rows[j]].reverse().join(''):rows[j];for(let i=0;i<r.length;i++){const m=map[r[i]];if(m!==undefined)R(x+i*sc,y+j*sc,sc,sc,m);}}}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const RND=Math.random, pick=a=>a[Math.floor(RND()*a.length)];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(RND()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
let CAPT=null;
function disc(x,y,r,c){if(CAPT&&c===CAPT.c){CAPT.list.push([x,y,r]);return;}g.fillStyle=col(OUTL||c);g.beginPath();g.arc(x,y,r,0,7);g.fill();}
// ======================= font 5x7 =======================
const F={A:"01110100011000111111100011000110001",B:"11110100011000111110100011000111110",C:"01110100011000010000100001000101110",D:"11110100011000110001100011000111110",E:"11111100001000011110100001000011111",F:"11111100001000011110100001000010000",G:"01110100011000010111100011000101111",H:"10001100011000111111100011000110001",I:"01110001000010000100001000010001110",J:"00111000100001000010000101001001100",K:"10001100101010011000101001001010001",L:"10000100001000010000100001000011111",M:"10001110111010110101100011000110001",N:"10001100011100110101100111000110001",O:"01110100011000110001100011000101110",P:"11110100011000111110100001000010000",Q:"01110100011000110001101011001001101",R:"11110100011000111110101001001010001",S:"01111100001000001110000010000111110",T:"11111001000010000100001000010000100",U:"10001100011000110001100011000101110",V:"10001100011000110001100010101000100",W:"10001100011000110101101011010101010",X:"10001100010101000100010101000110001",Y:"10001100010101000100001000010000100",Z:"11111000010001000100010001000011111",
"0":"01110100011001110101110011000101110","1":"00100011000010000100001000010001110","2":"01110100010000100010001000100011111","3":"11111000100010000010000011000101110","4":"00010001100101010010111110001000010","5":"11111100001111000001000011000101110","6":"00110010001000011110100011000101110","7":"11111000010001000100010000100001000","8":"01110100011000101110100011000101110","9":"01110100011000101111000010001001100",
" ":"00000000000000000000000000000000000",".":"00000000000000000000000000000000100",",":"00000000000000000000001000010001000",":":"00000001000000000000000000010000000","-":"00000000000000001110000000000000000","/":"00001000010001000100010001000010000",">":"01000001000001000001000100010001000","<":"00010001000100010000010000010000010","_":"00000000000000000000000000000011111","!":"00100001000010000100001000000000100","?":"01110100010000100010001000000000100","·":"00000000000000000100000000000000000","+":"00000001000010011111001000010000000","(":"00010001000100001000010000010000010",")":"01000001000001000010000100010001000","%":"11001110100001000100010000101110011","=":"00000000001111100000111110000000000","'":"00100001000100000000000000000000000",
"♥":"00000010101111111111011100010000000","✓":"00000000010001010100010000000000000","▶":"01000011000111001111011100110001000","↑":"00100011101010100100001000010000100","↓":"00100001000010000100101010111000100","←":"00000001000100011111010000010000000","→":"00000001000001011111000100010000000","¡":"00100000000010000100001000010000100","¿":"00100000000010001000100001000101110"};
const ACC={"Á":"A","É":"E","Í":"I","Ó":"O","Ú":"U","Ñ":"N"};
function T(s,x,y,c,sc=1,sh=null){s=String(s).toUpperCase();for(let k=0;k<s.length;k++){let ch=s[k],mark=null;if(ACC[ch]){mark=ch==="Ñ"?["01101"]:["00010","00100"];ch=ACC[ch];}const gl=F[ch]||F["?"];const ox=x+k*6*sc;for(const [cc,d] of (sh!==null?[[sh,1],[c,0]]:[[c,0]])){for(let i=0;i<35;i++)if(gl[i]==="1")R(ox+(i%5+d)*sc,y+(Math.floor(i/5)+d)*sc,sc,sc,cc);if(mark)mark.forEach((mr,mj)=>{for(let i=0;i<5;i++)if(mr[i]==="1")R(ox+(i+d)*sc,y+(-mark.length-1+mj+d)*sc,sc,sc,cc);});}}}
const TW=(s,sc=1)=>String(s).length*6*sc-sc;
function TC(s,y,c,sc=1,sh=null,cx=W/2){T(s,Math.round(cx-TW(s,sc)/2),y,c,sc,sh);}

// ======================= sprites =======================
const HAIR="#3B2A20",NAVY="#16213E",GOLD="#F7931A";
const ALV=["...hhhh...","..hhhhhh..","..hsssss..","..sesses..","..ssssss..","...ssss...","..kkwwkk..",".kkkwtkkk.",".kkkwtkkk.",".kkkktkkk.",".skkkkkks.","..kkkkkk..","..pppppp..","..pp..pp..","..pp..pp..",".bbb..bbb."];
const AMAP={h:HAIR,s:15,e:0,k:NAVY,w:7,t:8,p:"#20202A",b:0};
const BOX_G=["....hhhh......","...hhhhhh.....","...hsssss.....","...sesses.gg..","...ssssss.ggg.","....ssss.sgg..","..tttttts.....",".gtttttt......",".ggtttttt.....","..sttttt......","...tttttt.....","...pppppp.....","...pp..pp.....","...pp..pp.....","..pp....pp....",".bbb....bbb..."];
const BOX_P=["....hhhh......","...hhhhhh.....","...hsssss.....","...sesses.....","...ssssss.....","....ssss......","..ttttttsssggg",".gttttttt..ggg",".ggtttttt.....","..sttttt......","...tttttt.....","...pppppp.....","...pp..pp.....","...pp..pp.....","..pp....pp....",".bbb....bbb..."];
const BMAP={h:HAIR,s:15,e:0,t:"#1E1E24",g:8,p:1,b:7};
const ROBOT=["..c.....","..c.....",".rrrrrr.","rr1rr1rr","rrrrrrrr","rr1111rr",".rrrrrr.","..rrrr..","rrrrrrrr","r.rrrr.r","r.rrrr.r","..r..r..","..r..r.."];
const ENV=["11111111","12222221","11222211","12112121","12211221","12222221","11111111"];
const SHIELD=["..111111111..",".12222222221.","1222222222221","1222233322221","1222232322221","1222232322221","1222333332221","1222330332221","1222333332221","1222222222221",".12222222221.","..122222221..","...1222221...","....12221....",".....121.....","......1......"];
const COIN=["..ooooo..",".oo1o1oo.","ooo111ooo","ooo1oo1oo","ooo111ooo","ooo1oo1oo","ooo111ooo",".oo1o1oo.","..ooooo.."];
const PIN=["..888..",".88788.","8877788",".88788.","..888..","...8...","...8..."];
const HEART=[".88.88.","8888888","8888888",".88888.","..888..","...8..."];
const LOCK=[".yyy.","y...y","y...y","yyyyy","yykyy","yykyy","yyyyy"];

// ======================= backdrop (del primer video) =======================
const STARS=(()=>{const r=rng(7),a=[];for(let i=0;i<60;i++)a.push([Math.floor(r()*W),Math.floor(r()*60),r()*6]);return a})();
const MTN=[[0,78],[18,60],[34,70],[52,44],[70,62],[88,40],[110,58],[130,38],[152,56],[170,46],[192,64],[214,42],[236,60],[256,52],[256,100],[0,100]];
function poly(pts,c){g.fillStyle=col(c);g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(const p of pts)g.lineTo(p[0],p[1]);g.closePath();g.fill();}
function sky(t){for(let y=0;y<90;y+=6)R(0,y,W,6,y<45?"#0B1020":1);for(const [x,y,ph] of STARS)if(Math.sin(t*3+ph)>-0.3)PX(x,y,Math.sin(t*2+ph)>0.6?7:6);}
function andes(){poly(MTN,13);for(let i=1;i<MTN.length-3;i++){const [x,y]=MTN[i];if(y<50)poly([[x-6,y+7],[x,y],[x+6,y+7]],7);}}
const CITY=(()=>{const r=rng(3),b=[];let x=0;while(x<W){let w=10+Math.floor(r()*11),h=12+Math.floor(r()*23);if(x>150&&x<175){w=12;h=66;}const win=[];for(let wy=110-h+3;wy<108;wy+=4)for(let wx=x+2;wx<x+w-3;wx+=3)if(r()<0.45)win.push([wx,wy,r()<0.8?10:9]);b.push({x,w,h,win});x+=w;}return b})();
function skyline(t){R(0,110,W,34,"#0E0E1A");for(const b of CITY){R(b.x,110-b.h,b.w-1,b.h,"#222034");for(const [wx,wy,c] of b.win)PX(wx,wy,c);if(b.h===66){poly([[b.x,110-66],[b.x+5,104-66],[b.x+10,110-66]],"#222034");PX(b.x+5,103-66,Math.floor(t*2)%2?8:2);}}}

F["*"]="00000101010111011111011101010100000";F["✗"]="00000100010101000100010101000100000";F["■"]="00000111111111111111111111111100000";F["$"]="00100011111010001110001011111000100";F["#"]="01010111110101001010111110101000000";F["&"]="01100100101010001000101011001001101";

// ======================= audio =======================
const A={ctx:null,muted:false,amb:[]};
function audioInit(){if(A.ctx){if(A.ctx.state==='suspended'&&state!=='pause')A.ctx.resume();return;}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C();A.ctx=ctx;
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(ctx.destination);
  A.master=ctx.createGain();A.master.gain.value=A.muted?0:0.6;A.master.connect(comp);
  A.mus=ctx.createGain();A.mus.gain.value=0.55;A.mus.connect(A.master);
  A.sfx=ctx.createGain();A.sfx.gain.value=0.9;A.sfx.connect(A.master);
  const n=32,re=new Float32Array(n),im=new Float32Array(n),d=0.25;for(let k=1;k<n;k++){re[k]=2/(k*Math.PI)*Math.sin(2*Math.PI*k*d);im[k]=2/(k*Math.PI)*(1-Math.cos(2*Math.PI*k*d));}A.pulse=ctx.createPeriodicWave(re,im);
  const nb=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;A.noise=nb;
  const cvn=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;cvn[i]=Math.tanh(x*4);}A.dist=cvn;
}
function setMuted(m){A.muted=m;if(A.master)A.master.gain.value=m?0:0.6;}
const hz=m=>440*Math.pow(2,(m-69)/12);
const AT=()=>A.ctx?A.ctx.currentTime:0;
function tone(type,f,t,dur,vol,dest,slide,opts={}){if(!A.ctx)return;const c=A.ctx,o=c.createOscillator(),gn=c.createGain();if(type==='pulse')o.setPeriodicWave(A.pulse);else o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
  let last=o;if(opts.lp){const f2=c.createBiquadFilter();f2.type='lowpass';f2.frequency.value=opts.lp;o.connect(f2);last=f2;}
  if(opts.dist){const ws=c.createWaveShaper();ws.curve=A.dist;last.connect(ws);last=ws;}
  const at=opts.at||0.006;gn.gain.setValueAtTime(0.0001,t);gn.gain.linearRampToValueAtTime(vol,t+at);gn.gain.exponentialRampToValueAtTime(0.0005,t+dur);last.connect(gn).connect(dest||A.sfx);o.start(t);o.stop(t+dur+0.03);}
function noise(t,dur,vol,type,freq,dest,q){if(!A.ctx)return;const c=A.ctx,s=c.createBufferSource();s.buffer=A.noise;const f=c.createBiquadFilter();f.type=type||'highpass';f.frequency.value=freq||1000;if(q)f.Q.value=q;const gn=c.createGain();gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(0.0005,t+dur);s.connect(f).connect(gn).connect(dest||A.sfx);s.start(t,Math.random()*1.5);s.stop(t+dur+0.02);}
const kick=(t,v=0.8,d)=>tone('sine',150,t,0.22,v,d||A.mus,42);
const snare=(t,v=0.35,d)=>{noise(t,0.14,v,'highpass',1400,d||A.mus);tone('triangle',190,t,0.08,v*0.5,d||A.mus);};
const hat=(t,open,v=0.1,d)=>noise(t,open?0.2:0.035,v,'highpass',7500,d||A.mus);
const blip=(m,t,v=0.1,d)=>tone('pulse',hz(m),t,0.07,v,d);
function ambient(type,opts){ // fuente continua (aire acondicionado, zumbido, público)
  if(!A.ctx)return null;const c=A.ctx;let src;
  if(type==='noise'){src=c.createBufferSource();src.buffer=A.noise;src.loop=true;}else{src=c.createOscillator();src.type=type;src.frequency.value=opts.f||55;}
  const f=c.createBiquadFilter();f.type=opts.ft||'lowpass';f.frequency.value=opts.ff||500;if(opts.q)f.Q.value=opts.q;const gn=c.createGain();gn.gain.value=opts.v||0.05;
  src.connect(f).connect(gn).connect(opts.dest||A.sfx);src.start();const h={src,f,gn};A.amb.push(h);return h;}
function stopAmbient(){for(const h of A.amb){try{h.src.stop();}catch(e){}}A.amb=[];}
// secuenciador de música
const M={on:false,step:0,next:0,bpm:120,fn:null};
function musicStart(bpm,fn){if(!A.ctx)return;M.on=true;M.bpm=bpm;M.fn=fn;M.step=0;M.next=A.ctx.currentTime+0.08;}
function musicStop(){M.on=false;}
function musicTick(){if(!M.on||!A.ctx||A.ctx.state!=='running')return;if(M.next<A.ctx.currentTime-0.2)M.next=A.ctx.currentTime+0.02;const s16=60/M.bpm/4;while(M.next<A.ctx.currentTime+0.12){M.fn(M.step,M.next,s16);M.step++;M.next+=60/M.bpm/4;}}
const S={
  move:()=>blip(84,AT(),0.07),
  ok:()=>{const t=AT();blip(79,t);blip(86,t+0.06);},
  no:()=>tone('square',110,AT(),0.12,0.1,null,70),
  good:()=>{const t=AT();[76,79,84].forEach((m,k)=>blip(m,t+k*0.05,0.09));},
  bad:()=>{const t=AT();tone('square',160,t,0.18,0.1,null,90);tone('square',120,t+0.09,0.2,0.08,null,70);},
  win:()=>{const t=AT();[72,76,79,84,88].forEach((m,k)=>tone('pulse',hz(m),t+k*0.08,0.3,0.1));},
  lose:()=>{const t=AT();[64,60,57,52].forEach((m,k)=>tone('square',hz(m),t+k*0.16,0.22,0.09));},
  bell:(v=0.25)=>{const t=AT();[1,2.76,5.4,8.9].forEach((k,i)=>tone('sine',520*k,t,1.6/(i+1),v/(i+1)));},
};

// ======================= botones =======================
let BTNS=[];
function btn(id,x,y,w,h,label,bg,fg=7,hot=false){BTNS.push({id,x,y,w,h});R(x,y,w,h,hot?7:0);R(x+1,y+1,w-2,h-2,bg);TC(label,y+Math.floor((h-7)/2),fg,1,null,x+w/2);}
function hitBtn(x,y){for(let i=BTNS.length-1;i>=0;i--){const b=BTNS[i];if(x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)return b.id;}return null;}
function hud(name,right){R(0,0,W,12,"#0B1020");R(0,12,W,1,12);T(name,4,3,10);if(right)T(right,W-22-TW(right),3,7);T("II",W-14,3,5);BTNS.push({id:'__pause',x:W-24,y:0,w:24,h:12});}
function bar(x,y,w,h,v,c,bg=5){R(x,y,w,h,bg);R(x+1,y+1,Math.round((w-2)*clamp(v,0,1)),h-2,c);}

// ======================= FX: capa de efectos en alta resolución (brillo aditivo) sobre el pixel art =======================
const FX=(()=>{let c=null,x=null,S=3,P=[],G=[],GN=[],flash=0,flashRGB='255,255,255',vx=0,vy=0,vz=0,amb=null,fr=0,lastR='';
 const ok=()=>!!x;
 function init(){if(c||typeof document==='undefined'||typeof document.createElement!=='function')return;try{c=document.createElement('canvas');c.setAttribute('aria-hidden','true');c.style.cssText='position:fixed;left:0;top:0;pointer-events:none;image-rendering:auto;box-shadow:none;z-index:3';document.body.appendChild(c);x=c.getContext('2d');resize();addEventListener('resize',()=>setTimeout(resize,30));}catch(e){c=null;x=null;}}
 function resize(){if(!c)return;const r=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);S=Math.max(2,Math.min(4,Math.round(r.width/W*dpr)));if(c.width!==W*S){c.width=W*S;c.height=H*S;}c.style.left=r.left+'px';c.style.top=r.top+'px';c.style.width=r.width+'px';c.style.height=r.height+'px';lastR=r.left+','+r.top+','+r.width;}
 function clear(){if(!ok())return;if(++fr%30===0){const r=cv.getBoundingClientRect();if(r.left+','+r.top+','+r.width!==lastR)resize();}x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);}
 const rnd=(a,b)=>a+Math.random()*(b-a);
 const add=p=>{if(P.length<700)P.push(Object.assign({t:0},p));};
 function sparks(X,Y,n,sp,col,life,len,w,grav){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=rnd(sp*0.4,sp);add({k:'spark',x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*0.15,life:rnd(life*0.6,life),len:len,w:w,col,g:grav??260});}}
 const HUE={0:'255,190,80',1:'120,220,255',2:'255,90,120',3:'180,255,140'};
 function hit(X,Y,tier,hue){const col=HUE[hue||0];if(tier>=3){add({k:'flash',x:X,y:Y,r0:4,r1:26,life:0.22,col});add({k:'ring',x:X,y:Y,r0:4,r1:30,life:0.3,col,w:3});add({k:'streak',x:X,y:Y,life:0.14,n:14,r:34});sparks(X,Y,28,260,col,0.45,0.05,2.2);for(let i=0;i<10;i++)add({k:'ember',x:X,y:Y,vx:rnd(-120,120),vy:rnd(-200,-60),life:rnd(0.6,1.1),col});flash=Math.max(flash,0.45);flashRGB='255,255,255';}
  else if(tier===2){add({k:'flash',x:X,y:Y,r0:3,r1:15,life:0.16,col});add({k:'ring',x:X,y:Y,r0:3,r1:16,life:0.2,col,w:2});sparks(X,Y,16,200,col,0.32,0.045,1.8);flash=Math.max(flash,0.12);}
  else{add({k:'flash',x:X,y:Y,r0:2,r1:9,life:0.12,col});sparks(X,Y,9,150,col,0.25,0.035,1.4);}}
 function block(X,Y,dir){const col='130,210,255';add({k:'flash',x:X,y:Y,r0:3,r1:12,life:0.14,col});add({k:'arc',x:X,y:Y,r:10,dir:dir||1,life:0.18,col});sparks(X,Y,8,140,'200,240,255',0.22,0.03,1.2,120);}
 function boom(X,Y,big){const k=big?1:0.6,col='255,170,60';add({k:'flash',x:X,y:Y,r0:6*k,r1:46*k,life:0.3,col:'255,240,200'});for(let i=0;i<(big?9:5);i++)add({k:'fire',x:X+rnd(-8,8)*k,y:Y+rnd(-8,8)*k,vx:rnd(-40,40),vy:rnd(-70,-10),r0:rnd(4,8)*k,r1:rnd(14,24)*k,life:rnd(0.35,0.6)});
  for(let i=0;i<(big?8:4);i++)add({k:'smoke',x:X+rnd(-10,10)*k,y:Y+rnd(-6,6)*k,vx:rnd(-20,20),vy:rnd(-40,-15),r0:rnd(4,8)*k,r1:rnd(16,26)*k,life:rnd(0.8,1.3),d:rnd(0.15,0.4)});
  for(let i=0;i<(big?26:12);i++)add({k:'ember',x:X,y:Y,vx:rnd(-220,220)*k,vy:rnd(-260,-40)*k,life:rnd(0.7,1.4),col});add({k:'ring',x:X,y:Y,r0:6,r1:60*k,life:0.35,col:'255,220,150',w:4});add({k:'floor',x:X,y:124,r0:4,r1:70*k,life:0.45,col:'255,200,120'});flash=Math.max(flash,big?0.7:0.4);flashRGB='255,235,200';}
 function ko(X,Y){add({k:'rays',x:X,y:Y,life:0.9,n:16,col:'255,240,180'});boom(X,Y,true);flash=0.9;flashRGB='255,255,255';}
 function shatter(X,Y){for(let i=0;i<22;i++){const a=Math.random()*Math.PI*2,v=rnd(80,220);add({k:'shard',x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,life:rnd(0.5,0.9),rot:rnd(0,6),vr:rnd(-12,12),s:rnd(2,4)});}add({k:'ring',x:X,y:Y,r0:4,r1:34,life:0.3,col:'140,220,255',w:3});add({k:'flash',x:X,y:Y,r0:4,r1:22,life:0.2,col:'140,220,255'});flash=Math.max(flash,0.35);flashRGB='180,230,255';}
 function superRays(X,Y,col){add({k:'rays',x:X,y:Y,life:0.9,n:20,col:col||'120,200,255'});add({k:'ring',x:X,y:Y,r0:6,r1:90,life:0.6,col:col||'120,200,255',w:5});flash=Math.max(flash,0.3);}
 function dust(X,Y,n){for(let i=0;i<(n||5);i++)add({k:'smoke',x:X+rnd(-6,6),y:Y-rnd(1,4),vx:rnd(-40,40),vy:rnd(-25,-5),r0:rnd(2,4),r1:rnd(7,12),life:rnd(0.35,0.6),d:rnd(0.25,0.45),dust:true});}

 const rgD=(c,cx,cy,r,stops)=>{const g=c.createRadialGradient(cx,cy,0,cx,cy,r);stops.forEach(([o,s])=>g.addColorStop(o,s));c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,7);c.fill();};
 function drawHado(c,cx,cy,r,dir,t){c.save();c.globalCompositeOperation='lighter';
  for(let i=14;i>0;i--){const u=i/14,px=cx-dir*u*r*5,py=cy+Math.sin(t*20+i*0.9)*r*0.25*u;c.globalAlpha=(1-u)*0.8;rgD(c,px,py,r*(1-u*0.7),[[0,'rgba(120,200,255,0.9)'],[0.5,'rgba(30,90,255,0.5)'],[1,'rgba(0,0,0,0)']]);}c.globalAlpha=1;
  for(let k=0;k<6;k++){const a=t*14+k*1.05;c.strokeStyle='rgba(160,220,255,0.55)';c.lineWidth=r*0.12;c.beginPath();c.ellipse(cx-dir*r*0.4,cy,r*1.3,r*(0.6+0.3*Math.sin(a)),0,dir>0?Math.PI*0.5:-Math.PI*0.5,dir>0?Math.PI*1.5:Math.PI*0.5);c.stroke();}
  rgD(c,cx,cy,r*2.2,[[0,'rgba(120,200,255,0.6)'],[1,'rgba(0,60,255,0)']]);rgD(c,cx,cy,r,[[0,'rgba(255,255,255,1)'],[0.35,'rgba(190,235,255,1)'],[0.8,'rgba(60,140,255,0.9)'],[1,'rgba(30,80,255,0)']]);c.restore();}

 // ---- Bola Objeción: energía + expedientes (partículas) ----
 function legalBall(p,t,big){const dt=Math.min(0.05,Math.max(0,t-(p._lt??t)));p._lt=t;const dir=Math.sign(p.vx)||1,k=big?1.8:1;p._acc=(p._acc||0)+dt;
  p._sa=(p._sa||0)+dt*140*k;while(p._sa>=1){p._sa--;const a=(Math.random()-0.5)*1.2,sp=rnd(50,160);add({k:'spark',x:p.x,y:p.y+rnd(-2,2)*k,vx:-dir*Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rnd(0.18,0.4),len:0.025,w:1.1,col:'130,205,255',g:0});}
  p._pa=(p._pa||0)+dt*(big?40:22);while(p._pa>=1){p._pa--;const a=(Math.random()-0.5)*1.3,sp=rnd(25,90);add({k:'paper',x:p.x-dir*3,y:p.y+rnd(-3,3)*k,vx:-dir*Math.cos(a)*sp,vy:Math.sin(a)*sp-10,rot:rnd(0,6),vr:rnd(-10,10),life:rnd(0.6,1.0),s:(big?3.4:2.4)*rnd(0.8,1.2),stamp:Math.random()<0.33});}
  G.push({k:'lcore',x:p.x,y:p.y,r:(big?11:6)});}

 // ---- poderes modernizados: emisores + núcleos HD por tipo de proyectil ----
 function acc(p,key,rate,dt){p[key]=(p[key]||0)+dt*rate;const n=Math.floor(p[key]);p[key]-=n;return n;}
 function pwr(p,t){if(!x)return;const dt=Math.min(0.05,Math.max(0,t-(p._lt??t)));p._lt=t;const d=Math.sign(p.vx)||1,K=p.kind;
  if(K==='doc'){for(let i=acc(p,'_a',45,dt);i>0;i--){const a=(Math.random()-0.5)*1.3;add({k:'drop',x:p.x,y:p.y,vx:-d*Math.cos(a)*rnd(20,70),vy:Math.sin(a)*40,life:rnd(0.3,0.6),col:'200,16,46',s:rnd(0.8,1.6)});}for(let i=acc(p,'_b',7,dt);i>0;i--)add({k:'paper',x:p.x,y:p.y,vx:-d*rnd(15,40),vy:rnd(-20,10),rot:rnd(0,6),vr:rnd(-8,8),life:rnd(0.6,0.9),s:1.6,stamp:false});
   G.push({k:'gl',x:p.x,y:p.y,r:13,col:'255,60,80',a:0.45});GN.push({k:'doc',x:p.x,y:p.y,t});}
  else if(K==='form'){for(let i=acc(p,'_a',12,dt);i>0;i--)add({k:'check',x:p.x,y:p.y-4,vx:-d*rnd(5,25),vy:rnd(-75,-40),life:rnd(0.6,0.9),ok:Math.random()<0.6});G.push({k:'gl',x:p.x,y:p.y,r:12,col:'120,255,170',a:0.4});GN.push({k:'form',x:p.x,y:p.y});}
  else if(K==='wave'){for(let i=acc(p,'_a',14,dt);i>0;i--)add({k:'note',x:p.x,y:p.y,vx:-d*rnd(10,30),vy:rnd(-60,-25),rot:rnd(0,6),vr:rnd(-8,8),life:rnd(0.6,0.9),col:['#FFEC27','#FF77A8','#29ADFF','#00E436'][Math.floor(Math.random()*4)]});G.push({k:'wv',x:p.x,y:p.y,d,t});}
  else if(K==='kpi'||K==='kpiBig'){const b=K==='kpiBig'?1.8:1;for(let i=acc(p,'_a',22*b,dt);i>0;i--)add({k:'glyph',x:p.x,y:p.y+rnd(-5,5)*b,vx:-d*rnd(10,30),vy:rnd(-30,-10),life:rnd(0.5,0.8),ch:['%','↑','+'][Math.floor(Math.random()*3)],col:'80,255,150',add:true,sz:3*b});G.push({k:'gl',x:p.x,y:p.y,r:13*b,col:'80,255,150',a:0.45});G.push({k:'holo',x:p.x,y:p.y,b,t});}
  else if(K==='ticket'){for(let i=acc(p,'_a',35,dt);i>0;i--)add({k:'glitch',x:p.x-d*3,y:p.y+rnd(-5,5),vx:-d*rnd(15,40),vy:0,life:rnd(0.15,0.3),w:rnd(2,5),col:['#FF004D','#29ADFF','#00E436','#FFEC27'][Math.floor(Math.random()*4)]});G.push({k:'gl',x:p.x,y:p.y,r:12,col:'255,220,80',a:0.45});G.push({k:'arc',x:p.x,y:p.y,t});GN.push({k:'ticket',x:p.x,y:p.y});}
  else if(K==='reboot'){for(let i=acc(p,'_a',22,dt);i>0;i--)add({k:'frost',x:p.x,y:p.y,vx:-d*rnd(10,30),vy:rnd(-15,15),rot:rnd(0,6),life:rnd(0.5,0.8)});G.push({k:'gl',x:p.x,y:p.y,r:14,col:'80,160,255',a:0.55});G.push({k:'pwr',x:p.x,y:p.y,t});GN.push({k:'pwrIcon',x:p.x,y:p.y});}
  else if(K==='bot'){for(let i=acc(p,'_a',14,dt);i>0;i--)add({k:'smoke',x:p.x-d*6,y:p.y+3,vx:-d*rnd(5,15),vy:rnd(-12,-4),r0:1,r1:rnd(3,5),life:rnd(0.5,0.8),d:0.3});G.push({k:'thr',x:p.x-d*6,y:p.y+3,d,t});GN.push({k:'bot',x:p.x,y:p.y,d,t});}
  else if(K==='card'){for(let i=acc(p,'_a',45,dt);i>0;i--)add({k:'spark',x:p.x,y:p.y+rnd(-2,2),vx:-d*rnd(30,80),vy:rnd(-10,10),life:rnd(0.15,0.3),len:0.03,w:1,col:'255,'+Math.floor(rnd(90,190))+',210',g:0});if(Math.random()<dt*6)add({k:'star',x:p.x-d*4,y:p.y,vx:-d*20,vy:0,life:0.3});G.push({k:'gl',x:p.x,y:p.y,r:11,col:'255,90,200',a:0.5});GN.push({k:'card',x:p.x,y:p.y,t});}
  else if(K==='coin'){for(let i=acc(p,'_a',10,dt);i>0;i--)add({k:'coinp',x:p.x,y:p.y,vx:-d*rnd(10,30),vy:rnd(-20,0),life:rnd(0.6,0.9),ph:rnd(0,6)});G.push({k:'gl',x:p.x,y:p.y,r:12,col:'255,210,90',a:0.55});G.push({k:'twk',x:p.x,y:p.y,t});GN.push({k:'coin',x:p.x,y:p.y,t});}
  else if(K==='bill'){G.push({k:'gl',x:p.x,y:p.y,r:9,col:'120,255,140',a:0.4});GN.push({k:'bill',x:p.x,y:p.y,t,ph:p.x});}
  else if(K==='agent'){G.push({k:'thr2',x:p.x-d*5,y:p.y,d});G.push({k:'gl',x:p.x,y:p.y,r:10,col:'185,156,255',a:0.45});GN.push({k:'agent',x:p.x,y:p.y,t});}
  else if(K==='wallet'){for(let i=acc(p,'_a',10,dt);i>0;i--)add({k:'moth',x:p.x,y:p.y-2,vx:-d*rnd(10,40),vy:rnd(-30,-5),life:rnd(0.6,1.0),ph:rnd(0,6)});G.push({k:'gl',x:p.x,y:p.y,r:11,col:'200,170,120',a:0.35});GN.push({k:'wallet',x:p.x,y:p.y,t,d});}
  else if(K==='moth'){GN.push({k:'mothb',x:p.x+Math.sin(t*18+p.x)*2,y:p.y+Math.cos(t*14+p.x)*3,t});G.push({k:'gl',x:p.x,y:p.y,r:6,col:'220,220,200',a:0.25});}
  else if(K==='riff'){G.push({k:'riff',x:p.x,y:p.y,d,t,r:p.r||10});if(Math.random()<0.5)add({k:'glyph',x:p.x-d*6,y:p.y+rnd(-8,8),vx:-d*rnd(5,20),vy:rnd(-20,-5),life:0.6,ch:Math.random()<0.5?'♪':'♫',col:Math.random()<0.5?'150,255,90':'190,140,255',add:true,sz:6});}
  else if(K==='skull'){for(let i=acc(p,'_a',30,dt);i>0;i--)add({k:'pix',x:p.x-d*8,y:p.y+rnd(-6,6),vx:-d*rnd(20,60),vy:rnd(-10,10),life:rnd(0.3,0.5),col:Math.random()<0.6?'#5BD12A':'#9DFF5A'});G.push({k:'gl',x:p.x,y:p.y,r:22,col:'120,255,90',a:0.45});GN.push({k:'skull',x:p.x,y:p.y,t,d});}
  else if(K==='prompt'){for(let i=acc(p,'_a',28,dt);i>0;i--){const ch='AGENT.RUN()PROMPT>_{}[];';add({k:'glyph',x:p.x-d*6,y:p.y+rnd(-4,4),vx:-d*rnd(15,40),vy:rnd(-15,5),life:rnd(0.5,0.8),ch:ch[Math.floor(Math.random()*ch.length)],col:Math.random()<0.5?'80,255,150':'185,156,255',add:true,sz:3});}G.push({k:'gl',x:p.x,y:p.y,r:12,col:'140,120,255',a:0.45});GN.push({k:'term',x:p.x,y:p.y,t});}}
 function beamFx(x0,x1,y,thick,t){if(!x)return;for(let i=0;i<(thick?3:1);i++)if(Math.random()<0.9)add({k:'heat',x:x0+Math.random()*(x1-x0),y:y+rnd(-2,2),vx:0,vy:rnd(-30,-12),life:rnd(0.25,0.45)});}

 // ---- cuerpo a cuerpo y súpers ----
 let OV=[];
 function paperBurst(X,Y,n,stamp){if(!x)return;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=rnd(30,110);add({k:'paper',x:X,y:Y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-20,rot:rnd(0,6),vr:rnd(-12,12),life:rnd(0.6,1.0),s:rnd(1.8,2.6),stamp:stamp&&Math.random()<0.35});}}
 function pixBurst(X,Y){if(!x)return;for(let i=0;i<34;i++){const a=Math.random()*Math.PI*2,sp=rnd(20,80);add({k:'pix',x:X+rnd(-5,5),y:Y+rnd(-24,0),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rnd(0.3,0.6),col:['#33FF88','#B99CFF','#29ADFF','#FF4A80'][i%4]});}}
 function lupa(X,Y){if(!x)return;add({k:'lupa',x:X,y:Y,vx:0,vy:0,life:0.6});}
 function fkick(f,t){if(!x)return;for(let i=0;i<3;i++)add({k:'spark',x:f.x-f.face*4,y:f.y-22+rnd(-4,4),vx:-f.face*rnd(20,60),vy:rnd(-15,15),life:rnd(0.15,0.3),len:0.03,w:1.3,col:'140,210,255',g:0});if(Math.random()<0.35)add({k:'paper',x:f.x,y:f.y-22,vx:-f.face*rnd(10,40),vy:rnd(-20,5),rot:rnd(0,6),vr:rnd(-10,10),life:0.7,s:1.6,stamp:false});G.push({k:'gl',x:f.x+f.face*6,y:f.y-22,r:14,col:'120,190,255',a:0.45});}
 function whirl(f,t){if(!x)return;G.push({k:'whirl',x:f.x,y:f.y,t});GN.push({k:'whirlp',x:f.x,y:f.y,t});}
 function cable(x0,y0,cx,cy,x1,y1,t){if(!x)return;G.push({k:'cable',x0,y0,cx,cy,x1,y1,t});GN.push({k:'cablen',x0,y0,cx,cy,x1,y1,t});}
 function aud(X,Y,t){if(!x)return;G.push({k:'aud',x:X,y:Y,t});}
 function glitchClone(X,Y,t){if(!x)return;G.push({k:'gclone',x:X,y:Y,t});}
 function ice(X,Y,t){if(!x)return;G.push({k:'ice',x:X,y:Y,t});}
 function overlay(kind,dur,X,Y){OV.push({k:kind,t:0,dur,x:X,y:Y});}
 function boxes(X){if(!x)return;for(let i=0;i<7;i++)add({k:'box',x:X+rnd(-40,40),y:rnd(30,48),vx:rnd(-10,10),vy:rnd(0,30),rot:rnd(-0.4,0.4),vr:rnd(-3,3),life:rnd(1.0,1.4)});}
 function arrowsUp(X0,X1,Y){if(!x)return;for(let i=0;i<2;i++)add({k:'glyph',x:X0+Math.random()*(X1-X0),y:Y-6,vx:0,vy:rnd(-45,-25),life:rnd(0.4,0.7),ch:'↑',col:'120,255,170',add:true,sz:5});}
 function links(pts){if(!x)return;for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]);if(d<45)G.push({k:'link',a:pts[i],b:pts[j],al:1-d/45});}}
 function charge(hx,hy,fx,fy,t,pr,col,kind){if(!x)return;G.push({k:'chg',hx,hy,fx,fy,t,pr,col});GN.push({k:'chgObj',hx,hy,t,pr,kind,col});}
 function chargeFull(hx,hy,col){if(!x)return;add({k:'ring',x:hx,y:hy,r0:3,r1:26,life:0.35,col,w:2.5});add({k:'flash',x:hx,y:hy,r0:2,r1:16,life:0.2,col});for(let i=0;i<10;i++){const a=i*0.628;add({k:'spark',x:hx,y:hy,vx:Math.cos(a)*120,vy:Math.sin(a)*120,life:0.3,len:0.04,w:1.4,col:'255,255,255',g:0});}}

 // ---------- FATALITIES HD ----------
 let FUI=null;
 function fatUI(o){FUI=o;}
 function htext(c,s,X,Y,size,fill,stroke,align){c.save();c.textAlign=align||'center';c.font=`bold ${size}px Impact, 'Arial Black', sans-serif`;if(stroke){c.lineWidth=size*0.14;c.strokeStyle=stroke;c.strokeText(s,X,Y);}c.fillStyle=fill;c.fillText(s,X,Y);c.restore();}
 function blood(X,Y,n,big,red){if(!x)return false;for(let i=0;i<n;i++){const a=big?-Math.PI*Math.random():(-Math.PI/2+(Math.random()-0.5)*2),v=(big?80:40)+Math.random()*(big?160:80);add({k:'bdrop',x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0.7+Math.random()*0.7,s:rnd(0.7,1.6),red,col:red?['#C8102E','#8A0010','#FF2040','#B00020'][i%4]:['#FFEC27','#29ADFF','#FF77A8','#00E436','#FFA300'][i%5],rot:rnd(0,6)});}return true;}
 function fatProp(o){if(x)GN.push(o);}
 function fatGlow(X,Y,r,col,a){if(x)G.push({k:'gl',x:X,y:Y,r,col,a});}
 function bills(X,Y,n,red){if(!x)return;for(let i=0;i<n;i++)add({k:'billp',x:X,y:Y,vx:rnd(40,140),vy:rnd(-150,-60),rot:rnd(0,6),vr:rnd(-10,10),life:rnd(0.8,1.2),red});}
 function winBurst(X,Y,n){if(!x)return;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=rnd(60,190);add({k:'winp',x:X+rnd(-10,10),y:Y+rnd(-30,10),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-60,rot:rnd(0,6),vr:rnd(-12,12),life:rnd(0.9,1.5)});}}
 function rain(X,Y){if(!x)return;for(let i=0;i<60;i++)add({k:'glyph',x:X+rnd(-14,14),y:Y-56+rnd(0,56),vx:rnd(-5,5),vy:rnd(20,70),life:rnd(0.7,1.2),ch:'01{}<>_;'[i%8],col:i%3?'80,255,150':'185,156,255',add:true,sz:4});}
 function hado(X,Y,r,dir,t){G.push({k:'hado',x:X,y:Y,r,dir,t});}

 // ---- rayo de luz real: capas de brillo, plasma, pulsos, destellos ----
 function drawBeam(c,x0,x1,y,h,t){const L=x1-x0;if(Math.abs(L)<2)return;const dir=Math.sign(L);c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
  const wob=1+0.07*Math.sin(t*45)+0.04*Math.sin(t*71);
  for(const [w,a,cl] of [[3.4,0.10,'255,30,100'],[2.2,0.18,'255,50,120'],[1.35,0.36,'255,90,150'],[0.7,0.75,'255,170,205'],[0.3,1,'255,255,255']]){c.strokeStyle=`rgba(${cl},${a})`;c.lineWidth=h*w*wob;c.beginPath();c.moveTo(x0,y);c.lineTo(x1,y);c.stroke();}
  for(let k=0;k<3;k++){c.strokeStyle=`rgba(255,${160+k*30},215,0.6)`;c.lineWidth=0.55;c.beginPath();for(let s=0;s<=48;s++){const u=s/48,px=x0+L*u,py=y+Math.sin(u*Math.abs(L)*0.16-t*32+k*2.1)*h*0.75*Math.sin(Math.min(1,u*6)*Math.PI/2);s?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
  for(let k=0;k<9;k++){const u=((t*3.2+k/9)%1),px=x0+L*u;c.strokeStyle='rgba(255,255,255,0.85)';c.lineWidth=h*0.32;c.beginPath();c.moveTo(px,y);c.lineTo(px+dir*Math.min(10,Math.abs(L)*0.08),y);c.stroke();}
  rgD(c,x0,y,h*3.2,[[0,'rgba(255,255,255,1)'],[0.25,'rgba(255,150,195,0.85)'],[1,'rgba(255,40,110,0)']]);
  {const gr=c.createLinearGradient(x0-h*9,0,x0+h*9,0);gr.addColorStop(0,'rgba(255,120,170,0)');gr.addColorStop(0.5,'rgba(255,240,250,0.95)');gr.addColorStop(1,'rgba(255,120,170,0)');c.fillStyle=gr;c.fillRect(x0-h*9,y-0.5,h*18,1);const gv=c.createLinearGradient(0,y-h*4,0,y+h*4);gv.addColorStop(0,'rgba(255,120,170,0)');gv.addColorStop(0.5,'rgba(255,240,250,0.8)');gv.addColorStop(1,'rgba(255,120,170,0)');c.fillStyle=gv;c.fillRect(x0-0.4,y-h*4,0.8,h*8);}
  rgD(c,x1,y,h*2.8,[[0,'rgba(255,255,255,0.95)'],[0.35,'rgba(255,150,200,0.65)'],[1,'rgba(255,40,110,0)']]);
  c.restore();}
 function glowAt(X,Y,r,col,a){if(x)G.push({k:'g',x:X,y:Y,r,col,a:a??0.8});}
 function beamAt(x0,x1,Y,h,col,t){if(x)G.push({k:'beam',x0,x1,y:Y,h,t:t||0});}
 function ambient(kind){amb=kind;}
 function view(ox,oy,z){vx=ox;vy=oy;vz=z;}
 function update(dt){for(const p of P){p.t+=dt;if(p.vx!==undefined){p.x+=p.vx*dt;p.y+=p.vy*dt;}
   if(p.k==='spark'){p.vy+=p.g*dt;p.vx*=Math.pow(0.1,dt);}
   if(p.k==='ember'||p.k==='shard'){p.vy+=420*dt;if(p.y>=124&&p.vy>0){p.y=124;p.vy*=-0.35;p.vx*=0.6;}if(p.rot!==undefined)p.rot+=p.vr*dt;}
   if(p.k==='fire'||p.k==='smoke'){p.vx*=Math.pow(0.3,dt);}
   if(p.k==='paper'){p.vy+=70*dt;p.vx*=Math.pow(0.5,dt);p.rot+=p.vr*dt;}
   if(p.k==='drop'||p.k==='check'||p.k==='note'||p.k==='coinp'){p.vy+=160*dt;if(p.rot!==undefined)p.rot+=(p.vr||6)*dt;}
   if(p.k==='frost')p.rot+=4*dt;
   if(p.k==='box'){p.vy+=200*dt;p.rot+=p.vr*dt;if(p.y>=120){p.y=120;p.vy*=-0.3;p.vr*=0.5;}}
   if(p.k==='pix'){p.vx*=Math.pow(0.2,dt);p.vy*=Math.pow(0.2,dt);}
   if(p.k==='bdrop'){if(p.y<123.5){p.vy+=330*dt;}else{p.y=123.5;p.vy=0;p.vx*=Math.pow(0.02,dt);p.flat=true;}}
   if(p.k==='billp'){p.vy+=160*dt;p.vx*=Math.pow(0.4,dt);p.rot+=p.vr*dt;}
   if(p.k==='winp'){p.vy+=120*dt;p.vx*=Math.pow(0.6,dt);p.rot+=p.vr*dt;}}
  for(const o of OV)o.t+=dt;OV=OV.filter(o=>o.t<o.dur);
  P=P.filter(p=>p.t<p.life);flash=Math.max(0,flash-dt*3.2);
  if(amb){const r=amb==='jean'||amb==='coni'?10:(amb==='brandan'?6:5);if(Math.random()<dt*r)add({k:'mote',x:rnd(0,W),y:rnd(50,124),vx:rnd(-6,6),vy:rnd(-10,-3),life:rnd(2,4),col:{jean:'80,200,255',coni:'120,255,170',brandan:'255,215,120',alvaro:'255,210,150',jl:'200,200,255',samir:'255,240,220',andres:'255,255,220'}[amb]||'255,255,255'});}}
 function draw(){if(!ok()){G=[];GN=[];return;}const s=S;x.setTransform(s,0,0,s,0,0);x.translate(vx,vy);if(vz){x.translate(W/2,90);x.scale(1+vz,1+vz);x.translate(-W/2,-90);}
  // humo y polvo (mezcla normal)
  x.globalCompositeOperation='source-over';for(const p of P){if(p.k!=='smoke')continue;const u=p.t/p.life,r=p.r0+(p.r1-p.r0)*u,a=(p.dust?0.35:0.5)*(1-u);const gr=x.createRadialGradient(p.x,p.y,0,p.x,p.y,r);const cc=p.dust?'170,160,150':'70,65,75';gr.addColorStop(0,`rgba(${cc},${a})`);gr.addColorStop(1,`rgba(${cc},0)`);x.fillStyle=gr;x.beginPath();x.arc(p.x,p.y,r,0,7);x.fill();}
  for(const p of P){if(p.k!=='paper')continue;const u=p.t/p.life;x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.globalAlpha=Math.min(1,(1-u)*1.4);const s=p.s;x.fillStyle='#F4F2E8';x.fillRect(-s*0.75,-s,s*1.5,s*2);x.fillStyle='#8A8A96';for(let l=0;l<3;l++)x.fillRect(-s*0.55,-s*0.6+l*s*0.45,s*1.1,s*0.14);if(p.stamp){x.fillStyle='#C8102E';x.fillRect(-s*0.6,s*0.25,s*1.2,s*0.5);}x.restore();}x.globalAlpha=1;
  for(const p of P){const u=p.t/p.life,a=Math.max(0,1-u);if(p.k==='drop'){x.fillStyle=`rgba(${p.col},${a})`;x.beginPath();x.ellipse(p.x,p.y,p.s*(1-u*0.5)+0.4,p.s*0.6,Math.atan2(p.vy,p.vx),0,7);x.fill();}
   else if(p.k==='check'){x.strokeStyle=p.ok?`rgba(34,224,106,${a})`:`rgba(255,51,85,${a})`;x.lineWidth=0.9;x.beginPath();if(p.ok){x.moveTo(p.x-1.8,p.y);x.lineTo(p.x-0.5,p.y+1.5);x.lineTo(p.x+2,p.y-1.8);}else{x.moveTo(p.x-1.5,p.y-1.5);x.lineTo(p.x+1.5,p.y+1.5);x.moveTo(p.x+1.5,p.y-1.5);x.lineTo(p.x-1.5,p.y+1.5);}x.stroke();}
   else if(p.k==='note'){x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.globalAlpha=a;x.fillStyle=p.col;x.fillRect(-1.5,-1.5,3,3);x.restore();x.globalAlpha=1;}
   else if(p.k==='glitch'){x.globalAlpha=a;x.fillStyle=p.col;x.fillRect(p.x,p.y,p.w,0.8);x.globalAlpha=1;}
   else if(p.k==='frost'){x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.strokeStyle=`rgba(210,240,255,${a})`;x.lineWidth=0.4;for(let k=0;k<3;k++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(-1.3,0);x.lineTo(1.3,0);x.stroke();}x.restore();}
   else if(p.k==='coinp'){const w=Math.abs(Math.cos(p.t*14+p.ph))*1.8+0.3;x.fillStyle=`rgba(255,200,60,${a})`;x.beginPath();x.ellipse(p.x,p.y,w,1.8,0,0,7);x.fill();}
   else if(p.k==='bdrop'){x.globalAlpha=Math.min(1,a*2);x.fillStyle=p.col;if(p.red){x.beginPath();if(p.flat)x.ellipse(p.x,p.y,p.s*1.8,p.s*0.45,0,0,7);else x.ellipse(p.x,p.y,p.s,p.s*(1+Math.min(1.5,Math.abs(p.vy)/200)),Math.atan2(p.vy,p.vx)-Math.PI/2,0,7);x.fill();}else{x.save();x.translate(p.x,p.y);x.rotate(p.rot+p.t*8);x.fillRect(-p.s,-p.s*0.5,p.s*2,p.s);x.restore();}x.globalAlpha=1;}
   else if(p.k==='winp'){x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.globalAlpha=Math.min(1,a*1.6);x.fillStyle='#ECECF0';x.fillRect(-7,-4,14,8);x.fillStyle='#1E5AD0';x.fillRect(-7,-4,14,2);x.fillStyle='#C8102E';x.fillRect(-5,-0.5,2,2);x.restore();x.globalAlpha=1;}
   else if(p.k==='billp'){x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.globalAlpha=Math.min(1,a*2);x.fillStyle=p.red?'#C8102E':'#5FB85F';x.fillRect(-3.5,-1.8,7,3.6);x.fillStyle=p.red?'#6A0010':'#2A6A2A';x.fillRect(-0.6,-0.8,1.2,1.6);x.restore();x.globalAlpha=1;}
   else if(p.k==='pix'){x.globalAlpha=a;x.fillStyle=p.col;x.fillRect(p.x,p.y,1.4,1.4);x.globalAlpha=1;}
   else if(p.k==='box'){x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.globalAlpha=Math.min(1,a*2);x.fillStyle='#F4F2E8';x.fillRect(-4,-2.5,8,5);x.fillStyle='#2A8A4A';x.fillRect(-4,-2.5,8,1.4);x.fillStyle='#888';x.fillRect(-3,0,6,0.6);x.restore();x.globalAlpha=1;}
   else if(p.k==='lupa'){const k=Math.min(1,p.t/0.15);x.globalAlpha=a;x.strokeStyle='#FFFFFF';x.lineWidth=1.4;x.beginPath();x.arc(p.x,p.y,6*k,0,7);x.stroke();x.lineWidth=2;x.beginPath();x.moveTo(p.x+4.3*k,p.y+4.3*k);x.lineTo(p.x+9*k,p.y+9*k);x.stroke();x.strokeStyle='#E0102E';x.lineWidth=1;for(let l=0;l<3;l++){x.beginPath();x.moveTo(p.x-18,p.y-6+l*5);x.lineTo(p.x-18+10*k,p.y-7+l*5);x.stroke();}x.globalAlpha=1;}
   else if(p.k==='glyph'&&!p.add){x.fillStyle=`rgba(${p.col},${a})`;x.font=`bold ${p.sz}px monospace`;x.fillText(p.ch,p.x,p.y);}}
  x.globalCompositeOperation='lighter';
  for(const p of P){const u=p.t/p.life,a=Math.max(0,1-u);if(p.k==='glyph'&&p.add){x.fillStyle=`rgba(${p.col},${a})`;x.font=`bold ${p.sz}px monospace`;x.fillText(p.ch,p.x,p.y);}else if(p.k==='heat'){x.fillStyle=`rgba(255,180,120,${a})`;x.fillRect(p.x,p.y,0.6,0.6);}else if(p.k==='star'){x.fillStyle=`rgba(255,255,255,${a})`;x.fillRect(p.x-0.3,p.y-1.6,0.6,3.2);x.fillRect(p.x-1.6,p.y-0.3,3.2,0.6);}}
  for(const q of G){if(q.k==='gl'){rgD(x,q.x,q.y,q.r,[[0,`rgba(${q.col},${q.a})`],[1,`rgba(${q.col},0)`]]);continue;}
   if(q.k==='wv'){const n=26,len=46;x.beginPath();x.moveTo(q.x,q.y+5);for(let s=0;s<=n;s++){const u=s/n,px=q.x-q.d*u*len,h=(1-u)*(1-u)*(11+Math.sin(q.t*22+s*0.7)*2.2)+Math.sin(u*Math.PI)*2;x.lineTo(px,q.y+5-h);}x.lineTo(q.x-q.d*len,q.y+5);x.closePath();const gg=x.createLinearGradient(0,q.y-8,0,q.y+5);gg.addColorStop(0,'rgba(170,255,200,0.15)');gg.addColorStop(0.6,'rgba(60,230,120,0.55)');gg.addColorStop(1,'rgba(30,200,100,0.85)');x.fillStyle=gg;x.fill();
    x.lineCap='round';for(const [w,a] of [[3,0.18],[1.6,0.4],[0.7,0.95]]){x.strokeStyle=`rgba(200,255,220,${a})`;x.lineWidth=w;x.beginPath();for(let s=0;s<=n;s++){const u=s/n,px=q.x-q.d*u*len,h=(1-u)*(1-u)*(11+Math.sin(q.t*22+s*0.7)*2.2)+Math.sin(u*Math.PI)*2;s?x.lineTo(px,q.y+5-h):x.moveTo(px,q.y+5-h);}x.stroke();}
    rgD(x,q.x,q.y+1,12,[[0,'rgba(220,255,230,0.75)'],[0.4,'rgba(120,255,170,0.4)'],[1,'rgba(0,200,100,0)']]);continue;}
   if(q.k==='holo'){const b=q.b;x.strokeStyle='rgba(120,255,170,0.9)';x.lineWidth=0.5;x.strokeRect(q.x-5.5*b,q.y-4.5*b,11*b,9*b);[0.4,0.6,0.85,1].forEach((h,k)=>{x.fillStyle=`rgba(80,255,150,${0.5+k*0.12})`;const hh=7.5*b*h*(0.8+0.2*Math.sin(q.t*10+k));x.fillRect(q.x-4.3*b+k*2.5*b,q.y+4*b-hh,1.8*b,hh);});x.strokeStyle='rgba(255,255,255,0.95)';x.beginPath();x.moveTo(q.x-4.5*b,q.y+2*b);x.lineTo(q.x-1.5*b,q.y);x.lineTo(q.x+1*b,q.y+0.8*b);x.lineTo(q.x+4.5*b,q.y-3.5*b);x.stroke();continue;}
   if(q.k==='arc'){for(let k=0;k<4;k++){const a=q.t*30+k*1.6;x.strokeStyle='rgba(255,250,200,0.9)';x.lineWidth=0.5;x.beginPath();x.moveTo(q.x,q.y);x.lineTo(q.x+Math.cos(a)*6+Math.sin(q.t*50+k)*2,q.y+Math.sin(a)*6);x.stroke();}continue;}
   if(q.k==='pwr'){rgD(x,q.x,q.y,5,[[0,'rgba(220,240,255,1)'],[1,'rgba(60,120,255,0.3)']]);x.strokeStyle='rgba(200,240,255,1)';x.lineWidth=1;x.beginPath();x.arc(q.x,q.y,6.5,-Math.PI/2+q.t*6,-Math.PI/2+q.t*6+4);x.stroke();continue;}
   if(q.k==='thr'){for(let k=0;k<8;k++)rgD(x,q.x-q.d*k*0.8,q.y,2.2-k*0.2,[[0,'rgba(200,240,255,0.9)'],[1,'rgba(40,120,255,0)']]);continue;}
   if(q.k==='twk'){for(let k=0;k<4;k++){const a=q.t*5+k*1.57,px=q.x+Math.cos(a)*8,py=q.y+Math.sin(a)*8;x.fillStyle='rgba(255,255,220,0.95)';x.fillRect(px-0.3,py-1.6,0.6,3.2);x.fillRect(px-1.6,py-0.3,3.2,0.6);}continue;}
   if(q.k==='whirl'){for(let k=0;k<5;k++){x.strokeStyle=`rgba(150,210,255,${0.55-k*0.08})`;x.lineWidth=1.1;x.beginPath();x.ellipse(q.x,q.y-34+k*6,18-k*1.5,3.5,0,q.t*12+k,q.t*12+k+4.5);x.stroke();}rgD(x,q.x,q.y-24,26,[[0,'rgba(120,190,255,0.3)'],[1,'rgba(0,60,255,0)']]);continue;}
   if(q.k==='cable'){const bz=(u,a,b,c)=>(1-u)*(1-u)*a+2*(1-u)*u*b+u*u*c;for(let k=0;k<5;k++){const u=((q.t*3+k/5)%1);rgD(x,bz(u,q.x0,q.cx,q.x1),bz(u,q.y0,q.cy,q.y1),3,[[0,'rgba(200,250,255,1)'],[1,'rgba(40,160,255,0)']]);}for(let k=0;k<6;k++){const a=k*1.05+q.t*30;x.strokeStyle='rgba(255,255,200,0.9)';x.lineWidth=0.6;x.beginPath();x.moveTo(q.x1,q.y1);x.lineTo(q.x1+Math.cos(a)*6,q.y1+Math.sin(a)*6);x.stroke();}rgD(x,q.x1,q.y1,8,[[0,'rgba(255,240,150,0.7)'],[1,'rgba(255,160,0,0)']]);continue;}
   if(q.k==='aud'){rgD(x,q.x,q.y,30,[[0,'rgba(255,210,90,0.3)'],[1,'rgba(255,160,0,0)']]);x.strokeStyle='rgba(255,220,120,0.8)';x.lineWidth=0.8;x.beginPath();x.ellipse(q.x,q.y,16,26,0,0,7);x.stroke();x.font='bold 6px sans-serif';for(let i=0;i<8;i++){const a=q.t*3+i*0.785;x.fillStyle=`rgba(255,230,140,${0.6+0.4*Math.sin(q.t*6+i)})`;x.fillText(i%2?'$':'%',q.x+Math.cos(a)*19-2,q.y+Math.sin(a)*28+2);}continue;}
   if(q.k==='gclone'){x.fillStyle='rgba(255,40,80,0.22)';x.fillRect(q.x-9,q.y-56,18,56);x.fillStyle='rgba(40,120,255,0.22)';x.fillRect(q.x-5,q.y-56,18,56);for(let yy=0;yy<56;yy+=2.5){if(Math.random()<0.2){x.fillStyle='rgba(180,255,255,0.5)';x.fillRect(q.x-9+rnd(-4,4),q.y-56+yy,18,0.7);}}continue;}
   if(q.k==='ice'){rgD(x,q.x,q.y-28,30,[[0,'rgba(140,220,255,0.35)'],[1,'rgba(0,120,255,0)']]);x.strokeStyle='rgba(200,240,255,0.9)';x.lineWidth=0.8;x.strokeRect(q.x-11,q.y-60,22,60);for(let i=0;i<10;i++){x.fillStyle='rgba(160,230,255,0.6)';x.fillRect(q.x-10+rnd(0,20),q.y-58+((i*13+q.t*20)%56),1.5,1.5);}continue;}
   if(q.k==='thr2'){for(let k=0;k<7;k++)rgD(x,q.x-q.d*k*1.2,q.y,2.6-k*0.3,[[0,'rgba(220,200,255,0.9)'],[1,'rgba(120,60,255,0)']]);continue;}
   if(q.k==='link'){x.strokeStyle=`rgba(185,156,255,${q.al*0.8})`;x.lineWidth=0.6;x.beginPath();x.moveTo(q.a[0],q.a[1]);x.lineTo(q.b[0],q.b[1]);x.stroke();continue;}
   if(q.k==='chg'){const {hx,hy,fx,fy,t,col}=q,k=q.pr;
     for(let i=0;i<22;i++){const a=rnd(i,1)*Math.PI*2,ph=(t*2.2+rnd(i,2))%1,r=(1-ph)*(46-k*10);const px=hx+Math.cos(a)*r,py=hy+Math.sin(a)*r*0.8;x.strokeStyle=`rgba(${col},${ph*0.9})`;x.lineWidth=0.8;x.beginPath();x.moveTo(px,py);x.lineTo(px-Math.cos(a)*5,py-Math.sin(a)*4);x.stroke();}
     const R0=2+k*6;rgD(x,hx,hy,R0*2.8,[[0,`rgba(${col},0.55)`],[1,`rgba(${col},0)`]]);rgD(x,hx,hy,R0,[[0,'rgba(255,255,255,1)'],[0.5,`rgba(${col},1)`],[1,`rgba(${col},0)`]]);
     for(let i=0;i<4;i++){const a=t*20+i*1.6;x.strokeStyle='rgba(255,255,255,0.85)';x.lineWidth=0.5;x.beginPath();x.moveTo(hx,hy);x.lineTo(hx+Math.cos(a)*R0*1.7,hy+Math.sin(a)*R0*1.7);x.stroke();}
     x.save();x.translate(fx,fy);x.scale(1,0.22);x.rotate(t*1.5);x.strokeStyle=`rgba(${col},${0.3+0.6*k})`;x.lineWidth=1.3;x.beginPath();x.arc(0,0,22,0,7);x.stroke();x.beginPath();x.arc(0,0,17,0,7);x.stroke();for(let i=0;i<12;i++){x.save();x.rotate(i*0.5236);x.fillStyle=`rgba(${col},${0.4+0.5*k})`;x.fillRect(18,-1,3,2);x.restore();}x.restore();
     rgD(x,fx,fy,28,[[0,`rgba(${col},${0.25*k})`],[1,`rgba(${col},0)`]]);continue;}
   if(q.k==='riff'){const r0=q.r;for(let k=0;k<4;k++){const rr=r0*(0.5+k*0.28)+Math.sin(q.t*30+k)*1.2;x.strokeStyle=k%2?`rgba(190,140,255,${0.85-k*0.15})`:`rgba(150,255,90,${0.9-k*0.15})`;x.lineWidth=1.4;x.beginPath();x.arc(q.x-q.d*r0*0.6,q.y,rr,q.d>0?-1.0:Math.PI-1.0,q.d>0?1.0:Math.PI+1.0);x.stroke();}for(let k=0;k<3;k++){x.strokeStyle='rgba(230,255,200,0.9)';x.lineWidth=0.6;x.beginPath();let px=q.x,py=q.y;x.moveTo(px,py);for(let s2=0;s2<3;s2++){px+=q.d*rnd(2,5);py+=rnd(-4,4);x.lineTo(px,py);}x.stroke();}rgD(x,q.x,q.y,r0*1.6,[[0,'rgba(150,255,90,0.35)'],[1,'rgba(80,0,255,0)']]);continue;}
   if(q.k==='rings'){const n=5;for(let k=0;k<n;k++){const px=q.x0+((q.t*230+k*((q.x1-q.x0)/n))%(Math.abs(q.x1-q.x0)||1));x.strokeStyle='rgba(255,140,170,0.7)';x.lineWidth=0.5;x.beginPath();x.ellipse(px,q.y,1.6,q.thick?8:5,0,0,7);x.stroke();}continue;}
   if(q.k==='g'){if(q.k==='lcore'){rgD(x,q.x,q.y,q.r*2.3,[[0,'rgba(90,170,255,0.55)'],[1,'rgba(0,40,255,0)']]);rgD(x,q.x,q.y,q.r,[[0,'rgba(255,255,255,1)'],[0.4,'rgba(190,235,255,1)'],[1,'rgba(40,100,255,0)']]);for(let i=0;i<6;i++){const a=q.x*0.05+i*1.05+performance.now()/90;x.fillStyle='rgba(220,250,255,0.9)';x.fillRect(q.x+Math.cos(a)*q.r*1.15,q.y+Math.sin(a)*q.r*1.15,0.8,0.8);}continue;}if(q.k==='hado'){drawHado(x,q.x,q.y,q.r,q.dir,q.t);continue;}if(q.k==='g'){const gr=x.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r);gr.addColorStop(0,`rgba(${q.col},${q.a})`);gr.addColorStop(0.35,`rgba(${q.col},${q.a*0.45})`);gr.addColorStop(1,`rgba(${q.col},0)`);x.fillStyle=gr;x.fillRect(q.x-q.r,q.y-q.r,q.r*2,q.r*2);}
   }else if(q.k==='beam'){drawBeam(x,q.x0,q.x1,q.y,q.h*0.55,q.t);}}
  G=[];
  for(const p of P){const u=p.t/p.life,a=1-u;
   if(p.k==='spark'){const sp=Math.hypot(p.vx,p.vy)||1,L=Math.max(2,sp*p.len);x.lineCap='round';x.strokeStyle=`rgba(${p.col},${a})`;x.lineWidth=p.w*1.8;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x-p.vx/sp*L,p.y-p.vy/sp*L);x.stroke();x.strokeStyle=`rgba(255,255,255,${a})`;x.lineWidth=p.w*0.6;x.stroke();}
   else if(p.k==='flash'){const r=p.r0+(p.r1-p.r0)*Math.min(1,u*2.2);const gr=x.createRadialGradient(p.x,p.y,0,p.x,p.y,r);gr.addColorStop(0,`rgba(255,255,255,${a})`);gr.addColorStop(0.3,`rgba(${p.col},${a*0.8})`);gr.addColorStop(1,`rgba(${p.col},0)`);x.fillStyle=gr;x.beginPath();x.arc(p.x,p.y,r,0,7);x.fill();}
   else if(p.k==='ring'){const r=p.r0+(p.r1-p.r0)*(1-Math.pow(1-u,2));x.strokeStyle=`rgba(${p.col},${a*0.9})`;x.lineWidth=p.w*(1-u)+0.3;x.beginPath();x.arc(p.x,p.y,r,0,7);x.stroke();}
   else if(p.k==='floor'){const r=p.r0+(p.r1-p.r0)*(1-Math.pow(1-u,2));x.strokeStyle=`rgba(${p.col},${a*0.8})`;x.lineWidth=2.5*(1-u)+0.3;x.beginPath();x.ellipse(p.x,p.y,r,r*0.18,0,0,7);x.stroke();}
   else if(p.k==='streak'){x.strokeStyle=`rgba(255,255,255,${a*0.9})`;x.lineWidth=1.2;for(let i=0;i<p.n;i++){const an=i/p.n*Math.PI*2+p.x;const r0=p.r*0.35+u*8,r1=p.r*(0.8+0.3*((i*7)%3)/2);x.beginPath();x.moveTo(p.x+Math.cos(an)*r0,p.y+Math.sin(an)*r0);x.lineTo(p.x+Math.cos(an)*r1,p.y+Math.sin(an)*r1);x.stroke();}}
   else if(p.k==='fire'){const r=p.r0+(p.r1-p.r0)*u;const gr=x.createRadialGradient(p.x,p.y,0,p.x,p.y,r);gr.addColorStop(0,`rgba(255,250,210,${a})`);gr.addColorStop(0.4,`rgba(255,160,40,${a*0.8})`);gr.addColorStop(1,'rgba(200,40,10,0)');x.fillStyle=gr;x.beginPath();x.arc(p.x,p.y,r,0,7);x.fill();}
   else if(p.k==='ember'||p.k==='mote'){const r=p.k==='mote'?1.4:1.8,aa=p.k==='mote'?Math.sin(u*Math.PI)*0.7:a;const gr=x.createRadialGradient(p.x,p.y,0,p.x,p.y,r*3);gr.addColorStop(0,`rgba(255,255,255,${aa})`);gr.addColorStop(0.3,`rgba(${p.col},${aa*0.8})`);gr.addColorStop(1,`rgba(${p.col},0)`);x.fillStyle=gr;x.fillRect(p.x-r*3,p.y-r*3,r*6,r*6);}
   else if(p.k==='shard'){x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.fillStyle=`rgba(170,230,255,${a})`;x.beginPath();x.moveTo(-p.s,0);x.lineTo(0,-p.s*0.6);x.lineTo(p.s,0);x.lineTo(0,p.s*0.6);x.fill();x.restore();}
   else if(p.k==='rays'){x.save();x.translate(p.x,p.y);x.rotate(p.t*0.8);for(let i=0;i<p.n;i++){x.rotate(Math.PI*2/p.n);const gr=x.createLinearGradient(0,0,160,0);gr.addColorStop(0,`rgba(${p.col},${0.55*a})`);gr.addColorStop(1,`rgba(${p.col},0)`);x.fillStyle=gr;x.beginPath();x.moveTo(0,0);x.lineTo(160,-7);x.lineTo(160,7);x.fill();}x.restore();}
   else if(p.k==='arc'){x.strokeStyle=`rgba(${p.col},${a})`;x.lineWidth=2.2*(1-u)+0.5;x.beginPath();x.arc(p.x,p.y,p.r+u*6,p.dir>0?Math.PI*0.6:-Math.PI*0.4,p.dir>0?Math.PI*1.4:Math.PI*0.4);x.stroke();}}
  x.globalCompositeOperation='source-over';
  for(const q of GN){if(q.k==='doc'){x.save();x.translate(q.x,q.y);x.rotate(Math.sin(q.t*12)*0.3);x.fillStyle='#F4F2E8';x.fillRect(-3.4,-4.5,6.8,9);x.fillStyle='#8A8A96';for(let l=0;l<3;l++)x.fillRect(-2.6,-2.8+l*2,5.2,0.6);x.strokeStyle='#E0102E';x.lineWidth=1.1;x.beginPath();x.moveTo(-2.6,-3.4);x.lineTo(2.6,3.4);x.moveTo(2.6,-3.4);x.lineTo(-2.6,3.4);x.stroke();x.restore();}
   else if(q.k==='form'){x.save();x.translate(q.x,q.y);x.rotate(-0.15);x.fillStyle='#F4F2E8';x.fillRect(-4,-5,8,10);x.fillStyle='#2A8A4A';x.fillRect(-4,-5,8,1.8);for(let l=0;l<3;l++){x.fillStyle='#888';x.fillRect(-1.5,-2+l*2.3,4.5,0.6);x.strokeStyle='#22B05A';x.lineWidth=0.5;x.strokeRect(-3.4,-2.5+l*2.3,1.3,1.3);}x.restore();}
   else if(q.k==='ticket'){x.fillStyle='#FFD000';x.fillRect(q.x-5,q.y-3.3,10,6.6);x.fillStyle='#E0A000';for(let k=0;k<4;k++)x.fillRect(q.x-5,q.y-2.8+k*1.6,0.8,0.6);x.fillStyle='#1A1A1A';x.font='bold 5px monospace';x.fillText('#',q.x-1.5,q.y+1.6);}
   else if(q.k==='bot'){const X=q.x,Y=q.y;x.fillStyle='#C8C8D0';x.fillRect(X-3.5,Y-3,7,6);x.fillStyle='#8A8A96';x.fillRect(X-3.5,Y+2,7,1);x.fillStyle='#1A1A24';x.fillRect(X-2.5,Y-1.8,5,2.2);x.fillStyle=Math.floor(q.t*8)%2?'#33FF88':'#FF3355';x.fillRect(X-1.8,Y-1.3,1,1);x.fillRect(X+0.8,Y-1.3,1,1);x.fillStyle='#FF004D';x.fillRect(X-0.3,Y-4.5,0.6,1.5);x.fillRect(X-0.8,Y-5,1.6,0.8);}
   else if(q.k==='card'){x.save();x.translate(q.x,q.y);x.rotate(q.t*14);x.fillStyle='#FFFFFF';x.fillRect(-2.3,-3.3,4.6,6.6);x.strokeStyle='#FF4AA0';x.lineWidth=0.5;x.strokeRect(-2.3,-3.3,4.6,6.6);x.fillStyle='#FF004D';x.font='bold 4px sans-serif';x.fillText('♥',-1.5,1.3);x.restore();}
   else if(q.k==='coin'){const w=Math.abs(Math.cos(q.t*12))*5+0.8;const gg=x.createLinearGradient(q.x-w,0,q.x+w,0);gg.addColorStop(0,'#A87A10');gg.addColorStop(0.5,'#FFE27A');gg.addColorStop(1,'#A87A10');x.fillStyle=gg;x.beginPath();x.ellipse(q.x,q.y,w,5,0,0,7);x.fill();if(w>2.5){x.fillStyle='#8A5A00';x.font='bold 5px sans-serif';x.fillText('$',q.x-1.4,q.y+1.8);}}
   else if(q.k==='term'){x.fillStyle='#0A1A12';x.fillRect(q.x-7,q.y-4,14,8);x.strokeStyle='#33FF88';x.lineWidth=0.5;x.strokeRect(q.x-7,q.y-4,14,8);x.fillStyle='#33FF88';x.font='bold 4px monospace';x.fillText('>_',q.x-5.5,q.y+1.3);if(Math.floor(q.t*8)%2)x.fillRect(q.x+0.5,q.y+0.8,2.2,0.8);}
   else if(q.k==='cablen'){x.lineCap='round';x.strokeStyle='#0A3A70';x.lineWidth=2.2;x.beginPath();x.moveTo(q.x0,q.y0);x.quadraticCurveTo(q.cx,q.cy,q.x1,q.y1);x.stroke();x.strokeStyle='#29ADFF';x.lineWidth=1.3;x.stroke();x.fillStyle='#E0E0E8';x.fillRect(q.x1-2.2,q.y1-1.8,4.4,3.6);x.fillStyle='#C8A040';x.fillRect(q.x1+(q.x1>q.x0?1.6:-2.6),q.y1-1.2,1,2.4);}
   else if(q.k==='chgObj'){const {hx,hy,t,kind}=q,k=q.pr;for(let i=0;i<10;i++){const ph=(t*1.3+i/10)%1,a=i*0.63+t*4,r=(1-ph)*30*(1-k*0.25);const px=hx+Math.cos(a)*r,py=hy+Math.sin(a)*r*0.8;x.globalAlpha=Math.min(1,ph*2.5)*(0.6+0.4*k);x.save();x.translate(px,py);x.rotate(a);
      if(kind==='paper'||kind==='docx'){x.fillStyle='#F4F2E8';x.fillRect(-1.3,-1.7,2.6,3.4);if(kind==='docx'){x.strokeStyle='#E0102E';x.lineWidth=0.5;x.beginPath();x.moveTo(-1,-1.3);x.lineTo(1,1.3);x.moveTo(1,-1.3);x.lineTo(-1,1.3);x.stroke();}}
      else if(kind==='coin'){x.rotate(-a);const w=Math.abs(Math.cos(t*10+i))*1.8+0.3;x.fillStyle='#FFD86A';x.beginPath();x.ellipse(0,0,w,2,0,0,7);x.fill();}
      else if(kind==='card'){x.fillStyle='#FFFFFF';x.fillRect(-1.2,-1.7,2.4,3.4);x.fillStyle='#FF004D';x.fillRect(-0.5,-0.4,1,0.9);}
      else if(kind==='check'){x.rotate(-a);x.strokeStyle=i%3?'#22E06A':'#FF3355';x.lineWidth=0.6;x.beginPath();x.moveTo(-1.3,0);x.lineTo(-0.3,1);x.lineTo(1.5,-1.3);x.stroke();}
      else if(kind==='note'){x.rotate(-a);x.fillStyle=i%2?'#9DFF5A':'#C9A0FF';x.font='bold 4px sans-serif';x.fillText(i%3?'♪':'♫',-1.5,1.5);}
      else{x.rotate(-a);x.fillStyle=kind==='kpi'?'#50FF96':(kind==='bits'?(i%2?'#FFD000':'#29ADFF'):(i%2?'#33FF88':'#B99CFF'));x.font='bold 3px monospace';x.fillText(kind==='kpi'?'%↑+'[i%3]:(kind==='bits'?'01#'[i%3]:'{}<>_;'[i%6]),-1,1);}
      x.restore();}x.globalAlpha=1;}
   else if(q.k==='gavel'){x.save();x.translate(q.x,q.y);x.rotate(q.ang);const g1=x.createLinearGradient(-14,0,14,0);g1.addColorStop(0,'#B8860B');g1.addColorStop(0.5,'#FFE9A0');g1.addColorStop(1,'#B8860B');x.fillStyle=g1;x.fillRect(-1.6,0,3.2,26);x.fillRect(-13,-7,26,10);x.fillStyle='rgba(255,255,255,0.6)';x.fillRect(-12,-6,24,1.5);x.restore();}
   else if(q.k==='stamp'){x.save();x.translate(q.x,q.y);x.rotate(-0.15);x.globalAlpha=q.a;x.fillStyle=q.red?'#C8102E':'#29ADFF';x.fillRect(-34,-10,68,20);x.strokeStyle='#FFFFFF';x.lineWidth=1;x.strokeRect(-32,-8,64,16);x.restore();x.globalAlpha=q.a;htext(x,'HA LUGAR',q.x,q.y+4,11,'#FFFFFF',null);x.globalAlpha=1;}
   else if(q.k==='pen'){x.save();x.translate(q.x,q.y);x.rotate(-0.8);const gp=x.createLinearGradient(-2,0,2,0);gp.addColorStop(0,'#111');gp.addColorStop(0.5,'#444');gp.addColorStop(1,'#111');x.fillStyle=gp;x.fillRect(-2,-34,4,34);x.fillStyle='#E8C060';x.fillRect(-2,-34,4,3);x.beginPath();x.moveTo(-2,0);x.lineTo(2,0);x.lineTo(0,5);x.fill();x.restore();}
   else if(q.k==='env'){x.save();x.translate(q.x,q.y);x.rotate(q.rot||0);x.fillStyle='#F4F2E8';x.fillRect(-20,-13,40,26);x.strokeStyle='#999';x.lineWidth=0.6;x.beginPath();x.moveTo(-20,-13);x.lineTo(0,2);x.lineTo(20,-13);x.stroke();x.fillStyle='#B0102A';x.beginPath();x.arc(0,3,4.5,0,7);x.fill();x.fillStyle='#E04050';x.beginPath();x.arc(-1,2,1.6,0,7);x.fill();x.restore();htext(x,'CERTIFICADO',q.x,q.y+21,6,'#FFE27A','#300');}
   else if(q.k==='letter'){x.save();x.translate(q.x,q.y);x.fillStyle='#F7F5EC';x.fillRect(-26,-34,52,34);x.fillStyle='#2A8A4A';x.fillRect(-26,-34,52,4);x.fillStyle='#999';for(let i=0;i<3;i++)x.fillRect(-20,-12+i*3.5,40-i*8,0.8);x.restore();htext(x,'DESPEDIDO',q.x,q.y-18,8,'#C8102E',null);}
   else if(q.k==='box'){x.save();x.translate(q.x,q.y);const gb=x.createLinearGradient(0,-16,0,0);gb.addColorStop(0,'#C89A5A');gb.addColorStop(1,'#8A6030');x.fillStyle=gb;x.fillRect(-16,-16,32,16);x.fillStyle='#6A4A20';x.fillRect(-16,-16,32,2);x.fillStyle='#3C8C4A';x.fillRect(-10,-22,6,7);x.fillStyle='#FFFFFF';x.fillRect(2,-21,7,6);x.fillStyle='#29ADFF';x.fillRect(3,-20,5,2);x.restore();htext(x,'DESVINCULADO',q.x,q.y-28,9,'#FF3355','#300');}
   else if(q.k==='bsodp'){x.globalAlpha=q.a;x.fillStyle='#1E5AD0';x.fillRect(q.x-24,q.y-66,48,66);x.fillStyle='#FFFFFF';x.font='bold 14px monospace';x.fillText(':(',q.x-18,q.y-44);x.font='bold 5px monospace';x.fillText('ERROR '+q.pc+'%',q.x-18,q.y-30);x.strokeStyle='#FFF';x.lineWidth=0.5;x.strokeRect(q.x-18,q.y-26,36,3);x.fillRect(q.x-18,q.y-26,36*q.pc/100,3);x.globalAlpha=1;}
   else if(q.k==='code'){htext(x,q.s,q.x,q.y,7,'#33FF88','#002A10');}
   else if(q.k==='shred'){x.save();x.translate(q.x,q.y);const gs=x.createLinearGradient(0,-q.h,0,0);gs.addColorStop(0,'#5A5A66');gs.addColorStop(1,'#2A2A33');x.fillStyle=gs;x.fillRect(-24,-q.h,48,q.h);x.fillStyle='#8A8A96';x.fillRect(-24,-q.h,48,2.5);for(let i=0;i<6;i++){x.fillStyle=Math.floor(q.t*20+i)%2?'#FF3355':'#331018';x.fillRect(-20+i*7,-q.h+3.5,3,1.5);}x.restore();htext(x,'$',q.x,q.y-q.h+12,8,'#FFD86A',null);}
   else if(q.k==='bot2'){const X=q.x,Y=q.y;x.fillStyle='#C8C8D0';x.fillRect(X-4,Y-8,8,7);x.fillStyle='#1A1A24';x.fillRect(X-3,Y-6.5,6,2.5);x.fillStyle=Math.floor(q.t*10)%2?'#33FF88':'#FF3355';x.fillRect(X-2,Y-6,1,1);x.fillRect(X+1,Y-6,1,1);x.fillStyle='#8A8A96';x.fillRect(X-3,Y-1,2,3);x.fillRect(X+1,Y-1,2,3);}
   else if(q.k==='errwin'){const X=q.x,Y=q.y,sh=q.shake||0;x.save();x.translate(X+sh,Y);x.fillStyle='rgba(0,0,0,0.35)';x.fillRect(1.2,1.2,32,14);x.fillStyle='#ECECF0';x.fillRect(0,0,32,14);x.fillStyle='#1E5AD0';x.fillRect(0,0,32,3.4);x.fillStyle='#FFFFFF';x.font='bold 2.6px monospace';x.fillText(q.name,1,2.6);x.fillStyle='#C8102E';x.fillRect(29,0.6,2.4,2.2);x.fillStyle='#C8102E';x.beginPath();x.arc(4.5,8.6,2.2,0,7);x.fill();x.fillStyle='#FFFFFF';x.fillRect(4.1,7.2,0.8,1.8);x.fillRect(4.1,9.4,0.8,0.7);x.fillStyle='#111';x.font='bold 3px monospace';x.fillText('NO RESPONDE',8,9.6);x.fillStyle='#C8C8D0';x.fillRect(20,10.6,10,2.4);x.restore();}
   else if(q.k==='killbtn'){x.save();x.translate(q.x,q.y);const pr=q.pressed;x.fillStyle=pr?'#8A0018':'#C8102E';x.fillRect(-30,pr?1:0,60,12);x.strokeStyle='#FFFFFF';x.lineWidth=0.7;x.strokeRect(-30,pr?1:0,60,12);x.restore();htext(x,'FINALIZAR TAREA',q.x,q.y+8.8+(q.pressed?1:0),7,'#FFFFFF',null);
    if(q.cur){x.save();x.translate(q.cx,q.cy);x.fillStyle='#FFFFFF';x.strokeStyle='#000';x.lineWidth=0.5;x.beginPath();x.moveTo(0,0);x.lineTo(0,9);x.lineTo(2.4,6.8);x.lineTo(4.2,10.4);x.lineTo(5.6,9.8);x.lineTo(3.8,6.2);x.lineTo(7,6.2);x.closePath();x.fill();x.stroke();x.restore();}}
   else if(q.k==='wallet'){x.save();x.translate(q.x,q.y);x.rotate(Math.sin(q.t*14)*0.3);x.scale(1.7,1.7);x.fillStyle='#5A3A20';x.fillRect(-4.5,-3,9,6);x.fillStyle='#7A5230';x.fillRect(-4.5,-3,9,1.5);x.fillStyle='#3A2412';x.fillRect(-0.5,-3,1,6);x.fillStyle='#C8A040';x.fillRect(2,-0.5,1.5,1.5);x.restore();}
   else if(q.k==='mothb'){const fl=Math.abs(Math.sin(q.t*30))*3+0.8;x.fillStyle='#BDB8A8';x.beginPath();x.ellipse(q.x-2.2,q.y,fl,2.4,0.4,0,7);x.ellipse(q.x+2.2,q.y,fl,2.4,-0.4,0,7);x.fill();x.fillStyle='#4A4238';x.fillRect(q.x-0.6,q.y-1.6,1.2,3.6);}
   else if(q.k==='ftxt'){htext(x,q.s,q.x,q.y,q.sz||8,q.col||'#FFEC27','#200');}
   else if(q.k==='skull'){x.save();x.translate(q.x,q.y);const s2=1+Math.sin(q.t*10)*0.06;x.scale(s2,s2);const P2=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h);};P2(-8,-9,16,12,'#F2F2EA');P2(-6,3,12,5,'#F2F2EA');P2(-6,-5,4,4,'#0A0A0A');P2(2,-5,4,4,'#0A0A0A');P2(-1,0,2,2,'#0A0A0A');for(let k=0;k<4;k++)P2(-5+k*3,5,1,3,'#0A0A0A');x.globalCompositeOperation='lighter';P2(-5,-4,2,2,'rgba(150,255,90,0.9)');P2(3,-4,2,2,'rgba(150,255,90,0.9)');x.globalCompositeOperation='source-over';x.restore();}
   else if(q.k==='boleta'){x.save();x.translate(q.x,q.y);x.rotate(q.rot||0);x.fillStyle='#F4F2E8';x.fillRect(-6,-9,12,18);x.fillStyle='#8A8A96';for(let i=0;i<5;i++)x.fillRect(-4.5,-6.5+i*2.6,i%2?6:9,0.7);x.fillStyle='#29ADFF';x.fillRect(-4.5,6.2,5,1.2);x.restore();}
   else if(q.k==='mag'){x.save();x.strokeStyle='#C9A227';x.lineWidth=2;x.beginPath();x.arc(q.x,q.y,9,0,7);x.stroke();x.fillStyle='rgba(200,230,255,0.18)';x.beginPath();x.arc(q.x,q.y,8,0,7);x.fill();x.lineWidth=3;x.beginPath();x.moveTo(q.x+6.5,q.y+6.5);x.lineTo(q.x+15,q.y+15);x.stroke();x.restore();}
   else if(q.k==='xmark'){x.strokeStyle='#E0102E';x.lineWidth=2.6;x.lineCap='round';x.beginPath();x.moveTo(q.x-7,q.y-9);x.lineTo(q.x+7,q.y+9);x.moveTo(q.x+7,q.y-9);x.lineTo(q.x-7,q.y+9);x.stroke();x.lineCap='butt';}
   else if(q.k==='bigstamp'){x.save();x.translate(q.x,q.y);const gw=x.createLinearGradient(-6,0,6,0);gw.addColorStop(0,'#5A2E14');gw.addColorStop(0.5,'#9A6A3A');gw.addColorStop(1,'#5A2E14');x.fillStyle=gw;x.fillRect(-6,-46,12,24);x.fillStyle='#8B5A2B';x.fillRect(-11,-52,22,8);x.fillStyle='#2A2A33';x.fillRect(-28,-22,56,13);x.fillStyle='#C8102E';x.fillRect(-30,-9,60,9);x.restore();}
   else if(q.k==='seal'){x.save();x.globalAlpha=q.a;x.translate(q.x,q.y);x.rotate(-0.08);x.fillStyle='rgba(200,16,46,0.9)';x.fillRect(-32,-7,64,14);x.strokeStyle='#FFFFFF';x.lineWidth=0.8;x.strokeRect(-30,-5,60,10);x.restore();x.globalAlpha=q.a;htext(x,'RECHAZADO',q.x,q.y+4,10,'#FFFFFF',null);x.globalAlpha=1;}
   else if(q.k==='whirlp'){for(let i=0;i<10;i++){const a=q.t*10+i*0.63,r=12+(i%3)*4;x.save();x.translate(q.x+Math.cos(a)*r,q.y-38+i*3+Math.sin(a)*2);x.rotate(a);x.fillStyle='#F4F2E8';x.fillRect(-1.2,-1.6,2.4,3.2);x.restore();}}
   else if(q.k==='bill'){x.save();x.translate(q.x,q.y);x.rotate(Math.sin(q.t*6+q.ph)*0.6);x.fillStyle='#5FB85F';x.fillRect(-4,-2,8,4);x.strokeStyle='#2A6A2A';x.lineWidth=0.5;x.strokeRect(-4,-2,8,4);x.fillStyle='#2A6A2A';x.font='bold 3px sans-serif';x.fillText('$',-0.9,1.1);x.restore();}
   else if(q.k==='agent'){x.fillStyle='#2A1A4A';x.beginPath();x.arc(q.x,q.y,3.6,0,7);x.fill();x.fillStyle='#8A5CFF';x.beginPath();x.arc(q.x,q.y,2.9,0,7);x.fill();x.fillStyle='#FFF';x.fillRect(q.x-0.8,q.y-0.8,1.8,1.3);x.fillStyle='#ccc';x.fillRect(q.x-4.6,q.y-4,9.2,0.6);}
   else if(q.k==='pwrIcon'){x.strokeStyle='#1E3A80';x.lineWidth=1;x.beginPath();x.arc(q.x,q.y,2.3,-1.0,Math.PI+1.0,false);x.stroke();x.beginPath();x.moveTo(q.x,q.y-3);x.lineTo(q.x,q.y-0.5);x.stroke();}}
  GN=[];
  x.setTransform(s,0,0,s,0,0);
  const vg=x.createRadialGradient(W/2,H*0.55,H*0.35,W/2,H*0.55,W*0.62);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.45)');x.fillStyle=vg;x.fillRect(0,13,W,H-13);
  if(FUI){const u=FUI;FUI=null;
   if(u.cine){const g0=x.createRadialGradient(u.cx,95,20,u.cx,95,150);g0.addColorStop(0,'rgba(0,0,0,0)');g0.addColorStop(1,`rgba(0,0,0,${0.62*u.cine})`);x.fillStyle=g0;x.fillRect(0,0,W,H);x.fillStyle='#000';x.fillRect(0,0,W,13*u.cine);if(!u.touch)x.fillRect(0,H-9*u.cine,W,9*u.cine);}
   if(u.track){const ty=u.touch?92:113,X0=44,X1=212,hx=60;x.fillStyle='rgba(8,8,16,0.72)';x.beginPath();x.roundRect?x.roundRect(X0,ty,X1-X0,20,10):x.rect(X0,ty,X1-X0,20);x.fill();x.strokeStyle='rgba(255,60,100,0.85)';x.lineWidth=0.8;x.stroke();
    x.globalCompositeOperation='lighter';rgD(x,hx,ty+10,14,[[0,'rgba(255,255,255,0.5)'],[1,'rgba(255,40,90,0)']]);x.globalCompositeOperation='source-over';x.strokeStyle='#FFFFFF';x.lineWidth=1;x.beginPath();x.arc(hx,ty+10,7,0,7);x.stroke();
    for(const n of u.notes){const px=hx+(n.time-u.t)/u.fall*130;if(px<X0+4||px>X1-4)continue;const col=['41,173,255','255,0,77','255,236,39','0,228,54'][n.lane];x.globalCompositeOperation='lighter';rgD(x,px,ty+10,9,[[0,`rgba(${col},0.75)`],[1,`rgba(${col},0)`]]);x.globalCompositeOperation='source-over';htext(x,['←','↓','↑','→'][n.lane],px,ty+14.5,11,'#FFFFFF',`rgb(${col})`);}
    for(const h of u.hits){const k=Math.min(1,h.age/0.35);x.globalCompositeOperation='lighter';x.strokeStyle=`rgba(${h.miss?'255,60,80':'120,255,170'},${1-k})`;x.lineWidth=1.4;x.beginPath();x.arc(hx,ty+10,7+k*10,0,7);x.stroke();x.globalCompositeOperation='source-over';}
    if(u.judge)htext(x,u.judge,128,ty-4,9,u.judge.startsWith('¡P')?'#FFE27A':(u.judge.startsWith('¡B')?'#7DFFAE':'#FF5577'),'#200');
    if(u.count)htext(x,'PERFECTO ×'+u.count,X1-2,ty-4,6,'#FFE27A','#200','right');
    if(u.prep)htext(x,'¡PREPARA!',128,ty-14,10,'#FF2D55','#200');
    if(u.touch){['←','↓','↑','→'].forEach((a,i)=>{const bx=2+i*48;x.fillStyle='rgba(10,10,20,0.75)';x.fillRect(bx,122,44,20);x.strokeStyle='rgba(255,255,255,0.6)';x.lineWidth=0.6;x.strokeRect(bx,122,44,20);htext(x,a,bx+22,137,13,'#FFFFFF',null);});}}
   if(u.fail)htext(x,'FALLASTE...',128,70,18,'#FF2D55','#200');
   if(u.banner){const k=u.banner;x.fillStyle=`rgba(0,0,0,${0.55*k})`;x.fillRect(0,0,W,H);x.globalCompositeOperation='lighter';rgD(x,W/2,80,120,[[0,`rgba(255,40,80,${0.5*k})`],[1,'rgba(255,0,40,0)']]);x.globalCompositeOperation='source-over';
    x.save();x.globalAlpha=k;x.textAlign='center';x.font=`bold ${Math.round(34+6*(1-k))}px Impact, 'Arial Black', sans-serif`;x.lineWidth=4;x.strokeStyle='#300008';x.strokeText('FATALITY',W/2,88);const tg=x.createLinearGradient(0,62,0,90);tg.addColorStop(0,'#FFC0C8');tg.addColorStop(0.5,'#FF2D55');tg.addColorStop(1,'#8A0018');x.fillStyle=tg;x.fillText('FATALITY',W/2,88);x.font="bold 9px Impact, 'Arial Black', sans-serif";x.fillStyle='#FFE27A';x.fillText(u.name,W/2,102);x.restore();}}
  for(const o of OV){const k=o.t/o.dur;
   if(o.k==='arcade'){const a2=Math.min(1,o.t*4)*Math.min(1,(1-k)*4);x.globalAlpha=0.25*a2;for(let yy=0;yy<H;yy+=2){x.fillStyle='#000';x.fillRect(0,yy,W,1);}x.globalAlpha=0.18*a2;x.fillStyle='#5BD12A';x.fillRect(0,0,W,H);x.globalAlpha=a2;if(k>0.62){const s3=Math.min(1,(k-0.62)*6);htext(x,'GAME OVER',W/2,70,Math.round(16+8*s3),'#9DFF5A','#0A2A00');htext(x,'INSERT COIN',W/2,88,7,Math.floor(o.t*4)%2?'#FFFFFF':'#5BD12A',null);}x.globalAlpha=1;}
   if(o.k==='crack'){x.globalAlpha=Math.min(1,(1-k)*3);x.strokeStyle='rgba(255,255,255,0.85)';x.lineWidth=0.7;for(let i=0;i<9;i++){let px=o.x||128,py=o.y||90;x.beginPath();x.moveTo(px,py);const a=i*0.7+0.3;for(let s=0;s<4;s++){px+=Math.cos(a+(rnd(i,s)-0.5))*14;py+=Math.sin(a+(rnd(i,s+9)-0.5))*14;x.lineTo(px,py);}x.stroke();}x.globalAlpha=1;}
   if(o.k==='bsod'){const w=Math.min(1,o.t*3)*W,fade=k>0.8?(1-k)/0.2:1;x.globalAlpha=0.88*fade;x.fillStyle='#1E5AD0';x.fillRect(0,48,w,76);x.globalAlpha=fade;if(o.t>0.25){x.fillStyle='#FFFFFF';x.font='bold 16px monospace';x.fillText(':(',14,74);x.font='bold 6px monospace';const pc=Math.min(100,Math.floor((o.t-0.25)/(o.dur*0.6)*100));x.fillText('FORMATEANDO... '+pc+'%',14,90);x.strokeStyle='#FFF';x.lineWidth=0.6;x.strokeRect(14,94,90,4);x.fillRect(14,94,90*pc/100,4);}x.globalAlpha=1;}
   else if(o.k==='code'){x.globalAlpha=0.35*Math.min(1,(1-k)*4);x.fillStyle='#33FF88';x.font='bold 5px monospace';for(let l=0;l<9;l++)x.fillText('while(true){ bot.go(); }',8+(l%2)*60,56+l*7+((o.t*20)%7));x.globalAlpha=1;}
   else if(o.k==='crash'){x.globalAlpha=Math.min(1,(1-k)*4);x.strokeStyle='#FF3355';x.lineWidth=2;const pts=[[150,55],[175,65],[190,60],[230,108]];const n=Math.min(pts.length,1+Math.floor(o.t*6));x.beginPath();x.moveTo(...pts[0]);for(let i=1;i<n;i++)x.lineTo(...pts[i]);x.stroke();if(n===pts.length){x.beginPath();x.moveTo(222,100);x.lineTo(231,110);x.lineTo(219,109);x.stroke();}x.globalAlpha=1;}}
  if(flash>0){x.fillStyle=`rgba(${flashRGB},${Math.min(0.85,flash)})`;x.fillRect(0,0,W,H);}}
 return {winBurst,fatUI,blood,fatProp,fatGlow,bills,rain,charge,chargeFull,clearOV(){OV=[];},paperBurst,pixBurst,lupa,fkick,whirl,cable,aud,glitchClone,ice,overlay,boxes,arrowsUp,links,pwr,beamFx,legalBall,hado,init,resize,clear,hit,block,boom,ko,shatter,superRays,dust,glowAt,beamAt,ambient,view,update,draw,reset(){P=[];G=[];GN=[];OV=[];flash=0;amb=null;},get n(){return P.length;}};})();

const LOGO_SRC={silica:'data:image/png;base64,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',datco:'data:image/png;base64,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'};

// ======================= FONDOS 3D (three.js) renderizados a baja resolución para verse pixelados =======================
const BG3D=(()=>{let REN=null,cv3=null,S=null,cam=null,cur=null,upd=null,failed=false,base=null;const RW=512,RH=288;
 const hasT=()=>typeof THREE!=='undefined';
 function init(){if(REN)return true;if(failed||!hasT()||typeof document==='undefined'||!document.createElement)return false;
  try{cv3=document.createElement('canvas');cv3.width=RW;cv3.height=RH;REN=new THREE.WebGLRenderer({canvas:cv3,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});REN.setPixelRatio(1);REN.setSize(RW,RH,false);REN.outputEncoding=THREE.sRGBEncoding;REN.toneMapping=THREE.ACESFilmicToneMapping;REN.toneMappingExposure=1.05;return true;}catch(e){failed=true;REN=null;return false;}}
 const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.6,metalness:0.1},o));
 const B=(S_,w,h,d,m,x,y,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);S_.add(b);return b;};
 const E=c=>new THREE.MeshBasicMaterial({color:c});
 function texCanvas(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,0);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return {t,x,c,redraw(tt){draw(x,tt);t.needsUpdate=true;}};}
 function setCam(p,l){cam.position.set(p[0],p[1],p[2]);base={p,l};cam.lookAt(l[0],l[1],l[2]);}

 // ---------- letreros como parte del entorno: fuente pixel del juego dentro de texturas 3D ----------
 function pxText(x,txt,px,py,fg,sc){x.fillStyle=typeof fg==='number'?P[fg]:fg;let cx=px;const ACC={'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U','Ñ':'N'};for(const ch0 of txt.toUpperCase()){const b=ACC[ch0],ch=b||ch0;const gph=F[ch];if(gph){for(let r=0;r<7;r++)for(let c=0;c<5;c++)if(gph[r*5+c]==='1')x.fillRect(cx+c*sc,py+r*sc,sc,sc);}if(b){if(ch0==='Ñ'){x.fillRect(cx+sc,py-2*sc,sc*2,sc);x.fillRect(cx+2*sc,py-2*sc,sc,sc);x.fillRect(cx+3*sc,py-3*sc,sc*2,sc);}else x.fillRect(cx+2*sc,py-2*sc,sc*2,sc);}cx+=6*sc;}}
 function pxTex(lines,o){const sc=o.sc||4,pad=o.pad??2,lh=9;const wChars=Math.max(...lines.map(l=>l.length));const W_=(wChars*6-1+pad*2)*sc,H_=(lines.length*lh-2+pad*2)*sc;const c=document.createElement('canvas');c.width=W_;c.height=H_;const x=c.getContext('2d');
  if(o.bg){x.fillStyle=o.bg;x.fillRect(0,0,W_,H_);}if(o.stripes){for(let i=-H_;i<W_;i+=sc*6){x.fillStyle=o.stripes;x.beginPath();x.moveTo(i,H_);x.lineTo(i+sc*3,H_);x.lineTo(i+sc*3+H_,0);x.lineTo(i+H_,0);x.fill();}x.fillStyle=o.bg2||'#111';x.fillRect(sc*2,sc*2,W_-sc*4,H_-sc*4);}
  if(o.border){x.strokeStyle=o.border;x.lineWidth=sc;x.strokeRect(sc/2,sc/2,W_-sc,H_-sc);}
  lines.forEach((l,i)=>{const lw=(l.length*6-1)*sc;const px=o.align==='left'?pad*sc:Math.round((W_-lw)/2);pxText(x,l,px,(pad+i*lh)*sc,o.fg,sc);});
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearFilter;t.encoding=THREE.sRGBEncoding;return {t,w:W_/sc,h:H_/sc,c,x};}
 function sign(S_,lines,pos,u,o={}){const tx=pxTex(lines,o);const mat=o.glow?new THREE.MeshBasicMaterial({map:tx.t,transparent:!o.bg}):new THREE.MeshStandardMaterial({map:tx.t,roughness:0.75,metalness:0.05,transparent:!o.bg});const m=new THREE.Mesh(new THREE.PlaneGeometry(tx.w*u,tx.h*u),mat);m.position.set(pos[0],pos[1],pos[2]);if(o.ry)m.rotation.y=o.ry;S_.add(m);return m;}

 // ---------- logos de la empresa: banderas, banderines, stickers ----------
 const LIMG={};const waves=[];
 function limg(w){if(!LIMG[w]&&typeof Image!=='undefined'&&typeof LOGO_SRC!=='undefined'){const im=new Image();im.src=LOGO_SRC[w];LIMG[w]=im;}return LIMG[w];}
 const BRAND={silica:'#4E7A1E',datco:'#250A6B'};
 function logoCanvas(w,cw,ch,draw){const c=document.createElement('canvas');c.width=cw;c.height=ch;const x=c.getContext('2d');const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.encoding=THREE.sRGBEncoding;const paint=()=>{x.clearRect(0,0,cw,ch);draw(x,limg(w));t.needsUpdate=true;};paint();const im=limg(w);if(im&&!im.complete)im.addEventListener('load',paint);return t;}
 function flagTex(w){return logoCanvas(w,96,64,(x,im)=>{x.fillStyle='#F4F4F0';x.fillRect(0,0,96,64);x.fillStyle=BRAND[w];x.fillRect(0,0,96,8);x.fillRect(0,56,96,8);if(im&&im.complete)x.drawImage(im,28,12,40,40);});}
 function poleFlag(S_,w,x,y,z,h,fw){const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,h,8),M(0xc9a227,{metalness:0.8,roughness:0.3}));pole.position.set(x,y+h/2,z);S_.add(pole);const tip=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,6),M(0xe8c060,{metalness:0.9,roughness:0.2}));tip.position.set(x,y+h+0.05,z);S_.add(tip);
  const fh=fw*0.66,geo=new THREE.PlaneGeometry(fw,fh,10,4);const fl=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:flagTex(w),side:THREE.DoubleSide,roughness:0.9}));fl.position.set(x+fw/2,y+h-fh/2-0.05,z);S_.add(fl);const base=geo.attributes.position.array.slice();waves.push({geo,base,fw});return fl;}
 function pennants(S_,x0,x1,y,z,n){const pts=[];for(let i=0;i<=n;i++){const u=i/n;pts.push(new THREE.Vector3(x0+(x1-x0)*u,y-Math.sin(u*Math.PI)*0.35,z));}const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x222222}));S_.add(line);
  for(let i=0;i<n;i++){const w=i%2?'datco':'silica';const u=(i+0.5)/n;const px=x0+(x1-x0)*u,py=y-Math.sin(u*Math.PI)*0.35;const tex=logoCanvas(w,48,56,(x,im)=>{x.fillStyle=BRAND[w];x.beginPath();x.moveTo(0,0);x.lineTo(48,0);x.lineTo(24,56);x.fill();if(im&&im.complete)x.drawImage(im,10,4,28,28);});const tri=new THREE.Mesh(new THREE.PlaneGeometry(0.55,0.65),new THREE.MeshStandardMaterial({map:tex,transparent:true,side:THREE.DoubleSide,roughness:0.9}));tri.position.set(px,py-0.33,z+0.01);tri.rotation.z=Math.sin(i)*0.08;S_.add(tri);waves.push({tri,ph:i});}}
 function deskFlag(S_,w,x,y,z,k=1){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.014*k,0.014*k,0.5*k,6),M(0xdddddd,{metalness:0.6}));p.position.set(x,y+0.25*k,z);S_.add(p);const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.33*k,0.22*k,4,2),new THREE.MeshStandardMaterial({map:flagTex(w),side:THREE.DoubleSide}));fl.position.set(x+0.165*k,y+0.38*k,z);S_.add(fl);B(S_,0.14*k,0.03,0.14*k,M(0x333333),x,y+0.015,z);}
 function sticker(S_,w,x,y,z,size,ry){const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshStandardMaterial({map:logoCanvas(w,64,64,(x,im)=>{if(im&&im.complete)x.drawImage(im,0,0,64,64);}),transparent:true,roughness:0.6}));m.position.set(x,y,z);if(ry)m.rotation.y=ry;S_.add(m);return m;}
 function animWaves(t){for(const q of waves){if(q.geo){const a=q.geo.attributes.position.array;for(let i=0;i<a.length;i+=3){const u=(q.base[i]+q.fw/2)/q.fw;a[i+2]=q.base[i+2]+Math.sin(t*5+u*6)*0.08*u;a[i+1]=q.base[i+1]+Math.sin(t*4+u*5)*0.02*u;}q.geo.attributes.position.needsUpdate=true;}else if(q.tri){q.tri.rotation.z=Math.sin(t*3+q.ph)*0.12;}}}
 const BUILD={
  jean(S_){S_.background=new THREE.Color(0x05070d);S_.fog=new THREE.Fog(0x061020,8,34);setCam([0,1.55,7.2],[0,1.6,-6]);
   B(S_,40,0.1,60,M(0x3a4252,{roughness:0.25,metalness:0.6}),0,-0.05,-10);for(let i=-20;i<20;i+=1.2)B(S_,0.02,0.102,60,M(0x252b36),i,-0.04,-10);
   const rackM=M(0x161c28,{roughness:0.5,metalness:0.5});const N=9*2*50,led=new THREE.InstancedMesh(new THREE.PlaneGeometry(0.05,0.022),new THREE.MeshBasicMaterial(),N);const dm=new THREE.Object3D(),C=[new THREE.Color(0x33ff88),new THREE.Color(0x29adff),new THREE.Color(0xffa300),new THREE.Color(0x0b1220)];let n=0;
   for(const side of [-1,1])for(let k=0;k<9;k++){const z=-0.6-k*2.2,x=side*3.1;B(S_,1.2,2.6,1.9,rackM,x,1.3,z);for(let u=0;u<25;u++)for(let q=0;q<2;q++){dm.position.set(x-side*0.61,0.2+u*0.095,z-0.5+q*0.7+((u*7)%5)*0.05);dm.rotation.set(0,side>0?-Math.PI/2:Math.PI/2,0);dm.updateMatrix();led.setMatrixAt(n,dm.matrix);led.setColorAt(n,C[(u+q+k)%3]);n++;}}
   S_.add(led);const cols=[0xffec27,0x29adff,0xff77a8,0x00e436];cols.forEach((c,i)=>B(S_,0.05,0.04,40,E(c),-0.6+i*0.4,3.05,-10));B(S_,2.4,0.05,40,M(0x2a3450),0,3.12,-10);
   for(let k=0;k<4;k++){sticker(S_,k%2?'silica':'datco',-2.49,1.9,-1.4-k*4.4,0.8,Math.PI/2);sticker(S_,k%2?'datco':'silica',2.49,1.4,-3.6-k*4.4,0.8,-Math.PI/2);}
   {const bn=new THREE.Mesh(new THREE.PlaneGeometry(1.0,1.5),new THREE.MeshStandardMaterial({map:logoCanvas('datco',64,96,(x,im)=>{x.fillStyle='#250A6B';x.fillRect(0,0,64,96);x.fillStyle='#4E7A1E';x.fillRect(0,48,64,48);if(im&&im.complete)x.drawImage(im,12,6,40,40);const i2=limg('silica');if(i2&&i2.complete)x.drawImage(i2,12,52,40,40);}),side:THREE.DoubleSide}));bn.position.set(1.0,2.3,-9);S_.add(bn);waves.push({tri:bn,ph:2});}
   sign(S_,['SALA 1'],[-1.2,2.85,-4.5],0.06,{bg:'#0B2A18',fg:'#33FF88',glow:true,border:'#33FF88'});{const w=sign(S_,['NO TOCAR','CABLES'],[2.47,1.9,-3.1],0.07,{bg:'#FFD000',fg:'#111',stripes:'#FFD000',bg2:'#111'});w.material=new THREE.MeshStandardMaterial({map:w.material.map,roughness:0.7});w.rotation.y=-Math.PI/2;}
   const pul=[];for(let i=0;i<8;i++){const p=B(S_,0.07,0.07,0.5,E(0xffffff),-0.6+(i%4)*0.4,3.05,-i*4);pul.push(p);}
   const noc=texCanvas(256,128,(x,t)=>{x.fillStyle='#07141c';x.fillRect(0,0,256,128);x.strokeStyle='#33ff88';x.lineWidth=4;x.beginPath();for(let i=0;i<=16;i++){const y=90-Math.sin(i*0.7+t*2)*20-i*2;i?x.lineTo(i*16,y):x.moveTo(0,y);}x.stroke();pxText(x,'NOC',10,8,'#29adff',4);});
   const sc=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.6),new THREE.MeshBasicMaterial({map:noc.t}));sc.position.set(0,1.9,-17.5);S_.add(sc);
   S_.add(new THREE.AmbientLight(0x223355,0.8));for(let k=0;k<5;k++){const p=new THREE.PointLight(0x29adff,1.4,9);p.position.set(0,2.8,1-k*4.5);S_.add(p);}const key=new THREE.DirectionalLight(0xbfe6ff,0.6);key.position.set(2,5,8);S_.add(key);
   let acc=0;return (t,dt)=>{for(const p of pul){p.position.z+=dt*9;if(p.position.z>6)p.position.z=-30;}acc+=dt;if(acc>0.25){acc=0;noc.redraw(t);for(let i=0;i<40;i++){const k=Math.floor(Math.random()*n);led.setColorAt(k,C[Math.floor(Math.random()*4)]);}led.instanceColor.needsUpdate=true;}};},
  jl(S_){S_.background=new THREE.Color(0x03040a);S_.fog=new THREE.Fog(0x05060f,14,40);setCam([0,1.2,7.5],[0,2.1,-6]);
   B(S_,30,0.1,40,M(0x2a1a10,{roughness:0.2,metalness:0.3}),0,-0.05,-8);B(S_,30,7,0.2,M(0x14141f),0,3,-12.2);
   const city=texCanvas(1024,256,(x,t)=>{const gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#050818');gr.addColorStop(1,'#1c1742');x.fillStyle=gr;x.fillRect(0,0,1024,256);x.fillStyle='#262245';x.beginPath();x.moveTo(0,170);x.lineTo(200,100);x.lineTo(380,150);x.lineTo(600,80);x.lineTo(820,140);x.lineTo(1024,110);x.lineTo(1024,256);x.lineTo(0,256);x.fill();
    let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<60;i++){const w=10+r()*18,h=30+r()*110,bx=i*17;x.fillStyle='#0d0d1c';x.fillRect(bx,256-h,w,h);for(let k=0;k<14;k++){const on=r()<0.45&&Math.sin(t*0.7+k+i)>-0.6;if(on){x.fillStyle=r()<0.7?'#ffd070':'#9ecbff';x.fillRect(bx+2+r()*(w-4),256-h+4+r()*(h-8),3,3);}}}for(let i=0;i<70;i++){x.fillStyle='rgba(255,255,255,'+(0.3+0.7*Math.abs(Math.sin(t+i)))+')';x.fillRect((i*97)%1024,(i*37)%90,2,2);}});
   const w=new THREE.Mesh(new THREE.PlaneGeometry(22,5.2),new THREE.MeshBasicMaterial({map:city.t}));w.position.set(0,3.2,-12);S_.add(w);for(let i=-4;i<=4;i++)B(S_,0.12,5.4,0.25,M(0x33334a),i*2.6,3.2,-11.9);
   B(S_,9,0.12,2.2,M(0x3a2212,{roughness:0.25,metalness:0.2}),0,0.95,-6.5);B(S_,9,0.6,0.08,M(0x2a180c),0,0.62,-5.38);for(let i=0;i<6;i++)deskFlag(S_,i%2?'silica':'datco',-3.6+i*1.45,1.01,-6.1,1.9);sticker(S_,'datco',-5.6,2.5,-11.9,1.8);sticker(S_,'silica',5.6,2.5,-11.9,1.8);
   sign(S_,['DIRECTORIO'],[0,0.64,-5.33],0.05,{bg:'#2A180C',fg:'#E8C060'});sign(S_,['META 2030: TODO, CHE'],[0,4.25,-11.95],0.09,{fg:'#FFE08A',glow:true});for(let i=0;i<7;i++)for(const s of [-1,1])B(S_,0.6,1.3,0.6,M(0x101018,{roughness:0.4}),-3.6+i*1.2,0.65,-6.5+s*1.5);
   S_.add(new THREE.AmbientLight(0x303050,0.9));for(let k=0;k<4;k++){const p=new THREE.PointLight(0xffd9a0,1.1,8);p.position.set(-4.5+k*3,3.2,-5);S_.add(p);}
   let acc=0;return (t,dt)=>{acc+=dt;if(acc>0.5){acc=0;city.redraw(t);}};},
  alvaro(S_){S_.background=new THREE.Color(0x0e0806);S_.fog=new THREE.Fog(0x120a06,12,34);setCam([0,1.4,7],[0,1.9,-6]);
   B(S_,30,0.1,40,M(0x6b4226,{roughness:0.3,metalness:0.15}),0,-0.05,-8);const wood=M(0x5a3a22,{roughness:0.5});B(S_,30,7,0.2,wood,0,3.5,-11);for(let i=-14;i<=14;i+=1.4)B(S_,0.08,7,0.25,M(0x4a2e1a),i,3.5,-10.85);
   B(S_,7,1.8,1.6,M(0x3e2412),0,0.9,-8.5);B(S_,7.4,0.12,1.9,M(0x6b4226),0,1.86,-8.5);const judge=new THREE.Mesh(new THREE.SphereGeometry(0.28,20,14),M(0xffccaa));judge.position.set(0,2.45,-9.1);S_.add(judge);B(S_,0.9,0.8,0.5,M(0x111111),0,2.0,-9.1);
   const gav=new THREE.Group();const h1=B(gav,0.35,0.14,0.14,M(0x8b5a2b),0,0,0);const h2=B(gav,0.05,0.4,0.05,M(0x6b4226),0,-0.2,0);gav.position.set(0.7,2.2,-8.6);S_.add(gav);
   const em=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.08,12,32),M(0xc9a227,{metalness:0.9,roughness:0.25}));em.position.set(0,4.2,-10.7);S_.add(em);B(S_,0.08,1.2,0.08,M(0xc9a227,{metalness:0.9,roughness:0.25}),0,4.2,-10.6);B(S_,1.2,0.06,0.06,M(0xc9a227,{metalness:0.9}),0,4.6,-10.6);
   for(const s of [-1,1])for(let r=0;r<3;r++)B(S_,3.2,0.6,0.5,M(0x3e2412),s*5.5,0.3,-3-r*1.6);
   sign(S_,['SILENCIO EN LA SALA'],[0,3.05,-10.72],0.085,{bg:'#2A1608',fg:'#E8C060',border:'#C9A227'});sign(S_,['HA LUGAR'],[0,1.25,-7.68],0.07,{bg:'#3E2412',fg:'#D8B070'});
   poleFlag(S_,'datco',-5.6,0,-8.2,2.6,2.2);poleFlag(S_,'silica',3.4,0,-8.2,2.6,2.2);
   S_.add(new THREE.AmbientLight(0x402818,0.9));const sp=new THREE.SpotLight(0xffe2b0,2.4,30,0.45,0.5);sp.position.set(0,7,-4);sp.target.position.set(0,1,-9);S_.add(sp,sp.target);const key=new THREE.DirectionalLight(0xffd9b0,0.5);key.position.set(0,6,8);S_.add(key);
   return (t)=>{const k=(t%3)<0.3?Math.sin((t%3)/0.3*Math.PI):0;gav.rotation.z=-k*1.1;};},
  samir(S_){S_.background=new THREE.Color(0x0b0d14);S_.fog=new THREE.Fog(0x0b0d14,12,30);setCam([0,1.4,7],[0,1.9,-6]);
   B(S_,30,0.1,40,M(0x4a4a5a,{roughness:0.9}),0,-0.05,-8);B(S_,30,7,0.2,M(0x3a4256),0,3.5,-10);
   const win=new THREE.Mesh(new THREE.PlaneGeometry(4,2.6),new THREE.MeshBasicMaterial({color:0x6a90b0}));win.position.set(0,2.4,-9.85);S_.add(win);for(let i=0;i<10;i++)B(S_,4.1,0.05,0.05,M(0xdfe8f0),0,1.2+i*0.26,-9.8);
   const cols=[0xc8102e,0x29adff,0xffec27,0x00875a,0xededed,0xff77a8];for(const sx of [-4.2,4.2]){B(S_,3.2,4.2,0.8,M(0x5a4632),sx,2.1,-9.4);for(let r=0;r<4;r++){B(S_,3.2,0.08,0.8,M(0x3a2e22),sx,0.5+r*1,-9.0);for(let i=0;i<12;i++)B(S_,0.2,0.7,0.5,M(cols[(i+r*3)%6]),sx-1.4+i*0.25,0.9+r*1,-9.0);}}
   B(S_,3,0.1,1.2,M(0x6b4226),0,1.0,-7);for(const lx of [-1.3,1.3])B(S_,0.1,1,0.1,M(0x4e2e1a),lx,0.5,-7);for(let k=0;k<3;k++)B(S_,0.5,0.3+k*0.2,0.35,M(0xf4f4f4),-0.8+k*0.6,1.2+k*0.1,-7);
   deskFlag(S_,'datco',-1.45,1.05,-6.6,2.4);deskFlag(S_,'silica',0.85,1.05,-6.6,2.4);
   sign(S_,['CONTRATOS'],[-4.2,3.3,-8.9],0.085,{bg:'#F2EEDD',fg:1,border:'#5A4632'});sign(S_,['NDA POR','REVISAR: 999'],[4.2,3.2,-8.9],0.075,{bg:'#F2EEDD',fg:8,border:'#5A4632'});
   {const st=sign(S_,['URGENTE'],[0.1,1.72,-6.75],0.05,{bg:'#F4F4F4',fg:'#D01030',border:'#D01030',pad:1});st.rotation.z=0.12;}
   const lamp=new THREE.PointLight(0xffd080,1.4,6);lamp.position.set(1.2,1.8,-7);S_.add(lamp);B(S_,0.3,0.15,0.3,E(0xffe0a0),1.2,1.7,-7);
   S_.add(new THREE.AmbientLight(0x404860,0.9));const key=new THREE.DirectionalLight(0xcfe0ff,0.8);key.position.set(0,4,6);S_.add(key);return null;},
  andres(S_){S_.background=new THREE.Color(0x10160f);S_.fog=new THREE.Fog(0x10160f,12,30);setCam([0,1.4,7],[0,1.9,-6]);
   B(S_,30,0.1,40,M(0x6a6a5a,{roughness:0.9}),0,-0.05,-8);B(S_,30,7,0.2,M(0x4e6e5e),0,3.5,-10);
   const wb=texCanvas(512,256,(x,t)=>{x.fillStyle='#f4f4f4';x.fillRect(0,0,512,256);pxText(x,'CLIMA LABORAL',61,10,'#223',6);const v=[0.6,0.8,0.45,0.9,0.7],c=['#00e436','#29adff','#ffa300','#ff77a8','#ffec27'];v.forEach((q,i)=>{const h=150*q*(0.9+0.1*Math.sin(t*2+i));x.fillStyle=c[i];x.fillRect(70+i*80,230-h,50,h);});});
   const b=new THREE.Mesh(new THREE.PlaneGeometry(5,2.5),new THREE.MeshBasicMaterial({map:wb.t}));b.position.set(0,2.5,-9.85);S_.add(b);B(S_,5.2,2.7,0.05,M(0x777777),0,2.5,-9.9);
   const post=(txt,x0)=>{const p=texCanvas(256,256,(x)=>{x.fillStyle='#f2e8c8';x.fillRect(0,0,256,256);if(txt==='EQUIPO')pxText(x,'EQUIPO',21,20,'#333',6);else{pxText(x,'VALORES',2,14,'#333',6);pxText(x,'PUNTUALIDAD*',10,150,'#333',3.3);pxText(x,'*A VECES',30,200,'#C01030',4);}if(txt==='EQUIPO')for(let i=0;i<4;i++){x.fillStyle=['#ff004d','#29adff','#00e436','#ffa300'][i];x.beginPath();x.arc(50+i*50,150,18,0,7);x.fill();}else for(let i=0;i<2;i++){x.fillStyle='#888';x.fillRect(40,90+i*24,176,8);}});const m=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),new THREE.MeshBasicMaterial({map:p.t}));m.position.set(x0,2.6,-9.85);S_.add(m);};post('EQUIPO',-4.5);post('VALORES',4.5);
   pennants(S_,-6.5,6.5,3.55,-9.7,14);
   const tab=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,0.1,32),M(0x6b4226));tab.position.set(0,0.95,-6.8);S_.add(tab);B(S_,0.2,0.9,0.2,M(0x4e2e1a),0,0.45,-6.8);
   for(let i=0;i<6;i++){const a=i/6*Math.PI*2;B(S_,0.5,1,0.5,M(0x2a3040),Math.cos(a)*2.4,0.5,-6.8+Math.sin(a)*1.2);}
   for(const px of [-6,6]){B(S_,0.4,0.6,0.4,M(0x6b3a1e),px,0.3,-8);const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry(0.7,0),M(0x3c8c4a,{roughness:0.9}));leaf.position.set(px,1.2,-8);S_.add(leaf);}
   S_.add(new THREE.AmbientLight(0x506050,0.6));const key=new THREE.DirectionalLight(0xfff4e0,0.8);key.position.set(3,6,6);S_.add(key);
   let acc=0;return (t,dt)=>{acc+=dt;if(acc>0.2){acc=0;wb.redraw(t);}};},
  coni(S_){S_.background=new THREE.Color(0x0a0f16);S_.fog=new THREE.Fog(0x0a0f16,10,28);setCam([0,1.4,7],[0,1.9,-6]);
   B(S_,30,0.1,40,M(0x5a6070,{roughness:0.35,metalness:0.6}),0,-0.05,-8);B(S_,30,7,0.2,M(0x1c2430),0,3.5,-10);
   const scr=[];for(const sx of [-4,0,4]){const s=texCanvas(256,160,(x,t)=>{x.fillStyle='#050a10';x.fillRect(0,0,256,160);if(sx===4){const W_=256-56,H_=160-56,px=Math.abs(((t*60)%(2*W_))-W_),py=Math.abs(((t*45)%(2*H_))-H_),hit=Math.floor(t*60/W_)+Math.floor(t*45/H_),im=limg(hit%2?'silica':'datco');if(im&&im.complete)x.drawImage(im,px,py,56,56);return;}const L_=['LOOP:','  AUTOMATIZAR()','  REVISAR()','  CAFE()','FIN','OK: 100%','BOT 1 LISTO','BOT 2 LISTO'];for(let k=0;k<7;k++){const q=(((Math.floor(t*2)+k+sx)%L_.length)+L_.length)%L_.length;pxText(x,L_[q],8,6+k*21,k%3?'#00e436':'#29adff',2);}});const m=new THREE.Mesh(new THREE.PlaneGeometry(3,1.9),new THREE.MeshBasicMaterial({map:s.t}));m.position.set(sx,2.6,-9.85);S_.add(m);scr.push(s);}
   sign(S_,['LAB. AUTOMATIZACIÓN'],[0,4.05,-9.84],0.08,{fg:'#33FF88',glow:true,border:'#1A7A44'});
   const arm=new THREE.Group();B(arm,0.8,0.3,0.8,M(0x555a66,{metalness:0.6}),0,0.15,0);const a1=new THREE.Group();a1.position.set(0,0.3,0);arm.add(a1);B(a1,0.2,1.4,0.2,M(0xffa300,{metalness:0.4}),0,0.7,0);const a2=new THREE.Group();a2.position.set(0,1.4,0);a1.add(a2);B(a2,0.16,1.0,0.16,M(0xffa300,{metalness:0.4}),0,0.5,0);B(a2,0.3,0.12,0.2,M(0xdddddd),0,1.0,0);{const fl=new THREE.Mesh(new THREE.PlaneGeometry(0.75,0.5),new THREE.MeshStandardMaterial({map:flagTex('silica'),side:THREE.DoubleSide}));fl.position.set(0.4,1.45,0);a2.add(fl);B(a2,0.03,0.6,0.03,M(0xcccccc),0,1.25,0);}arm.position.set(4.5,0,-6.5);S_.add(arm);
   B(S_,9,0.15,1,M(0x2a2a33,{metalness:0.4}),-1.5,0.6,-7.5);const boxes=[];for(let k=0;k<5;k++){boxes.push(B(S_,0.5,0.4,0.5,M(0xc8a060),-5+k*2,0.9,-7.5));}
   S_.add(new THREE.AmbientLight(0x2a3a44,1.0));for(const [c,x] of [[0x00e436,-4],[0x29adff,0],[0x00e436,4]]){const p=new THREE.PointLight(c,1.0,7);p.position.set(x,2.5,-8);S_.add(p);}const key=new THREE.DirectionalLight(0xcfe8ff,0.6);key.position.set(0,5,6);S_.add(key);
   let acc=0;return (t,dt)=>{a1.rotation.z=Math.sin(t*1.5)*0.6-0.2;a2.rotation.z=Math.sin(t*1.5+1)*0.8;arm.rotation.y=Math.sin(t*0.7)*0.6;for(const b of boxes){b.position.x+=dt*1.2;if(b.position.x>3)b.position.x=-6;}acc+=dt;if(acc>0.25){acc=0;scr.forEach(s=>s.redraw(t));}};},

  fran(S_){S_.background=new THREE.Color(0x07060e);S_.fog=new THREE.Fog(0x07060e,11,28);setCam([0,1.4,7],[0,1.9,-6]);
   B(S_,30,0.1,40,M(0x25222e,{roughness:0.95}),0,-0.05,-8);B(S_,30,7,0.2,M(0x1c1a28),0,3.5,-10);
   const neon=(c,x,y,w)=>{B(S_,w,0.06,0.06,E(c),x,y,-9.85);const p=new THREE.PointLight(c,0.9,7);p.position.set(x,y-0.3,-9);S_.add(p);};neon(0x8a5cff,-3.5,3.6,5);neon(0x29adff,3.5,3.6,5);
   B(S_,6.4,0.1,1.3,M(0x2a2a34,{roughness:0.5}),0,1.0,-8.2);for(const lx of [-3,3])B(S_,0.1,1,1.2,M(0x1a1a22),lx,0.5,-8.2);
   const mons=[];const LN_=['AGENT.RUN()','PROMPT: HOLA','TOOLS: 12','OK: DEPLOY','LOOP: MEJORAR','ERROR: CAFE','TEST: 100%','GIT PUSH'];
   [-2.1,0,2.1].forEach((mx,j)=>{const tx=texCanvas(256,160,(x,t)=>{x.fillStyle='#050a10';x.fillRect(0,0,256,160);for(let k=0;k<6;k++){const q=(((Math.floor(t*2)+k+j*3)%LN_.length)+LN_.length)%LN_.length;pxText(x,LN_[q],6,6+k*25,k%2?'#33FF88':'#B99CFF',3);}});const m=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.15),new THREE.MeshBasicMaterial({map:tx.t}));m.position.set(mx,1.75,-8.55);S_.add(m);B(S_,1.9,1.25,0.06,M(0x111118),mx,1.75,-8.6);B(S_,0.1,0.35,0.1,M(0x111118),mx,1.15,-8.6);mons.push(tx);});
   B(S_,0.8,1.6,0.9,M(0x15151d,{metalness:0.5,roughness:0.4}),5.2,0.8,-8.4);const led=B(S_,0.05,0.05,0.02,E(0x33ff88),5.0,1.3,-7.94);
   const ch=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.1,16),M(0x222230));ch.position.set(0,0.55,-7.1);S_.add(ch);B(S_,0.7,0.8,0.1,M(0x222230),0,1.0,-6.8);
   for(const cx of [-1.2,1.3]){const mug=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.16,10),M(0xf4f4f4));mug.position.set(cx,1.14,-7.8);S_.add(mug);}
   poleFlag(S_,'silica',-5.4,0,-8.2,2.5,1.3);poleFlag(S_,'datco',4.2,0,-8.2,2.5,1.3);for(const [mx,w] of [[-2.1,'datco'],[0,'silica'],[2.1,'datco']])sticker(S_,w,mx+0.75,1.28,-8.5,0.2);
   sign(S_,['AGENTES V2'],[-5.2,2.6,-9.84],0.08,{bg:'#F4F4F4',fg:'#5A3AB0',border:'#888'});sign(S_,['EQUIPO DEV:','1 PERSONA'],[5.1,2.75,-9.84],0.07,{bg:'#1A1A24',fg:'#33FF88',glow:true,border:'#33FF88'});
   B(S_,0.4,0.6,0.4,M(0x6b3a1e),-6.3,0.3,-8);const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry(0.6,0),M(0x3c8c4a,{roughness:0.9}));leaf.position.set(-6.3,1.1,-8);S_.add(leaf);
   S_.add(new THREE.AmbientLight(0x2a2640,0.9));const key=new THREE.DirectionalLight(0xd8ccff,0.5);key.position.set(0,5,6);S_.add(key);
   let acc=0;return (t,dt)=>{acc+=dt;led.material.color.setHex(Math.floor(t*4)%2?0x33ff88:0x0a2a14);if(acc>0.25){acc=0;mons.forEach(m=>m.redraw(t));}};},
  brandan(S_){S_.background=new THREE.Color(0x0c1220);S_.fog=new THREE.Fog(0x0c1220,12,30);setCam([0,1.4,7],[0,1.9,-6]);
   B(S_,30,0.1,40,M(0xd0d0d8,{roughness:0.15,metalness:0.3}),0,-0.05,-8);B(S_,30,7,0.2,M(0x23304a),0,3.5,-10);
   const ch=texCanvas(512,256,(x,t)=>{x.fillStyle='#050b12';x.fillRect(0,0,512,256);pxText(x,'IPSA',10,8,'#ffec27',4);x.strokeStyle='#123';for(let i=0;i<8;i++){x.beginPath();x.moveTo(0,i*32);x.lineTo(512,i*32);x.stroke();}x.lineWidth=4;let v=130;const o=Math.floor(t*6);for(let i=0;i<64;i++){const k=i+o,nv=130+Math.sin(k*0.37)*40+Math.cos(k*0.91)*25;x.strokeStyle=nv<v?'#00e436':'#ff004d';x.beginPath();x.moveTo(i*8,v);x.lineTo(i*8+8,nv);x.stroke();v=nv;}});
   const scn=new THREE.Mesh(new THREE.PlaneGeometry(6,3),new THREE.MeshBasicMaterial({map:ch.t}));scn.position.set(0,2.6,-9.85);S_.add(scn);
   const tk=texCanvas(1024,64,(x,t)=>{x.fillStyle='#000';x.fillRect(0,0,1024,64);x.font='bold 40px monospace';const s='USD ▲  CLP ▼  UF ▲  IPSA ▲  COBRE ▲  ';const w=x.measureText(s).width;const off=-(t*120)%w;for(let k=0;k<3;k++){x.fillStyle='#ffa300';x.fillText(s,off+k*w,46);}});
   
   B(S_,1.4,1.6,1.2,M(0x555566,{metalness:0.8,roughness:0.3}),5,0.8,-8);sticker(S_,'datco',5,0.6,-7.39,0.85);for(const [bx,w] of [[-5.5,'silica'],[-4.6,'datco']])sticker(S_,w,bx,0.45,-7.04,0.35);
   sign(S_,['FACTURAS','POR COBRAR'],[-3.4,2.5,-7.45],0.045,{bg:'#0A1A12',fg:'#33FF88',glow:true});sign(S_,['PROVEEDORES','REEMBOLSOS:','EN TRÁMITE'],[2.4,2.6,-7.45],0.045,{bg:'#1D1D24',fg:'#9DFF5A',glow:true});
   sign(S_,['CAJA FUERTE'],[5,1.4,-7.38],0.05,{bg:'#333344',fg:'#DDDDDD'});
   const tkx=pxTex(['DATCO ↑   SILICA ↑   USD ↑   CLP ↓   UF ↑   CAFÉ ↑   SUELDO ↓   IPSA ↑   '],{bg:'#000',fg:'#FFA300',sc:4,align:'left',pad:1});tkx.t.wrapS=THREE.RepeatWrapping;tkx.t.repeat.x=1;
   {const cx=tkx.x;const L_=(tkx.w);}
   const tickM=new THREE.Mesh(new THREE.PlaneGeometry(9,0.5),new THREE.MeshBasicMaterial({map:tkx.t}));tickM.position.set(0,1.0,-9.8);S_.add(tickM);tkx.t.repeat.x=9/(tkx.w*(0.5/tkx.h));const dial=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,0.1,24),M(0xaaaaaa,{metalness:0.9}));dial.rotation.x=Math.PI/2;dial.position.set(5,0.9,-7.35);S_.add(dial);
   for(const bx of [-5.5,-4.6]){const bag=new THREE.Mesh(new THREE.SphereGeometry(0.45,16,12),M(0xc8a060,{roughness:0.9}));bag.position.set(bx,0.45,-7.5);S_.add(bag);}
   S_.add(new THREE.AmbientLight(0x303a50,1.0));const g1=new THREE.PointLight(0xffd070,1.4,9);g1.position.set(-3,3,-6);S_.add(g1);const g2=new THREE.PointLight(0x29adff,1.0,9);g2.position.set(3,3,-6);S_.add(g2);
   let acc=0;return (t,dt)=>{dial.rotation.z=t;tkx.t.offset.x=(tkx.t.offset.x+dt*0.08)%1;acc+=dt;if(acc>0.2){acc=0;ch.redraw(t);}};}
 };

 // ---------- público integrado en 3D (sprites pixelados con perspectiva) ----------
 const CROWD_POS={alvaro:[[-4.6,-3.4],[4.6,-3.4],[-6.1,-5.0],[6.1,-5.0],[-5.2,-6.6],[5.4,-6.6],[-3.8,-5.0],[3.9,-5.0],[-6.4,-3.4],[6.4,-3.4]],
  samir:[[-3.2,-7.8],[3.2,-7.8],[-5.6,-7.3],[5.6,-7.3],[-2.2,-8.9],[2.2,-8.9],[-6.8,-6.2],[6.8,-6.2]],
  andres:[[-2.7,-7.9],[2.7,-7.9],[-1.2,-8.5],[1.3,-8.5],[-4.6,-7.4],[4.6,-7.4],[-6.8,-6.4],[6.8,-6.4]],
  jl:[[-3.0,-8.4],[3.0,-8.4],[-1.0,-8.5],[1.0,-8.5],[-5.2,-7.2],[5.2,-7.2],[-6.8,-5.8],[6.8,-5.8]],
  jean:[[-1.8,-5.2],[1.8,-5.2],[-1.2,-9.2],[1.4,-9.4],[-0.4,-13],[0.7,-13.2],[-1.6,-16],[1.5,-16.2]],
  coni:[[-5.0,-8.5],[-2.5,-8.6],[0.2,-8.7],[2.6,-8.6],[-6.4,-6.9],[6.2,-6.9],[-3.8,-9.2],[3.9,-9.2]],
  fran:[[-4.6,-8.2],[4.8,-8.2],[-2.4,-8.9],[2.6,-8.9],[-6.6,-6.8],[6.6,-6.8],[-0.2,-9.3],[5.9,-9.0]],
  brandan:[[-3.6,-8.3],[-1.6,-8.7],[1.6,-8.7],[3.6,-8.3],[-5.6,-6.9],[6.6,-6.6],[-6.6,-8.4],[2.6,-9.2]]};
 const texCache={};let crowdG=null,crowdKey='',crowdS=[];
 function guyTex(look,pose,flag){const k=JSON.stringify(look)+pose+(flag||'');if(texCache[k])return texCache[k];const c=document.createElement('canvas');c.width=18;c.height=26;const x=c.getContext('2d');const cc=v=>typeof v==='number'?P[v]:v;const Rr=(a,b,w,h,v)=>{x.fillStyle=cc(v);x.fillRect(a,b,w,h);};
  const body=()=>{Rr(6,19,2,6,look.pants);Rr(10,19,2,6,look.pants);Rr(5,11,8,8,look.top);Rr(5,11,2,8,'rgba(0,0,0,0.25)');
   if(pose==='cheer'){Rr(3,4,2,8,look.skin);Rr(13,4,2,8,look.skin);}else if(pose!=='horror'){Rr(4,12,1,6,look.skin);Rr(13,12,1,6,look.skin);}
   Rr(6,5,6,6,look.skin);if(!look.bald)Rr(6,4,6,2,look.hair);else Rr(7,5,2,1,'#fff');if(look.longHair)Rr(5,5,1,7,look.hair);if(look.beard)Rr(6,9,6,2,look.hair);if(look.glasses)Rr(6,7,6,1,0);else{Rr(7,7,1,1,0);Rr(10,7,1,1,0);}
   if(pose==='horror'){Rr(5,6,8,3,look.skin);Rr(4,9,2,5,look.skin);Rr(12,9,2,5,look.skin);}
   if(flag&&pose!=='horror'){const fy=pose==='cheer'?0:6;Rr(14,fy,1,pose==='cheer'?6:8,'#DDDDDD');Rr(15,fy,3,3,flag==='datco'?'#3A1A90':'#5E9A2A');Rr(16,fy+1,1,1,'#FFFFFF');}};
  // contorno oscuro
  const tmp=document.createElement('canvas');tmp.width=18;tmp.height=26;const tx=tmp.getContext('2d');const save=x;
  body();const img=x.getImageData(0,0,18,26);const out=x.createImageData(18,26);
  for(let yy=0;yy<26;yy++)for(let xx=0;xx<18;xx++){const i=(yy*18+xx)*4;if(img.data[i+3]>0){out.data[i]=img.data[i];out.data[i+1]=img.data[i+1];out.data[i+2]=img.data[i+2];out.data[i+3]=255;continue;}
   let nb=false;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=xx+dx,Y=yy+dy;if(X>=0&&Y>=0&&X<18&&Y<26&&img.data[(Y*18+X)*4+3]>0)nb=true;}if(nb){out.data[i]=10;out.data[i+1]=6;out.data[i+2]=22;out.data[i+3]=230;}}
  x.clearRect(0,0,18,26);x.putImageData(out,0,0);
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.encoding=THREE.sRGBEncoding;texCache[k]=t;return t;}
 const SIL={skin:'#2a2436',hair:'#1a1622',top:'#2f2840',pants:'#1a1622'};
 function setCrowd(id,cams,pose,t){const key=id+'|'+cams.map(l=>JSON.stringify(l)).join('/');
  if(key!==crowdKey){if(crowdG)S.remove(crowdG);crowdG=new THREE.Group();crowdS=[];const pos=CROWD_POS[id]||CROWD_POS.jean;
   pos.forEach(([px,pz],i)=>{const look=i<cams.length?cams[i]:SIL;const flag=i>=cams.length||i%2===1?(i%2?'datco':'silica'):null;const m=new THREE.SpriteMaterial({map:guyTex(look,'idle',flag),transparent:true});const sp=new THREE.Sprite(m);const h=1.75;sp.scale.set(h*18/26,h,1);sp.position.set(px,h/2,pz);sp.userData={look,ph:i*1.3,base:h/2,flag};crowdG.add(sp);crowdS.push(sp);});
   S.add(crowdG);crowdKey=key;}
  for(const sp of crowdS){const u=sp.userData;const tex=guyTex(u.look,pose,u.flag);if(sp.material.map!==tex){sp.material.map=tex;sp.material.needsUpdate=true;}sp.position.y=u.base+(pose==='cheer'?Math.abs(Math.sin(t*12+u.ph))*0.18:0);}}

 function project(x,y,z){const v=new THREE.Vector3(x,y,z).project(cam);return [(v.x+1)/2*W,(1-v.y)/2*H,v.z<1];}
 function build(id){waves.length=0;crowdKey='';crowdG=null;crowdS=[];S=new THREE.Scene();cam=new THREE.PerspectiveCamera(42,RW/RH,0.1,200);upd=(BUILD[id]||BUILD.jean)(S);cur=id;}
 let lastT=0,fc=0,skip=1,lvl=0,ema=16,slowT=0;
 function adapt(frameMs){if(typeof window!=='undefined'&&window.BG3D_NOADAPT)return;ema=ema*0.95+frameMs*0.05;if(ema>24){slowT+=frameMs/1000;if(slowT>1.2){slowT=0;lvl+=ema>45?2:1;if(lvl===1)skip=2;else if(lvl===2){skip=2;REN.setSize(256,144,false);}else{failed=true;}}}else slowT=Math.max(0,slowT-frameMs/2000);}
 function draw(id,t,camX,crowd){if(!init())return false;try{if(cur!==id)build(id);if(crowd)setCrowd(id,crowd.cams,crowd.pose,t);const dt=Math.min(0.05,Math.max(0,t-lastT));if(lastT)adapt(Math.min(100,(t-lastT)*1000));lastT=t;fc++;
   if(fc%skip===0){cam.position.set(base.p[0]+clamp(camX,-1,1)*0.45,base.p[1]+Math.sin(t*0.6)*0.03,base.p[2]);cam.lookAt(base.l[0]+clamp(camX,-1,1)*0.25,base.l[1],base.l[2]);if(upd)upd(t,dt*skip);animWaves(t);REN.render(S,cam);}
   g.save();g.imageSmoothingEnabled=true;g.drawImage(cv3,0,0,W,H);g.restore();g.imageSmoothingEnabled=false;return true;}catch(e){failed=true;if(typeof console!=='undefined')console.error('BG3D',e&&e.message);return false;}}
 return {ready:()=>init(),active:()=>!!REN&&!failed,draw,get failed(){return failed;},get level(){return lvl;}};})();

// ======================= NIVEL 6: SPARRING (pelea 2D) =======================
const GYF=124,GRV=800,CHG=0.7;
const ATK={punch:{s:0.05,a:0.09,r:0.13,dmg:5,box:[8,-49,21,9],push:70,stun:0.24},kick:{s:0.1,a:0.1,r:0.2,dmg:8,box:[6,-33,26,9],push:95,stun:0.3},
 jkick:{dmg:8,box:[2,-22,24,16],push:85,stun:0.32},fkick:{dmg:13,box:[4,-28,28,16],push:150,stun:0.45},upper:{dmg:12,box:[2,-66,20,34],push:110,stun:0.45},
 ball:{dmg:10,push:80,stun:0.32},sup:{dmg:22,push:190,stun:0.6},low:{dmg:9,push:80,stun:0.3},beam:{dmg:12,push:90,stun:0.4},whirl:{dmg:5,push:40,stun:0.28},whirlEnd:{dmg:7,push:170,stun:0.45}};
const LOOK_ME={skin:15,hair:HAIR,top:"#1E1E24",pants:1,glove:8,bw:16,kind:'me'};
const FOES=[
 {n:'ANDRÉS',hp:110,spd:50,think:0.42,aggr:0.5,block:0.25,ballP:0.22,sp:0.2,fk:0,jump:0.05,anti:0.1,dmul:1.2,ballK:'form',spk:['stomp'],
  look:{skin:"#8D5524",hair:"#111111",top:"#3C8C4A",pants:"#20202A",glove:11,bw:22,kind:'andres'},shout:{ball:"¡EVALUACIÓN!",stomp:"¡CAPACITACIÓN!"}},
 {n:'JOSÉ LUIS',hp:110,spd:70,think:0.34,aggr:0.55,block:0.3,ballP:0.15,sp:0.22,fk:0.08,jump:0.1,anti:0.1,dmul:1,ballK:'kpi',spk:['beam'],up:0.55,
  look:{skin:"#8D5524",hair:"#111111",top:"#29ADFF",pants:"#1D2B53",glove:1,bw:17,kind:'jl',glasses:true},shout:{ball:"¡KPI!",beam:"¡VISIÓN!",upper:"¡AL ALZA!"}},
 {n:'SAMIR',hp:130,spd:75,think:0.3,aggr:0.6,block:0.4,ballP:0.12,sp:0.28,fk:0.05,jump:0.08,anti:0.35,dmul:1.2,ballK:'doc',spk:['tele','triple'],
  look:{skin:15,hair:"#3B2A20",top:"#1E1E24",pants:"#1E1E24",glove:2,bw:18,kind:'samir',bald:true,beard:true},shout:{ball:"¡OBJETADO!",tele:"¡REVISIÓN!",triple:"¡TRES CLÁUSULAS!"}}];
const PAD=[{k:'left',x:2,y:110,w:26,h:32,l:'←'},{k:'up',x:30,y:110,w:26,h:15,l:'↑'},{k:'down',x:30,y:127,w:26,h:15,l:'↓'},{k:'right',x:58,y:110,w:26,h:32,l:'→'},
 {k:'punch',x:170,y:110,w:42,h:15,l:'GOLPE'},{k:'kick',x:214,y:110,w:40,h:15,l:'PATADA'},{k:'ballHold',x:170,y:127,w:42,h:15,l:'BOLA'},{k:'fkHold',x:214,y:127,w:40,h:15,l:'VOLAR'}];
const HOLDK=['left','right','down','ballHold','fkHold'];
let TOUCHUI=matchMedia('(pointer: coarse)').matches;
function newFighter(x,face,look,P){return {x,y:GYF,vx:0,vy:0,face,st:'idle',t:0,hp:P?P.hp:100,max:P?P.hp:100,spd:P?P.spd:80,dmul:P?P.dmul:1,look,cdB:0,cdF:0,walkT:0,active:false,hitDone:false,combo:0,comboT:0,ai:{},aiT:0.6,aiHold:0,P,shout:null,alpha:1};}
const L6={id:'box3',name:'SPARRING',sub:'Pelea 2D en el datacenter',
 howto:["← → CAMINAR · ↑ SALTAR · ↓ AGACHARSE","Z GOLPE · X PATADA (TAMBIÉN SALTANDO)","C BOLA OBJECIÓN · V PATADA VOLADORA","MANTÉN C O V: CARGA LA VERSIÓN SÚPER","MANTÉN HACIA ATRÁS PARA CUBRIRTE","AGACHADO ESQUIVAS LOS GOLPES ALTOS"],
 init(){this.ri=0;this.score=0;this.taken=0;this.landed=0;this.balls=0;this.supers=0;this.inp={left:false,right:false,down:false,up:false,punch:false,kick:false,ballHold:false,fkHold:false};this.touches={};this.fx=[];this.parts=[];this.stop=0;this.shake=0;this.exc=0;
   if(A.mus)A.mus.gain.value=0.4;this.crowd=ambient('noise',{ft:'bandpass',ff:900,q:0.8,v:0.03});this.startRound();
   musicStart(150,(s,t,s16)=>{const bar=Math.floor(s/16)%4,root=[40,40,43,38][bar];if(s%2===0)[0,7].forEach(k=>tone('sawtooth',hz(root+k),t,s16*1.6,0.045,A.mus,null,{lp:1600,dist:true}));
     if(s%8===0||s%16===10)kick(t,0.6);if(s%8===4)snare(t,0.3);if(s%2===0)hat(t,false,0.05);if(s%32===0)noise(t,0.6,0.1,'highpass',5000,A.mus);if(s%16===12)tone('square',hz(root+19),t,s16*3,0.03,A.mus,null,{lp:2000});});},
 startRound(){const P=FOES[this.ri];this.me=newFighter(70,1,LOOK_ME,null);this.foe=newFighter(186,-1,P.look,P);this.projs=[];this.phase='intro';this.pt=0;this.timer=60;this.beam=null;S.bell(0.25);},
 say(f,txt){f.shout={t:txt,k:0};},
 // ---------- lógica de luchador ----------
 fup(f,inp,o,dt){f.t+=dt;f.cdB=Math.max(0,f.cdB-dt);f.cdF=Math.max(0,f.cdF-dt);if(f.comboT>0){f.comboT-=dt;if(f.comboT<=0)f.combo=0;}
   const onG=f.y>=GYF-0.01;f.back=(o.x>f.x?inp.left:inp.right);f.active=false;
   const air=()=>{f.x+=f.vx*dt;f.vy+=GRV*dt;f.y+=f.vy*dt;if(f.y>=GYF){f.y=GYF;f.vy=0;return true;}return false;};
   if(f.st==='ko'){f.alpha=1;if(f.x<16||f.x>W-16){f.x=clamp(f.x,16,W-16);f.vx=-f.vx*0.3;this.shake=0.15;}if(f.y<GYF||f.vy<0){f.x+=f.vx*dt;f.vy+=GRV*dt;f.y+=f.vy*dt;if(f.y>=GYF){f.y=GYF;if(!f.bounced&&f.vy>80){f.bounced=true;f.vy=-f.vy*0.35;f.vx*=0.5;this.shake=0.25;tone('sine',80,AT(),0.3,0.8,null,40);noise(AT(),0.25,0.25,'lowpass',500);for(let i=0;i<14;i++)this.parts.push({x:f.x+(RND()-0.5)*30,y:GYF-2,vx:(RND()-0.5)*80,vy:-RND()*50,t:0,life:0.6,c:6,grav:true});}else{f.vy=0;f.land=true;}}}else{f.vx*=Math.pow(0.02,dt);f.x+=f.vx*dt;}return;}
   if(f.st==='hurt'||f.st==='bstun'){f.alpha=1;f.vx*=Math.pow(0.004,dt);f.x+=f.vx*dt;if(f.y<GYF){f.vy+=GRV*dt;f.y=Math.min(GYF,f.y+f.vy*dt);}if(f.t>=f.stun&&f.y>=GYF)this.idle(f);return;}
   if(f.st==='punch'||f.st==='kick'){const A_=ATK[f.st];f.active=f.t>=A_.s&&f.t<A_.s+A_.a;if(f.t>=A_.s+A_.a+A_.r)this.idle(f);return;}
   if(f.st==='ball'){if(!f.thrown&&f.t>=0.2){f.thrown=true;this.throwBall(f,f.sup);}if(f.t>=(f.sup?0.6:0.45))this.idle(f);return;}
   if(f.st==='chargeB'||f.st==='chargeF'){const hold=f.st==='chargeB'?inp.ballHold:inp.fkHold,full=f.t>=CHG;
     if(full&&!f.full){f.full=true;const t=AT();tone('sine',1320,t,0.25,0.1);tone('sine',1980,t+0.05,0.25,0.06);}
     if(Math.floor(f.t*10)!==Math.floor((f.t-dt)*10)&&!full)tone('sine',300+f.t*900,AT(),0.08,0.04);
     if(RND()<dt*40){const a=RND()*7,r=22;this.parts.push({x:f.x+Math.cos(a)*r,y:f.y-30+Math.sin(a)*r,vx:-Math.cos(a)*60,vy:-Math.sin(a)*60,t:0,life:0.35,c:f.st==='chargeB'?12:9});}
     if(!hold||f.t>2.2){f.full=false;if(f.st==='chargeB'){f.st='ball';f.t=0;f.thrown=false;f.sup=full;f.cdB=full?2.0:1.3;this.balls++;if(full)this.supers++;this.say(f,full?"¡SÚPER OBJECIÓN!":"¡OBJECIÓN!");}
       else if(full){f.st='whirl';f.t=0;f.tick=0;f.hits=0;f.cdF=2.0;this.supers++;this.say(f,"¡TORBELLINO!");const t=AT();noise(t,1.0,0.12,'bandpass',900);tone('sawtooth',200,t,0.9,0.05,null,500);}
       else{this.startFk(f);}}return;}
   if(f.st==='whirl'){f.tick-=dt;if(f.tick<=0&&f.t<0.95){f.tick=0.16;f.hitDone=false;f.active=true;noise(AT(),0.08,0.08,'bandpass',2600);}if(f.t>=1.05)this.idle(f);return;}
   if(f.st==='sp'){this.special(f,o,dt);return;}
   if(f.st==='jump'||f.st==='fkick'||f.st==='upper'){if(f.st==='jump'&&inp.kick&&!f.jk){f.jk=true;f.hitDone=false;this.whoosh();}if(f.st==='fkick'&&f.t>0.06)f.active=true;if(f.st==='upper'&&f.vy<40)f.active=true;if(f.jk)f.active=true;
     if(air()){f.wasF=f.st!=='jump';f.st='land';f.t=0;f.jk=false;f.active=false;}return;}
   if(f.st==='land'){if(f.t>=(f.wasF?0.22:0.06))this.idle(f);return;}
   f.face=o.x>f.x?1:-1;f.alpha=1;
   if(inp.sp){f.st='sp';f.t=0;f.spk=inp.spk;f.phase=0;if(f.P.shout[f.spk])this.say(f,f.P.shout[f.spk]);if(f.spk==='upper'){f.st='upper';f.vy=-300;f.vx=f.face*50;f.hitDone=false;this.whoosh();}}
   else if(inp.fkick&&f.cdF<=0)this.startFk(f);
   else if(inp.fkHold&&f.cdF<=0){f.st='chargeF';f.t=0;f.full=false;}
   else if(inp.ball&&f.cdB<=0){f.st='ball';f.t=0;f.thrown=false;f.sup=false;f.cdB=1.3;if(f.P&&f.P.shout.ball)this.say(f,f.P.shout.ball);tone('sine',300,AT(),0.2,0.08,null,900);}
   else if(inp.ballHold&&f.cdB<=0){f.st='chargeB';f.t=0;f.full=false;}
   else if(inp.punch){f.st='punch';f.t=0;f.hitDone=false;this.whoosh();}
   else if(inp.kick){f.st='kick';f.t=0;f.hitDone=false;this.whoosh();}
   else if(inp.up){f.st='jump';f.t=0;f.vy=-275;f.vx=(inp.right?1:(inp.left?-1:0))*90;f.jk=false;f.hitDone=false;}
   else if(inp.down)f.st='crouch';
   else if(inp.left||inp.right){const d=inp.right?1:-1;f.x+=d*f.spd*(d===f.face?1:0.7)*dt;f.st=d===f.face?'walk':'back';f.walkT+=dt;}
   else f.st='idle';},
 startFk(f){f.st='fkick';f.t=0;f.vy=-200;f.vx=f.face*190;f.cdF=1.1;f.hitDone=false;if(f===this.me)this.say(f,"¡HAAA!");tone('square',300,AT(),0.25,0.07,null,700);this.whoosh();},
 special(f,o,dt){const k=f.spk,t=AT();
   if(k==='stomp'){if(f.t>=0.4&&f.phase===0){f.phase=1;this.projs.push({x:f.x+f.face*16,y:f.y-6,vx:f.face*190,owner:f,kind:'wave',low:true});this.shake=0.25;tone('sine',70,t,0.4,0.9,null,35);noise(t,0.3,0.3,'lowpass',400);}if(f.t>=0.75)this.idle(f);}
   else if(k==='beam'){if(f.t>=0.45&&f.phase===0){f.phase=1;this.beam={f,t:0,hit:false};tone('sawtooth',880,t,0.4,0.06,null,1200);noise(t,0.35,0.1,'highpass',3000);}if(f.t>=0.95){this.idle(f);this.beam=null;}}
   else if(k==='tele'){if(f.t<0.25)f.alpha=1-f.t/0.25;else if(f.phase===0){f.phase=1;let nx=o.x+(o.x>f.x?28:-28);if(nx<16||nx>W-16)nx=o.x-(o.x>f.x?28:-28);f.x=clamp(nx,16,W-16);f.face=o.x>f.x?1:-1;tone('sine',1200,t,0.15,0.06,null,300);}
     else{f.alpha=Math.min(1,(f.t-0.25)/0.1);if(f.t>=0.38){f.alpha=1;f.st='punch';f.t=0;f.hitDone=false;this.whoosh();}}}
   else if(k==='triple'){[0.2,0.36,0.52].forEach((tt,i)=>{if(f.t>=tt&&f.phase===i){f.phase=i+1;this.projs.push({x:f.x+f.face*18,y:f.y+[-46,-28,-9][i],vx:f.face*170,owner:f,kind:'doc'});this.whoosh();}});if(f.t>=0.75)this.idle(f);}},
 idle(f){f.st='idle';f.t=0;f.active=false;f.alpha=1;},
 whoosh(){noise(AT(),0.08,0.06,'bandpass',2400);},
 throwBall(f,sup){const P=f.P;this.projs.push({x:f.x+f.face*(sup?26:20),y:f.y-(sup?38:40),vx:f.face*(sup?140:165),owner:f,kind:f===this.me?(sup?'super':'me'):P.ballK,low:P&&P.ballK==='form'});const t=AT();
   if(P&&P.ballK==='form')this.projs[this.projs.length-1].y=f.y-7;
   if(sup){tone('sawtooth',160,t,0.5,0.1,null,60);noise(t,0.5,0.2,'bandpass',800);this.shake=0.15;}else{noise(t,0.25,0.12,'bandpass',1400);tone('sawtooth',500,t,0.25,0.05,null,150);}},
 pr(p){return p.kind==='super'?11:(p.low?5:6);},
 boom(x,y){for(let i=0;i<46;i++){const a=RND()*Math.PI*2,v=40+RND()*160;this.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,t:0,life:0.5+RND()*0.5,c:pick([7,12,12,10,9]),grav:true});}this.shake=0.35;const t=AT();noise(t,0.8,0.5,'lowpass',600);tone('sine',90,t,0.6,0.9,null,30);},
 hurtbox(f){const c=f.st==='crouch'||(f.st==='bstun'&&f.lowB),h=c?34:54,w=f.look.bw+2;return [f.x-w/2,f.y-h,w,h];},
 atkbox(f){if(f.st==='whirl')return [f.x-32,f.y-36,64,24];const k=f.st==='jump'?'jkick':f.st;const b=ATK[k].box;const x0=f.face>0?f.x+b[0]:f.x-b[0]-b[2];return [x0,f.y+b[1],b[2],b[3]];},
 ov(a,b){return a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];},
 hit(a,d,A_,dir,x,y){const onG=d.y>=GYF-0.01,blk=onG&&d.back&&['back','crouch','idle','walk','bstun'].includes(d.st);const t=AT();d.active=false;d.jk=false;
   if(d.st==='chargeB'||d.st==='chargeF'){d.full=false;}
   if(blk){d.hp-=A_===ATK.sup?4:1;d.lowB=d.st==='crouch'||(d.st==='bstun'&&d.lowB);d.st='bstun';d.t=0;d.stun=0.16;d.vx=dir*A_.push*0.6;this.fx.push({x,y,t:0,c:12});tone('square',900,t,0.03,0.06);tone('sine',200,t,0.05,0.25);if(d.hp<=0)this.ko(a,d,dir,t);return;}
   const dmg=Math.round(A_.dmg*(a.dmul||1));d.hp-=dmg;d.st='hurt';d.t=0;d.stun=A_.stun;d.vx=dir*A_.push;d.alpha=1;if(!onG)d.vy=-120;this.stop=0.06;this.fx.push({x,y,t:0,c:10});
   tone('sine',140,t,0.14,0.8,null,50);noise(t,0.1,0.3,'lowpass',1300);if(A_.push>=150||dmg>=12)this.shake=Math.max(this.shake,0.2);
   a.combo++;a.comboT=0.9;if(a===this.me){this.landed++;this.score+=dmg*10+(a.combo>1?a.combo*20:0);this.exc=Math.min(1,this.exc+0.1);}else this.taken+=dmg;
   if(d.hp<=0)this.ko(a,d,dir,t);},
 ko(a,d,dir,t){d.hp=0;d.st='ko';d.t=0;d.vx=dir*150;d.vy=-230;d.y-=1;d.bounced=false;d.land=false;d.kdir=dir;this.koFlash=0.15;this.phase='ko';this.pt=0;this.beam=null;S.bell(0.3);noise(t,1.2,0.25,'bandpass',1100);this.exc=1;},
 // ---------- IA ----------
 brain(f,o,dt,P){const inp=f.ai;inp.punch=inp.kick=inp.ball=inp.fkick=inp.up=inp.sp=false;if(f.aiHold>0)f.aiHold-=dt;else inp.left=inp.right=inp.down=false;
   const dx=o.x-f.x,d=Math.abs(dx),tw=dx>0?'right':'left',aw=dx>0?'left':'right',oAir=o.y<GYF-4;
   if(f.st==='jump'&&d<34&&f.vy>-60&&!f.jk)inp.kick=true;
   f.aiT-=dt;if(f.aiT>0)return;f.aiT=P.think*(0.7+RND()*0.6);
   if(this.beam&&this.beam.f!==f){inp.down=true;f.aiHold=0.5;return;}
   const th=this.projs.find(p=>p.owner!==f&&Math.sign(p.vx)===Math.sign(f.x-p.x)&&Math.abs(p.x-f.x)<80);
   if(th){if(th.kind==='super'||RND()<0.5){inp.up=true;f.aiHold=0.3;inp[tw]=RND()<0.6;}else{inp[aw]=true;f.aiHold=0.5;}return;}
   if((['punch','kick','fkick','whirl','upper'].includes(o.st)||o.jk)&&d<55&&RND()<P.block){inp[aw]=true;f.aiHold=0.35;return;}
   if(oAir&&d<60&&P.up&&RND()<P.up){inp.sp=true;inp.spk='upper';return;}
   if(oAir&&d<48&&RND()<P.anti){inp.kick=true;return;}
   const r=RND(),sp=P.sp||0;
   if(sp&&r<sp&&d>40){const k=pick(P.spk);if(k==='stomp'&&(d>140||oAir))return;if(k==='tele'&&d<70)return;inp.sp=true;inp.spk=k;return;}
   const r2=RND();
   if(d>100){if(r2<P.ballP)inp.ball=true;else if(r2<P.ballP+P.fk)inp.fkick=true;else{inp[tw]=true;f.aiHold=0.3+RND()*0.4;}}
   else if(d>36){if(r2<P.fk)inp.fkick=true;else if(r2<P.fk+P.jump){inp.up=true;inp[tw]=true;f.aiHold=0.2;}else if(r2<P.fk+P.jump+P.ballP*0.5)inp.ball=true;else{inp[tw]=true;f.aiHold=0.2+RND()*0.3;}}
   else{if(r2<P.aggr){if(RND()<0.5)inp.punch=true;else inp.kick=true;}else if(r2<P.aggr+0.2){inp[aw]=true;f.aiHold=0.3;}else if(r2<P.aggr+0.3){inp.down=true;f.aiHold=0.3;}}},
 // ---------- ciclo ----------
 update(dt){this.exc=Math.max(0,this.exc-dt*0.25);if(this.crowd)this.crowd.gn.gain.setTargetAtTime(0.02+this.exc*0.08,AT(),0.2);this.shake=Math.max(0,this.shake-dt);
   this.fx=this.fx.filter(e=>(e.t+=dt)<0.25);this.parts=this.parts.filter(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.grav)p.vy+=260*dt;return p.t<p.life;});
   if(this.phase==='intro'){this.pt+=dt;if(this.pt>2.2){this.phase='fight';S.bell(0.2);}return;}
   if(this.phase==='ko'||this.phase==='time'){this.pt+=dt;const sdt=this.phase==='ko'&&this.pt<1.8?dt*0.28:dt;this.fup(this.me,{},this.foe,sdt);this.fup(this.foe,{},this.me,sdt);
     if(this.pt>(this.phase==='ko'?3.6:2.6)){const won=this.phase==='ko'?this.foe.hp<=0:(this.me.hp/this.me.max>=this.foe.hp/this.foe.max);if(!won)return finishLevel({fail:true});this.score+=this.me.hp*5+Math.round(this.timer)*10;this.ri++;if(this.ri>=FOES.length)return finishLevel({fail:false});this.startRound();}return;}
   if(this.stop>0){this.stop-=dt;return;}
   this.timer-=dt;if(this.timer<=0){this.timer=0;this.phase='time';this.pt=0;S.bell(0.25);return;}
   const P=FOES[this.ri];if(BOT){this.brain(this.me,this.foe,dt,{think:0.18,aggr:0.7,block:0.75,ballP:0.3,fk:0.15,jump:0.05,anti:0.7,sp:0});}
   const pin=BOT?this.me.ai:this.inp;this.brain(this.foe,this.me,dt,P);
   this.fup(this.me,pin,this.foe,dt);this.fup(this.foe,this.foe.ai,this.me,dt);
   for(const k of ['up','punch','kick'])this.inp[k]=false;
   for(const f of [this.me,this.foe])f.x=clamp(f.x,14,W-14);
   if(this.me.y>=GYF&&this.foe.y>=GYF&&Math.abs(this.me.x-this.foe.x)<20){const m=(this.me.x+this.foe.x)/2,s=this.me.x<this.foe.x?-1:1;this.me.x=clamp(m+s*10,14,W-14);this.foe.x=clamp(m-s*10,14,W-14);}
   for(const [a,d] of [[this.me,this.foe],[this.foe,this.me]]){const k=a.st==='jump'?'jkick':a.st;if(a.active&&!a.hitDone&&d.st!=='ko'&&this.phase==='fight'&&(ATK[k]||a.st==='whirl')){const ab=this.atkbox(a);if(this.ov(ab,this.hurtbox(d))){a.hitDone=true;let A_=ATK[k];if(a.st==='whirl'){a.hits++;A_=a.hits>=5?ATK.whirlEnd:ATK.whirl;}this.hit(a,d,A_,a.st==='whirl'?(d.x>a.x?1:-1):a.face,ab[0]+ab[2]/2,ab[1]+ab[3]/2);}}}
   if(this.beam){const b=this.beam,f=b.f,d=f===this.me?this.foe:this.me;b.t+=dt;const x0=f.face>0?f.x+14:0,x1=f.face>0?W:f.x-14,bb=[x0,f.y-50,x1-x0,9];if(!b.hit&&d.st!=='ko'&&this.ov(bb,this.hurtbox(d))){b.hit=true;this.hit(f,d,ATK.beam,f.face,d.x,f.y-46);}}
   // torbellino destruye proyectiles
   for(const f of [this.me,this.foe])if(f.st==='whirl'){const ab=this.atkbox(f);for(const p of this.projs)if(p.owner!==f&&this.ov([p.x-6,p.y-6,12,12],ab)){p.dead=true;this.fx.push({x:p.x,y:p.y,t:0,c:9});}}
   for(const p of this.projs){if(p.dead)continue;p.x+=p.vx*dt;const d=p.owner===this.me?this.foe:this.me,r=this.pr(p);
     if(this.phase==='fight'&&d.st!=='ko'&&this.ov([p.x-r,p.y-r,r*2,r*2],this.hurtbox(d))){p.dead=true;const A_=p.kind==='super'?ATK.sup:(p.low?ATK.low:ATK.ball);this.hit(p.owner,d,A_,Math.sign(p.vx),p.x,p.y);if(p.kind==='super')this.boom(p.x,p.y);}}
   for(const p of this.projs)for(const q of this.projs)if(p!==q&&p.owner!==q.owner&&!p.dead&&!q.dead&&Math.abs(p.x-q.x)<(this.pr(p)+this.pr(q))&&Math.abs(p.y-q.y)<(this.pr(p)+this.pr(q))){
     if(p.kind==='super'){q.dead=true;this.fx.push({x:q.x,y:q.y,t:0,c:7});}else if(q.kind==='super'){p.dead=true;this.fx.push({x:p.x,y:p.y,t:0,c:7});}else{p.dead=q.dead=true;this.fx.push({x:(p.x+q.x)/2,y:p.y,t:0,c:7});}noise(AT(),0.2,0.2,'bandpass',2000);}
   this.projs=this.projs.filter(p=>{if(!p.dead&&p.kind==='super'&&(p.x<-10||p.x>W+10))return false;return !p.dead&&p.x>-20&&p.x<W+20;});},
 key(c,down){const m={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down',KeyC:'ballHold',KeyL:'ballHold',KeyV:'fkHold',KeyI:'fkHold'}[c];if(m)this.inp[m]=down;
   if(down){const e={ArrowUp:'up',KeyW:'up',KeyZ:'punch',KeyJ:'punch',KeyX:'kick',KeyK:'kick',Space:'punch'}[c];if(e)this.inp[e]=true;}},
 button(){},
 pointer(type,x,y,id,ptype){if(ptype==='touch')TOUCHUI=true;if(!TOUCHUI)return;
   const zone=PAD.find(z=>x>=z.x-2&&x<z.x+z.w+2&&y>=z.y-4&&y<z.y+z.h+2),k=zone?zone.k:null;
   if(type==='down'){this.touches[id]=k;if(k&&!HOLDK.includes(k))this.inp[k]=true;}
   else if(type==='move'){if(!(id in this.touches))return;if(this.touches[id]!==k&&!['ballHold','fkHold'].includes(this.touches[id])){this.touches[id]=k;if(k==='up')this.inp.up=true;}}
   else if(type==='up')delete this.touches[id];
   const held=Object.values(this.touches);for(const h of HOLDK)this.inp[h]=held.includes(h);},
 result(){const gr=this.ri<FOES.length?'F':(this.taken<=30?'S':(this.taken<=80?'A':(this.taken<=150?'B':'C')));if(A.mus)A.mus.gain.value=0.55;
   return {score:this.score,grade:gr,lines:[["RIVALES DERROTADOS",Math.min(this.ri,3)+"/3"],["GOLPES CONECTADOS",this.landed],["PODERES SÚPER",this.supers],["DAÑO RECIBIDO",this.taken]]};},
 // ---------- dibujo ----------
 drawF(f,t){const L_=f.look,st=f.st,onG=f.y>=GYF-0.01;g.save();g.globalAlpha=f.alpha;g.translate(Math.round(f.x),Math.round(f.y));
   const spin=st==='whirl';let face=f.face;if(spin)face=Math.floor(f.t*16)%2?1:-1;g.scale(face,1);if(st==='ko'&&!f.land){g.translate(0,-20);g.rotate(-Math.min(1.45,f.t*2.2));g.translate(0,20);}
   const white=(st==='hurt'&&f.t<0.07)||(f.full&&st.startsWith('charge')&&Math.floor(t*16)%2),C=c=>white?7:c;
   if(st==='ko'&&f.land){R(-26,-8,40,8,C(L_.top));R(-30,-9,10,10,C(L_.skin));if(!L_.bald)R(-30,-9,10,3,C(L_.hair));R(12,-6,18,6,C(L_.pants));disc(-16,-12,4,C(L_.glove));g.restore();return;}
   const cr=st==='crouch'||(st==='bstun'&&f.lowB)||st==='chargeB'||st==='chargeF',by=cr?(st.startsWith('charge')?6:14):0,lean=st==='hurt'||st==='ko'?-3:0,bw=L_.bw;
   // piernas
   const kickOn=(st==='kick'&&f.t>=ATK.kick.s*0.6)||(st==='sp'&&f.spk==='stomp'&&f.t<0.4);
   if(spin){R(-4,-20,8,20,C(L_.pants));R(0,-30,30,7,C(L_.pants));R(28,-32,5,10,C(0));R(-26,-28,24,6,C(L_.pants));}
   else if(!onG||st==='fkick'){if(st==='fkick'||f.jk){R(-5,-22,7,12,C(L_.pants));R(0,-24,26,7,C(L_.pants));R(24,-26,5,10,C(0));}else{R(-6,-20,6,12,C(L_.pants));R(1,-18,6,10,C(L_.pants));}}
   else if(cr){R(-9,-12,8,12,C(L_.pants));R(1,-12,9,12,C(L_.pants));R(-10,-2,10,2,C(0));R(1,-2,10,2,C(0));}
   else if(kickOn){R(-7,-20,6,20,C(L_.pants));R(-8,-2,8,2,C(0));if(st==='sp'){R(2,-34,8,16,C(L_.pants));R(1,-36,10,4,C(0));}else{R(2,-33,26,7,C(L_.pants));R(26,-35,5,10,C(0));}}
   else{const k=(st==='walk'||st==='back')?Math.round(Math.sin(f.walkT*14)*3):0;R(-7+k,-20,6,20,C(L_.pants));R(1-k,-20,6,20,C(L_.pants));R(-8+k,-2,8,2,C(0));R(0-k,-2,8,2,C(0));}
   // torso
   const ty=-42+by;R(-bw/2+lean,ty,bw,22,C(L_.top));R(-bw/2+lean,ty,2,22,C(L_.skin));R(bw/2-2+lean,ty,2,8,C(L_.skin));
   if(L_.kind==='samir'){R(-3+lean,ty,7,10,C(7));R(0+lean,ty+1,2,10,C(8));}
   if(L_.kind==='jl'){R(-2+lean,ty,5,4,C(7));}
   if(L_.kind==='andres'){R(2+lean,ty+2,1,10,C(10));R(1+lean,ty+11,4,5,C(7));}
   if(L_.kind==='me')R(-bw/2+lean,ty+18,bw,4,C(8));
   // cabeza
   const hw=L_.kind==='andres'?14:12,hx=-hw/2+lean*1.5,hy=-54+by;
   R(hx,hy,hw,12,C(L_.skin));
   if(L_.bald){R(hx+2,hy+1,3,1,C("#FFFFFF"));}else{R(hx,hy,hw,3,C(L_.hair));R(hx,hy,4,8,C(L_.hair));}
   if(L_.beard){R(hx+3,hy+7,hw-3,5,C(L_.hair));R(hx,hy+4,3,6,C(L_.hair));R(hx+7,hy+9,3,1,C(L_.skin));}
   R(hx+hw-4,hy+5,2,2,C(0));if(!L_.beard)R(hx+hw-5,hy+9,4,1,C(st==='hurt'?8:0));
   if(L_.glasses){const gf=st==='sp'&&f.spk==='beam'&&f.t<0.45&&Math.floor(t*14)%2;BOXL(hx+hw-6,hy+4,5,4,C(0));R(hx+hw-5,hy+5,3,2,gf?7:"#9ED8FF");R(hx+3,hy+5,hw-9,1,C(0));}
   if(L_.kind==='me')R(hx+1,hy-1,10,2,C(L_.hair));
   // brazos
   const G=bw>=20?5:4;
   if(st==='punch'){const out=f.t>=ATK.punch.s*0.5&&f.t<ATK.punch.s+ATK.punch.a+0.05;if(out){R(4,-47+by,17,4,C(L_.skin));disc(23,-45+by,G+1,C(L_.glove));disc(4,ty+8,G,C(L_.glove));}else{disc(10,ty+2,G,C(L_.glove));disc(4,ty+8,G,C(L_.glove));}}
   else if(st==='upper'){R(6,ty-16,4,18,C(L_.skin));disc(8,ty-18,G+1,C(L_.glove));disc(2,ty+8,G,C(L_.glove));}
   else if(st==='ball'||(st==='sp'&&(f.spk==='beam'||f.spk==='triple'))){R(4,ty+3,12,4,C(L_.skin));disc(16,ty+3,G,C(L_.glove));disc(15,ty+9,G,C(L_.glove));if(st==='ball'&&f.t<0.22){const r=(f.sup?5:2)+f.t*(f.sup?45:25);disc(22,ty+6,r,f===this.me?12:10);disc(22,ty+6,r*0.5,7);}}
   else if(st==='chargeB'){const r=3+Math.min(1,f.t/CHG)*7+Math.sin(t*30);disc(12,ty+6,G,C(L_.glove));disc(12,ty+12,G,C(L_.glove));disc(14,ty+9,r,12);disc(14,ty+9,r*0.55,7);}
   else if(st==='chargeF'){disc(-6,ty+2,G,C(L_.glove));disc(8,ty+2,G,C(L_.glove));}
   else if(st==='back'&&this.phase==='fight'||st==='bstun'){disc(9,ty+2,G,C(L_.glove));disc(9,ty+10,G,C(L_.glove));R(4,ty+2,4,10,C(L_.skin));}
   else if(st==='hurt'||st==='ko'){disc(-4,ty+2,G,C(L_.glove));disc(-9,ty+6,G,C(L_.glove));}
   else if(st==='fkick'||f.jk||spin){disc(-8,ty+2,G,C(L_.glove));disc(6,ty,G,C(L_.glove));}
   else{const b=st==='idle'?Math.round(Math.sin(t*6)):0;R(4,ty+5,6,3,C(L_.skin));disc(11,ty+1+b,G,C(L_.glove));disc(5,ty+6-b,G,C(L_.glove));}
   g.restore();
   if(st==='chargeF'||st==='chargeB'){const k=Math.min(1,f.t/CHG),r=16+k*10+Math.sin(t*20)*2;g.strokeStyle=col(st==='chargeB'?12:9);g.globalAlpha=0.5+k*0.5;g.beginPath();g.ellipse(f.x,f.y-28,r*0.7,r,0,0,7);g.stroke();g.globalAlpha=1;if(f.full)TC("¡LISTO!",f.y-80,7,1,0,clamp(f.x,24,W-24));}
   if(spin){g.globalAlpha=0.6;for(let k=0;k<3;k++){g.strokeStyle=col([9,10,7][k]);g.beginPath();g.ellipse(f.x,f.y-28+k*4,30-k*4,6,0,t*20+k,t*20+k+4);g.stroke();}g.globalAlpha=1;}
   if(f.shout){f.shout.k+=1/60;if(f.shout.k<0.8)TC(f.shout.t,f.y-72-f.shout.k*8,f===this.me?12:8,1,0,clamp(f.x,4+TW(f.shout.t)/2,W-4-TW(f.shout.t)/2));}},
 drawBall(p,t){const x=Math.round(p.x),y=Math.round(p.y);
   if(p.kind==='me'){for(let k=1;k<4;k++)disc(x-Math.sign(p.vx)*k*5,y,5-k,k%2?12:7);disc(x,y,6,12);disc(x,y,4,7);disc(x+Math.cos(t*20)*2,y+Math.sin(t*20)*2,2,12);}
   else if(p.kind==='super'){for(let k=1;k<6;k++)disc(x-Math.sign(p.vx)*k*6,y+Math.sin(t*30+k)*2,10-k*1.5,k%2?12:7);disc(x,y,12,1);disc(x,y,11,12);disc(x,y,7,7);for(let k=0;k<6;k++){const a=t*12+k;PX(x+Math.cos(a)*14,y+Math.sin(a)*14,k%2?10:7);}}
   else if(p.kind==='form'){R(x-7,y-5,14,10,7);BOXL(x-7,y-5,14,10,5);for(let k=0;k<2;k++){R(x-5,y-3+k*4,2,2,11);R(x-2,y-2+k*4,7,1,5);}}
   else if(p.kind==='wave'){for(let k=0;k<4;k++){R(x-k*6,y+2-k*2,4,6+k*2,k%2?9:10);}R(x-3,y-4,6,10,7);}
   else if(p.kind==='kpi'){R(x-8,y-7,16,13,7);BOXL(x-8,y-7,16,13,1);R(x-6,y+1,3,3,12);R(x-2,y-1,3,5,12);R(x+2,y-4,3,8,11);LN(x-6,y-1,x+5,y-6,8);}
   else if(p.kind==='doc'){R(x-5,y-7,11,14,7);BOXL(x-5,y-7,11,14,5);for(let k=0;k<4;k++)R(x-3,y-4+k*3,7,1,5);R(x-3,y+4,4,2,8);}
   else{disc(x,y,6,0);disc(x,y,5,7);}},

 stage(t){R(0,0,W,H,"#0C1424");R(0,13,W,26,"#101A2E");
   // bandejas de fibra óptica en el techo, con pulsos de luz
   R(0,47,W,3,"#2A3450");const fc=["#FFEC27","#29ADFF","#FF77A8","#00E436"];fc.forEach((c,i)=>{const y=50+i*2;R(0,y,W,1,c);for(let k=0;k<3;k++){const x=((t*(90+i*25)+k*97+i*40)%(W+20))-10;R(x,y,5,1,7);}});
   // racks de servidores
   for(let i=0;i<9;i++){const x=4+i*28;if(i===4)continue;R(x,60,24,64,"#1B2438");R(x+1,61,22,62,"#222E48");for(let u=0;u<10;u++){const y=63+u*6;R(x+3,y,18,4,"#141C30");const on=Math.sin(t*(3+(i*7+u)%5)+i*3+u*1.7)>0.2;PX(x+5,y+1,on?((i+u)%3?11:12):"#2A3A2A");PX(x+7,y+1,((i*3+u)%4===0&&Math.floor(t*6+u)%2)?9:"#2A2A2A");R(x+11,y+1,8,1,"#2A3450");}
     if(i%2===0){LN(x+20,61,x+20,57,fc[i%4]);}}
   // pantalla NOC al centro
   R(116,58,28,26,"#0B1020");BOXL(116,58,28,26,6);T("NOC",121,60,11);for(let k=0;k<5;k++){const a=t+k*1.3;PX(122+((k*9)%18),70+((k*5)%8),Math.sin(a*4)>0?11:12);}LN(120,80,124,75,11);LN(124,75,130,77,11);LN(130,77,140,69,11);
   R(118,84,24,36,"#1B2438");R(120,88,20,12,"#0B1020");R(122,90,16,8,12);R(128,100,4,6,5);R(122,106,16,2,5);
   R(34,64,42,11,"#0B1020");BOXL(34,64,42,11,6);T("SALA 1",37,66,11);R(176,64,66,11,"#0B1020");BOXL(176,64,66,11,6);T("DATACENTER",179,66,12);
   // piso técnico elevado
   R(0,GYF,W,H-GYF,"#6A7488");R(0,GYF,W,2,"#9AA4B8");for(let x=-60;x<W+60;x+=24)LN(x,GYF+2,x+(x-128)*0.35,H,"#5A6478");R(0,GYF+10,W,1,"#5A6478");
   for(let x=10;x<W;x+=48){for(let k=0;k<3;k++)R(x+k*4,GYF+4,2,1,"#4A5468");}},
 draw(t){g.save();if(this.shake>0&&!REDUCED)g.translate(Math.round(Math.sin(t*70)*2),Math.round(Math.cos(t*55)*1));
   this.stage(t);
   for(const f of [this.me,this.foe]){g.globalAlpha=0.3*f.alpha;R(f.x-12,GYF+1,24,3,0);g.globalAlpha=1;}
   this.drawF(this.foe,t);this.drawF(this.me,t);for(const p of this.projs)this.drawBall(p,t);
   if(this.beam&&this.beam.t<0.35){const f=this.beam.f,x0=f.face>0?f.x+14:0,x1=f.face>0?W:f.x-14,y=f.y-46,k=Math.sin(this.beam.t/0.35*Math.PI);R(x0,y-3*k-1,x1-x0,6*k+2,"rgba(255,0,77,0.5)");R(x0,y-1,x1-x0,2,7);}
   for(const p of this.parts){g.globalAlpha=1-p.t/p.life;R(p.x-1,p.y-1,2,2,p.c);}g.globalAlpha=1;
   for(const e of this.fx){const r=2+e.t*40;for(let k=0;k<8;k++){const a=k*Math.PI/4;PX(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,e.c);PX(e.x+Math.cos(a)*r*0.6,e.y+Math.sin(a)*r*0.6,7);}}
   g.restore();
   if(this.koFlash>0){this.koFlash-=1/60;R(0,0,W,H,`rgba(255,255,255,${Math.max(0,this.koFlash*5)})`);}
   R(0,13,W,34,"rgba(11,16,32,0.92)");R(0,46,W,1,12);const me=this.me,fo=this.foe,nm=FOES[this.ri].n;
   T("ÁLVARO",4,16,7);R(4,25,106,8,0);R(5,26,104,6,8);R(5,26,Math.round(104*me.hp/me.max),6,10);
   T(nm,W-4-TW(nm),16,7);R(W-110,25,106,8,0);R(W-109,26,104,6,8);const fw=Math.round(104*Math.max(0,fo.hp)/fo.max);R(W-5-fw,26,fw,6,10);
   TC(String(Math.ceil(this.timer)).padStart(2,'0'),16,this.timer<10?8:10,2,0);
   T("BOLA",4,38,me.cdB<=0?12:5);T("VOLAR",34,38,me.cdF<=0?12:5);TC("RIVAL "+(this.ri+1)+"/3",38,6);
   for(const f of [me,fo])if(f.combo>1&&f.comboT>0){const s=f.combo+" GOLPES";T(s,f===me?4:W-4-TW(s),48,f===me?10:8);}
   if(this.phase==='intro'){R(30,58,196,28,0);BOXL(30,58,196,28,10);if(this.pt<1.4){TC("RIVAL "+(this.ri+1)+"/3",62,6);TC(nm,73,10);}else TC("¡A PELEAR!",65,10,2);}
   if(this.phase==='ko'&&this.pt>0.3&&(this.pt>1.8||Math.floor(this.pt*6)%2))TC("K.O.",56,8,3,0);
   if(this.phase==='time')TC("¡TIEMPO!",60,10,2,0);
   if(TOUCHUI){g.globalAlpha=0.55;const held=Object.values(this.touches);for(const z of PAD){const on=held.includes(z.k)||this.inp[z.k];R(z.x,z.y,z.w,z.h,on?7:0);BOXL(z.x,z.y,z.w,z.h,6);TC(z.l,z.y+Math.floor((z.h-7)/2),on?0:7,1,null,z.x+z.w/2);}
     if(me.cdB>0)R(170,140,Math.round(42*(1-me.cdB/2)),2,12);if(me.cdF>0)R(214,140,Math.round(40*(1-me.cdF/2)),2,12);g.globalAlpha=1;}
   hud(this.name+" · ROUND "+Math.min(this.ri+1,3),String(this.score).padStart(5,'0'));}
};

// ======================= NIVEL 8: DEATHMATCH (arcade) =======================
ATK.jkick.over=true;ATK.fkick.over=true;ATK.fkick.dmg=15;ATK.fkick.box=[2,-30,32,20];ATK.beam.dmg=10;
const DM_P2={s:0.06,a:0.09,r:0.14,dmg:6,box:[8,-44,24,12],push:50,stun:0.3},DM_K1={s:0.09,a:0.08,r:0.2,dmg:5,box:[6,-19,20,9],push:40,stun:0.28},DM_K2={s:0.08,a:0.09,r:0.16,dmg:6,box:[6,-34,26,9],push:50,stun:0.3},DM_K3={s:0.1,a:0.1,r:0.24,dmg:9,box:[4,-52,30,13],push:150,stun:0.45,knock:true,fin:true};
const COMBO_N=[[9,'¡SENTENCIA FIRME!'],[7,'¡IMPARABLE!'],[5,'¡DEMOLEDOR!'],[3,'¡CONTUNDENTE!']];
const FIN_SH={seba:'¡YO PUEDO!',fran:'¡COMMIT!',alvaro:'¡ALEGATO!',samir:'¡MALETÍN!',andres:'¡CABEZAZO!',jl:'¡TOMÁ!',jean:'¡TECLAZO!',coni:'¡LAPTOP!',brandan:'¡BILLETERAZO!'};
const DM_PUNCH={s:0.05,a:0.09,r:0.13,dmg:5,box:[8,-44,21,12],push:40,stun:0.26},DM_JK={dmg:8,box:[2,-20,24,22],push:85,stun:0.32,over:true};
Object.assign(ATK,{cpunch:{s:0.04,a:0.08,r:0.12,dmg:4,box:[8,-26,22,8],push:20,stun:0.26,low:true},cp3:{s:0.05,a:0.09,r:0.18,dmg:6,box:[8,-26,26,8],push:110,stun:0.34,low:true},csweep:{s:0.12,a:0.1,r:0.28,dmg:9,box:[4,-9,32,8],push:40,stun:0.6,low:true,knock:true},p3:{s:0.06,a:0.1,r:0.22,dmg:8,box:[6,-60,22,22],push:150,stun:0.45,knock:true,fin:true},whip:{s:0.11,a:0.18,r:0.18,dmg:9,box:[10,-42,52,9],push:-170,stun:0.5},
 cnt:{dmg:12,push:170,stun:0.5},bigb:{dmg:18,push:180,stun:0.55},thick:{dmg:18,push:150,stun:0.5},wave2:{dmg:8,push:60,stun:0.8}});
const DMC=[
 {id:'alvaro',n:'ÁLVARO',role:'LEGAL',spd:79,hp:98,dmul:0.95,s:['objecion','patada'],sn:['BOLA OBJECIÓN','PATADA VOLADORA'],win:"OBJECIÓN ACOGIDA. SIGUIENTE.",
  look:{skin:'#EAC4A6',hair:'#141214',top:'#26282F',inner:'#F2F2F2',pants:'#1C1E26',glove:8,bw:16,kind:'me',suit:true,quiff:true,glasses:true,glassC:'#1A1A1A',lens:'clear',h:-3}},
 {id:'samir',n:'SAMIR',role:'JEFE LEGAL',spd:78,hp:108,dmul:1.15,s:['objetado','revision'],sn:['OBJETADO','REVISIÓN'],win:"REVISADO Y APROBADO.",
  look:{skin:'#E2B896',hair:'#1C1612',beardC:'#1C1612',top:'#262650',shirt:'#DCDCEE',pants:'#22224A',glove:2,bw:18,kind:'samir',bald:true,beard:true,suit:true,tie:'#1A1A2E',h:-1}},
 {id:'andres',n:'ANDRÉS',role:'RECURSOS HUMANOS',spd:52,hp:108,dmul:1.08,s:['evaluacion','capacitacion'],sn:['EVALUACIÓN','CAPACITACIÓN'],win:"NOS VEMOS EN LA EVALUACIÓN.",
  look:{skin:'#D4A07C',hair:'#1C1612',top:'#141416',txt3:'BOSS',noLanyard:true,pants:'#24242C',glove:11,bw:21,kind:'andres',fade:true,h:0}},
 {id:'jl',n:'JOSÉ LUIS',role:'GERENTE GENERAL',spd:78,hp:120,dmul:1.1,s:['kpi','vision'],sn:['KPI','VISIÓN'],win:"¡UN GOLAZO, CHE! BÁRBARO.",
  look:{skin:'#A06A42',hair:'#262220',top:'#1C1C20',pants:'#2E3440',glove:'#29ADFF',bw:17,kind:'jl',glasses:true,glassC:'#3A2212',messy:true,smile:true,casual:true,h:0}},
 {id:'jean',n:'JEAN',role:'TI',spd:68,hp:110,dmul:1.06,s:['ticket','cable'],sn:['TICKET','CABLE DE RED'],win:"¿PROBASTE APAGAR Y PRENDER?",
  look:{skin:'#B98459',hair:'#15110E',top:'#17171C',pants:'#3A3C44',shoes:'#EDEDED',glove:'#E6E6EE',bw:22,kind:'jean',h:-5,fade:true,zip:true,print:true,tee:'#2A1A2E',chain:true,baggy:true,hood:true,cord:'#17171C',pocket:'#101014'}},
 {id:'coni',n:'CONI',role:'AUTOMATIZACIÓN',spd:88,hp:115,dmul:1.08,s:['bot','cartas'],sn:['BOT','CARTAS'],win:"ESTO LO AUTOMATIZO EN 5 MIN.",
  look:{skin:'#F6D8C4',hair:'#3A2420',top:'#1C1C22',inner:'#7A1A2E',pants:'#26262E',glove:'#D04A6A',bw:15,kind:'coni',glasses:true,glassC:'#D8A878',lips:'#8A2A3A',bangs:true,longHair:true,hairLen:18,h:3}},
 {id:'seba',n:'SEBASTIÁN',role:'PROVEEDORES',spd:77,hp:109,dmul:1.05,s:['billetera','riff'],sn:['BILLETERA VACÍA','RIFF METALERO'],win:"NO HAY PLATA. PÁGUENME.",
  look:{skin:'#D6AE8A',hair:'#2A1E18',top:'#141418',slime:true,pants:'#262C3A',glove:'#5BD12A',shoes:'#111111',bw:20,kind:'seba',ponytail:true,stubble:'rgba(40,28,20,0.55)',glasses:true,glassC:'#111111',lens:'clear',h:0}},
 {id:'brandan',n:'JOSÉ BRANDAN',role:'COBRANZA',spd:76,hp:110,dmul:1.06,s:['balance','auditoria'],sn:['BALANCE','AUDITORÍA'],win:"¡QUÉ LINDO BALANCE, CHE!",
  look:{skin:'#C8946A',hair:'#1A1410',top:'#F2F4F8',stripes:'#6CACE4',pants:'#1E2230',glove:'#E8C040',bw:18,kind:'brandan',quiff:true,stubble:'rgba(36,26,20,0.55)',smile:true,h:0}},
 {id:'fran',n:'FRANCISCO',role:'PROGRAMADOR',spd:84,hp:115,dmul:1.1,s:['prompt','aluc'],sn:['PROMPT','ALUCINACIÓN'],win:"TODO ES MENTE. Y CÓDIGO.",
  look:{skin:'#E8BE9C',hair:'#5E4630',beardC:'#4A3624',sym:'#B99CFF',top:'#3A3F4A',pants:'#3E5C8A',shoes:'#EDEDED',glove:'#8A5CFF',bw:19,kind:'fran',beard:true,hood:true,cord:'#B99CFF',pocket:'#2C3038',h:0}}];
// [normal, cargado]
function LIMB(x1,y1,x2,y2,w,col){const dx=x2-x1,dy=y2-y1,n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));for(let i=0;i<=n;i++)R(Math.round(x1+dx*i/n-w/2),Math.round(y1+dy*i/n-w/2),w,w,col);}
const MVS={objecion:["¡OBJECIÓN!","¡SÚPER OBJECIÓN!"],patada:["¡HAAA!","¡TORBELLINO!"],objetado:["¡OBJETADO!","¡TRES CLÁUSULAS!"],revision:["¡REVISIÓN!","¡REVISIÓN TOTAL!"],
 evaluacion:["¡EVALUACIÓN!","¡EVALUACIÓN 360!"],capacitacion:["¡CAPACITACIÓN!","¡CAPACITACIÓN DOBLE!"],kpi:["¡TOMÁ ESTE KPI!","¡KPI GIGANTE, CHE!"],vision:["¡MIRÁ ESTO!","¡VISIÓN 2030, VIEJO!"],
 billetera:["¡NO HAY PLATA!","¡PRESUPUESTO CERO!"],riff:["¡RIFF!","¡SOLO INFINITO!"],ticket:["¡TICKET!","¡REINICIO!"],cable:["¡CABLE!","¡FIREWALL 2.0!"],bot:["¡BOT!","¡TRES BOTS!"],cartas:["¡CARTA!","¡CARTAS CARGADAS!"],balance:["¡BALANCE!","¡LLUEVE PLATA, CHE!"],auditoria:["¡AUDITORÍA!","¡EMBARGO!"],prompt:["¡PROMPT!","¡PROMPT LARGO!"],aluc:["¡ALUCINACIÓN!","¡EL TODO ES MENTE!"]};
const MVAI={billetera:[70,999],riff:[28,120],objecion:[70,999],patada:[40,130],objetado:[70,999],revision:[80,999],evaluacion:[60,999],capacitacion:[40,150],kpi:[70,999],vision:[70,999],ticket:[70,999],cable:[20,56],bot:[70,999],cartas:[60,999],balance:[70,999],auditoria:[0,0],prompt:[70,999],aluc:[60,999]};
const PAD8=[{k:'left',x:2,y:110,w:26,h:32,l:'←'},{k:'up',x:30,y:110,w:26,h:15,l:'↑'},{k:'down',x:30,y:127,w:26,h:15,l:'↓'},{k:'right',x:58,y:110,w:26,h:32,l:'→'},
 {k:'punch',x:170,y:110,w:42,h:15,l:'GOLPE'},{k:'kick',x:214,y:110,w:40,h:15,l:'PATADA'},{k:'s0Hold',x:170,y:127,w:42,h:15,l:'ESP. 1'},{k:'s1Hold',x:214,y:127,w:40,h:15,l:'ESP. 2'}];
const HOLD8=['left','right','down','s0Hold','s1Hold'];
const GRAB_R=21,GRABBABLE=['idle','walk','back','crouch','charge','counter','land'],SUPG={hit:7,hitTaken:5,blk:2,blkTaken:2};
const SUPERS={alvaro:{n:'RÁFAGA DE OBJECIONES',d:1.15,at:[0.08,0.18,0.28,0.38,0.48,0.75],go(L,f,o,i){if(i<5)L.proj(f,{kind:'me',dmg:5,vx:f.face*230,y:f.y-40+[-8,3,-5,5,-1][i]});else L.proj(f,{kind:'super',r:11,dmg:16,push:190,stun:0.6,vx:f.face*175,pierce:true,boom:true,y:f.y-38});}},
 samir:{n:'DEMANDA COLECTIVA',d:1.2,at:[0.1,0.17,0.24,0.31,0.38,0.45,0.52,0.59,0.66,0.73],go(L,f,o,i){L.proj(f,{kind:'doc',x:clamp(o.x+(i-4.5)*6,10,W-10),y:44,vx:0,vy:180,dmg:5,r:6,stun:0.25,over:true});}},
 andres:{n:'REESTRUCTURACIÓN',d:1.0,at:[0.1,0.4,0.7],go(L,f,o,i){if(i===0)FX.boxes(o.x);L.proj(f,{kind:'wave',x:f.x+f.face*16,y:f.y-6,vx:f.face*200,low:true,dmg:9,r:5,stun:0.5});L.shake=0.25;tone('sine',70,AT(),0.4,0.9,null,35);}},
 jl:{n:'VISIÓN 2050',d:1.3,at:[0.3],go(L,f,o,i){L.beam={f,t:0,hit:false,thick:true,multi:5,tick:0};tone('sawtooth',700,AT(),1.0,0.08,null,1500);}},
 jean:{n:'FORMATEO TOTAL',d:0.8,at:[0.3],go(L,f,o,i){L.blueFx=0;FX.overlay('bsod',1.6);L.hit(f,o,{dmg:14,push:0,stun:2.0,unblock:true},f.face,o.x,o.y-30,{freeze:2.0});tone('square',200,AT(),0.6,0.1,null,60);}},
 coni:{n:'EJÉRCITO DE BOTS',d:1.0,at:[0.1,0.22,0.34,0.46,0.58,0.7],go(L,f,o,i){if(i===0)FX.overlay('code',1.6);L.proj(f,{kind:'bot',y:f.y-8,vx:f.face*115,low:true,dmg:6,r:6});}},
 seba:{n:'GAME OVER',d:1.3,at:[0.15,0.45,0.75],go(L,f,o,i){if(i===0)FX.overlay('arcade',2.0);L.proj(f,{kind:'skull',dmg:9,r:12,vx:f.face*175,y:f.y-[48,30,40][i],push:120,stun:0.45});tone('sawtooth',[82,110,73][i],AT(),0.4,0.1,null,null,{dist:true,lp:1800});tone('square',[330,392,262][i],AT(),0.3,0.05);}},
 fran:{n:'MULTI-AGENTE',d:1.3,at:[0.1,0.17,0.24,0.31,0.38,0.45,0.52,0.59],go(L,f,o,i){L.proj(f,{kind:'agent',x:f.x-f.face*12,y:f.y-[50,30,16,42,22,36,12,46][i],vx:f.face*230,dmg:4,r:5,stun:0.2});}},
 brandan:{n:'DEFAULT',d:1.1,at:[0.1,0.16,0.22,0.28,0.34,0.4,0.46,0.52,0.58,0.64,0.7,0.76],go(L,f,o,i){if(i===0)FX.overlay('crash',1.6);L.proj(f,{kind:i%3?'bill':'coin',x:clamp(o.x+((i*37)%60)-30,10,W-10),y:40,vx:0,vy:170,dmg:4,r:5,stun:0.25,over:true});}}};
const STA={max:100,blockBase:10,blockMul:1.6,dash:22,regen:26,regenGuard:7,delay:0.6,breakStun:1.1,recover:35,fwd:290,bwd:240,dashT:0.17,inv:0.13};
function dmFighter(C,x,face,ai){return {C,look:C.look,x,y:GYF,vx:0,vy:0,face,st:'idle',t:0,hp:C.hp,max:C.hp,spd:C.spd,dmul:C.dmul,cd:[0,0],sta:STA.max,staT:0,broken:false,inv:0,walkT:0,active:false,hitDone:false,combo:0,comboT:0,cstep:0,ai:{},aiT:0.8,aiHold:0,isAI:ai,shout:null,alpha:1};}
const L8={id:'deathmatch',name:'DEATHMATCH',sub:'Modo arcade · 8 luchadores',
 howto:["ZZZ: 3 GOLPES · XXX: 3 PATADAS","ZZX: BARRIDA · ZZ + C/V: CANCELA","C/V ESPECIALES (MANTÉN: CARGADOS)","→+Z PEGADO: AGARRE · C+V: ¡SÚPER!","ATRÁS CUBRE · ↓ BAJOS · DOBLE →: DASH","3 ROUNDS · ¡ACÁBALO!: F + FLECHAS"],
 init(){this.ph='select';this.sel=0;this.pt=0;this.score=0;this.taken=0;this.landed=0;this.cont=0;this.wins=0;this.inp={};this.touches={};this.fx=[];this.parts=[];this.projs=[];this.walls=[];this.stop=0;this.shake=0;this.koFlash=0;
   if(A.mus)A.mus.gain.value=0.45;this.selMusic();},
 selMusic(){musicStart(128,(s,t,s16)=>{const bar=Math.floor(s/16)%4,root=[45,43,41,43][bar];if(s%4===0)kick(t,0.4);if(s%8===4)snare(t,0.18);if(s%2===1)hat(t,false,0.04);
   tone('pulse',hz(root+12+[0,7,12,7,3,7,12,15][s%8]),t,s16*0.8,0.04,A.mus);if(s%16===0)tone('triangle',hz(root),t,s16*15,0.12,A.mus);});},
 fightMusic(){musicStart(150,(s,t,s16)=>{const bar=Math.floor(s/16)%4,root=[40,40,43,38][bar];if(s%2===0)[0,7].forEach(k=>tone('sawtooth',hz(root+k),t,s16*1.6,0.045,A.mus,null,{lp:1600,dist:true}));
   if(s%8===0||s%16===10)kick(t,0.6);if(s%8===4)snare(t,0.3);if(s%2===0)hat(t,false,0.05);if(s%16===12)tone('square',hz(root+19),t,s16*3,0.03,A.mus,null,{lp:2000});});},
 pick(i){this.me0=DMC[i];const rest=DMC.filter(c=>c!==this.me0);this.ladder=shuffle(rest.slice());this.stage=0;this.say0=null;S.win();this.startVS();},
 startVS(){this.ph='challenger';this.pt=0;musicStop();const t=AT();for(let k=0;k<4;k++){tone('square',880,t+k*0.3,0.14,0.06);tone('square',660,t+k*0.3+0.15,0.14,0.06);}},
 startFight(){this.setupCrowd();this.rw=[0,0];this.round=1;this.meter=[0,0];this.ph='fight';this.stageK=this.stage%2?'oficina':'dc';this.fightMusic();
   const k=this.stage/5;this.P={think:lerp(0.46,0.26,k),aggr:lerp(0.45,0.62,k),block:lerp(0.2,0.5,k),sp:lerp(0.18,0.32,k),chg:lerp(0.1,0.35,k),jump:0.08,anti:lerp(0.15,0.5,k),read:lerp(0.55,0.85,k),grab:lerp(0.2,0.45,k),tech:lerp(0.15,0.4,k),supP:lerp(0.3,0.6,k),react:lerp(0.34,0.2,k),pun:lerp(0.45,0.8,k)};this.startRound();},
 startRound(){this.beam=null;const C=this.ladder[this.stage];this.me=dmFighter(this.me0,70,1,false);this.foe=dmFighter(C,186,-1,true);this.me.sup=this.meter[0];this.foe.sup=this.meter[1];this.superFx=null;this.blueFx=0;this.projs=[];this.walls=[];this.decoys=[];this.parts=[];this.fx=[];this.puddles=[];this.fat=null;this.fatEnd=null;this.fin=null;this.beam=null;this.whip=null;
   this.sub='intro';this.pt=0;this.timer=60;this.inp={};this.touches={};S.bell(0.25);},
 say(f,txt){f.shout={t:txt,k:0};},
 // ---------- luchador ----------
 fup(f,inp,o,dt){f.t+=dt;f.cd[0]=Math.max(0,f.cd[0]-dt);f.cd[1]=Math.max(0,f.cd[1]-dt);if(f.comboT>0){f.comboT-=dt;if(f.comboT<=0)f.combo=0;}
   const onG=f.y>=GYF-0.01;f.back=(o.x>f.x?inp.left:inp.right);f.active=false;
   {const airOK=['jump','fkick','hurt','bstun','frozen','ko','thrown','grabbed'];if(f.y<GYF-0.01&&!airOK.includes(f.st)){f.vy=(f.vy||0)+GRV*dt;f.y=Math.min(GYF,f.y+f.vy*dt);if(f.y>=GYF){f.y=GYF;f.vy=0;}}}
   if(f.st==='win'||f.st==='lose'||f.st==='intro')return;
   if(f.inv>0)f.inv-=dt;if(inp.punch)f.bufP=0.2;else if(f.bufP>0)f.bufP-=dt;if(inp.kick)f.bufK=0.2;else if(f.bufK>0)f.bufK-=dt;f.e0=!!inp.s0Hold&&!f.h0;f.h0=!!inp.s0Hold;f.e1=!!inp.s1Hold&&!f.h1;f.h1=!!inp.s1Hold;if(f.e0)f.b0=0.2;else if(f.b0>0)f.b0-=dt;if(f.e1)f.b1=0.2;else if(f.b1>0)f.b1-=dt;if(f.staT>0)f.staT-=dt;else if(f.st!=='ko'){const guard=f.st==='back'||f.st==='bstun';f.sta=Math.min(STA.max,f.sta+(guard?STA.regenGuard:STA.regen)*dt);}if(f.broken&&f.sta>=STA.recover){f.broken=false;}
   const air=()=>{f.x+=f.vx*dt;f.vy+=GRV*dt;f.y+=f.vy*dt;if(f.y>=GYF){f.y=GYF;f.vy=0;return true;}return false;};
   if(f.st==='ko'){f.alpha=1;if(f.x<16||f.x>W-16){f.x=clamp(f.x,16,W-16);f.vx=-f.vx*0.3;}if(f.y<GYF||f.vy<0){f.x+=f.vx*dt;f.vy+=GRV*dt;f.y+=f.vy*dt;if(f.y>=GYF){f.y=GYF;if(!f.bounced&&f.vy>80){f.bounced=true;f.vy=-f.vy*0.35;f.vx*=0.5;this.shake=0.25;tone('sine',80,AT(),0.3,0.8,null,40);for(let i=0;i<14;i++)this.parts.push({x:f.x+(RND()-0.5)*30,y:GYF-2,vx:(RND()-0.5)*80,vy:-RND()*50,t:0,life:0.6,c:6,grav:true});}else{f.vy=0;f.land=true;}}}else{f.vx*=Math.pow(0.02,dt);f.x+=f.vx*dt;}return;}
   if(f.st==='hurt'||f.st==='bstun'||f.st==='frozen'){f.alpha=1;f.vx*=Math.pow(0.004,dt);f.x+=f.vx*dt;if(f.y<GYF){f.vy+=GRV*dt;f.y=Math.min(GYF,f.y+f.vy*dt);}if(f.y>=GYF){f.juggle=0;if(f.airKD){FX.dust(f.x,GYF,9);f.airKD=false;f.st='down';f.t=0;f.vx*=0.3;this.shake=Math.max(this.shake,0.12);return;}}if(f.t>=f.stun&&f.y>=GYF){this.idle(f);if(inp.down)f.st='crouch';}return;}
   if(f.st==='grab'){if(f.t>=0.32&&!f.thrown2){f.thrown2=true;const o2=f.grabbed;if(o2&&o2.st==='grabbed'){o2.st='thrown';o2.t=0;o2.vy=-210;o2.vx=-f.face*150;o2.x=f.x+f.face*6;o2.thrower=f;this.whoosh();tone('square',180,AT(),0.2,0.07,null,90);}}if(f.t>=0.55)this.idle(f);return;}
   if(f.st==='grabbed'){const gb=f.grabber;if(!gb||gb.st!=='grab'){this.idle(f);return;}f.x=gb.x+gb.face*18;if(f.t<0.25&&inp.punch&&!f.teched){f.teched=true;this.tech(gb,f);}return;}
   if(f.st==='thrown'){f.x+=f.vx*dt;f.vy+=GRV*dt;f.y+=f.vy*dt;if(f.x<14||f.x>W-14){f.x=clamp(f.x,14,W-14);f.vx=-f.vx*0.3;}if(f.y>=GYF){f.y=GYF;f.vy=0;const a=f.thrower;f.st='idle';f.inv=0;this.hit(a,f,{dmg:12,push:30,stun:0.5,unblock:true,knock:true},-a.face,f.x,GYF-10);this.shake=0.3;for(let i=0;i<12;i++)this.parts.push({x:f.x+(RND()-0.5)*30,y:GYF-2,vx:(RND()-0.5)*80,vy:-RND()*50,t:0,life:0.6,c:6,grav:true});}return;}
   if(f.st==='super'){const S_=SUPERS[f.C.id];S_.at.forEach((tt,i)=>{if(f.t>=tt&&f.phase===i){f.phase=i+1;S_.go(this,f,o,i);}});if(f.t>=S_.d)this.idle(f);return;}
   if(f.st==='down'){f.vx*=Math.pow(0.01,dt);f.x+=f.vx*dt;if(f.t>=0.75){this.idle(f);f.inv=0.2;f.wake=0.35;}return;}
   if(f.st==='cpunch'||f.st==='csweep'){const A_=f.st==='cpunch'&&f.cstep===2?ATK.cp3:ATK[f.st];f.active=f.t>=A_.s&&f.t<A_.s+A_.a;
     if(f.st==='cpunch'&&f.t>=A_.s+A_.a*0.5&&f.cstep<2&&f.bufP>0){f.bufP=0;f.cstep++;f.t=0;f.hitDone=false;this.whoosh();return;}
     if(f.t>=A_.s+A_.a+A_.r){this.idle(f);if(inp.down)f.st='crouch';}return;}
   if(f.st==='punch'||f.st==='kick'){const A_=this.curAtk(f);f.active=f.t>=A_.s&&f.t<A_.s+A_.a;const late=f.t>=A_.s+A_.a*0.5,step=f.st==='punch'?f.cstep:(f.kstep||0);
     if(late&&step>=1&&f.hitDone){for(const sl of [0,1]){if((inp['s'+sl]||f['b'+sl]>0)&&f.cd[sl]<=0&&f.C.s[sl]!=='auditoria'){f['b'+sl]=0;f.cancelN=(f.cancelN||0)+1;this.fx.push({x:f.x+f.face*14,y:f.y-44,t:0,c:14,big:true});this.startSp(f,o,sl,false);f.shout={t:"¡CANCELA! "+MVS[f.C.s[sl]][0],k:0};return;}}}
     if(f.st==='punch'&&late&&step===1&&f.bufK>0&&f.hitDone){f.bufK=0;f.st='csweep';f.t=0.04;f.hitDone=false;f.routeN=(f.routeN||0)+1;noise(AT(),0.12,0.08,'bandpass',900);return;}
     if(late&&step<2&&(f.hitDone||f.auto>0)){if(f.st==='punch'&&(f.bufP>0||f.auto>0)){f.bufP=0;if(f.auto>0)f.auto--;f.cstep++;f.t=0;f.hitDone=false;this.whoosh();if(f.cstep===2)this.say(f,FIN_SH[f.C.id]);return;}
       if(f.st==='kick'&&f.bufK>0){f.bufK=0;f.kstep=(f.kstep||0)+1;f.t=0;f.hitDone=false;this.whoosh();return;}}
     if(f.t>=A_.s+A_.a+A_.r)this.idle(f);return;}
   if(f.st==='charge'&&(inp.super||(inp.s0Hold&&inp.s1Hold))&&f.sup>=100){this.startSuper(f);return;}
   if(f.st==='charge'){const hold=inp['s'+f.slot+'Hold'],full=f.t>=CHG;
     if(full&&!f.full){f.full=true;const t=AT();tone('sine',1320,t,0.25,0.1);tone('sine',1980,t+0.05,0.25,0.06);}
     if(!full&&Math.floor(f.t*10)!==Math.floor((f.t-dt)*10))tone('sine',300+f.t*900,AT(),0.08,0.04);
     if(RND()<dt*40){const a=RND()*7,r=22;this.parts.push({x:f.x+Math.cos(a)*r,y:f.y-30+Math.sin(a)*r,vx:-Math.cos(a)*60,vy:-Math.sin(a)*60,t:0,life:0.35,c:f.slot?9:12});}
     if(!hold||f.t>2.2){const ch=full;f.full=false;this.startSp(f,o,f.slot,ch);}return;}
   if(f.st==='whirl'){if(f.t<0.95)f.x=clamp(f.x+f.face*95*dt,14,W-14);f.tick-=dt;if(f.tick<=0&&f.t<0.95){f.tick=0.16;f.hitDone=false;f.active=true;noise(AT(),0.08,0.08,'bandpass',2600);}if(f.t>=1.05)this.idle(f);return;}
   if(f.st==='counter'){if(f.t>=f.dur)this.idle(f);return;}
   if(f.st==='dash'){const sp=f.dd===f.face?STA.fwd:STA.bwd;f.x+=f.dd*sp*dt*(1-f.t/STA.dashT*0.5);if(RND()<dt*60)this.parts.push({x:f.x-f.dd*8,y:GYF-2,vx:-f.dd*30,vy:-10,t:0,life:0.25,c:6});if(f.t>=STA.dashT+(f.dd===f.face?0.12:0.05))this.idle(f);return;}
   if(f.st==='sp'){this.special(f,o,dt);return;}
   if(f.st==='jump'||f.st==='fkick'){if(f.st==='jump'&&inp.kick&&!f.jk){f.jk=true;f.hitDone=false;this.whoosh();}if(f.st==='fkick'&&f.t>0.06)f.active=true;if(f.jk)f.active=true;
     if(air()){FX.dust(f.x,GYF,3);f.wasF=f.st!=='jump';f.jkLand=!!f.jk;f.st='land';f.t=0;f.jk=false;f.active=false;}return;}
   if(f.st==='land'){if(f.t>=(f.wasF?0.16:(f.jkLand?0.12:0.06))){f.jkLand=false;this.idle(f);}return;}
   f.face=o.x>f.x?1:-1;f.alpha=1;
   if(inp.dash){const d=inp.dash;inp.dash=0;if(f.sta>=STA.dash&&!f.broken){FX.dust(f.x,GYF,4);f.st='dash';f.dd=d;f.t=0;f.sta-=STA.dash;f.staT=STA.delay;f.dashN=(f.dashN||0)+1;if(d!==f.face)f.inv=STA.inv;noise(AT(),0.1,0.08,'highpass',2000);tone('sine',500,AT(),0.08,0.04,null,d===f.face?900:300);return;}else{f.denied=0.4;f.dashDenied=(f.dashDenied||0)+1;if(f===this.me)tone('square',140,AT(),0.08,0.05);}}
   if(f.antiAir){f.antiAir=false;f.st='punch';f.cstep=2;f.t=0;f.hitDone=false;f.bufP=0;this.whoosh();return;}
   if((inp.super||(inp.s0Hold&&inp.s1Hold))&&f.sup>=100){this.startSuper(f);return;}
   {const fwd=o.x>f.x?inp.right:inp.left;if(inp.punch&&fwd&&Math.abs(o.x-f.x)<=GRAB_R&&o.y>=GYF-0.01&&f.y>=GYF-0.01&&GRABBABLE.includes(o.st)&&!(o.inv>0)){this.startGrab(f,o);return;}}
   for(const s of [0,1]){if(inp['s'+s]&&f.cd[s]<=0){this.startSp(f,o,s,!!inp['s'+s+'C']);return;}if(inp['s'+s+'Hold']&&f.cd[s]<=0){f.st='charge';f.slot=s;f.t=0;f.full=false;return;}}
   if(inp.down&&inp.punch){f.bufP=0;f.st='cpunch';f.t=0;f.cstep=0;f.hitDone=false;this.whoosh();}
   else if(inp.down&&inp.kick){f.st='csweep';f.t=0;f.hitDone=false;noise(AT(),0.12,0.08,'bandpass',900);}
   else if(inp.punch){f.bufP=0;f.st='punch';f.t=0;f.cstep=0;f.hitDone=false;this.whoosh();}
   else if(inp.kick){f.bufK=0;f.st='kick';f.kstep=0;f.t=0;f.hitDone=false;this.whoosh();}
   else if(inp.up){f.st='jump';f.t=0;f.vy=-275;f.vx=(inp.right?1:(inp.left?-1:0))*90;f.jk=false;f.hitDone=false;}
   else if(inp.down)f.st='crouch';
   else if(inp.left||inp.right){const d=inp.right?1:-1;f.x+=d*f.spd*(d===f.face?1:0.7)*dt;f.st=d===f.face?'walk':'back';f.walkT+=dt;}
   else f.st='idle';},
 startGrab(f,o){f.st='grab';f.t=0;f.thrown2=false;f.grabbed=o;f.grabN=(f.grabN||0)+1;o.st='grabbed';o.t=0;o.grabber=f;o.vx=0;o.teched=false;o.techTried=false;o.active=false;o.full=false;this.say(f,"¡TE AGARRÉ!");const t=AT();noise(t,0.1,0.15,'lowpass',900);tone('sine',200,t,0.1,0.3);},
 tech(a,d){a.st='bstun';a.t=0;a.stun=0.25;a.vx=-a.face*120;d.st='bstun';d.t=0;d.stun=0.25;d.vx=-d.face*120;d.techN=(d.techN||0)+1;this.say(d,"¡ESCAPA!");this.fx.push({x:(a.x+d.x)/2,y:a.y-40,t:0,c:7});const t=AT();tone('square',900,t,0.05,0.07);tone('square',1200,t+0.06,0.05,0.07);},
 startSuper(f){this.bump(1.5);FX.superRays(f.x,f.y-40,f===this.me?'120,200,255':'255,120,140');f.sup=0;f.st='super';f.t=0;f.phase=0;f.full=false;f.supN=(f.supN||0)+1;const S_=SUPERS[f.C.id];this.superFx={f,t:0,n:S_.n};this.say(f,f.C.id==='fran'?"¡KAIRÓS!":"¡"+S_.n+"!");const t=AT();tone('sawtooth',110,t,0.8,0.1,null,440);noise(t,0.6,0.2,'highpass',3000);[72,76,79,84].forEach((m,i)=>tone('square',hz(m),t+0.1+i*0.08,0.2,0.06));},
 startSp(f,o,slot,ch){const k=f.C.s[slot];f.cd[slot]=ch?2.3:1.55;f.cd[1-slot]=Math.max(f.cd[1-slot],1.0);this.say(f,MVS[k][ch?1:0]);f.chg=ch;f.spk=k;f.t=0;f.phase=0;f.hitDone=false;
   if(ch)f.cd[slot]+=0;const t=AT();tone('sine',300,t,0.2,0.08,null,ch?1400:900);
   if(k==='patada'){if(ch){f.st='whirl';f.tick=0;f.hits=0;noise(t,1.0,0.12,'bandpass',900);}else{f.st='fkick';f.vy=-170;f.vx=f.face*230;this.whoosh();}return;}
   if(k==='auditoria'){f.st='counter';f.dur=ch?1.0:0.7;return;}
   f.st='sp';},
 proj(f,o){if(this.sub==='ko'||this.sub==='time')return;const p=Object.assign({x:f.x+f.face*20,y:f.y-40,vx:f.face*165,vy:0,owner:f,r:6,dmg:10,push:80,stun:0.32},o);this.projs.push(p);return p;},
 special(f,o,dt){const k=f.spk,ch=f.chg,t=AT(),at=(tt)=>f.t>=tt&&f.phase<=0&&(f.phase=1,true);
   const seq=(times,fn)=>{times.forEach((tt,i)=>{if(f.t>=tt&&f.phase===i){f.phase=i+1;fn(i);}});};
   const end=(d)=>{if(f.t>=d)this.idle(f);};
   switch(k){
   case 'objecion':if(at(0.2)){if(ch){this.proj(f,{kind:'super',r:11,dmg:22,push:190,stun:0.6,vx:f.face*140,pierce:true,boom:true,x:f.x+f.face*26,y:f.y-38});tone('sawtooth',160,t,0.5,0.1,null,60);this.shake=0.15;}else this.proj(f,{kind:'me'});}end(ch?0.6:0.45);break;
   case 'objetado':if(ch)seq([0.2,0.36,0.52],i=>{this.proj(f,{kind:'doc',y:f.y+[-46,-28,-9][i],vx:f.face*170,dmg:8});this.whoosh();});else if(at(0.2))this.proj(f,{kind:'doc'});end(ch?0.75:0.45);break;
   case 'revision':if(f.t<0.25)f.alpha=1-f.t/0.25;else if(f.phase===0){f.phase=1;FX.paperBurst(f.x,f.y-30,16,false);let nx=o.x+(o.x>f.x?28:-28);if(nx<16||nx>W-16)nx=o.x-(o.x>f.x?28:-28);f.x=clamp(nx,16,W-16);f.face=o.x>f.x?1:-1;tone('sine',1200,t,0.15,0.06,null,300);FX.lupa(f.x+f.face*14,f.y-46);}
     else{f.alpha=Math.min(1,(f.t-0.25)/0.1);if(f.t>=0.38){f.alpha=1;f.st='punch';f.t=0;f.cstep=0;f.auto=ch?2:1;f.hitDone=false;this.whoosh();}}break;
   case 'evaluacion':if(ch)seq([0.2,0.35,0.5],()=>this.proj(f,{kind:'form',y:f.y-7,low:true,dmg:7,r:5}));else if(at(0.2))this.proj(f,{kind:'form',y:f.y-7,low:true,dmg:9,r:5});end(ch?0.7:0.45);break;
   case 'capacitacion':seq(ch?[0.4,0.7]:[0.4],()=>{this.proj(f,{kind:'wave',x:f.x+f.face*16,y:f.y-6,vx:f.face*190,low:true,dmg:ch?8:9,r:5,stun:ch?0.8:0.3});this.shake=0.25;tone('sine',70,t,0.4,0.9,null,35);noise(t,0.3,0.3,'lowpass',400);});end(ch?1.0:0.75);break;
   case 'kpi':if(at(0.2)){if(ch)this.proj(f,{kind:'kpiBig',r:11,dmg:18,push:180,stun:0.55,vx:f.face*140,pierce:true,y:f.y-38});else this.proj(f,{kind:'kpi',dmg:8});}end(ch?0.6:0.45);break;
   case 'vision':if(at(0.55)){this.beam={f,t:0,hit:false,thick:ch};tone('sawtooth',880,t,0.4,0.06,null,1200);noise(t,0.35,0.1,'highpass',3000);}if(f.t>=0.95){this.idle(f);this.beam=null;}break;
   case 'ticket':if(at(0.2)){if(ch)this.proj(f,{kind:'reboot',dmg:6,freeze:1.5,vx:f.face*150});else this.proj(f,{kind:'ticket',dmg:9});}end(0.45);break;
   case 'cable':if(ch){if(at(0.22)){this.walls=this.walls.filter(w=>w.owner!==f);this.walls.push({x:clamp(f.x+f.face*26,14,W-14),owner:f,t:0,life:3.2,cd:0,face:f.face});FX.superRays(f.x+f.face*26,f.y-30,'90,200,255');tone('sine',880,t,0.25,0.07,null,1760);tone('square',440,t+0.05,0.2,0.04);noise(t,0.25,0.08,'highpass',4000);}end(0.45);}
     else{f.active=f.t>=ATK.whip.s&&f.t<ATK.whip.s+ATK.whip.a;if(f.active&&!this.whipS){this.whipS=true;noise(t,0.12,0.1,'highpass',3000);}end(0.5);if(f.t>=0.5)this.whipS=false;}break;
   case 'bot':if(ch)seq([0.2,0.45,0.7],()=>this.proj(f,{kind:'bot',y:f.y-8,vx:f.face*80,low:true,dmg:7,r:6}));else if(at(0.2))this.proj(f,{kind:'bot',y:f.y-8,vx:f.face*85,low:true,dmg:8,r:6});end(ch?0.9:0.45);break;
   case 'cartas':if(at(0.2)){if(ch)[-50,0,50].forEach(v=>this.proj(f,{kind:'card',vx:f.face*210,vy:v,dmg:8,boom:true,r:5}));else this.proj(f,{kind:'card',vx:f.face*230,dmg:8,r:5});}end(0.5);break;
   case 'billetera':if(ch)seq([0.2,0.3,0.4,0.5,0.6],i=>this.proj(f,{kind:'moth',dmg:4,vx:f.face*(130+i*12),y:f.y-[44,30,52,36,24][i],r:5,stun:0.2,push:40}));else if(at(0.2))this.proj(f,{kind:'wallet',dmg:10,vx:f.face*150,r:7});if(at(0.2))tone('square',140,AT(),0.12,0.06,null,90);end(ch?0.75:0.45);break;
   case 'riff':if(ch)seq([0.2,0.32,0.44],i=>{this.proj(f,{kind:'riff',dmg:6,vx:f.face*230,r:12,ttl:0.5,push:120,y:f.y-36});tone('sawtooth',[110,147,165][i],AT(),0.25,0.08,null,null,{dist:true,lp:2200});});else if(at(0.25)){this.proj(f,{kind:'riff',dmg:10,vx:f.face*220,r:10,ttl:0.42,push:150,y:f.y-36});tone('sawtooth',98,AT(),0.35,0.09,null,92,{dist:true,lp:2000});tone('sawtooth',147,AT(),0.35,0.06,null,138,{dist:true,lp:2000});}end(ch?0.65:0.5);break;
   case 'prompt':if(ch)seq([0.2,0.28,0.36,0.44],()=>this.proj(f,{kind:'prompt',dmg:5,vx:f.face*190,r:6}));else if(at(0.2))this.proj(f,{kind:'prompt',dmg:10,vx:f.face*180,r:7});end(ch?0.6:0.45);break;
   case 'aluc':if(f.phase===0){f.phase=1;FX.pixBurst(f.x,f.y);this.decoys=this.decoys||[];this.decoys.push({x:f.x,y:GYF,face:f.face,owner:f,t:0,life:ch?2.0:1.4,C:f.C});if(ch)this.decoys.push({x:clamp(f.x-f.face*34,16,W-16),y:GYF,face:f.face,owner:f,t:0,life:2.0,C:f.C});tone('sine',900,t,0.3,0.06,null,300);noise(t,0.3,0.08,'highpass',5000);}
     if(f.t<0.25)f.alpha=Math.max(0,1-f.t/0.2);else if(f.phase===1){f.phase=2;let nx=o.x+(o.x>f.x?28:-28);if(nx<16||nx>W-16)nx=o.x-(o.x>f.x?28:-28);f.x=clamp(nx,16,W-16);f.face=o.x>f.x?1:-1;tone('sine',1200,t,0.15,0.06,null,400);FX.pixBurst(f.x,f.y);}
     else{f.alpha=Math.min(1,(f.t-0.25)/0.1);if(f.t>=0.38){f.alpha=1;f.st='punch';f.t=0;f.cstep=0;f.auto=ch?2:1;f.hitDone=false;this.whoosh();}}break;
   case 'balance':if(ch){seq([0.3,0.42,0.54,0.66,0.78,0.9],i=>{this.proj(f,{kind:'bill',x:clamp(o.x+(i-2.5)*14+(RND()-0.5)*8,10,W-10),y:40,vx:0,vy:150,dmg:5,r:5,stun:0.25});});if(f.phase===1&&f.t<0.35)tone('pulse',hz(84),t,0.1,0.05);end(1.0);}
     else{if(at(0.2)){this.proj(f,{kind:'coin',dmg:8});blip(88,t);blip(95,t+0.05);}end(0.45);}break;
   }},
 drawArms(f,gl,ty,lean,bw,L_,C){if(!gl.length)return;const S1=[bw/2-2+lean,ty+3],S0=[-bw/2+2+lean,ty+3];const gs=gl.slice().sort((a,b)=>b[0]-a[0]).slice(0,2);
  const lit=(c,k)=>{const h=col(c);if(typeof h!=='string'||h[0]!=='#'||h.length<7)return h;const n=parseInt(h.slice(1,7),16),f=v=>Math.max(0,Math.min(255,Math.round(v+(k>0?(255-v)*k:v*k))));return 'rgb('+f(n>>16)+','+f((n>>8)&255)+','+f(n&255)+')';};
  const seg=(x0,y0,x1,y1,w,c)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;R(Math.round(x-w/2),Math.round(y-w/2),w,w,c);}};
  const sleeve=lit(L_.top,0.16),skin=C(L_.skin);
  for(let i=gs.length-1;i>=0;i--){const S=i===0?S1:S0,[gx,gy]=gs[i],dx=gx-S[0],dy=gy-S[1],Ln=Math.hypot(dx,dy);let ex,ey;
   if(gy<S[1]-6){ex=S[0]+dx*0.45+(i===0?2:-2);ey=(S[1]+gy)/2;}else if(Ln<18){ex=S[0]+(dx>=0?2:-2);ey=Math.max(S[1],gy)+8;}else{ex=S[0]+dx*0.5;ey=S[1]+dy*0.5+2;}
   if(i===1){g.save();g.beginPath();g.rect(-200,-200,400,400);g.rect(-bw/2+lean,ty,bw,22-(L_.h||0));g.clip('evenodd');}
   seg(S[0],S[1],ex,ey,6,'rgba(8,6,18,0.55)');seg(ex,ey,gx,gy,5,'rgba(8,6,18,0.55)');
   seg(S[0],S[1],ex,ey,4,OUTL?OUTL:(i===1?lit(L_.top,-0.1):sleeve));seg(ex,ey,gx,gy,3,skin);R(Math.round(ex-2),Math.round(ey-2),4,4,OUTL?OUTL:(i===1?lit(L_.top,-0.1):sleeve));
   if(i===1)g.restore();}},
 idle(f){f.st='idle';f.t=0;f.active=false;f.alpha=1;f.auto=0;f.dizzy=false;f.crouchHit=false;},
 whoosh(){noise(AT(),0.08,0.06,'bandpass',2400);},
 hurtbox(f){if(f.st==='down')return [f.x-20,f.y-10,40,10];const c=f.st==='crouch'||f.st==='cpunch'||f.st==='csweep'||(f.st==='bstun'&&f.lowB)||(f.st==='hurt'&&f.crouchHit),h=(c?34:54)-(c?0:f.look.h),w=f.look.bw+2;return [f.x-w/2,f.y-h,w,h];},
 atkbox(f){if(f.st==='whirl')return [f.x-32,f.y-36,64,24];const A_=this.curAtk(f),b=A_.box;const x0=f.face>0?f.x+b[0]:f.x-b[0]-b[2];return [x0,f.y+b[1],b[2],b[3]];},
 curAtk(f){if(f.st==='jump')return DM_JK;if(f.st==='punch'&&f.cstep===0)return DM_PUNCH;if(f.st==='punch'&&f.cstep===1)return DM_P2;if(f.st==='kick')return [DM_K1,DM_K2,DM_K3][f.kstep||0];if(f.st==='sp'&&f.spk==='cable')return ATK.whip;if(f.st==='punch'&&f.cstep===2)return ATK.p3;if(f.st==='cpunch'&&f.cstep===2)return ATK.cp3;return ATK[f.st];},
 ov(a,b){return a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];},
 hit(a,d,A_,dir,x,y,extra={}){const onG=d.y>=GYF-0.01,t=AT();
   if(d.st==='counter'&&a!==d){ // auditoría
     const ch=d.chg,dm=ch?Math.max(14,Math.round((A_.dmg||8)*2)):12;this.say(d,ch?"¡EMBARGADO, CHE!":"¡AUDITADO!");blip(96,t,0.1);blip(100,t+0.07,0.1);noise(t,0.15,0.2,'highpass',4000);
     d.st='idle';d.t=0;FX.paperBurst(d.x+d.face*8,d.y-30,22,false);this.hit(d,a,{dmg:dm,push:170,stun:0.5},-dir,a.x,a.y-30);return;}
   if(d.inv>0&&a!==d){this.fx.push({x,y,t:0,c:6});return;}
   if(d.st==='down'){return;}
   let blk=onG&&d.back&&!d.broken&&!A_.unblock&&['back','crouch','idle','walk','bstun'].includes(d.st);d.active=false;d.jk=false;
   const lowG=d.st==='crouch'||(d.st==='bstun'&&d.lowB);let miss=null;
   if(blk&&A_.low&&!lowG){blk=false;miss='¡ERA BAJO!';}if(blk&&A_.over&&lowG){blk=false;miss='¡ERA ALTO!';}
   if(miss){this.mix=(this.mix||0)+1;d.mixed=(d.mixed||0)+1;if(d===this.me)this.fb8={t:miss,k:0,x:d.x,y:d.y};}
   if(blk){const cost=(STA.blockBase+Math.abs(A_.dmg||8)*STA.blockMul)*(A_.proj?0.5:1);d.sta-=cost;d.staT=STA.delay;d.blocks=(d.blocks||0)+1;if(d.sta<=0){d.sta=0;d.broken=true;d.breaks=(d.breaks||0)+1;blk=false;this.guardBreak(d);}}
   if(blk){a.sup=Math.min(100,(a.sup||0)+SUPG.blk);d.sup=Math.min(100,(d.sup||0)+SUPG.blkTaken);d.hp-=A_.dmg>=18?4:1;d.lowB=d.st==='crouch'||(d.st==='bstun'&&d.lowB);d.st='bstun';d.t=0;d.stun=0.12;d.vx=dir*Math.abs(A_.push)*0.6;this.fx.push({x,y,t:0,c:12});this.blockSnd(t,d.sta||0);FX.block(x,y,-dir);if(d.hp<=0)this.ko(a,d,dir,t);return;}
   const wasLow=['crouch','cpunch','csweep'].includes(d.st)||(d.st==='hurt'&&d.crouchHit);
   const scl=a.combo>=7?0.5:(a.combo>=5?0.6:(a.combo>=3?0.8:1)),dmg=Math.max(1,Math.round(A_.dmg*(a.dmul||1)*scl));d.hp-=dmg;d.st=extra.freeze?'frozen':'hurt';d.crouchHit=wasLow&&d.st==='hurt';d.t=0;d.stun=extra.freeze||A_.stun;if(A_.knock){if(onG){d.st='down';d.vx=dir*40;}else d.airKD=true;d.kd=(d.kd||0)+1;noise(t,0.2,0.2,'lowpass',500);}if(d.justBroke){d.justBroke=false;d.st='hurt';d.stun=STA.breakStun;d.dizzy=true;}d.vx=dir*A_.push;d.alpha=1;if(a.st==='fkick')FX.hit(x,y,3,0);if(!onG){d.juggle=(d.juggle||0)+1;d.vy=d.juggle<=2?-120:80;}const fin=A_.fin||A_.knock;this.stop=fin?0.11:((a.st==='punch'&&a.cstep===1)||(a.st==='kick'&&a.kstep===1)?0.075:0.055);if(fin)this.shake=Math.max(this.shake,0.18);this.fx.push({x,y,t:0,c:extra.freeze?12:10,big:!!fin});
   this.hitSnd(fin?3:(dmg>=6?2:1),t);FX.hit(x,y,fin?3:(dmg>=6?2:1),a.C&&a.C.id==='jean'?1:(a===this.me?0:2));if(fin){this.zoom=0.06;this.shake=Math.max(this.shake,0.32);}if(Math.abs(A_.push)>=150||dmg>=12)this.shake=Math.max(this.shake,0.2);
   if(extra.freeze){tone('square',200,t,0.5,0.06,null,80);}
   if(a.st!=='super'){a.sup=Math.min(100,(a.sup||0)+SUPG.hit);}d.sup=Math.min(100,(d.sup||0)+SUPG.hitTaken);
   a.combo++;a.comboT=0.9;if(a.combo>=3||A_.knock)this.bump(1.0);if(a===this.me){this.landed++;this.score+=dmg*10+(a.combo>1?a.combo*20:0);}else if(d===this.me)this.taken+=dmg;
   if(d.hp<=0)this.ko(a,d,dir,t);},
 guardBreak(d){d.justBroke=true;FX.shatter(d.x+d.face*10,d.y-34);if(d===this.foe)this.brokeFoes=(this.brokeFoes||0)+1;this.say(d,"¡GUARDIA ROTA!");const t=AT();noise(t,0.4,0.35,'bandpass',2600);tone('square',1200,t,0.3,0.08,null,200);for(let i=0;i<24;i++){const a=RND()*7,v=60+RND()*120;this.parts.push({x:d.x+d.face*10,y:d.y-34,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,t:0,life:0.5,c:pick([12,7,6]),grav:true});}this.shake=0.25;},
 // ko -> ver l8f.js
 boom(x,y,n=46){FX.boom(x,y,n>30);this.zoom=Math.max(this.zoom||0,n>30?0.05:0.02);for(let i=0;i<n;i++){const a=RND()*Math.PI*2,v=40+RND()*160;this.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,t:0,life:0.5+RND()*0.5,c:pick([7,12,12,10,9,14]),grav:true});}this.shake=0.3;const t=AT();noise(t,0.6,0.4,'lowpass',600);tone('sine',90,t,0.5,0.8,null,30);},
 // ---------- IA ----------
 brain(f,o,dt,P){{const dc=(this.decoys||[]).find(q=>q.owner===o&&q.t<q.life);if(dc)o=Object.assign(Object.create(o),{x:dc.x,y:GYF,st:'idle',jk:false,vy:0});}const inp=f.ai;inp.punch=inp.kick=inp.up=inp.s0=inp.s1=inp.s0C=inp.s1C=inp.super=false;inp.dash=0;if(f.aiHold>0)f.aiHold-=dt;else inp.left=inp.right=inp.down=inp.s0Hold=inp.s1Hold=false;
   const dx=o.x-f.x,d=Math.abs(dx),tw=dx>0?'right':'left',aw=dx>0?'left':'right',oAir=o.y<GYF-4,oAtk=['punch','kick','fkick','whirl','sp','cpunch','csweep'].includes(o.st)||o.jk,oLow=o.st==='cpunch'||o.st==='csweep',oOver=o.st==='fkick'||o.jk||(o.st==='jump'&&Math.abs(o.x-f.x)<50);
   if(f.st==='jump'&&d<34&&f.vy>-60&&!f.jk)inp.kick=true;
   if(f.st==='grabbed'&&!f.techTried&&f.t>0.08){f.techTried=true;if(RND()<(P.tech||0))inp.punch=true;return;}if(f.st==='kick'&&(f.kstep||0)<2&&RND()<P.aggr){inp.kick=true;}
   if(f.aaT>0){f.aaT-=dt;if(f.st==='punch'&&f.cstep<2)inp.punch=true;}
   if(f.st==='punch'&&f.cstep===1&&RND()<P.aggr){const r=RND();if(r<0.3&&f.hitDone){const sl=[0,1].find(k=>f.cd[k]<=0&&f.C.s[k]!=='auditoria');if(sl!==undefined)inp['s'+sl]=true;else inp.punch=true;}else if(r<0.55)inp.kick=true;else inp.punch=true;}
   else if((f.st==='punch'||f.st==='cpunch')&&f.cstep<2&&RND()<P.aggr){inp.punch=true;if(f.st==='cpunch'){inp.down=true;f.aiHold=Math.max(f.aiHold,0.1);}}
   if(f.wake>0){f.wake-=dt;if(f.st==='idle'&&d<60&&!f.wakeDone){f.wakeDone=true;if(oAir&&RND()<(P.anti||0.3)+0.35){f.antiAir=true;return;}const q=RND();if(q<0.5){inp[aw]=true;f.aiHold=0.35;}else if(q<0.75&&f.sta>=STA.dash)inp.dash=dx>0?-1:1;else inp.punch=true;return;}}else f.wakeDone=false;
   // capa reactiva: castiga recuperaciones, dashes, saltos y caminatas hacia el agarre (con tiempo de reacción humano)
   if(['idle','walk','back','crouch'].includes(f.st)&&f.y>=GYF-0.01&&RND()<dt/(P.react||0.25)){
     const th2=this.projs.find(p=>p.owner!==f&&Math.sign(p.vx||0)===Math.sign(f.x-p.x)&&Math.abs(p.x-f.x)<95&&Math.abs(p.x-f.x)>22&&p.kind!=='bill'&&p.kind!=='doc'||(p.owner!==f&&p.vx&&Math.sign(p.vx)===Math.sign(f.x-p.x)&&Math.abs(p.x-f.x)<95&&Math.abs(p.x-f.x)>22));
     if(th2){if(th2.low||th2.pierce||RND()<0.65){inp.up=true;inp[tw]=true;f.aiHold=0.25;}else{inp[aw]=true;f.aiHold=0.4;inp.down=false;}return;}
     if(o.st==='counter'){if(d<=GRAB_R+2){inp.punch=true;inp[tw]=true;f.aiHold=0.05;}else{inp[aw]=true;f.aiHold=0.3;}return;}
     if(d>80&&o.cd[0]>0.4&&o.cd[1]>0.4&&f.sta>=STA.dash&&RND()<0.6){inp.dash=dx>0?1:-1;return;}
     if(o.st==='sp'&&o.spk==='vision'&&o.t<0.55){if(o.chg){inp[aw]=true;}else{inp.down=true;inp[aw]=true;}f.aiHold=0.6;return;}
     const oRec=(o.st==='sp'&&o.t>0.2)||(o.st==='land'&&o.wasF)||((o.st==='kick'||o.st==='csweep')&&o.t>0.18)||(o.st==='punch'&&o.t>0.14)||(o.st==='dash'&&o.t>STA.dashT);
     const toMe=Math.sign(f.x-o.x),oDashIn=o.st==='dash'&&o.dd===toMe,oWalkIn=o.st==='walk'&&d<34,oJumpIn=oAir&&o.vy>-40&&o.y>GYF-60&&d<44;
     if(oRec&&RND()<(P.pun||0.5)){const melee=['punch','kick','csweep'].includes(o.st);if(d<=GRAB_R+1){inp.punch=true;inp[tw]=true;f.aiHold=0.05;return;}else if(d<40){inp.punch=true;return;}else if(!melee&&d<120&&f.sta>=STA.dash){inp.dash=dx>0?1:-1;return;}}
     if(oDashIn&&d<90&&RND()<(P.pun||0.5)){inp.punch=true;return;}
     {const sa=f.C.s.indexOf('auditoria');const atkIn=['kick','csweep','fkick','sp','jump'].includes(o.st)&&o.t<0.14,walkIn=['walk','dash'].includes(o.st)&&Math.sign(f.x-o.x)===Math.sign(o.st==='dash'?o.dd:(o.vx||0));if(sa>=0&&f.cd[sa]<=0&&d<50&&(atkIn||walkIn)&&RND()<(P.pun||0.5)*0.8){inp['s'+sa]=true;return;}}
     if(['punch','kick','cpunch','csweep'].includes(o.st)&&d<50&&!f.broken&&f.sta>20&&RND()<P.block+0.25){inp[aw]=true;inp.down=o.st==='cpunch'||o.st==='csweep';f.aiHold=0.3;return;}
     if(oJumpIn&&RND()<(P.anti||0.3)+0.2){f.antiAir=true;return;}
     if(oWalkIn&&RND()<P.aggr*0.7){inp.punch=true;return;}}
   f.aiT-=dt;if(f.aiT>0)return;f.aiT=P.think*(0.7+RND()*0.6);
   {const sa=f.C.s.indexOf('auditoria');if(sa>=0&&f.cd[sa]<=0&&d<44&&!['sp','super','counter'].includes(o.st)&&RND()<0.07){inp['s'+sa]=true;return;}}
   if(f.sup>=100&&d<160&&RND()<(P.supP||0)){inp.super=true;return;}
   if(d<=GRAB_R+3&&(o.back||o.st==='crouch'||RND()<0.25)&&RND()<(P.grab||0)){inp.punch=true;inp[tw]=true;f.aiHold=0.05;return;}
   if(this.beam&&this.beam.f!==f){if(this.beam.thick){inp[aw]=true;}else inp.down=true;f.aiHold=0.5;return;}
   const aud=f.C.s.indexOf('auditoria');if(aud>=0&&oAtk&&d<60&&f.cd[aud]<=0&&RND()<0.5){inp['s'+aud]=true;inp['s'+aud+'C']=RND()<P.chg;return;}
   const th=this.projs.find(p=>p.owner!==f&&Math.sign(p.vx||0)===Math.sign(f.x-p.x)&&Math.abs(p.x-f.x)<80);
   if(th){const pj=[0,1].find(s=>f.cd[s]<=0&&['objecion','objetado','kpi','ticket','cartas','balance','evaluacion','bot'].includes(f.C.s[s]));if(pj!==undefined&&Math.abs(th.x-f.x)>45&&!th.pierce&&RND()<0.35){inp['s'+pj]=true;return;}
     if(th.low||th.pierce||RND()<0.6||f.sta<30){inp.up=true;f.aiHold=0.3;inp[tw]=RND()<0.8;}else{inp[aw]=true;f.aiHold=0.5;}return;}
   if(oAtk&&d<55&&RND()<P.block+(['punch','kick','cpunch'].includes(o.st)?0.2:0)){if(!f.broken&&(f.sta>28||RND()<0.45)){inp[aw]=true;f.aiHold=0.35;const read=RND()<(P.read||0.7);inp.down=read?oLow:(oOver?true:RND()<0.5);}else if(f.sta>=STA.dash&&RND()<0.6){inp.dash=dx>0?-1:1;}else{inp.up=true;inp[aw]=true;f.aiHold=0.3;}return;}
   if(d>100&&f.sta>60&&RND()<0.35){inp.dash=dx>0?1:-1;return;}
   if(d<40&&f.sta>45&&f.sta<85&&RND()<0.12){inp.dash=dx>0?-1:1;return;}
   if(oAir&&o.vy>-40&&o.y>GYF-60&&d<44&&RND()<P.anti){f.antiAir=true;return;}
   if(o.st==='crouch'&&o.back&&d<80&&d>30&&RND()<0.4){inp.up=true;inp[tw]=true;f.aiHold=0.2;return;}
   if(RND()<P.sp){const opts=[0,1].filter(s=>{const k=f.C.s[s],r=MVAI[k];return f.cd[s]<=0&&k!=='auditoria'&&d>=r[0]&&d<=r[1];});if(opts.length){const s=pick(opts);if(RND()<P.chg&&d>70){inp['s'+s+'Hold']=true;f.aiHold=0.85;}else inp['s'+s]=true;return;}}
   const r2=RND();
   if(d>100){inp[tw]=true;f.aiHold=0.3+RND()*0.4;}
   else if(d>36){if(oAtk&&d<70){inp[aw]=true;f.aiHold=0.2;}else if(r2<P.jump){inp.up=true;inp[tw]=true;f.aiHold=0.2;}else{inp[tw]=true;f.aiHold=0.2+RND()*0.3;}}
   else if(o.st==='counter'){inp[aw]=true;f.aiHold=0.3;}
   else{if(r2<P.aggr){const q=RND();if(q<0.4)inp.punch=true;else if(q<0.7)inp.kick=true;else if(q<0.86){inp.down=true;inp.punch=true;f.aiHold=0.25;}else{inp.down=true;inp.kick=true;f.aiHold=0.15;}}else if(r2<P.aggr+0.2){inp[aw]=true;f.aiHold=0.3;}else if(r2<P.aggr+0.3){inp.down=true;f.aiHold=0.3;}}},
 // ---------- ciclo ----------
 update(dt){this.pt+=dt;this.shake=Math.max(0,this.shake-dt);
   if(this.cheer>0)this.cheer-=dt;
   this.fx=this.fx.filter(e=>(e.t+=dt)<0.25);this.parts=this.parts.filter(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.grav)p.vy+=260*dt;return p.t<p.life;});
   if(this.ph==='select'){if(BOT&&this.pt>0.5)this.pick(Math.floor(RND()*DMC.length));return;}
   if(this.ph==='challenger'){if(this.pt>1.6){this.ph='vs';this.pt=0;tone('sawtooth',110,AT(),0.8,0.12,null,55);noise(AT(),0.8,0.2,'lowpass',500);}return;}
   if(this.ph==='vs'){if(this.pt>2.6)this.startFight();return;}
   if(this.ph==='quote'){if(this.pt>2.8||(BOT&&this.pt>1)){this.stage++;if(this.stage>=this.ladder.length){this.ph='ending';this.pt=0;musicStop();S.win();}else this.startVS();}return;}
   if(this.ph==='continue'){if(BOT&&this.pt>1){this.doCont();return;}if(this.pt>=10){return finishLevel({fail:true});}if(Math.floor(this.pt)!==Math.floor(this.pt-dt))tone('square',440,AT(),0.1,0.06);return;}
   if(this.ph==='ending'){if(BOT&&this.pt>1)return finishLevel({fail:false});return;}
   // pelea
   if(this.sub==='intro'){const lim=this.round===1?3.0:2.0;if(this.round===1){this.me.st=this.pt<1.2?'intro':'idle';this.foe.st=this.pt>1.1&&this.pt<2.3?'intro':'idle';}if(this.pt>lim){this.sub='go';this.me.st='idle';this.foe.st='idle';S.bell(0.2);}return;}
   if(this.sub==='finish'){this.fin.t+=dt;this.foe.t+=dt;this.me.t+=dt;if(BOT&&this.fin.t>this.botF)this.startFat();else if(this.fin.t>=FAT_WIN){this.fin=null;this.koFall(this.me,this.foe,1,AT());}return;}
   if(this.sub==='fatal'){this.fatUpdate(dt);return;}
   if(this.sub==='ko'||this.sub==='time'){if(this.projs.length){for(const p of this.projs)if(typeof FX!=='undefined')FX.hit(p.x,p.y,1,0);this.projs=[];}if(this.walls.length)this.walls=[];if(this.decoys&&this.decoys.length)this.decoys=[];this.beam=null;for(const f of [this.me,this.foe]){if(f.st==='charge'||((f.st==='sp'||f.st==='super')&&f.hp>0)){f.st='idle';f.t=0;f.full=false;f.alpha=1;}}
     const sdt=this.sub==='ko'&&this.pt<1.8?dt*0.28:dt;this.fup(this.me,{},this.foe,sdt);this.fup(this.foe,{},this.me,sdt);
     if(this.pt>1.9){const wm=this.sub==='ko'?this.foe.hp<=0&&this.me.hp>0:(this.me.hp/this.me.max>=this.foe.hp/this.foe.max);const Wf=wm?this.me:this.foe,Lf=wm?this.foe:this.me;if(Wf.st!=='ko'&&Wf.st!=='win'&&Wf.y>=GYF-0.01){Wf.st='win';Wf.t=0;Wf.vx=0;this.bump(2);}if(this.sub==='time'&&Lf.st!=='ko'&&Lf.st!=='lose'&&Lf.y>=GYF-0.01){Lf.st='lose';Lf.t=0;Lf.vx=0;}if(Wf.st==='win')this.winFx(Wf,this.pt);}
     if(this.pt>(this.sub==='ko'?3.9:3.0)){const won=this.sub==='ko'?this.foe.hp<=0&&this.me.hp>0:(this.me.hp/this.me.max>=this.foe.hp/this.foe.max);
       this.rw[won?0:1]++;this.meter=[this.me.sup,this.foe.sup];this.roundLog=(this.roundLog||0)+1;
       if(this.rw[0]<2&&this.rw[1]<2){this.round++;this.startRound();return;}
       if(won){this.wins++;this.score+=this.me.hp*5+Math.round(this.timer)*10+300;this.ph='quote';this.pt=0;musicStop();S.win();}else{this.ph='continue';this.pt=0;musicStop();S.lose();}}return;}
   if(this.superFx){this.superFx.t+=dt;if(this.superFx.t>0.9)this.superFx=null;return;}if(this.blueFx>0)this.blueFx-=dt;
   if(this.stop>0){this.stop-=dt;const m_=this.me;if(this.inp.punch){m_.bufP=0.2;this.inp.punch=false;}if(this.inp.kick){m_.bufK=0.2;this.inp.kick=false;}if(this.inp.s0Hold&&!m_.h0){m_.b0=0.2;m_.h0=true;}if(this.inp.s1Hold&&!m_.h1){m_.b1=0.2;m_.h1=true;}return;}
   this.timer-=dt;if(this.timer<=0){this.timer=0;this.sub='time';this.pt=0;S.bell(0.25);return;}
   if(BOT)this.brain(this.me,this.foe,dt,this.P1||{think:0.18,aggr:0.7,block:0.7,sp:0.25,chg:0.2,jump:0.05,anti:0.6,grab:0.3,tech:0.3,supP:0.5});
   this.brain(this.foe,this.me,dt,this.P);
   this.fup(this.me,BOT?this.me.ai:this.inp,this.foe,dt);this.fup(this.foe,this.foe.ai,this.me,dt);
   for(const k of ['up','punch','kick','s0','s1','super'])this.inp[k]=false;
   for(const f of [this.me,this.foe])f.x=clamp(f.x,14,W-14);
   if(this.me.y>=GYF&&this.foe.y>=GYF&&Math.abs(this.me.x-this.foe.x)<20){const m=(this.me.x+this.foe.x)/2,s=this.me.x<this.foe.x?-1:1;this.me.x=clamp(m+s*10,14,W-14);this.foe.x=clamp(m-s*10,14,W-14);}
   for(const [a,d] of [[this.me,this.foe],[this.foe,this.me]]){if(a.active&&!a.hitDone&&d.st!=='ko'&&this.sub==='go'){const A_=a.st==='whirl'?null:this.curAtk(a);if(!A_&&a.st!=='whirl')continue;const ab=this.atkbox(a);
     if(this.ov(ab,this.hurtbox(d))){a.hitDone=true;let AA=A_;if(a.st==='whirl'){a.hits++;AA=a.hits>=5?ATK.whirlEnd:ATK.whirl;}this.hit(a,d,AA,a.st==='whirl'?(d.x>a.x?1:-1):a.face,ab[0]+ab[2]/2,ab[1]+ab[3]/2);}}}
   if(this.beam){const b=this.beam,own=b.f;if((b.multi===undefined&&(b.t>0.5||own.st!=='sp'||own.spk!=='vision'))||(b.multi!==undefined&&own.st!=='super'&&b.t>0.2)||b.t>1.4||own.st==='ko'||own.hp<=0)this.beam=null;}
   if(this.beam){const b=this.beam,f=b.f,d=f===this.me?this.foe:this.me;b.t+=dt;const x0=f.face>0?f.x+14:0,x1=f.face>0?W:f.x-14,bb=b.thick?[x0,f.y-54,x1-x0,26]:[x0,f.y-50,x1-x0,9];
     if(b.thick)for(const p of this.projs)if(p.owner!==f&&this.ov([p.x-p.r,p.y-p.r,p.r*2,p.r*2],bb))p.dead=true;
     if(b.multi!==undefined){b.tick-=dt;if(b.tick<=0&&b.multi>0){b.tick=0.2;b.multi--;b.hit=false;}}
     const touch=d.st!=='ko'&&this.ov(bb,this.hurtbox(d));b.end=touch?d.x-f.face*5:(f.face>0?W:0);b.touch=touch;
     if(!b.hit&&d.st!=='ko'&&this.ov(bb,this.hurtbox(d))){b.hit=true;this.hit(f,d,b.multi!==undefined?{dmg:5,push:40,stun:0.3}:(b.thick?ATK.thick:ATK.beam),f.face,d.x,f.y-44);}
     if(b.multi!==undefined&&b.t>1.1)this.beam=null;}
   for(const f of [this.me,this.foe])if(f.st==='whirl'){const ab=this.atkbox(f);for(const p of this.projs)if(p.owner!==f&&this.ov([p.x-p.r,p.y-p.r,p.r*2,p.r*2],ab)){p.dead=true;this.fx.push({x:p.x,y:p.y,t:0,c:9});}}
   for(const w of this.walls){w.cd=Math.max(0,(w.cd||0)-dt);w.flash=Math.max(0,(w.flash||0)-dt);const o=w.owner===this.me?this.foe:this.me;if(this.sub==='go'&&o.st!=='ko'&&o.y>GYF-60&&Math.abs(o.x-w.x)<10){const dir=Math.sign(o.x-w.x)||-w.face;o.x=w.x+dir*10;if(w.cd<=0&&!['down','thrown','grabbed'].includes(o.st)){w.cd=0.7;w.flash=0.2;this.hit(w.owner,o,{dmg:8,push:140,stun:0.32,unblock:false},dir,w.x,o.y-30);}}}
   this.walls=this.walls.filter(w=>(w.t+=dt)<w.life);if(this.decoys)this.decoys=this.decoys.filter(q=>(q.t+=dt)<q.life);
   for(const p of this.projs){if(p.dead)continue;if(p.ttl!=null&&(p.ttl-=dt)<=0){p.dead=true;continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.kind==='bill'&&p.y>GYF){p.dead=true;continue;}
     for(const w of this.walls)if(w.owner!==p.owner&&Math.abs(p.x-w.x)<8+p.r){if(p.pierce||p.kind==='bill'||p.kind==='doc'&&p.vy){p.dead=true;}else{p.vx=-p.vx;p.owner=w.owner;p.dmg=Math.round((p.dmg||10)*1.2);p.x=w.x+Math.sign(p.vx)*(10+p.r);p.refl=true;}FX.block(p.x,p.y,Math.sign(p.vx));tone('square',1320,AT(),0.08,0.06,null,660);w.flash=0.15;}
     if(p.dead)continue;const d=p.owner===this.me?this.foe:this.me;
     if(this.sub==='go'&&d.st!=='ko'&&this.ov([p.x-p.r,p.y-p.r,p.r*2,p.r*2],this.hurtbox(d))){p.dead=true;this.hit(p.owner,d,{dmg:p.dmg,push:p.push,stun:p.stun,low:p.low,over:p.over||p.kind==='bill',proj:true},p.vx?Math.sign(p.vx):(d.x>p.owner.x?1:-1),p.x,p.y,{freeze:p.freeze});if(p.boom){this.boom(p.x,p.y,p.kind==='card'?20:46);if(p.kind==='super')FX.paperBurst(p.x,p.y,26,true);}}}
   for(const p of this.projs)for(const q of this.projs)if(p!==q&&p.owner!==q.owner&&!p.dead&&!q.dead&&p.kind!=='bill'&&q.kind!=='bill'&&Math.abs(p.x-q.x)<p.r+q.r&&Math.abs(p.y-q.y)<p.r+q.r){
     if(p.pierce&&!q.pierce)q.dead=true;else if(q.pierce&&!p.pierce)p.dead=true;else p.dead=q.dead=true;this.fx.push({x:(p.x+q.x)/2,y:p.y,t:0,c:7});noise(AT(),0.2,0.2,'bandpass',2000);}
   this.projs=this.projs.filter(p=>!p.dead&&p.x>-20&&p.x<W+20&&p.y<H+10);},
 doCont(){this.cont++;S.ok();this.startVS();this.ph='vs';this.pt=0.8;},
 key(c,down){if(this.ph==='select'){if(!down)return;const n=DMC.length+1;if(c==='ArrowRight'){this.sel=(this.sel+1)%n;S.move();}if(c==='ArrowLeft'){this.sel=(this.sel+n-1)%n;S.move();}if(c==='ArrowDown'||c==='ArrowUp'){this.sel=(this.sel+5)%10;if(this.sel>=n)this.sel-=5;S.move();}
     if(c==='Enter'||c==='KeyZ'||c==='Space')this.pick(this.sel===DMC.length?Math.floor(RND()*DMC.length):this.sel);return;}
   if(this.ph==='challenger'||this.ph==='vs'){if(down&&(c==='Enter'||c==='Space')&&this.pt>0.5){if(this.ph==='challenger'){this.ph='vs';this.pt=0;}else this.startFight();}return;}
   if(this.ph==='quote'){if(down&&(c==='Enter'||c==='Space')&&this.pt>0.6)this.pt=99;return;}
   if(this.ph==='continue'){if(down&&(c==='Enter'||c==='Space'||c==='KeyZ'))this.doCont();return;}
   if(this.ph==='ending'){if(down&&(c==='Enter'||c==='Space')&&this.pt>1)finishLevel({fail:false});return;}
   if(down&&(c==='ArrowLeft'||c==='ArrowRight'||c==='KeyA'||c==='KeyD')){const dir=(c==='ArrowRight'||c==='KeyD')?1:-1,now=performance.now();if(this.shift||(this.lastTap&&this.lastTap.dir===dir&&now-this.lastTap.t<260)){this.inp.dash=dir;this.lastTap=null;}else this.lastTap={dir,t:now};}
   if(down&&(c==='KeyC'||c==='KeyL')&&this.inp.s1Hold)this.inp.super=true;if(down&&(c==='KeyV'||c==='KeyI')&&this.inp.s0Hold)this.inp.super=true;
   if(c==='ShiftLeft'||c==='ShiftRight'){this.shift=down;if(down&&(this.inp.left||this.inp.right))this.inp.dash=this.inp.right?1:-1;}
   if(this.sub==='finish'){if(down&&c==='KeyF')this.startFat();return;}
   if(this.sub==='fatal'){if(down&&(c==='Enter'||c==='Space'))this.fatSkip();if(down){const l=FLANES.findIndex(q=>q.k===c);const l2=['KeyA','KeyS','KeyW','KeyD'].indexOf(c);if(l>=0)this.fatKey(l);else if(l2>=0)this.fatKey(l2);}return;}
   const m={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down',KeyC:'s0Hold',KeyL:'s0Hold',KeyV:'s1Hold',KeyI:'s1Hold'}[c];if(m)this.inp[m]=down;
   if(down){const e={ArrowUp:'up',KeyW:'up',KeyZ:'punch',KeyJ:'punch',KeyX:'kick',KeyK:'kick',Space:'punch'}[c];if(e)this.inp[e]=true;}},
 button(id){if(id==='pick'&&this.ph==='select')this.pick(this.sel===DMC.length?Math.floor(RND()*DMC.length):this.sel);},
 pointer(type,x,y,id,ptype){if(ptype==='touch')TOUCHUI=true;
   if(this.ph==='select'){if(type!=='down')return;if(x>=188&&x<252&&y>=114&&y<129){this.pick(this.sel===DMC.length?Math.floor(RND()*DMC.length):this.sel);return;}for(let i=0;i<=DMC.length;i++){const [cx,cy]=this.cell(i);if(x>=cx-1&&x<cx+27&&y>=cy-1&&y<cy+31){if(this.sel===i)this.pick(i===DMC.length?Math.floor(RND()*DMC.length):i);else{this.sel=i;S.move();}return;}}
     return;}
   if(this.ph!=='fight'){if(type==='down')this.key('Enter',true);return;}
   if(this.sub==='finish'){if(type==='down'&&(TOUCHUI?(y>100):true))this.startFat();return;}
   if(this.sub==='fatal'){if(type==='down'&&this.fat&&this.fat.fin){this.fatSkip();return;}if(type==='down'&&y>118){this.fatKey(clamp(Math.floor(x/48),0,3));}else if(type==='down'&&x>=194){this.fatKey(clamp(Math.floor((x-196)/14),0,3));}return;}
   if(!TOUCHUI)return;
   this.touchFight(type,x,y,id);},
 result(){const NR=this.ladder?this.ladder.length:DMC.length-1;const gr=this.wins<NR?'F':(this.cont===0&&this.taken<=150?'S':(this.cont===0?'A':(this.cont<=2?'B':'C')));if(A.mus)A.mus.gain.value=0.55;
   return {score:this.score,grade:gr,lines:[["LUCHADOR",this.me0?this.me0.n:"-"],["RIVALES VENCIDOS",this.wins+"/"+NR],["CONTINUACIONES",this.cont],["FATALITIES",(this.fatN||0)+"/"+NR]]};},
 // ---------- dibujo ----------
 drawF(f,t){const L_=f.look,st=f.st,onG=f.y>=GYF-0.01,hh=L_.h||0;g.save();g.globalAlpha=f.alpha;g.translate(Math.round(f.x),Math.round(f.y));if(f.st==='hurt'&&f.t<0.09&&!REDUCED)g.scale(1.12,0.9);if(f.st==='win'&&f.C&&f.C.id==='coni')g.translate(0,-Math.round(Math.abs(Math.sin(t*8))*8));if(f.st==='dizzy')g.translate(Math.round(Math.sin(t*5)*2),0);if(f.sc)g.scale(f.sc,f.sc);
   const spin=st==='whirl';let face=f.face;if(spin)face=Math.floor(f.t*16)%2?1:-1;g.scale(face,1);
   if((st==='ko'&&!f.land)||st==='thrown'){g.translate(0,-20);g.rotate(-Math.min(st==='thrown'?3.1:1.45,f.t*(st==='thrown'?9:2.2)));g.translate(0,20);}
   const white=(st==='hurt'&&f.t<0.07),C=c=>white?7:(st==='frozen'?"#5A8AE0":c);
   if(st==='down'){R(-26,-8,40,8,C(L_.top));R(-30,-9,10,10,C(L_.skin));if(!L_.bald)R(-30,-9,10,3,C(L_.hair));R(12,-6,18,6,C(L_.pants));disc(-16,-12,4,C(L_.glove));g.restore();return;}
   if(st==='ko'&&f.land){R(-26,-8,40,8,C(L_.top));R(-30,-9,10,10,C(L_.skin));if(!L_.bald)R(-30,-9,10,3,C(L_.hair));R(12,-6,18,6,C(L_.pants));disc(-16,-12,4,C(L_.glove));g.restore();return;}
   const cr=(st==='hurt'&&f.crouchHit)||st==='lose'||st==='crouch'||st==='cpunch'||st==='csweep'||(st==='bstun'&&f.lowB)||st==='charge',by=cr?(st==='charge'?6:14):0,lean=st==='hurt'||st==='ko'?-3:((st==='kick'&&f.kstep===2)?-3:((st==='punch'&&f.cstep===1)?2:0)),bw=L_.bw;
   const KA=st==='kick'?[DM_K1,DM_K2,DM_K3][f.kstep||0]:null,kickOn=(st==='kick'&&f.t>=KA.s*0.6&&f.t<KA.s+KA.a+0.08)||(st==='sp'&&f.spk==='capacitacion'&&f.t<0.4);
   if(spin){R(-4,-20,8,20,C(L_.pants));R(0,-30,30,7,C(L_.pants));R(28,-32,5,10,C(0));R(-26,-28,24,6,C(L_.pants));}
   else if(!onG||st==='fkick'){if(st==='fkick'||f.jk){R(-5,-22,7,12,C(L_.pants));R(0,-24,26,7,C(L_.pants));R(24,-26,5,10,C(0));}else{R(-6,-20,6,12,C(L_.pants));R(1,-18,6,10,C(L_.pants));}}
   else if(st==='csweep'&&f.t>=ATK.csweep.s*0.6&&f.t<ATK.csweep.s+ATK.csweep.a+0.1){R(-9,-12,8,12,C(L_.pants));R(0,-8,30,6,C(L_.pants));R(28,-9,5,8,C(0));}
   else if(cr){R(-9,-12,8,12,C(L_.pants));R(1,-12,9,12,C(L_.pants));R(-10,-2,10,2,C(L_.shoes||0));R(1,-2,10,2,C(L_.shoes||0));}
   else if(kickOn){LIMB(-4,-19,-6,-10,L_.baggy?7:6,C(L_.pants));LIMB(-6,-10,-4,-2,L_.baggy?6:5,C(L_.pants));R(-8,-2,8,2,C(L_.shoes||0));if(st==='sp'){R(2,-34,8,16,C(L_.pants));R(1,-36,10,4,C(0));}
     else{const P_=C(L_.pants),SH=C(L_.shoes||0),pw=L_.baggy?7:6,chamber=f.t<KA.s*0.95,ks=f.kstep||0;
      if(chamber){LIMB(2,-18,9,-27+ks*-2,pw,P_);LIMB(9,-27+ks*-2,7,-15-ks*3,pw-1,P_);R(5,-16-ks*3,6,3,SH);}
      else if(ks===0){LIMB(2,-18,12,-14,pw,P_);LIMB(12,-14,25,-16,pw-1,P_);R(24,-21,4,8,SH);R(25,-22,3,1,'rgba(255,255,255,0.25)');if(f.active)R(0,-11,20,1,"rgba(255,255,255,0.5)");}
      else if(ks===1){LIMB(2,-19,14,-27,pw,P_);LIMB(14,-27,28,-30,pw-1,P_);R(27,-35,4,9,SH);if(f.active){R(0,-24,22,1,"rgba(255,255,255,0.5)");R(4,-21,16,1,"rgba(255,255,255,0.35)");}}
      else{LIMB(2,-21,11,-33,pw,P_);LIMB(11,-33,25,-43,pw-1,P_);R(23,-49,6,6,SH);if(f.active){g.strokeStyle="rgba(255,255,255,0.6)";g.beginPath();g.arc(2,-24,30,-1.3,0.2);g.stroke();g.strokeStyle="rgba(255,255,255,0.3)";g.beginPath();g.arc(2,-24,24,-1.2,0.1);g.stroke();}}}}
   else if(st==='walk'||st==='back'){const P_=C(L_.pants),SH=C(L_.shoes||0),pw=L_.baggy?7:6;for(const i of [0,1]){const ph=f.walkT*11+i*Math.PI,sw=Math.sin(ph)*(st==='back'?-1:1),lift=Math.max(0,Math.cos(ph))*2.2,hx=i?3:-4,fx=hx+sw*5,kx=hx+sw*2.5+lift*0.8,ky=-10-lift*0.6;g.globalAlpha=f.alpha*(i?1:0.92);LIMB(hx,-19,kx,ky,pw,P_);LIMB(kx,ky,fx,-3-lift,pw-1,P_);R(Math.round(fx-4),Math.round(-2-lift),8,2,SH);}g.globalAlpha=f.alpha;}
   else{R(-7,-20,6,20,C(L_.pants));R(1,-20,6,20,C(L_.pants));if(L_.baggy){R(-9,-13,3,11,C(L_.pants));R(6,-13,3,11,C(L_.pants));R(-7,-12,1,8,C('rgba(0,0,0,0.25)'));}R(-8,-2,8,2,C(L_.shoes||0));R(0,-2,8,2,C(L_.shoes||0));}
   const ty=-42+by+hh;R(-bw/2+lean,ty,bw,22-hh,C(L_.top));R(-bw/2+lean,ty,4,22-hh,'rgba(0,0,0,0.28)');R(bw/2-2+lean,ty+1,1,20-hh,'rgba(255,255,255,0.22)');R(-bw/2+lean,ty+19-hh,bw,3,'rgba(0,0,0,0.18)');
   if(L_.tie){R(-3+lean,ty,7,10,C(L_.shirt||(L_.kind==='brandan'?"#FFFFFF":7)));R(0+lean,ty+1,2,10,C(L_.tie));}
   if(L_.kind==='brandan'){R(-bw/2+lean,ty,4,22-hh,C("#2A3A5A"));R(bw/2-4+lean,ty,2,22-hh,C("#2A3A5A"));}
   if(L_.kind==='jl'&&!L_.casual)R(-2+lean,ty,5,4,C(7));
   if(L_.casual){R(-3+lean,ty,6,2,'rgba(255,255,255,0.12)');}
   if(L_.stripes){for(const sx of [-bw/2+3,-2,bw/2-6])R(sx+lean,ty+1,3,21-hh,C(L_.stripes));R(-4+lean,ty,8,1,C('#111'));R(-bw/2+lean,ty+4,bw,1,'rgba(0,0,0,0.06)');R(3+lean,ty+5,2,2,C('#D8B040'));R(-6+lean,ty+5,2,1,C('#D8B040'));}
   if(L_.txt3){const G3={B:'110101110101110',O:'111101101101111',S:'011100010001110'};let px=Math.round(-L_.txt3.length*2-2+lean);for(const ch of L_.txt3){const gg=G3[ch]||'';for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(gg[r*3+c]==='1')R(px+c,ty+5+r,1,1,C(7));px+=4;}}
   if(L_.slime){const G1=C('#5BD12A'),G2=C('#9DFF5A');R(-7+lean,ty+9,4,3,G1);R(-3+lean,ty+11,9,5,G1);R(4+lean,ty+8,4,4,G2);R(-6+lean,ty+15,3,2,G2);R(-1+lean,ty+6,6,5,C('#E8E8EE'));R(0+lean,ty+8,1,1,C(0));R(3+lean,ty+8,1,1,C(0));R(1+lean,ty+11,3,1,C('#E8E8EE'));R(1+lean,ty+11,1,1,C(0));R(3+lean,ty+11,1,1,C(0));}
   if(L_.logo){R(-5+lean,ty+6,6,1,C(7));R(-4+lean,ty+8,4,1,C(7));R(2+lean,ty+5,3,3,C('#C8C8D0'));R(-6+lean,ty+12,9,1,'rgba(255,255,255,0.5)');}
   if(L_.kind==='andres'&&!L_.noLanyard){R(2+lean,ty+2,1,10,C(10));R(1+lean,ty+11,4,5,C(7));}

   if(L_.kind==='me'&&!L_.suit)R(-bw/2+lean,ty+18-hh,bw,4,C(8));
   if(L_.suit){R(-1+lean,ty,1,4,'rgba(0,0,0,0.35)');R(-4+lean,ty,2,3,C('#F2F2F2'));R(2+lean,ty,2,3,C('#F2F2F2'));R(-2+lean,ty+10,1,1,C('#555'));R(-2+lean,ty+14,1,1,C('#555'));}
   if(L_.inner){R(-3+lean,ty,6,19-hh,C(L_.inner));R(-3+lean,ty,1,19-hh,'rgba(0,0,0,0.3)');R(2+lean,ty,1,19-hh,'rgba(0,0,0,0.3)');}
   if(L_.tee)R(-3+lean,ty,6,6,C(L_.tee));if(L_.zip)R(0+lean,ty+1,1,19-hh,C('#C8C8D0'));
   if(L_.print){R(-6+lean,ty+6,4,1,C(7));R(-3+lean,ty+5,2,1,C(7));R(2+lean,ty+6,4,1,C(7));R(4+lean,ty+7,2,1,C(7));R(-7+lean,ty+7,2,1,C(7));}
   if(L_.chain){R(-2+lean,ty+1,1,1,C('#E8E8F0'));R(-1+lean,ty+2,1,2,C('#E8E8F0'));R(1+lean,ty+2,1,2,C('#E8E8F0'));R(2+lean,ty+1,1,1,C('#E8E8F0'));R(0+lean,ty+4,1,1,C('#E8E8F0'));}
   if(L_.strap){for(let q=0;q<16;q++)R(bw/2-2-q+lean,ty+q+1,2,1,C('#D8D0B8'));}
   if(L_.sym){R(-1+lean,ty+8,1,1,C(L_.sym));R(-2+lean,ty+9,3,1,C(L_.sym));R(-3+lean,ty+10,5,1,C(L_.sym));R(-1+lean,ty+9,1,1,C(L_.top));}
   if(L_.hood){R(-bw/2+lean-1,ty-3,bw+2,5,C(L_.top));R(-bw/2+lean,ty-3,3,5,C('rgba(0,0,0,0.25)'));R(1+lean,ty+1,1,7,C(L_.cord||7));R(4+lean,ty+1,1,6,C(L_.cord||7));R(-bw/2+3+lean,ty+12-hh,bw-6,5,C(L_.pocket||'#2A2E36'));R(-bw/2+lean,ty+19-hh,bw,3,C(L_.pocket||'#2A2E36'));}
   const hw=L_.kind==='andres'||L_.kind==='jean'?14:12,hx=-hw/2+lean*1.5,hy=-54+by+hh;
   if(L_.longHair)R(hx-1,hy+2,5,L_.hairLen||14,C(L_.hair));
   R(hx,hy,hw,12,C(L_.skin));R(hx,hy+3,3,9,'rgba(0,0,0,0.18)');R(hx+hw-1,hy+2,1,9,'rgba(255,255,255,0.3)');R(hx,hy+10,hw,2,'rgba(0,0,0,0.12)');
   if(L_.bald){R(hx+2,hy+1,3,1,C("#FFFFFF"));}else if(L_.fade){R(hx,hy-1,hw,4,C(L_.hair));R(hx+hw-6,hy+2,5,2,C(L_.hair));R(hx,hy+3,4,2,C(L_.hair));R(hx,hy+5,3,3,C('rgba(0,0,0,0.28)'));}else{R(hx,hy,hw,3,C(L_.hair));R(hx,hy,4,8,C(L_.hair));}
   if(L_.messy){R(hx+1,hy-2,3,2,C(L_.hair));R(hx+5,hy-3,4,3,C(L_.hair));R(hx+10,hy-2,3,2,C(L_.hair));R(hx+hw-3,hy+1,3,2,C(L_.hair));R(hx,hy+3,4,6,C(L_.hair));R(hx+4,hy-2,1,1,'rgba(255,255,255,0.22)');R(hx+9,hy-3,1,1,'rgba(255,255,255,0.22)');R(hx+1,hy+5,1,2,'rgba(255,255,255,0.18)');}
   if(L_.ponytail){R(hx,hy-1,hw,3,C(L_.hair));R(hx,hy,4,7,C(L_.hair));R(hx-3,hy+2,4,4,C(L_.hair));R(hx-4,hy+5,3,6,C(L_.hair));R(hx-4,hy+10,2,2,C(L_.hair));R(hx+2,hy-1,6,1,'rgba(255,255,255,0.18)');}
   if(L_.bangs){R(hx+hw-8,hy+2,7,2,C(L_.hair));R(hx+hw-3,hy+4,2,1,C(L_.hair));R(hx+hw-8,hy+4,2,1,C(L_.hair));}
   if(L_.earring)R(hx+3,hy+8,1,2,C('#F0F0F0'));
   if(L_.stubble){R(hx+3,hy+8,hw-3,4,L_.stubble);R(hx,hy+5,3,5,L_.stubble);}
   if(L_.beard){R(hx+3,hy+7,hw-3,5,C(L_.beardC||L_.hair));R(hx,hy+4,3,6,C(L_.beardC||L_.hair));R(hx+7,hy+9,3,1,C(L_.skin));}
   const ex=hx+hw-4,ey=hy+5;
   if(L_.glasses){const gf=((st==='sp'&&f.spk==='vision'&&f.t<0.55)||st==='intro')&&Math.floor(t*14)%2;const fc=L_.glassC?C(L_.glassC):C(0);if(L_.glassC){R(ex-3,ey-2,7,6,gf?7:(L_.lens==='clear'?'rgba(210,230,255,0.25)':"#F4F8FF"));BOXL(ex-3,ey-2,7,6,fc);R(hx+2,ey-1,ex-hx-5,1,fc);}else{R(ex-2,ey-2,6,5,gf?7:"#E8F6FF");BOXL(ex-2,ey-2,6,5,fc);R(hx+2,ey-1,ex-hx-4,1,fc);}R(ex,ey,2,2,C(L_.kind==='coni'?"#3B2A20":0));}else R(ex,ey,2,2,C(0));
   if(L_.smile&&st!=='hurt'&&st!=='dizzy'){R(hx+hw-6,hy+9,5,2,C(0));R(hx+hw-5,hy+9,3,1,C(7));R(hx+hw-7,hy+8,1,1,C(0));R(hx+hw-1,hy+8,1,1,C(0));R(hx+hw-1,hy+4,1,1,'rgba(0,0,0,0.3)');}
   else if(!L_.beard)R(hx+hw-5,hy+9,4,1,C(st==='hurt'?8:(L_.lips||0)));
   if(L_.kind==='me'&&!L_.quiff)R(hx+1,hy-1,10,2,C(L_.hair));
   if(L_.quiff){R(hx,hy-1,hw,3,C(L_.hair));R(hx+hw-8,hy-3,8,2,C(L_.hair));R(hx+hw-4,hy-3,2,1,'rgba(255,255,255,0.2)');R(hx,hy+1,3,5,C(L_.hair));}
   if(st==='frozen'){R(hx+2,hy-10,10,8,1);T(":(",hx+2,hy-10,7);}
   if(f.dizzy&&(st==='hurt'||st==='dizzy')){for(let k=0;k<3;k++){const an=t*6+k*2.1;T("*",hx+3+Math.cos(an)*9,hy-6+Math.sin(an)*3,10);}}
   const G=bw>=20?5:4;
   const GC=C(L_.glove);CAPT={c:GC,list:[]};
   if(st==='intro'){this.introArms(f,ty,G,C,L_,t);}
   else if(st==='win'){this.winArms(f,ty,G,C,L_,t);}
   else if(st==='lose'){disc(8,ty+14,G,C(L_.glove));disc(-4,ty+16,G,C(L_.glove));}
   else if(st==='cpunch'){const A_=f.cstep===2?ATK.cp3:ATK.cpunch,out=f.t>=A_.s*0.5&&f.t<A_.s+A_.a+0.05;if(out){R(4,ty+5,16,4,C(L_.skin));disc(22,ty+7,G+1,C(L_.glove));disc(4,ty+10,G,C(L_.glove));}else{disc(10,ty+4,G,C(L_.glove));disc(4,ty+10,G,C(L_.glove));}}
   else if(st==='csweep'){disc(-6,ty+10,G,C(L_.glove));disc(8,ty+12,G,C(L_.glove));}
   else if(st==='punch'){const A_=this.curAtk(f),out=f.t>=A_.s*0.5&&f.t<A_.s+A_.a+0.05,id=f.C?f.C.id:'';
     if(f.cstep===0){if(out){disc(23,-45+by+hh,G+1,C(L_.glove));disc(4,ty+8,G,C(L_.glove));if(f.active){R(12,-49+by+hh,8,1,"rgba(255,255,255,0.5)");R(13,-41+by+hh,7,1,"rgba(255,255,255,0.35)");}}else{disc(10,ty+2,G,C(L_.glove));disc(4,ty+8,G,C(L_.glove));}}
     else if(f.cstep===1){if(out){disc(8,ty+1,G,C(L_.glove));disc(26,-42+by+hh,G+1,C(L_.glove));if(f.active){R(12,-46+by+hh,10,1,"rgba(255,255,255,0.55)");R(13,-38+by+hh,8,1,"rgba(255,255,255,0.35)");}}else{disc(4,ty+4,G,C(L_.glove));disc(-2,ty+8,G,C(L_.glove));}}
     else{if(!out){disc(6,ty+10,G,C(L_.glove));disc(-3,ty+8,G,C(L_.glove));}
       else{const top=ty-16;
         if(id==='alvaro'){R(2,ty-2,12,4,C(L_.skin));R(12,ty-10,4,10,C(L_.skin));disc(14,ty-11,3,C(L_.skin));disc(4,ty+2,G,C(L_.glove));}
         else if(id==='andres'){disc(-6,ty+4,G,C(L_.glove));disc(-2,ty+8,G,C(L_.glove));R(6,ty-14,8,10,C(L_.skin));R(6,ty-14,8,3,C(L_.hair));}
         else if(id==='jl'){R(6,ty-4,14,4,C(L_.skin));R(20,ty-10,4,14,C(L_.glove));disc(-3,ty+8,G,C(L_.glove));}
         else{disc(9,top-2,G+1,C(L_.glove));disc(-3,ty+8,G,C(L_.glove));
           if(id==='samir'){R(3,top-12,14,10,C("#6B3A1E"));R(8,top-14,4,2,C(0));R(3,top-8,14,1,C(GOLD));}
           if(id==='jean'){R(1,top-9,18,6,C("#D8D8E0"));for(let q=0;q<5;q++)R(3+q*3,top-7,2,2,C(5));}
           if(id==='coni'){R(2,top-12,15,10,C(5));R(3,top-11,13,7,C("#29ADFF"));}
           if(id==='brandan'){R(5,top-8,9,6,C("#5A3A12"));R(6,top-7,7,1,C("#8A6A3A"));}}
         if(f.active){g.strokeStyle="rgba(255,255,255,0.6)";g.beginPath();g.arc(4,ty-2,16,-1.6,-0.2);g.stroke();}}}}
   else if(st==='sp'&&f.spk==='cable'&&!f.chg){R(4,ty+3,12,4,C(L_.skin));disc(16,ty+4,G,C(L_.glove));}
   else if(st==='sp'&&f.spk==='balance'&&f.chg){R(2,ty-10,4,12,C(L_.skin));R(-6,ty-10,4,12,C(L_.skin));disc(4,ty-12,G,C(L_.glove));disc(-4,ty-12,G,C(L_.glove));}
   else if(st==='sp'||st==='grab'||st==='super'){R(4,ty+3,12,4,C(L_.skin));disc(16,ty+3,G,C(L_.glove));disc(15,ty+9,G,C(L_.glove));if(f.t<0.22&&['objecion','kpi','ticket','cartas','balance'].includes(f.spk)){const r=(f.chg?5:2)+f.t*(f.chg?45:25);disc(22,ty+6,r,f.spk==='objecion'?12:(f.spk==='cartas'?14:10));disc(22,ty+6,r*0.5,7);}}
   else if(st==='counter'){const k=Math.floor(t*10)%2;disc(9,ty+2,G+1,C(k?GOLD:L_.glove));disc(9,ty+10,G+1,C(k?L_.glove:GOLD));R(4,ty+2,4,10,C(L_.skin));}
   else if(st==='charge'){disc(12,ty+6,G,C(L_.glove));disc(12,ty+12,G,C(L_.glove));}
   else if(st==='back'&&this.sub==='go'||st==='bstun'){disc(10,ty+1,G,C(L_.glove));disc(8,ty+9,G,C(L_.glove));}
   else if(st==='hurt'||st==='ko'||st==='frozen'||st==='dizzy'||st==='grabbed'||st==='thrown'){disc(8,ty-1,G,C(L_.glove));disc(4,ty+6,G,C(L_.glove));}
   else if(st==='fkick'||f.jk||spin){disc(-8,ty+2,G,C(L_.glove));disc(6,ty,G,C(L_.glove));}
   else if(st==='pose'){disc(bw/2+1,ty+17,G,C(L_.glove));disc(-bw/2+1,ty+17,G,C(L_.glove));}
   else{const wk=(st==='walk'||st==='back')?Math.round(Math.sin((f.walkT||0)*14)*1.5):0,b=st==='idle'?Math.round(Math.sin(t*6+(f.ph||0))):0;disc(12+wk,ty-1+b,G,C(L_.glove));disc(7-wk,ty+5-b,G,C(L_.glove));}
   {const gl=CAPT.list;CAPT=null;this.drawArms(f,gl,ty,lean,bw,L_,C);for(const [x,y,r] of gl)disc(x,y,r,GC);}
   g.restore();if(OUTL)return;
   if(st==='sp'&&f.spk==='cable'&&!f.chg&&f.active){const x0=f.x+f.face*20,y0=f.y-44+hh;if(typeof FX!=='undefined')FX.cable(x0,y0,x0+f.face*25,y0-8+Math.sin(t*40)*3,x0+f.face*48,y0+2,t);}
   if(st==='charge'&&f.full){const sw=TW('¡LISTO!');R(clamp(f.x,24,W-24)-sw/2-2,f.y-82+(f.look.h||0),sw+4,11,'rgba(0,0,0,0.55)');TC("¡LISTO!",f.y-80+(f.look.h||0),10,1,0,clamp(f.x,24,W-24));}
   if(st==='counter'){g.strokeStyle=col(GOLD);g.globalAlpha=0.6;g.beginPath();g.ellipse(f.x,f.y-28,16,30,0,0,7);g.stroke();g.globalAlpha=1;}
   if(spin){g.globalAlpha=0.6;for(let k=0;k<3;k++){g.strokeStyle=col([9,10,7][k]);g.beginPath();g.ellipse(f.x,f.y-28+k*4,30-k*4,6,0,t*20+k,t*20+k+4);g.stroke();}g.globalAlpha=1;}
   if(f.shout){f.shout.k+=1/60;if(f.shout.k<0.8){const sw=TW(f.shout.t),sx=clamp(f.x,4+sw/2,W-4-sw/2),sy=Math.max(52,Math.round(f.y-70-f.shout.k*6+hh));R(sx-sw/2-2,sy-2,sw+4,11,"rgba(0,0,0,0.6)");TC(f.shout.t,sy,f===this.me?12:8,1,0,sx);}}},
 drawP(p,t){const x=Math.round(p.x),y=Math.round(p.y),dir=Math.sign(p.vx)||1;if(['doc','form','wave','kpi','kpiBig','ticket','reboot','bot','card','coin','prompt','bill','agent','wallet','moth','riff','skull'].includes(p.kind)&&typeof FX!=='undefined'&&FX.pwr){FX.pwr(p,t);return;}
   switch(p.kind){
   case 'me':FX.legalBall(p,t,false);disc(x,y,2,7);break;
   case 'super':FX.legalBall(p,t,true);disc(x,y,3,7);break;
   case 'doc':R(x-5,y-7,11,14,7);BOXL(x-5,y-7,11,14,5);for(let k=0;k<4;k++)R(x-3,y-4+k*3,7,1,5);R(x-3,y+4,4,2,8);break;
   case 'form':R(x-7,y-5,14,10,7);BOXL(x-7,y-5,14,10,5);for(let k=0;k<2;k++){R(x-5,y-3+k*4,2,2,11);R(x-2,y-2+k*4,7,1,5);}break;
   case 'wave':for(let k=0;k<4;k++)R(x-dir*k*6,y+2-k*2,4,6+k*2,k%2?9:10);R(x-3,y-4,6,10,7);break;
   case 'kpi':R(x-8,y-7,16,13,7);BOXL(x-8,y-7,16,13,1);R(x-6,y+1,3,3,12);R(x-2,y-1,3,5,12);R(x+2,y-4,3,8,11);break;
   case 'kpiBig':R(x-13,y-12,26,24,7);BOXL(x-13,y-12,26,24,1);R(x-10,y+2,5,7,12);R(x-3,y-3,5,12,12);R(x+4,y-8,5,17,11);LN(x-10,y-2,x+9,y-10,8);break;
   case 'ticket':R(x-7,y-5,14,10,10);BOXL(x-7,y-5,14,10,9);T("#",x-3,y-3,0);break;
   case 'reboot':R(x-8,y-6,16,12,"#1E5AD0");BOXL(x-8,y-6,16,12,7);T(":(",x-6,y-4,7);break;
   case 'bot':{const b=Math.floor(t*10)%2;R(x-5,y-6,10,8,6);R(x-3,y-4,2,2,8);R(x+1,y-4,2,2,8);R(x-1,y-9,2,3,5);R(x-4,y+2,2,4-b,5);R(x+2,y+2,2,3+b,5);break;}
   case 'card':g.save();g.translate(x,y);g.rotate(t*14);R(-3,-5,6,10,14);R(-2,-4,4,8,7);g.restore();disc(x,y,2,14);break;
   case 'coin':SPR(COIN,x-4,y-4,{o:GOLD,1:"#FFF4D6"});break;
   case 'prompt':R(x-9,y-5,18,10,'#0A1A12');BOXL(x-9,y-5,18,10,'#33FF88');T('>',x-7,y-3,'#33FF88');if(Math.floor(t*8)%2)R(x-1,y+2,5,1,'#33FF88');break;
   case 'agent':{disc(x,y,5,'#2A1A4A');disc(x,y,4,'#8A5CFF');R(x-1,y-1,3,2,7);R(x-7,y-6+(Math.floor(t*30)%2),14,1,6);R(x-1,y-6,2,2,6);break;}
   case 'bill':R(x-6,y-3,12,6,"#5FB85F");BOXL(x-6,y-3,12,6,3);R(x-1,y-1,2,2,3);break;
   default:disc(x,y,6,0);disc(x,y,5,7);}},
 office(t){R(0,0,W,H,"#2A2F45");R(20,50,90,50,"#0B1020");for(let i=0;i<11;i++){const h=10+((i*37)%28);R(21+i*8,99-h,7,h,"#222034");if(i%2)PX(23+i*8,96-h+4,10);}BOXL(19,49,92,52,6);R(64,49,2,52,6);
   R(146,50,90,50,"#0B1020");for(let i=0;i<11;i++){const h=12+((i*29)%26);R(147+i*8,99-h,7,h,"#222034");if(i%3)PX(149+i*8,96-h+5,10);}BOXL(145,49,92,52,6);R(190,49,2,52,6);
   R(0,100,W,24,"#34304A");R(8,92,40,4,"#6B4226");R(10,96,3,28,"#4E2E1A");R(43,96,3,28,"#4E2E1A");R(16,80,20,12,5);R(18,82,16,8,"#EDEFF5");
   R(236,88,14,36,5);R(239,92,8,6,0);R(4,70,6,30,"#3C8C4A");disc(7,70,6,"#3C8C4A");
   R(0,GYF,W,H-GYF,"#5A4A6A");R(0,GYF,W,2,"#7A6A8A");for(let x=-60;x<W+60;x+=28)LN(x,GYF+2,x+(x-128)*0.35,H,"#4A3A5A");},
 cell(i){return [112+(i%5)*28,26+Math.floor(i/5)*34];},
 portrait(C,x,y,w,h,sc,face=1,focus=48,pose='pose'){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();const f={C,look:C.look,st:pose,t:0,face,x:x+w/2,y:Math.round(y+h/2+(focus-(C.look.h||0))*sc),alpha:1,sc,cd:[0,0]};this.drawF(f,0);g.restore();},
 draw(t){
   if(this.ph==='select')return this.drawSelect(t);
   if(this.ph==='challenger'){R(0,0,W,H,0);for(let y=0;y<H;y+=4)R(0,y,W,1,"#140000");if(Math.floor(t*6)%2){TC("¡UN NUEVO RETADOR",52,8,2,0);TC("HA LLEGADO!",72,8,2,0);}return;}
   if(this.ph==='vs')return this.drawVS(t);
   if(this.ph==='continue'){R(0,0,W,H,"#0B0508");this.portrait(this.me0,78,18,100,80,2,1,38);g.fillStyle="rgba(0,0,0,0.5)";g.fillRect(78,18,100,80);TC("¿CONTINUAR?",100,10,2,0);TC(String(Math.max(0,9-Math.floor(this.pt))),116,8,2,0);if(Math.floor(t*2.5)%2)TC("ENTER O TOCA",134,7);return;}
   if(this.ph==='ending'){R(0,0,W,H,"#0B1020");for(let i=0;i<30;i++){const x=(i*53+t*20)%W,y=(i*29+t*40)%H;R(x,y,2,2,[10,12,14,11][i%4]);}this.portrait(this.me0,78,16,100,76,2,1,38);TC("¡CAMPEÓN DEL DEATHMATCH!",98,10,1,0);TC(this.me0.n,110,7);TC(this.me0.win,122,12);if(this.pt>1&&Math.floor(t*2.5)%2)TC("ENTER PARA SEGUIR",134,6);return;}
   // pelea
   const AMP=this.shake>0&&!REDUCED?2+this.shake*16:0,SOX=Math.round(Math.sin(t*70)*AMP),SOY=Math.round(Math.cos(t*55)*AMP*0.6),ZM=REDUCED?0:(this.zoom||0);g.save();g.translate(SOX,SOY);if(ZM){g.translate(W/2,90);g.scale(1+ZM,1+ZM);g.translate(-W/2,-90);}FX.view(SOX,SOY,ZM);
   {const use3=typeof BG3D!=='undefined'&&!BG3D.failed&&BG3D.ready();const off=!use3&&this.me&&this.foe?((this.me.x+this.foe.x)/2-128)*0.1:0;g.save();if(!use3){g.translate(W/2,0);g.scale(1.06,1);g.translate(-W/2-off,0);}this.drawStage(t);this.drawCrowd(t);g.restore();}
   for(const w of this.walls){const fade=w.life-w.t<0.6?(Math.floor(t*12)%2?0.35:0.9):1,a=fade*(0.55+0.25*Math.sin(t*8))+(w.flash||0)*2;const top=GYF-60;g.globalAlpha=Math.min(1,a*0.35);R(w.x-6,top,12,60,'#29ADFF');g.globalAlpha=Math.min(1,a);
     for(let row=0;row<10;row++){const y=top+row*6,off=row%2?3:0;for(let c=-1;c<=1;c++){const cx=w.x+c*6+off-3,cy=y+3;if(cx<w.x-7||cx>w.x+7)continue;PX(cx-1,cy-3,12);PX(cx+1,cy-3,12);PX(cx-2,cy-1,12);PX(cx+2,cy-1,12);PX(cx-2,cy+1,12);PX(cx+2,cy+1,12);PX(cx-1,cy+3,12);PX(cx+1,cy+3,12);}}
     R(w.x-7,top,1,60,7);R(w.x+6,top,1,60,7);const sy=top+((t*60)%60);R(w.x-6,sy,12,1,7);g.globalAlpha=1;FX.glowAt(w.x,top+30,26,'90,200,255',0.35+(w.flash||0)*2);}
   for(const q of this.decoys||[]){FX.glitchClone(q.x,q.y,t);const k=1-q.t/q.life;const d={C:q.C,look:q.C.look,st:'idle',t:0,face:q.face,x:q.x+(Math.random()<0.1?Math.round((Math.random()-0.5)*4):0),y:q.y,alpha:0.5*Math.min(1,k*3),cd:[0,0]};this.drawF(d,t);for(let yy=GYF-56;yy<GYF;yy+=3)R(q.x-12,yy,24,1,'rgba(120,200,255,'+(0.25*k)+')');}
   for(const f of [this.me,this.foe]){g.globalAlpha=0.3*f.alpha;R(f.x-12,GYF+1,24,3,0);g.globalAlpha=1;}
   this.fatBack(t);this.drawF(this.me,t);this.fatFront(t);for(const p of this.projs){this.drawP(p,t);const gc={me:'90,190,255',super:'90,190,255',kpi:'120,255,160',kpiBig:'120,255,160',ticket:'255,210,90',reboot:'80,140,255',bot:'255,120,120',card:'255,90,200',coin:'255,215,90',bill:'120,255,140',prompt:'120,255,160',agent:'180,140,255',doc:'255,255,255',form:'255,255,220',wave:'255,190,60'}[p.kind]||'255,255,255';if(!['me','super','doc','form','wave','kpi','kpiBig','ticket','reboot','bot','card','coin','prompt','bill','agent','wallet','moth','riff','skull'].includes(p.kind))FX.glowAt(p.x,p.y,p.r*(p.kind==='kpiBig'?4:3),gc,0.7);}
   for(const f of [this.me,this.foe]){if(f.st==='sp'&&f.spk==='vision'&&f.t<0.55)FX.glowAt(f.x+f.face*3,f.y-49+(f.look.h||0),4+f.t*22,'255,60,110',0.75);if(f.st==='whirl')FX.whirl(f,t);if(f.st==='fkick')FX.fkick(f,t);if(f.st==='counter')FX.aud(f.x,f.y-30,t);if(f.st==='frozen')FX.ice(f.x,f.y,t);}
   {const ag=this.projs.filter(p=>p.kind==='agent').map(p=>[p.x,p.y]);if(ag.length>1)FX.links(ag);}
   if(this.beam&&this.beam.multi!==undefined){const fb=this.beam.f;FX.arrowsUp(fb.face>0?fb.x:0,fb.face>0?W:fb.x,fb.y-41);}
   for(const f of [this.me,this.foe]){if(f.st==='whirl')FX.glowAt(f.x,f.y-28,38,'255,170,60',0.4);if(f.st==='charge'){const CC={seba:['91,209,42','note'],alvaro:['80,190,255','paper'],samir:['255,80,110','docx'],andres:['90,230,130','check'],jl:['120,255,170','kpi'],jean:['255,210,80','bits'],coni:['255,110,200','card'],brandan:['255,190,70','coin'],fran:['185,156,255','code']}[f.C.id]||['80,190,255','paper'];const k=Math.min(1,f.t/CHG),hx=f.x+f.face*14,hy=f.y-27+(f.look.h||0);FX.charge(hx,hy,f.x,f.y+1,t,k,CC[0],CC[1]);if(f.full&&!f._fullFx){f._fullFx=true;FX.chargeFull(hx,hy,CC[0]);}}else f._fullFx=false;if(f.st==='super')FX.glowAt(f.x,f.y-30,40,'255,255,255',0.35);}
   if(this.beam&&(this.beam.t<0.45||this.beam.multi!==undefined)){const b=this.beam,fb=b.f,e=b.end??(fb.face>0?W:0),x0=fb.face>0?fb.x+14:e,x1=fb.face>0?e:fb.x-14;if(b.touch){FX.glowAt(e,b.thick?fb.y-41:fb.y-46,b.thick?22:14,'255,140,180',0.85);if((b._sp=(b._sp||0)+1)%5===0)FX.hit(e,b.thick?fb.y-41:fb.y-46,1,2);}FX.glowAt(fb.face>0?x0:x1,b.thick?fb.y-41:fb.y-46,b.thick?18:10,'255,90,140',0.8);FX.beamAt(x0,x1,b.thick?fb.y-41:fb.y-46,(b.thick?16:6)*(b.multi!==undefined?1:Math.max(0.25,Math.sin(Math.min(1,b.t/0.45)*Math.PI))),'255,40,90',b.t);FX.beamFx(x0,x1,b.thick?fb.y-41:fb.y-46,b.thick,b.t);}
   if(this.beam&&(this.beam.t<0.45||this.beam.multi!==undefined)&&typeof FX==='undefined'){const f=this.beam.f,e=this.beam.end??(f.face>0?W:0),x0=f.face>0?f.x+14:e,x1=f.face>0?e:f.x-14;R(x0,f.y-(this.beam.thick?43:47),x1-x0,this.beam.thick?4:2,7);}
   for(const p of this.parts){g.globalAlpha=1-p.t/p.life;R(p.x-1,p.y-1,2,2,p.c);}g.globalAlpha=1;
   for(const e of this.fx){const r=(2+e.t*40)*(e.big?1.7:1),n=e.big?12:8;for(let k=0;k<n;k++){const a=k*Math.PI*2/n;PX(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,e.c);PX(e.x+Math.cos(a)*r*0.6,e.y+Math.sin(a)*r*0.6,7);if(e.big)PX(e.x+Math.cos(a)*r*0.8,e.y+Math.sin(a)*r*0.8,10);}if(e.big&&e.t<0.08)disc(e.x,e.y,6-e.t*50,7);}
   g.restore();
   this.fatHud(t);
   if(this.fb8){this.fb8.k+=1/60;if(this.fb8.k<0.8)TC(this.fb8.t,this.fb8.y-64,10,1,0,clamp(this.fb8.x,30,W-30));else this.fb8=null;}
   if(this.blueFx>0){R(0,47,W,97,`rgba(30,90,208,${this.blueFx})`);}
   if(this.superFx){const sf=this.superFx,k=Math.min(1,sf.t/0.15);g.fillStyle="rgba(0,0,0,0.6)";g.fillRect(0,47,W,97);for(let i=0;i<6;i++)R(0,60+i*12,W,2,sf.f===this.me?"rgba(41,173,255,0.4)":"rgba(255,0,77,0.4)");const left=sf.f===this.me;this.portrait(sf.f.C,left?Math.round(-100+k*104):Math.round(W+4-k*108),50,100,80,2,left?1:-1,36);TC("¡SÚPER!",62,10,2,0,left?180:76);TC(sf.n,84,7,1,0,left?180:76);}
   if(this.koFlash>0){this.koFlash-=1/60;R(0,0,W,H,`rgba(255,255,255,${Math.max(0,this.koFlash*5)})`);}
   R(0,13,W,34,"rgba(11,16,32,0.92)");R(0,46,W,1,12);const me=this.me,fo=this.foe;
   T(me.C.n,4,16,7);R(4,25,106,8,0);R(5,26,104,6,8);R(5,26,Math.round(104*Math.max(0,me.hp)/me.max),6,10);
   T(fo.C.n,W-4-TW(fo.C.n),16,7);R(W-110,25,106,8,0);R(W-109,26,104,6,8);const fw=Math.round(104*Math.max(0,fo.hp)/fo.max);R(W-5-fw,26,fw,6,10);
   TC(String(Math.ceil(this.timer)).padStart(2,'0'),16,this.timer<10?8:10,2,0);
   for(const [f,x] of [[me,4],[fo,W-110]]){const v=f.sta/STA.max,c=f.broken?(Math.floor(t*8)%2?8:2):(v>0.5?11:(v>0.25?10:8));R(x,34,106,3,0);R(x+1,34,104,2,f.broken?(Math.floor(t*8)%2?8:2):1);const w=Math.round(104*v);R(f===me?x+1:x+105-w,34,w,2,f.denied>0&&Math.floor(t*16)%2?7:c);if(f.denied>0)f.denied-=1/60;}
   for(const [f,left] of [[me,true],[fo,false]]){const full=f.sup>=100,bx=left?36:W-96,c=full?(Math.floor(t*10)%2?10:9):13;T("SÚPER",left?4:W-4-TW("SÚPER"),38,full?10:6);R(bx,39,60,5,0);const w=Math.round(58*Math.min(100,f.sup||0)/100);R(left?bx+1:bx+59-w,40,w,3,c);}
   T("C",100,38,me.cd[0]<=0?12:5);T("V",108,38,me.cd[1]<=0?9:5);
   const rtxt=this.rw&&this.rw[0]===1&&this.rw[1]===1?"FINAL":"R"+(this.round||1);TC(rtxt,38,7,1,null,142);
   for(let k=0;k<2;k++){disc(4+TW(me.C.n)+7+k*8,19,3,0);disc(4+TW(me.C.n)+7+k*8,19,2,this.rw&&this.rw[0]>k?10:1);disc(W-4-TW(fo.C.n)-7-k*8,19,3,0);disc(W-4-TW(fo.C.n)-7-k*8,19,2,this.rw&&this.rw[1]>k?10:1);}
   for(const f of [me,fo])if(f.combo>1&&f.comboT>0){const nm=COMBO_N.find(q=>f.combo>=q[0]);const s=f.combo+" GOLPES"+(nm?" "+nm[1]:"");R(f===me?2:W-6-TW(s),64,TW(s)+4,10,"rgba(0,0,0,0.65)");T(s,f===me?4:W-4-TW(s),66,nm?(f===me?9:8):(f===me?10:8));}
   if(this.sub==='intro'){const r1=(this.round||1)===1;
     if(r1&&this.pt<2.3){const b=(f,txt,x)=>{const w=TW(txt)+8,bx=clamp(x-w/2,2,W-w-2),by=Math.max(49,f.y-78+(f.look.h||0));R(bx,by,w,11,7);BOXL(bx,by,w,11,5);R(clamp(x-2,bx+2,bx+w-6),by+11,4,3,7);T(txt,bx+4,by+2,0);};if(this.pt<1.2)b(me,INTRO_TXT[me.C.id],me.x);else b(fo,INTRO_TXT[fo.C.id],fo.x);const sn=STAGE_N[this.stageId()];R(128-TW(sn)/2-4,130,TW(sn)+8,11,"rgba(0,0,0,0.7)");TC(sn,132,10,1,0);}
     else{R(30,58,196,28,0);BOXL(30,58,196,28,10);const tt=r1?this.pt-2.3:this.pt;if(tt<(r1?0.4:1.2))TC(r1?"ROUND 1":(this.rw[0]===1&&this.rw[1]===1?"ROUND FINAL":"ROUND "+this.round),65,10,2);else TC("¡A PELEAR!",65,10,2);}}
   if(this.sub==='ko'&&this.pt>0.3&&(this.pt>1.8||Math.floor(this.pt*6)%2))TC("K.O.",56,8,3,0);
   if(this.sub==='time')TC("¡TIEMPO!",60,10,2,0);
   if(TOUCHUI)this.drawTouch(t);
   if(this.ph==='quote'){this.drawVictory(t);return;}
   hud(this.name+" · "+Math.min(this.stage+1,this.ladder.length)+"/"+this.ladder.length,String(this.score).padStart(5,'0'));},
 drawSelect(t){R(0,0,W,H,"#0B1020");for(let y=13;y<H;y+=8)R(0,y,W,1,"#101838");for(let x=0;x<W;x+=8)R(x,13,1,H,"#0E1530");
   TC("ELIGE TU LUCHADOR",15,10);
   const C=this.sel<DMC.length?DMC[this.sel]:null;
   // panel de vista previa
   R(6,25,102,106,"#141C36");BOXL(6,25,102,106,1);R(7,26,100,62,"#1B2440");
   if(C){this.portrait(C,7,26,100,62,2,1,39);R(7,88,100,1,1);TC(C.n,91,10,1,null,57);TC(C.role,100,6,1,null,57);
     const st=[["VIDA",(C.hp-90)/30],["VEL.",(C.spd-50)/40],["FZA.",(C.dmul-0.95)/0.25]];st.forEach(([n,v],k)=>{const x=10+k*33;T(n,x,111,6);for(let b=0;b<5;b++)R(x+b*6,120,5,3,b<Math.round(1+clamp(v,0,1)*4)?[11,12,8][k]:1);});}
   else{TC("?",42,10,4,null,57);TC("ALEATORIO",91,10,1,null,57);TC("SORPRÉNDEME",100,6,1,null,57);}
   // grilla
   for(let i=0;i<=DMC.length;i++){const [x,y]=this.cell(i),on=i===this.sel;R(x-1,y-1,28,32,on?(Math.floor(t*6)%2?10:9):"#0B1020");R(x,y,26,30,on?(Math.floor(t*6)%2?10:9):1);R(x+1,y+1,24,28,on?"#2A3558":"#1B2440");
     if(i<DMC.length)this.portrait(DMC[i],x+1,y+1,24,28,2,1,47);else TC("?",y+8,10,2,null,x+13);if(on){R(x+1,y+22,13,7,0);T("1P",x+2,y+22,10);}}
   if(C){T("C:",116,97,6);T(C.sn[0],130,97,12);T("V:",116,107,6);T(C.sn[1],130,107,9);}
   else{T("PERSONAJE AL AZAR",116,97,6);}
   btn('pick',186,114,66,15,"ELEGIR ▶",3);
   R(0,133,W,11,"#0B1020");TC(TOUCHUI?"TOCA UN LUCHADOR Y LUEGO ELEGIR":"← → ↑ ↓ MOVER  ·  ENTER ELEGIR",135,6);
   hud(this.name,"");},
 drawVS(t){const a=this.me0,b=this.ladder[this.stage],k=Math.min(1,this.pt/0.4);R(0,0,W,H,"#0B1020");
   g.fillStyle="#1D2B53";g.beginPath();g.moveTo(0,13);g.lineTo(150,13);g.lineTo(106,H);g.lineTo(0,H);g.fill();g.fillStyle="#53101D";g.beginPath();g.moveTo(150,13);g.lineTo(W,13);g.lineTo(W,H);g.lineTo(106,H);g.fill();
   this.portrait(a,Math.round(-100+k*106),20,100,94,2,1,36);this.portrait(b,Math.round(W+4-k*108),20,100,94,2,-1,36);
   TC("VS",58,10,3,0);T(a.n,6,118,7);T(a.role,6,128,6);T(b.n,W-6-TW(b.n),118,7);T(b.role,W-6-TW(b.role),128,6);
   hud(this.name,"RIVAL "+(this.stage+1)+"/"+this.ladder.length);}
};

// ======================= FATALITIES (DeathMatch) =======================
const FAT_WIN=3.5,FAT_N=5,FAT_BEAT=0.5,FAT_FALL=0.9,FAT_OK=0.14,FAT_LEAD=1.3,FAT_FIN=2.4,FAT_BAN=1.9;
const FLANES=[{k:'ArrowLeft',a:'←',c:12},{k:'ArrowDown',a:'↓',c:8},{k:'ArrowUp',a:'↑',c:9},{k:'ArrowRight',a:'→',c:11}];
const bloodC=()=>save.blood?pick(["#C8102E","#8A0010","#FF2040","#B00020"]):pick([10,12,14,11,9,7]);
function skeleton(x,y,a=1,fallen=0){g.globalAlpha=a;const W_="#F2EDE0";if(fallen>0){const k=Math.min(1,fallen);for(let i=0;i<9;i++)R(x-16+i*4,y-3-((i*7)%5)*k,4,2,W_);R(x+6,y-10*(1-k)-6,9,8,W_);R(x+8,y-10*(1-k)-3,2,2,0);R(x+11,y-10*(1-k)-3,2,2,0);g.globalAlpha=1;return;}
  R(x-5,y-54,11,10,W_);R(x-3,y-50,3,3,0);R(x+2,y-50,3,3,0);R(x-2,y-46,5,1,0);R(x-1,y-44,2,24,W_);for(let i=0;i<4;i++)R(x-6,y-40+i*4,13,1,W_);R(x-6,y-22,13,3,W_);R(x-5,y-20,2,20,W_);R(x+3,y-20,2,20,W_);R(x-8,y-42,2,16,W_);R(x+7,y-42,2,16,W_);g.globalAlpha=1;}
const FATS={
 alvaro:{n:'SENTENCIA EJECUTORIADA',hit(L,v,s){L.blood(v.x,v.y-44,4);tone('square',220+s*40,AT(),0.08,0.08);},
  back(L,v,s,t,fin,ft){if(fin&&ft>0.15){L.flat(v,0.12);}else L.drawF(v,t);},
  front(L,v,s,t,fin,ft){const up=fin?Math.max(0,1-ft/0.15):1,gy=(v.y-64-s*7)*up+(v.y-12)*(1-up);const gx=v.x-4;R(gx-3,gy-10,6,-30,"#8B5A2B");R(gx-14,gy-10,28,14,"#6B3A1E");R(gx-14,gy-10,28,3,"#8B5A2B");R(gx-15,gy-6,2,6,GOLD);R(gx+13,gy-6,2,6,GOLD);
   if(!fin&&s>0)TC("¡ORDEN!",gy-26,10,1,0,clamp(v.x,30,W-30));
   if(fin&&ft>0.3){g.save();g.translate(v.x,v.y-26);g.rotate(-0.15);g.globalAlpha=Math.min(1,(ft-0.3)*4);R(-38,-10,76,20,save.blood?"#C8102E":12);R(-36,-8,72,16,"rgba(0,0,0,0.15)");TC("HA LUGAR",-5,7,2,null,0);g.restore();g.globalAlpha=1;}},
  fin(L,v){setTimeout(()=>{},0);L.blood(v.x,v.y-6,50,true);L.puddle(v.x,46);L.shake=0.4;const t=AT();tone('sine',60,t+0.12,0.5,0.9,null,30);noise(t+0.12,0.4,0.5,'lowpass',500);}},
 samir:{n:'FIRMA Y DESPACHO',hit(L,v,s){L.blood(v.x+(s-2.5)*4,v.y-34,5);noise(AT(),0.12,0.12,'highpass',3000);},
  back(L,v,s,t,fin,ft){if(!fin||ft<0.5)L.drawF(v,t);const n=fin?4:s;g.strokeStyle=save.blood?"#C8102E":"#1D2B53";g.lineWidth=2;g.beginPath();for(let i=0;i<=n*4;i++){const x=v.x-12+i*1.6,y=v.y-38+Math.sin(i*1.9)*5;if(i===0)g.moveTo(x,y);else g.lineTo(x,y);}g.stroke();g.lineWidth=1;
   if(fin){const k=Math.min(1,ft/0.5),fly=Math.max(0,ft-1.1),ex=v.x+fly*fly*160,ey=v.y-30-fly*60;if(ft<0.5){R(v.x-22,v.y-110+k*60,44,30,7);}else{R(ex-22,ey-20,44,30,7);BOXL(ex-22,ey-20,44,30,5);LN(ex-22,ey-20,ex,ey-4,5);LN(ex+22,ey-20,ex,ey-4,5);R(ex+8,ey-16,10,8,save.blood?8:12);TC("CERTIFICADO",ey+2,save.blood?8:1,1,null,ex);if(fly>0&&RND()<0.5)L.parts.push({x:ex-18,y:ey+10,vx:-20,vy:40,t:0,life:0.6,c:bloodC(),grav:true});}}},
  front(L,v,s,t,fin,ft){if(!fin){const px=v.x-12+s*6.4,py=v.y-38+Math.sin(s*4*1.9)*5;g.save();g.translate(px,py);g.rotate(-0.8);R(-2,-40,5,40,0);R(-2,-40,5,4,GOLD);R(-1,0,3,4,GOLD);g.restore();}},
  fin(L,v){const t=AT();noise(t,0.3,0.2,'lowpass',800);tone('square',300,t+0.5,0.2,0.08);tone('square',400,t+0.7,0.2,0.08);noise(t+1.1,0.8,0.2,'bandpass',1500);}},
 andres:{n:'DESVINCULACIÓN',hit(L,v,s){tone('sine',180-s*20,AT(),0.2,0.2);L.shake=0.08;},
  back(L,v,s,t,fin,ft){const slam=fin&&ft>0.12;if(slam)L.flat(v,0.1);else{const tr=s*0.6;v.x+=Math.sin(t*40)*tr*0.2;L.drawF(v,t);}},
  front(L,v,s,t,fin,ft){const ly=fin?lerp(v.y-60-4*12,v.y-12,Math.min(1,ft/0.12)):v.y-110+s*12;g.globalAlpha=0.3;R(v.x-26,v.y-2,52,3,0);g.globalAlpha=1;R(v.x-30,ly-40,60,40,7);BOXL(v.x-30,ly-40,60,40,5);R(v.x-26,ly-36,20,3,1);for(let i=0;i<3;i++)R(v.x-26,ly-12+i*4,40-i*8,1,5);TC("DESPEDIDO",ly-28,8,1,null,v.x);
   if(fin&&ft>0.3)TC("¡DESPEDIDO!",60,8,2,0);},
  fin(L,v){L.blood(v.x-30,v.y-4,25,true);L.blood(v.x+30,v.y-4,25,true);L.puddle(v.x,56);L.shake=0.4;const t=AT();tone('sine',55,t+0.1,0.5,0.9,null,30);noise(t+0.1,0.3,0.4,'lowpass',400);}},
 jl:{n:'VISIÓN 2030',hit(L,v,s){L.beamFx=0.15;L.blood(v.x,v.y-40,3);tone('sawtooth',900,AT(),0.12,0.05,null,1300);},
  back(L,v,s,t,fin,ft){const k=fin?1:s/5;if(!fin||ft<0.7){g.globalAlpha=Math.max(0,1-k*0.8);L.drawF(v,t);g.globalAlpha=1;skeleton(v.x,v.y,Math.min(1,k*1.1));}else{skeleton(v.x,v.y,1,ft>1.4?(ft-1.4)*3:0);}
   if(fin&&ft>0.7)for(let i=0;i<3;i++)disc(v.x+Math.sin(t*3+i)*6,v.y-60-((t*20+i*10)%30),3,"rgba(160,160,160,0.6)");},
  front(L,v,s,t,fin,ft){const k=L.me,on=(L.beamFx>0)||(fin&&ft<0.7);if(on){const y=k.y-50;R(Math.min(k.x,v.x),y-(fin?4:1),Math.abs(v.x-k.x),fin?8:3,"rgba(255,0,77,0.7)");R(Math.min(k.x,v.x),y,Math.abs(v.x-k.x),1,7);}},
  fin(L,v){const t=AT();tone('sawtooth',700,t,0.7,0.07,null,1400);noise(t,0.7,0.15,'highpass',2500);L.blood(v.x,v.y-30,30,true);}},
 jean:{n:'PANTALLAZO AZUL',hit(L,v,s){L.blood(v.x,v.y-40,3);tone('square',180+s*30,AT(),0.12,0.06);},
  back(L,v,s,t,fin,ft){if(fin&&ft>0.25)return;L.drawF(v,t);R(v.x-26,v.y-70,52,72,"rgba(30,90,208,0.35)");L.pixelate(v.x-26,v.y-70,52,72,fin?11:1+s*2);},
  front(L,v,s,t,fin,ft){R(v.x+12,v.y-70,16,11,"#1E5AD0");T(":(",v.x+14,v.y-68,7);if(!fin)TC("ERROR "+(s*25)+"%",v.y-72,12,1,0,clamp(v.x-20,30,W-30));},
  fin(L,v){for(let i=0;i<60;i++)L.parts.push({x:v.x-20+RND()*40,y:v.y-60+RND()*60,vx:(RND()-0.5)*80,vy:-RND()*80,t:0,life:0.9,c:i%3===0?bloodC():pick(["#1E5AD0",12,7,v.look.top]),grav:true});L.puddle(v.x,40);const t=AT();tone('square',400,t,0.5,0.08,null,60);noise(t,0.5,0.2,'bandpass',1000);}},
 coni:{n:'BUCLE INFINITO',hit(L,v,s){L.blood(v.x,v.y-30,4);blip(84+s,AT(),0.08);},
  back(L,v,s,t,fin,ft){if(!fin||ft<0.2){L.drawF(v,t);}else if(ft<1.5){for(let i=0;i<8;i++)disc(v.x+Math.cos(t*9+i)*14,v.y-24+Math.sin(t*11+i)*12,8,"#B8B8C8");for(let i=0;i<5;i++)T("*",v.x-16+RND()*30,v.y-44+RND()*30,pick([10,8,7]));if(RND()<0.4)L.blood(v.x,v.y-20,2);}
   else{R(v.x-16,v.y-6,32,6,save.blood?"#8A0010":14);disc(v.x,v.y-6,8,save.blood?"#C8102E":12);}},
  front(L,v,s,t,fin,ft){const n=fin?(ft<1.5?0:6):s*2;for(let i=0;i<n;i++){const side=i%2?1:-1,hop=Math.abs(Math.sin(t*10+i))*6,x=v.x+side*(10+Math.floor(i/2)*9),y=v.y-6-hop;R(x-4,y-8,8,7,6);R(x-2,y-6,1,2,8);R(x+1,y-6,1,2,8);R(x-3,y-1,2,3,5);R(x+1,y-1,2,3,5);if(Math.floor(t*12+i)%2)R(x-side*6,y-5,4,2,14);}
   TC(fin&&ft>1.5?"BUCLE INFINITO":"WHILE(TRUE){ GOLPE(); }",v.y-72,11,1,0,clamp(v.x,70,W-70));},
  fin(L,v){const t=AT();for(let i=0;i<10;i++)noise(t+i*0.12,0.08,0.2,'lowpass',900);}},
 seba:{n:'REEMBOLSO RECHAZADO',hit(L,v,s){tone('sine',520+s*60,AT(),0.08,0.06);},
  back(L,v,s,t,fin,ft){if(fin&&ft>=0.3){g.save();g.translate(v.x,v.y);g.scale(1.25,0.22);g.translate(-v.x,-v.y);L.drawF(v,t);g.restore();}else L.drawF(v,t);},
  front(L,v,s,t,fin,ft){},fin(L,v){}},
 fran:{n:'DEPRECADO',hit(L,v,s){L.blood(v.x,v.y-40,3);tone('square',700+s*120,AT(),0.08,0.06);FX.hit(v.x+(Math.random()-0.5)*16,v.y-40,2,1);},
  back(L,v,s,t,fin,ft){if(fin&&ft>0.35)return;L.drawF(v,t);const k=fin?1:s/5;for(let yy=v.y-56;yy<v.y;yy+=2)if(Math.random()<k*0.6)R(v.x-12+Math.round((Math.random()-0.5)*6*k),yy,24,1,'rgba(51,255,136,'+(0.5*k)+')');},
  front(L,v,s,t,fin,ft){const n=fin?(ft<0.35?5:0):s;for(let i=0;i<n;i++){const a=t*3+i*1.26,x=v.x+Math.cos(a)*22,y=v.y-40+Math.sin(a)*10;disc(x,y,4,'#8A5CFF');R(x-1,y-1,3,2,7);R(x-6,y-5,12,1,6);if(!fin&&Math.floor(t*10+i)%3===0)LN(x,y,v.x,v.y-36,'#B99CFF');}if(fin&&ft>0.4)TC('DEPRECADO',60,8,2,0);},
  fin(L,v){for(let i=0;i<70;i++)L.parts.push({x:v.x-12+Math.random()*24,y:v.y-56+Math.random()*56,vx:(Math.random()-0.5)*30,vy:20+Math.random()*60,t:0,life:1.2,c:i%3===0?bloodC():'#33FF88',grav:true});L.puddle(v.x,40);const t=AT();for(let i=0;i<6;i++)tone('square',1200-i*150,t+i*0.06,0.08,0.05);}},
 brandan:{n:'LIQUIDACIÓN',hit(L,v,s){for(let i=0;i<3;i++)L.parts.push({x:v.x+(RND()-0.5)*30,y:v.y-10,vx:(RND()-0.5)*60,vy:-80-RND()*60,t:0,life:0.8,c:"#5FB85F",grav:true,bill:true});blip(88,AT(),0.07);},
  back(L,v,s,t,fin,ft){const sink=fin?Math.min(60,ft*50):0;g.save();g.beginPath();g.rect(0,0,W,v.y-Math.min(24,s*6)+(fin?0:0));g.clip();g.translate(0,sink);if(fin)g.translate(Math.sin(t*50)*2,0);L.drawF(v,t);g.restore();},
  front(L,v,s,t,fin,ft){const h=fin?24:Math.min(24,s*6);R(v.x-24,v.y-h,48,h,5);R(v.x-24,v.y-h,48,3,6);for(let i=0;i<6;i++)R(v.x-20+i*7,v.y-h+1,3,2,Math.floor(t*20+i)%2?0:13);T("$",v.x-3,v.y-h+8,11);
   if(fin&&ft>0.2&&ft<1.8&&RND()<0.7)L.parts.push({x:v.x+22,y:v.y-12,vx:60+RND()*80,vy:-60-RND()*90,t:0,life:1,c:save.blood?"#C8102E":"#5FB85F",grav:true,bill:true});
   if(fin&&ft>1.0)TC("¡LIQUIDADO, CHE!",60,10,1,0,clamp(v.x,60,W-60));},
  fin(L,v){const t=AT();for(let i=0;i<14;i++)noise(t+i*0.1,0.09,0.15,'bandpass',600+i*40);tone('sawtooth',120,t,1.4,0.05,null,60);}}
};
Object.assign(L8,{
 blood(x,y,n,big){for(let i=0;i<n;i++){const a=big?-Math.PI*RND():(-Math.PI/2+(RND()-0.5)*2),v=(big?80:40)+RND()*(big?160:80);this.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:0.6+RND()*0.6,c:bloodC(),grav:true});}},
 puddle(x,w){this.puddles.push({x,w,t:0});},
 flat(v,k){g.save();g.translate(v.x,v.y);g.scale(1.5,k);g.translate(-v.x,-v.y);this.drawF(v,0);g.restore();},
 pixelate(x,y,w,h,b){if(b<=1)return;x=Math.max(0,Math.round(x));y=Math.max(0,Math.round(y));w=Math.min(W-x,w);h=Math.min(H-y,h);if(w<=0||h<=0)return;let img;try{img=g.getImageData(x*(cv.width/W),y*(cv.height/H),w*(cv.width/W),h*(cv.height/H));}catch(e){return;}if(!img||!img.data)return;
   const sx=cv.width/W,d=img.data,iw=img.width;for(let by=0;by<h;by+=b)for(let bx=0;bx<w;bx+=b){const px=Math.min(iw-1,Math.floor((bx+b/2)*sx)),py=Math.min(img.height-1,Math.floor((by+b/2)*sx)),i=(py*iw+px)*4;g.fillStyle=`rgb(${d[i]},${d[i+1]},${d[i+2]})`;g.fillRect(x+bx,y+by,b,b);}},
 ko(a,d,dir,t){if(a===this.me&&d===this.foe&&this.ph==='fight'&&this.rw&&this.rw[0]===1){d.hp=0;d.st='dizzy';d.t=0;d.vx=0;d.vy=0;d.y=GYF;d.dizzy=true;this.sub='finish';this.fin={t:0};this.pt=0;this.beam=null;this.projs=[];this.koFlash=0.12;S.bell(0.3);noise(t,1.0,0.2,'bandpass',1100);
     this.me.st='idle';this.me.t=0;this.me.vx=0;this.me.y=GYF;{const dir=d.x>=this.me.x?1:-1;let vx=clamp(this.me.x+dir*54,30,W-30);if(Math.abs(vx-this.me.x)<50)this.me.x=clamp(vx-dir*54,30,W-30);d.x=vx;this.me.face=dir;d.face=-dir;}this.botF=0.4+RND()*1.2;const tt=AT();tone('sawtooth',98,tt+0.3,0.5,0.1,null,90);tone('sawtooth',87,tt+0.8,0.7,0.1,null,70);return;}
   this.koFall(a,d,dir,t);},
 koFall(a,d,dir,t){d.hp=0;d.st='ko';d.t=0;d.vx=dir*150;d.vy=-230;d.y-=1;d.bounced=false;d.land=false;d.dizzy=false;this.sub='ko';this.pt=0;this.beam=null;this.koFlash=0.15;S.bell(0.3);noise(t,1.2,0.25,'bandpass',1100);},
 startFat(){if(this.sub!=='finish')return;this.sub='fatal';const notes=[];let last=-1;for(let i=0;i<FAT_N;i++){let l;do{l=Math.floor(RND()*4);}while(l===last&&RND()<0.7);last=l;notes.push({lane:l,time:FAT_LEAD+i*FAT_BEAT,hit:false});}
   this.fat={t:0,notes,stage:0,fin:false,ft:0,fail:false,failT:0,judge:null,miss:0,def:FATS[this.me0.id]};this.fatTries=(this.fatTries||0)+1;this.puddles=this.puddles||[];const t=AT();tone('sine',80,t,0.4,0.5,null,40);},
 fatKey(l){const f=this.fat;if(!f||f.fin||f.fail)return;const n=f.notes.find(n=>!n.hit&&Math.abs(n.time-f.t)<=FAT_OK*2);if(!n)return;
   if(n.lane===l&&Math.abs(n.time-f.t)<=FAT_OK){n.hit=true;f.stage++;f.judge={t:Math.abs(n.time-f.t)<0.06?'¡PERFECTO!':'¡BIEN!',k:0};const t=AT();noise(t,0.12,0.25,'bandpass',700);tone('sine',140,t,0.12,0.6,null,60);f.def.hit(this,this.foe,f.stage);
     this.fatCheckEnd();}
   else this.fatMiss(n);},
 fatMiss(n){const f=this.fat;n.hit=true;n.missed=true;f.miss++;if(f.miss>=2){this.fatFail();return;}f.judge={t:'¡UPS! UNA MÁS Y FALLAS',k:0};tone('square',150,AT(),0.15,0.08);this.fatCheckEnd();},
 fatCheckEnd(){const f=this.fat;if(!f.fin&&!f.fail&&f.notes.every(n=>n.hit)){f.fin=true;f.ft=0;f.def.fin(this,this.foe);}},
 fatSkip(){const f=this.fat;if(f&&f.fin&&f.ft>0.8)f.ft=Math.max(f.ft,FAT_FIN+FAT_BAN-0.4);},
 fatFail(){const f=this.fat;f.fail=true;f.failT=0;S.lose();},
 fatUpdate(dt){const f=this.fat;f.t+=dt;this.foe.t+=dt;if(this.beamFx>0)this.beamFx-=dt;for(const p of this.puddles)p.t+=dt;
   if(Math.floor((f.t-FAT_LEAD)/FAT_BEAT)!==Math.floor((f.t-dt-FAT_LEAD)/FAT_BEAT)&&!f.fin){const t=AT();tone('sine',62,t,0.12,0.7,null,40);tone('sine',55,t+0.14,0.1,0.5,null,38);}
   if(BOT&&!f.fin&&!f.fail){const n=f.notes.find(n=>!n.hit);if(n&&f.t>=n.time+(this.botJit||0)){this.fatKey(n.lane);}}
   if(f.fail){f.failT+=dt;if(f.failT>1.1){this.fat=null;this.koFall(this.me,this.foe,1,AT());}return;}
   if(!f.fin){const n=f.notes.find(n=>!n.hit);if(n&&f.t>n.time+FAT_OK)this.fatMiss(n);return;}
   f.ft+=dt;if(Math.abs(f.ft-FAT_FIN)<dt){const t=AT();[45,43,41,38].forEach((m,i)=>tone('sawtooth',hz(m),t+i*0.22,0.3,0.12,null,null,{lp:900,dist:true}));}
   if(f.ft>FAT_FIN+FAT_BAN){if(this.rw)this.rw[0]=2;this.fatEnd={def:f.def,stage:f.stage};this.fatN=(this.fatN||0)+1;this.score+=1500;this.fat=null;this.wins++;this.score+=this.me.hp*5+Math.round(this.timer)*10+300;this.ph='quote';this.pt=0;musicStop();S.win();}},
 fatBack(t){const f=this.fat,v=this.foe;for(const p of this.puddles){const w=Math.min(p.w,p.t*60);if(save.blood){R(p.x-w/2,GYF-1,w,3,"#8A0010");R(p.x-w/2+3,GYF-1,w-6,1,"#C8102E");}else for(let i=0;i<w;i+=3)R(p.x-w/2+i,GYF-1,2,2,[10,12,14,11][i%4]);}
   if(!f){if(this.fatEnd){this.fatEnd.def.back(this,v,FAT_N,t,true,FAT_FIN+FAT_BAN+1);return;}this.drawF(v,t);return;}f.def.back(this,v,f.stage,t,f.fin,f.ft);},
 fatFront(t){const f=this.fat;if(!f){if(this.fatEnd)this.fatEnd.def.front(this,this.foe,FAT_N,t,true,FAT_FIN+FAT_BAN+1);return;}f.def.front(this,this.foe,f.stage,t,f.fin,f.ft);},
 fatHud(t){if(this.sub==='finish'){const left=Math.max(0,FAT_WIN-this.fin.t);if(Math.floor(t*6)%2)TC("¡ACÁBALO!",54,8,2,0);R(78,74,100,5,0);R(79,75,Math.round(98*left/FAT_WIN),3,left<1.3?8:10);
     const lab=TOUCHUI?"TOCA: FATALITY":"APRIETA F: FATALITY";R(60,108,136,16,Math.floor(t*4)%2?2:0);BOXL(60,108,136,16,8);TC(lab,112,7,1,0);return;}
   const f=this.fat;if(!f)return;
   if(!f.fin){g.fillStyle="rgba(0,0,0,0.35)";g.fillRect(0,47,W,97);const lx=196,hitY=116;R(lx-2,50,60,90,"rgba(0,0,0,0.6)");
     FLANES.forEach((ln,i)=>{const x=lx+i*14;R(x,52,12,86,"#140810");T(ln.a,x+3,hitY-3,5);});R(lx-2,hitY-5,60,1,7);
     for(const n of f.notes){if(n.hit)continue;const y=hitY-(n.time-f.t)/FAT_FALL*64;if(y<50||y>146)continue;const x=lx+n.lane*14,c=FLANES[n.lane].c;R(x,y-6,12,10,c);T(FLANES[n.lane].a,x+3,y-4,0);}
     TC(f.t<FAT_LEAD-0.3?"¡PREPARA!":"",60,8,1,0,100);
     if(f.judge){f.judge.k+=1/60;if(f.judge.k<0.6){const jt=f.judge.t;if(jt.length>11)TC(jt,100,8,1,0,96);else T(jt,lx-2,142-8,jt==='¡PERFECTO!'?10:11);}}
     if(f.fail&&Math.floor(t*6)%2)TC("FALLASTE...",60,8,2,0,110);
     if(TOUCHUI){g.globalAlpha=0.7;FLANES.forEach((ln,i)=>{R(2+i*48,122,44,20,0);BOXL(2+i*48,122,44,20,ln.c);TC(ln.a,128,ln.c,1,null,24+i*48);});g.globalAlpha=1;}}
   else if(f.ft>FAT_FIN-0.2){const k=Math.min(1,(f.ft-FAT_FIN+0.2)/0.2);g.fillStyle=`rgba(0,0,0,${0.5*k})`;g.fillRect(0,47,W,97);TC("FATALITY",66,8,3,0);TC(f.def.n,92,7,1,0);}}
});

// ======================= VIDA VISUAL: escenarios, público, poses, pantalla de victoria =======================
const STAGE_N={seba:'OFICINA DE FINANZAS',fran:'SALA DE DESARROLLO',alvaro:'SALA DE AUDIENCIAS',samir:'OFICINA DE LEGAL',andres:'SALA DE RRHH',jl:'DIRECTORIO',jean:'DATACENTER',coni:'LAB. DE AUTOMATIZACIÓN',brandan:'OFICINA DE FINANZAS'};
const INTRO_TXT={seba:'YO PUEDO...',fran:'COMO ES ARRIBA, ES ABAJO.',alvaro:'EL DERECHO ME RESPALDA.',samir:'TENGO OBSERVACIONES.',andres:'QUEDA ANOTADO.',jl:'DALE, CHE, AL LABURO.',jean:'¿YA REINICIASTE?',coni:'SCRIPT LISTO.',brandan:'¡A COBRAR, CHE!'};
const WIN_TXT={seba:'¡PÁGUENME!',fran:'ES MI KAIRÓS.',alvaro:'¡HA LUGAR!',samir:'APROBADO.',andres:'¡DESPEDIDO!',jl:'¡BÁRBARO, CHE!',jean:'PROBLEMA RESUELTO.',coni:'AUTOMATIZADO.',brandan:'¡QUÉ BALANCE!'};
const FIN_PTS=(()=>{const a=[];let v=40;for(let i=0;i<70;i++){v+=Math.sin(i*1.7)*4+Math.cos(i*0.9)*3;a.push(v);}return a;})();
function miniGuy(look,x,y,pose,t,ph){const sk=col(look.skin),bob=pose==='cheer'?-Math.abs(Math.round(Math.sin(t*14+ph)*3)):0;y+=bob;
  R(x-2,y-5,2,5,look.pants);R(x+1,y-5,2,5,look.pants);R(x-3,y-11,7,6,look.top);R(x-2,y-15,5,4,look.skin);if(!look.bald)R(x-2,y-15,5,1,look.hair);if(look.longHair)R(x-3,y-14,1,5,look.hair);if(look.glasses)R(x-1,y-13,4,1,0);else PX(x+1,y-13,0);
  if(pose==='cheer'){R(x-4,y-15,1,5,sk);R(x+4,y-15,1,5,sk);}else if(pose==='horror'){R(x-2,y-13,5,2,sk);}else{R(x-4,y-10,1,4,sk);R(x+4,y-10,1,4,sk);}}
Object.assign(L8,{
 stageId(){const C=this.ladder&&this.ladder[this.stage];const id=C?C.id:'jean';return id==='seba'?'brandan':id;},
 drawStage(t){const id=this.stageId();if(typeof BG3D!=='undefined'){const cx=this.me&&this.foe?((this.me.x+this.foe.x)/2-128)/128:0;const horror=this.sub==='fatal'||this.sub==='finish';if(BG3D.draw(id,t,cx,{cams:(this.cameos||[]).map(c=>c.c.look),pose:horror?'horror':(this.cheer>0?'cheer':'idle')})){this.crowd3d=true;return;}}this.crowd3d=false;
  if(id==='jean'){L6.stage(t);return;}
  if(id==='alvaro'){R(0,13,W,111,"#5A3A22");for(let x=0;x<W;x+=16)R(x,13,1,111,"#4A2E1A");R(0,58,W,2,"#3A2212");
    disc(128,66,10,GOLD);disc(128,66,8,"#5A3A22");R(127,58,2,15,GOLD);R(120,61,17,1,GOLD);R(118,62,5,3,GOLD);R(134,62,5,3,GOLD);R(124,72,9,2,GOLD);
    R(80,88,96,36,"#3E2412");R(78,86,100,4,"#6B4226");for(let i=0;i<5;i++)R(84+i*18,94,14,24,"#4A2C16");
    const up=(t%3)<0.25?Math.sin((t%3)/0.25*Math.PI)*6:0;R(122,78,12,9,0);disc(128,75,4,15);R(125,71,7,2,"#EDEDED");R(140,80-up,8,4,"#8B5A2B");R(143,84-up,2,4,"#6B4226");if((t%3)>0.24&&(t%3)<0.3)tone&&0;
    R(4,104,60,5,"#3E2412");R(192,104,60,5,"#3E2412");R(0,GYF,W,H-GYF,"#8B5A2B");for(let x=-20;x<W;x+=12)LN(x,GYF,x+20,H,"#7A4A20");}
  else if(id==='samir'){R(0,13,W,111,"#3A4256");R(96,54,64,40,"#9EC8E8");for(let y=56;y<94;y+=4)R(96,y,64,1,"#C8D8E8");BOXL(95,53,66,42,6);
    for(const sx of [6,176]){R(sx,52,74,66,"#5A4632");for(let r=0;r<4;r++){R(sx,66+r*16,74,2,"#3A2E22");for(let i=0;i<12;i++)R(sx+3+i*6,54+r*16,4,11,["#C8102E","#29ADFF","#FFEC27","#00875A","#EDEDED","#FF77A8"][(i+r*3)%6]);}}
    R(100,98,56,4,"#6B4226");R(104,102,3,22,"#4E2E1A");R(149,102,3,22,"#4E2E1A");for(let k=0;k<3;k++){const h=8+k*3,sw=Math.sin(t*2+k)*1;R(104+k*10+sw,98-h,8,h,7);R(104+k*10+sw,98-h,8,1,6);}
    R(142,86,2,12,5);R(138,84,10,3,GOLD);R(0,GYF,W,H-GYF,"#4A4A5A");for(let x=0;x<W;x+=8)R(x,GYF+6,4,1,"#555566");}
  else if(id==='andres'){R(0,13,W,111,"#4E6E5E");R(70,52,116,46,"#F2F2F2");BOXL(69,51,118,48,6);T("CLIMA LABORAL",89,55,1);
    [0.6,0.8,0.45,0.9,0.7].forEach((v,i)=>{const h=Math.round(28*v*(0.9+0.1*Math.sin(t*2+i)));R(86+i*18,94-h,10,h,[11,12,9,14,10][i]);});R(80,94,98,1,5);
    R(14,54,40,30,"#F2E8C8");T("EQUIPO",18,58,1);for(let i=0;i<4;i++)disc(20+i*9,72,3,[8,12,11,9][i]);R(204,54,40,30,"#F2E8C8");T("VALORES",205,58,1);for(let i=0;i<3;i++)R(208,67+i*5,30,1,5);
    R(56,106,144,5,"#6B4226");R(64,111,3,13,"#4E2E1A");R(189,111,3,13,"#4E2E1A");R(4,94,8,30,"#3C8C4A");disc(8,92,7,"#3C8C4A");R(244,94,8,30,"#3C8C4A");disc(248,92,7,"#3C8C4A");
    R(0,GYF,W,H-GYF,"#6A6A5A");for(let x=0;x<W;x+=10)R(x+((x/10)%2)*5,GYF+4,5,1,"#5A5A4A");}
  else if(id==='jl'){R(0,13,W,111,"#1A1A2A");R(12,50,232,62,"#0B1030");for(let i=0;i<30;i++)PX(14+(i*53)%228,52+(i*29)%24,Math.sin(t*2+i)>0.3?7:6);
    g.fillStyle="#2A2A44";g.beginPath();g.moveTo(12,100);g.lineTo(60,76);g.lineTo(100,90);g.lineTo(150,70);g.lineTo(200,88);g.lineTo(244,80);g.lineTo(244,112);g.lineTo(12,112);g.fill();
    for(let i=0;i<28;i++){const x=14+i*8,h=6+((i*37)%18);R(x,112-h,7,h,"#15152A");if((i*7)%3===0)PX(x+2,112-h+3,Math.sin(t*3+i)>0?10:9);}
    for(let x=12;x<=244;x+=58)R(x,50,2,62,"#3A3A5A");R(12,50,234,2,"#3A3A5A");
    R(24,104,208,6,"#3A2212");for(let i=0;i<7;i++){R(32+i*30,94,10,10,"#101018");}R(0,GYF,W,H-GYF,"#2A1A10");for(let x=0;x<W;x+=20)R(x,GYF,1,H-GYF,"#1A0E06");}
  else if(id==='coni'){R(0,13,W,111,"#1C2430");for(const sx of [14,98,182]){R(sx,52,60,38,"#0A0E14");BOXL(sx,52,60,38,6);for(let k=0;k<6;k++){const s=Math.floor(t*4)+k,w=10+((s*37)%40);R(sx+4+((s*13)%8),56+k*5,w,2,k%3?11:12);}}
    const a1=Math.sin(t*1.5)*0.6-0.9,a2=Math.sin(t*1.5+1)*0.8+0.6,bx=222,by=118,x1=bx+Math.cos(a1)*18,y1=by+Math.sin(a1)*18-10,x2=x1+Math.cos(a2)*14,y2=y1+Math.sin(a2)*14;R(bx-6,by-4,12,6,5);g.strokeStyle=col(9);g.lineWidth=3;g.beginPath();g.moveTo(bx,by-6);g.lineTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.lineWidth=1;disc(x1,y1,2,7);R(x2-2,y2-1,4,3,6);
    R(0,112,190,5,"#3A3A44");for(let x=((t*30)%16)-16;x<190;x+=16){R(x,112,1,5,"#2A2A33");}for(let k=0;k<4;k++){const x=((t*30+k*50)%210)-20;R(x,104,10,8,"#C8A060");R(x,107,10,1,"#8A6A3A");}
    R(0,GYF,W,H-GYF,"#5A6070");for(let x=0;x<W;x+=8)for(let y=GYF+3;y<H;y+=6)PX(x+((y/6)%2)*4,y,"#6A7080");}
  else if(id==='brandan'){R(0,13,W,111,"#23304A");R(56,60,144,40,"#081018");BOXL(55,59,146,42,6);const off=Math.floor(t*6)%70;
    for(let i=0;i<69;i++){const v1=FIN_PTS[(i+off)%70],v2=FIN_PTS[(i+1+off)%70];LN(58+i*2,97-v1*0.7,60+i*2,97-v2*0.7,v2>=v1?11:8);}T("IPSA",60,62,10);
    R(0,48,W,9,0);const tk="USD ↑  CLP ↓  UF ↑  IPSA ↑  COBRE ↑  ";for(let k=0;k<3;k++){const x=Math.round(-(t*30)%(tk.length*6))+k*tk.length*6;[...tk].forEach((ch,i)=>{if(x+i*6>-6&&x+i*6<W)T(ch,x+i*6,49,ch==='↓'?8:(ch==='↑'?11:GOLD));});}
    R(212,108,36,16,"#555566");BOXL(212,108,36,16,6);disc(230,116,5,6);disc(230,116,3,5);LN(230,116,230+Math.cos(t)*3,116+Math.sin(t)*3,7);
    for(const x of [12,26]){disc(x,118,6,"#C8A060");R(x-2,110,4,3,"#8A6A3A");T("$",x-2,115,"#5A3A12");}
    R(0,GYF,W,H-GYF,"#C8C8D0");for(let i=0;i<8;i++)LN(i*36,GYF+2,i*36+20,H,"#B0B0BC");}
  else this.office(t);},
 setupCrowd(){const ids=[this.me0.id,this.ladder[this.stage].id];this.cameos=DMC.filter(c=>!ids.includes(c.id)).slice(0,5).map((c,i)=>({c,x:[22,46,210,234,128][i],ph:i*1.3}));this.cheer=0;},
 drawCrowd(t){if(this.crowd3d)return;const horror=this.sub==='fatal'||this.sub==='finish';const pose=horror?'horror':(this.cheer>0?'cheer':'idle');
  for(let i=0;i<9;i++){const x=10+i*30+(i%2)*6;if(x>100&&x<156)continue;miniGuy({skin:"#1A1622",hair:"#1A1622",top:"#2A2436",pants:"#1A1622"},x,122,pose,t,i);}
  for(const cm of this.cameos||[])miniGuy(cm.c.look,cm.x,122,pose,t,cm.ph);},
 bump(v){this.cheer=Math.max(this.cheer||0,v||1.2);},
 introArms(f,ty,G,C,L_,t){const id=f.C.id,k=Math.floor(t*6)%2;
  if(id==='alvaro'){disc(3,ty+1,G,C(L_.glove));R(1,ty,6,2,C(8));disc(-5,ty+16,G,C(L_.glove));}
  else if(id==='samir'){const fl=Math.floor(t*4)%4,dx=10,dy=ty-2;R(dx,dy,14,17,C('#E8E8EE'));R(dx,dy,14,1,C('#BBB'));for(let i=0;i<5;i++)R(dx+2,dy+3+i*3,10-(i%2)*3,1,C('#8A8A96'));if(fl===1){R(dx+7,dy,7,17,C('#FAFAFF'));R(dx+7,dy,1,17,C('#AAA'));}if(fl>=2){R(dx+2,dy+6,8,1,C(8));}if(fl===3){R(dx+2,dy+12,6,1,C(8));R(dx+10,dy+2,2,2,C(8));}disc(dx,dy+15,G,C(L_.glove));const py=dy+5+Math.round(Math.abs(Math.sin(t*9))*6);R(dx+11,py-5,1,6,C(8));R(dx+11,py-6,1,1,C(GOLD));disc(dx+15,py+1,G-1,C(L_.glove));}
  else if(id==='andres'){R(6,ty+2,12,15,C("#E8DCC0"));R(10,ty+1,4,2,C(6));for(let i=0;i<3;i++)R(8,ty+6+i*3,8,1,C(5));disc(6,ty+12,G,C(L_.glove));disc(16,ty+8+k,G-1,C(L_.glove));}
  else if(id==='jl'){disc(4,ty-8,G,C(L_.glove));disc(-5,ty+16,G,C(L_.glove));}
  else if(id==='jean'){disc(10+k,ty+6,G,C(L_.glove));disc(12-k,ty+8,G,C(L_.glove));}
  else if(id==='coni'){R(6,ty+8,16,2,C(6));R(8,ty-2,12,10,C(5));R(9,ty-1,10,8,C(k?"#1E5AD0":"#29ADFF"));disc(8,ty+8,G-1,C(L_.glove));disc(18,ty+8,G-1,C(L_.glove));}
  else if(id==='fran'){R(6,ty+8,16,2,C(6));R(8,ty-2,12,10,C('#1A1A24'));R(9,ty-1,10,8,C(k?'#33FF88':'#1A5A34'));disc(8,ty+8,G-1,C(L_.glove));disc(18,ty+8,G-1,C(L_.glove));}
  else if(id==='seba'){g.save();g.translate(4,ty+10);g.rotate(-0.55);R(-14,-3,22,7,C('#1A1A1A'));R(-14,-2,8,5,C('#B00020'));R(8,-1,16,3,C('#5A3A20'));R(22,-3,5,7,C('#111'));for(let k2=0;k2<3;k2++)R(10+k2*4,-1,1,3,C('#C0C0C8'));g.restore();disc(2,ty+10,G,C(L_.glove));disc(16,ty+2+(Math.floor(t*12)%2),G,C(L_.glove));}
  else if(id==='brandan'){for(let i=0;i<4;i++){g.save();g.translate(12,ty+4);g.rotate(-0.6+i*0.3+(k?0.1:0));R(0,-8,5,9,C("#5FB85F"));BOXL(0,-8,5,9,C(3));g.restore();}disc(10,ty+6,G,C(L_.glove));disc(-5,ty+16,G,C(L_.glove));}},
 winArms(f,ty,G,C,L_,t){const id=f.C.id,s=L_.skin,bw=L_.bw||18,sx=Math.round(bw/2)-1,up=Math.round(Math.abs(Math.sin(t*6))*2);
  if(id==='samir'){disc(4,ty+6,G,C(L_.glove));disc(-2,ty+8,G,C(L_.glove));R(-4,ty+6,12,3,C(s));return;}
  // brazos desde los hombros, a los costados de la cabeza (no encima de la cara)
  R(sx-1,ty-12-up,3,14+up,C(s));R(-sx-2,ty-12-up,3,14+up,C(s));R(sx-1,ty-2,3,3,C(L_.top));R(-sx-2,ty-2,3,3,C(L_.top));
  disc(sx,ty-14-up,G,C(L_.glove));disc(-sx-1,ty-14-up,G,C(L_.glove));const gx=sx,gy=ty-14-up;
  if(id==='alvaro'){R(gx-1,gy-12,3,12,C("#6B4226"));R(gx-6,gy-16,13,6,C("#8B5A2B"));}
  if(id==='andres'){R(gx-9,gy-16,18,12,C(7));T("OUT",gx-7,gy-14,8);}
  if(id==='jl'){R(gx-11,gy-18,22,12,C(7));LN(gx-9,gy-8,gx-3,gy-12,C(11));LN(gx-3,gy-12,gx+1,gy-10,C(11));LN(gx+1,gy-10,gx+9,gy-16,C(11));}
  if(id==='coni'){R(gx-6,gy-16,12,8,C(5));R(gx-5,gy-15,10,6,C("#29ADFF"));}
  if(id==='fran'){R(gx-7,gy-16,14,8,C('#1A1A24'));R(gx-6,gy-15,12,6,C('#33FF88'));}
  if(id==='seba'){R(gx-2,gy-10,2,6,C(L_.glove));R(gx+2,gy-10,2,6,C(L_.glove));R(-sx-3,gy-10,2,6,C(L_.glove));R(-sx+1,gy-10,2,6,C(L_.glove));}},
 winFx(f,t){if(f.C.id==='brandan'&&RND()<0.3)this.parts.push({x:f.x+(RND()-0.5)*20,y:f.y-70,vx:(RND()-0.5)*60,vy:-40-RND()*40,t:0,life:1,c:"#5FB85F",grav:true});
  if(f.C.id==='coni'&&!f.hopT)f.hopT=0;},
 bruises(x,y,w,h,sc,face,C,foc){const hh=C.look.h||0,fy=Math.round(y+h/2+(foc-hh)*sc),cx=x+w/2,hw=C.look.kind==='andres'||C.look.kind==='jean'?14:12,top=fy+(-54+hh)*sc;
  const ex=cx+face*(hw/2-3)*sc,ey=top+6*sc;g.strokeStyle="#6A2A8A";g.lineWidth=2;g.beginPath();g.arc(ex,ey,2.4*sc,0,7);g.stroke();g.lineWidth=1;
  const bx=cx-face*1*sc;R(bx-3*sc/2,top+8*sc,3*sc,1.2*sc,"#F2C48A");R(bx-0.6*sc,top+7*sc,1.2*sc,3.4*sc,"#F2C48A");
  LN(cx+face*2*sc,top+2*sc,cx+face*5*sc,top+4*sc,8);LN(cx+face*3*sc,top+1*sc,cx+face*6*sc,top+3*sc,8);
  R(cx+face*(hw/2-3)*sc-2,top+9.5*sc,3,5,"#9ED8FF");},
 drawVictory(t){const me=this.me,fo=this.foe,wid=me.C,lid=fo.C;R(0,0,W,H,"#0B1020");
  g.fillStyle="#1D2B53";g.beginPath();g.moveTo(0,13);g.lineTo(140,13);g.lineTo(116,H);g.lineTo(0,H);g.fill();g.fillStyle="#2A1020";g.beginPath();g.moveTo(140,13);g.lineTo(W,13);g.lineTo(W,H);g.lineTo(116,H);g.fill();
  this.portrait(wid,6,22,108,82,2,1,44,'win');this.portrait(lid,W-114,24,108,80,2,-1,40,'dizzy');g.fillStyle="rgba(40,0,20,0.25)";g.fillRect(W-114,24,108,80);this.bruises(W-114,24,108,80,2,-1,lid,40);
  {const hh=lid.look.h||0,top=24+40+(40-hh)*2+(-54+hh)*2;for(let k=0;k<3;k++){const a=t*5+k*2.1;T("*",W-60+Math.cos(a)*16-3,top-8+Math.sin(a)*4,10);}}
  TC("GANA "+wid.n,16,10,1,0,60);TC("PIERDE "+lid.n,16,8,1,0,W-60);
  R(8,106,W-16,26,0);BOXL(8,106,W-16,26,10);TC(wid.win,112,7,1,null,W/2);TC(WIN_TXT[wid.id]||'',123,10,1,null,W/2);
  hud(this.name+" · "+Math.min(this.stage+1,this.ladder.length)+"/"+this.ladder.length,"");}
});

// ======================= SONIDO (locutor, música con variaciones, golpes por intensidad) + UX táctil =======================
const ANN={voice:null,ready:false};
function annInit(){if(ANN.ready||!window.speechSynthesis)return;ANN.ready=true;const pickV=()=>{const vs=speechSynthesis.getVoices()||[];ANN.voice=vs.find(v=>/^es(-|_)(CL|419|MX|US|AR)/i.test(v.lang))||vs.find(v=>/^es/i.test(v.lang))||null;};pickV();try{speechSynthesis.onvoiceschanged=pickV;}catch(e){}}
function ann(txt,prio){/* locutor desactivado a pedido del usuario */}
const MUSV={seba:[-3,'sawtooth',2],fran:[7,'sawtooth',2],alvaro:[0,'pulse',0],samir:[-2,'square',1],andres:[3,'triangle',0],jl:[-5,'sawtooth',1],jean:[0,'square',2],coni:[5,'pulse',2],brandan:[2,'triangle',1]};
const TJ={x:32,y:114,r:24},TB=[{k:'punch',x:212,y:126,l:'GOL',c:8},{k:'kick',x:240,y:118,l:'PAT',c:9},{k:'s0Hold',x:206,y:100,l:'ES1',c:12},{k:'s1Hold',x:234,y:92,l:'ES2',c:14}],TSUP={x:176,y:124,r:13};
const _o={init:L8.init,startRound:L8.startRound,update:L8.update,koFall:L8.koFall,startVS:L8.startVS,startFight:L8.startFight};
Object.assign(L8,{
 fightMusic(){const L=this,V=MUSV[this.stageId()]||[0,'pulse',0],[ko,lead,dp]=V;
  musicStart(150,(s,t,s16)=>{const fin=L.rw&&L.rw[0]===1&&L.rw[1]===1,dng=L.me&&L.foe&&L.sub==='go'&&(L.me.hp/L.me.max<0.25||L.foe.hp/L.foe.max<0.25);const bar=Math.floor(s/16)%4,root=[40,40,43,38][bar]+ko;
   if(s%2===0)[0,7].forEach(k=>tone('sawtooth',hz(root+k),t,s16*1.6,0.04,A.mus,null,{lp:1600,dist:true}));
   const kp=[[0,10],[0,6,8,14],[0,3,8,11]][dp];if(kp.includes(s%16))kick(t,0.6);if(s%8===4)snare(t,0.3);if(s%2===0||fin)hat(t,false,fin?0.06:0.045);if(s%32===0)noise(t,0.6,0.09,'highpass',5000,A.mus);
   const mel=[12,15,19,17,15,12,10,12];if(Math.floor(s/16)%2===1&&s%2===0)tone(lead,hz(root+12+mel[(s>>1)%8]),t,s16*1.8,0.034,A.mus,null,{lp:2400});
   if(fin&&s%4===2)tone('square',hz(root+24),t,s16,0.02,A.mus);if(dng&&s%2===1)tone('pulse',hz(root+31+((s>>1)%2)*5),t,s16*0.8,0.022,A.mus);});},
 hitSnd(tier,t){if(tier===1){tone('sine',230,t,0.07,0.5,null,120);noise(t,0.05,0.18,'bandpass',2600);}
  else if(tier===2){tone('sine',150,t,0.12,0.75,null,60);noise(t,0.09,0.3,'lowpass',1500);tone('square',90,t,0.05,0.08);}
  else{tone('sine',95,t,0.3,0.95,null,35);noise(t,0.22,0.45,'lowpass',900);noise(t+0.03,0.35,0.12,'highpass',3500);tone('sawtooth',70,t,0.18,0.1,null,40);}},
 blockSnd(t,sta){const p=500+sta*6;tone('square',p,t,0.035,0.07);tone('sine',180,t,0.06,0.3,null,120);noise(t,0.04,0.1,'highpass',4000);},
 startRound(){_o.startRound.call(this);const r=this.round||1,fin=this.rw&&this.rw[0]===1&&this.rw[1]===1;this.annQ=[{t:r===1?2.3:0.15,x:fin?'Round final':(['','Round uno','Round dos','Round tres'][r]||'Round')},{t:(r===1?3.0:2.0)-0.2,x:'¡A pelear!'}];},
 startVS(){_o.startVS.call(this);ann('¡Un nuevo retador ha llegado!');},
 init(){this.crowdA=null;_o.init.call(this);},
 startFight(){_o.startFight.call(this);if(!this.crowdA)this.crowdA=ambient('noise',{ft:'bandpass',ff:900,q:0.8,v:0.015});},
 koFall(a,d,dir,t){_o.koFall.call(this,a,d,dir,t);const tt=AT();tone('sine',55,tt,0.9,0.9,null,30);noise(tt,1.4,0.18,'highpass',6000);ann('K.O.');},
 update(dt){const ps=this.sub,pp=this.ph,fatB=this.fat&&this.fat.fin&&this.fat.ft>=FAT_FIN;
  if(this.ph==='fight'&&this.sub==='intro'&&this.annQ)for(const q of this.annQ){if(!q.done&&this.pt>=q.t){q.done=true;ann(q.x);}}
  _o.update.call(this,dt);
  if(A.mus){const duck=this.superFx||this.sub==='fatal'||this.sub==='finish'||this.ph!=='fight';A.mus.gain.setTargetAtTime(duck?0.2:0.45,AT(),0.12);}
  if(this.crowdA)this.crowdA.gn.gain.setTargetAtTime(0.012+(this.cheer>0?0.05:0)+(this.sub==='fatal'?0.03:0),AT(),0.2);
  if(this.ph==='fight'&&this.sub==='go')M.bpm=(this.rw&&this.rw[0]===1&&this.rw[1]===1)?158:150;
  if(this.sub!==ps&&this.ph==='fight'){if(this.sub==='time')ann('¡Tiempo!');if(this.sub==='finish')ann('¡Acábalo!');}
  if(!fatB&&this.fat&&this.fat.fin&&this.fat.ft>=FAT_FIN)ann('Fatality');
  if(this.ph!==pp){if(this.ph==='quote'){const perf=this.me&&this.me.hp>=this.me.max;ann('Gana '+(this.me0?this.me0.n.toLowerCase():'')+(perf?'. ¡Perfecto!':''));}if(this.ph==='continue')ann('¿Continuar?');if(this.ph==='ending')ann('¡Campeón!');}},
 // ---------- táctil: joystick + botones redondos ----------
 touchFight(type,x,y,id){this.tt=this.tt||{};const T_=this.tt;
  if(type==='down'){if(this.me&&this.me.sup>=100&&Math.hypot(x-TSUP.x,y-TSUP.y)<TSUP.r+4){this.inp.super=true;return;}
    if(Math.hypot(x-TJ.x,y-TJ.y)<TJ.r+14||(x<72&&y>82)){T_[id]={j:true,dir:0,up:false};this.joyMove(id,x,y);return;}
    let best=null,bd=99;for(const b of TB){const dd=Math.hypot(x-b.x,y-b.y);if(dd<bd){bd=dd;best=b;}}if(best&&bd<16){T_[id]={b:best.k};if(best.k==='punch'||best.k==='kick')this.inp[best.k]=true;}}
  else if(type==='move'){if(T_[id]&&T_[id].j)this.joyMove(id,x,y);}
  else if(type==='up'){delete T_[id];}
  let L_=false,R_=false,D_=false;const hold={s0Hold:false,s1Hold:false};for(const k in T_){const q=T_[k];if(q.j){L_=L_||q.dir===-1;R_=R_||q.dir===1;D_=D_||q.down;}if(q.b==='s0Hold'||q.b==='s1Hold')hold[q.b]=true;}
  this.inp.left=L_;this.inp.right=R_;this.inp.down=D_;this.inp.s0Hold=hold.s0Hold;this.inp.s1Hold=hold.s1Hold;if(hold.s0Hold&&hold.s1Hold)this.inp.super=true;},
 joyMove(id,x,y){const q=this.tt[id],dx=x-TJ.x,dy=y-TJ.y;q.kx=clamp(dx,-16,16);q.ky=clamp(dy,-16,16);const nd=dx<-7?-1:(dx>7?1:0);
  if(nd!==0&&q.dir!==nd){const now=performance.now();if(this.lastTap&&this.lastTap.dir===nd&&now-this.lastTap.t<300){this.inp.dash=nd;this.lastTap=null;}else this.lastTap={dir:nd,t:now};}
  q.dir=nd;q.down=dy>8;const up=dy<-11;if(up&&!q.up)this.inp.up=true;q.up=up;},
 drawTouch(t){const T_=this.tt||{};let knob=null;for(const k in T_)if(T_[k].j)knob=T_[k];
  g.globalAlpha=0.28;disc(TJ.x,TJ.y,TJ.r,0);g.globalAlpha=0.6;g.strokeStyle=col(6);g.beginPath();g.arc(TJ.x,TJ.y,TJ.r,0,7);g.stroke();
  for(const [ax,ay,s] of [[-1,0,'←'],[1,0,'→'],[0,-1,'↑'],[0,1,'↓']])T(s,TJ.x+ax*16-2,TJ.y+ay*16-3,6);
  g.globalAlpha=0.55;disc(TJ.x+(knob?knob.kx:0),TJ.y+(knob?knob.ky:0),9,knob?7:5);
  for(const b of TB){const on=Object.values(T_).some(q=>q.b===b.k)||this.inp[b.k];g.globalAlpha=on?0.7:0.3;disc(b.x,b.y,11,on?b.c:0);g.globalAlpha=0.75;g.strokeStyle=col(b.c);g.beginPath();g.arc(b.x,b.y,11,0,7);g.stroke();T(b.l,b.x-8,b.y-3,on?0:7);}
  if(this.me&&this.me.sup>=100&&this.sub==='go'){g.globalAlpha=0.85;disc(TSUP.x,TSUP.y,TSUP.r,Math.floor(t*6)%2?10:9);g.globalAlpha=1;T("SÚP",TSUP.x-9,TSUP.y-3,0);}
  g.globalAlpha=1;}
});

// ======================= VISUAL: contorno, efectos, zoom, ambiente =======================
const _ov={drawF:L8.drawF,init:L8.init,update:L8.update,draw:L8.draw,startRound:L8.startRound,koFall:L8.koFall,fatCheckEnd:L8.fatCheckEnd};
Object.assign(L8,{
 drawF(f,t){if(!OUTL&&(f.alpha===undefined||f.alpha>=0.99)){OUTL='rgba(10,6,22,0.92)';for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){g.save();g.translate(dx,dy);_ov.drawF.call(this,f,t);g.restore();}OUTL=null;}_ov.drawF.call(this,f,t);},
 init(){FX.init();FX.reset();_ov.init.call(this);},
 startRound(){_ov.startRound.call(this);FX.ambient(null);FX.clearOV();this.zoom=0;},
 koFall(a,d,dir,t){_ov.koFall.call(this,a,d,dir,t);FX.ko(d.x,d.y-30);this.zoom=0.1;this.shake=Math.max(this.shake,0.4);},
 fatCheckEnd(){const was=this.fat&&this.fat.fin;_ov.fatCheckEnd.call(this);if(!was&&this.fat&&this.fat.fin){FX.hit(this.foe.x,this.foe.y-30,3,2);this.zoom=0.08;this.shake=0.45;}},
 update(dt){FX.update(dt);this.zoom=Math.max(0,(this.zoom||0)-dt*0.35);_ov.update.call(this,dt);},
 draw(t){_ov.draw.call(this,t);if(this.ph==='fight')FX.draw();}
});

// ======================= FATALITIES HD (sobre l8f) =======================
(function(){
 const RED=()=>save.blood;
 const _ob=L8.blood;L8.blood=function(x,y,n,big){if(typeof FX!=='undefined'&&FX.blood(x,y,n,big,RED()))return;return _ob.call(this,x,y,n,big);};
 const A=FATS.alvaro,Sm=FATS.samir,An=FATS.andres,JL=FATS.jl,Je=FATS.jean,Co=FATS.coni,Br=FATS.brandan,Fr=FATS.fran;
 // ---- ÁLVARO: mazo dorado de energía, onda y pantalla trizada
 const aHit=A.hit;A.hit=function(L,v,s){aHit(L,v,s);FX.hit(v.x,v.y-44,3,0);L.shake=Math.max(L.shake,0.15);};
 A.front=function(L,v,s,t,fin,ft){const up=fin?Math.max(0,1-ft/0.15):1,gy=(v.y-64-s*7)*up+(v.y-12)*(1-up),gx=v.x-4;FX.fatGlow(gx,gy-6,26,'255,215,110',0.55);FX.fatProp({k:'gavel',x:gx,y:gy-10,ang:Math.PI+(fin?0:Math.sin(t*12)*0.15)});
  if(!fin&&s>0)TC("¡ORDEN!",gy-34,10,1,0,clamp(v.x,30,W-30));
  if(fin&&ft>0.3)FX.fatProp({k:'stamp',x:v.x,y:v.y-26,a:Math.min(1,(ft-0.3)*4),red:RED()});};
 const aFin=A.fin;A.fin=function(L,v){aFin(L,v);FX.overlay('crack',1.6,v.x,v.y-12);FX.boom(v.x,v.y-10,true);};
 // ---- SAMIR: pluma luminosa, firma brillante, sobre con lacre
 Sm.back=function(L,v,s,t,fin,ft){if(!fin||ft<0.5)L.drawF(v,t);const n=fin?4:s;const pts=[];for(let i=0;i<=n*4;i++)pts.push([v.x-12+i*1.6,v.y-38+Math.sin(i*1.9)*5]);for(const [px,py] of pts)FX.fatGlow(px,py,3.5,RED()?'255,60,80':'90,180,255',0.6);
  if(fin){const k=Math.min(1,ft/0.5),fly=Math.max(0,ft-1.1),ex=v.x+fly*fly*160,ey=v.y-30-fly*60;if(ft<0.5)FX.fatProp({k:'env',x:v.x,y:v.y-95+k*60,rot:0});else{FX.fatProp({k:'env',x:ex,y:ey-5,rot:fly*0.6});if(fly>0&&Math.random()<0.4)FX.paperBurst(ex,ey,2,false);}}};
 Sm.front=function(L,v,s,t,fin,ft){if(!fin){const px=v.x-12+s*6.4,py=v.y-38+Math.sin(s*4*1.9)*5;FX.fatGlow(px,py,8,'255,230,150',0.7);FX.fatProp({k:'pen',x:px,y:py});}if(fin&&ft>1.2)TC("¡DESPACHADO!",60,10,2,0);};
 // ---- ANDRÉS: carta guillotina HD + caja de cartón
 An.front=function(L,v,s,t,fin,ft){const ly=fin?lerp(v.y-60-4*12,v.y-12,Math.min(1,ft/0.12)):v.y-110+s*12;FX.fatGlow(v.x,ly-18,34,'255,80,110',0.35);if(!fin||ft<1.0)FX.fatProp({k:'letter',x:v.x,y:ly});else FX.fatProp({k:'box',x:v.x+30,y:v.y});};
 const anFin=An.fin;An.fin=function(L,v){anFin(L,v);FX.paperBurst(v.x,v.y-14,24,true);};
 // ---- JOSÉ LUIS: varios rayos de luz + rayos X
 JL.front=function(L,v,s,t,fin,ft){const k=L.me,on=(L.beamFx>0)||(fin&&ft<0.7);if(on){const y=k.y-50+(k.look.h||0);const x0=k.x+k.face*14,x1=v.x;FX.beamAt(Math.min(x0,x1),Math.max(x0,x1),y,fin?14:6,'',t);if(fin){FX.beamAt(Math.min(x0,x1),Math.max(x0,x1),y+10,8,'',t+0.3);FX.beamAt(Math.min(x0,x1),Math.max(x0,x1),y-8,6,'',t+0.6);}}
  if(fin&&ft<1.4)FX.fatGlow(v.x,v.y-30,40,'200,240,255',0.45*(1-ft/1.4));};
 // ---- JEAN: "NO RESPONDE" — ventanas de error en cascada, FINALIZAR TAREA y proceso terminado
 Je.n='NO RESPONDE';
 Je.hit=function(L,v,s){L.blood(v.x,v.y-40,2);const t=AT();tone('sine',880,t,0.06,0.07);tone('sine',660,t+0.07,0.12,0.07);L.shake=Math.max(L.shake,0.08);FX.hit(v.x,v.y-50,1,2);};
 Je.back=function(L,v,s,t,fin,ft){if(fin&&ft>=1.0)return;const jit=fin&&ft>0.85?Math.round(Math.sin(t*90)*2):0;const vx0=v.x;v.x+=jit;if(!fin||Math.floor(t*30)%3)L.drawF(v,t);v.x=vx0;};
 Je.front=function(L,v,s,t,fin,ft){const name=(v.C.n.split(' ')[0]||'RIVAL').toLowerCase().replace('é','e').replace('á','a')+'.exe';
  const n=fin?(ft<1.0?26:0):Math.min(26,s*5+Math.floor(Math.min(1,(L.fat?L.fat.t:0)%0.5*4))*0);
  for(let i=0;i<n;i++){const sh=(fin&&ft>0.85)?Math.round(Math.sin(t*80+i)*1.5):0;FX.fatProp({k:'errwin',x:v.x-34+i*2.4,y:v.y-86+i*2.2,name,shake:sh});}
  if(fin&&ft<1.0){const k=Math.min(1,ft/0.6),bx=clamp(v.x-10,40,W-40),by=v.y-20;const cx=lerp(v.x-70,bx+6,k),cy=lerp(v.y-110,by+6,k);FX.fatProp({k:'killbtn',x:bx,y:by,pressed:ft>0.8,cur:true,cx,cy});if(ft>0.8&&!L._jClick){L._jClick=true;const t0=AT();tone('square',220,t0,0.05,0.08);noise(t0,0.05,0.1,'highpass',3000);}}
  if(fin&&ft>=1.0&&!L._jBoom){L._jBoom=true;FX.winBurst(v.x,v.y-50,34);FX.pixBurst(v.x,v.y);FX.pixBurst(v.x,v.y-24);FX.hit(v.x,v.y-40,3,2);if(save.blood)L.blood(v.x,v.y-40,26,true);L.puddle(v.x,40);L.shake=0.4;L.zoom=0.08;const t0=AT();tone('sawtooth',600,t0,0.6,0.08,null,60);noise(t0,0.6,0.25,'bandpass',900);tone('sine',1320,t0+0.1,0.4,0.06,null,330);}
  if(fin&&ft>=1.0&&ft<FAT_FIN-0.2)TC("PROCESO TERMINADO",58,7,2,0);
  if(!fin&&L.fat&&!L.fat.fin)TC(name.toUpperCase()+" NO RESPONDE",v.y-102,8,1,0,clamp(v.x,60,W-60));};
 Je.fin=function(L,v){L._jClick=false;L._jBoom=false;const t=AT();tone('square',300,t,0.2,0.07);};
 // ---- CONI: bots HD y código bien escrito (con llaves y punto y coma)
 Co.front=function(L,v,s,t,fin,ft){const n=fin?(ft<1.5?0:6):s*2;for(let i=0;i<n;i++){const side=i%2?1:-1,hop=Math.abs(Math.sin(t*10+i))*6;FX.fatProp({k:'bot2',x:v.x+side*(10+Math.floor(i/2)*9),y:v.y-6-hop,t});}
  FX.fatProp({k:'code',s:fin&&ft>1.5?'BUCLE INFINITO':'while(true){ golpe(); }',x:clamp(v.x,70,W-70),y:v.y-70});};
 const coFin=Co.fin;Co.fin=function(L,v){coFin(L,v);setTimeout(()=>{try{FX.rain(v.x,v.y);}catch(e){}},1400);};
 // ---- BRANDAN: trituradora HD, billetes HD, gráfico que se desploma
 Br.front=function(L,v,s,t,fin,ft){const h=fin?24:Math.min(24,s*6);FX.fatProp({k:'shred',x:v.x,y:v.y,h,t});if(fin&&ft>0.2&&ft<1.8&&Math.random()<0.6)FX.bills(v.x+22,v.y-14,1,RED());if(fin&&ft>1.0)TC("¡LIQUIDADO, CHE!",60,10,1,0,clamp(v.x,60,W-60));};
 const brHit=Br.hit;Br.hit=function(L,v,s){brHit(L,v,s);FX.bills(v.x,v.y-10,3,false);};
 const brFin=Br.fin;Br.fin=function(L,v){brFin(L,v);FX.overlay('crash',1.8);};
 // ---- FRANCISCO: red de drones + lluvia de código
 Fr.front=function(L,v,s,t,fin,ft){const n=fin?(ft<0.35?5:0):s;const pts=[];for(let i=0;i<n;i++){const a=t*3+i*1.26;pts.push([v.x+Math.cos(a)*22,v.y-40+Math.sin(a)*10]);}for(const [px,py] of pts)FX.fatProp({k:'agent',x:px,y:py,t});if(pts.length>1)FX.links(pts.concat([[v.x,v.y-36]]));if(fin&&ft>0.4)TC('DEPRECADO',60,8,2,0);};
 const frFin=Fr.fin;Fr.fin=function(L,v){frFin(L,v);FX.rain(v.x,v.y);FX.pixBurst(v.x,v.y);};
 // ---- SEBASTIÁN: REEMBOLSO RECHAZADO — boleta, lupa, X roja, timbrazo
 {const Se=FATS.seba;
  Se.hit=function(L,v,s){const t0=AT();tone('sine',620+s*70,t0,0.07,0.06);if(s===2)tone('square',300,t0,0.1,0.05,null,200);if(s===4){tone('square',200,t0,0.25,0.07,null,90);}FX.hit(v.x-14,v.y-52,1,1);};
  Se.front=function(L,v,s,t,fin,ft){const bx=v.x-v.face*0-14*(L.me.x<v.x?1:-1),by=v.y-52;
   if(!fin){FX.fatProp({k:'boleta',x:bx,y:by,rot:-0.15+Math.sin(t*3)*0.05});if(s>=1){const mx=bx+Math.sin(t*2.6)*4,my=by+Math.cos(t*3.1)*3;FX.fatProp({k:'mag',x:mx,y:my});FX.fatGlow(mx,my,10,'255,255,220',0.3);}if(s>=3)FX.fatProp({k:'xmark',x:bx,y:by});
    FX.fatProp({k:'ftxt',s:s>=3?'SIN BOLETA ORIGINAL':(s>=1?'¿Y EL RESPALDO?':'¿ME REEMBOLSAS?'),x:clamp(v.x,60,W-60),y:v.y-84,col:s>=3?'#FF3355':'#FFEC27',sz:9});return;}
   const fall=Math.min(1,ft/0.3),sy=lerp(v.y-130,v.y-6,fall*fall);
   if(ft<1.25){FX.fatProp({k:'bigstamp',x:v.x,y:sy});FX.fatGlow(v.x,sy-10,40,'255,60,80',0.35);}
   if(ft>=0.3){FX.fatProp({k:'seal',x:v.x,y:v.y-8,a:Math.min(1,(ft-0.3)*5)});}
   if(ft>=0.3&&!L._sBoom){L._sBoom=true;FX.paperBurst(v.x,v.y-20,30,false);FX.boom(v.x,v.y-6,true);L.shake=0.45;L.zoom=0.08;if(save.blood)L.blood(v.x,v.y-6,20,true);const t0=AT();noise(t0,0.35,0.3,'lowpass',400);tone('sine',70,t0,0.4,0.2,null,40);}
   if(ft>1.25)FX.fatProp({k:'ftxt',s:'NO HAY PLATA.',x:W/2,y:62,col:'#FFFFFF',sz:16});};
  Se.fin=function(L,v){L._sBoom=false;const t0=AT();tone('sawtooth',300,t0,0.3,0.05,null,600);}}
 // ---- interfaz del fatality en HD (cine, carril, rótulo)
 const _hud=L8.fatHud;
 L8.fatHud=function(t){if(typeof FX==='undefined'||!FX.fatUI)return _hud.call(this,t);
  if(this.sub==='finish')return _hud.call(this,t);
  const f=this.fat;if(!f)return;const cx=(this.me.x+this.foe.x)/2;
  if(!f.fin){f._hits=(f._hits||[]).filter(h=>(h.age+=1/60)<0.4);
   const nh=f.notes.filter(n=>n.hit&&!n._seen);for(const n of nh){n._seen=true;f._hits.push({age:0,miss:!!n.missed});}
   const jud=f.judge&&(f.judge.k+=1/60)<0.6?f.judge.t:null;
   FX.fatUI({cine:Math.min(1,f.t*3),cx,track:true,touch:TOUCHUI,notes:f.notes.filter(n=>!n.hit),t:f.t,fall:FAT_FALL,hits:f._hits,judge:jud,count:f.notes.filter(n=>n.hit&&!n.missed).length,prep:f.t<FAT_LEAD-0.3,fail:f.fail&&Math.floor(t*6)%2});this.zoom=Math.max(this.zoom||0,0.04);}
  else{const b=f.ft>FAT_FIN-0.2?Math.min(1,(f.ft-FAT_FIN+0.2)/0.25):0;FX.fatUI({cine:1,cx,banner:b,name:f.def.n});}};
})();

// ======================= MODO VERSUS · 2 JUGADORES (mismo teclado) =======================
const HOWTO1=L8.howto.slice();
const HOWTO2=["J1: WASD MUEVE · F GOLPE · G PATADA","J1: R / T ESPECIALES (R+T = SÚPER)","J2: FLECHAS · K GOLPE · L PATADA","J2: I / O ESPECIALES (I+O = SÚPER)","DOBLE TOQUE: DASH · →+GOLPE: AGARRE","AL MEJOR DE 3 · ¡HAY FATALITIES!"];
const P1K={move:{KeyA:'left',KeyD:'right',KeyS:'down'},hold:{KeyR:'s0Hold',KeyT:'s1Hold'},edge:{KeyW:'up',KeyF:'punch',KeyG:'kick'},fat:['KeyA','KeyS','KeyW','KeyD'],go:'KeyF'};
const P2K={move:{ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down'},hold:{KeyI:'s0Hold',KeyO:'s1Hold',Numpad4:'s0Hold',Numpad5:'s1Hold'},edge:{ArrowUp:'up',KeyK:'punch',KeyL:'kick',Numpad1:'punch',Numpad2:'kick'},fat:['ArrowLeft','ArrowDown','ArrowUp','ArrowRight'],go:'KeyK'};
const _om={init:L8.init,key:L8.key,update:L8.update,draw:L8.draw,brain:L8.brain,ko:L8.ko,pointer:L8.pointer};
Object.assign(L8,{
 init(){this.vs2=typeof VS2!=='undefined'&&VS2;_om.init.call(this);if(this.vs2){this.ph='select';this.sel=0;this.sel2=1;this.ok1=false;this.ok2=false;this.inp2={};this.swapped=false;this.score=0;}},
 cell2(i){return [77+(i%4)*26,18+Math.floor(i/4)*33];},
 vsStart(){this.swapped=false;this.me0=this.p1C;this.ladder=[this.p2C];this.stage=0;this.inp={};this.inp2={};this.ph='vs';this.pt=0;S.ok();},
 swapSides(){[this.me,this.foe]=[this.foe,this.me];const c=this.me0;this.me0=this.ladder[this.stage];this.ladder[this.stage]=c;this.rw=[this.rw[1],this.rw[0]];this.swapped=!this.swapped;},
 winnerP(){return this.swapped?2:1;},
 key(c,down){if(!this.vs2)return _om.key.call(this,c,down);
  const n=DMC.length+1,pickC=i=>i===DMC.length?DMC[Math.floor(RND()*DMC.length)]:DMC[i];
  if(this.ph==='select'){if(!down)return;
   if(!this.ok1){const d={KeyA:-1,KeyD:1,KeyW:-4,KeyS:4}[c];if(d){this.sel=(this.sel+d+n*3)%n;S.move();}if(c==='KeyF'){this.ok1=true;this.p1C=pickC(this.sel);S.ok();}}else if(c==='KeyG'){this.ok1=false;S.move();}
   if(!this.ok2){const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-4,ArrowDown:4}[c];if(d){this.sel2=(this.sel2+d+n*3)%n;S.move();}if(c==='KeyK'||c==='Enter'){this.ok2=true;this.p2C=pickC(this.sel2);S.ok();}}else if(c==='KeyL'){this.ok2=false;S.move();}
   if(this.ok1&&this.ok2)this.vsStart();return;}
  if(this.ph==='vs'){if(down&&['Enter','Space','KeyF','KeyK'].includes(c)&&this.pt>0.5)this.startFight();return;}
  if(this.ph==='vsend'){if(!down||this.pt<0.8)return;if(['Enter','KeyF','KeyK','Space'].includes(c)){this.vsStart();}else if(c==='Backspace'||c==='KeyC'){this.ph='select';this.ok1=false;this.ok2=false;S.move();}return;}
  if(this.ph!=='fight')return;
  const wP=this.winnerP(),WK=wP===1?P1K:P2K;
  if(this.sub==='finish'){if(down&&c===WK.go)this.startFat();return;}
  if(this.sub==='fatal'){if(down){const l=WK.fat.indexOf(c);if(l>=0)this.fatKey(l);}return;}
  // en la pelea: cada jugador controla su luchador (si se intercambiaron lados, también los controles)
  for(const [K,pl] of [[P1K,1],[P2K,2]]){const tgt=((pl===1)!==this.swapped)?'inp':'inp2';const inp=this[tgt]||(this[tgt]={});
   const mv=K.move[c];if(mv){inp[mv]=down;if(down&&(mv==='left'||mv==='right')){const dir=mv==='right'?1:-1,now=performance.now(),lt='lt'+pl;if(this[lt]&&this[lt].dir===dir&&now-this[lt].t<260){inp.dash=dir;this[lt]=null;}else this[lt]={dir,t:now};}}
   const h=K.hold[c];if(h){inp[h]=down;if(down&&inp.s0Hold&&inp.s1Hold)inp.super=true;}
   const e=K.edge[c];if(e&&down)inp[e]=true;}},
 brain(f,o,dt,P){if(this.vs2&&f===this.foe&&this.ph==='fight'){const I=this.inp2||{};for(const k in f.ai)f.ai[k]=typeof f.ai[k]==='boolean'?false:0;Object.assign(f.ai,{left:!!I.left,right:!!I.right,down:!!I.down,s0Hold:!!I.s0Hold,s1Hold:!!I.s1Hold,up:!!I.up,punch:!!I.punch,kick:!!I.kick,dash:I.dash||0,super:!!I.super});I.up=I.punch=I.kick=I.super=false;I.dash=0;return;}return _om.brain.call(this,f,o,dt,P);},
 ko(a,d,dir,t){if(this.vs2&&this.ph==='fight'&&a===this.foe&&d===this.me&&this.rw&&this.rw[1]===1){this.swapSides();return _om.ko.call(this,this.me,this.foe,-dir,t);}return _om.ko.call(this,a,d,dir,t);},
 update(dt){if(this.vs2&&(this.ph==='select'||this.ph==='vsend')){this.pt+=dt;return;}
  _om.update.call(this,dt);
  if(this.vs2&&(this.ph==='quote'||this.ph==='continue'||this.ph==='ending'||this.ph==='challenger')){const p1Won=(this.ph!=='continue')!==this.swapped;this.vsWin=p1Won?1:2;this.vsW=p1Won?(this.swapped?this.foe:this.me):(this.swapped?this.me:this.foe);this.vsL=this.vsW===this.me?this.foe:this.me;this.ph='vsend';this.pt=0;musicStop();S.win();}},
 pointer(type,x,y,id){if(this.vs2&&(this.ph==='select'||this.ph==='vsend'))return;return _om.pointer.call(this,type,x,y,id);},
 drawSel2(t){R(0,0,W,H,"#0B1020");for(let y=13;y<H;y+=8)R(0,y,W,1,"#101838");hud("VERSUS · 2 JUGADORES","");
  const panel=(C,x,face,col,ok,lab)=>{R(x,16,70,96,"#1B2440");BOXL(x,16,70,96,col);if(C)this.portrait(C,x+1,17,68,78,2,face,40);R(x+1,95,68,16,"rgba(11,16,32,0.9)");TC(lab,97,col,1,null,x+35);TC(C?C.n:'ALEATORIO',105,ok?10:7,1,null,x+35);if(ok){R(x+18,60,34,11,col);TC("LISTO",62,0,1,null,x+35);}};
  const C1=this.sel<DMC.length?DMC[this.sel]:null,C2=this.sel2<DMC.length?DMC[this.sel2]:null;panel(C1,4,1,12,this.ok1,"JUGADOR 1");panel(C2,W-74,-1,8,this.ok2,"JUGADOR 2");
  for(let i=0;i<=DMC.length;i++){const [x,y]=this.cell2(i);const a=i===this.sel,b=i===this.sel2;R(x-1,y-1,28,32,"#0B1020");R(x,y,26,30,"#1B2440");if(i<DMC.length)this.portrait(DMC[i],x+1,y+1,22,28,2,1,47);else TC("?",y+8,10,2,null,x+12);
   const bl=Math.floor(t*6)%2;if(a){BOXL(x-1,y-1,28,32,bl||this.ok1?12:1);R(x+1,y+22,12,7,0);T("1P",x+2,y+22,12);}if(b){BOXL(x,y,26,30,bl||this.ok2?8:2);R(x+13,y+22,12,7,0);T("2P",x+14,y+22,8);}}
  R(0,H-24,W,24,"#0B1020");R(0,H-24,W,1,12);T("J1: WASD + F ELIGE (G CANCELA)",4,H-20,12);T("J2: FLECHAS + K ELIGE (L CANCELA)",4,H-10,8);},
 drawVsEnd(t){const Wf=this.vsW,Lf=this.vsL;R(0,0,W,H,"#0B1020");g.fillStyle=this.vsWin===1?"#1D2B53":"#3A1020";g.beginPath();g.moveTo(0,13);g.lineTo(140,13);g.lineTo(116,H);g.lineTo(0,H);g.fill();
  if(Wf&&Lf){this.portrait(Wf.C,6,22,108,82,2,1,44,'win');this.portrait(Lf.C,W-114,24,108,80,2,-1,40,'dizzy');g.fillStyle="rgba(40,0,20,0.25)";g.fillRect(W-114,24,108,80);this.bruises(W-114,24,108,80,2,-1,Lf.C,40);}
  TC("¡GANA EL JUGADOR "+this.vsWin+"!",17,this.vsWin===1?12:8,1,0,W/2);
  R(8,106,W-16,26,0);BOXL(8,106,W-16,26,10);TC((Wf?Wf.C.win:''),110,7,1,null,W/2);TC(Math.floor(t*2)%2?"ENTER: REVANCHA · BORRAR: CAMBIAR":"ESC: MENÚ",121,10,1,null,W/2);
  hud("VERSUS · 2 JUGADORES","");},
 draw(t){if(this.vs2&&this.ph==='select'){this.drawSel2(t);return;}if(this.vs2&&this.ph==='vsend'){this.drawVsEnd(t);return;}return _om.draw.call(this,t);}
});

// ======================= RANKING COMPARTIDO DE LA OFICINA (db + user) =======================
const RANK={db:null,user:null,me:null,rows:[],names:{},status:'cargando',saved:'',tab:0,
 async init(){if(this.started)return;this.started=true;try{if(typeof window==='undefined'||!window.claude||!window.claude.use){this.status='off';return;}
   const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);if(!db||!user){this.status='off';return;}
   this.db=db;this.user=user;try{this.me=await user.id();}catch(e){this.me=null;}
   db.collection('ranking').orderBy('score','desc').limit(100).onSnapshot(s=>{this.rows=s.docs.filter(d=>d.exists).map(d=>Object.assign({id:d.id},d.data()));this.status='ok';this.names_();},()=>{this.status='err';});}catch(e){this.status='off';}},
 async names_(){const ids=this.rows.map(r=>r.id).filter(id=>!(id in this.names));if(!ids.length)return;try{const ps=await this.user.profiles(ids);for(const id of ids)this.names[id]=((ps&&ps[id]&&ps[id].name)||'').toUpperCase();}catch(e){}},
 async submit(rec){if(!this.db||!this.me){this.saved='off';return;}const ref=this.db.doc('ranking/'+this.me);let cur={};try{const s=await ref.get();if(s.exists)cur=s.data()||{};}catch(e){}
   const better=rec.score>(cur.score||0);const n={score:Math.max(cur.score||0,rec.score),char:better?rec.char:(cur.char||rec.char),fats:Math.max(cur.fats||0,rec.fats),time:rec.cleared?((cur.time&&cur.time>0)?Math.min(cur.time,rec.time):rec.time):(cur.time||0),runs:(cur.runs||0)+1,clears:(cur.clears||0)+(rec.cleared?1:0),at:Date.now()};
   try{await ref.set(n);this.saved=better?'record':'ok';}catch(e){this.saved='no';}},
 sorted(tab){const r=this.rows.slice();if(tab===1)return r.filter(x=>x.time>0).sort((a,b)=>a.time-b.time);if(tab===2)return r.filter(x=>x.fats>0).sort((a,b)=>b.fats-a.fats||b.score-a.score);return r.filter(x=>x.score>0).sort((a,b)=>b.score-a.score);},
 pos(){const s=this.sorted(0);const i=s.findIndex(r=>r.id===this.me);return i>=0?i+1:0;}
};
const fmtT=s=>{s=Math.round(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
function drawRank(t){R(0,0,W,H,"#0B1020");for(let y=13;y<H;y+=8)R(0,y,W,1,"#101838");R(0,0,W,13,"#0B1020");R(0,13,W,1,12);T("← MENÚ",4,3,5);TC("RANKING DE LA OFICINA",3,10);
 const tabs=["PUNTAJE","TIEMPO","FATALITIES"];tabs.forEach((s,i)=>{const x=10+i*80,on=RANK.tab===i;R(x,17,76,12,on?1:"#141A30");BOXL(x,17,76,12,on?10:5);TC(s,20,on?10:6,1,null,x+38);});
 if(RANK.status!=='ok'){const msg=RANK.status==='cargando'?["CARGANDO RANKING..."]:["RANKING NO DISPONIBLE AQUÍ.","ÁBRELO DESDE EL LINK DE CLAUDE.AI","CON TU CUENTA DE LA EMPRESA."];msg.forEach((m,i)=>TC(m,60+i*12,i?6:7));return;}
 const rows=RANK.sorted(RANK.tab).slice(0,10);if(!rows.length){TC("AÚN NO HAY REGISTROS.",60,7);TC("¡JUEGA EL ARCADE Y SÉ EL PRIMERO!",74,10);return;}
 T("#",8,33,5);T("JUGADOR",22,33,5);T(["PUNTOS","TIEMPO","FATAL."][RANK.tab],150,33,5);T("LUCHADOR",196,33,5);
 rows.forEach((r,i)=>{const y=43+i*9,mine=r.id===RANK.me,col=i===0?10:(i===1?6:(i===2?9:(mine?12:7)));if(mine)R(4,y-1,W-8,9,"rgba(41,173,255,0.18)");
  T(String(i+1),8,y,col);T((RANK.names[r.id]||(mine?'TÚ':'JUGADOR')).slice(0,20),22,y,col);T(RANK.tab===0?String(r.score).padStart(6,'0'):(RANK.tab===1?fmtT(r.time):String(r.fats)),150,y,col);const C=DMC.find(c=>c.id===r.char);T(C?C.n.split(' ')[0]:'-',196,y,col);});
 const p=RANK.pos();R(0,H-12,W,12,"#0B1020");R(0,H-12,W,1,12);TC(p?"TU PUESTO: #"+p+" · ← → CAMBIA TABLA":"← → CAMBIA TABLA · ESC: VOLVER",H-9,p?12:6);}
// ---- enganche con el arcade: tiempo de carrera y envío del resultado
const _or={init:L8.init,update:L8.update,result:L8.result};
Object.assign(L8,{
 init(){_or.init.call(this);this.runT=0;this.sent=false;RANK.init();},
 update(dt){if(this.ph==='fight'&&this.sub==='go'&&!this.vs2)this.runT=(this.runT||0)+dt;_or.update.call(this,dt);},
 result(){const r=_or.result.call(this);if(!this.vs2&&!this.sent&&typeof BOT!=='undefined'&&!BOT){this.sent=true;const NR=this.ladder?this.ladder.length:DMC.length-1;RANK.submit({score:r.score||this.score||0,fats:this.fatN||0,cleared:this.wins>=NR,time:Math.round(this.runT||0),char:this.me0?this.me0.id:'alvaro'});}return r;}
});

// ======================= ONLINE (room) + FANTASMAS (db) =======================
const NET={st:'off',room:null,user:null,db:null,uid:null,myPeer:null,peers:[],names:{},char:0,sel:0,invite:null,pending:null,msg:'',msgT:0,m:null,rec:false,pid:0,
 async init(){if(this.started)return;this.started=true;try{if(typeof window==='undefined'||!window.claude||!window.claude.use){this.st='off';return;}
   const [room,user]=await Promise.all([window.claude.use('room'),window.claude.use('user')]);if(!room||!user){this.st='off';return;}
   this.room=room;this.user=user;try{this.uid=await user.id();}catch(e){}this.st='on';
   room.onPeers(ch=>{this.peers=ch.peers;const me=ch.peers.find(p=>p.isMe);if(me)this.myPeer=me.peer;this.resolve();});
   room.on('challenge',m=>{const d=m.data||{};if(m.isMe||d.to!==this.myPeer)return;if(this.m||this.invite){room.emit('answer',{to:m.peer,id:d.id,ok:false,busy:true}).catch(()=>{});return;}this.invite={from:m.peer,by:m.by,id:String(d.id||'').slice(0,12),ch:DMC.some(c=>c.id===d.ch)?d.ch:DMC[0].id,t:performance.now()};try{S.ok();}catch(e){}});
   room.on('answer',m=>{const d=m.data||{};if(m.isMe||d.to!==this.myPeer||!this.pending||d.id!==this.pending.id)return;const p=this.pending;this.pending=null;if(d.ok)this.startMatch('host',d.id,p.to,p.ch,DMC.some(c=>c.id===d.ch)?d.ch:DMC[0].id);else this.say(d.busy?'ESTÁ EN OTRA PELEA':'RECHAZÓ EL RETO');});
   this.lobby();}catch(e){this.st='off';}},
 say(t){this.msg=t;this.msgT=performance.now();},
 lobby(){if(this.room)this.room.presence({game:'dm',st:this.m?'busy':'lobby',ch:DMC[this.char].id,uid:this.uid||null}).catch(()=>{});},
 async resolve(){const ids=[...new Set(this.peers.map(p=>p.by||(p.presence&&p.presence.uid)).filter(Boolean))].filter(i=>!(i in this.names));if(!ids.length||!this.user)return;try{const ps=await this.user.profiles(ids);for(const i of ids)this.names[i]=((ps&&ps[i]&&ps[i].name)||'').toUpperCase();}catch(e){}},
 nameOf(p){const id=p.by||(p.presence&&p.presence.uid);return (id&&this.names[id])||'COMPAÑERO';},
 others(){return this.peers.filter(p=>!p.isMe&&p.kind!=='agent'&&p.presence&&p.presence.st&&p.presence.game!=='kart');},
 challenge(p){if(!this.room||this.pending||this.m)return;const id=Math.random().toString(36).slice(2,9);this.pending={id,to:p.peer,ch:DMC[this.char].id,t:performance.now()};this.room.emit('challenge',{to:p.peer,id,ch:DMC[this.char].id}).catch(()=>{this.pending=null;this.say('NO SE PUDO ENVIAR EL RETO');});this.say('RETO ENVIADO... ESPERANDO');},
 accept(){const v=this.invite;if(!v)return;this.invite=null;this.room.emit('answer',{to:v.from,id:v.id,ok:true,ch:DMC[this.char].id}).catch(()=>{});this.startMatch('guest',v.id,v.from,DMC[this.char].id,v.ch);},
 reject(){const v=this.invite;if(!v)return;this.invite=null;this.room.emit('answer',{to:v.from,id:v.id,ok:false}).catch(()=>{});},
 tick(){const now=performance.now();if(this.pending&&now-this.pending.t>15000){this.pending=null;this.say('NO RESPONDIÓ');}if(this.invite&&now-this.invite.t>15000)this.invite=null;},
 async startMatch(role,id,peer,myCh,otherCh,mrGiven){const hostCh=role==='host'?myCh:otherCh,guestCh=role==='host'?otherCh:myCh;
   this.m={role,id,peer,mr:null,rx:performance.now(),lastF:-1,prev:null,cur:null,curT:0,prevT:0,evQ:0,evBuf:[],evT:0,lastEvQ:-1,ni:{h:0,c:[0,0,0,0,0,0],dd:0,lp:null},seen:null,lpSeq:0,gone:0};this.lobby();
   try{this.m.mr=mrGiven||await this.room.join('dm-'+id);}catch(e){this.say('NO SE PUDO CONECTAR');this.m=null;this.lobby();return;}
   const m=this.m;if(!m)return;m.mr.on('ev',msg=>{if(msg.isMe||m.role!=='guest')return;const d=msg.data||{};for(const x of (Array.isArray(d.e)?d.e.slice(-40):[])){if(!Array.isArray(x))continue;const [q,e]=x;if(typeof q==='number'&&q>m.lastEvQ){m.lastEvQ=q;NET.play(ARCADE.clean(e));}}});
   m.mr.on('ctl',msg=>{if(msg.isMe)return;const d=msg.data||{};if(d.leave)this.end('TU RIVAL SALIÓ DE LA PELEA');});
   VS2=true;L8.howto=HOWTO1;openLevel(0);beginPlay();L8.online=role;L8.p1C=DMC.find(c=>c.id===hostCh)||DMC[0];L8.p2C=DMC.find(c=>c.id===guestCh)||DMC[1];L8.vsStart();},
 end(msg){const m=this.m;if(!m)return;this.m=null;try{m.mr&&m.mr.emit('ctl',{leave:true}).catch(()=>{});m.mr&&m.mr.leave().catch(()=>{});}catch(e){}if(msg)this.say(msg);L8.online=null;VS2=false;try{musicStop();stopAmbient();}catch(e){}state='online';this.lobby();},
 other(){const m=this.m;if(!m||!m.mr)return null;return m.mr.peers().find(p=>!p.isMe)||null;},
 // ---- registro de efectos y sonidos del anfitrión (para replicarlos en el invitado)
 push(e){const m=this.m;if(!m||m.role!=='host'||!this.rec)return;m.evBuf.push([++m.evQ,e]);if(m.evBuf.length>60)m.evBuf.shift();},
 flush(now){const m=this.m;if(!m||!m.mr||now-m.evT<90)return;m.evT=now;const fresh=m.evBuf.filter(([q])=>q>(m.sentQ||0)).slice(-24);if(!fresh.length)return;m.sentQ=fresh[fresh.length-1][0];m.mr.emit('ev',{e:fresh}).catch(()=>{});},
 play(e){try{if(!Array.isArray(e)||e.length>16)return;const k=e[0],a=e.slice(1),n=ARCADE.num;if(k==='t'){const o=a[6]&&typeof a[6]==='object'?{lp:a[6].lp?n(a[6].lp,20,20000,2000):0,dist:!!a[6].dist}:{};tone(['sine','square','sawtooth','triangle','pulse'].includes(a[0])?a[0]:'sine',n(a[1],20,8000,440),AT()+n(a[2],0,2,0),n(a[3],0.01,3,0.1),n(a[4],0,0.9,0.1),null,a[5]==null?null:n(a[5],20,8000,null),o);}else if(k==='n')noise(AT()+n(a[0],0,2,0),n(a[1],0.01,3,0.1),n(a[2],0,0.9,0.1),['lowpass','highpass','bandpass'].includes(a[3])?a[3]:'highpass',n(a[4],20,20000,1000),null,a[5]==null?undefined:n(a[5],0.0001,40,1));else if(NET_FX.has(k)&&typeof FX[k]==='function')FX[k].apply(FX,a.map(v=>typeof v==='number'?n(v,-5000,5000,0):(typeof v==='string'?v.slice(0,40):(typeof v==='boolean'?v:undefined))));}catch(err){}},vIn(i){if(!i||typeof i!=='object'||!Array.isArray(i.c)||i.c.length<6)return null;const n=v=>ARCADE.num(v,0,1e9,0);return {h:ARCADE.num(i.h,0,31,0)|0,c:i.c.slice(0,6).map(n),dd:i.dd===-1?-1:(i.dd===1?1:0),lp:Array.isArray(i.lp)&&i.lp.length===3?[n(i.lp[0]),ARCADE.num(i.lp[1],0,3,0)|0,ARCADE.num(i.lp[2],0,600,0)]:null};}
};
// envolver audio y efectos "de lógica" para grabarlos en el anfitrión
(function(){const T0=tone,N0=noise;tone=function(type,f,t,dur,vol,dest,slide,opts){if(NET.rec)NET.push(['t',type,f,Math.round((t-AT())*1000)/1000,dur,vol,slide??null,opts&&opts.lp?{lp:opts.lp,dist:!!opts.dist}:{}]);return T0(type,f,t,dur,vol,dest,slide,opts);};
 noise=function(t,dur,vol,type,freq,dest,q){if(NET.rec)NET.push(['n',Math.round((t-AT())*1000)/1000,dur,vol,type,freq,q??null]);return N0(t,dur,vol,type,freq,dest,q);};
 for(const k of ['hit','ko','boom','superRays','overlay','paperBurst','pixBurst','lupa','boxes','bills','rain','blood','clearOV']){const f0=FX[k];if(!f0)continue;FX[k]=function(...a){if(NET.rec)NET.push([k,...a.map(v=>typeof v==='number'?Math.round(v*100)/100:v)]);return f0.apply(FX,a);};}})();
// ---- instantáneas del estado de pelea
const NET_FX=new Set(['hit','ko','boom','superRays','overlay','paperBurst','pixBurst','lupa','boxes','bills','rain','blood','clearOV']);
const NET_DROP=new Set(['C','look','P','ai','isAI','owner']);function netF(o){const r={};if(o&&typeof o==='object')for(const k of Object.keys(o))if(!NET_DROP.has(k))r[k]=o[k];return r;}
const SKIP=new Set(['C','look','ai','isAI','aiT','aiHold','owner']);
function fsnap(f){const o={};for(const k in f){if(k[0]==='_'||SKIP.has(k))continue;const v=f[k];const t=typeof v;if(t==='number')o[k]=Math.round(v*100)/100;else if(t==='boolean'||t==='string')o[k]=v;else if(k==='cd'&&Array.isArray(v))o.cd=v.map(n=>Math.round(n*100)/100);else if(k==='shout'&&v)o.shout={t:v.t,k:Math.round(v.k*100)/100};}return o;}
function psnap(p,L){const o=fsnap(p);o._s=p.owner===L.me?'m':'f';return o;}
Object.assign(L8,{
 netSnap(){const L=this,side=f=>f===L.me?'m':'f';const fat=L.fat?{t:L.fat.t,stage:L.fat.stage,fin:L.fat.fin,ft:L.fat.ft,fail:L.fat.fail,failT:L.fat.failT,miss:L.fat.miss,judge:L.fat.judge&&{t:L.fat.judge.t,k:L.fat.judge.k},notes:L.fat.notes.map(n=>[n.lane,n.time,n.hit?1:0,n.missed?1:0]),d:L.me.C.id}:null;
  return {ph:L.ph,sub:L.sub,pt:Math.round(L.pt*100)/100,tm:Math.round((L.timer||0)*10)/10,rd:L.round,rw:L.rw,mt:L.meter,sh:Math.round((L.shake||0)*100)/100,kf:Math.round((L.koFlash||0)*100)/100,zm:Math.round((L.zoom||0)*100)/100,sw:!!L.swapped,vw:L.vsWin||0,
   mi:L.me&&L.me.C.id,fi:L.foe&&L.foe.C.id,p1:L.p1C&&L.p1C.id,p2:L.p2C&&L.p2C.id,me:L.me&&fsnap(L.me),foe:L.foe&&fsnap(L.foe),
   pj:(L.projs||[]).map(p=>psnap(p,L)),wl:(L.walls||[]).map(w=>({x:w.x,t:Math.round(w.t*100)/100,life:w.life,face:w.face,flash:w.flash||0,_s:side(w.owner)})),
   bm:L.beam?{t:L.beam.t,thick:!!L.beam.thick,multi:L.beam.multi,end:L.beam.end,touch:!!L.beam.touch,_s:side(L.beam.f)}:null,
   dc:(L.decoys||[]).map(q=>({x:q.x,y:q.y,face:q.face,t:q.t,life:q.life,c:q.C&&q.C.id})),sf:L.superFx?{t:L.superFx.t,n:L.superFx.n,_s:side(L.superFx.f)}:null,
   ft:fat,fe:L.fatEnd?{d:L.fatEnd.def===FATS[L.me.C.id]?L.me.C.id:(Object.keys(FATS).find(k=>FATS[k]===L.fatEnd.def)),stage:L.fatEnd.stage}:null,pd:L.puddles||[],fn:L.fin?{t:L.fin.t}:null,vwS:L.vsW?side(L.vsW):null};},
 netApply(s,a){const L=this,lerpN=(p,c)=>p==null?c:(p+(c-p)*a);
  L.ph=s.ph;L.sub=s.sub;L.pt=s.pt;L.timer=s.tm;L.round=s.rd;L.rw=s.rw;L.meter=s.mt;L.shake=Math.max(L.shake||0,s.sh);L.koFlash=s.kf;L.zoom=s.zm;L.swapped=s.sw;L.vsWin=s.vw;
  const C1=DMC.find(c=>c.id===s.p1),C2=DMC.find(c=>c.id===s.p2);if(C1)L.p1C=C1;if(C2)L.p2C=C2;L.me0=C1;L.ladder=[C2];L.stage=0;
  for(const [k,id] of [['me',s.mi],['foe',s.fi]]){if(!id||!s[k]||!DMC.some(c=>c.id===id)||typeof s[k]!=='object')continue;if(!L[k]||L[k].C.id!==id){L[k]=dmFighter(DMC.find(c=>c.id===id),s[k].x,s[k].face,k==='foe');}const f=L[k],pv=NET.m&&NET.m.prev&&NET.m.prev[k];Object.assign(f,netF(s[k]));if(pv&&pv.st===s[k].st){f.x=lerpN(pv.x,s[k].x);f.y=lerpN(pv.y,s[k].y);}}
  if(!L.me||!L.foe)return;const own=x=>x==='m'?L.me:L.foe;
  const old=new Map((L.projs||[]).map(p=>[p.id,p]));L.projs=(s.pj||[]).map(o=>{const p=old.get(o.id)||{};const pv=NET.m&&NET.m.prevP&&NET.m.prevP.get(o.id);Object.assign(p,o);p.owner=own(o._s);if(pv){p.x=lerpN(pv.x,o.x);p.y=lerpN(pv.y,o.y);}return p;});
  L.walls=(s.wl||[]).map(w=>Object.assign({},w,{owner:own(w._s)}));L.beam=s.bm?Object.assign({},s.bm,{f:own(s.bm._s)}):null;
  L.decoys=(s.dc||[]).map(q=>Object.assign({},q,{C:DMC.find(c=>c.id===q.c)||L.me.C}));L.superFx=s.sf?{t:s.sf.t,n:s.sf.n,f:own(s.sf._s)}:null;
  if(s.ft){const k=(performance.now()-(NET.m?NET.m.curT:0))/1000;L.fat=Object.assign(L.fat&&L.fat._g===s.ft.d?L.fat:{_g:s.ft.d},{t:s.ft.t+(s.ft.fin?0:Math.min(0.1,k)),stage:s.ft.stage,fin:s.ft.fin,ft:s.ft.ft,fail:s.ft.fail,failT:s.ft.failT,miss:s.ft.miss,judge:s.ft.judge,def:FATS[s.ft.d]||FATS.alvaro});const keep=L.fat.notes||[];L.fat.notes=s.ft.notes.map(([lane,time,hit,missed],i)=>Object.assign(keep[i]||{},{lane,time,hit:!!hit,missed:!!missed}));}else L.fat=null;
  L.fatEnd=s.fe?{def:FATS[s.fe.d]||FATS.alvaro,stage:s.fe.stage}:null;L.puddles=s.pd||[];L.fin=s.fn;if(s.vwS){L.vsW=own(s.vwS);L.vsL=L.vsW===L.me?L.foe:L.me;}}
});
// ---- comportamiento del anfitrión y del invitado
(function(){const _u=L8.update,_k=L8.key,_p=L8.pointer,_sf=L8.startFat,_fk=L8.fatKey,_pr=L8.proj;
 L8.proj=function(f,o){const r=_pr.call(this,f,o);const p=this.projs&&this.projs[this.projs.length-1];if(p&&p.id==null)p.id=++NET.pid;return r;};
 const H={ArrowLeft:'KeyA',ArrowRight:'KeyD',ArrowDown:'KeyS',ArrowUp:'KeyW',KeyA:'KeyA',KeyD:'KeyD',KeyS:'KeyS',KeyW:'KeyW',KeyZ:'KeyF',KeyJ:'KeyF',Space:'KeyF',KeyX:'KeyG',KeyK:'KeyG',KeyC:'KeyR',KeyL:'KeyR',KeyV:'KeyT',KeyI:'KeyT',KeyF:'KeyF',Enter:'Enter'};
 L8.key=function(c,down){const m=NET.m;if(!this.online||!m)return _k.call(this,c,down);
  if(this.online==='host'){if(this.ph==='vsend'){if(!down||this.pt<0.8)return;if(['Enter','Space','KeyZ','KeyF'].includes(c))this.vsStart();else if(c==='Backspace')NET.end();return;}if(this.ph==='vs'||this.ph==='select')return;const k=H[c];if(k)_k.call(this,k,down);return;}
  // invitado: capturar controles
  const ni=m.ni,bit={left:1,right:2,down:4,s0Hold:8,s1Hold:16};const hold={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down',KeyC:'s0Hold',KeyL:'s0Hold',KeyV:'s1Hold',KeyI:'s1Hold'}[c];
  if(this.ph==='vsend'){if(down&&(c==='Backspace'||c==='Escape'))NET.end();return;}
  if(this.sub==='fatal'&&down){const l=['ArrowLeft','ArrowDown','ArrowUp','ArrowRight'].indexOf(c),l2=['KeyA','KeyS','KeyW','KeyD'].indexOf(c);const ln=l>=0?l:l2;if(ln>=0){this.fatKey(ln);return;}}
  if(hold){if(down)ni.h|=bit[hold];else ni.h&=~bit[hold];if(down&&(hold==='left'||hold==='right')){const dir=hold==='right'?1:-1,now=performance.now();if(this._lt&&this._lt.dir===dir&&now-this._lt.t<260){ni.c[4]++;ni.dd=dir;this._lt=null;}else this._lt={dir,t:now};}if(down&&(ni.h&24)===24)ni.c[3]++;}
  if(down){const e={ArrowUp:0,KeyW:0,KeyZ:1,KeyJ:1,Space:1,KeyX:2,KeyK:2}[c];if(e!==undefined)ni.c[e]++;if(c==='KeyF')ni.c[5]++;}};
 L8.startFat=function(){if(this.online==='guest'&&NET.m){NET.m.ni.c[5]++;return;}return _sf.call(this);};
 L8.fatKey=function(l){if(this.online==='guest'&&NET.m){const f=this.fat;NET.m.ni.lp=[++NET.m.lpSeq,l,f?Math.round(f.t*1000)/1000:0];return;}return _fk.call(this,l);};
 L8.fatKeyAt=function(l,tt){const f=this.fat;if(!f||f.fin||f.fail)return;const save_t=f.t;f.t=tt;_fk.call(this,l);if(this.fat)this.fat.t=Math.max(save_t,this.fat.t);};
 L8.update=function(dt){const m=NET.m;if(!this.online||!m)return _u.call(this,dt);const now=performance.now();
  if(this.online==='host'){const o=NET.other();if(o)m.gone=0;else m.gone+=dt;if(m.gone>8){NET.end('TU RIVAL SE DESCONECTÓ');return;}
   const pi=NET.vIn(o&&o.presence&&o.presence.i);if(pi){const I=this.inp2||(this.inp2={});I.left=!!(pi.h&1);I.right=!!(pi.h&2);I.down=!!(pi.h&4);I.s0Hold=!!(pi.h&8);I.s1Hold=!!(pi.h&16);
    if(!m.seen)m.seen=pi.c.slice();const nm=['up','punch','kick','super','dash'];for(let i=0;i<5;i++)if(pi.c[i]>m.seen[i]){if(i===4)I.dash=pi.dd||1;else I[nm[i]]=true;}
    if(pi.c[5]>m.seen[5]&&this.swapped&&this.sub==='finish')_sf.call(this);m.seen=pi.c.slice();
    if(pi.lp&&pi.lp[0]!==m.lpSeen){m.lpSeen=pi.lp[0];if(this.swapped&&this.sub==='fatal')this.fatKeyAt(pi.lp[1],pi.lp[2]);}}
   if(this.ph==='vs'&&this.pt>2.4)this.startFight();
   NET.rec=true;try{_u.call(this,dt);}finally{NET.rec=false;}
   if(m.mr){let sn=this.netSnap();if(JSON.stringify(sn).length>3800){sn.pj=sn.pj.slice(-6);sn.pd=[];}m.mr.presence({s:sn}).catch(()=>{});}NET.flush(now);return;}
  // invitado
  const o=NET.other();const s=ARCADE.cleanOnce(o&&o.presence&&o.presence.s);if(s&&typeof s==='object'&&!Array.isArray(s)){m.rx=now;if(s!==m.cur){m.prev=m.cur;m.prevP=new Map(((m.cur&&m.cur.pj)||[]).map(p=>[p.id,p]));m.prevT=m.curT;m.cur=s;m.curT=now;}}
  else if(now-m.rx>8000){NET.end('SE PERDIÓ LA CONEXIÓN CON EL ANFITRIÓN');return;}
  if(m.cur){const iv=Math.max(20,m.curT-m.prevT||40),a=Math.min(1,(now-m.curT)/iv);this.netApply(m.cur,a);}
  // táctil del invitado: leer this.inp
  const I=this.inp||{},ni=m.ni;
  for(const [k,i] of [['up',0],['punch',1],['kick',2],['super',3]])if(I[k]){ni.c[i]++;I[k]=false;}if(I.dash){ni.c[4]++;ni.dd=I.dash;I.dash=0;}
  const tb=(I.left?1:0)|(I.right?2:0)|(I.down?4:0)|(I.s0Hold?8:0)|(I.s1Hold?16:0);
  if(m.mr)m.mr.presence({i:{h:ni.h|tb,c:ni.c,dd:ni.dd,lp:ni.lp}}).catch(()=>{});
  FX.update(dt);this.zoom=Math.max(0,(this.zoom||0)-dt*0.35);if(this.shake>0)this.shake=Math.max(0,this.shake-dt);};
 L8.pointer=function(type,x,y,id,pt){if(this.online==='guest'&&this.ph==='vsend'){if(type==='down')NET.end();return;}return _p.call(this,type,x,y,id,pt);};
})();
// ======================= FANTASMAS =======================
const GHOST={rows:[],duels:{},names:{},status:'cargando',sel:0,msg:'',cur:null,
 async init(){await RANK.init();if(this.started)return;this.started=true;const db=RANK.db;if(!db){this.status='off';return;}
  db.collection('ghosts').onSnapshot(s=>{this.rows=s.docs.filter(d=>d.exists).map(d=>Object.assign({id:d.id},d.data()));this.status='ok';this.resolve();},()=>{this.status='err';});
  db.collection('duels').onSnapshot(s=>{this.duels={};for(const d of s.docs)if(d.exists)this.duels[d.id]=(d.data().r||[]);},()=>{});},
 async resolve(){const ids=this.rows.map(r=>r.id).filter(i=>!(i in this.names));if(!ids.length||!RANK.user)return;try{const ps=await RANK.user.profiles(ids);for(const i of ids)this.names[i]=((ps&&ps[i]&&ps[i].name)||'').toUpperCase();}catch(e){}},
 list(){return this.rows.filter(r=>r.st&&r.n>0).sort((a,b)=>(b.at||0)-(a.at||0));},
 rec(vs){let w=0,l=0;for(const r of (this.duels[RANK.me]||[]))if(r.v===vs){r.w?w++:l++;}return [w,l];},
 mine(){let w=0,l=0;for(const k in this.duels)if(k!==RANK.me)for(const r of this.duels[k])if(r.v===RANK.me){r.w?l++:w++;}return [w,l];},
 P(st){const sec=Math.max(20,st.fr/60),atk=(st.p+st.k+st.cp+st.cs)/sec,sp=(st.s0+st.s1)/sec;const cl=(a,lo,hi)=>Math.max(lo,Math.min(hi,a));
  return {think:cl(0.32-atk*0.05,0.14,0.32),aggr:cl(0.3+atk*0.18,0.3,0.92),block:cl(0.2+st.bk/Math.max(1,st.fr)*1.4,0.2,0.85),sp:cl(sp*0.9,0.08,0.6),chg:cl(st.ch/Math.max(1,st.s0+st.s1),0.05,0.7),jump:cl(st.j/sec*0.35,0.02,0.35),anti:0.5,read:0.7,grab:cl(st.g/sec*2.5,0.05,0.6),tech:0.4,supP:cl(st.su/(sec/60)*0.35,0.2,0.9),react:0.24,pun:0.65};},
 async saveRun(st,ch){const db=RANK.db,me=RANK.me;if(!db||!me||st.fr<600)return;const ref=db.doc('ghosts/'+me);let cur={};try{const s=await ref.get();if(s.exists)cur=s.data()||{};}catch(e){}
  const a=cur.st||{};const w=cur.n?0.65:0;const out={};for(const k of Object.keys(st))out[k]=Math.round(((a[k]||0)*w+st[k]*(1-w))*100)/100;const chs=Object.assign({},cur.chs||{});chs[ch]=(chs[ch]||0)+1;const best=Object.keys(chs).sort((x,y)=>chs[y]-chs[x])[0];
  try{await ref.set({st:out,chs,ch:best,n:(cur.n||0)+1,at:Date.now()});}catch(e){}},
 async duel(vs,won){const db=RANK.db,me=RANK.me;if(!db||!me)return;const ref=db.doc('duels/'+me);let r=[];try{const s=await ref.get();if(s.exists)r=(s.data()||{}).r||[];}catch(e){}r.push({v:vs,w:won?1:0,at:Date.now()});try{await ref.set({r:r.slice(-60)});}catch(e){}}
};
// grabar el estilo del jugador (arcade 1 jugador) y pelear contra fantasmas
(function(){const _u=L8.update,_i=L8.init,_r=L8.result,_pk=L8.pick,_sf=L8.startFight;
 L8.init=function(){_i.call(this);this.gst={fr:0,p:0,k:0,cp:0,cs:0,j:0,s0:0,s1:0,ch:0,su:0,g:0,dsh:0,bk:0};this._pst=null;};
 L8.update=function(dt){const r=_u.call(this,dt);if(!this.vs2&&!this.online&&!this.ghostVs&&typeof BOT!=='undefined'&&!BOT&&this.ph==='fight'&&this.sub==='go'&&this.me&&this.gst){const s=this.gst,f=this.me,st=f.st;s.fr++;if(st==='back'||st==='bstun')s.bk++;
   if(st!==this._pst){if(st==='punch')s.p++;else if(st==='kick')s.k++;else if(st==='cpunch')s.cp++;else if(st==='csweep')s.cs++;else if(st==='jump')s.j++;else if(st==='sp'){s[f.slot?'s1':'s0']++;if(f.chg)s.ch++;}else if(st==='super')s.su++;else if(st==='grab')s.g++;else if(st==='dash')s.dsh++;}this._pst=st;}
  if(this.ghostVs&&(this.ph==='quote'||this.ph==='continue')&&!this.ghostDone){this.ghostDone=true;const won=this.ph==='quote';GHOST.duel(this.ghostVs.id,won);GHOST.msg=won?'¡LE GANASTE AL FANTASMA DE '+this.ghostVs.name+'!':'EL FANTASMA DE '+this.ghostVs.name+' TE GANÓ';try{won?S.win():S.lose();musicStop();stopAmbient();}catch(e){}state='ghosts';}
  return r;};
 L8.result=function(){const r=_r.call(this);if(!this.vs2&&!this.ghostVs&&this.gst&&this.me0&&typeof BOT!=='undefined'&&!BOT){GHOST.saveRun(this.gst,this.me0.id);this.gst=null;}return r;};
 L8.pick=function(i){if(!this.ghostVs)return _pk.call(this,i);this.me0=i===DMC.length?DMC[Math.floor(RND()*DMC.length)]:DMC[i];this.ladder=[DMC.find(c=>c.id===this.ghostVs.ch)||DMC[1]];this.stage=0;S.win();this.startVS();};
 L8.startFight=function(){const r=_sf.call(this);if(this.ghostVs){this.P=GHOST.P(this.ghostVs.st);this.foe.ghost=true;}return r;};})();

const VERSION="DM V1.6";
// ======================= motor de juego =======================
const LEVELS=[L8];
const GRADES={S:'SENTENCIA FIRME',A:'HA LUGAR',B:'ACOGIDA EN PARTE',C:'EN APELACIÓN',F:'RECURSO RECHAZADO'};
const SAVE_KEY='alvaro-deathmatch-v1';
let save={unlocked:1,best:{},exp:false,muted:false,blood:true};
try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s)save=Object.assign(save,s);}catch(e){}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(e){}}
A.muted=save.muted;
let VS2=false;
let state='title',menuIx=0,cur=-1,L=null,RES=null,expT=0,BOT=location.hash==='#bot';
function openLevel(i){audioInit();cur=i;L=LEVELS[i];state='intro';S.ok();}
function beginPlay(){musicStop();stopAmbient();if(A.mus)A.mus.gain.value=0.55;L.init();state='play';}
function finishLevel(o){if(state!=='play')return;musicStop();stopAmbient();const r=L.result();const fail=o.fail||r.grade==='F';RES=Object.assign(r,{fail,grade:fail?'F':r.grade,i:cur});
  if(!fail){const b=save.best[L.id];if(!b||r.score>b.score)save.best[L.id]={score:r.score,grade:r.grade};persist();S.win();}else S.lose();
  state='results';}
function pause(){if(state!=='play')return;PAUSE_PG=0;try{window.speechSynthesis&&speechSynthesis.cancel();}catch(e){}state='pause';if(A.ctx)A.ctx.suspend();}
function resume(){state='play';if(A.ctx)A.ctx.resume();}
function quit(){if(NET.m){NET.end();return;}try{window.speechSynthesis&&speechSynthesis.cancel();}catch(e){}if(A.ctx)A.ctx.resume();musicStop();stopAmbient();state='menu';}
function afterResults(){S.ok();if(RES.expNew){RES.expNew=false;state='exp';expT=0;return;}state='menu';if(!RES.fail)menuIx=Math.min(cur+1,LEVELS.length-1);}
function menuItems(){const it=LEVELS.map((l,i)=>({type:'lvl',i,locked:false}));it.push({type:'vs2'});it.push({type:'online'});it.push({type:'ghosts'});it.push({type:'rank'});it.push({type:'blood'});it.push({type:'snd'});it.push({type:'arcade'});return it;}
function menuSelect(m){if(!m)return;if(m.type==='arcade'){ARCADE.back();return;}if(m.type==='lvl'){if(m.locked){S.no();return;}VS2=false;L8.howto=HOWTO1;openLevel(m.i);}else if(m.type==='vs2'){VS2=true;L8.howto=HOWTO2;openLevel(0);}else if(m.type==='rank'){RANK.init();state='rank';S.ok();}else if(m.type==='online'){NET.init();state='online';S.ok();}else if(m.type==='ghosts'){GHOST.init();GHOST.sel=0;state='ghosts';S.ok();}else if(m.type==='exp'){S.ok();state='exp';expT=0;}else if(m.type==='blood'){save.blood=!save.blood;persist();S.move();}else{save.muted=!save.muted;setMuted(save.muted);persist();S.move();}}
addEventListener('keydown',e=>{const k=e.code;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Backspace'].includes(k))e.preventDefault();
  if(state==='play'){if(e.repeat&&!['Backspace'].includes(k))return;if(k==='Escape'||k==='KeyP'){pause();return;}L.key(k,true);return;}
  audioInit();
  if(state==='title'){if(k==='Enter'||k==='Space'){S.ok();state='menu';}if(k==='Escape')ARCADE.back();return;}
  if(state==='menu'){const it=menuItems();if(k==='ArrowDown'||k==='KeyS'){menuIx=(menuIx+1)%it.length;S.move();}if(k==='ArrowUp'||k==='KeyW'){menuIx=(menuIx+it.length-1)%it.length;S.move();}if(k==='Enter'||k==='Space')menuSelect(it[menuIx]);if(k==='Escape')state='title';return;}
  if(state==='intro'){if(k==='Enter'||k==='Space')beginPlay();if(k==='Escape')state='menu';return;}
  if(state==='pause'){if(k==='Escape'||k==='KeyP'||k==='Enter')resume();if(k==='KeyQ')quit();if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(k)){PAUSE_PG++;S.move();}return;}
  if(state==='results'){if(k==='KeyR'){openLevel(cur);beginPlay();return;}if(k==='Enter'||k==='Space'||k==='Escape')afterResults();return;}
  if(state==='exp'){if(['Enter','Escape','Space'].includes(k)){state='menu';S.ok();}}
  if(state==='online'){if(NET.saKey&&NET.saKey(k))return;if(NET.invite){if(k==='Enter'||k==='Space')NET.accept();else if(k==='Escape'||k==='Backspace')NET.reject();return;}if(k==='Escape'||k==='Backspace'){state='menu';S.ok();return;}if(k==='ArrowLeft'||k==='KeyA'){NET.char=(NET.char+DMC.length-1)%DMC.length;NET.lobby();S.move();}if(k==='ArrowRight'||k==='KeyD'){NET.char=(NET.char+1)%DMC.length;NET.lobby();S.move();}if(k==='ArrowUp'||k==='KeyW'){NET.sel=Math.max(0,NET.sel-1);S.move();}if(k==='ArrowDown'||k==='KeyS'){NET.sel++;S.move();}if(k==='Enter'||k==='Space'){const p=NET.others()[NET.sel];if(p&&p.presence.st!=='busy')NET.challenge(p);else S.no();}return;}
  if(state==='ghosts'){if(k==='Escape'||k==='Backspace'){state='menu';GHOST.msg='';S.ok();return;}if(k==='ArrowUp'||k==='KeyW'){GHOST.sel=Math.max(0,GHOST.sel-1);S.move();}if(k==='ArrowDown'||k==='KeyS'){GHOST.sel++;S.move();}if(k==='Enter'||k==='Space'){const r=GHOST.list()[GHOST.sel];if(r)startGhost(r);}return;}
  if(state==='rank'){if(['Escape','Backspace','Enter'].includes(k)){state='menu';S.ok();}else if(k==='ArrowRight'||k==='KeyD'){RANK.tab=(RANK.tab+1)%3;S.move();}else if(k==='ArrowLeft'||k==='KeyA'){RANK.tab=(RANK.tab+2)%3;S.move();}}});
addEventListener('keyup',e=>{if(state==='play')L.key(e.code,false);});
function cpos(e){const rc=cv.getBoundingClientRect();return [(e.clientX-rc.left)/rc.width*W,(e.clientY-rc.top)/rc.height*H];}
const MENU_Y=24,MENU_H=12;
cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.focus();try{cv.setPointerCapture(e.pointerId);}catch(_){ }audioInit();const [x,y]=cpos(e);
  if(state==='play'){const id=hitBtn(x,y);if(id==='__pause'){pause();return;}if(id){L.button(id);return;}L.pointer('down',x,y,e.pointerId,e.pointerType);return;}
  if(state==='title'){S.ok();state='menu';return;}
  if(state==='menu'){const it=menuItems(),ix=Math.floor((y-MENU_Y+2)/MENU_H);if(ix>=0&&ix<it.length){menuIx=ix;menuSelect(it[ix]);}return;}
  if(state==='intro'){if(y<16&&x<60){state='menu';return;}beginPlay();return;}
  if(state==='pause'){if(x>=94){PAUSE_PG++;S.move();return;}if(y>88)quit();else resume();return;}
  if(state==='results'){if(x<W/2){openLevel(cur);beginPlay();}else afterResults();return;}
  if(state==='exp'){state='menu';S.ok();}
  if(state==='online'){if(NET.saTap&&NET.saTap(x,y))return;if(y<14&&x<60){state='menu';S.ok();return;}if(NET.invite){if(y>=50&&y<=90)NET.accept();else NET.reject();return;}if(x<80){NET.char=(NET.char+1)%DMC.length;NET.lobby();S.move();return;}const i=Math.floor((y-26)/10),os=NET.others();if(i>=0&&i<os.length){if(i===NET.sel&&os[i].presence.st!=='busy')NET.challenge(os[i]);NET.sel=i;S.move();}return;}
  if(state==='ghosts'){if(y<14&&x<60){state='menu';S.ok();return;}const i=Math.floor((y-39)/9),rows=GHOST.list();if(i>=0&&i<rows.length){if(i===GHOST.sel)startGhost(rows[i]);GHOST.sel=i;S.move();}return;}
  if(state==='rank'){if(y<14&&x<60){state='menu';S.ok();return;}if(y>=17&&y<=29){const i=Math.floor((x-10)/80);if(i>=0&&i<3){RANK.tab=i;S.move();}return;}state='menu';S.ok();}});
cv.addEventListener('pointermove',e=>{if(state==='play'){const [x,y]=cpos(e);L.pointer('move',x,y,e.pointerId,e.pointerType);}});
cv.addEventListener('pointerup',e=>{if(state==='play'){const [x,y]=cpos(e);L.pointer('up',x,y,e.pointerId,e.pointerType);}});
cv.addEventListener('pointercancel',e=>{if(state==='play'){L.pointer('up',-1,-1,e.pointerId,e.pointerType);}});
addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});

// ======================= pantallas =======================
function drawTitle(t){R(0,0,W,H,"#0C1424");for(let i=0;i<9;i++){const x=4+i*28;R(x,60,24,64,"#1B2438");for(let u=0;u<10;u++)PX(x+5,63+u*6,Math.sin(t*(3+(i+u)%5)+i+u)>0.2?11:"#2A3A2A");}
  ["#FFEC27","#29ADFF","#FF77A8","#00E436"].forEach((c,i)=>{R(0,52+i*2,W,1,c);const x=((t*(90+i*25)+i*40)%(W+20))-10;R(x,52+i*2,5,1,7);});R(0,124,W,20,"#6A7488");
  R(0,14,W,34,"rgba(0,0,0,0.6)");TC("DEATHMATCH",18,8,3,2);TC("LA JORNADA · EDICIÓN PELEA",42,7,1,0);
  {const n=DMC.length,st=Math.min(32,Math.floor((W-12)/n)),x0=Math.round((W-((n-1)*st+28))/2);for(let k=0;k<n;k++){const x=x0+k*st;L8.portrait(DMC[k],x,74,28,28,2,1,47);BOXL(x-1,73,30,30,Math.floor(t*3+k)%n===0?10:1);}}
  R(40,108,176,11,"rgba(0,0,0,0.7)");TC(DMC.length+" LUCHADORES · FATALITIES",110,10,1,0);
  if(Math.floor(t*2.5)%2===0)TC("ENTER O TOCA PARA EMPEZAR",128,7,1,0);T(VERSION,W-TW(VERSION)-3,H-9,5);}
function drawMenu(t){sky(t);R(0,0,W,H,"rgba(7,10,20,0.75)");R(0,0,W,13,"#0B1020");R(0,13,W,1,12);T("MENÚ",4,3,10);T("ESC: VOLVER",W-70,3,5);
  const it=menuItems();it.forEach((m,ix)=>{const y=MENU_Y+ix*MENU_H,sel=ix===menuIx;if(sel)R(8,y-2,240,11,1);if(sel&&Math.floor(t*4)%2)T("▶",10,y,10);
    if(m.type==='lvl'){const l=LEVELS[m.i],b=save.best[l.id];T((m.i+1)+". "+(m.locked?"????????":l.name),20,y,m.locked?5:(sel?7:6));if(m.locked)SPR(LOCK,236,y,{y:5,k:1});else if(b){T(String(b.score).padStart(5,'0'),166,y,6);T(b.grade,232,y,b.grade==='S'?10:11);}else T("NUEVA",214,y,12);}
    else if(m.type==='vs2')T("2. VERSUS · 2 JUGADORES",20,y,sel?7:6);else if(m.type==='online')T("3. ONLINE · RETA A UN COMPAÑERO",20,y,sel?12:6);else if(m.type==='ghosts')T("4. FANTASMAS DE LA OFICINA",20,y,sel?14:6);else if(m.type==='rank')T("5. RANKING DE LA OFICINA",20,y,sel?10:9);else if(m.type==='exp')T("EXPEDIENTE COMPLETO",20,y,sel?14:13);else if(m.type==='blood')T("SANGRE: "+(save.blood?"SÍ":"NO (CONFETI)"),20,y,sel?7:6);else if(m.type==='arcade')T("← CAMBIAR DE JUEGO",20,y,sel?10:5);else T("SONIDO: "+(save.muted?"APAGADO":"ENCENDIDO"),20,y,sel?7:6);});
  const m=it[menuIx];let hint=m.type==='lvl'?(m.locked?"GANA LA CAUSA ANTERIOR PARA ABRIRLA":LEVELS[m.i].sub):(m.type==='vs2'?"MISMO TECLADO: WASD VS FLECHAS":m.type==='rank'?"PUNTAJE, TIEMPO Y FATALITIES DE TODOS":m.type==='online'?"PELEA EN VIVO CON QUIEN ESTÉ CONECTADO":m.type==='ghosts'?"PELEA CONTRA EL ESTILO DE TUS COMPAÑEROS":m.type==='exp'?"TU FICHA DE PERSONAJE":(m.type==='blood'?"FATALITIES CON SANGRE O CON CONFETI":m.type==='arcade'?"VOLVER A ELEGIR ENTRE DEATHMATCH Y DEATHKART":"ENTER PARA CAMBIAR"));
  R(0,H-14,W,14,"#0B1020");R(0,H-14,W,1,12);TC(hint.toUpperCase().slice(0,41),H-10,7);}

// ---------------- pantallas ONLINE y FANTASMAS ----------------
function hdr(title){R(0,0,W,H,"#0B1020");for(let y=13;y<H;y+=8)R(0,y,W,1,"#101838");R(0,0,W,13,"#0B1020");R(0,13,W,1,12);T("← MENÚ",4,3,5);TC(title,3,10);}
function drawOnline(t){NET.tick();hdr("ONLINE");
 if(NET.st!=='on'){TC(NET.started?"CONECTANDO...":"",60,7);if(NET.started&&NET.st==='off'){TC("NO SE PUDO INICIAR EL ONLINE.",56,7);TC("RECARGA LA PÁGINA.",68,7);}return;}
 const C=DMC[NET.char];R(4,17,74,92,"#1B2440");BOXL(4,17,74,92,12);L8.portrait(C,5,18,72,70,2,1,42);TC("TU LUCHADOR",90,6,1,null,41);TC(C.n,99,10,1,null,41);TC("← →",108,5,1,null,41);
 const os=NET.others();T("CONECTADOS AHORA: "+os.length,84,18,7);
 if(!os.length){T("NADIE MÁS TIENE EL JUEGO ABIERTO.",84,34,6);T("COMPARTE EL LINK Y AVÍSALES :)",84,44,6);}
 NET.sel=Math.max(0,Math.min(NET.sel,os.length-1));os.slice(0,8).forEach((p,i)=>{const y=28+i*10,sel=i===NET.sel,busy=p.presence.st==='busy';if(sel)R(82,y-2,170,10,1);const ch=DMC.find(c=>c.id===p.presence.ch);T((sel?'▶ ':'  ')+NET.nameOf(p).slice(0,16),84,y,busy?5:(sel?10:7));T(busy?'PELEANDO':(ch?ch.n.split(' ')[0].slice(0,8):''),204,y,busy?8:6);});
 if(NET.invite){const p=NET.peers.find(q=>q.peer===NET.invite.from);const ch=DMC.find(c=>c.id===NET.invite.ch);R(20,50,216,40,0);BOXL(20,50,216,40,10);TC("¡"+(p?NET.nameOf(p):'ALGUIEN')+" TE RETA!",55,10);TC("CON "+(ch?ch.n:'?'),66,7);TC(Math.floor(t*3)%2?"ENTER: ACEPTAR · ESC: RECHAZAR":"TOCA AQUÍ PARA ACEPTAR",78,12);}
 R(0,H-24,W,24,"#0B1020");R(0,H-24,W,1,12);const msg=NET.msg&&performance.now()-NET.msgT<5000?NET.msg:(NET.pending?"RETO ENVIADO... ESPERANDO RESPUESTA":"↑ ↓ ELIGE · ENTER: RETAR · ESC: MENÚ");TC(msg,H-20,NET.pending?10:7);TC("SE JUEGA CON TUS CONTROLES DE SIEMPRE",H-10,5);}
function drawGhosts(t){hdr("FANTASMAS DE LA OFICINA");
 if(GHOST.status!=='ok'){TC(GHOST.status==='cargando'?"CARGANDO...":"DISPONIBLE SOLO EN EL LINK DE CLAUDE.AI",60,7);return;}
 const rows=GHOST.list();const [mw,ml]=GHOST.mine();T("TU FANTASMA: "+(rows.find(r=>r.id===RANK.me)?"ACTIVO":"SIN ENTRENAR"),6,18,12);T("GANÓ "+mw+" · PERDIÓ "+ml,W-6-TW("GANÓ "+mw+" · PERDIÓ "+ml),18,7);
 if(!rows.length){TC("AÚN NO HAY FANTASMAS.",60,7);TC("CADA ARCADE QUE JUEGAS ENTRENA EL TUYO.",72,6);return;}
 T("COMPAÑERO",8,30,5);T("LUCHADOR",136,30,5);T("RÉCORD",206,30,5);GHOST.sel=Math.max(0,Math.min(GHOST.sel,rows.length-1));
 rows.slice(0,9).forEach((r,i)=>{const y=40+i*9,sel=i===GHOST.sel,mine=r.id===RANK.me;if(sel)R(4,y-1,W-8,9,1);const ch=DMC.find(c=>c.id===r.ch);const [w,l]=GHOST.rec(r.id);T((GHOST.names[r.id]||'COMPAÑERO').slice(0,mine?15:20)+(mine?' (TÚ)':''),8,y,sel?10:7);T(ch?ch.n.split(' ')[0]:'-',136,y,6);T(w+"-"+l,210,y,w>l?11:(l>w?8:7));});
 R(0,H-12,W,12,"#0B1020");R(0,H-12,W,1,12);TC(GHOST.msg||"↑ ↓ ELIGE · ENTER: PELEAR",H-9,GHOST.msg?10:7);}
function startGhost(r){GHOST.msg='';VS2=false;L8.howto=HOWTO1;openLevel(0);beginPlay();L8.ghostVs={id:r.id,ch:r.ch,st:r.st,name:GHOST.names[r.id]||'COMPAÑERO'};L8.ghostDone=false;}
function drawIntro(t){R(0,0,W,H,"#0B1020");for(let y=0;y<H;y+=4)R(0,y,W,1,"#0E1428");T("← MENÚ",4,4,5);TC(VS2?"VERSUS":"MODO ARCADE",10,6);TC(L.name,22,10,2,2);TC(VS2?"2 JUGADORES · MISMO TECLADO":L.sub.toUpperCase(),44,12);
  R(12,56,232,64,"#141C36");BOXL(12,56,232,64,1);L.howto.forEach((s,i)=>TC(s,61+i*10,7));if(Math.floor(t*2.5)%2===0)TC("ENTER O TOCA PARA EMPEZAR",128,10,1,0);}
let PAUSE_PG=0;
function moveList(C,keys){const strip=s=>String(s||'').replace(/[¡!]/g,'');const k=keys,two=k.p.length>1;
 return [[two?k.p+"x3":k.p+k.p+k.p,"3 GOLPES+"+strip(FIN_SH[C.id]||'REMATE')],[two?k.k+"x3":k.k+k.k+k.k,"3 PATADAS (ALTA)"],[two?k.p+"x2+"+k.k[0]:k.p+k.p+k.k,"REMATE BARRIDA"],[two?"COMBO+E":k.p+k.p+"+"+k.s1,"CANCELA A ESPECIAL"],[k.d+"+"+k.p,"GOLPES BAJOS"],
  [k.s1,C.sn[0]],["MANT",strip(MVS[C.s[0]]&&MVS[C.s[0]][1])],[k.s2,C.sn[1]],["MANT",strip(MVS[C.s[1]]&&MVS[C.s[1]][1])],
  [k.f+"+"+k.p,"AGARRE (PEGADO)"],[k.dash,"DASH · ATRÁS CUBRE"],[two?"E1+E2":k.s1+"+"+k.s2,"SÚPER (BARRA LLENA)"],["*S",(SUPERS[C.id]?SUPERS[C.id].n:'')],[k.fat,"FATALITY (AL GANAR)"],["*F",(FATS[C.id]?FATS[C.id].n:'')]];}
function drawPause(t){R(0,0,W,H,"rgba(5,6,12,0.86)");
 R(4,2,86,140,"#0B1020");BOXL(4,2,86,140,1);TC("PAUSA",18,10,2,0,47);R(10,58,74,22,1);TC("SEGUIR",62,7,1,null,47);TC("ESC",71,6,1,null,47);R(10,90,74,22,2);TC("SALIR",94,7,1,null,47);TC("Q",103,6,1,null,47);
 const vs=L&&L.vs2,P1=vs?L.p1C:(L&&L.me0)||DMC[0],P2=vs?L.p2C:(L&&L.ladder&&L.ladder[L.stage])||DMC[1];const pages=[[P1,vs?"J1":"TÚ"],[P2,vs?"J2":"RIVAL"]];const [C,lab]=pages[PAUSE_PG%2];if(!C)return;
 const K=vs?(PAUSE_PG%2?{p:'K',k:'L',s1:'I',s2:'O',d:'↓',f:'→',dash:'←← →→',fat:'K'}:{p:'F',k:'G',s1:'R',s2:'T',d:'S',f:'D',dash:'AA DD',fat:'F'}):(TOUCHUI?{p:'GOL',k:'PAT',s1:'ES1',s2:'ES2',d:'↓',f:'→',dash:'←← →→',fat:'TOCA'}:{p:'Z',k:'X',s1:'C',s2:'V',d:'↓',f:'→',dash:'←← →→',fat:'F'});
 R(94,2,158,140,"#0B1020");BOXL(94,2,158,140,PAUSE_PG%2?8:12);T((lab+": "+C.n).slice(0,21),98,5,PAUSE_PG%2?8:12);T("←→",238,5,5);R(95,14,156,1,"#223");
 moveList(C,K).forEach(([a,b],i)=>{const y=17+i*8.3,h=a==='MANT',nm=a[0]==='*';if(!nm)T(a,h?100:98,y,h?5:10);T(String(b).slice(0,nm?24:19),nm?100:132,y,nm?(a==='*S'?12:8):(h?6:7));});}

function drawResults(t){sky(t);R(0,0,W,H,"rgba(7,10,20,0.8)");const f=RES.fail;R(14,10,228,124,0);R(16,12,224,120,f?"#3A0E1C":1);
  TC(f?"DERROTA":"¡VICTORIA!",18,f?8:10);TC(LEVELS[RES.i].name,28,6);
  T(RES.grade,40,40,f?8:(RES.grade==='S'?10:11),5,'#0B1020');const gt=GRADES[RES.grade];if(gt.length>12){const i=gt.indexOf(' ',Math.floor(gt.length/2)-3);TC(gt.slice(0,i),80,7,1,null,55);TC(gt.slice(i+1),90,7,1,null,55);}else TC(gt,80,7,1,null,55);
  RES.lines.forEach(([n,v],i)=>{T(n,98,42+i*10,6);T(String(v),236-TW(String(v)),42+i*10,7);});T("PUNTAJE",100,86,9);T(String(RES.score).padStart(5,'0'),232-TW("00000"),86,10);
  if(RES.expNew&&!f)TC("¡DESBLOQUEASTE TU EXPEDIENTE!",102,14);
  {const sv=RANK.saved,p=RANK.pos();const msg=sv==="record"?"¡NUEVO RÉCORD EN EL RANKING!"+(p?" #"+p:""):(sv==="ok"?"GUARDADO EN EL RANKING"+(p?" · TU PUESTO #"+p:""):(sv==="no"?"TU PUNTAJE NO SE PUDO GUARDAR":""));if(msg&&!RES.expNew)TC(msg,102,sv==="record"?10:(sv==="no"?8:12));}
  R(22,112,100,14,2);TC("R: REPETIR",116,7,1,null,72);R(134,112,100,14,3);TC("ENTER: SEGUIR",116,7,1,null,184);}
const STATS=[["CONTRATOS",8,12],["DATOS",9,11],["CIBER",7,8],["CÓDIGO",7,10],["BOX",6,9]];
const ITEMS=["PUC · COMPLIANCE","UPENN · REG. COMPLIANCE","U. DE CHILE · DATOS (EN CURSO)","HARVARD CS50 · LAWYERS"];
function drawExp(t){expT+=1/60;R(0,0,W,H,"#0B1020");R(6,14,244,128,7);R(8,16,240,124,1);g.save();g.translate(0,4);SPR(ALV,16,20,AMAP,3);
  T("ÁLVARO",52,20,10,1,0);T("LV 3.2",52,31,7);T("CLASE: COUNSEL",52,42,12);const total=LEVELS.reduce((s,x)=>s+((save.best[x.id]||{}).score||0),0);T("PUNTAJE "+total,52,53,9);
  STATS.forEach(([nm,v,c],i)=>{const y=20+i*11;T(nm,146,y,6);const fill=Math.min(v,Math.floor(Math.max(0,expT-0.3)*10-i*2));for(let b=0;b<10;b++)R(204+b*4,y,3,7,b<fill?c:5);});
  R(14,76,228,1,13);T("INVENTARIO",16,80,9);ITEMS.forEach((s,i)=>{if(expT>0.8+i*0.3)T("▶ "+s,16,90+i*9,7);});g.restore();
  if(expT>2.5&&Math.floor(t*3)%2)TC("PRÓXIMA MISIÓN: 01.12.2026",4,10,1,0);}

// ======================= bucle =======================
let lastT=performance.now();
function loop(now){requestAnimationFrame(loop);try{loopBody(now);}catch(e){console.error(e);if(NET.m)NET.end('ERROR EN LA PARTIDA ONLINE');}}
function loopBody(now){if(typeof FX!=='undefined')FX.clear();const dt=Math.min(0.05,(now-lastT)/1000);lastT=now;const t=now/1000;BTNS=[];musicTick();
  if(state==='title')drawTitle(t);else if(state==='menu')drawMenu(t);else if(state==='intro')drawIntro(t);else if(state==='rank')drawRank(t);else if(state==='online')drawOnline(t);else if(state==='ghosts')drawGhosts(t);
  else if(state==='play'){L.update(dt);if(state==='play')L.draw(t);else if(state==='results')drawResults(t);}
  else if(state==='pause'){L.draw(t);BTNS=[];drawPause(t);}
  else if(state==='results')drawResults(t);else if(state==='exp')drawExp(t);}
window.__g={open:openLevel,begin:beginPlay,get state(){return state},get L(){return L},get RES(){return RES},save,set bot(v){BOT=v},set st(v){state=v}};
requestAnimationFrame(loop);cv.focus();


// ---- DeathMatch · online por código o link para la versión independiente (1 vs 1)
(function(){if(typeof ARCADE_SA==='undefined')return;const SA=ARCADE_SA,NAMES=SA.NAMES,myUid=SA.myUid;
 NET.sa={sel:0,wait:null,busy:false};
 const validCh=id=>DMC.some(c=>c.id===id)?id:DMC[0].id;
 const clearHash=()=>{try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}};
 NET.createSA=async function(){if(this.m||this.sa.wait||this.sa.busy)return;SA.ensureName();const code=SA.code();this.sa.busy=true;this.say('CREANDO SALA...');
  let mr;try{mr=await this.room.join('dm-'+code,{host:true});}catch(e){this.sa.busy=false;this.say(String(e.message||'NO SE PUDO CREAR LA SALA').toUpperCase());return;}
  this.sa.busy=false;if(state!=='online'){mr.leave();return;}this.sa.wait={code,mr};mr.presence({nm:NAMES[myUid]});
  mr.on('challenge',msg=>{const w=this.sa.wait;if(!w||w.mr!==mr||this.m)return;const d=msg.data||{};this.rival=ARCADE.nick(d.nm)||'RIVAL';
   mr.emit('answer',{ok:true,ch:DMC[this.char].id,nm:NAMES[myUid]});this.sa.wait=null;S.ok();this.startMatch('host',code,msg.peer,DMC[this.char].id,validCh(d.ch),mr);});
  try{history.replaceState(null,'','#pelea='+code);}catch(e){}
  const ok=await SA.copy(SA.link('pelea',code));this.say(ok?'LINK COPIADO: PÉGALO EN TEAMS':'COMPARTE EL CÓDIGO '+code.toUpperCase());};
 NET.joinSA=async function(raw){if(this.m||this.sa.wait||this.sa.busy)return;const code=SA.validCode(raw);if(!code){this.say('CÓDIGO INVÁLIDO');return;}SA.ensureName();this.sa.busy=true;this.say('CONECTANDO...');
  let mr;try{mr=await this.room.join('dm-'+code,{host:false});}catch(e){this.sa.busy=false;clearHash();this.say(String(e.message||'NO SE PUDO UNIR').toUpperCase());return;}
  let answered=false;const fin=msg=>{if(answered)return;answered=true;this.sa.busy=false;mr.leave();clearHash();this.say(msg);};
  mr.on('ctl',m=>{if((m.data||{}).full)fin('ESA SALA YA TIENE 2 PERSONAS');});
  mr.on('answer',m=>{const d=m.data||{};if(answered)return;if(!d.ok){fin('EL ANFITRIÓN RECHAZÓ');return;}answered=true;this.sa.busy=false;this.rival=ARCADE.nick(d.nm)||'RIVAL';S.ok();this.startMatch('guest',code,'deathmatch-'+code,DMC[this.char].id,validCh(d.ch),mr);});
  mr.presence({p:{u:myUid,nm:NAMES[myUid]}});mr.emit('challenge',{ch:DMC[this.char].id,nm:NAMES[myUid]});
  setTimeout(()=>fin('EL ANFITRIÓN NO RESPONDIÓ'),10000);};
 NET.cancelSA=function(){const w=this.sa.wait;if(w){this.sa.wait=null;w.mr.leave();clearHash();this.say('SALA CERRADA');}};
 const _end=NET.end.bind(NET);NET.end=function(msg){const was=!!this.m;_end(msg);if(was)clearHash();};
 const doItem=i=>{if(i===0)NET.createSA();else{let c='';try{c=prompt('Pega el link o escribe el código de la sala:','')||'';}catch(e){}if(c)NET.joinSA(c);}};
 NET.saKey=function(k){const w=this.sa.wait;
  if(k==='Escape'||k==='Backspace'){if(w){this.cancelSA();return true;}return false;}
  if(w){if(k==='KeyL'||k==='Enter'||k==='Space')SA.copy(SA.link('pelea',w.code)).then(ok=>this.say(ok?'LINK COPIADO':'CÓDIGO: '+w.code.toUpperCase()));return k!=='ArrowLeft'&&k!=='ArrowRight'&&k!=='KeyA'&&k!=='KeyD';}
  if(k==='ArrowUp'||k==='ArrowDown'||k==='KeyW'||k==='KeyS'){this.sa.sel=1-this.sa.sel;S.move();return true;}
  if(k==='Enter'||k==='Space'){if(!this.sa.busy){S.ok();doItem(this.sa.sel);}return true;}return false;};
 NET.saTap=function(x,y){const w=this.sa.wait;if(y<14&&x<60){if(w)this.cancelSA();return false;}if(x<80)return false;
  if(w){if(y>24&&y<70)this.saKey('KeyL');return true;}const i=Math.floor((y-27)/16);if(i>=0&&i<2&&!this.sa.busy){if(i===this.sa.sel)doItem(i);this.sa.sel=i;S.move();}return true;};
 drawOnline=function(t){hdr("ONLINE · 1 VS 1");const C=DMC[NET.char],w=NET.sa.wait;R(4,17,74,92,"#1B2440");BOXL(4,17,74,92,12);L8.portrait(C,5,18,72,70,2,1,42);TC("TU LUCHADOR",90,6,1,null,41);TC(C.n,99,10,1,null,41);TC("← →",108,5,1,null,41);
  if(w){R(82,22,170,44,"#121A30");BOXL(82,22,170,44,10);T("TU SALA: "+w.code.toUpperCase(),88,27,10);T(Math.floor(t*2)%2?"ESPERANDO A TU RIVAL...":"ESPERANDO A TU RIVAL",88,39,7);T("L O TOCA: COPIAR LINK",88,51,12);
   T("TU RIVAL ABRE EL LINK",86,76,6);T("Y LA PELEA EMPIEZA SOLA.",86,86,6);T("ESC: CERRAR LA SALA",86,98,5);}
  else{['+ CREAR UNA SALA','UNIRSE CON CÓDIGO O LINK'].forEach((l,i)=>{const y=30+i*16,s=i===NET.sa.sel;R(82,y-3,170,13,s?1:'#121A30');T((s?'▶ ':'  ')+l,86,y,s?10:7);});
   T('1. CREA LA SALA',86,66,6);T('2. EL LINK SE COPIA SOLO',86,76,6);T('3. PÉGALO EN TEAMS',86,86,6);T('4. TU RIVAL LO ABRE Y LISTO',86,96,6);}
  R(0,H-24,W,24,"#0B1020");R(0,H-24,W,1,12);const msg=NET.msg&&performance.now()-NET.msgT<6000?NET.msg:(w?"ESC: CERRAR SALA":"↑ ↓ ELIGE · ENTER · ESC: MENÚ");TC(msg,H-19,NET.sa.busy?10:7);TC("APODO: "+(NAMES[myUid]||"(SE PIDE AL ENTRAR)"),H-9,5);};
 // si cambias de luchador mientras esperas, el rival lo verá al empezar
 const mm=(location.hash||'').match(/pelea=([a-z0-9]{4,12})/i);if(mm)setTimeout(async()=>{await NET.init();state='online';NET.joinSA(mm[1]);},300);
})();
};

ARCADE_GAMES.kart=function(){
"use strict";
// ======================= base =======================
const W=256,H=144, cv=document.getElementById('c'), g=cv.getContext('2d');
g.imageSmoothingEnabled=false;
const P=["#000000","#1D2B53","#7E2553","#008751","#AB5236","#5F574F","#C2C3C7","#FFF1E8","#FF004D","#FFA300","#FFEC27","#00E436","#29ADFF","#83769C","#FF77A8","#FFCCAA"];
const col=c=>typeof c==='number'?P[c]:c;
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,u)=>a+(b-a)*u;
function fit(){const s=Math.min(innerWidth/W,innerHeight/H);const k=s>=4?Math.floor(s):s;cv.style.width=(W*k)+'px';cv.style.height=(H*k)+'px';}
addEventListener('resize',fit);fit();
let OUTL=null;
function R(x,y,w,h,c){g.fillStyle=col(OUTL||c);g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function PX(x,y,c){R(x,y,1,1,c);}
function BOXL(x,y,w,h,c){R(x,y,w,1,c);R(x,y+h-1,w,1,c);R(x,y,1,h,c);R(x+w-1,y,1,h,c);}
function LN(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;g.fillStyle=col(OUTL||c);for(let i=0;i<800;i++){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function SPR(rows,x,y,map,sc=1,flip=false){for(let j=0;j<rows.length;j++){const r=flip?[...rows[j]].reverse().join(''):rows[j];for(let i=0;i<r.length;i++){const m=map[r[i]];if(m!==undefined)R(x+i*sc,y+j*sc,sc,sc,m);}}}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const RND=Math.random, pick=a=>a[Math.floor(RND()*a.length)];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(RND()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
let CAPT=null;
function disc(x,y,r,c){if(CAPT&&c===CAPT.c){CAPT.list.push([x,y,r]);return;}g.fillStyle=col(OUTL||c);g.beginPath();g.arc(x,y,r,0,7);g.fill();}
// ======================= font 5x7 =======================
const F={A:"01110100011000111111100011000110001",B:"11110100011000111110100011000111110",C:"01110100011000010000100001000101110",D:"11110100011000110001100011000111110",E:"11111100001000011110100001000011111",F:"11111100001000011110100001000010000",G:"01110100011000010111100011000101111",H:"10001100011000111111100011000110001",I:"01110001000010000100001000010001110",J:"00111000100001000010000101001001100",K:"10001100101010011000101001001010001",L:"10000100001000010000100001000011111",M:"10001110111010110101100011000110001",N:"10001100011100110101100111000110001",O:"01110100011000110001100011000101110",P:"11110100011000111110100001000010000",Q:"01110100011000110001101011001001101",R:"11110100011000111110101001001010001",S:"01111100001000001110000010000111110",T:"11111001000010000100001000010000100",U:"10001100011000110001100011000101110",V:"10001100011000110001100010101000100",W:"10001100011000110101101011010101010",X:"10001100010101000100010101000110001",Y:"10001100010101000100001000010000100",Z:"11111000010001000100010001000011111",
"0":"01110100011001110101110011000101110","1":"00100011000010000100001000010001110","2":"01110100010000100010001000100011111","3":"11111000100010000010000011000101110","4":"00010001100101010010111110001000010","5":"11111100001111000001000011000101110","6":"00110010001000011110100011000101110","7":"11111000010001000100010000100001000","8":"01110100011000101110100011000101110","9":"01110100011000101111000010001001100",
" ":"00000000000000000000000000000000000",".":"00000000000000000000000000000000100",",":"00000000000000000000001000010001000",":":"00000001000000000000000000010000000","-":"00000000000000001110000000000000000","/":"00001000010001000100010001000010000",">":"01000001000001000001000100010001000","<":"00010001000100010000010000010000010","_":"00000000000000000000000000000011111","!":"00100001000010000100001000000000100","?":"01110100010000100010001000000000100","·":"00000000000000000100000000000000000","+":"00000001000010011111001000010000000","(":"00010001000100001000010000010000010",")":"01000001000001000010000100010001000","%":"11001110100001000100010000101110011","=":"00000000001111100000111110000000000","'":"00100001000100000000000000000000000",
"♥":"00000010101111111111011100010000000","✓":"00000000010001010100010000000000000","▶":"01000011000111001111011100110001000","↑":"00100011101010100100001000010000100","↓":"00100001000010000100101010111000100","←":"00000001000100011111010000010000000","→":"00000001000001011111000100010000000","¡":"00100000000010000100001000010000100","¿":"00100000000010001000100001000101110"};
const ACC={"Á":"A","É":"E","Í":"I","Ó":"O","Ú":"U","Ñ":"N"};
function T(s,x,y,c,sc=1,sh=null){s=String(s).toUpperCase();for(let k=0;k<s.length;k++){let ch=s[k],mark=null;if(ACC[ch]){mark=ch==="Ñ"?["01101"]:["00010","00100"];ch=ACC[ch];}const gl=F[ch]||F["?"];const ox=x+k*6*sc;for(const [cc,d] of (sh!==null?[[sh,1],[c,0]]:[[c,0]])){for(let i=0;i<35;i++)if(gl[i]==="1")R(ox+(i%5+d)*sc,y+(Math.floor(i/5)+d)*sc,sc,sc,cc);if(mark)mark.forEach((mr,mj)=>{for(let i=0;i<5;i++)if(mr[i]==="1")R(ox+(i+d)*sc,y+(-mark.length-1+mj+d)*sc,sc,sc,cc);});}}}
const TW=(s,sc=1)=>String(s).length*6*sc-sc;
function TC(s,y,c,sc=1,sh=null,cx=W/2){T(s,Math.round(cx-TW(s,sc)/2),y,c,sc,sh);}

// ======================= sprites =======================
const HAIR="#3B2A20",NAVY="#16213E",GOLD="#F7931A";
const ALV=["...hhhh...","..hhhhhh..","..hsssss..","..sesses..","..ssssss..","...ssss...","..kkwwkk..",".kkkwtkkk.",".kkkwtkkk.",".kkkktkkk.",".skkkkkks.","..kkkkkk..","..pppppp..","..pp..pp..","..pp..pp..",".bbb..bbb."];
const AMAP={h:HAIR,s:15,e:0,k:NAVY,w:7,t:8,p:"#20202A",b:0};
const BOX_G=["....hhhh......","...hhhhhh.....","...hsssss.....","...sesses.gg..","...ssssss.ggg.","....ssss.sgg..","..tttttts.....",".gtttttt......",".ggtttttt.....","..sttttt......","...tttttt.....","...pppppp.....","...pp..pp.....","...pp..pp.....","..pp....pp....",".bbb....bbb..."];
const BOX_P=["....hhhh......","...hhhhhh.....","...hsssss.....","...sesses.....","...ssssss.....","....ssss......","..ttttttsssggg",".gttttttt..ggg",".ggtttttt.....","..sttttt......","...tttttt.....","...pppppp.....","...pp..pp.....","...pp..pp.....","..pp....pp....",".bbb....bbb..."];
const BMAP={h:HAIR,s:15,e:0,t:"#1E1E24",g:8,p:1,b:7};
const ROBOT=["..c.....","..c.....",".rrrrrr.","rr1rr1rr","rrrrrrrr","rr1111rr",".rrrrrr.","..rrrr..","rrrrrrrr","r.rrrr.r","r.rrrr.r","..r..r..","..r..r.."];
const ENV=["11111111","12222221","11222211","12112121","12211221","12222221","11111111"];
const SHIELD=["..111111111..",".12222222221.","1222222222221","1222233322221","1222232322221","1222232322221","1222333332221","1222330332221","1222333332221","1222222222221",".12222222221.","..122222221..","...1222221...","....12221....",".....121.....","......1......"];
const COIN=["..ooooo..",".oo1o1oo.","ooo111ooo","ooo1oo1oo","ooo111ooo","ooo1oo1oo","ooo111ooo",".oo1o1oo.","..ooooo.."];
const PIN=["..888..",".88788.","8877788",".88788.","..888..","...8...","...8..."];
const HEART=[".88.88.","8888888","8888888",".88888.","..888..","...8..."];
const LOCK=[".yyy.","y...y","y...y","yyyyy","yykyy","yykyy","yyyyy"];

// ======================= backdrop (del primer video) =======================
const STARS=(()=>{const r=rng(7),a=[];for(let i=0;i<60;i++)a.push([Math.floor(r()*W),Math.floor(r()*60),r()*6]);return a})();
const MTN=[[0,78],[18,60],[34,70],[52,44],[70,62],[88,40],[110,58],[130,38],[152,56],[170,46],[192,64],[214,42],[236,60],[256,52],[256,100],[0,100]];
function poly(pts,c){g.fillStyle=col(c);g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(const p of pts)g.lineTo(p[0],p[1]);g.closePath();g.fill();}
function sky(t){for(let y=0;y<90;y+=6)R(0,y,W,6,y<45?"#0B1020":1);for(const [x,y,ph] of STARS)if(Math.sin(t*3+ph)>-0.3)PX(x,y,Math.sin(t*2+ph)>0.6?7:6);}
function andes(){poly(MTN,13);for(let i=1;i<MTN.length-3;i++){const [x,y]=MTN[i];if(y<50)poly([[x-6,y+7],[x,y],[x+6,y+7]],7);}}
const CITY=(()=>{const r=rng(3),b=[];let x=0;while(x<W){let w=10+Math.floor(r()*11),h=12+Math.floor(r()*23);if(x>150&&x<175){w=12;h=66;}const win=[];for(let wy=110-h+3;wy<108;wy+=4)for(let wx=x+2;wx<x+w-3;wx+=3)if(r()<0.45)win.push([wx,wy,r()<0.8?10:9]);b.push({x,w,h,win});x+=w;}return b})();
function skyline(t){R(0,110,W,34,"#0E0E1A");for(const b of CITY){R(b.x,110-b.h,b.w-1,b.h,"#222034");for(const [wx,wy,c] of b.win)PX(wx,wy,c);if(b.h===66){poly([[b.x,110-66],[b.x+5,104-66],[b.x+10,110-66]],"#222034");PX(b.x+5,103-66,Math.floor(t*2)%2?8:2);}}}

F["*"]="00000101010111011111011101010100000";F["✗"]="00000100010101000100010101000100000";F["■"]="00000111111111111111111111111100000";F["$"]="00100011111010001110001011111000100";F["#"]="01010111110101001010111110101000000";F["&"]="01100100101010001000101011001001101";

// ======================= audio =======================
const A={ctx:null,muted:false,amb:[]};
function audioInit(){if(A.ctx){if(A.ctx.state==='suspended'&&state!=='pause')A.ctx.resume();return;}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C();A.ctx=ctx;
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(ctx.destination);
  A.master=ctx.createGain();A.master.gain.value=A.muted?0:0.6;A.master.connect(comp);
  A.mus=ctx.createGain();A.mus.gain.value=0.55;A.mus.connect(A.master);
  A.sfx=ctx.createGain();A.sfx.gain.value=0.9;A.sfx.connect(A.master);
  const n=32,re=new Float32Array(n),im=new Float32Array(n),d=0.25;for(let k=1;k<n;k++){re[k]=2/(k*Math.PI)*Math.sin(2*Math.PI*k*d);im[k]=2/(k*Math.PI)*(1-Math.cos(2*Math.PI*k*d));}A.pulse=ctx.createPeriodicWave(re,im);
  const nb=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;A.noise=nb;
  const cvn=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;cvn[i]=Math.tanh(x*4);}A.dist=cvn;
}
function setMuted(m){A.muted=m;if(A.master)A.master.gain.value=m?0:0.6;}
const hz=m=>440*Math.pow(2,(m-69)/12);
const AT=()=>A.ctx?A.ctx.currentTime:0;
function tone(type,f,t,dur,vol,dest,slide,opts={}){if(!A.ctx)return;const c=A.ctx,o=c.createOscillator(),gn=c.createGain();if(type==='pulse')o.setPeriodicWave(A.pulse);else o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
  let last=o;if(opts.lp){const f2=c.createBiquadFilter();f2.type='lowpass';f2.frequency.value=opts.lp;o.connect(f2);last=f2;}
  if(opts.dist){const ws=c.createWaveShaper();ws.curve=A.dist;last.connect(ws);last=ws;}
  const at=opts.at||0.006;gn.gain.setValueAtTime(0.0001,t);gn.gain.linearRampToValueAtTime(vol,t+at);gn.gain.exponentialRampToValueAtTime(0.0005,t+dur);last.connect(gn).connect(dest||A.sfx);o.start(t);o.stop(t+dur+0.03);}
function noise(t,dur,vol,type,freq,dest,q){if(!A.ctx)return;const c=A.ctx,s=c.createBufferSource();s.buffer=A.noise;const f=c.createBiquadFilter();f.type=type||'highpass';f.frequency.value=freq||1000;if(q)f.Q.value=q;const gn=c.createGain();gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(0.0005,t+dur);s.connect(f).connect(gn).connect(dest||A.sfx);s.start(t,Math.random()*1.5);s.stop(t+dur+0.02);}
const kick=(t,v=0.8,d)=>tone('sine',150,t,0.22,v,d||A.mus,42);
const snare=(t,v=0.35,d)=>{noise(t,0.14,v,'highpass',1400,d||A.mus);tone('triangle',190,t,0.08,v*0.5,d||A.mus);};
const hat=(t,open,v=0.1,d)=>noise(t,open?0.2:0.035,v,'highpass',7500,d||A.mus);
const blip=(m,t,v=0.1,d)=>tone('pulse',hz(m),t,0.07,v,d);
function ambient(type,opts){ // fuente continua (aire acondicionado, zumbido, público)
  if(!A.ctx)return null;const c=A.ctx;let src;
  if(type==='noise'){src=c.createBufferSource();src.buffer=A.noise;src.loop=true;}else{src=c.createOscillator();src.type=type;src.frequency.value=opts.f||55;}
  const f=c.createBiquadFilter();f.type=opts.ft||'lowpass';f.frequency.value=opts.ff||500;if(opts.q)f.Q.value=opts.q;const gn=c.createGain();gn.gain.value=opts.v||0.05;
  src.connect(f).connect(gn).connect(opts.dest||A.sfx);src.start();const h={src,f,gn};A.amb.push(h);return h;}
function stopAmbient(){for(const h of A.amb){try{h.src.stop();}catch(e){}}A.amb=[];}
// secuenciador de música
const M={on:false,step:0,next:0,bpm:120,fn:null};
function musicStart(bpm,fn){if(!A.ctx)return;M.on=true;M.bpm=bpm;M.fn=fn;M.step=0;M.next=A.ctx.currentTime+0.08;}
function musicStop(){M.on=false;}
function musicTick(){if(!M.on||!A.ctx||A.ctx.state!=='running')return;if(M.next<A.ctx.currentTime-0.2)M.next=A.ctx.currentTime+0.02;const s16=60/M.bpm/4;while(M.next<A.ctx.currentTime+0.12){M.fn(M.step,M.next,s16);M.step++;M.next+=60/M.bpm/4;}}
const S={
  move:()=>blip(84,AT(),0.07),
  ok:()=>{const t=AT();blip(79,t);blip(86,t+0.06);},
  no:()=>tone('square',110,AT(),0.12,0.1,null,70),
  good:()=>{const t=AT();[76,79,84].forEach((m,k)=>blip(m,t+k*0.05,0.09));},
  bad:()=>{const t=AT();tone('square',160,t,0.18,0.1,null,90);tone('square',120,t+0.09,0.2,0.08,null,70);},
  win:()=>{const t=AT();[72,76,79,84,88].forEach((m,k)=>tone('pulse',hz(m),t+k*0.08,0.3,0.1));},
  lose:()=>{const t=AT();[64,60,57,52].forEach((m,k)=>tone('square',hz(m),t+k*0.16,0.22,0.09));},
  bell:(v=0.25)=>{const t=AT();[1,2.76,5.4,8.9].forEach((k,i)=>tone('sine',520*k,t,1.6/(i+1),v/(i+1)));},
};

// ======================= botones =======================
let BTNS=[];
function btn(id,x,y,w,h,label,bg,fg=7,hot=false){BTNS.push({id,x,y,w,h});R(x,y,w,h,hot?7:0);R(x+1,y+1,w-2,h-2,bg);TC(label,y+Math.floor((h-7)/2),fg,1,null,x+w/2);}
function hitBtn(x,y){for(let i=BTNS.length-1;i>=0;i--){const b=BTNS[i];if(x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)return b.id;}return null;}
function hud(name,right){R(0,0,W,12,"#0B1020");R(0,12,W,1,12);T(name,4,3,10);if(right)T(right,W-22-TW(right),3,7);T("II",W-14,3,5);BTNS.push({id:'__pause',x:W-24,y:0,w:24,h:12});}
function bar(x,y,w,h,v,c,bg=5){R(x,y,w,h,bg);R(x+1,y+1,Math.round((w-2)*clamp(v,0,1)),h-2,c);}

const LOGO_SRC={silica:'data:image/png;base64,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',datco:'data:image/png;base64,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'};

// ======================= NIVEL 6: SPARRING (pelea 2D) =======================
const GYF=124,GRV=800,CHG=0.7;
const ATK={punch:{s:0.05,a:0.09,r:0.13,dmg:5,box:[8,-49,21,9],push:70,stun:0.24},kick:{s:0.1,a:0.1,r:0.2,dmg:8,box:[6,-33,26,9],push:95,stun:0.3},
 jkick:{dmg:8,box:[2,-22,24,16],push:85,stun:0.32},fkick:{dmg:13,box:[4,-28,28,16],push:150,stun:0.45},upper:{dmg:12,box:[2,-66,20,34],push:110,stun:0.45},
 ball:{dmg:10,push:80,stun:0.32},sup:{dmg:22,push:190,stun:0.6},low:{dmg:9,push:80,stun:0.3},beam:{dmg:12,push:90,stun:0.4},whirl:{dmg:5,push:40,stun:0.28},whirlEnd:{dmg:7,push:170,stun:0.45}};
const LOOK_ME={skin:15,hair:HAIR,top:"#1E1E24",pants:1,glove:8,bw:16,kind:'me'};
const FOES=[
 {n:'ANDRÉS',hp:110,spd:50,think:0.42,aggr:0.5,block:0.25,ballP:0.22,sp:0.2,fk:0,jump:0.05,anti:0.1,dmul:1.2,ballK:'form',spk:['stomp'],
  look:{skin:"#8D5524",hair:"#111111",top:"#3C8C4A",pants:"#20202A",glove:11,bw:22,kind:'andres'},shout:{ball:"¡EVALUACIÓN!",stomp:"¡CAPACITACIÓN!"}},
 {n:'JOSÉ LUIS',hp:110,spd:70,think:0.34,aggr:0.55,block:0.3,ballP:0.15,sp:0.22,fk:0.08,jump:0.1,anti:0.1,dmul:1,ballK:'kpi',spk:['beam'],up:0.55,
  look:{skin:"#8D5524",hair:"#111111",top:"#29ADFF",pants:"#1D2B53",glove:1,bw:17,kind:'jl',glasses:true},shout:{ball:"¡KPI!",beam:"¡VISIÓN!",upper:"¡AL ALZA!"}},
 {n:'SAMIR',hp:130,spd:75,think:0.3,aggr:0.6,block:0.4,ballP:0.12,sp:0.28,fk:0.05,jump:0.08,anti:0.35,dmul:1.2,ballK:'doc',spk:['tele','triple'],
  look:{skin:15,hair:"#3B2A20",top:"#1E1E24",pants:"#1E1E24",glove:2,bw:18,kind:'samir',bald:true,beard:true},shout:{ball:"¡OBJETADO!",tele:"¡REVISIÓN!",triple:"¡TRES CLÁUSULAS!"}}];
const PAD=[{k:'left',x:2,y:110,w:26,h:32,l:'←'},{k:'up',x:30,y:110,w:26,h:15,l:'↑'},{k:'down',x:30,y:127,w:26,h:15,l:'↓'},{k:'right',x:58,y:110,w:26,h:32,l:'→'},
 {k:'punch',x:170,y:110,w:42,h:15,l:'GOLPE'},{k:'kick',x:214,y:110,w:40,h:15,l:'PATADA'},{k:'ballHold',x:170,y:127,w:42,h:15,l:'BOLA'},{k:'fkHold',x:214,y:127,w:40,h:15,l:'VOLAR'}];
const HOLDK=['left','right','down','ballHold','fkHold'];
let TOUCHUI=matchMedia('(pointer: coarse)').matches;
function newFighter(x,face,look,P){return {x,y:GYF,vx:0,vy:0,face,st:'idle',t:0,hp:P?P.hp:100,max:P?P.hp:100,spd:P?P.spd:80,dmul:P?P.dmul:1,look,cdB:0,cdF:0,walkT:0,active:false,hitDone:false,combo:0,comboT:0,ai:{},aiT:0.6,aiHold:0,P,shout:null,alpha:1};}
const L6={id:'box3',name:'SPARRING',sub:'Pelea 2D en el datacenter',
 howto:["← → CAMINAR · ↑ SALTAR · ↓ AGACHARSE","Z GOLPE · X PATADA (TAMBIÉN SALTANDO)","C BOLA OBJECIÓN · V PATADA VOLADORA","MANTÉN C O V: CARGA LA VERSIÓN SÚPER","MANTÉN HACIA ATRÁS PARA CUBRIRTE","AGACHADO ESQUIVAS LOS GOLPES ALTOS"],
 init(){this.ri=0;this.score=0;this.taken=0;this.landed=0;this.balls=0;this.supers=0;this.inp={left:false,right:false,down:false,up:false,punch:false,kick:false,ballHold:false,fkHold:false};this.touches={};this.fx=[];this.parts=[];this.stop=0;this.shake=0;this.exc=0;
   if(A.mus)A.mus.gain.value=0.4;this.crowd=ambient('noise',{ft:'bandpass',ff:900,q:0.8,v:0.03});this.startRound();
   musicStart(150,(s,t,s16)=>{const bar=Math.floor(s/16)%4,root=[40,40,43,38][bar];if(s%2===0)[0,7].forEach(k=>tone('sawtooth',hz(root+k),t,s16*1.6,0.045,A.mus,null,{lp:1600,dist:true}));
     if(s%8===0||s%16===10)kick(t,0.6);if(s%8===4)snare(t,0.3);if(s%2===0)hat(t,false,0.05);if(s%32===0)noise(t,0.6,0.1,'highpass',5000,A.mus);if(s%16===12)tone('square',hz(root+19),t,s16*3,0.03,A.mus,null,{lp:2000});});},
 startRound(){const P=FOES[this.ri];this.me=newFighter(70,1,LOOK_ME,null);this.foe=newFighter(186,-1,P.look,P);this.projs=[];this.phase='intro';this.pt=0;this.timer=60;this.beam=null;S.bell(0.25);},
 say(f,txt){f.shout={t:txt,k:0};},
 // ---------- lógica de luchador ----------
 fup(f,inp,o,dt){f.t+=dt;f.cdB=Math.max(0,f.cdB-dt);f.cdF=Math.max(0,f.cdF-dt);if(f.comboT>0){f.comboT-=dt;if(f.comboT<=0)f.combo=0;}
   const onG=f.y>=GYF-0.01;f.back=(o.x>f.x?inp.left:inp.right);f.active=false;
   const air=()=>{f.x+=f.vx*dt;f.vy+=GRV*dt;f.y+=f.vy*dt;if(f.y>=GYF){f.y=GYF;f.vy=0;return true;}return false;};
   if(f.st==='ko'){f.alpha=1;if(f.x<16||f.x>W-16){f.x=clamp(f.x,16,W-16);f.vx=-f.vx*0.3;this.shake=0.15;}if(f.y<GYF||f.vy<0){f.x+=f.vx*dt;f.vy+=GRV*dt;f.y+=f.vy*dt;if(f.y>=GYF){f.y=GYF;if(!f.bounced&&f.vy>80){f.bounced=true;f.vy=-f.vy*0.35;f.vx*=0.5;this.shake=0.25;tone('sine',80,AT(),0.3,0.8,null,40);noise(AT(),0.25,0.25,'lowpass',500);for(let i=0;i<14;i++)this.parts.push({x:f.x+(RND()-0.5)*30,y:GYF-2,vx:(RND()-0.5)*80,vy:-RND()*50,t:0,life:0.6,c:6,grav:true});}else{f.vy=0;f.land=true;}}}else{f.vx*=Math.pow(0.02,dt);f.x+=f.vx*dt;}return;}
   if(f.st==='hurt'||f.st==='bstun'){f.alpha=1;f.vx*=Math.pow(0.004,dt);f.x+=f.vx*dt;if(f.y<GYF){f.vy+=GRV*dt;f.y=Math.min(GYF,f.y+f.vy*dt);}if(f.t>=f.stun&&f.y>=GYF)this.idle(f);return;}
   if(f.st==='punch'||f.st==='kick'){const A_=ATK[f.st];f.active=f.t>=A_.s&&f.t<A_.s+A_.a;if(f.t>=A_.s+A_.a+A_.r)this.idle(f);return;}
   if(f.st==='ball'){if(!f.thrown&&f.t>=0.2){f.thrown=true;this.throwBall(f,f.sup);}if(f.t>=(f.sup?0.6:0.45))this.idle(f);return;}
   if(f.st==='chargeB'||f.st==='chargeF'){const hold=f.st==='chargeB'?inp.ballHold:inp.fkHold,full=f.t>=CHG;
     if(full&&!f.full){f.full=true;const t=AT();tone('sine',1320,t,0.25,0.1);tone('sine',1980,t+0.05,0.25,0.06);}
     if(Math.floor(f.t*10)!==Math.floor((f.t-dt)*10)&&!full)tone('sine',300+f.t*900,AT(),0.08,0.04);
     if(RND()<dt*40){const a=RND()*7,r=22;this.parts.push({x:f.x+Math.cos(a)*r,y:f.y-30+Math.sin(a)*r,vx:-Math.cos(a)*60,vy:-Math.sin(a)*60,t:0,life:0.35,c:f.st==='chargeB'?12:9});}
     if(!hold||f.t>2.2){f.full=false;if(f.st==='chargeB'){f.st='ball';f.t=0;f.thrown=false;f.sup=full;f.cdB=full?2.0:1.3;this.balls++;if(full)this.supers++;this.say(f,full?"¡SÚPER OBJECIÓN!":"¡OBJECIÓN!");}
       else if(full){f.st='whirl';f.t=0;f.tick=0;f.hits=0;f.cdF=2.0;this.supers++;this.say(f,"¡TORBELLINO!");const t=AT();noise(t,1.0,0.12,'bandpass',900);tone('sawtooth',200,t,0.9,0.05,null,500);}
       else{this.startFk(f);}}return;}
   if(f.st==='whirl'){f.tick-=dt;if(f.tick<=0&&f.t<0.95){f.tick=0.16;f.hitDone=false;f.active=true;noise(AT(),0.08,0.08,'bandpass',2600);}if(f.t>=1.05)this.idle(f);return;}
   if(f.st==='sp'){this.special(f,o,dt);return;}
   if(f.st==='jump'||f.st==='fkick'||f.st==='upper'){if(f.st==='jump'&&inp.kick&&!f.jk){f.jk=true;f.hitDone=false;this.whoosh();}if(f.st==='fkick'&&f.t>0.06)f.active=true;if(f.st==='upper'&&f.vy<40)f.active=true;if(f.jk)f.active=true;
     if(air()){f.wasF=f.st!=='jump';f.st='land';f.t=0;f.jk=false;f.active=false;}return;}
   if(f.st==='land'){if(f.t>=(f.wasF?0.22:0.06))this.idle(f);return;}
   f.face=o.x>f.x?1:-1;f.alpha=1;
   if(inp.sp){f.st='sp';f.t=0;f.spk=inp.spk;f.phase=0;if(f.P.shout[f.spk])this.say(f,f.P.shout[f.spk]);if(f.spk==='upper'){f.st='upper';f.vy=-300;f.vx=f.face*50;f.hitDone=false;this.whoosh();}}
   else if(inp.fkick&&f.cdF<=0)this.startFk(f);
   else if(inp.fkHold&&f.cdF<=0){f.st='chargeF';f.t=0;f.full=false;}
   else if(inp.ball&&f.cdB<=0){f.st='ball';f.t=0;f.thrown=false;f.sup=false;f.cdB=1.3;if(f.P&&f.P.shout.ball)this.say(f,f.P.shout.ball);tone('sine',300,AT(),0.2,0.08,null,900);}
   else if(inp.ballHold&&f.cdB<=0){f.st='chargeB';f.t=0;f.full=false;}
   else if(inp.punch){f.st='punch';f.t=0;f.hitDone=false;this.whoosh();}
   else if(inp.kick){f.st='kick';f.t=0;f.hitDone=false;this.whoosh();}
   else if(inp.up){f.st='jump';f.t=0;f.vy=-275;f.vx=(inp.right?1:(inp.left?-1:0))*90;f.jk=false;f.hitDone=false;}
   else if(inp.down)f.st='crouch';
   else if(inp.left||inp.right){const d=inp.right?1:-1;f.x+=d*f.spd*(d===f.face?1:0.7)*dt;f.st=d===f.face?'walk':'back';f.walkT+=dt;}
   else f.st='idle';},
 startFk(f){f.st='fkick';f.t=0;f.vy=-200;f.vx=f.face*190;f.cdF=1.1;f.hitDone=false;if(f===this.me)this.say(f,"¡HAAA!");tone('square',300,AT(),0.25,0.07,null,700);this.whoosh();},
 special(f,o,dt){const k=f.spk,t=AT();
   if(k==='stomp'){if(f.t>=0.4&&f.phase===0){f.phase=1;this.projs.push({x:f.x+f.face*16,y:f.y-6,vx:f.face*190,owner:f,kind:'wave',low:true});this.shake=0.25;tone('sine',70,t,0.4,0.9,null,35);noise(t,0.3,0.3,'lowpass',400);}if(f.t>=0.75)this.idle(f);}
   else if(k==='beam'){if(f.t>=0.45&&f.phase===0){f.phase=1;this.beam={f,t:0,hit:false};tone('sawtooth',880,t,0.4,0.06,null,1200);noise(t,0.35,0.1,'highpass',3000);}if(f.t>=0.95){this.idle(f);this.beam=null;}}
   else if(k==='tele'){if(f.t<0.25)f.alpha=1-f.t/0.25;else if(f.phase===0){f.phase=1;let nx=o.x+(o.x>f.x?28:-28);if(nx<16||nx>W-16)nx=o.x-(o.x>f.x?28:-28);f.x=clamp(nx,16,W-16);f.face=o.x>f.x?1:-1;tone('sine',1200,t,0.15,0.06,null,300);}
     else{f.alpha=Math.min(1,(f.t-0.25)/0.1);if(f.t>=0.38){f.alpha=1;f.st='punch';f.t=0;f.hitDone=false;this.whoosh();}}}
   else if(k==='triple'){[0.2,0.36,0.52].forEach((tt,i)=>{if(f.t>=tt&&f.phase===i){f.phase=i+1;this.projs.push({x:f.x+f.face*18,y:f.y+[-46,-28,-9][i],vx:f.face*170,owner:f,kind:'doc'});this.whoosh();}});if(f.t>=0.75)this.idle(f);}},
 idle(f){f.st='idle';f.t=0;f.active=false;f.alpha=1;},
 whoosh(){noise(AT(),0.08,0.06,'bandpass',2400);},
 throwBall(f,sup){const P=f.P;this.projs.push({x:f.x+f.face*(sup?26:20),y:f.y-(sup?38:40),vx:f.face*(sup?140:165),owner:f,kind:f===this.me?(sup?'super':'me'):P.ballK,low:P&&P.ballK==='form'});const t=AT();
   if(P&&P.ballK==='form')this.projs[this.projs.length-1].y=f.y-7;
   if(sup){tone('sawtooth',160,t,0.5,0.1,null,60);noise(t,0.5,0.2,'bandpass',800);this.shake=0.15;}else{noise(t,0.25,0.12,'bandpass',1400);tone('sawtooth',500,t,0.25,0.05,null,150);}},
 pr(p){return p.kind==='super'?11:(p.low?5:6);},
 boom(x,y){for(let i=0;i<46;i++){const a=RND()*Math.PI*2,v=40+RND()*160;this.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,t:0,life:0.5+RND()*0.5,c:pick([7,12,12,10,9]),grav:true});}this.shake=0.35;const t=AT();noise(t,0.8,0.5,'lowpass',600);tone('sine',90,t,0.6,0.9,null,30);},
 hurtbox(f){const c=f.st==='crouch'||(f.st==='bstun'&&f.lowB),h=c?34:54,w=f.look.bw+2;return [f.x-w/2,f.y-h,w,h];},
 atkbox(f){if(f.st==='whirl')return [f.x-32,f.y-36,64,24];const k=f.st==='jump'?'jkick':f.st;const b=ATK[k].box;const x0=f.face>0?f.x+b[0]:f.x-b[0]-b[2];return [x0,f.y+b[1],b[2],b[3]];},
 ov(a,b){return a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];},
 hit(a,d,A_,dir,x,y){const onG=d.y>=GYF-0.01,blk=onG&&d.back&&['back','crouch','idle','walk','bstun'].includes(d.st);const t=AT();d.active=false;d.jk=false;
   if(d.st==='chargeB'||d.st==='chargeF'){d.full=false;}
   if(blk){d.hp-=A_===ATK.sup?4:1;d.lowB=d.st==='crouch'||(d.st==='bstun'&&d.lowB);d.st='bstun';d.t=0;d.stun=0.16;d.vx=dir*A_.push*0.6;this.fx.push({x,y,t:0,c:12});tone('square',900,t,0.03,0.06);tone('sine',200,t,0.05,0.25);if(d.hp<=0)this.ko(a,d,dir,t);return;}
   const dmg=Math.round(A_.dmg*(a.dmul||1));d.hp-=dmg;d.st='hurt';d.t=0;d.stun=A_.stun;d.vx=dir*A_.push;d.alpha=1;if(!onG)d.vy=-120;this.stop=0.06;this.fx.push({x,y,t:0,c:10});
   tone('sine',140,t,0.14,0.8,null,50);noise(t,0.1,0.3,'lowpass',1300);if(A_.push>=150||dmg>=12)this.shake=Math.max(this.shake,0.2);
   a.combo++;a.comboT=0.9;if(a===this.me){this.landed++;this.score+=dmg*10+(a.combo>1?a.combo*20:0);this.exc=Math.min(1,this.exc+0.1);}else this.taken+=dmg;
   if(d.hp<=0)this.ko(a,d,dir,t);},
 ko(a,d,dir,t){d.hp=0;d.st='ko';d.t=0;d.vx=dir*150;d.vy=-230;d.y-=1;d.bounced=false;d.land=false;d.kdir=dir;this.koFlash=0.15;this.phase='ko';this.pt=0;this.beam=null;S.bell(0.3);noise(t,1.2,0.25,'bandpass',1100);this.exc=1;},
 // ---------- IA ----------
 brain(f,o,dt,P){const inp=f.ai;inp.punch=inp.kick=inp.ball=inp.fkick=inp.up=inp.sp=false;if(f.aiHold>0)f.aiHold-=dt;else inp.left=inp.right=inp.down=false;
   const dx=o.x-f.x,d=Math.abs(dx),tw=dx>0?'right':'left',aw=dx>0?'left':'right',oAir=o.y<GYF-4;
   if(f.st==='jump'&&d<34&&f.vy>-60&&!f.jk)inp.kick=true;
   f.aiT-=dt;if(f.aiT>0)return;f.aiT=P.think*(0.7+RND()*0.6);
   if(this.beam&&this.beam.f!==f){inp.down=true;f.aiHold=0.5;return;}
   const th=this.projs.find(p=>p.owner!==f&&Math.sign(p.vx)===Math.sign(f.x-p.x)&&Math.abs(p.x-f.x)<80);
   if(th){if(th.kind==='super'||RND()<0.5){inp.up=true;f.aiHold=0.3;inp[tw]=RND()<0.6;}else{inp[aw]=true;f.aiHold=0.5;}return;}
   if((['punch','kick','fkick','whirl','upper'].includes(o.st)||o.jk)&&d<55&&RND()<P.block){inp[aw]=true;f.aiHold=0.35;return;}
   if(oAir&&d<60&&P.up&&RND()<P.up){inp.sp=true;inp.spk='upper';return;}
   if(oAir&&d<48&&RND()<P.anti){inp.kick=true;return;}
   const r=RND(),sp=P.sp||0;
   if(sp&&r<sp&&d>40){const k=pick(P.spk);if(k==='stomp'&&(d>140||oAir))return;if(k==='tele'&&d<70)return;inp.sp=true;inp.spk=k;return;}
   const r2=RND();
   if(d>100){if(r2<P.ballP)inp.ball=true;else if(r2<P.ballP+P.fk)inp.fkick=true;else{inp[tw]=true;f.aiHold=0.3+RND()*0.4;}}
   else if(d>36){if(r2<P.fk)inp.fkick=true;else if(r2<P.fk+P.jump){inp.up=true;inp[tw]=true;f.aiHold=0.2;}else if(r2<P.fk+P.jump+P.ballP*0.5)inp.ball=true;else{inp[tw]=true;f.aiHold=0.2+RND()*0.3;}}
   else{if(r2<P.aggr){if(RND()<0.5)inp.punch=true;else inp.kick=true;}else if(r2<P.aggr+0.2){inp[aw]=true;f.aiHold=0.3;}else if(r2<P.aggr+0.3){inp.down=true;f.aiHold=0.3;}}},
 // ---------- ciclo ----------
 update(dt){this.exc=Math.max(0,this.exc-dt*0.25);if(this.crowd)this.crowd.gn.gain.setTargetAtTime(0.02+this.exc*0.08,AT(),0.2);this.shake=Math.max(0,this.shake-dt);
   this.fx=this.fx.filter(e=>(e.t+=dt)<0.25);this.parts=this.parts.filter(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.grav)p.vy+=260*dt;return p.t<p.life;});
   if(this.phase==='intro'){this.pt+=dt;if(this.pt>2.2){this.phase='fight';S.bell(0.2);}return;}
   if(this.phase==='ko'||this.phase==='time'){this.pt+=dt;const sdt=this.phase==='ko'&&this.pt<1.8?dt*0.28:dt;this.fup(this.me,{},this.foe,sdt);this.fup(this.foe,{},this.me,sdt);
     if(this.pt>(this.phase==='ko'?3.6:2.6)){const won=this.phase==='ko'?this.foe.hp<=0:(this.me.hp/this.me.max>=this.foe.hp/this.foe.max);if(!won)return finishLevel({fail:true});this.score+=this.me.hp*5+Math.round(this.timer)*10;this.ri++;if(this.ri>=FOES.length)return finishLevel({fail:false});this.startRound();}return;}
   if(this.stop>0){this.stop-=dt;return;}
   this.timer-=dt;if(this.timer<=0){this.timer=0;this.phase='time';this.pt=0;S.bell(0.25);return;}
   const P=FOES[this.ri];if(BOT){this.brain(this.me,this.foe,dt,{think:0.18,aggr:0.7,block:0.75,ballP:0.3,fk:0.15,jump:0.05,anti:0.7,sp:0});}
   const pin=BOT?this.me.ai:this.inp;this.brain(this.foe,this.me,dt,P);
   this.fup(this.me,pin,this.foe,dt);this.fup(this.foe,this.foe.ai,this.me,dt);
   for(const k of ['up','punch','kick'])this.inp[k]=false;
   for(const f of [this.me,this.foe])f.x=clamp(f.x,14,W-14);
   if(this.me.y>=GYF&&this.foe.y>=GYF&&Math.abs(this.me.x-this.foe.x)<20){const m=(this.me.x+this.foe.x)/2,s=this.me.x<this.foe.x?-1:1;this.me.x=clamp(m+s*10,14,W-14);this.foe.x=clamp(m-s*10,14,W-14);}
   for(const [a,d] of [[this.me,this.foe],[this.foe,this.me]]){const k=a.st==='jump'?'jkick':a.st;if(a.active&&!a.hitDone&&d.st!=='ko'&&this.phase==='fight'&&(ATK[k]||a.st==='whirl')){const ab=this.atkbox(a);if(this.ov(ab,this.hurtbox(d))){a.hitDone=true;let A_=ATK[k];if(a.st==='whirl'){a.hits++;A_=a.hits>=5?ATK.whirlEnd:ATK.whirl;}this.hit(a,d,A_,a.st==='whirl'?(d.x>a.x?1:-1):a.face,ab[0]+ab[2]/2,ab[1]+ab[3]/2);}}}
   if(this.beam){const b=this.beam,f=b.f,d=f===this.me?this.foe:this.me;b.t+=dt;const x0=f.face>0?f.x+14:0,x1=f.face>0?W:f.x-14,bb=[x0,f.y-50,x1-x0,9];if(!b.hit&&d.st!=='ko'&&this.ov(bb,this.hurtbox(d))){b.hit=true;this.hit(f,d,ATK.beam,f.face,d.x,f.y-46);}}
   // torbellino destruye proyectiles
   for(const f of [this.me,this.foe])if(f.st==='whirl'){const ab=this.atkbox(f);for(const p of this.projs)if(p.owner!==f&&this.ov([p.x-6,p.y-6,12,12],ab)){p.dead=true;this.fx.push({x:p.x,y:p.y,t:0,c:9});}}
   for(const p of this.projs){if(p.dead)continue;p.x+=p.vx*dt;const d=p.owner===this.me?this.foe:this.me,r=this.pr(p);
     if(this.phase==='fight'&&d.st!=='ko'&&this.ov([p.x-r,p.y-r,r*2,r*2],this.hurtbox(d))){p.dead=true;const A_=p.kind==='super'?ATK.sup:(p.low?ATK.low:ATK.ball);this.hit(p.owner,d,A_,Math.sign(p.vx),p.x,p.y);if(p.kind==='super')this.boom(p.x,p.y);}}
   for(const p of this.projs)for(const q of this.projs)if(p!==q&&p.owner!==q.owner&&!p.dead&&!q.dead&&Math.abs(p.x-q.x)<(this.pr(p)+this.pr(q))&&Math.abs(p.y-q.y)<(this.pr(p)+this.pr(q))){
     if(p.kind==='super'){q.dead=true;this.fx.push({x:q.x,y:q.y,t:0,c:7});}else if(q.kind==='super'){p.dead=true;this.fx.push({x:p.x,y:p.y,t:0,c:7});}else{p.dead=q.dead=true;this.fx.push({x:(p.x+q.x)/2,y:p.y,t:0,c:7});}noise(AT(),0.2,0.2,'bandpass',2000);}
   this.projs=this.projs.filter(p=>{if(!p.dead&&p.kind==='super'&&(p.x<-10||p.x>W+10))return false;return !p.dead&&p.x>-20&&p.x<W+20;});},
 key(c,down){const m={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down',KeyC:'ballHold',KeyL:'ballHold',KeyV:'fkHold',KeyI:'fkHold'}[c];if(m)this.inp[m]=down;
   if(down){const e={ArrowUp:'up',KeyW:'up',KeyZ:'punch',KeyJ:'punch',KeyX:'kick',KeyK:'kick',Space:'punch'}[c];if(e)this.inp[e]=true;}},
 button(){},
 pointer(type,x,y,id,ptype){if(ptype==='touch')TOUCHUI=true;if(!TOUCHUI)return;
   const zone=PAD.find(z=>x>=z.x-2&&x<z.x+z.w+2&&y>=z.y-4&&y<z.y+z.h+2),k=zone?zone.k:null;
   if(type==='down'){this.touches[id]=k;if(k&&!HOLDK.includes(k))this.inp[k]=true;}
   else if(type==='move'){if(!(id in this.touches))return;if(this.touches[id]!==k&&!['ballHold','fkHold'].includes(this.touches[id])){this.touches[id]=k;if(k==='up')this.inp.up=true;}}
   else if(type==='up')delete this.touches[id];
   const held=Object.values(this.touches);for(const h of HOLDK)this.inp[h]=held.includes(h);},
 result(){const gr=this.ri<FOES.length?'F':(this.taken<=30?'S':(this.taken<=80?'A':(this.taken<=150?'B':'C')));if(A.mus)A.mus.gain.value=0.55;
   return {score:this.score,grade:gr,lines:[["RIVALES DERROTADOS",Math.min(this.ri,3)+"/3"],["GOLPES CONECTADOS",this.landed],["PODERES SÚPER",this.supers],["DAÑO RECIBIDO",this.taken]]};},
 // ---------- dibujo ----------
 drawF(f,t){const L_=f.look,st=f.st,onG=f.y>=GYF-0.01;g.save();g.globalAlpha=f.alpha;g.translate(Math.round(f.x),Math.round(f.y));
   const spin=st==='whirl';let face=f.face;if(spin)face=Math.floor(f.t*16)%2?1:-1;g.scale(face,1);if(st==='ko'&&!f.land){g.translate(0,-20);g.rotate(-Math.min(1.45,f.t*2.2));g.translate(0,20);}
   const white=(st==='hurt'&&f.t<0.07)||(f.full&&st.startsWith('charge')&&Math.floor(t*16)%2),C=c=>white?7:c;
   if(st==='ko'&&f.land){R(-26,-8,40,8,C(L_.top));R(-30,-9,10,10,C(L_.skin));if(!L_.bald)R(-30,-9,10,3,C(L_.hair));R(12,-6,18,6,C(L_.pants));disc(-16,-12,4,C(L_.glove));g.restore();return;}
   const cr=st==='crouch'||(st==='bstun'&&f.lowB)||st==='chargeB'||st==='chargeF',by=cr?(st.startsWith('charge')?6:14):0,lean=st==='hurt'||st==='ko'?-3:0,bw=L_.bw;
   // piernas
   const kickOn=(st==='kick'&&f.t>=ATK.kick.s*0.6)||(st==='sp'&&f.spk==='stomp'&&f.t<0.4);
   if(spin){R(-4,-20,8,20,C(L_.pants));R(0,-30,30,7,C(L_.pants));R(28,-32,5,10,C(0));R(-26,-28,24,6,C(L_.pants));}
   else if(!onG||st==='fkick'){if(st==='fkick'||f.jk){R(-5,-22,7,12,C(L_.pants));R(0,-24,26,7,C(L_.pants));R(24,-26,5,10,C(0));}else{R(-6,-20,6,12,C(L_.pants));R(1,-18,6,10,C(L_.pants));}}
   else if(cr){R(-9,-12,8,12,C(L_.pants));R(1,-12,9,12,C(L_.pants));R(-10,-2,10,2,C(0));R(1,-2,10,2,C(0));}
   else if(kickOn){R(-7,-20,6,20,C(L_.pants));R(-8,-2,8,2,C(0));if(st==='sp'){R(2,-34,8,16,C(L_.pants));R(1,-36,10,4,C(0));}else{R(2,-33,26,7,C(L_.pants));R(26,-35,5,10,C(0));}}
   else{const k=(st==='walk'||st==='back')?Math.round(Math.sin(f.walkT*14)*3):0;R(-7+k,-20,6,20,C(L_.pants));R(1-k,-20,6,20,C(L_.pants));R(-8+k,-2,8,2,C(0));R(0-k,-2,8,2,C(0));}
   // torso
   const ty=-42+by;R(-bw/2+lean,ty,bw,22,C(L_.top));R(-bw/2+lean,ty,2,22,C(L_.skin));R(bw/2-2+lean,ty,2,8,C(L_.skin));
   if(L_.kind==='samir'){R(-3+lean,ty,7,10,C(7));R(0+lean,ty+1,2,10,C(8));}
   if(L_.kind==='jl'){R(-2+lean,ty,5,4,C(7));}
   if(L_.kind==='andres'){R(2+lean,ty+2,1,10,C(10));R(1+lean,ty+11,4,5,C(7));}
   if(L_.kind==='me')R(-bw/2+lean,ty+18,bw,4,C(8));
   // cabeza
   const hw=L_.kind==='andres'?14:12,hx=-hw/2+lean*1.5,hy=-54+by;
   R(hx,hy,hw,12,C(L_.skin));
   if(L_.bald){R(hx+2,hy+1,3,1,C("#FFFFFF"));}else{R(hx,hy,hw,3,C(L_.hair));R(hx,hy,4,8,C(L_.hair));}
   if(L_.beard){R(hx+3,hy+7,hw-3,5,C(L_.hair));R(hx,hy+4,3,6,C(L_.hair));R(hx+7,hy+9,3,1,C(L_.skin));}
   R(hx+hw-4,hy+5,2,2,C(0));if(!L_.beard)R(hx+hw-5,hy+9,4,1,C(st==='hurt'?8:0));
   if(L_.glasses){const gf=st==='sp'&&f.spk==='beam'&&f.t<0.45&&Math.floor(t*14)%2;BOXL(hx+hw-6,hy+4,5,4,C(0));R(hx+hw-5,hy+5,3,2,gf?7:"#9ED8FF");R(hx+3,hy+5,hw-9,1,C(0));}
   if(L_.kind==='me')R(hx+1,hy-1,10,2,C(L_.hair));
   // brazos
   const G=bw>=20?5:4;
   if(st==='punch'){const out=f.t>=ATK.punch.s*0.5&&f.t<ATK.punch.s+ATK.punch.a+0.05;if(out){R(4,-47+by,17,4,C(L_.skin));disc(23,-45+by,G+1,C(L_.glove));disc(4,ty+8,G,C(L_.glove));}else{disc(10,ty+2,G,C(L_.glove));disc(4,ty+8,G,C(L_.glove));}}
   else if(st==='upper'){R(6,ty-16,4,18,C(L_.skin));disc(8,ty-18,G+1,C(L_.glove));disc(2,ty+8,G,C(L_.glove));}
   else if(st==='ball'||(st==='sp'&&(f.spk==='beam'||f.spk==='triple'))){R(4,ty+3,12,4,C(L_.skin));disc(16,ty+3,G,C(L_.glove));disc(15,ty+9,G,C(L_.glove));if(st==='ball'&&f.t<0.22){const r=(f.sup?5:2)+f.t*(f.sup?45:25);disc(22,ty+6,r,f===this.me?12:10);disc(22,ty+6,r*0.5,7);}}
   else if(st==='chargeB'){const r=3+Math.min(1,f.t/CHG)*7+Math.sin(t*30);disc(12,ty+6,G,C(L_.glove));disc(12,ty+12,G,C(L_.glove));disc(14,ty+9,r,12);disc(14,ty+9,r*0.55,7);}
   else if(st==='chargeF'){disc(-6,ty+2,G,C(L_.glove));disc(8,ty+2,G,C(L_.glove));}
   else if(st==='back'&&this.phase==='fight'||st==='bstun'){disc(9,ty+2,G,C(L_.glove));disc(9,ty+10,G,C(L_.glove));R(4,ty+2,4,10,C(L_.skin));}
   else if(st==='hurt'||st==='ko'){disc(-4,ty+2,G,C(L_.glove));disc(-9,ty+6,G,C(L_.glove));}
   else if(st==='fkick'||f.jk||spin){disc(-8,ty+2,G,C(L_.glove));disc(6,ty,G,C(L_.glove));}
   else{const b=st==='idle'?Math.round(Math.sin(t*6)):0;R(4,ty+5,6,3,C(L_.skin));disc(11,ty+1+b,G,C(L_.glove));disc(5,ty+6-b,G,C(L_.glove));}
   g.restore();
   if(st==='chargeF'||st==='chargeB'){const k=Math.min(1,f.t/CHG),r=16+k*10+Math.sin(t*20)*2;g.strokeStyle=col(st==='chargeB'?12:9);g.globalAlpha=0.5+k*0.5;g.beginPath();g.ellipse(f.x,f.y-28,r*0.7,r,0,0,7);g.stroke();g.globalAlpha=1;if(f.full)TC("¡LISTO!",f.y-80,7,1,0,clamp(f.x,24,W-24));}
   if(spin){g.globalAlpha=0.6;for(let k=0;k<3;k++){g.strokeStyle=col([9,10,7][k]);g.beginPath();g.ellipse(f.x,f.y-28+k*4,30-k*4,6,0,t*20+k,t*20+k+4);g.stroke();}g.globalAlpha=1;}
   if(f.shout){f.shout.k+=1/60;if(f.shout.k<0.8)TC(f.shout.t,f.y-72-f.shout.k*8,f===this.me?12:8,1,0,clamp(f.x,4+TW(f.shout.t)/2,W-4-TW(f.shout.t)/2));}},
 drawBall(p,t){const x=Math.round(p.x),y=Math.round(p.y);
   if(p.kind==='me'){for(let k=1;k<4;k++)disc(x-Math.sign(p.vx)*k*5,y,5-k,k%2?12:7);disc(x,y,6,12);disc(x,y,4,7);disc(x+Math.cos(t*20)*2,y+Math.sin(t*20)*2,2,12);}
   else if(p.kind==='super'){for(let k=1;k<6;k++)disc(x-Math.sign(p.vx)*k*6,y+Math.sin(t*30+k)*2,10-k*1.5,k%2?12:7);disc(x,y,12,1);disc(x,y,11,12);disc(x,y,7,7);for(let k=0;k<6;k++){const a=t*12+k;PX(x+Math.cos(a)*14,y+Math.sin(a)*14,k%2?10:7);}}
   else if(p.kind==='form'){R(x-7,y-5,14,10,7);BOXL(x-7,y-5,14,10,5);for(let k=0;k<2;k++){R(x-5,y-3+k*4,2,2,11);R(x-2,y-2+k*4,7,1,5);}}
   else if(p.kind==='wave'){for(let k=0;k<4;k++){R(x-k*6,y+2-k*2,4,6+k*2,k%2?9:10);}R(x-3,y-4,6,10,7);}
   else if(p.kind==='kpi'){R(x-8,y-7,16,13,7);BOXL(x-8,y-7,16,13,1);R(x-6,y+1,3,3,12);R(x-2,y-1,3,5,12);R(x+2,y-4,3,8,11);LN(x-6,y-1,x+5,y-6,8);}
   else if(p.kind==='doc'){R(x-5,y-7,11,14,7);BOXL(x-5,y-7,11,14,5);for(let k=0;k<4;k++)R(x-3,y-4+k*3,7,1,5);R(x-3,y+4,4,2,8);}
   else{disc(x,y,6,0);disc(x,y,5,7);}},

 stage(t){R(0,0,W,H,"#0C1424");R(0,13,W,26,"#101A2E");
   // bandejas de fibra óptica en el techo, con pulsos de luz
   R(0,47,W,3,"#2A3450");const fc=["#FFEC27","#29ADFF","#FF77A8","#00E436"];fc.forEach((c,i)=>{const y=50+i*2;R(0,y,W,1,c);for(let k=0;k<3;k++){const x=((t*(90+i*25)+k*97+i*40)%(W+20))-10;R(x,y,5,1,7);}});
   // racks de servidores
   for(let i=0;i<9;i++){const x=4+i*28;if(i===4)continue;R(x,60,24,64,"#1B2438");R(x+1,61,22,62,"#222E48");for(let u=0;u<10;u++){const y=63+u*6;R(x+3,y,18,4,"#141C30");const on=Math.sin(t*(3+(i*7+u)%5)+i*3+u*1.7)>0.2;PX(x+5,y+1,on?((i+u)%3?11:12):"#2A3A2A");PX(x+7,y+1,((i*3+u)%4===0&&Math.floor(t*6+u)%2)?9:"#2A2A2A");R(x+11,y+1,8,1,"#2A3450");}
     if(i%2===0){LN(x+20,61,x+20,57,fc[i%4]);}}
   // pantalla NOC al centro
   R(116,58,28,26,"#0B1020");BOXL(116,58,28,26,6);T("NOC",121,60,11);for(let k=0;k<5;k++){const a=t+k*1.3;PX(122+((k*9)%18),70+((k*5)%8),Math.sin(a*4)>0?11:12);}LN(120,80,124,75,11);LN(124,75,130,77,11);LN(130,77,140,69,11);
   R(118,84,24,36,"#1B2438");R(120,88,20,12,"#0B1020");R(122,90,16,8,12);R(128,100,4,6,5);R(122,106,16,2,5);
   R(34,64,42,11,"#0B1020");BOXL(34,64,42,11,6);T("SALA 1",37,66,11);R(176,64,66,11,"#0B1020");BOXL(176,64,66,11,6);T("DATACENTER",179,66,12);
   // piso técnico elevado
   R(0,GYF,W,H-GYF,"#6A7488");R(0,GYF,W,2,"#9AA4B8");for(let x=-60;x<W+60;x+=24)LN(x,GYF+2,x+(x-128)*0.35,H,"#5A6478");R(0,GYF+10,W,1,"#5A6478");
   for(let x=10;x<W;x+=48){for(let k=0;k<3;k++)R(x+k*4,GYF+4,2,1,"#4A5468");}},
 draw(t){g.save();if(this.shake>0&&!REDUCED)g.translate(Math.round(Math.sin(t*70)*2),Math.round(Math.cos(t*55)*1));
   this.stage(t);
   for(const f of [this.me,this.foe]){g.globalAlpha=0.3*f.alpha;R(f.x-12,GYF+1,24,3,0);g.globalAlpha=1;}
   this.drawF(this.foe,t);this.drawF(this.me,t);for(const p of this.projs)this.drawBall(p,t);
   if(this.beam&&this.beam.t<0.35){const f=this.beam.f,x0=f.face>0?f.x+14:0,x1=f.face>0?W:f.x-14,y=f.y-46,k=Math.sin(this.beam.t/0.35*Math.PI);R(x0,y-3*k-1,x1-x0,6*k+2,"rgba(255,0,77,0.5)");R(x0,y-1,x1-x0,2,7);}
   for(const p of this.parts){g.globalAlpha=1-p.t/p.life;R(p.x-1,p.y-1,2,2,p.c);}g.globalAlpha=1;
   for(const e of this.fx){const r=2+e.t*40;for(let k=0;k<8;k++){const a=k*Math.PI/4;PX(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,e.c);PX(e.x+Math.cos(a)*r*0.6,e.y+Math.sin(a)*r*0.6,7);}}
   g.restore();
   if(this.koFlash>0){this.koFlash-=1/60;R(0,0,W,H,`rgba(255,255,255,${Math.max(0,this.koFlash*5)})`);}
   R(0,13,W,34,"rgba(11,16,32,0.92)");R(0,46,W,1,12);const me=this.me,fo=this.foe,nm=FOES[this.ri].n;
   T("ÁLVARO",4,16,7);R(4,25,106,8,0);R(5,26,104,6,8);R(5,26,Math.round(104*me.hp/me.max),6,10);
   T(nm,W-4-TW(nm),16,7);R(W-110,25,106,8,0);R(W-109,26,104,6,8);const fw=Math.round(104*Math.max(0,fo.hp)/fo.max);R(W-5-fw,26,fw,6,10);
   TC(String(Math.ceil(this.timer)).padStart(2,'0'),16,this.timer<10?8:10,2,0);
   T("BOLA",4,38,me.cdB<=0?12:5);T("VOLAR",34,38,me.cdF<=0?12:5);TC("RIVAL "+(this.ri+1)+"/3",38,6);
   for(const f of [me,fo])if(f.combo>1&&f.comboT>0){const s=f.combo+" GOLPES";T(s,f===me?4:W-4-TW(s),48,f===me?10:8);}
   if(this.phase==='intro'){R(30,58,196,28,0);BOXL(30,58,196,28,10);if(this.pt<1.4){TC("RIVAL "+(this.ri+1)+"/3",62,6);TC(nm,73,10);}else TC("¡A PELEAR!",65,10,2);}
   if(this.phase==='ko'&&this.pt>0.3&&(this.pt>1.8||Math.floor(this.pt*6)%2))TC("K.O.",56,8,3,0);
   if(this.phase==='time')TC("¡TIEMPO!",60,10,2,0);
   if(TOUCHUI){g.globalAlpha=0.55;const held=Object.values(this.touches);for(const z of PAD){const on=held.includes(z.k)||this.inp[z.k];R(z.x,z.y,z.w,z.h,on?7:0);BOXL(z.x,z.y,z.w,z.h,6);TC(z.l,z.y+Math.floor((z.h-7)/2),on?0:7,1,null,z.x+z.w/2);}
     if(me.cdB>0)R(170,140,Math.round(42*(1-me.cdB/2)),2,12);if(me.cdF>0)R(214,140,Math.round(40*(1-me.cdF/2)),2,12);g.globalAlpha=1;}
   hud(this.name+" · ROUND "+Math.min(this.ri+1,3),String(this.score).padStart(5,'0'));}
};

// ======================= NIVEL 8: DEATHMATCH (arcade) =======================
ATK.jkick.over=true;ATK.fkick.over=true;ATK.fkick.dmg=15;ATK.fkick.box=[2,-30,32,20];ATK.beam.dmg=10;
const DM_P2={s:0.06,a:0.09,r:0.14,dmg:6,box:[8,-44,24,12],push:50,stun:0.3},DM_K1={s:0.09,a:0.08,r:0.2,dmg:5,box:[6,-19,20,9],push:40,stun:0.28},DM_K2={s:0.08,a:0.09,r:0.16,dmg:6,box:[6,-34,26,9],push:50,stun:0.3},DM_K3={s:0.1,a:0.1,r:0.24,dmg:9,box:[4,-52,30,13],push:150,stun:0.45,knock:true,fin:true};
const COMBO_N=[[9,'¡SENTENCIA FIRME!'],[7,'¡IMPARABLE!'],[5,'¡DEMOLEDOR!'],[3,'¡CONTUNDENTE!']];
const FIN_SH={seba:'¡YO PUEDO!',fran:'¡COMMIT!',alvaro:'¡ALEGATO!',samir:'¡MALETÍN!',andres:'¡CABEZAZO!',jl:'¡TOMÁ!',jean:'¡TECLAZO!',coni:'¡LAPTOP!',brandan:'¡BILLETERAZO!'};
const DM_PUNCH={s:0.05,a:0.09,r:0.13,dmg:5,box:[8,-44,21,12],push:40,stun:0.26},DM_JK={dmg:8,box:[2,-20,24,22],push:85,stun:0.32,over:true};
Object.assign(ATK,{cpunch:{s:0.04,a:0.08,r:0.12,dmg:4,box:[8,-26,22,8],push:20,stun:0.26,low:true},cp3:{s:0.05,a:0.09,r:0.18,dmg:6,box:[8,-26,26,8],push:110,stun:0.34,low:true},csweep:{s:0.12,a:0.1,r:0.28,dmg:9,box:[4,-9,32,8],push:40,stun:0.6,low:true,knock:true},p3:{s:0.06,a:0.1,r:0.22,dmg:8,box:[6,-60,22,22],push:150,stun:0.45,knock:true,fin:true},whip:{s:0.11,a:0.18,r:0.18,dmg:9,box:[10,-42,52,9],push:-170,stun:0.5},
 cnt:{dmg:12,push:170,stun:0.5},bigb:{dmg:18,push:180,stun:0.55},thick:{dmg:18,push:150,stun:0.5},wave2:{dmg:8,push:60,stun:0.8}});
const DMC=[
 {id:'alvaro',n:'ÁLVARO',role:'LEGAL',spd:79,hp:98,dmul:0.95,s:['objecion','patada'],sn:['BOLA OBJECIÓN','PATADA VOLADORA'],win:"OBJECIÓN ACOGIDA. SIGUIENTE.",
  look:{skin:'#EAC4A6',hair:'#141214',top:'#26282F',inner:'#F2F2F2',pants:'#1C1E26',glove:8,bw:16,kind:'me',suit:true,quiff:true,glasses:true,glassC:'#1A1A1A',lens:'clear',h:-3}},
 {id:'samir',n:'SAMIR',role:'JEFE LEGAL',spd:78,hp:108,dmul:1.15,s:['objetado','revision'],sn:['OBJETADO','REVISIÓN'],win:"REVISADO Y APROBADO.",
  look:{skin:'#E2B896',hair:'#1C1612',beardC:'#1C1612',top:'#262650',shirt:'#DCDCEE',pants:'#22224A',glove:2,bw:18,kind:'samir',bald:true,beard:true,suit:true,tie:'#1A1A2E',h:-1}},
 {id:'andres',n:'ANDRÉS',role:'RECURSOS HUMANOS',spd:52,hp:108,dmul:1.08,s:['evaluacion','capacitacion'],sn:['EVALUACIÓN','CAPACITACIÓN'],win:"NOS VEMOS EN LA EVALUACIÓN.",
  look:{skin:'#D4A07C',hair:'#1C1612',top:'#141416',txt3:'BOSS',noLanyard:true,pants:'#24242C',glove:11,bw:21,kind:'andres',fade:true,h:0}},
 {id:'jl',n:'JOSÉ LUIS',role:'GERENTE GENERAL',spd:78,hp:120,dmul:1.1,s:['kpi','vision'],sn:['KPI','VISIÓN'],win:"¡UN GOLAZO, CHE! BÁRBARO.",
  look:{skin:'#A06A42',hair:'#262220',top:'#1C1C20',pants:'#2E3440',glove:'#29ADFF',bw:17,kind:'jl',glasses:true,glassC:'#3A2212',messy:true,smile:true,casual:true,h:0}},
 {id:'jean',n:'JEAN',role:'TI',spd:68,hp:110,dmul:1.06,s:['ticket','cable'],sn:['TICKET','CABLE DE RED'],win:"¿PROBASTE APAGAR Y PRENDER?",
  look:{skin:'#B98459',hair:'#15110E',top:'#17171C',pants:'#3A3C44',shoes:'#EDEDED',glove:'#E6E6EE',bw:22,kind:'jean',h:-5,fade:true,zip:true,print:true,tee:'#2A1A2E',chain:true,baggy:true,hood:true,cord:'#17171C',pocket:'#101014'}},
 {id:'coni',n:'CONI',role:'AUTOMATIZACIÓN',spd:88,hp:115,dmul:1.08,s:['bot','cartas'],sn:['BOT','CARTAS'],win:"ESTO LO AUTOMATIZO EN 5 MIN.",
  look:{skin:'#F6D8C4',hair:'#3A2420',top:'#1C1C22',inner:'#7A1A2E',pants:'#26262E',glove:'#D04A6A',bw:15,kind:'coni',glasses:true,glassC:'#D8A878',lips:'#8A2A3A',bangs:true,longHair:true,hairLen:18,h:3}},
 {id:'seba',n:'SEBASTIÁN',role:'PROVEEDORES',spd:77,hp:109,dmul:1.05,s:['billetera','riff'],sn:['BILLETERA VACÍA','RIFF METALERO'],win:"NO HAY PLATA. PÁGUENME.",
  look:{skin:'#D6AE8A',hair:'#2A1E18',top:'#141418',slime:true,pants:'#262C3A',glove:'#5BD12A',shoes:'#111111',bw:20,kind:'seba',ponytail:true,stubble:'rgba(40,28,20,0.55)',glasses:true,glassC:'#111111',lens:'clear',h:0}},
 {id:'brandan',n:'JOSÉ BRANDAN',role:'COBRANZA',spd:76,hp:110,dmul:1.06,s:['balance','auditoria'],sn:['BALANCE','AUDITORÍA'],win:"¡QUÉ LINDO BALANCE, CHE!",
  look:{skin:'#C8946A',hair:'#1A1410',top:'#F2F4F8',stripes:'#6CACE4',pants:'#1E2230',glove:'#E8C040',bw:18,kind:'brandan',quiff:true,stubble:'rgba(36,26,20,0.55)',smile:true,h:0}},
 {id:'fran',n:'FRANCISCO',role:'PROGRAMADOR',spd:84,hp:115,dmul:1.1,s:['prompt','aluc'],sn:['PROMPT','ALUCINACIÓN'],win:"TODO ES MENTE. Y CÓDIGO.",
  look:{skin:'#E8BE9C',hair:'#5E4630',beardC:'#4A3624',sym:'#B99CFF',top:'#3A3F4A',pants:'#3E5C8A',shoes:'#EDEDED',glove:'#8A5CFF',bw:19,kind:'fran',beard:true,hood:true,cord:'#B99CFF',pocket:'#2C3038',h:0}}];
// [normal, cargado]
function LIMB(x1,y1,x2,y2,w,col){const dx=x2-x1,dy=y2-y1,n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));for(let i=0;i<=n;i++)R(Math.round(x1+dx*i/n-w/2),Math.round(y1+dy*i/n-w/2),w,w,col);}
const MVS={objecion:["¡OBJECIÓN!","¡SÚPER OBJECIÓN!"],patada:["¡HAAA!","¡TORBELLINO!"],objetado:["¡OBJETADO!","¡TRES CLÁUSULAS!"],revision:["¡REVISIÓN!","¡REVISIÓN TOTAL!"],
 evaluacion:["¡EVALUACIÓN!","¡EVALUACIÓN 360!"],capacitacion:["¡CAPACITACIÓN!","¡CAPACITACIÓN DOBLE!"],kpi:["¡TOMÁ ESTE KPI!","¡KPI GIGANTE, CHE!"],vision:["¡MIRÁ ESTO!","¡VISIÓN 2030, VIEJO!"],
 billetera:["¡NO HAY PLATA!","¡PRESUPUESTO CERO!"],riff:["¡RIFF!","¡SOLO INFINITO!"],ticket:["¡TICKET!","¡REINICIO!"],cable:["¡CABLE!","¡FIREWALL 2.0!"],bot:["¡BOT!","¡TRES BOTS!"],cartas:["¡CARTA!","¡CARTAS CARGADAS!"],balance:["¡BALANCE!","¡LLUEVE PLATA, CHE!"],auditoria:["¡AUDITORÍA!","¡EMBARGO!"],prompt:["¡PROMPT!","¡PROMPT LARGO!"],aluc:["¡ALUCINACIÓN!","¡EL TODO ES MENTE!"]};
const MVAI={billetera:[70,999],riff:[28,120],objecion:[70,999],patada:[40,130],objetado:[70,999],revision:[80,999],evaluacion:[60,999],capacitacion:[40,150],kpi:[70,999],vision:[70,999],ticket:[70,999],cable:[20,56],bot:[70,999],cartas:[60,999],balance:[70,999],auditoria:[0,0],prompt:[70,999],aluc:[60,999]};
const PAD8=[{k:'left',x:2,y:110,w:26,h:32,l:'←'},{k:'up',x:30,y:110,w:26,h:15,l:'↑'},{k:'down',x:30,y:127,w:26,h:15,l:'↓'},{k:'right',x:58,y:110,w:26,h:32,l:'→'},
 {k:'punch',x:170,y:110,w:42,h:15,l:'GOLPE'},{k:'kick',x:214,y:110,w:40,h:15,l:'PATADA'},{k:'s0Hold',x:170,y:127,w:42,h:15,l:'ESP. 1'},{k:'s1Hold',x:214,y:127,w:40,h:15,l:'ESP. 2'}];
const HOLD8=['left','right','down','s0Hold','s1Hold'];
const GRAB_R=21,GRABBABLE=['idle','walk','back','crouch','charge','counter','land'],SUPG={hit:7,hitTaken:5,blk:2,blkTaken:2};
const SUPERS={alvaro:{n:'RÁFAGA DE OBJECIONES',d:1.15,at:[0.08,0.18,0.28,0.38,0.48,0.75],go(L,f,o,i){if(i<5)L.proj(f,{kind:'me',dmg:5,vx:f.face*230,y:f.y-40+[-8,3,-5,5,-1][i]});else L.proj(f,{kind:'super',r:11,dmg:16,push:190,stun:0.6,vx:f.face*175,pierce:true,boom:true,y:f.y-38});}},
 samir:{n:'DEMANDA COLECTIVA',d:1.2,at:[0.1,0.17,0.24,0.31,0.38,0.45,0.52,0.59,0.66,0.73],go(L,f,o,i){L.proj(f,{kind:'doc',x:clamp(o.x+(i-4.5)*6,10,W-10),y:44,vx:0,vy:180,dmg:5,r:6,stun:0.25,over:true});}},
 andres:{n:'REESTRUCTURACIÓN',d:1.0,at:[0.1,0.4,0.7],go(L,f,o,i){if(i===0)FX.boxes(o.x);L.proj(f,{kind:'wave',x:f.x+f.face*16,y:f.y-6,vx:f.face*200,low:true,dmg:9,r:5,stun:0.5});L.shake=0.25;tone('sine',70,AT(),0.4,0.9,null,35);}},
 jl:{n:'VISIÓN 2050',d:1.3,at:[0.3],go(L,f,o,i){L.beam={f,t:0,hit:false,thick:true,multi:5,tick:0};tone('sawtooth',700,AT(),1.0,0.08,null,1500);}},
 jean:{n:'FORMATEO TOTAL',d:0.8,at:[0.3],go(L,f,o,i){L.blueFx=0;FX.overlay('bsod',1.6);L.hit(f,o,{dmg:14,push:0,stun:2.0,unblock:true},f.face,o.x,o.y-30,{freeze:2.0});tone('square',200,AT(),0.6,0.1,null,60);}},
 coni:{n:'EJÉRCITO DE BOTS',d:1.0,at:[0.1,0.22,0.34,0.46,0.58,0.7],go(L,f,o,i){if(i===0)FX.overlay('code',1.6);L.proj(f,{kind:'bot',y:f.y-8,vx:f.face*115,low:true,dmg:6,r:6});}},
 seba:{n:'GAME OVER',d:1.3,at:[0.15,0.45,0.75],go(L,f,o,i){if(i===0)FX.overlay('arcade',2.0);L.proj(f,{kind:'skull',dmg:9,r:12,vx:f.face*175,y:f.y-[48,30,40][i],push:120,stun:0.45});tone('sawtooth',[82,110,73][i],AT(),0.4,0.1,null,null,{dist:true,lp:1800});tone('square',[330,392,262][i],AT(),0.3,0.05);}},
 fran:{n:'MULTI-AGENTE',d:1.3,at:[0.1,0.17,0.24,0.31,0.38,0.45,0.52,0.59],go(L,f,o,i){L.proj(f,{kind:'agent',x:f.x-f.face*12,y:f.y-[50,30,16,42,22,36,12,46][i],vx:f.face*230,dmg:4,r:5,stun:0.2});}},
 brandan:{n:'DEFAULT',d:1.1,at:[0.1,0.16,0.22,0.28,0.34,0.4,0.46,0.52,0.58,0.64,0.7,0.76],go(L,f,o,i){if(i===0)FX.overlay('crash',1.6);L.proj(f,{kind:i%3?'bill':'coin',x:clamp(o.x+((i*37)%60)-30,10,W-10),y:40,vx:0,vy:170,dmg:4,r:5,stun:0.25,over:true});}}};
const STA={max:100,blockBase:10,blockMul:1.6,dash:22,regen:26,regenGuard:7,delay:0.6,breakStun:1.1,recover:35,fwd:290,bwd:240,dashT:0.17,inv:0.13};
function dmFighter(C,x,face,ai){return {C,look:C.look,x,y:GYF,vx:0,vy:0,face,st:'idle',t:0,hp:C.hp,max:C.hp,spd:C.spd,dmul:C.dmul,cd:[0,0],sta:STA.max,staT:0,broken:false,inv:0,walkT:0,active:false,hitDone:false,combo:0,comboT:0,cstep:0,ai:{},aiT:0.8,aiHold:0,isAI:ai,shout:null,alpha:1};}
const L8={id:'deathmatch',name:'DEATHMATCH',sub:'Modo arcade · 8 luchadores',
 howto:["ZZZ: 3 GOLPES · XXX: 3 PATADAS","ZZX: BARRIDA · ZZ + C/V: CANCELA","C/V ESPECIALES (MANTÉN: CARGADOS)","→+Z PEGADO: AGARRE · C+V: ¡SÚPER!","ATRÁS CUBRE · ↓ BAJOS · DOBLE →: DASH","3 ROUNDS · ¡ACÁBALO!: F + FLECHAS"],
 init(){this.ph='select';this.sel=0;this.pt=0;this.score=0;this.taken=0;this.landed=0;this.cont=0;this.wins=0;this.inp={};this.touches={};this.fx=[];this.parts=[];this.projs=[];this.walls=[];this.stop=0;this.shake=0;this.koFlash=0;
   if(A.mus)A.mus.gain.value=0.45;this.selMusic();},
 selMusic(){musicStart(128,(s,t,s16)=>{const bar=Math.floor(s/16)%4,root=[45,43,41,43][bar];if(s%4===0)kick(t,0.4);if(s%8===4)snare(t,0.18);if(s%2===1)hat(t,false,0.04);
   tone('pulse',hz(root+12+[0,7,12,7,3,7,12,15][s%8]),t,s16*0.8,0.04,A.mus);if(s%16===0)tone('triangle',hz(root),t,s16*15,0.12,A.mus);});},
 fightMusic(){musicStart(150,(s,t,s16)=>{const bar=Math.floor(s/16)%4,root=[40,40,43,38][bar];if(s%2===0)[0,7].forEach(k=>tone('sawtooth',hz(root+k),t,s16*1.6,0.045,A.mus,null,{lp:1600,dist:true}));
   if(s%8===0||s%16===10)kick(t,0.6);if(s%8===4)snare(t,0.3);if(s%2===0)hat(t,false,0.05);if(s%16===12)tone('square',hz(root+19),t,s16*3,0.03,A.mus,null,{lp:2000});});},
 pick(i){this.me0=DMC[i];const rest=DMC.filter(c=>c!==this.me0);this.ladder=shuffle(rest.slice());this.stage=0;this.say0=null;S.win();this.startVS();},
 startVS(){this.ph='challenger';this.pt=0;musicStop();const t=AT();for(let k=0;k<4;k++){tone('square',880,t+k*0.3,0.14,0.06);tone('square',660,t+k*0.3+0.15,0.14,0.06);}},
 startFight(){this.setupCrowd();this.rw=[0,0];this.round=1;this.meter=[0,0];this.ph='fight';this.stageK=this.stage%2?'oficina':'dc';this.fightMusic();
   const k=this.stage/5;this.P={think:lerp(0.46,0.26,k),aggr:lerp(0.45,0.62,k),block:lerp(0.2,0.5,k),sp:lerp(0.18,0.32,k),chg:lerp(0.1,0.35,k),jump:0.08,anti:lerp(0.15,0.5,k),read:lerp(0.55,0.85,k),grab:lerp(0.2,0.45,k),tech:lerp(0.15,0.4,k),supP:lerp(0.3,0.6,k),react:lerp(0.34,0.2,k),pun:lerp(0.45,0.8,k)};this.startRound();},
 startRound(){this.beam=null;const C=this.ladder[this.stage];this.me=dmFighter(this.me0,70,1,false);this.foe=dmFighter(C,186,-1,true);this.me.sup=this.meter[0];this.foe.sup=this.meter[1];this.superFx=null;this.blueFx=0;this.projs=[];this.walls=[];this.decoys=[];this.parts=[];this.fx=[];this.puddles=[];this.fat=null;this.fatEnd=null;this.fin=null;this.beam=null;this.whip=null;
   this.sub='intro';this.pt=0;this.timer=60;this.inp={};this.touches={};S.bell(0.25);},
 say(f,txt){f.shout={t:txt,k:0};},
 // ---------- luchador ----------
 fup(f,inp,o,dt){f.t+=dt;f.cd[0]=Math.max(0,f.cd[0]-dt);f.cd[1]=Math.max(0,f.cd[1]-dt);if(f.comboT>0){f.comboT-=dt;if(f.comboT<=0)f.combo=0;}
   const onG=f.y>=GYF-0.01;f.back=(o.x>f.x?inp.left:inp.right);f.active=false;
   {const airOK=['jump','fkick','hurt','bstun','frozen','ko','thrown','grabbed'];if(f.y<GYF-0.01&&!airOK.includes(f.st)){f.vy=(f.vy||0)+GRV*dt;f.y=Math.min(GYF,f.y+f.vy*dt);if(f.y>=GYF){f.y=GYF;f.vy=0;}}}
   if(f.st==='win'||f.st==='lose'||f.st==='intro')return;
   if(f.inv>0)f.inv-=dt;if(inp.punch)f.bufP=0.2;else if(f.bufP>0)f.bufP-=dt;if(inp.kick)f.bufK=0.2;else if(f.bufK>0)f.bufK-=dt;f.e0=!!inp.s0Hold&&!f.h0;f.h0=!!inp.s0Hold;f.e1=!!inp.s1Hold&&!f.h1;f.h1=!!inp.s1Hold;if(f.e0)f.b0=0.2;else if(f.b0>0)f.b0-=dt;if(f.e1)f.b1=0.2;else if(f.b1>0)f.b1-=dt;if(f.staT>0)f.staT-=dt;else if(f.st!=='ko'){const guard=f.st==='back'||f.st==='bstun';f.sta=Math.min(STA.max,f.sta+(guard?STA.regenGuard:STA.regen)*dt);}if(f.broken&&f.sta>=STA.recover){f.broken=false;}
   const air=()=>{f.x+=f.vx*dt;f.vy+=GRV*dt;f.y+=f.vy*dt;if(f.y>=GYF){f.y=GYF;f.vy=0;return true;}return false;};
   if(f.st==='ko'){f.alpha=1;if(f.x<16||f.x>W-16){f.x=clamp(f.x,16,W-16);f.vx=-f.vx*0.3;}if(f.y<GYF||f.vy<0){f.x+=f.vx*dt;f.vy+=GRV*dt;f.y+=f.vy*dt;if(f.y>=GYF){f.y=GYF;if(!f.bounced&&f.vy>80){f.bounced=true;f.vy=-f.vy*0.35;f.vx*=0.5;this.shake=0.25;tone('sine',80,AT(),0.3,0.8,null,40);for(let i=0;i<14;i++)this.parts.push({x:f.x+(RND()-0.5)*30,y:GYF-2,vx:(RND()-0.5)*80,vy:-RND()*50,t:0,life:0.6,c:6,grav:true});}else{f.vy=0;f.land=true;}}}else{f.vx*=Math.pow(0.02,dt);f.x+=f.vx*dt;}return;}
   if(f.st==='hurt'||f.st==='bstun'||f.st==='frozen'){f.alpha=1;f.vx*=Math.pow(0.004,dt);f.x+=f.vx*dt;if(f.y<GYF){f.vy+=GRV*dt;f.y=Math.min(GYF,f.y+f.vy*dt);}if(f.y>=GYF){f.juggle=0;if(f.airKD){FX.dust(f.x,GYF,9);f.airKD=false;f.st='down';f.t=0;f.vx*=0.3;this.shake=Math.max(this.shake,0.12);return;}}if(f.t>=f.stun&&f.y>=GYF){this.idle(f);if(inp.down)f.st='crouch';}return;}
   if(f.st==='grab'){if(f.t>=0.32&&!f.thrown2){f.thrown2=true;const o2=f.grabbed;if(o2&&o2.st==='grabbed'){o2.st='thrown';o2.t=0;o2.vy=-210;o2.vx=-f.face*150;o2.x=f.x+f.face*6;o2.thrower=f;this.whoosh();tone('square',180,AT(),0.2,0.07,null,90);}}if(f.t>=0.55)this.idle(f);return;}
   if(f.st==='grabbed'){const gb=f.grabber;if(!gb||gb.st!=='grab'){this.idle(f);return;}f.x=gb.x+gb.face*18;if(f.t<0.25&&inp.punch&&!f.teched){f.teched=true;this.tech(gb,f);}return;}
   if(f.st==='thrown'){f.x+=f.vx*dt;f.vy+=GRV*dt;f.y+=f.vy*dt;if(f.x<14||f.x>W-14){f.x=clamp(f.x,14,W-14);f.vx=-f.vx*0.3;}if(f.y>=GYF){f.y=GYF;f.vy=0;const a=f.thrower;f.st='idle';f.inv=0;this.hit(a,f,{dmg:12,push:30,stun:0.5,unblock:true,knock:true},-a.face,f.x,GYF-10);this.shake=0.3;for(let i=0;i<12;i++)this.parts.push({x:f.x+(RND()-0.5)*30,y:GYF-2,vx:(RND()-0.5)*80,vy:-RND()*50,t:0,life:0.6,c:6,grav:true});}return;}
   if(f.st==='super'){const S_=SUPERS[f.C.id];S_.at.forEach((tt,i)=>{if(f.t>=tt&&f.phase===i){f.phase=i+1;S_.go(this,f,o,i);}});if(f.t>=S_.d)this.idle(f);return;}
   if(f.st==='down'){f.vx*=Math.pow(0.01,dt);f.x+=f.vx*dt;if(f.t>=0.75){this.idle(f);f.inv=0.2;f.wake=0.35;}return;}
   if(f.st==='cpunch'||f.st==='csweep'){const A_=f.st==='cpunch'&&f.cstep===2?ATK.cp3:ATK[f.st];f.active=f.t>=A_.s&&f.t<A_.s+A_.a;
     if(f.st==='cpunch'&&f.t>=A_.s+A_.a*0.5&&f.cstep<2&&f.bufP>0){f.bufP=0;f.cstep++;f.t=0;f.hitDone=false;this.whoosh();return;}
     if(f.t>=A_.s+A_.a+A_.r){this.idle(f);if(inp.down)f.st='crouch';}return;}
   if(f.st==='punch'||f.st==='kick'){const A_=this.curAtk(f);f.active=f.t>=A_.s&&f.t<A_.s+A_.a;const late=f.t>=A_.s+A_.a*0.5,step=f.st==='punch'?f.cstep:(f.kstep||0);
     if(late&&step>=1&&f.hitDone){for(const sl of [0,1]){if((inp['s'+sl]||f['b'+sl]>0)&&f.cd[sl]<=0&&f.C.s[sl]!=='auditoria'){f['b'+sl]=0;f.cancelN=(f.cancelN||0)+1;this.fx.push({x:f.x+f.face*14,y:f.y-44,t:0,c:14,big:true});this.startSp(f,o,sl,false);f.shout={t:"¡CANCELA! "+MVS[f.C.s[sl]][0],k:0};return;}}}
     if(f.st==='punch'&&late&&step===1&&f.bufK>0&&f.hitDone){f.bufK=0;f.st='csweep';f.t=0.04;f.hitDone=false;f.routeN=(f.routeN||0)+1;noise(AT(),0.12,0.08,'bandpass',900);return;}
     if(late&&step<2&&(f.hitDone||f.auto>0)){if(f.st==='punch'&&(f.bufP>0||f.auto>0)){f.bufP=0;if(f.auto>0)f.auto--;f.cstep++;f.t=0;f.hitDone=false;this.whoosh();if(f.cstep===2)this.say(f,FIN_SH[f.C.id]);return;}
       if(f.st==='kick'&&f.bufK>0){f.bufK=0;f.kstep=(f.kstep||0)+1;f.t=0;f.hitDone=false;this.whoosh();return;}}
     if(f.t>=A_.s+A_.a+A_.r)this.idle(f);return;}
   if(f.st==='charge'&&(inp.super||(inp.s0Hold&&inp.s1Hold))&&f.sup>=100){this.startSuper(f);return;}
   if(f.st==='charge'){const hold=inp['s'+f.slot+'Hold'],full=f.t>=CHG;
     if(full&&!f.full){f.full=true;const t=AT();tone('sine',1320,t,0.25,0.1);tone('sine',1980,t+0.05,0.25,0.06);}
     if(!full&&Math.floor(f.t*10)!==Math.floor((f.t-dt)*10))tone('sine',300+f.t*900,AT(),0.08,0.04);
     if(RND()<dt*40){const a=RND()*7,r=22;this.parts.push({x:f.x+Math.cos(a)*r,y:f.y-30+Math.sin(a)*r,vx:-Math.cos(a)*60,vy:-Math.sin(a)*60,t:0,life:0.35,c:f.slot?9:12});}
     if(!hold||f.t>2.2){const ch=full;f.full=false;this.startSp(f,o,f.slot,ch);}return;}
   if(f.st==='whirl'){if(f.t<0.95)f.x=clamp(f.x+f.face*95*dt,14,W-14);f.tick-=dt;if(f.tick<=0&&f.t<0.95){f.tick=0.16;f.hitDone=false;f.active=true;noise(AT(),0.08,0.08,'bandpass',2600);}if(f.t>=1.05)this.idle(f);return;}
   if(f.st==='counter'){if(f.t>=f.dur)this.idle(f);return;}
   if(f.st==='dash'){const sp=f.dd===f.face?STA.fwd:STA.bwd;f.x+=f.dd*sp*dt*(1-f.t/STA.dashT*0.5);if(RND()<dt*60)this.parts.push({x:f.x-f.dd*8,y:GYF-2,vx:-f.dd*30,vy:-10,t:0,life:0.25,c:6});if(f.t>=STA.dashT+(f.dd===f.face?0.12:0.05))this.idle(f);return;}
   if(f.st==='sp'){this.special(f,o,dt);return;}
   if(f.st==='jump'||f.st==='fkick'){if(f.st==='jump'&&inp.kick&&!f.jk){f.jk=true;f.hitDone=false;this.whoosh();}if(f.st==='fkick'&&f.t>0.06)f.active=true;if(f.jk)f.active=true;
     if(air()){FX.dust(f.x,GYF,3);f.wasF=f.st!=='jump';f.jkLand=!!f.jk;f.st='land';f.t=0;f.jk=false;f.active=false;}return;}
   if(f.st==='land'){if(f.t>=(f.wasF?0.16:(f.jkLand?0.12:0.06))){f.jkLand=false;this.idle(f);}return;}
   f.face=o.x>f.x?1:-1;f.alpha=1;
   if(inp.dash){const d=inp.dash;inp.dash=0;if(f.sta>=STA.dash&&!f.broken){FX.dust(f.x,GYF,4);f.st='dash';f.dd=d;f.t=0;f.sta-=STA.dash;f.staT=STA.delay;f.dashN=(f.dashN||0)+1;if(d!==f.face)f.inv=STA.inv;noise(AT(),0.1,0.08,'highpass',2000);tone('sine',500,AT(),0.08,0.04,null,d===f.face?900:300);return;}else{f.denied=0.4;f.dashDenied=(f.dashDenied||0)+1;if(f===this.me)tone('square',140,AT(),0.08,0.05);}}
   if(f.antiAir){f.antiAir=false;f.st='punch';f.cstep=2;f.t=0;f.hitDone=false;f.bufP=0;this.whoosh();return;}
   if((inp.super||(inp.s0Hold&&inp.s1Hold))&&f.sup>=100){this.startSuper(f);return;}
   {const fwd=o.x>f.x?inp.right:inp.left;if(inp.punch&&fwd&&Math.abs(o.x-f.x)<=GRAB_R&&o.y>=GYF-0.01&&f.y>=GYF-0.01&&GRABBABLE.includes(o.st)&&!(o.inv>0)){this.startGrab(f,o);return;}}
   for(const s of [0,1]){if(inp['s'+s]&&f.cd[s]<=0){this.startSp(f,o,s,!!inp['s'+s+'C']);return;}if(inp['s'+s+'Hold']&&f.cd[s]<=0){f.st='charge';f.slot=s;f.t=0;f.full=false;return;}}
   if(inp.down&&inp.punch){f.bufP=0;f.st='cpunch';f.t=0;f.cstep=0;f.hitDone=false;this.whoosh();}
   else if(inp.down&&inp.kick){f.st='csweep';f.t=0;f.hitDone=false;noise(AT(),0.12,0.08,'bandpass',900);}
   else if(inp.punch){f.bufP=0;f.st='punch';f.t=0;f.cstep=0;f.hitDone=false;this.whoosh();}
   else if(inp.kick){f.bufK=0;f.st='kick';f.kstep=0;f.t=0;f.hitDone=false;this.whoosh();}
   else if(inp.up){f.st='jump';f.t=0;f.vy=-275;f.vx=(inp.right?1:(inp.left?-1:0))*90;f.jk=false;f.hitDone=false;}
   else if(inp.down)f.st='crouch';
   else if(inp.left||inp.right){const d=inp.right?1:-1;f.x+=d*f.spd*(d===f.face?1:0.7)*dt;f.st=d===f.face?'walk':'back';f.walkT+=dt;}
   else f.st='idle';},
 startGrab(f,o){f.st='grab';f.t=0;f.thrown2=false;f.grabbed=o;f.grabN=(f.grabN||0)+1;o.st='grabbed';o.t=0;o.grabber=f;o.vx=0;o.teched=false;o.techTried=false;o.active=false;o.full=false;this.say(f,"¡TE AGARRÉ!");const t=AT();noise(t,0.1,0.15,'lowpass',900);tone('sine',200,t,0.1,0.3);},
 tech(a,d){a.st='bstun';a.t=0;a.stun=0.25;a.vx=-a.face*120;d.st='bstun';d.t=0;d.stun=0.25;d.vx=-d.face*120;d.techN=(d.techN||0)+1;this.say(d,"¡ESCAPA!");this.fx.push({x:(a.x+d.x)/2,y:a.y-40,t:0,c:7});const t=AT();tone('square',900,t,0.05,0.07);tone('square',1200,t+0.06,0.05,0.07);},
 startSuper(f){this.bump(1.5);FX.superRays(f.x,f.y-40,f===this.me?'120,200,255':'255,120,140');f.sup=0;f.st='super';f.t=0;f.phase=0;f.full=false;f.supN=(f.supN||0)+1;const S_=SUPERS[f.C.id];this.superFx={f,t:0,n:S_.n};this.say(f,f.C.id==='fran'?"¡KAIRÓS!":"¡"+S_.n+"!");const t=AT();tone('sawtooth',110,t,0.8,0.1,null,440);noise(t,0.6,0.2,'highpass',3000);[72,76,79,84].forEach((m,i)=>tone('square',hz(m),t+0.1+i*0.08,0.2,0.06));},
 startSp(f,o,slot,ch){const k=f.C.s[slot];f.cd[slot]=ch?2.3:1.55;f.cd[1-slot]=Math.max(f.cd[1-slot],1.0);this.say(f,MVS[k][ch?1:0]);f.chg=ch;f.spk=k;f.t=0;f.phase=0;f.hitDone=false;
   if(ch)f.cd[slot]+=0;const t=AT();tone('sine',300,t,0.2,0.08,null,ch?1400:900);
   if(k==='patada'){if(ch){f.st='whirl';f.tick=0;f.hits=0;noise(t,1.0,0.12,'bandpass',900);}else{f.st='fkick';f.vy=-170;f.vx=f.face*230;this.whoosh();}return;}
   if(k==='auditoria'){f.st='counter';f.dur=ch?1.0:0.7;return;}
   f.st='sp';},
 proj(f,o){if(this.sub==='ko'||this.sub==='time')return;const p=Object.assign({x:f.x+f.face*20,y:f.y-40,vx:f.face*165,vy:0,owner:f,r:6,dmg:10,push:80,stun:0.32},o);this.projs.push(p);return p;},
 special(f,o,dt){const k=f.spk,ch=f.chg,t=AT(),at=(tt)=>f.t>=tt&&f.phase<=0&&(f.phase=1,true);
   const seq=(times,fn)=>{times.forEach((tt,i)=>{if(f.t>=tt&&f.phase===i){f.phase=i+1;fn(i);}});};
   const end=(d)=>{if(f.t>=d)this.idle(f);};
   switch(k){
   case 'objecion':if(at(0.2)){if(ch){this.proj(f,{kind:'super',r:11,dmg:22,push:190,stun:0.6,vx:f.face*140,pierce:true,boom:true,x:f.x+f.face*26,y:f.y-38});tone('sawtooth',160,t,0.5,0.1,null,60);this.shake=0.15;}else this.proj(f,{kind:'me'});}end(ch?0.6:0.45);break;
   case 'objetado':if(ch)seq([0.2,0.36,0.52],i=>{this.proj(f,{kind:'doc',y:f.y+[-46,-28,-9][i],vx:f.face*170,dmg:8});this.whoosh();});else if(at(0.2))this.proj(f,{kind:'doc'});end(ch?0.75:0.45);break;
   case 'revision':if(f.t<0.25)f.alpha=1-f.t/0.25;else if(f.phase===0){f.phase=1;FX.paperBurst(f.x,f.y-30,16,false);let nx=o.x+(o.x>f.x?28:-28);if(nx<16||nx>W-16)nx=o.x-(o.x>f.x?28:-28);f.x=clamp(nx,16,W-16);f.face=o.x>f.x?1:-1;tone('sine',1200,t,0.15,0.06,null,300);FX.lupa(f.x+f.face*14,f.y-46);}
     else{f.alpha=Math.min(1,(f.t-0.25)/0.1);if(f.t>=0.38){f.alpha=1;f.st='punch';f.t=0;f.cstep=0;f.auto=ch?2:1;f.hitDone=false;this.whoosh();}}break;
   case 'evaluacion':if(ch)seq([0.2,0.35,0.5],()=>this.proj(f,{kind:'form',y:f.y-7,low:true,dmg:7,r:5}));else if(at(0.2))this.proj(f,{kind:'form',y:f.y-7,low:true,dmg:9,r:5});end(ch?0.7:0.45);break;
   case 'capacitacion':seq(ch?[0.4,0.7]:[0.4],()=>{this.proj(f,{kind:'wave',x:f.x+f.face*16,y:f.y-6,vx:f.face*190,low:true,dmg:ch?8:9,r:5,stun:ch?0.8:0.3});this.shake=0.25;tone('sine',70,t,0.4,0.9,null,35);noise(t,0.3,0.3,'lowpass',400);});end(ch?1.0:0.75);break;
   case 'kpi':if(at(0.2)){if(ch)this.proj(f,{kind:'kpiBig',r:11,dmg:18,push:180,stun:0.55,vx:f.face*140,pierce:true,y:f.y-38});else this.proj(f,{kind:'kpi',dmg:8});}end(ch?0.6:0.45);break;
   case 'vision':if(at(0.55)){this.beam={f,t:0,hit:false,thick:ch};tone('sawtooth',880,t,0.4,0.06,null,1200);noise(t,0.35,0.1,'highpass',3000);}if(f.t>=0.95){this.idle(f);this.beam=null;}break;
   case 'ticket':if(at(0.2)){if(ch)this.proj(f,{kind:'reboot',dmg:6,freeze:1.5,vx:f.face*150});else this.proj(f,{kind:'ticket',dmg:9});}end(0.45);break;
   case 'cable':if(ch){if(at(0.22)){this.walls=this.walls.filter(w=>w.owner!==f);this.walls.push({x:clamp(f.x+f.face*26,14,W-14),owner:f,t:0,life:3.2,cd:0,face:f.face});FX.superRays(f.x+f.face*26,f.y-30,'90,200,255');tone('sine',880,t,0.25,0.07,null,1760);tone('square',440,t+0.05,0.2,0.04);noise(t,0.25,0.08,'highpass',4000);}end(0.45);}
     else{f.active=f.t>=ATK.whip.s&&f.t<ATK.whip.s+ATK.whip.a;if(f.active&&!this.whipS){this.whipS=true;noise(t,0.12,0.1,'highpass',3000);}end(0.5);if(f.t>=0.5)this.whipS=false;}break;
   case 'bot':if(ch)seq([0.2,0.45,0.7],()=>this.proj(f,{kind:'bot',y:f.y-8,vx:f.face*80,low:true,dmg:7,r:6}));else if(at(0.2))this.proj(f,{kind:'bot',y:f.y-8,vx:f.face*85,low:true,dmg:8,r:6});end(ch?0.9:0.45);break;
   case 'cartas':if(at(0.2)){if(ch)[-50,0,50].forEach(v=>this.proj(f,{kind:'card',vx:f.face*210,vy:v,dmg:8,boom:true,r:5}));else this.proj(f,{kind:'card',vx:f.face*230,dmg:8,r:5});}end(0.5);break;
   case 'billetera':if(ch)seq([0.2,0.3,0.4,0.5,0.6],i=>this.proj(f,{kind:'moth',dmg:4,vx:f.face*(130+i*12),y:f.y-[44,30,52,36,24][i],r:5,stun:0.2,push:40}));else if(at(0.2))this.proj(f,{kind:'wallet',dmg:10,vx:f.face*150,r:7});if(at(0.2))tone('square',140,AT(),0.12,0.06,null,90);end(ch?0.75:0.45);break;
   case 'riff':if(ch)seq([0.2,0.32,0.44],i=>{this.proj(f,{kind:'riff',dmg:6,vx:f.face*230,r:12,ttl:0.5,push:120,y:f.y-36});tone('sawtooth',[110,147,165][i],AT(),0.25,0.08,null,null,{dist:true,lp:2200});});else if(at(0.25)){this.proj(f,{kind:'riff',dmg:10,vx:f.face*220,r:10,ttl:0.42,push:150,y:f.y-36});tone('sawtooth',98,AT(),0.35,0.09,null,92,{dist:true,lp:2000});tone('sawtooth',147,AT(),0.35,0.06,null,138,{dist:true,lp:2000});}end(ch?0.65:0.5);break;
   case 'prompt':if(ch)seq([0.2,0.28,0.36,0.44],()=>this.proj(f,{kind:'prompt',dmg:5,vx:f.face*190,r:6}));else if(at(0.2))this.proj(f,{kind:'prompt',dmg:10,vx:f.face*180,r:7});end(ch?0.6:0.45);break;
   case 'aluc':if(f.phase===0){f.phase=1;FX.pixBurst(f.x,f.y);this.decoys=this.decoys||[];this.decoys.push({x:f.x,y:GYF,face:f.face,owner:f,t:0,life:ch?2.0:1.4,C:f.C});if(ch)this.decoys.push({x:clamp(f.x-f.face*34,16,W-16),y:GYF,face:f.face,owner:f,t:0,life:2.0,C:f.C});tone('sine',900,t,0.3,0.06,null,300);noise(t,0.3,0.08,'highpass',5000);}
     if(f.t<0.25)f.alpha=Math.max(0,1-f.t/0.2);else if(f.phase===1){f.phase=2;let nx=o.x+(o.x>f.x?28:-28);if(nx<16||nx>W-16)nx=o.x-(o.x>f.x?28:-28);f.x=clamp(nx,16,W-16);f.face=o.x>f.x?1:-1;tone('sine',1200,t,0.15,0.06,null,400);FX.pixBurst(f.x,f.y);}
     else{f.alpha=Math.min(1,(f.t-0.25)/0.1);if(f.t>=0.38){f.alpha=1;f.st='punch';f.t=0;f.cstep=0;f.auto=ch?2:1;f.hitDone=false;this.whoosh();}}break;
   case 'balance':if(ch){seq([0.3,0.42,0.54,0.66,0.78,0.9],i=>{this.proj(f,{kind:'bill',x:clamp(o.x+(i-2.5)*14+(RND()-0.5)*8,10,W-10),y:40,vx:0,vy:150,dmg:5,r:5,stun:0.25});});if(f.phase===1&&f.t<0.35)tone('pulse',hz(84),t,0.1,0.05);end(1.0);}
     else{if(at(0.2)){this.proj(f,{kind:'coin',dmg:8});blip(88,t);blip(95,t+0.05);}end(0.45);}break;
   }},
 drawArms(f,gl,ty,lean,bw,L_,C){if(!gl.length)return;const S1=[bw/2-2+lean,ty+3],S0=[-bw/2+2+lean,ty+3];const gs=gl.slice().sort((a,b)=>b[0]-a[0]).slice(0,2);
  const lit=(c,k)=>{const h=col(c);if(typeof h!=='string'||h[0]!=='#'||h.length<7)return h;const n=parseInt(h.slice(1,7),16),f=v=>Math.max(0,Math.min(255,Math.round(v+(k>0?(255-v)*k:v*k))));return 'rgb('+f(n>>16)+','+f((n>>8)&255)+','+f(n&255)+')';};
  const seg=(x0,y0,x1,y1,w,c)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;R(Math.round(x-w/2),Math.round(y-w/2),w,w,c);}};
  const sleeve=lit(L_.top,0.16),skin=C(L_.skin);
  for(let i=gs.length-1;i>=0;i--){const S=i===0?S1:S0,[gx,gy]=gs[i],dx=gx-S[0],dy=gy-S[1],Ln=Math.hypot(dx,dy);let ex,ey;
   if(gy<S[1]-6){ex=S[0]+dx*0.45+(i===0?2:-2);ey=(S[1]+gy)/2;}else if(Ln<18){ex=S[0]+(dx>=0?2:-2);ey=Math.max(S[1],gy)+8;}else{ex=S[0]+dx*0.5;ey=S[1]+dy*0.5+2;}
   if(i===1){g.save();g.beginPath();g.rect(-200,-200,400,400);g.rect(-bw/2+lean,ty,bw,22-(L_.h||0));g.clip('evenodd');}
   seg(S[0],S[1],ex,ey,6,'rgba(8,6,18,0.55)');seg(ex,ey,gx,gy,5,'rgba(8,6,18,0.55)');
   seg(S[0],S[1],ex,ey,4,OUTL?OUTL:(i===1?lit(L_.top,-0.1):sleeve));seg(ex,ey,gx,gy,3,skin);R(Math.round(ex-2),Math.round(ey-2),4,4,OUTL?OUTL:(i===1?lit(L_.top,-0.1):sleeve));
   if(i===1)g.restore();}},
 idle(f){f.st='idle';f.t=0;f.active=false;f.alpha=1;f.auto=0;f.dizzy=false;f.crouchHit=false;},
 whoosh(){noise(AT(),0.08,0.06,'bandpass',2400);},
 hurtbox(f){if(f.st==='down')return [f.x-20,f.y-10,40,10];const c=f.st==='crouch'||f.st==='cpunch'||f.st==='csweep'||(f.st==='bstun'&&f.lowB)||(f.st==='hurt'&&f.crouchHit),h=(c?34:54)-(c?0:f.look.h),w=f.look.bw+2;return [f.x-w/2,f.y-h,w,h];},
 atkbox(f){if(f.st==='whirl')return [f.x-32,f.y-36,64,24];const A_=this.curAtk(f),b=A_.box;const x0=f.face>0?f.x+b[0]:f.x-b[0]-b[2];return [x0,f.y+b[1],b[2],b[3]];},
 curAtk(f){if(f.st==='jump')return DM_JK;if(f.st==='punch'&&f.cstep===0)return DM_PUNCH;if(f.st==='punch'&&f.cstep===1)return DM_P2;if(f.st==='kick')return [DM_K1,DM_K2,DM_K3][f.kstep||0];if(f.st==='sp'&&f.spk==='cable')return ATK.whip;if(f.st==='punch'&&f.cstep===2)return ATK.p3;if(f.st==='cpunch'&&f.cstep===2)return ATK.cp3;return ATK[f.st];},
 ov(a,b){return a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];},
 hit(a,d,A_,dir,x,y,extra={}){const onG=d.y>=GYF-0.01,t=AT();
   if(d.st==='counter'&&a!==d){ // auditoría
     const ch=d.chg,dm=ch?Math.max(14,Math.round((A_.dmg||8)*2)):12;this.say(d,ch?"¡EMBARGADO, CHE!":"¡AUDITADO!");blip(96,t,0.1);blip(100,t+0.07,0.1);noise(t,0.15,0.2,'highpass',4000);
     d.st='idle';d.t=0;FX.paperBurst(d.x+d.face*8,d.y-30,22,false);this.hit(d,a,{dmg:dm,push:170,stun:0.5},-dir,a.x,a.y-30);return;}
   if(d.inv>0&&a!==d){this.fx.push({x,y,t:0,c:6});return;}
   if(d.st==='down'){return;}
   let blk=onG&&d.back&&!d.broken&&!A_.unblock&&['back','crouch','idle','walk','bstun'].includes(d.st);d.active=false;d.jk=false;
   const lowG=d.st==='crouch'||(d.st==='bstun'&&d.lowB);let miss=null;
   if(blk&&A_.low&&!lowG){blk=false;miss='¡ERA BAJO!';}if(blk&&A_.over&&lowG){blk=false;miss='¡ERA ALTO!';}
   if(miss){this.mix=(this.mix||0)+1;d.mixed=(d.mixed||0)+1;if(d===this.me)this.fb8={t:miss,k:0,x:d.x,y:d.y};}
   if(blk){const cost=(STA.blockBase+Math.abs(A_.dmg||8)*STA.blockMul)*(A_.proj?0.5:1);d.sta-=cost;d.staT=STA.delay;d.blocks=(d.blocks||0)+1;if(d.sta<=0){d.sta=0;d.broken=true;d.breaks=(d.breaks||0)+1;blk=false;this.guardBreak(d);}}
   if(blk){a.sup=Math.min(100,(a.sup||0)+SUPG.blk);d.sup=Math.min(100,(d.sup||0)+SUPG.blkTaken);d.hp-=A_.dmg>=18?4:1;d.lowB=d.st==='crouch'||(d.st==='bstun'&&d.lowB);d.st='bstun';d.t=0;d.stun=0.12;d.vx=dir*Math.abs(A_.push)*0.6;this.fx.push({x,y,t:0,c:12});this.blockSnd(t,d.sta||0);FX.block(x,y,-dir);if(d.hp<=0)this.ko(a,d,dir,t);return;}
   const wasLow=['crouch','cpunch','csweep'].includes(d.st)||(d.st==='hurt'&&d.crouchHit);
   const scl=a.combo>=7?0.5:(a.combo>=5?0.6:(a.combo>=3?0.8:1)),dmg=Math.max(1,Math.round(A_.dmg*(a.dmul||1)*scl));d.hp-=dmg;d.st=extra.freeze?'frozen':'hurt';d.crouchHit=wasLow&&d.st==='hurt';d.t=0;d.stun=extra.freeze||A_.stun;if(A_.knock){if(onG){d.st='down';d.vx=dir*40;}else d.airKD=true;d.kd=(d.kd||0)+1;noise(t,0.2,0.2,'lowpass',500);}if(d.justBroke){d.justBroke=false;d.st='hurt';d.stun=STA.breakStun;d.dizzy=true;}d.vx=dir*A_.push;d.alpha=1;if(a.st==='fkick')FX.hit(x,y,3,0);if(!onG){d.juggle=(d.juggle||0)+1;d.vy=d.juggle<=2?-120:80;}const fin=A_.fin||A_.knock;this.stop=fin?0.11:((a.st==='punch'&&a.cstep===1)||(a.st==='kick'&&a.kstep===1)?0.075:0.055);if(fin)this.shake=Math.max(this.shake,0.18);this.fx.push({x,y,t:0,c:extra.freeze?12:10,big:!!fin});
   this.hitSnd(fin?3:(dmg>=6?2:1),t);FX.hit(x,y,fin?3:(dmg>=6?2:1),a.C&&a.C.id==='jean'?1:(a===this.me?0:2));if(fin){this.zoom=0.06;this.shake=Math.max(this.shake,0.32);}if(Math.abs(A_.push)>=150||dmg>=12)this.shake=Math.max(this.shake,0.2);
   if(extra.freeze){tone('square',200,t,0.5,0.06,null,80);}
   if(a.st!=='super'){a.sup=Math.min(100,(a.sup||0)+SUPG.hit);}d.sup=Math.min(100,(d.sup||0)+SUPG.hitTaken);
   a.combo++;a.comboT=0.9;if(a.combo>=3||A_.knock)this.bump(1.0);if(a===this.me){this.landed++;this.score+=dmg*10+(a.combo>1?a.combo*20:0);}else if(d===this.me)this.taken+=dmg;
   if(d.hp<=0)this.ko(a,d,dir,t);},
 guardBreak(d){d.justBroke=true;FX.shatter(d.x+d.face*10,d.y-34);if(d===this.foe)this.brokeFoes=(this.brokeFoes||0)+1;this.say(d,"¡GUARDIA ROTA!");const t=AT();noise(t,0.4,0.35,'bandpass',2600);tone('square',1200,t,0.3,0.08,null,200);for(let i=0;i<24;i++){const a=RND()*7,v=60+RND()*120;this.parts.push({x:d.x+d.face*10,y:d.y-34,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,t:0,life:0.5,c:pick([12,7,6]),grav:true});}this.shake=0.25;},
 // ko -> ver l8f.js
 boom(x,y,n=46){FX.boom(x,y,n>30);this.zoom=Math.max(this.zoom||0,n>30?0.05:0.02);for(let i=0;i<n;i++){const a=RND()*Math.PI*2,v=40+RND()*160;this.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,t:0,life:0.5+RND()*0.5,c:pick([7,12,12,10,9,14]),grav:true});}this.shake=0.3;const t=AT();noise(t,0.6,0.4,'lowpass',600);tone('sine',90,t,0.5,0.8,null,30);},
 // ---------- IA ----------
 brain(f,o,dt,P){{const dc=(this.decoys||[]).find(q=>q.owner===o&&q.t<q.life);if(dc)o=Object.assign(Object.create(o),{x:dc.x,y:GYF,st:'idle',jk:false,vy:0});}const inp=f.ai;inp.punch=inp.kick=inp.up=inp.s0=inp.s1=inp.s0C=inp.s1C=inp.super=false;inp.dash=0;if(f.aiHold>0)f.aiHold-=dt;else inp.left=inp.right=inp.down=inp.s0Hold=inp.s1Hold=false;
   const dx=o.x-f.x,d=Math.abs(dx),tw=dx>0?'right':'left',aw=dx>0?'left':'right',oAir=o.y<GYF-4,oAtk=['punch','kick','fkick','whirl','sp','cpunch','csweep'].includes(o.st)||o.jk,oLow=o.st==='cpunch'||o.st==='csweep',oOver=o.st==='fkick'||o.jk||(o.st==='jump'&&Math.abs(o.x-f.x)<50);
   if(f.st==='jump'&&d<34&&f.vy>-60&&!f.jk)inp.kick=true;
   if(f.st==='grabbed'&&!f.techTried&&f.t>0.08){f.techTried=true;if(RND()<(P.tech||0))inp.punch=true;return;}if(f.st==='kick'&&(f.kstep||0)<2&&RND()<P.aggr){inp.kick=true;}
   if(f.aaT>0){f.aaT-=dt;if(f.st==='punch'&&f.cstep<2)inp.punch=true;}
   if(f.st==='punch'&&f.cstep===1&&RND()<P.aggr){const r=RND();if(r<0.3&&f.hitDone){const sl=[0,1].find(k=>f.cd[k]<=0&&f.C.s[k]!=='auditoria');if(sl!==undefined)inp['s'+sl]=true;else inp.punch=true;}else if(r<0.55)inp.kick=true;else inp.punch=true;}
   else if((f.st==='punch'||f.st==='cpunch')&&f.cstep<2&&RND()<P.aggr){inp.punch=true;if(f.st==='cpunch'){inp.down=true;f.aiHold=Math.max(f.aiHold,0.1);}}
   if(f.wake>0){f.wake-=dt;if(f.st==='idle'&&d<60&&!f.wakeDone){f.wakeDone=true;if(oAir&&RND()<(P.anti||0.3)+0.35){f.antiAir=true;return;}const q=RND();if(q<0.5){inp[aw]=true;f.aiHold=0.35;}else if(q<0.75&&f.sta>=STA.dash)inp.dash=dx>0?-1:1;else inp.punch=true;return;}}else f.wakeDone=false;
   // capa reactiva: castiga recuperaciones, dashes, saltos y caminatas hacia el agarre (con tiempo de reacción humano)
   if(['idle','walk','back','crouch'].includes(f.st)&&f.y>=GYF-0.01&&RND()<dt/(P.react||0.25)){
     const th2=this.projs.find(p=>p.owner!==f&&Math.sign(p.vx||0)===Math.sign(f.x-p.x)&&Math.abs(p.x-f.x)<95&&Math.abs(p.x-f.x)>22&&p.kind!=='bill'&&p.kind!=='doc'||(p.owner!==f&&p.vx&&Math.sign(p.vx)===Math.sign(f.x-p.x)&&Math.abs(p.x-f.x)<95&&Math.abs(p.x-f.x)>22));
     if(th2){if(th2.low||th2.pierce||RND()<0.65){inp.up=true;inp[tw]=true;f.aiHold=0.25;}else{inp[aw]=true;f.aiHold=0.4;inp.down=false;}return;}
     if(o.st==='counter'){if(d<=GRAB_R+2){inp.punch=true;inp[tw]=true;f.aiHold=0.05;}else{inp[aw]=true;f.aiHold=0.3;}return;}
     if(d>80&&o.cd[0]>0.4&&o.cd[1]>0.4&&f.sta>=STA.dash&&RND()<0.6){inp.dash=dx>0?1:-1;return;}
     if(o.st==='sp'&&o.spk==='vision'&&o.t<0.55){if(o.chg){inp[aw]=true;}else{inp.down=true;inp[aw]=true;}f.aiHold=0.6;return;}
     const oRec=(o.st==='sp'&&o.t>0.2)||(o.st==='land'&&o.wasF)||((o.st==='kick'||o.st==='csweep')&&o.t>0.18)||(o.st==='punch'&&o.t>0.14)||(o.st==='dash'&&o.t>STA.dashT);
     const toMe=Math.sign(f.x-o.x),oDashIn=o.st==='dash'&&o.dd===toMe,oWalkIn=o.st==='walk'&&d<34,oJumpIn=oAir&&o.vy>-40&&o.y>GYF-60&&d<44;
     if(oRec&&RND()<(P.pun||0.5)){const melee=['punch','kick','csweep'].includes(o.st);if(d<=GRAB_R+1){inp.punch=true;inp[tw]=true;f.aiHold=0.05;return;}else if(d<40){inp.punch=true;return;}else if(!melee&&d<120&&f.sta>=STA.dash){inp.dash=dx>0?1:-1;return;}}
     if(oDashIn&&d<90&&RND()<(P.pun||0.5)){inp.punch=true;return;}
     {const sa=f.C.s.indexOf('auditoria');const atkIn=['kick','csweep','fkick','sp','jump'].includes(o.st)&&o.t<0.14,walkIn=['walk','dash'].includes(o.st)&&Math.sign(f.x-o.x)===Math.sign(o.st==='dash'?o.dd:(o.vx||0));if(sa>=0&&f.cd[sa]<=0&&d<50&&(atkIn||walkIn)&&RND()<(P.pun||0.5)*0.8){inp['s'+sa]=true;return;}}
     if(['punch','kick','cpunch','csweep'].includes(o.st)&&d<50&&!f.broken&&f.sta>20&&RND()<P.block+0.25){inp[aw]=true;inp.down=o.st==='cpunch'||o.st==='csweep';f.aiHold=0.3;return;}
     if(oJumpIn&&RND()<(P.anti||0.3)+0.2){f.antiAir=true;return;}
     if(oWalkIn&&RND()<P.aggr*0.7){inp.punch=true;return;}}
   f.aiT-=dt;if(f.aiT>0)return;f.aiT=P.think*(0.7+RND()*0.6);
   {const sa=f.C.s.indexOf('auditoria');if(sa>=0&&f.cd[sa]<=0&&d<44&&!['sp','super','counter'].includes(o.st)&&RND()<0.07){inp['s'+sa]=true;return;}}
   if(f.sup>=100&&d<160&&RND()<(P.supP||0)){inp.super=true;return;}
   if(d<=GRAB_R+3&&(o.back||o.st==='crouch'||RND()<0.25)&&RND()<(P.grab||0)){inp.punch=true;inp[tw]=true;f.aiHold=0.05;return;}
   if(this.beam&&this.beam.f!==f){if(this.beam.thick){inp[aw]=true;}else inp.down=true;f.aiHold=0.5;return;}
   const aud=f.C.s.indexOf('auditoria');if(aud>=0&&oAtk&&d<60&&f.cd[aud]<=0&&RND()<0.5){inp['s'+aud]=true;inp['s'+aud+'C']=RND()<P.chg;return;}
   const th=this.projs.find(p=>p.owner!==f&&Math.sign(p.vx||0)===Math.sign(f.x-p.x)&&Math.abs(p.x-f.x)<80);
   if(th){const pj=[0,1].find(s=>f.cd[s]<=0&&['objecion','objetado','kpi','ticket','cartas','balance','evaluacion','bot'].includes(f.C.s[s]));if(pj!==undefined&&Math.abs(th.x-f.x)>45&&!th.pierce&&RND()<0.35){inp['s'+pj]=true;return;}
     if(th.low||th.pierce||RND()<0.6||f.sta<30){inp.up=true;f.aiHold=0.3;inp[tw]=RND()<0.8;}else{inp[aw]=true;f.aiHold=0.5;}return;}
   if(oAtk&&d<55&&RND()<P.block+(['punch','kick','cpunch'].includes(o.st)?0.2:0)){if(!f.broken&&(f.sta>28||RND()<0.45)){inp[aw]=true;f.aiHold=0.35;const read=RND()<(P.read||0.7);inp.down=read?oLow:(oOver?true:RND()<0.5);}else if(f.sta>=STA.dash&&RND()<0.6){inp.dash=dx>0?-1:1;}else{inp.up=true;inp[aw]=true;f.aiHold=0.3;}return;}
   if(d>100&&f.sta>60&&RND()<0.35){inp.dash=dx>0?1:-1;return;}
   if(d<40&&f.sta>45&&f.sta<85&&RND()<0.12){inp.dash=dx>0?-1:1;return;}
   if(oAir&&o.vy>-40&&o.y>GYF-60&&d<44&&RND()<P.anti){f.antiAir=true;return;}
   if(o.st==='crouch'&&o.back&&d<80&&d>30&&RND()<0.4){inp.up=true;inp[tw]=true;f.aiHold=0.2;return;}
   if(RND()<P.sp){const opts=[0,1].filter(s=>{const k=f.C.s[s],r=MVAI[k];return f.cd[s]<=0&&k!=='auditoria'&&d>=r[0]&&d<=r[1];});if(opts.length){const s=pick(opts);if(RND()<P.chg&&d>70){inp['s'+s+'Hold']=true;f.aiHold=0.85;}else inp['s'+s]=true;return;}}
   const r2=RND();
   if(d>100){inp[tw]=true;f.aiHold=0.3+RND()*0.4;}
   else if(d>36){if(oAtk&&d<70){inp[aw]=true;f.aiHold=0.2;}else if(r2<P.jump){inp.up=true;inp[tw]=true;f.aiHold=0.2;}else{inp[tw]=true;f.aiHold=0.2+RND()*0.3;}}
   else if(o.st==='counter'){inp[aw]=true;f.aiHold=0.3;}
   else{if(r2<P.aggr){const q=RND();if(q<0.4)inp.punch=true;else if(q<0.7)inp.kick=true;else if(q<0.86){inp.down=true;inp.punch=true;f.aiHold=0.25;}else{inp.down=true;inp.kick=true;f.aiHold=0.15;}}else if(r2<P.aggr+0.2){inp[aw]=true;f.aiHold=0.3;}else if(r2<P.aggr+0.3){inp.down=true;f.aiHold=0.3;}}},
 // ---------- ciclo ----------
 update(dt){this.pt+=dt;this.shake=Math.max(0,this.shake-dt);
   if(this.cheer>0)this.cheer-=dt;
   this.fx=this.fx.filter(e=>(e.t+=dt)<0.25);this.parts=this.parts.filter(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.grav)p.vy+=260*dt;return p.t<p.life;});
   if(this.ph==='select'){if(BOT&&this.pt>0.5)this.pick(Math.floor(RND()*DMC.length));return;}
   if(this.ph==='challenger'){if(this.pt>1.6){this.ph='vs';this.pt=0;tone('sawtooth',110,AT(),0.8,0.12,null,55);noise(AT(),0.8,0.2,'lowpass',500);}return;}
   if(this.ph==='vs'){if(this.pt>2.6)this.startFight();return;}
   if(this.ph==='quote'){if(this.pt>2.8||(BOT&&this.pt>1)){this.stage++;if(this.stage>=this.ladder.length){this.ph='ending';this.pt=0;musicStop();S.win();}else this.startVS();}return;}
   if(this.ph==='continue'){if(BOT&&this.pt>1){this.doCont();return;}if(this.pt>=10){return finishLevel({fail:true});}if(Math.floor(this.pt)!==Math.floor(this.pt-dt))tone('square',440,AT(),0.1,0.06);return;}
   if(this.ph==='ending'){if(BOT&&this.pt>1)return finishLevel({fail:false});return;}
   // pelea
   if(this.sub==='intro'){const lim=this.round===1?3.0:2.0;if(this.round===1){this.me.st=this.pt<1.2?'intro':'idle';this.foe.st=this.pt>1.1&&this.pt<2.3?'intro':'idle';}if(this.pt>lim){this.sub='go';this.me.st='idle';this.foe.st='idle';S.bell(0.2);}return;}
   if(this.sub==='finish'){this.fin.t+=dt;this.foe.t+=dt;this.me.t+=dt;if(BOT&&this.fin.t>this.botF)this.startFat();else if(this.fin.t>=FAT_WIN){this.fin=null;this.koFall(this.me,this.foe,1,AT());}return;}
   if(this.sub==='fatal'){this.fatUpdate(dt);return;}
   if(this.sub==='ko'||this.sub==='time'){if(this.projs.length){for(const p of this.projs)if(typeof FX!=='undefined')FX.hit(p.x,p.y,1,0);this.projs=[];}if(this.walls.length)this.walls=[];if(this.decoys&&this.decoys.length)this.decoys=[];this.beam=null;for(const f of [this.me,this.foe]){if(f.st==='charge'||((f.st==='sp'||f.st==='super')&&f.hp>0)){f.st='idle';f.t=0;f.full=false;f.alpha=1;}}
     const sdt=this.sub==='ko'&&this.pt<1.8?dt*0.28:dt;this.fup(this.me,{},this.foe,sdt);this.fup(this.foe,{},this.me,sdt);
     if(this.pt>1.9){const wm=this.sub==='ko'?this.foe.hp<=0&&this.me.hp>0:(this.me.hp/this.me.max>=this.foe.hp/this.foe.max);const Wf=wm?this.me:this.foe,Lf=wm?this.foe:this.me;if(Wf.st!=='ko'&&Wf.st!=='win'&&Wf.y>=GYF-0.01){Wf.st='win';Wf.t=0;Wf.vx=0;this.bump(2);}if(this.sub==='time'&&Lf.st!=='ko'&&Lf.st!=='lose'&&Lf.y>=GYF-0.01){Lf.st='lose';Lf.t=0;Lf.vx=0;}if(Wf.st==='win')this.winFx(Wf,this.pt);}
     if(this.pt>(this.sub==='ko'?3.9:3.0)){const won=this.sub==='ko'?this.foe.hp<=0&&this.me.hp>0:(this.me.hp/this.me.max>=this.foe.hp/this.foe.max);
       this.rw[won?0:1]++;this.meter=[this.me.sup,this.foe.sup];this.roundLog=(this.roundLog||0)+1;
       if(this.rw[0]<2&&this.rw[1]<2){this.round++;this.startRound();return;}
       if(won){this.wins++;this.score+=this.me.hp*5+Math.round(this.timer)*10+300;this.ph='quote';this.pt=0;musicStop();S.win();}else{this.ph='continue';this.pt=0;musicStop();S.lose();}}return;}
   if(this.superFx){this.superFx.t+=dt;if(this.superFx.t>0.9)this.superFx=null;return;}if(this.blueFx>0)this.blueFx-=dt;
   if(this.stop>0){this.stop-=dt;const m_=this.me;if(this.inp.punch){m_.bufP=0.2;this.inp.punch=false;}if(this.inp.kick){m_.bufK=0.2;this.inp.kick=false;}if(this.inp.s0Hold&&!m_.h0){m_.b0=0.2;m_.h0=true;}if(this.inp.s1Hold&&!m_.h1){m_.b1=0.2;m_.h1=true;}return;}
   this.timer-=dt;if(this.timer<=0){this.timer=0;this.sub='time';this.pt=0;S.bell(0.25);return;}
   if(BOT)this.brain(this.me,this.foe,dt,this.P1||{think:0.18,aggr:0.7,block:0.7,sp:0.25,chg:0.2,jump:0.05,anti:0.6,grab:0.3,tech:0.3,supP:0.5});
   this.brain(this.foe,this.me,dt,this.P);
   this.fup(this.me,BOT?this.me.ai:this.inp,this.foe,dt);this.fup(this.foe,this.foe.ai,this.me,dt);
   for(const k of ['up','punch','kick','s0','s1','super'])this.inp[k]=false;
   for(const f of [this.me,this.foe])f.x=clamp(f.x,14,W-14);
   if(this.me.y>=GYF&&this.foe.y>=GYF&&Math.abs(this.me.x-this.foe.x)<20){const m=(this.me.x+this.foe.x)/2,s=this.me.x<this.foe.x?-1:1;this.me.x=clamp(m+s*10,14,W-14);this.foe.x=clamp(m-s*10,14,W-14);}
   for(const [a,d] of [[this.me,this.foe],[this.foe,this.me]]){if(a.active&&!a.hitDone&&d.st!=='ko'&&this.sub==='go'){const A_=a.st==='whirl'?null:this.curAtk(a);if(!A_&&a.st!=='whirl')continue;const ab=this.atkbox(a);
     if(this.ov(ab,this.hurtbox(d))){a.hitDone=true;let AA=A_;if(a.st==='whirl'){a.hits++;AA=a.hits>=5?ATK.whirlEnd:ATK.whirl;}this.hit(a,d,AA,a.st==='whirl'?(d.x>a.x?1:-1):a.face,ab[0]+ab[2]/2,ab[1]+ab[3]/2);}}}
   if(this.beam){const b=this.beam,own=b.f;if((b.multi===undefined&&(b.t>0.5||own.st!=='sp'||own.spk!=='vision'))||(b.multi!==undefined&&own.st!=='super'&&b.t>0.2)||b.t>1.4||own.st==='ko'||own.hp<=0)this.beam=null;}
   if(this.beam){const b=this.beam,f=b.f,d=f===this.me?this.foe:this.me;b.t+=dt;const x0=f.face>0?f.x+14:0,x1=f.face>0?W:f.x-14,bb=b.thick?[x0,f.y-54,x1-x0,26]:[x0,f.y-50,x1-x0,9];
     if(b.thick)for(const p of this.projs)if(p.owner!==f&&this.ov([p.x-p.r,p.y-p.r,p.r*2,p.r*2],bb))p.dead=true;
     if(b.multi!==undefined){b.tick-=dt;if(b.tick<=0&&b.multi>0){b.tick=0.2;b.multi--;b.hit=false;}}
     const touch=d.st!=='ko'&&this.ov(bb,this.hurtbox(d));b.end=touch?d.x-f.face*5:(f.face>0?W:0);b.touch=touch;
     if(!b.hit&&d.st!=='ko'&&this.ov(bb,this.hurtbox(d))){b.hit=true;this.hit(f,d,b.multi!==undefined?{dmg:5,push:40,stun:0.3}:(b.thick?ATK.thick:ATK.beam),f.face,d.x,f.y-44);}
     if(b.multi!==undefined&&b.t>1.1)this.beam=null;}
   for(const f of [this.me,this.foe])if(f.st==='whirl'){const ab=this.atkbox(f);for(const p of this.projs)if(p.owner!==f&&this.ov([p.x-p.r,p.y-p.r,p.r*2,p.r*2],ab)){p.dead=true;this.fx.push({x:p.x,y:p.y,t:0,c:9});}}
   for(const w of this.walls){w.cd=Math.max(0,(w.cd||0)-dt);w.flash=Math.max(0,(w.flash||0)-dt);const o=w.owner===this.me?this.foe:this.me;if(this.sub==='go'&&o.st!=='ko'&&o.y>GYF-60&&Math.abs(o.x-w.x)<10){const dir=Math.sign(o.x-w.x)||-w.face;o.x=w.x+dir*10;if(w.cd<=0&&!['down','thrown','grabbed'].includes(o.st)){w.cd=0.7;w.flash=0.2;this.hit(w.owner,o,{dmg:8,push:140,stun:0.32,unblock:false},dir,w.x,o.y-30);}}}
   this.walls=this.walls.filter(w=>(w.t+=dt)<w.life);if(this.decoys)this.decoys=this.decoys.filter(q=>(q.t+=dt)<q.life);
   for(const p of this.projs){if(p.dead)continue;if(p.ttl!=null&&(p.ttl-=dt)<=0){p.dead=true;continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.kind==='bill'&&p.y>GYF){p.dead=true;continue;}
     for(const w of this.walls)if(w.owner!==p.owner&&Math.abs(p.x-w.x)<8+p.r){if(p.pierce||p.kind==='bill'||p.kind==='doc'&&p.vy){p.dead=true;}else{p.vx=-p.vx;p.owner=w.owner;p.dmg=Math.round((p.dmg||10)*1.2);p.x=w.x+Math.sign(p.vx)*(10+p.r);p.refl=true;}FX.block(p.x,p.y,Math.sign(p.vx));tone('square',1320,AT(),0.08,0.06,null,660);w.flash=0.15;}
     if(p.dead)continue;const d=p.owner===this.me?this.foe:this.me;
     if(this.sub==='go'&&d.st!=='ko'&&this.ov([p.x-p.r,p.y-p.r,p.r*2,p.r*2],this.hurtbox(d))){p.dead=true;this.hit(p.owner,d,{dmg:p.dmg,push:p.push,stun:p.stun,low:p.low,over:p.over||p.kind==='bill',proj:true},p.vx?Math.sign(p.vx):(d.x>p.owner.x?1:-1),p.x,p.y,{freeze:p.freeze});if(p.boom){this.boom(p.x,p.y,p.kind==='card'?20:46);if(p.kind==='super')FX.paperBurst(p.x,p.y,26,true);}}}
   for(const p of this.projs)for(const q of this.projs)if(p!==q&&p.owner!==q.owner&&!p.dead&&!q.dead&&p.kind!=='bill'&&q.kind!=='bill'&&Math.abs(p.x-q.x)<p.r+q.r&&Math.abs(p.y-q.y)<p.r+q.r){
     if(p.pierce&&!q.pierce)q.dead=true;else if(q.pierce&&!p.pierce)p.dead=true;else p.dead=q.dead=true;this.fx.push({x:(p.x+q.x)/2,y:p.y,t:0,c:7});noise(AT(),0.2,0.2,'bandpass',2000);}
   this.projs=this.projs.filter(p=>!p.dead&&p.x>-20&&p.x<W+20&&p.y<H+10);},
 doCont(){this.cont++;S.ok();this.startVS();this.ph='vs';this.pt=0.8;},
 key(c,down){if(this.ph==='select'){if(!down)return;const n=DMC.length+1;if(c==='ArrowRight'){this.sel=(this.sel+1)%n;S.move();}if(c==='ArrowLeft'){this.sel=(this.sel+n-1)%n;S.move();}if(c==='ArrowDown'||c==='ArrowUp'){this.sel=(this.sel+5)%10;if(this.sel>=n)this.sel-=5;S.move();}
     if(c==='Enter'||c==='KeyZ'||c==='Space')this.pick(this.sel===DMC.length?Math.floor(RND()*DMC.length):this.sel);return;}
   if(this.ph==='challenger'||this.ph==='vs'){if(down&&(c==='Enter'||c==='Space')&&this.pt>0.5){if(this.ph==='challenger'){this.ph='vs';this.pt=0;}else this.startFight();}return;}
   if(this.ph==='quote'){if(down&&(c==='Enter'||c==='Space')&&this.pt>0.6)this.pt=99;return;}
   if(this.ph==='continue'){if(down&&(c==='Enter'||c==='Space'||c==='KeyZ'))this.doCont();return;}
   if(this.ph==='ending'){if(down&&(c==='Enter'||c==='Space')&&this.pt>1)finishLevel({fail:false});return;}
   if(down&&(c==='ArrowLeft'||c==='ArrowRight'||c==='KeyA'||c==='KeyD')){const dir=(c==='ArrowRight'||c==='KeyD')?1:-1,now=performance.now();if(this.shift||(this.lastTap&&this.lastTap.dir===dir&&now-this.lastTap.t<260)){this.inp.dash=dir;this.lastTap=null;}else this.lastTap={dir,t:now};}
   if(down&&(c==='KeyC'||c==='KeyL')&&this.inp.s1Hold)this.inp.super=true;if(down&&(c==='KeyV'||c==='KeyI')&&this.inp.s0Hold)this.inp.super=true;
   if(c==='ShiftLeft'||c==='ShiftRight'){this.shift=down;if(down&&(this.inp.left||this.inp.right))this.inp.dash=this.inp.right?1:-1;}
   if(this.sub==='finish'){if(down&&c==='KeyF')this.startFat();return;}
   if(this.sub==='fatal'){if(down&&(c==='Enter'||c==='Space'))this.fatSkip();if(down){const l=FLANES.findIndex(q=>q.k===c);const l2=['KeyA','KeyS','KeyW','KeyD'].indexOf(c);if(l>=0)this.fatKey(l);else if(l2>=0)this.fatKey(l2);}return;}
   const m={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down',KeyC:'s0Hold',KeyL:'s0Hold',KeyV:'s1Hold',KeyI:'s1Hold'}[c];if(m)this.inp[m]=down;
   if(down){const e={ArrowUp:'up',KeyW:'up',KeyZ:'punch',KeyJ:'punch',KeyX:'kick',KeyK:'kick',Space:'punch'}[c];if(e)this.inp[e]=true;}},
 button(id){if(id==='pick'&&this.ph==='select')this.pick(this.sel===DMC.length?Math.floor(RND()*DMC.length):this.sel);},
 pointer(type,x,y,id,ptype){if(ptype==='touch')TOUCHUI=true;
   if(this.ph==='select'){if(type!=='down')return;if(x>=188&&x<252&&y>=114&&y<129){this.pick(this.sel===DMC.length?Math.floor(RND()*DMC.length):this.sel);return;}for(let i=0;i<=DMC.length;i++){const [cx,cy]=this.cell(i);if(x>=cx-1&&x<cx+27&&y>=cy-1&&y<cy+31){if(this.sel===i)this.pick(i===DMC.length?Math.floor(RND()*DMC.length):i);else{this.sel=i;S.move();}return;}}
     return;}
   if(this.ph!=='fight'){if(type==='down')this.key('Enter',true);return;}
   if(this.sub==='finish'){if(type==='down'&&(TOUCHUI?(y>100):true))this.startFat();return;}
   if(this.sub==='fatal'){if(type==='down'&&this.fat&&this.fat.fin){this.fatSkip();return;}if(type==='down'&&y>118){this.fatKey(clamp(Math.floor(x/48),0,3));}else if(type==='down'&&x>=194){this.fatKey(clamp(Math.floor((x-196)/14),0,3));}return;}
   if(!TOUCHUI)return;
   this.touchFight(type,x,y,id);},
 result(){const NR=this.ladder?this.ladder.length:DMC.length-1;const gr=this.wins<NR?'F':(this.cont===0&&this.taken<=150?'S':(this.cont===0?'A':(this.cont<=2?'B':'C')));if(A.mus)A.mus.gain.value=0.55;
   return {score:this.score,grade:gr,lines:[["LUCHADOR",this.me0?this.me0.n:"-"],["RIVALES VENCIDOS",this.wins+"/"+NR],["CONTINUACIONES",this.cont],["FATALITIES",(this.fatN||0)+"/"+NR]]};},
 // ---------- dibujo ----------
 drawF(f,t){const L_=f.look,st=f.st,onG=f.y>=GYF-0.01,hh=L_.h||0;g.save();g.globalAlpha=f.alpha;g.translate(Math.round(f.x),Math.round(f.y));if(f.st==='hurt'&&f.t<0.09&&!REDUCED)g.scale(1.12,0.9);if(f.st==='win'&&f.C&&f.C.id==='coni')g.translate(0,-Math.round(Math.abs(Math.sin(t*8))*8));if(f.st==='dizzy')g.translate(Math.round(Math.sin(t*5)*2),0);if(f.sc)g.scale(f.sc,f.sc);
   const spin=st==='whirl';let face=f.face;if(spin)face=Math.floor(f.t*16)%2?1:-1;g.scale(face,1);
   if((st==='ko'&&!f.land)||st==='thrown'){g.translate(0,-20);g.rotate(-Math.min(st==='thrown'?3.1:1.45,f.t*(st==='thrown'?9:2.2)));g.translate(0,20);}
   const white=(st==='hurt'&&f.t<0.07),C=c=>white?7:(st==='frozen'?"#5A8AE0":c);
   if(st==='down'){R(-26,-8,40,8,C(L_.top));R(-30,-9,10,10,C(L_.skin));if(!L_.bald)R(-30,-9,10,3,C(L_.hair));R(12,-6,18,6,C(L_.pants));disc(-16,-12,4,C(L_.glove));g.restore();return;}
   if(st==='ko'&&f.land){R(-26,-8,40,8,C(L_.top));R(-30,-9,10,10,C(L_.skin));if(!L_.bald)R(-30,-9,10,3,C(L_.hair));R(12,-6,18,6,C(L_.pants));disc(-16,-12,4,C(L_.glove));g.restore();return;}
   const cr=(st==='hurt'&&f.crouchHit)||st==='lose'||st==='crouch'||st==='cpunch'||st==='csweep'||(st==='bstun'&&f.lowB)||st==='charge',by=cr?(st==='charge'?6:14):0,lean=st==='hurt'||st==='ko'?-3:((st==='kick'&&f.kstep===2)?-3:((st==='punch'&&f.cstep===1)?2:0)),bw=L_.bw;
   const KA=st==='kick'?[DM_K1,DM_K2,DM_K3][f.kstep||0]:null,kickOn=(st==='kick'&&f.t>=KA.s*0.6&&f.t<KA.s+KA.a+0.08)||(st==='sp'&&f.spk==='capacitacion'&&f.t<0.4);
   if(spin){R(-4,-20,8,20,C(L_.pants));R(0,-30,30,7,C(L_.pants));R(28,-32,5,10,C(0));R(-26,-28,24,6,C(L_.pants));}
   else if(!onG||st==='fkick'){if(st==='fkick'||f.jk){R(-5,-22,7,12,C(L_.pants));R(0,-24,26,7,C(L_.pants));R(24,-26,5,10,C(0));}else{R(-6,-20,6,12,C(L_.pants));R(1,-18,6,10,C(L_.pants));}}
   else if(st==='csweep'&&f.t>=ATK.csweep.s*0.6&&f.t<ATK.csweep.s+ATK.csweep.a+0.1){R(-9,-12,8,12,C(L_.pants));R(0,-8,30,6,C(L_.pants));R(28,-9,5,8,C(0));}
   else if(cr){R(-9,-12,8,12,C(L_.pants));R(1,-12,9,12,C(L_.pants));R(-10,-2,10,2,C(L_.shoes||0));R(1,-2,10,2,C(L_.shoes||0));}
   else if(kickOn){LIMB(-4,-19,-6,-10,L_.baggy?7:6,C(L_.pants));LIMB(-6,-10,-4,-2,L_.baggy?6:5,C(L_.pants));R(-8,-2,8,2,C(L_.shoes||0));if(st==='sp'){R(2,-34,8,16,C(L_.pants));R(1,-36,10,4,C(0));}
     else{const P_=C(L_.pants),SH=C(L_.shoes||0),pw=L_.baggy?7:6,chamber=f.t<KA.s*0.95,ks=f.kstep||0;
      if(chamber){LIMB(2,-18,9,-27+ks*-2,pw,P_);LIMB(9,-27+ks*-2,7,-15-ks*3,pw-1,P_);R(5,-16-ks*3,6,3,SH);}
      else if(ks===0){LIMB(2,-18,12,-14,pw,P_);LIMB(12,-14,25,-16,pw-1,P_);R(24,-21,4,8,SH);R(25,-22,3,1,'rgba(255,255,255,0.25)');if(f.active)R(0,-11,20,1,"rgba(255,255,255,0.5)");}
      else if(ks===1){LIMB(2,-19,14,-27,pw,P_);LIMB(14,-27,28,-30,pw-1,P_);R(27,-35,4,9,SH);if(f.active){R(0,-24,22,1,"rgba(255,255,255,0.5)");R(4,-21,16,1,"rgba(255,255,255,0.35)");}}
      else{LIMB(2,-21,11,-33,pw,P_);LIMB(11,-33,25,-43,pw-1,P_);R(23,-49,6,6,SH);if(f.active){g.strokeStyle="rgba(255,255,255,0.6)";g.beginPath();g.arc(2,-24,30,-1.3,0.2);g.stroke();g.strokeStyle="rgba(255,255,255,0.3)";g.beginPath();g.arc(2,-24,24,-1.2,0.1);g.stroke();}}}}
   else if(st==='walk'||st==='back'){const P_=C(L_.pants),SH=C(L_.shoes||0),pw=L_.baggy?7:6;for(const i of [0,1]){const ph=f.walkT*11+i*Math.PI,sw=Math.sin(ph)*(st==='back'?-1:1),lift=Math.max(0,Math.cos(ph))*2.2,hx=i?3:-4,fx=hx+sw*5,kx=hx+sw*2.5+lift*0.8,ky=-10-lift*0.6;g.globalAlpha=f.alpha*(i?1:0.92);LIMB(hx,-19,kx,ky,pw,P_);LIMB(kx,ky,fx,-3-lift,pw-1,P_);R(Math.round(fx-4),Math.round(-2-lift),8,2,SH);}g.globalAlpha=f.alpha;}
   else{R(-7,-20,6,20,C(L_.pants));R(1,-20,6,20,C(L_.pants));if(L_.baggy){R(-9,-13,3,11,C(L_.pants));R(6,-13,3,11,C(L_.pants));R(-7,-12,1,8,C('rgba(0,0,0,0.25)'));}R(-8,-2,8,2,C(L_.shoes||0));R(0,-2,8,2,C(L_.shoes||0));}
   const ty=-42+by+hh;R(-bw/2+lean,ty,bw,22-hh,C(L_.top));R(-bw/2+lean,ty,4,22-hh,'rgba(0,0,0,0.28)');R(bw/2-2+lean,ty+1,1,20-hh,'rgba(255,255,255,0.22)');R(-bw/2+lean,ty+19-hh,bw,3,'rgba(0,0,0,0.18)');
   if(L_.tie){R(-3+lean,ty,7,10,C(L_.shirt||(L_.kind==='brandan'?"#FFFFFF":7)));R(0+lean,ty+1,2,10,C(L_.tie));}
   if(L_.kind==='brandan'){R(-bw/2+lean,ty,4,22-hh,C("#2A3A5A"));R(bw/2-4+lean,ty,2,22-hh,C("#2A3A5A"));}
   if(L_.kind==='jl'&&!L_.casual)R(-2+lean,ty,5,4,C(7));
   if(L_.casual){R(-3+lean,ty,6,2,'rgba(255,255,255,0.12)');}
   if(L_.stripes){for(const sx of [-bw/2+3,-2,bw/2-6])R(sx+lean,ty+1,3,21-hh,C(L_.stripes));R(-4+lean,ty,8,1,C('#111'));R(-bw/2+lean,ty+4,bw,1,'rgba(0,0,0,0.06)');R(3+lean,ty+5,2,2,C('#D8B040'));R(-6+lean,ty+5,2,1,C('#D8B040'));}
   if(L_.txt3){const G3={B:'110101110101110',O:'111101101101111',S:'011100010001110'};let px=Math.round(-L_.txt3.length*2-2+lean);for(const ch of L_.txt3){const gg=G3[ch]||'';for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(gg[r*3+c]==='1')R(px+c,ty+5+r,1,1,C(7));px+=4;}}
   if(L_.slime){const G1=C('#5BD12A'),G2=C('#9DFF5A');R(-7+lean,ty+9,4,3,G1);R(-3+lean,ty+11,9,5,G1);R(4+lean,ty+8,4,4,G2);R(-6+lean,ty+15,3,2,G2);R(-1+lean,ty+6,6,5,C('#E8E8EE'));R(0+lean,ty+8,1,1,C(0));R(3+lean,ty+8,1,1,C(0));R(1+lean,ty+11,3,1,C('#E8E8EE'));R(1+lean,ty+11,1,1,C(0));R(3+lean,ty+11,1,1,C(0));}
   if(L_.logo){R(-5+lean,ty+6,6,1,C(7));R(-4+lean,ty+8,4,1,C(7));R(2+lean,ty+5,3,3,C('#C8C8D0'));R(-6+lean,ty+12,9,1,'rgba(255,255,255,0.5)');}
   if(L_.kind==='andres'&&!L_.noLanyard){R(2+lean,ty+2,1,10,C(10));R(1+lean,ty+11,4,5,C(7));}

   if(L_.kind==='me'&&!L_.suit)R(-bw/2+lean,ty+18-hh,bw,4,C(8));
   if(L_.suit){R(-1+lean,ty,1,4,'rgba(0,0,0,0.35)');R(-4+lean,ty,2,3,C('#F2F2F2'));R(2+lean,ty,2,3,C('#F2F2F2'));R(-2+lean,ty+10,1,1,C('#555'));R(-2+lean,ty+14,1,1,C('#555'));}
   if(L_.inner){R(-3+lean,ty,6,19-hh,C(L_.inner));R(-3+lean,ty,1,19-hh,'rgba(0,0,0,0.3)');R(2+lean,ty,1,19-hh,'rgba(0,0,0,0.3)');}
   if(L_.tee)R(-3+lean,ty,6,6,C(L_.tee));if(L_.zip)R(0+lean,ty+1,1,19-hh,C('#C8C8D0'));
   if(L_.print){R(-6+lean,ty+6,4,1,C(7));R(-3+lean,ty+5,2,1,C(7));R(2+lean,ty+6,4,1,C(7));R(4+lean,ty+7,2,1,C(7));R(-7+lean,ty+7,2,1,C(7));}
   if(L_.chain){R(-2+lean,ty+1,1,1,C('#E8E8F0'));R(-1+lean,ty+2,1,2,C('#E8E8F0'));R(1+lean,ty+2,1,2,C('#E8E8F0'));R(2+lean,ty+1,1,1,C('#E8E8F0'));R(0+lean,ty+4,1,1,C('#E8E8F0'));}
   if(L_.strap){for(let q=0;q<16;q++)R(bw/2-2-q+lean,ty+q+1,2,1,C('#D8D0B8'));}
   if(L_.sym){R(-1+lean,ty+8,1,1,C(L_.sym));R(-2+lean,ty+9,3,1,C(L_.sym));R(-3+lean,ty+10,5,1,C(L_.sym));R(-1+lean,ty+9,1,1,C(L_.top));}
   if(L_.hood){R(-bw/2+lean-1,ty-3,bw+2,5,C(L_.top));R(-bw/2+lean,ty-3,3,5,C('rgba(0,0,0,0.25)'));R(1+lean,ty+1,1,7,C(L_.cord||7));R(4+lean,ty+1,1,6,C(L_.cord||7));R(-bw/2+3+lean,ty+12-hh,bw-6,5,C(L_.pocket||'#2A2E36'));R(-bw/2+lean,ty+19-hh,bw,3,C(L_.pocket||'#2A2E36'));}
   const hw=L_.kind==='andres'||L_.kind==='jean'?14:12,hx=-hw/2+lean*1.5,hy=-54+by+hh;
   if(L_.longHair)R(hx-1,hy+2,5,L_.hairLen||14,C(L_.hair));
   R(hx,hy,hw,12,C(L_.skin));R(hx,hy+3,3,9,'rgba(0,0,0,0.18)');R(hx+hw-1,hy+2,1,9,'rgba(255,255,255,0.3)');R(hx,hy+10,hw,2,'rgba(0,0,0,0.12)');
   if(L_.bald){R(hx+2,hy+1,3,1,C("#FFFFFF"));}else if(L_.fade){R(hx,hy-1,hw,4,C(L_.hair));R(hx+hw-6,hy+2,5,2,C(L_.hair));R(hx,hy+3,4,2,C(L_.hair));R(hx,hy+5,3,3,C('rgba(0,0,0,0.28)'));}else{R(hx,hy,hw,3,C(L_.hair));R(hx,hy,4,8,C(L_.hair));}
   if(L_.messy){R(hx+1,hy-2,3,2,C(L_.hair));R(hx+5,hy-3,4,3,C(L_.hair));R(hx+10,hy-2,3,2,C(L_.hair));R(hx+hw-3,hy+1,3,2,C(L_.hair));R(hx,hy+3,4,6,C(L_.hair));R(hx+4,hy-2,1,1,'rgba(255,255,255,0.22)');R(hx+9,hy-3,1,1,'rgba(255,255,255,0.22)');R(hx+1,hy+5,1,2,'rgba(255,255,255,0.18)');}
   if(L_.ponytail){R(hx,hy-1,hw,3,C(L_.hair));R(hx,hy,4,7,C(L_.hair));R(hx-3,hy+2,4,4,C(L_.hair));R(hx-4,hy+5,3,6,C(L_.hair));R(hx-4,hy+10,2,2,C(L_.hair));R(hx+2,hy-1,6,1,'rgba(255,255,255,0.18)');}
   if(L_.bangs){R(hx+hw-8,hy+2,7,2,C(L_.hair));R(hx+hw-3,hy+4,2,1,C(L_.hair));R(hx+hw-8,hy+4,2,1,C(L_.hair));}
   if(L_.earring)R(hx+3,hy+8,1,2,C('#F0F0F0'));
   if(L_.stubble){R(hx+3,hy+8,hw-3,4,L_.stubble);R(hx,hy+5,3,5,L_.stubble);}
   if(L_.beard){R(hx+3,hy+7,hw-3,5,C(L_.beardC||L_.hair));R(hx,hy+4,3,6,C(L_.beardC||L_.hair));R(hx+7,hy+9,3,1,C(L_.skin));}
   const ex=hx+hw-4,ey=hy+5;
   if(L_.glasses){const gf=((st==='sp'&&f.spk==='vision'&&f.t<0.55)||st==='intro')&&Math.floor(t*14)%2;const fc=L_.glassC?C(L_.glassC):C(0);if(L_.glassC){R(ex-3,ey-2,7,6,gf?7:(L_.lens==='clear'?'rgba(210,230,255,0.25)':"#F4F8FF"));BOXL(ex-3,ey-2,7,6,fc);R(hx+2,ey-1,ex-hx-5,1,fc);}else{R(ex-2,ey-2,6,5,gf?7:"#E8F6FF");BOXL(ex-2,ey-2,6,5,fc);R(hx+2,ey-1,ex-hx-4,1,fc);}R(ex,ey,2,2,C(L_.kind==='coni'?"#3B2A20":0));}else R(ex,ey,2,2,C(0));
   if(L_.smile&&st!=='hurt'&&st!=='dizzy'){R(hx+hw-6,hy+9,5,2,C(0));R(hx+hw-5,hy+9,3,1,C(7));R(hx+hw-7,hy+8,1,1,C(0));R(hx+hw-1,hy+8,1,1,C(0));R(hx+hw-1,hy+4,1,1,'rgba(0,0,0,0.3)');}
   else if(!L_.beard)R(hx+hw-5,hy+9,4,1,C(st==='hurt'?8:(L_.lips||0)));
   if(L_.kind==='me'&&!L_.quiff)R(hx+1,hy-1,10,2,C(L_.hair));
   if(L_.quiff){R(hx,hy-1,hw,3,C(L_.hair));R(hx+hw-8,hy-3,8,2,C(L_.hair));R(hx+hw-4,hy-3,2,1,'rgba(255,255,255,0.2)');R(hx,hy+1,3,5,C(L_.hair));}
   if(st==='frozen'){R(hx+2,hy-10,10,8,1);T(":(",hx+2,hy-10,7);}
   if(f.dizzy&&(st==='hurt'||st==='dizzy')){for(let k=0;k<3;k++){const an=t*6+k*2.1;T("*",hx+3+Math.cos(an)*9,hy-6+Math.sin(an)*3,10);}}
   const G=bw>=20?5:4;
   const GC=C(L_.glove);CAPT={c:GC,list:[]};
   if(st==='intro'){this.introArms(f,ty,G,C,L_,t);}
   else if(st==='win'){this.winArms(f,ty,G,C,L_,t);}
   else if(st==='lose'){disc(8,ty+14,G,C(L_.glove));disc(-4,ty+16,G,C(L_.glove));}
   else if(st==='cpunch'){const A_=f.cstep===2?ATK.cp3:ATK.cpunch,out=f.t>=A_.s*0.5&&f.t<A_.s+A_.a+0.05;if(out){R(4,ty+5,16,4,C(L_.skin));disc(22,ty+7,G+1,C(L_.glove));disc(4,ty+10,G,C(L_.glove));}else{disc(10,ty+4,G,C(L_.glove));disc(4,ty+10,G,C(L_.glove));}}
   else if(st==='csweep'){disc(-6,ty+10,G,C(L_.glove));disc(8,ty+12,G,C(L_.glove));}
   else if(st==='punch'){const A_=this.curAtk(f),out=f.t>=A_.s*0.5&&f.t<A_.s+A_.a+0.05,id=f.C?f.C.id:'';
     if(f.cstep===0){if(out){disc(23,-45+by+hh,G+1,C(L_.glove));disc(4,ty+8,G,C(L_.glove));if(f.active){R(12,-49+by+hh,8,1,"rgba(255,255,255,0.5)");R(13,-41+by+hh,7,1,"rgba(255,255,255,0.35)");}}else{disc(10,ty+2,G,C(L_.glove));disc(4,ty+8,G,C(L_.glove));}}
     else if(f.cstep===1){if(out){disc(8,ty+1,G,C(L_.glove));disc(26,-42+by+hh,G+1,C(L_.glove));if(f.active){R(12,-46+by+hh,10,1,"rgba(255,255,255,0.55)");R(13,-38+by+hh,8,1,"rgba(255,255,255,0.35)");}}else{disc(4,ty+4,G,C(L_.glove));disc(-2,ty+8,G,C(L_.glove));}}
     else{if(!out){disc(6,ty+10,G,C(L_.glove));disc(-3,ty+8,G,C(L_.glove));}
       else{const top=ty-16;
         if(id==='alvaro'){R(2,ty-2,12,4,C(L_.skin));R(12,ty-10,4,10,C(L_.skin));disc(14,ty-11,3,C(L_.skin));disc(4,ty+2,G,C(L_.glove));}
         else if(id==='andres'){disc(-6,ty+4,G,C(L_.glove));disc(-2,ty+8,G,C(L_.glove));R(6,ty-14,8,10,C(L_.skin));R(6,ty-14,8,3,C(L_.hair));}
         else if(id==='jl'){R(6,ty-4,14,4,C(L_.skin));R(20,ty-10,4,14,C(L_.glove));disc(-3,ty+8,G,C(L_.glove));}
         else{disc(9,top-2,G+1,C(L_.glove));disc(-3,ty+8,G,C(L_.glove));
           if(id==='samir'){R(3,top-12,14,10,C("#6B3A1E"));R(8,top-14,4,2,C(0));R(3,top-8,14,1,C(GOLD));}
           if(id==='jean'){R(1,top-9,18,6,C("#D8D8E0"));for(let q=0;q<5;q++)R(3+q*3,top-7,2,2,C(5));}
           if(id==='coni'){R(2,top-12,15,10,C(5));R(3,top-11,13,7,C("#29ADFF"));}
           if(id==='brandan'){R(5,top-8,9,6,C("#5A3A12"));R(6,top-7,7,1,C("#8A6A3A"));}}
         if(f.active){g.strokeStyle="rgba(255,255,255,0.6)";g.beginPath();g.arc(4,ty-2,16,-1.6,-0.2);g.stroke();}}}}
   else if(st==='sp'&&f.spk==='cable'&&!f.chg){R(4,ty+3,12,4,C(L_.skin));disc(16,ty+4,G,C(L_.glove));}
   else if(st==='sp'&&f.spk==='balance'&&f.chg){R(2,ty-10,4,12,C(L_.skin));R(-6,ty-10,4,12,C(L_.skin));disc(4,ty-12,G,C(L_.glove));disc(-4,ty-12,G,C(L_.glove));}
   else if(st==='sp'||st==='grab'||st==='super'){R(4,ty+3,12,4,C(L_.skin));disc(16,ty+3,G,C(L_.glove));disc(15,ty+9,G,C(L_.glove));if(f.t<0.22&&['objecion','kpi','ticket','cartas','balance'].includes(f.spk)){const r=(f.chg?5:2)+f.t*(f.chg?45:25);disc(22,ty+6,r,f.spk==='objecion'?12:(f.spk==='cartas'?14:10));disc(22,ty+6,r*0.5,7);}}
   else if(st==='counter'){const k=Math.floor(t*10)%2;disc(9,ty+2,G+1,C(k?GOLD:L_.glove));disc(9,ty+10,G+1,C(k?L_.glove:GOLD));R(4,ty+2,4,10,C(L_.skin));}
   else if(st==='charge'){disc(12,ty+6,G,C(L_.glove));disc(12,ty+12,G,C(L_.glove));}
   else if(st==='back'&&this.sub==='go'||st==='bstun'){disc(10,ty+1,G,C(L_.glove));disc(8,ty+9,G,C(L_.glove));}
   else if(st==='hurt'||st==='ko'||st==='frozen'||st==='dizzy'||st==='grabbed'||st==='thrown'){disc(8,ty-1,G,C(L_.glove));disc(4,ty+6,G,C(L_.glove));}
   else if(st==='fkick'||f.jk||spin){disc(-8,ty+2,G,C(L_.glove));disc(6,ty,G,C(L_.glove));}
   else if(st==='pose'){disc(bw/2+1,ty+17,G,C(L_.glove));disc(-bw/2+1,ty+17,G,C(L_.glove));}
   else{const wk=(st==='walk'||st==='back')?Math.round(Math.sin((f.walkT||0)*14)*1.5):0,b=st==='idle'?Math.round(Math.sin(t*6+(f.ph||0))):0;disc(12+wk,ty-1+b,G,C(L_.glove));disc(7-wk,ty+5-b,G,C(L_.glove));}
   {const gl=CAPT.list;CAPT=null;this.drawArms(f,gl,ty,lean,bw,L_,C);for(const [x,y,r] of gl)disc(x,y,r,GC);}
   g.restore();if(OUTL)return;
   if(st==='sp'&&f.spk==='cable'&&!f.chg&&f.active){const x0=f.x+f.face*20,y0=f.y-44+hh;if(typeof FX!=='undefined')FX.cable(x0,y0,x0+f.face*25,y0-8+Math.sin(t*40)*3,x0+f.face*48,y0+2,t);}
   if(st==='charge'&&f.full){const sw=TW('¡LISTO!');R(clamp(f.x,24,W-24)-sw/2-2,f.y-82+(f.look.h||0),sw+4,11,'rgba(0,0,0,0.55)');TC("¡LISTO!",f.y-80+(f.look.h||0),10,1,0,clamp(f.x,24,W-24));}
   if(st==='counter'){g.strokeStyle=col(GOLD);g.globalAlpha=0.6;g.beginPath();g.ellipse(f.x,f.y-28,16,30,0,0,7);g.stroke();g.globalAlpha=1;}
   if(spin){g.globalAlpha=0.6;for(let k=0;k<3;k++){g.strokeStyle=col([9,10,7][k]);g.beginPath();g.ellipse(f.x,f.y-28+k*4,30-k*4,6,0,t*20+k,t*20+k+4);g.stroke();}g.globalAlpha=1;}
   if(f.shout){f.shout.k+=1/60;if(f.shout.k<0.8){const sw=TW(f.shout.t),sx=clamp(f.x,4+sw/2,W-4-sw/2),sy=Math.max(52,Math.round(f.y-70-f.shout.k*6+hh));R(sx-sw/2-2,sy-2,sw+4,11,"rgba(0,0,0,0.6)");TC(f.shout.t,sy,f===this.me?12:8,1,0,sx);}}},
 drawP(p,t){const x=Math.round(p.x),y=Math.round(p.y),dir=Math.sign(p.vx)||1;if(['doc','form','wave','kpi','kpiBig','ticket','reboot','bot','card','coin','prompt','bill','agent','wallet','moth','riff','skull'].includes(p.kind)&&typeof FX!=='undefined'&&FX.pwr){FX.pwr(p,t);return;}
   switch(p.kind){
   case 'me':FX.legalBall(p,t,false);disc(x,y,2,7);break;
   case 'super':FX.legalBall(p,t,true);disc(x,y,3,7);break;
   case 'doc':R(x-5,y-7,11,14,7);BOXL(x-5,y-7,11,14,5);for(let k=0;k<4;k++)R(x-3,y-4+k*3,7,1,5);R(x-3,y+4,4,2,8);break;
   case 'form':R(x-7,y-5,14,10,7);BOXL(x-7,y-5,14,10,5);for(let k=0;k<2;k++){R(x-5,y-3+k*4,2,2,11);R(x-2,y-2+k*4,7,1,5);}break;
   case 'wave':for(let k=0;k<4;k++)R(x-dir*k*6,y+2-k*2,4,6+k*2,k%2?9:10);R(x-3,y-4,6,10,7);break;
   case 'kpi':R(x-8,y-7,16,13,7);BOXL(x-8,y-7,16,13,1);R(x-6,y+1,3,3,12);R(x-2,y-1,3,5,12);R(x+2,y-4,3,8,11);break;
   case 'kpiBig':R(x-13,y-12,26,24,7);BOXL(x-13,y-12,26,24,1);R(x-10,y+2,5,7,12);R(x-3,y-3,5,12,12);R(x+4,y-8,5,17,11);LN(x-10,y-2,x+9,y-10,8);break;
   case 'ticket':R(x-7,y-5,14,10,10);BOXL(x-7,y-5,14,10,9);T("#",x-3,y-3,0);break;
   case 'reboot':R(x-8,y-6,16,12,"#1E5AD0");BOXL(x-8,y-6,16,12,7);T(":(",x-6,y-4,7);break;
   case 'bot':{const b=Math.floor(t*10)%2;R(x-5,y-6,10,8,6);R(x-3,y-4,2,2,8);R(x+1,y-4,2,2,8);R(x-1,y-9,2,3,5);R(x-4,y+2,2,4-b,5);R(x+2,y+2,2,3+b,5);break;}
   case 'card':g.save();g.translate(x,y);g.rotate(t*14);R(-3,-5,6,10,14);R(-2,-4,4,8,7);g.restore();disc(x,y,2,14);break;
   case 'coin':SPR(COIN,x-4,y-4,{o:GOLD,1:"#FFF4D6"});break;
   case 'prompt':R(x-9,y-5,18,10,'#0A1A12');BOXL(x-9,y-5,18,10,'#33FF88');T('>',x-7,y-3,'#33FF88');if(Math.floor(t*8)%2)R(x-1,y+2,5,1,'#33FF88');break;
   case 'agent':{disc(x,y,5,'#2A1A4A');disc(x,y,4,'#8A5CFF');R(x-1,y-1,3,2,7);R(x-7,y-6+(Math.floor(t*30)%2),14,1,6);R(x-1,y-6,2,2,6);break;}
   case 'bill':R(x-6,y-3,12,6,"#5FB85F");BOXL(x-6,y-3,12,6,3);R(x-1,y-1,2,2,3);break;
   default:disc(x,y,6,0);disc(x,y,5,7);}},
 office(t){R(0,0,W,H,"#2A2F45");R(20,50,90,50,"#0B1020");for(let i=0;i<11;i++){const h=10+((i*37)%28);R(21+i*8,99-h,7,h,"#222034");if(i%2)PX(23+i*8,96-h+4,10);}BOXL(19,49,92,52,6);R(64,49,2,52,6);
   R(146,50,90,50,"#0B1020");for(let i=0;i<11;i++){const h=12+((i*29)%26);R(147+i*8,99-h,7,h,"#222034");if(i%3)PX(149+i*8,96-h+5,10);}BOXL(145,49,92,52,6);R(190,49,2,52,6);
   R(0,100,W,24,"#34304A");R(8,92,40,4,"#6B4226");R(10,96,3,28,"#4E2E1A");R(43,96,3,28,"#4E2E1A");R(16,80,20,12,5);R(18,82,16,8,"#EDEFF5");
   R(236,88,14,36,5);R(239,92,8,6,0);R(4,70,6,30,"#3C8C4A");disc(7,70,6,"#3C8C4A");
   R(0,GYF,W,H-GYF,"#5A4A6A");R(0,GYF,W,2,"#7A6A8A");for(let x=-60;x<W+60;x+=28)LN(x,GYF+2,x+(x-128)*0.35,H,"#4A3A5A");},
 cell(i){return [112+(i%5)*28,26+Math.floor(i/5)*34];},
 portrait(C,x,y,w,h,sc,face=1,focus=48,pose='pose'){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();const f={C,look:C.look,st:pose,t:0,face,x:x+w/2,y:Math.round(y+h/2+(focus-(C.look.h||0))*sc),alpha:1,sc,cd:[0,0]};this.drawF(f,0);g.restore();},
 draw(t){
   if(this.ph==='select')return this.drawSelect(t);
   if(this.ph==='challenger'){R(0,0,W,H,0);for(let y=0;y<H;y+=4)R(0,y,W,1,"#140000");if(Math.floor(t*6)%2){TC("¡UN NUEVO RETADOR",52,8,2,0);TC("HA LLEGADO!",72,8,2,0);}return;}
   if(this.ph==='vs')return this.drawVS(t);
   if(this.ph==='continue'){R(0,0,W,H,"#0B0508");this.portrait(this.me0,78,18,100,80,2,1,38);g.fillStyle="rgba(0,0,0,0.5)";g.fillRect(78,18,100,80);TC("¿CONTINUAR?",100,10,2,0);TC(String(Math.max(0,9-Math.floor(this.pt))),116,8,2,0);if(Math.floor(t*2.5)%2)TC("ENTER O TOCA",134,7);return;}
   if(this.ph==='ending'){R(0,0,W,H,"#0B1020");for(let i=0;i<30;i++){const x=(i*53+t*20)%W,y=(i*29+t*40)%H;R(x,y,2,2,[10,12,14,11][i%4]);}this.portrait(this.me0,78,16,100,76,2,1,38);TC("¡CAMPEÓN DEL DEATHMATCH!",98,10,1,0);TC(this.me0.n,110,7);TC(this.me0.win,122,12);if(this.pt>1&&Math.floor(t*2.5)%2)TC("ENTER PARA SEGUIR",134,6);return;}
   // pelea
   const AMP=this.shake>0&&!REDUCED?2+this.shake*16:0,SOX=Math.round(Math.sin(t*70)*AMP),SOY=Math.round(Math.cos(t*55)*AMP*0.6),ZM=REDUCED?0:(this.zoom||0);g.save();g.translate(SOX,SOY);if(ZM){g.translate(W/2,90);g.scale(1+ZM,1+ZM);g.translate(-W/2,-90);}FX.view(SOX,SOY,ZM);
   {const use3=typeof BG3D!=='undefined'&&!BG3D.failed&&BG3D.ready();const off=!use3&&this.me&&this.foe?((this.me.x+this.foe.x)/2-128)*0.1:0;g.save();if(!use3){g.translate(W/2,0);g.scale(1.06,1);g.translate(-W/2-off,0);}this.drawStage(t);this.drawCrowd(t);g.restore();}
   for(const w of this.walls){const fade=w.life-w.t<0.6?(Math.floor(t*12)%2?0.35:0.9):1,a=fade*(0.55+0.25*Math.sin(t*8))+(w.flash||0)*2;const top=GYF-60;g.globalAlpha=Math.min(1,a*0.35);R(w.x-6,top,12,60,'#29ADFF');g.globalAlpha=Math.min(1,a);
     for(let row=0;row<10;row++){const y=top+row*6,off=row%2?3:0;for(let c=-1;c<=1;c++){const cx=w.x+c*6+off-3,cy=y+3;if(cx<w.x-7||cx>w.x+7)continue;PX(cx-1,cy-3,12);PX(cx+1,cy-3,12);PX(cx-2,cy-1,12);PX(cx+2,cy-1,12);PX(cx-2,cy+1,12);PX(cx+2,cy+1,12);PX(cx-1,cy+3,12);PX(cx+1,cy+3,12);}}
     R(w.x-7,top,1,60,7);R(w.x+6,top,1,60,7);const sy=top+((t*60)%60);R(w.x-6,sy,12,1,7);g.globalAlpha=1;FX.glowAt(w.x,top+30,26,'90,200,255',0.35+(w.flash||0)*2);}
   for(const q of this.decoys||[]){FX.glitchClone(q.x,q.y,t);const k=1-q.t/q.life;const d={C:q.C,look:q.C.look,st:'idle',t:0,face:q.face,x:q.x+(Math.random()<0.1?Math.round((Math.random()-0.5)*4):0),y:q.y,alpha:0.5*Math.min(1,k*3),cd:[0,0]};this.drawF(d,t);for(let yy=GYF-56;yy<GYF;yy+=3)R(q.x-12,yy,24,1,'rgba(120,200,255,'+(0.25*k)+')');}
   for(const f of [this.me,this.foe]){g.globalAlpha=0.3*f.alpha;R(f.x-12,GYF+1,24,3,0);g.globalAlpha=1;}
   this.fatBack(t);this.drawF(this.me,t);this.fatFront(t);for(const p of this.projs){this.drawP(p,t);const gc={me:'90,190,255',super:'90,190,255',kpi:'120,255,160',kpiBig:'120,255,160',ticket:'255,210,90',reboot:'80,140,255',bot:'255,120,120',card:'255,90,200',coin:'255,215,90',bill:'120,255,140',prompt:'120,255,160',agent:'180,140,255',doc:'255,255,255',form:'255,255,220',wave:'255,190,60'}[p.kind]||'255,255,255';if(!['me','super','doc','form','wave','kpi','kpiBig','ticket','reboot','bot','card','coin','prompt','bill','agent','wallet','moth','riff','skull'].includes(p.kind))FX.glowAt(p.x,p.y,p.r*(p.kind==='kpiBig'?4:3),gc,0.7);}
   for(const f of [this.me,this.foe]){if(f.st==='sp'&&f.spk==='vision'&&f.t<0.55)FX.glowAt(f.x+f.face*3,f.y-49+(f.look.h||0),4+f.t*22,'255,60,110',0.75);if(f.st==='whirl')FX.whirl(f,t);if(f.st==='fkick')FX.fkick(f,t);if(f.st==='counter')FX.aud(f.x,f.y-30,t);if(f.st==='frozen')FX.ice(f.x,f.y,t);}
   {const ag=this.projs.filter(p=>p.kind==='agent').map(p=>[p.x,p.y]);if(ag.length>1)FX.links(ag);}
   if(this.beam&&this.beam.multi!==undefined){const fb=this.beam.f;FX.arrowsUp(fb.face>0?fb.x:0,fb.face>0?W:fb.x,fb.y-41);}
   for(const f of [this.me,this.foe]){if(f.st==='whirl')FX.glowAt(f.x,f.y-28,38,'255,170,60',0.4);if(f.st==='charge'){const CC={seba:['91,209,42','note'],alvaro:['80,190,255','paper'],samir:['255,80,110','docx'],andres:['90,230,130','check'],jl:['120,255,170','kpi'],jean:['255,210,80','bits'],coni:['255,110,200','card'],brandan:['255,190,70','coin'],fran:['185,156,255','code']}[f.C.id]||['80,190,255','paper'];const k=Math.min(1,f.t/CHG),hx=f.x+f.face*14,hy=f.y-27+(f.look.h||0);FX.charge(hx,hy,f.x,f.y+1,t,k,CC[0],CC[1]);if(f.full&&!f._fullFx){f._fullFx=true;FX.chargeFull(hx,hy,CC[0]);}}else f._fullFx=false;if(f.st==='super')FX.glowAt(f.x,f.y-30,40,'255,255,255',0.35);}
   if(this.beam&&(this.beam.t<0.45||this.beam.multi!==undefined)){const b=this.beam,fb=b.f,e=b.end??(fb.face>0?W:0),x0=fb.face>0?fb.x+14:e,x1=fb.face>0?e:fb.x-14;if(b.touch){FX.glowAt(e,b.thick?fb.y-41:fb.y-46,b.thick?22:14,'255,140,180',0.85);if((b._sp=(b._sp||0)+1)%5===0)FX.hit(e,b.thick?fb.y-41:fb.y-46,1,2);}FX.glowAt(fb.face>0?x0:x1,b.thick?fb.y-41:fb.y-46,b.thick?18:10,'255,90,140',0.8);FX.beamAt(x0,x1,b.thick?fb.y-41:fb.y-46,(b.thick?16:6)*(b.multi!==undefined?1:Math.max(0.25,Math.sin(Math.min(1,b.t/0.45)*Math.PI))),'255,40,90',b.t);FX.beamFx(x0,x1,b.thick?fb.y-41:fb.y-46,b.thick,b.t);}
   if(this.beam&&(this.beam.t<0.45||this.beam.multi!==undefined)&&typeof FX==='undefined'){const f=this.beam.f,e=this.beam.end??(f.face>0?W:0),x0=f.face>0?f.x+14:e,x1=f.face>0?e:f.x-14;R(x0,f.y-(this.beam.thick?43:47),x1-x0,this.beam.thick?4:2,7);}
   for(const p of this.parts){g.globalAlpha=1-p.t/p.life;R(p.x-1,p.y-1,2,2,p.c);}g.globalAlpha=1;
   for(const e of this.fx){const r=(2+e.t*40)*(e.big?1.7:1),n=e.big?12:8;for(let k=0;k<n;k++){const a=k*Math.PI*2/n;PX(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,e.c);PX(e.x+Math.cos(a)*r*0.6,e.y+Math.sin(a)*r*0.6,7);if(e.big)PX(e.x+Math.cos(a)*r*0.8,e.y+Math.sin(a)*r*0.8,10);}if(e.big&&e.t<0.08)disc(e.x,e.y,6-e.t*50,7);}
   g.restore();
   this.fatHud(t);
   if(this.fb8){this.fb8.k+=1/60;if(this.fb8.k<0.8)TC(this.fb8.t,this.fb8.y-64,10,1,0,clamp(this.fb8.x,30,W-30));else this.fb8=null;}
   if(this.blueFx>0){R(0,47,W,97,`rgba(30,90,208,${this.blueFx})`);}
   if(this.superFx){const sf=this.superFx,k=Math.min(1,sf.t/0.15);g.fillStyle="rgba(0,0,0,0.6)";g.fillRect(0,47,W,97);for(let i=0;i<6;i++)R(0,60+i*12,W,2,sf.f===this.me?"rgba(41,173,255,0.4)":"rgba(255,0,77,0.4)");const left=sf.f===this.me;this.portrait(sf.f.C,left?Math.round(-100+k*104):Math.round(W+4-k*108),50,100,80,2,left?1:-1,36);TC("¡SÚPER!",62,10,2,0,left?180:76);TC(sf.n,84,7,1,0,left?180:76);}
   if(this.koFlash>0){this.koFlash-=1/60;R(0,0,W,H,`rgba(255,255,255,${Math.max(0,this.koFlash*5)})`);}
   R(0,13,W,34,"rgba(11,16,32,0.92)");R(0,46,W,1,12);const me=this.me,fo=this.foe;
   T(me.C.n,4,16,7);R(4,25,106,8,0);R(5,26,104,6,8);R(5,26,Math.round(104*Math.max(0,me.hp)/me.max),6,10);
   T(fo.C.n,W-4-TW(fo.C.n),16,7);R(W-110,25,106,8,0);R(W-109,26,104,6,8);const fw=Math.round(104*Math.max(0,fo.hp)/fo.max);R(W-5-fw,26,fw,6,10);
   TC(String(Math.ceil(this.timer)).padStart(2,'0'),16,this.timer<10?8:10,2,0);
   for(const [f,x] of [[me,4],[fo,W-110]]){const v=f.sta/STA.max,c=f.broken?(Math.floor(t*8)%2?8:2):(v>0.5?11:(v>0.25?10:8));R(x,34,106,3,0);R(x+1,34,104,2,f.broken?(Math.floor(t*8)%2?8:2):1);const w=Math.round(104*v);R(f===me?x+1:x+105-w,34,w,2,f.denied>0&&Math.floor(t*16)%2?7:c);if(f.denied>0)f.denied-=1/60;}
   for(const [f,left] of [[me,true],[fo,false]]){const full=f.sup>=100,bx=left?36:W-96,c=full?(Math.floor(t*10)%2?10:9):13;T("SÚPER",left?4:W-4-TW("SÚPER"),38,full?10:6);R(bx,39,60,5,0);const w=Math.round(58*Math.min(100,f.sup||0)/100);R(left?bx+1:bx+59-w,40,w,3,c);}
   T("C",100,38,me.cd[0]<=0?12:5);T("V",108,38,me.cd[1]<=0?9:5);
   const rtxt=this.rw&&this.rw[0]===1&&this.rw[1]===1?"FINAL":"R"+(this.round||1);TC(rtxt,38,7,1,null,142);
   for(let k=0;k<2;k++){disc(4+TW(me.C.n)+7+k*8,19,3,0);disc(4+TW(me.C.n)+7+k*8,19,2,this.rw&&this.rw[0]>k?10:1);disc(W-4-TW(fo.C.n)-7-k*8,19,3,0);disc(W-4-TW(fo.C.n)-7-k*8,19,2,this.rw&&this.rw[1]>k?10:1);}
   for(const f of [me,fo])if(f.combo>1&&f.comboT>0){const nm=COMBO_N.find(q=>f.combo>=q[0]);const s=f.combo+" GOLPES"+(nm?" "+nm[1]:"");R(f===me?2:W-6-TW(s),64,TW(s)+4,10,"rgba(0,0,0,0.65)");T(s,f===me?4:W-4-TW(s),66,nm?(f===me?9:8):(f===me?10:8));}
   if(this.sub==='intro'){const r1=(this.round||1)===1;
     if(r1&&this.pt<2.3){const b=(f,txt,x)=>{const w=TW(txt)+8,bx=clamp(x-w/2,2,W-w-2),by=Math.max(49,f.y-78+(f.look.h||0));R(bx,by,w,11,7);BOXL(bx,by,w,11,5);R(clamp(x-2,bx+2,bx+w-6),by+11,4,3,7);T(txt,bx+4,by+2,0);};if(this.pt<1.2)b(me,INTRO_TXT[me.C.id],me.x);else b(fo,INTRO_TXT[fo.C.id],fo.x);const sn=STAGE_N[this.stageId()];R(128-TW(sn)/2-4,130,TW(sn)+8,11,"rgba(0,0,0,0.7)");TC(sn,132,10,1,0);}
     else{R(30,58,196,28,0);BOXL(30,58,196,28,10);const tt=r1?this.pt-2.3:this.pt;if(tt<(r1?0.4:1.2))TC(r1?"ROUND 1":(this.rw[0]===1&&this.rw[1]===1?"ROUND FINAL":"ROUND "+this.round),65,10,2);else TC("¡A PELEAR!",65,10,2);}}
   if(this.sub==='ko'&&this.pt>0.3&&(this.pt>1.8||Math.floor(this.pt*6)%2))TC("K.O.",56,8,3,0);
   if(this.sub==='time')TC("¡TIEMPO!",60,10,2,0);
   if(TOUCHUI)this.drawTouch(t);
   if(this.ph==='quote'){this.drawVictory(t);return;}
   hud(this.name+" · "+Math.min(this.stage+1,this.ladder.length)+"/"+this.ladder.length,String(this.score).padStart(5,'0'));},
 drawSelect(t){R(0,0,W,H,"#0B1020");for(let y=13;y<H;y+=8)R(0,y,W,1,"#101838");for(let x=0;x<W;x+=8)R(x,13,1,H,"#0E1530");
   TC("ELIGE TU LUCHADOR",15,10);
   const C=this.sel<DMC.length?DMC[this.sel]:null;
   // panel de vista previa
   R(6,25,102,106,"#141C36");BOXL(6,25,102,106,1);R(7,26,100,62,"#1B2440");
   if(C){this.portrait(C,7,26,100,62,2,1,39);R(7,88,100,1,1);TC(C.n,91,10,1,null,57);TC(C.role,100,6,1,null,57);
     const st=[["VIDA",(C.hp-90)/30],["VEL.",(C.spd-50)/40],["FZA.",(C.dmul-0.95)/0.25]];st.forEach(([n,v],k)=>{const x=10+k*33;T(n,x,111,6);for(let b=0;b<5;b++)R(x+b*6,120,5,3,b<Math.round(1+clamp(v,0,1)*4)?[11,12,8][k]:1);});}
   else{TC("?",42,10,4,null,57);TC("ALEATORIO",91,10,1,null,57);TC("SORPRÉNDEME",100,6,1,null,57);}
   // grilla
   for(let i=0;i<=DMC.length;i++){const [x,y]=this.cell(i),on=i===this.sel;R(x-1,y-1,28,32,on?(Math.floor(t*6)%2?10:9):"#0B1020");R(x,y,26,30,on?(Math.floor(t*6)%2?10:9):1);R(x+1,y+1,24,28,on?"#2A3558":"#1B2440");
     if(i<DMC.length)this.portrait(DMC[i],x+1,y+1,24,28,2,1,47);else TC("?",y+8,10,2,null,x+13);if(on){R(x+1,y+22,13,7,0);T("1P",x+2,y+22,10);}}
   if(C){T("C:",116,97,6);T(C.sn[0],130,97,12);T("V:",116,107,6);T(C.sn[1],130,107,9);}
   else{T("PERSONAJE AL AZAR",116,97,6);}
   btn('pick',186,114,66,15,"ELEGIR ▶",3);
   R(0,133,W,11,"#0B1020");TC(TOUCHUI?"TOCA UN LUCHADOR Y LUEGO ELEGIR":"← → ↑ ↓ MOVER  ·  ENTER ELEGIR",135,6);
   hud(this.name,"");},
 drawVS(t){const a=this.me0,b=this.ladder[this.stage],k=Math.min(1,this.pt/0.4);R(0,0,W,H,"#0B1020");
   g.fillStyle="#1D2B53";g.beginPath();g.moveTo(0,13);g.lineTo(150,13);g.lineTo(106,H);g.lineTo(0,H);g.fill();g.fillStyle="#53101D";g.beginPath();g.moveTo(150,13);g.lineTo(W,13);g.lineTo(W,H);g.lineTo(106,H);g.fill();
   this.portrait(a,Math.round(-100+k*106),20,100,94,2,1,36);this.portrait(b,Math.round(W+4-k*108),20,100,94,2,-1,36);
   TC("VS",58,10,3,0);T(a.n,6,118,7);T(a.role,6,128,6);T(b.n,W-6-TW(b.n),118,7);T(b.role,W-6-TW(b.role),128,6);
   hud(this.name,"RIVAL "+(this.stage+1)+"/"+this.ladder.length);}
};

// ======================= VIDA VISUAL: escenarios, público, poses, pantalla de victoria =======================
const STAGE_N={seba:'OFICINA DE FINANZAS',fran:'SALA DE DESARROLLO',alvaro:'SALA DE AUDIENCIAS',samir:'OFICINA DE LEGAL',andres:'SALA DE RRHH',jl:'DIRECTORIO',jean:'DATACENTER',coni:'LAB. DE AUTOMATIZACIÓN',brandan:'OFICINA DE FINANZAS'};
const INTRO_TXT={seba:'YO PUEDO...',fran:'COMO ES ARRIBA, ES ABAJO.',alvaro:'EL DERECHO ME RESPALDA.',samir:'TENGO OBSERVACIONES.',andres:'QUEDA ANOTADO.',jl:'DALE, CHE, AL LABURO.',jean:'¿YA REINICIASTE?',coni:'SCRIPT LISTO.',brandan:'¡A COBRAR, CHE!'};
const WIN_TXT={seba:'¡PÁGUENME!',fran:'ES MI KAIRÓS.',alvaro:'¡HA LUGAR!',samir:'APROBADO.',andres:'¡DESPEDIDO!',jl:'¡BÁRBARO, CHE!',jean:'PROBLEMA RESUELTO.',coni:'AUTOMATIZADO.',brandan:'¡QUÉ BALANCE!'};
const FIN_PTS=(()=>{const a=[];let v=40;for(let i=0;i<70;i++){v+=Math.sin(i*1.7)*4+Math.cos(i*0.9)*3;a.push(v);}return a;})();
function miniGuy(look,x,y,pose,t,ph){const sk=col(look.skin),bob=pose==='cheer'?-Math.abs(Math.round(Math.sin(t*14+ph)*3)):0;y+=bob;
  R(x-2,y-5,2,5,look.pants);R(x+1,y-5,2,5,look.pants);R(x-3,y-11,7,6,look.top);R(x-2,y-15,5,4,look.skin);if(!look.bald)R(x-2,y-15,5,1,look.hair);if(look.longHair)R(x-3,y-14,1,5,look.hair);if(look.glasses)R(x-1,y-13,4,1,0);else PX(x+1,y-13,0);
  if(pose==='cheer'){R(x-4,y-15,1,5,sk);R(x+4,y-15,1,5,sk);}else if(pose==='horror'){R(x-2,y-13,5,2,sk);}else{R(x-4,y-10,1,4,sk);R(x+4,y-10,1,4,sk);}}
Object.assign(L8,{
 stageId(){const C=this.ladder&&this.ladder[this.stage];const id=C?C.id:'jean';return id==='seba'?'brandan':id;},
 drawStage(t){const id=this.stageId();if(typeof BG3D!=='undefined'){const cx=this.me&&this.foe?((this.me.x+this.foe.x)/2-128)/128:0;const horror=this.sub==='fatal'||this.sub==='finish';if(BG3D.draw(id,t,cx,{cams:(this.cameos||[]).map(c=>c.c.look),pose:horror?'horror':(this.cheer>0?'cheer':'idle')})){this.crowd3d=true;return;}}this.crowd3d=false;
  if(id==='jean'){L6.stage(t);return;}
  if(id==='alvaro'){R(0,13,W,111,"#5A3A22");for(let x=0;x<W;x+=16)R(x,13,1,111,"#4A2E1A");R(0,58,W,2,"#3A2212");
    disc(128,66,10,GOLD);disc(128,66,8,"#5A3A22");R(127,58,2,15,GOLD);R(120,61,17,1,GOLD);R(118,62,5,3,GOLD);R(134,62,5,3,GOLD);R(124,72,9,2,GOLD);
    R(80,88,96,36,"#3E2412");R(78,86,100,4,"#6B4226");for(let i=0;i<5;i++)R(84+i*18,94,14,24,"#4A2C16");
    const up=(t%3)<0.25?Math.sin((t%3)/0.25*Math.PI)*6:0;R(122,78,12,9,0);disc(128,75,4,15);R(125,71,7,2,"#EDEDED");R(140,80-up,8,4,"#8B5A2B");R(143,84-up,2,4,"#6B4226");if((t%3)>0.24&&(t%3)<0.3)tone&&0;
    R(4,104,60,5,"#3E2412");R(192,104,60,5,"#3E2412");R(0,GYF,W,H-GYF,"#8B5A2B");for(let x=-20;x<W;x+=12)LN(x,GYF,x+20,H,"#7A4A20");}
  else if(id==='samir'){R(0,13,W,111,"#3A4256");R(96,54,64,40,"#9EC8E8");for(let y=56;y<94;y+=4)R(96,y,64,1,"#C8D8E8");BOXL(95,53,66,42,6);
    for(const sx of [6,176]){R(sx,52,74,66,"#5A4632");for(let r=0;r<4;r++){R(sx,66+r*16,74,2,"#3A2E22");for(let i=0;i<12;i++)R(sx+3+i*6,54+r*16,4,11,["#C8102E","#29ADFF","#FFEC27","#00875A","#EDEDED","#FF77A8"][(i+r*3)%6]);}}
    R(100,98,56,4,"#6B4226");R(104,102,3,22,"#4E2E1A");R(149,102,3,22,"#4E2E1A");for(let k=0;k<3;k++){const h=8+k*3,sw=Math.sin(t*2+k)*1;R(104+k*10+sw,98-h,8,h,7);R(104+k*10+sw,98-h,8,1,6);}
    R(142,86,2,12,5);R(138,84,10,3,GOLD);R(0,GYF,W,H-GYF,"#4A4A5A");for(let x=0;x<W;x+=8)R(x,GYF+6,4,1,"#555566");}
  else if(id==='andres'){R(0,13,W,111,"#4E6E5E");R(70,52,116,46,"#F2F2F2");BOXL(69,51,118,48,6);T("CLIMA LABORAL",89,55,1);
    [0.6,0.8,0.45,0.9,0.7].forEach((v,i)=>{const h=Math.round(28*v*(0.9+0.1*Math.sin(t*2+i)));R(86+i*18,94-h,10,h,[11,12,9,14,10][i]);});R(80,94,98,1,5);
    R(14,54,40,30,"#F2E8C8");T("EQUIPO",18,58,1);for(let i=0;i<4;i++)disc(20+i*9,72,3,[8,12,11,9][i]);R(204,54,40,30,"#F2E8C8");T("VALORES",205,58,1);for(let i=0;i<3;i++)R(208,67+i*5,30,1,5);
    R(56,106,144,5,"#6B4226");R(64,111,3,13,"#4E2E1A");R(189,111,3,13,"#4E2E1A");R(4,94,8,30,"#3C8C4A");disc(8,92,7,"#3C8C4A");R(244,94,8,30,"#3C8C4A");disc(248,92,7,"#3C8C4A");
    R(0,GYF,W,H-GYF,"#6A6A5A");for(let x=0;x<W;x+=10)R(x+((x/10)%2)*5,GYF+4,5,1,"#5A5A4A");}
  else if(id==='jl'){R(0,13,W,111,"#1A1A2A");R(12,50,232,62,"#0B1030");for(let i=0;i<30;i++)PX(14+(i*53)%228,52+(i*29)%24,Math.sin(t*2+i)>0.3?7:6);
    g.fillStyle="#2A2A44";g.beginPath();g.moveTo(12,100);g.lineTo(60,76);g.lineTo(100,90);g.lineTo(150,70);g.lineTo(200,88);g.lineTo(244,80);g.lineTo(244,112);g.lineTo(12,112);g.fill();
    for(let i=0;i<28;i++){const x=14+i*8,h=6+((i*37)%18);R(x,112-h,7,h,"#15152A");if((i*7)%3===0)PX(x+2,112-h+3,Math.sin(t*3+i)>0?10:9);}
    for(let x=12;x<=244;x+=58)R(x,50,2,62,"#3A3A5A");R(12,50,234,2,"#3A3A5A");
    R(24,104,208,6,"#3A2212");for(let i=0;i<7;i++){R(32+i*30,94,10,10,"#101018");}R(0,GYF,W,H-GYF,"#2A1A10");for(let x=0;x<W;x+=20)R(x,GYF,1,H-GYF,"#1A0E06");}
  else if(id==='coni'){R(0,13,W,111,"#1C2430");for(const sx of [14,98,182]){R(sx,52,60,38,"#0A0E14");BOXL(sx,52,60,38,6);for(let k=0;k<6;k++){const s=Math.floor(t*4)+k,w=10+((s*37)%40);R(sx+4+((s*13)%8),56+k*5,w,2,k%3?11:12);}}
    const a1=Math.sin(t*1.5)*0.6-0.9,a2=Math.sin(t*1.5+1)*0.8+0.6,bx=222,by=118,x1=bx+Math.cos(a1)*18,y1=by+Math.sin(a1)*18-10,x2=x1+Math.cos(a2)*14,y2=y1+Math.sin(a2)*14;R(bx-6,by-4,12,6,5);g.strokeStyle=col(9);g.lineWidth=3;g.beginPath();g.moveTo(bx,by-6);g.lineTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.lineWidth=1;disc(x1,y1,2,7);R(x2-2,y2-1,4,3,6);
    R(0,112,190,5,"#3A3A44");for(let x=((t*30)%16)-16;x<190;x+=16){R(x,112,1,5,"#2A2A33");}for(let k=0;k<4;k++){const x=((t*30+k*50)%210)-20;R(x,104,10,8,"#C8A060");R(x,107,10,1,"#8A6A3A");}
    R(0,GYF,W,H-GYF,"#5A6070");for(let x=0;x<W;x+=8)for(let y=GYF+3;y<H;y+=6)PX(x+((y/6)%2)*4,y,"#6A7080");}
  else if(id==='brandan'){R(0,13,W,111,"#23304A");R(56,60,144,40,"#081018");BOXL(55,59,146,42,6);const off=Math.floor(t*6)%70;
    for(let i=0;i<69;i++){const v1=FIN_PTS[(i+off)%70],v2=FIN_PTS[(i+1+off)%70];LN(58+i*2,97-v1*0.7,60+i*2,97-v2*0.7,v2>=v1?11:8);}T("IPSA",60,62,10);
    R(0,48,W,9,0);const tk="USD ↑  CLP ↓  UF ↑  IPSA ↑  COBRE ↑  ";for(let k=0;k<3;k++){const x=Math.round(-(t*30)%(tk.length*6))+k*tk.length*6;[...tk].forEach((ch,i)=>{if(x+i*6>-6&&x+i*6<W)T(ch,x+i*6,49,ch==='↓'?8:(ch==='↑'?11:GOLD));});}
    R(212,108,36,16,"#555566");BOXL(212,108,36,16,6);disc(230,116,5,6);disc(230,116,3,5);LN(230,116,230+Math.cos(t)*3,116+Math.sin(t)*3,7);
    for(const x of [12,26]){disc(x,118,6,"#C8A060");R(x-2,110,4,3,"#8A6A3A");T("$",x-2,115,"#5A3A12");}
    R(0,GYF,W,H-GYF,"#C8C8D0");for(let i=0;i<8;i++)LN(i*36,GYF+2,i*36+20,H,"#B0B0BC");}
  else this.office(t);},
 setupCrowd(){const ids=[this.me0.id,this.ladder[this.stage].id];this.cameos=DMC.filter(c=>!ids.includes(c.id)).slice(0,5).map((c,i)=>({c,x:[22,46,210,234,128][i],ph:i*1.3}));this.cheer=0;},
 drawCrowd(t){if(this.crowd3d)return;const horror=this.sub==='fatal'||this.sub==='finish';const pose=horror?'horror':(this.cheer>0?'cheer':'idle');
  for(let i=0;i<9;i++){const x=10+i*30+(i%2)*6;if(x>100&&x<156)continue;miniGuy({skin:"#1A1622",hair:"#1A1622",top:"#2A2436",pants:"#1A1622"},x,122,pose,t,i);}
  for(const cm of this.cameos||[])miniGuy(cm.c.look,cm.x,122,pose,t,cm.ph);},
 bump(v){this.cheer=Math.max(this.cheer||0,v||1.2);},
 introArms(f,ty,G,C,L_,t){const id=f.C.id,k=Math.floor(t*6)%2;
  if(id==='alvaro'){disc(3,ty+1,G,C(L_.glove));R(1,ty,6,2,C(8));disc(-5,ty+16,G,C(L_.glove));}
  else if(id==='samir'){const fl=Math.floor(t*4)%4,dx=10,dy=ty-2;R(dx,dy,14,17,C('#E8E8EE'));R(dx,dy,14,1,C('#BBB'));for(let i=0;i<5;i++)R(dx+2,dy+3+i*3,10-(i%2)*3,1,C('#8A8A96'));if(fl===1){R(dx+7,dy,7,17,C('#FAFAFF'));R(dx+7,dy,1,17,C('#AAA'));}if(fl>=2){R(dx+2,dy+6,8,1,C(8));}if(fl===3){R(dx+2,dy+12,6,1,C(8));R(dx+10,dy+2,2,2,C(8));}disc(dx,dy+15,G,C(L_.glove));const py=dy+5+Math.round(Math.abs(Math.sin(t*9))*6);R(dx+11,py-5,1,6,C(8));R(dx+11,py-6,1,1,C(GOLD));disc(dx+15,py+1,G-1,C(L_.glove));}
  else if(id==='andres'){R(6,ty+2,12,15,C("#E8DCC0"));R(10,ty+1,4,2,C(6));for(let i=0;i<3;i++)R(8,ty+6+i*3,8,1,C(5));disc(6,ty+12,G,C(L_.glove));disc(16,ty+8+k,G-1,C(L_.glove));}
  else if(id==='jl'){disc(4,ty-8,G,C(L_.glove));disc(-5,ty+16,G,C(L_.glove));}
  else if(id==='jean'){disc(10+k,ty+6,G,C(L_.glove));disc(12-k,ty+8,G,C(L_.glove));}
  else if(id==='coni'){R(6,ty+8,16,2,C(6));R(8,ty-2,12,10,C(5));R(9,ty-1,10,8,C(k?"#1E5AD0":"#29ADFF"));disc(8,ty+8,G-1,C(L_.glove));disc(18,ty+8,G-1,C(L_.glove));}
  else if(id==='fran'){R(6,ty+8,16,2,C(6));R(8,ty-2,12,10,C('#1A1A24'));R(9,ty-1,10,8,C(k?'#33FF88':'#1A5A34'));disc(8,ty+8,G-1,C(L_.glove));disc(18,ty+8,G-1,C(L_.glove));}
  else if(id==='seba'){g.save();g.translate(4,ty+10);g.rotate(-0.55);R(-14,-3,22,7,C('#1A1A1A'));R(-14,-2,8,5,C('#B00020'));R(8,-1,16,3,C('#5A3A20'));R(22,-3,5,7,C('#111'));for(let k2=0;k2<3;k2++)R(10+k2*4,-1,1,3,C('#C0C0C8'));g.restore();disc(2,ty+10,G,C(L_.glove));disc(16,ty+2+(Math.floor(t*12)%2),G,C(L_.glove));}
  else if(id==='brandan'){for(let i=0;i<4;i++){g.save();g.translate(12,ty+4);g.rotate(-0.6+i*0.3+(k?0.1:0));R(0,-8,5,9,C("#5FB85F"));BOXL(0,-8,5,9,C(3));g.restore();}disc(10,ty+6,G,C(L_.glove));disc(-5,ty+16,G,C(L_.glove));}},
 winArms(f,ty,G,C,L_,t){const id=f.C.id,s=L_.skin,bw=L_.bw||18,sx=Math.round(bw/2)-1,up=Math.round(Math.abs(Math.sin(t*6))*2);
  if(id==='samir'){disc(4,ty+6,G,C(L_.glove));disc(-2,ty+8,G,C(L_.glove));R(-4,ty+6,12,3,C(s));return;}
  // brazos desde los hombros, a los costados de la cabeza (no encima de la cara)
  R(sx-1,ty-12-up,3,14+up,C(s));R(-sx-2,ty-12-up,3,14+up,C(s));R(sx-1,ty-2,3,3,C(L_.top));R(-sx-2,ty-2,3,3,C(L_.top));
  disc(sx,ty-14-up,G,C(L_.glove));disc(-sx-1,ty-14-up,G,C(L_.glove));const gx=sx,gy=ty-14-up;
  if(id==='alvaro'){R(gx-1,gy-12,3,12,C("#6B4226"));R(gx-6,gy-16,13,6,C("#8B5A2B"));}
  if(id==='andres'){R(gx-9,gy-16,18,12,C(7));T("OUT",gx-7,gy-14,8);}
  if(id==='jl'){R(gx-11,gy-18,22,12,C(7));LN(gx-9,gy-8,gx-3,gy-12,C(11));LN(gx-3,gy-12,gx+1,gy-10,C(11));LN(gx+1,gy-10,gx+9,gy-16,C(11));}
  if(id==='coni'){R(gx-6,gy-16,12,8,C(5));R(gx-5,gy-15,10,6,C("#29ADFF"));}
  if(id==='fran'){R(gx-7,gy-16,14,8,C('#1A1A24'));R(gx-6,gy-15,12,6,C('#33FF88'));}
  if(id==='seba'){R(gx-2,gy-10,2,6,C(L_.glove));R(gx+2,gy-10,2,6,C(L_.glove));R(-sx-3,gy-10,2,6,C(L_.glove));R(-sx+1,gy-10,2,6,C(L_.glove));}},
 winFx(f,t){if(f.C.id==='brandan'&&RND()<0.3)this.parts.push({x:f.x+(RND()-0.5)*20,y:f.y-70,vx:(RND()-0.5)*60,vy:-40-RND()*40,t:0,life:1,c:"#5FB85F",grav:true});
  if(f.C.id==='coni'&&!f.hopT)f.hopT=0;},
 bruises(x,y,w,h,sc,face,C,foc){const hh=C.look.h||0,fy=Math.round(y+h/2+(foc-hh)*sc),cx=x+w/2,hw=C.look.kind==='andres'||C.look.kind==='jean'?14:12,top=fy+(-54+hh)*sc;
  const ex=cx+face*(hw/2-3)*sc,ey=top+6*sc;g.strokeStyle="#6A2A8A";g.lineWidth=2;g.beginPath();g.arc(ex,ey,2.4*sc,0,7);g.stroke();g.lineWidth=1;
  const bx=cx-face*1*sc;R(bx-3*sc/2,top+8*sc,3*sc,1.2*sc,"#F2C48A");R(bx-0.6*sc,top+7*sc,1.2*sc,3.4*sc,"#F2C48A");
  LN(cx+face*2*sc,top+2*sc,cx+face*5*sc,top+4*sc,8);LN(cx+face*3*sc,top+1*sc,cx+face*6*sc,top+3*sc,8);
  R(cx+face*(hw/2-3)*sc-2,top+9.5*sc,3,5,"#9ED8FF");},
 drawVictory(t){const me=this.me,fo=this.foe,wid=me.C,lid=fo.C;R(0,0,W,H,"#0B1020");
  g.fillStyle="#1D2B53";g.beginPath();g.moveTo(0,13);g.lineTo(140,13);g.lineTo(116,H);g.lineTo(0,H);g.fill();g.fillStyle="#2A1020";g.beginPath();g.moveTo(140,13);g.lineTo(W,13);g.lineTo(W,H);g.lineTo(116,H);g.fill();
  this.portrait(wid,6,22,108,82,2,1,44,'win');this.portrait(lid,W-114,24,108,80,2,-1,40,'dizzy');g.fillStyle="rgba(40,0,20,0.25)";g.fillRect(W-114,24,108,80);this.bruises(W-114,24,108,80,2,-1,lid,40);
  {const hh=lid.look.h||0,top=24+40+(40-hh)*2+(-54+hh)*2;for(let k=0;k<3;k++){const a=t*5+k*2.1;T("*",W-60+Math.cos(a)*16-3,top-8+Math.sin(a)*4,10);}}
  TC("GANA "+wid.n,16,10,1,0,60);TC("PIERDE "+lid.n,16,8,1,0,W-60);
  R(8,106,W-16,26,0);BOXL(8,106,W-16,26,10);TC(wid.win,112,7,1,null,W/2);TC(WIN_TXT[wid.id]||'',123,10,1,null,W/2);
  hud(this.name+" · "+Math.min(this.stage+1,this.ladder.length)+"/"+this.ladder.length,"");}
});

// ===== Bocetos de karts: vista lateral (selección) y trasera (en carrera) =====
const KT={
 alvaro:{n:'ESCRITORIO LEGAL',body:'#7A4A22',trim:'#C8A040',acc:'#E8E8EE'},
 samir:{n:'MALETÍN EJECUTIVO',body:'#22224A',trim:'#E8C060',acc:'#DCDCEE'},
 andres:{n:'SILLA DE RRHH',body:'#2A2A30',trim:'#22E06A',acc:'#FFEC27'},
 jl:{n:'LIMUSINA DEL DIRECTORIO',body:'#111118',trim:'#29ADFF',acc:'#50FF96'},
 jean:{n:'RACK DE SERVIDORES',body:'#2A2A33',trim:'#29ADFF',acc:'#33FF88'},
 coni:{n:'ROBO-KART',body:'#F0F0F4',trim:'#FF4AA0',acc:'#FF004D'},
 brandan:{n:'CELESTE Y BLANCO',body:'#F2F4F8',trim:'#6CACE4',acc:'#E8C040'},
 fran:{n:'TERMINAL',body:'#0A0A12',trim:'#B99CFF',acc:'#33FF88'},
 seba:{n:'AMPLIFICADOR METALERO',body:'#141418',trim:'#5BD12A',acc:'#C0C0C8'}};
function KP(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);}
function wheel(c,x,y,r){KP(c,x-r,y-r,r*2,r*2,'#111');KP(c,x-r+1,y-r+1,r*2-2,r*2-2,'#2A2A2A');KP(c,x-1,y-1,2,2,'#888');}
// lateral (48x34 px lógicos), el personaje se pega encima
function kartSide(c,id,ox,oy){const k=KT[id];const B=k.body,T=k.trim,A=k.acc;
 wheel(c,ox+10,oy+28,5);wheel(c,ox+38,oy+28,5);
 if(id==='alvaro'){KP(c,ox+2,oy+16,44,10,B);KP(c,ox+2,oy+16,44,2,'#9A6A3A');KP(c,ox+6,oy+19,10,5,'#5A3416');KP(c,ox+8,oy+21,6,1,T);KP(c,ox+30,oy+12,12,5,A);KP(c,ox+31,oy+13,10,1,'#999');KP(c,ox+1,oy+9,3,8,'#8B5A2B');KP(c,ox-3,oy+7,9,4,'#6B3A1E');}
 else if(id==='samir'){KP(c,ox+2,oy+14,44,12,B);KP(c,ox+2,oy+14,44,2,'#3A3A6A');KP(c,ox+18,oy+11,12,4,'#1A1A30');KP(c,ox+10,oy+18,4,4,T);KP(c,ox+34,oy+18,4,4,T);KP(c,ox+2,oy+24,44,2,'#141430');}
 else if(id==='andres'){KP(c,ox+14,oy+20,22,4,B);KP(c,ox+24,oy+6,4,16,'#444');KP(c,ox+6,oy+4,6,16,B);KP(c,ox+4,oy+16,36,4,B);KP(c,ox+30,oy+8,6,6,A);KP(c,ox+31,oy+9,4,1,'#B0A000');KP(c,ox+8,oy+8,4,4,T);}
 else if(id==='jl'){KP(c,ox,oy+16,48,9,B);KP(c,ox,oy+16,48,1,'#444');KP(c,ox+4,oy+12,14,5,'#1A2A3A');KP(c,ox,oy+21,48,1,T);KP(c,ox+44,oy+18,4,3,'#FFF2B0');KP(c,ox+30,oy+2,1,14,'#999');KP(c,ox+31,oy+2,10,7,'#0A1A12');KP(c,ox+32,oy+6,2,2,A);KP(c,ox+35,oy+4,2,4,A);KP(c,ox+38,oy+3,2,5,A);}
 else if(id==='jean'){KP(c,ox+2,oy+10,44,16,B);for(let i=0;i<4;i++){KP(c,ox+5,oy+12+i*3,30,2,'#3A3A48');KP(c,ox+37,oy+12+i*3,2,1,i%2?A:'#FF3355');}KP(c,ox+40,oy+8,1,6,T);KP(c,ox+41,oy+8,4,1,T);KP(c,ox+2,oy+24,44,2,T);}
 else if(id==='coni'){KP(c,ox+4,oy+14,40,12,B);KP(c,ox+4,oy+14,40,2,'#FFFFFF');KP(c,ox+30,oy+10,10,6,'#1A1A24');KP(c,ox+32,oy+12,2,2,'#33FF88');KP(c,ox+36,oy+12,2,2,'#33FF88');KP(c,ox+35,oy+5,1,5,'#999');KP(c,ox+34,oy+3,3,2,A);KP(c,ox+4,oy+22,40,2,T);}
 else if(id==='brandan'){KP(c,ox+2,oy+14,44,12,B);for(let i=0;i<4;i++)KP(c,ox+6+i*11,oy+14,4,12,T);KP(c,ox+20,oy+18,5,4,A);KP(c,ox+2,oy+9,8,6,'#C8A040');KP(c,ox+4,oy+10,4,1,'#8A6A20');}
 else if(id==='seba'){KP(c,ox+2,oy+10,44,16,B);KP(c,ox+2,oy+10,44,2,T);for(let i=0;i<3;i++)for(let j=0;j<3;j++)KP(c,ox+8+i*5,oy+14+j*3,3,2,'#2A2A33');KP(c,ox+28,oy+13,12,10,'#0A0A0A');KP(c,ox+30,oy+15,8,6,'#1A1A1A');KP(c,ox+33,oy+17,2,2,A);KP(c,ox+38,oy+4,2,8,'#5A3A20');KP(c,ox+36,oy+2,6,3,'#B00020');}
 else if(id==='fran'){KP(c,ox+2,oy+14,44,12,B);KP(c,ox+2,oy+14,44,1,T);KP(c,ox+28,oy+8,14,8,'#0A1A12');KP(c,ox+29,oy+9,12,6,'#102A1A');KP(c,ox+30,oy+10,6,1,A);KP(c,ox+30,oy+12,9,1,A);KP(c,ox+2,oy+24,44,2,T);KP(c,ox+10,oy+2,8,3,T);KP(c,ox+8,oy+1,12,1,'#999');}
 KP(c,ox+44,oy+18,3,6,'#333');}
// trasera (para la cámara detrás): kart + espalda del piloto
function kartBack(c,id,ox,oy,L_){const k=KT[id];const B=k.body,T=k.trim,A=k.acc;
 wheel(c,ox+5,oy+26,5);wheel(c,ox+43,oy+26,5);KP(c,ox+4,oy+16,40,10,B);KP(c,ox+4,oy+16,40,2,T);KP(c,ox+10,oy+22,4,3,'#FF3355');KP(c,ox+34,oy+22,4,3,'#FF3355');KP(c,ox+20,oy+24,8,3,'#555');
 // piloto de espaldas
 const top=L_.top,hair=L_.hair,skin=L_.skin,glove=L_.glove;const C_=v=>col(v);
 KP(c,ox+14,oy+4,20,13,C_(top));KP(c,ox+18,oy-8,12,12,C_(skin));KP(c,ox+18,oy-8,12,L_.bald?2:9,C_(L_.bald?skin:hair));if(L_.longHair)KP(c,ox+18,oy-2,12,8,C_(hair));
 KP(c,ox+10,oy+8,6,5,C_(glove));KP(c,ox+32,oy+8,6,5,C_(glove));
 if(id==='alvaro'){KP(c,ox+20,oy+14,8,2,T);}else if(id==='jean'){KP(c,ox+6,oy+12,2,4,A);KP(c,ox+40,oy+12,2,4,'#FF3355');}else if(id==='brandan'){for(let i=0;i<3;i++)KP(c,ox+10+i*12,oy+16,4,10,T);}else if(id==='fran'){KP(c,ox+20,oy-12,8,3,T);}else if(id==='coni'){KP(c,ox+23,oy-14,1,5,'#999');KP(c,ox+22,oy-15,3,2,A);}else if(id==='jl'){KP(c,ox+36,oy-6,1,10,'#999');KP(c,ox+37,oy-6,7,5,'#0A1A12');KP(c,ox+38,oy-3,4,1,A);}}
// ===== Vista frontal + generador de 8 ángulos =====
function kartFront(c,id,ox,oy,L_){const k=KT[id];const B=k.body,T=k.trim,A=k.acc;const C_=v=>col(v);
 // ruedas y carrocería
 wheel(c,ox+5,oy+26,5);wheel(c,ox+43,oy+26,5);KP(c,ox+4,oy+16,40,10,B);KP(c,ox+4,oy+24,40,2,T);KP(c,ox+8,oy+18,6,3,'#FFF2B0');KP(c,ox+34,oy+18,6,3,'#FFF2B0');KP(c,ox+18,oy+20,12,3,'#222');
 // piloto de frente
 KP(c,ox+14,oy+4,20,13,C_(L_.top));if(L_.inner)KP(c,ox+21,oy+4,6,13,C_(L_.inner));if(L_.shirt||L_.tie){KP(c,ox+21,oy+4,6,6,C_(L_.shirt||'#F2F2F2'));if(L_.tie)KP(c,ox+23,oy+5,2,8,C_(L_.tie));}if(L_.stripes){KP(c,ox+17,oy+4,3,13,C_(L_.stripes));KP(c,ox+28,oy+4,3,13,C_(L_.stripes));}
 const hx=ox+18,hy=oy-8;KP(c,hx,hy,12,12,C_(L_.skin));
 if(L_.longHair||L_.ponytail){KP(c,hx-2,hy+1,2,12,C_(L_.hair));KP(c,hx+12,hy+1,2,12,C_(L_.hair));}
 if(!L_.bald){KP(c,hx,hy-1,12,3,C_(L_.hair));if(L_.bangs)KP(c,hx+1,hy+2,10,2,C_(L_.hair));if(L_.quiff||L_.messy)KP(c,hx+2,hy-3,8,2,C_(L_.hair));}
 if(L_.beard)KP(c,hx+1,hy+7,10,5,C_(L_.beardC||L_.hair));if(L_.stubble)KP(c,hx+1,hy+8,10,4,L_.stubble);
 if(L_.glasses){const gc=L_.glassC?C_(L_.glassC):'#111';KP(c,hx+1,hy+4,4,3,gc);KP(c,hx+7,hy+4,4,3,gc);KP(c,hx+2,hy+5,2,1,'#E8F6FF');KP(c,hx+8,hy+5,2,1,'#E8F6FF');KP(c,hx+5,hy+5,2,1,gc);}else{KP(c,hx+3,hy+5,2,2,'#111');KP(c,hx+7,hy+5,2,2,'#111');}
 KP(c,hx+4,hy+9,4,1,L_.smile?'#111':(L_.lips?C_(L_.lips):'#5A3A2A'));
 KP(c,ox+16,oy+9,16,2,'#1A1A1A');KP(c,ox+12,oy+8,5,5,C_(L_.glove));KP(c,ox+31,oy+8,5,5,C_(L_.glove));
 if(id==='coni'){KP(c,ox+23,oy-14,1,5,'#999');KP(c,ox+22,oy-15,3,2,A);}if(id==='fran')KP(c,ox+20,oy-12,8,3,T);}
function kartViews(C,upper){// 0 atrás · 1 atrás-der · 2 der · 3 frente-der · 4 frente · 5 frente-izq · 6 izq · 7 atrás-izq
 const mk=f=>{const c=document.createElement('canvas');c.width=64;c.height=48;const x=c.getContext('2d');x.imageSmoothingEnabled=false;f(x);return c;};
 const back=mk(x=>kartBack(x,C.id,8,15,C.look)),front=mk(x=>kartFront(x,C.id,8,15,C.look)),side=mk(x=>x.drawImage(upper,0,0));
 const b34=mk(x=>{const k=KT[C.id];KP(x,46,31,13,10,k.body);KP(x,46,31,13,2,k.trim);wheel(x,55,41,5);kartBack(x,C.id,3,15,C.look);}),
       f34=mk(x=>{const k=KT[C.id];KP(x,5,31,13,10,k.body);KP(x,5,39,13,2,k.trim);wheel(x,9,41,5);kartFront(x,C.id,13,15,C.look);});
 const mir=src=>mk(x=>{x.translate(64,0);x.scale(-1,1);x.drawImage(src,0,0);});
 return [back,b34,side,f34,front,mir(f34),mir(side),mir(b34)];}

// ======================= DEATHKART · simulación (sin DOM) =======================
const KCL=(v,a,b)=>Math.max(a,Math.min(b,v));
const ANG=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};
const KTRACKS=[
 {id:'legal',n:'PASILLOS DE LEGAL',diff:1,w:8.5,theme:'legal',laps:3,hills:[[0.32,0.07,2.2]],jumps:[0.86],boost:[0.18,0.62],items:[0.1,0.42,0.75],
  pts:[[0,0],[0,-70],[8,-88],[28,-96],[62,-96],[82,-88],[90,-70],[90,0],[82,18],[62,26],[28,26],[8,18]]},
 {id:'dc',n:'DATACENTER TURBO',diff:2,w:7,theme:'dc',laps:3,hills:[[0.62,0.06,2.6],[0.2,0.05,-1.4]],jumps:[0.035],boost:[0.08,0.47,0.8],items:[0.15,0.55,0.88],narrow:[[0.30,0.40,5.2]],
  pts:[[0,0],[0,-50],[6,-66],[-6,-80],[0,-96],[18,-104],[40,-100],[48,-84],[34,-70],[40,-56],[62,-52],[84,-62],[100,-50],[104,-28],[92,-10],[70,-6],[56,10],[36,22],[14,20]]},
 {id:'roof',n:'AZOTEA DEL DIRECTORIO',diff:3,w:6.2,theme:'roof',laps:2,hills:[[0.4,0.08,3.2],[0.9,0.05,1.8]],jumps:[0.6,0.33],boost:[0.05,0.55],items:[0.12,0.45,0.8],narrow:[[0.18,0.27,5.3]],
  pts:[[0,0],[0,-34],[6,-50],[-2,-66],[5,-82],[10,-96],[22,-108],[46,-110],[62,-98],[56,-82],[36,-78],[32,-62],[52,-50],[80,-56],[104,-50],[112,-26],[100,-6],[84,-12],[72,-30],[58,-24],[60,0],[48,18],[24,22],[8,16]]}];
function buildTrack(def){const curve=new THREE.CatmullRomCurve3(def.pts.map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
 const len=curve.getLength(),N=Math.round(len/1.0);const px=new Float32Array(N),pz=new Float32Array(N),tx=new Float32Array(N),tz=new Float32Array(N),w=new Float32Array(N);
 for(let i=0;i<N;i++){const u=i/N,p=curve.getPointAt(u),t=curve.getTangentAt(u);px[i]=p.x;pz[i]=p.z;tx[i]=t.x;tz[i]=t.z;let ww=def.w;for(const [a,b,nw] of (def.narrow||[])){if(u>=a&&u<=b){const e=Math.min(u-a,b-u)/0.02;ww=lerpK(def.w,nw,KCL(e,0,1));}}w[i]=ww;}
 const curv=new Float32Array(N);for(let i=0;i<N;i++){const j=(i+12)%N;curv[i]=Math.abs(ANG(Math.atan2(tx[j],tz[j]),Math.atan2(tx[i],tz[i])));}
 const pads=(def.boost||[]).map((u,k)=>({i:Math.floor(u*N),off:(k%2?-1:1)*def.w*0.35}));
 const h=new Float32Array(N),jumpI=[];for(let i=0;i<N;i++){const u=i/N;let y=0;for(const [c,wd,ht] of (def.hills||[])){let du=Math.abs(u-c);du=Math.min(du,1-du);if(du<wd)y+=ht*0.5*(1+Math.cos(du/wd*Math.PI));}h[i]=y;}
 for(const u of (def.jumps||[])){let i0=Math.floor(u*N);let best=i0,bc=9;for(let o=-25;o<=25;o++){const j=(i0+o+N)%N;let c=0;for(let q=-10;q<=10;q++)c+=curvAt(tx,tz,(j+q+N)%N,N);if(c<bc){bc=c;best=j;}}const tip=best;for(let q=0;q<10;q++){const j=(tip-9+q+N)%N;h[j]+=1.7*(q/9);}jumpI.push(tip);}
 const line=new Float32Array(N),vt=new Float32Array(N);{const raw=new Float32Array(N),kap=new Float32Array(N);for(let i=0;i<N;i++){const a=(i-6+N)%N,b=(i+6)%N;const cr=T_cross(tx[a],tz[a],tx[b],tz[b]);raw[i]=-Math.sign(cr)*Math.min(1,Math.abs(cr)*2.6);kap[i]=Math.abs(ANG(Math.atan2(tx[b],tz[b]),Math.atan2(tx[a],tz[a])))/12;}
  const sm=(arr,r)=>{const o=new Float32Array(N);for(let i=0;i<N;i++){let s2=0;for(let k=-r;k<=r;k++)s2+=arr[(i+k+N)%N];o[i]=s2/(2*r+1);}return o;};const rs=sm(sm(raw,10),10);for(let i=0;i<N;i++)line[i]=KCL(rs[i]*w[i]*0.6,-(w[i]-2.4),w[i]-2.4);
  const ks=sm(kap,3);for(let i=0;i<N;i++)vt[i]=Math.min(30,1.5/Math.max(1e-4,ks[i]));for(let pass=0;pass<2;pass++)for(let i=N-1;i>=0;i--){const j=(i+1)%N;vt[i]=Math.min(vt[i],Math.sqrt(vt[j]*vt[j]+2*12*1.0));}}
 const boxes=[];for(const u of (def.items||[])){const i=Math.floor(u*N);for(let c=-1.5;c<=1.5;c++){const off=c*w[i]*0.42;boxes.push({i,off,x:px[i]+tz[i]*off,z:pz[i]-tx[i]*off,t:0});}}
 return {def,curve,N,len,px,pz,tx,tz,w,curv,pads,boxes,line,vt,h,jumpI};}
function curvAt(tx,tz,i,N){const j=(i+4)%N;return Math.abs(ANG(Math.atan2(tx[j],tz[j]),Math.atan2(tx[i],tz[i])));}
function T_cross(ax,az,bx,bz){return ax*bz-az*bx;}
function lerpK(a,b,u){return a+(b-a)*u;}
function nearest(T,x,z,hint){let best=-1,bd=1e9;const N=T.N;const scan=(i)=>{const dx=x-T.px[i],dz=z-T.pz[i],d=dx*dx+dz*dz;if(d<bd){bd=d;best=i;}};
 if(hint==null||hint<0){for(let i=0;i<N;i++)scan(i);}else{for(let o=-30;o<=30;o++)scan((hint+o+N)%N);if(bd>400)for(let i=0;i<N;i++)scan(i);}return best;}
function lateral(T,i,x,z){return (x-T.px[i])*T.tz[i]-(z-T.pz[i])*T.tx[i];}  // + = derecha de la pista
const KSTATS={alvaro:{vel:3,acel:3,man:3,peso:3},samir:{vel:4,acel:2,man:2,peso:5},andres:{vel:3,acel:2,man:3,peso:4},jl:{vel:5,acel:2,man:2,peso:3},jean:{vel:4,acel:3,man:2,peso:3},coni:{vel:2,acel:5,man:4,peso:1},brandan:{vel:3,acel:4,man:3,peso:2},fran:{vel:3,acel:3,man:5,peso:2},seba:{vel:3,acel:3,man:2,peso:5}};
const KPHYS={vmax:26,vboost:34,acc:15,brake:30,turn:1.85,grip:9,dgrip:3.2,wall:1.5};
function newKart(C,T,slot,ai){const N=T.N,i=(N-6-Math.floor(slot/2)*7)%N,side=slot%2?-1:1,off=side*T.w[i]*0.38;
 const a=Math.atan2(T.tx[i],T.tz[i]);const st=KSTATS[C.id]||{vel:3,acel:3,man:3,peso:3};const k={st,y:0,vy:0,air:false,C,id:C.id,x:T.px[i]+T.tz[i]*off,z:T.pz[i]-T.tx[i]*off,a,va:a,v:0,drift:null,boost:0,hop:0,idx:i,lap:0,done:false,time:0,place:slot+1,inp:{acc:false,brake:false,steer:0,drift:false},off:false,wallT:0,spark:0,lastLapT:0,bestLap:0,laps:[]};
 if(ai)k.ai={vmul:0.93+Math.random()*0.05,lane:(Math.random()-0.5)*0.9,seed:Math.random()*10,skill:0.6+Math.random()*0.35,driftT:0};return k;}
function driftLvl(t){return t>2.2?3:(t>1.4?2:(t>0.7?1:0));}
function kartStep(k,T,dt,R){const I=k.inp,P=KPHYS;if(k.done){I.acc=true;I.drift=false;}
 if(k.frozen>0){k.frozen-=dt;k.v=0;return;}if(k.spin>0){k.spin-=dt;k.a+=dt*14;k.va+=ANG(k.a,k.va)*0;k.v*=Math.pow(0.25,dt);k.drift=null;I.drift=false;k.x+=Math.sin(k.va)*k.v*dt;k.z+=Math.cos(k.va)*k.v*dt;const i0=nearest(T,k.x,k.z,k.idx);k.idx=i0;k.prog=k.lap*T.N+i0;if(k.spin<=0)k.a=k.va;return;}
 const S_=k.st||{vel:3,acel:3,man:3,peso:3};const vm=(k.boost>0?P.vboost:P.vmax*(0.94+0.03*S_.vel))*(k.ai?k.ai.vmul*(k.rb||1):1)*(k.off&&k.boost<=0?0.55:1);
 if(I.acc){if(k.v<vm)k.v+=P.acc*(0.8+0.1*S_.acel)*dt*(k.v<8?1.4:1)*(k.air?0.3:1);}else k.v-=Math.sign(k.v)*Math.min(Math.abs(k.v),6*dt);
 if(I.brake)k.v-=(k.v>0?P.brake:9)*dt;if(k.v>vm)k.v=Math.max(vm,k.v-14*dt);k.v=KCL(k.v,-8,P.vboost+2);
 // derrape con mini-turbo
 if(I.drift&&!k.drift&&Math.abs(I.steer)>0.3&&k.v>11){k.drift={dir:Math.sign(I.steer),t:0};k.hop=0.14;}
 if(k.drift){if(!I.drift||k.v<7){const lvl=driftLvl(k.drift.t);if(lvl){k.boost=Math.max(k.boost,[0,0.7,1.1,1.6][lvl]);k.boostLvl=lvl;R.ev.push({t:'mt',k,lvl});}k.drift=null;}else k.drift.t+=dt*(0.8+0.4*Math.abs(I.steer));}
 const sp=KCL(Math.abs(k.v)/11,0,1);let turn=I.steer*P.turn*(0.88+0.06*S_.man)*sp*(k.v<0?-1:1)*(k.air?0.45:1);if(k.drift)turn=(k.drift.dir*1.2+I.steer*0.7)*sp;
 k.a-=turn*dt;const grip=k.drift?P.dgrip:P.grip;k.va+=ANG(k.a,k.va)*Math.min(1,grip*dt);
 k.x+=Math.sin(k.va)*k.v*dt;k.z+=Math.cos(k.va)*k.v*dt;k.boost=Math.max(0,k.boost-dt);k.hop=Math.max(0,k.hop-dt);k.wallT=Math.max(0,k.wallT-dt);
 const prev=k.idx;const i=nearest(T,k.x,k.z,k.idx);k.idx=i;const d=lateral(T,i,k.x,k.z),hw=T.w[i];k.off=Math.abs(d)>hw;
 if(Math.abs(d)>hw+P.wall){const s=Math.sign(d),ex=Math.abs(d)-(hw+P.wall);k.x-=T.tz[i]*s*ex;k.z+=T.tx[i]*s*ex;const ta=Math.atan2(T.tx[i],T.tz[i]);const dir=Math.cos(ANG(k.a,ta))>=0?ta:ta+Math.PI;k.a+=ANG(dir,k.a)*0.35;k.va=k.a;if(k.wallT<=0){k.v*=0.72;k.wallT=0.25;k.bump=1;R.ev.push({t:'wall',x:k.x,z:k.z,k});}}
 {const gy=T.h[i],gn=T.h[(i+1)%T.N];if(k.air){k.vy-=30*dt;k.y+=k.vy*dt;if(k.y<=gy){k.y=gy;k.air=false;k.vy=0;if(k.trick){k.boost=Math.max(k.boost,0.8);k.boostLvl=2;R.ev.push({t:'mt',k,lvl:2,trick:true});}k.trick=false;R.ev.push({t:'land',k});}else if(I.drift&&!k.trick&&k.airT>0.05){k.trick=true;R.ev.push({t:'trick',k});}k.airT=(k.airT||0)+dt;}
  else{const slope=(gn-gy);k.v-=slope*9*dt*Math.sign(k.v);if(T.jumpI.includes(i)&&k.v>10){k.air=true;k.y=gy+0.05;k.vy=5+k.v*0.22;k.airT=0;k.trick=false;k.drift=null;R.ev.push({t:'jump',k});}else k.y=gy;}}
 for(const p of T.pads){const di=(i-p.i+T.N)%T.N;if(di<4&&Math.abs(d-p.off)<2.6){k.boost=Math.max(k.boost,1.0);k.boostLvl=3;}}
 const dI=i-prev;if(dI<-T.N/2){k.lap++;if(k.lap>=2){const lt=R.t-k.lastLapT;k.laps.push(lt);if(!k.bestLap||lt<k.bestLap)k.bestLap=lt;}k.lastLapT=R.t;if(k.lap>R.laps&&!k.done){k.done=true;k.time=R.t;k.place=++R.fin;}}else if(dI>T.N/2){k.lap--;}
 k.prog=k.lap*T.N+i;}
function aiInput(k,T,R){const A=k.ai,N=T.N,v=Math.abs(k.v);const look=Math.round(4+v*0.3);const j=(k.idx+look)%N;const DD=KDIFF[R.diff??1];const wob=Math.sin(R.t*0.35+A.seed)*DD.wob;
 const lane=KCL(T.line[j]+A.lane*T.w[j]*0.1+wob,-(T.w[j]-2.2),T.w[j]-2.2);const gx=T.px[j]+T.tz[j]*lane,gz=T.pz[j]-T.tx[j]*lane;const want=Math.atan2(gx-k.x,gz-k.z);const diff=ANG(k.a,want);k.inp.steer=KCL(diff*2.8,-1,1);
 const skill=0.9+A.skill*0.12;let vlim=99;for(let o=1;o<=Math.round(6+v*0.5);o++)vlim=Math.min(vlim,T.vt[(k.idx+o)%N]);vlim*=skill*(A.vmul+0.06)*(k.rb||1)*DD.cor;
 k.inp.acc=k.v<vlim;k.inp.brake=k.v>vlim*1.1;
 // derrape planificado en curvas largas (para cargar mini-turbo)
 let cm=0;for(let o=4;o<=24;o+=4)cm=Math.max(cm,T.curv[(k.idx+o)%N]);if(!A.dr&&cm>0.55&&v>15&&A.skill>0.55&&Math.abs(k.inp.steer)>0.35&&T.w[k.idx]>5.5){A.dr=0.6+A.skill*0.9;}if(A.dr){A.dr-=1/60;if(A.dr<=0||cm<0.25)A.dr=0;}k.inp.drift=A.dr>0;
 A.chk=(A.chk||0)+1/60;if(A.chk>1.2){if((k.prog||0)-(A.lastP||0)<6&&R.t>1)A.stuck=(A.stuck||0)+1;else A.stuck=0;A.lastP=k.prog||0;A.chk=0;if(A.stuck>=2){respawn(k,T);A.stuck=0;}}
 const D=KDIFF[R.diff??1];const lead=R.player?R.player.prog-k.prog:0;k.rb=lead>T.N*0.25?D.rbB:(lead<-T.N*0.3?D.rbA:1);}
function respawn(k,T){const i=(k.idx+3)%T.N;k.x=T.px[i];k.z=T.pz[i];k.a=k.va=Math.atan2(T.tx[i],T.tz[i]);k.v=4;k.drift=null;k.respawnT=1.0;}
const ITEMS=['objecion','clausulas','formulario','kpi','ticket','bot','default','firewall','prompt'];
const ITEM_N={objecion:'BOLA OBJECIÓN',clausulas:'TRES CLÁUSULAS',formulario:'FORMULARIO',kpi:'KPI TURBO',ticket:'TICKET',bot:'BOT MINA',default:'DEFAULT',firewall:'FIREWALL',prompt:'PROMPT'};
function rollItem(k,R){const n=R.karts.length,p=k.place/n;const pool=p<=0.25?['formulario','bot','firewall','objecion','clausulas']:(p<=0.5?['objecion','clausulas','ticket','formulario','kpi','bot']:(p<=0.75?['ticket','kpi','clausulas','default','prompt']:['kpi','default','prompt','ticket','firewall']));return pool[Math.floor(Math.random()*pool.length)];}
function hitKart(k,how,R,src){if(k.done)return false;if(k.shield>0){k.shield=0;R.ev.push({t:'block',k});return false;}if(how==='freeze'){k.frozen=1.3;k.v=0;}else{k.spin=1.0;k.v*=0.3;k.boost=0;}k.drift=null;R.ev.push({t:'hit',k,how,src});return true;}
function useItem(k,R){const T=R.T,it=k.item;if(!it||k.roul>0)return;k.item=null;const fx=Math.sin(k.a),fz=Math.cos(k.a);R.ev.push({t:'use',k,it});
 const proj=(a,kind,v,extra)=>R.objs.push(Object.assign({type:'proj',kind,x:k.x+Math.sin(a)*2.6,z:k.z+Math.cos(a)*2.6,a,v,owner:k,life:3.2,idx:k.idx},extra||{}));
 if(it==='objecion')proj(k.a,'objecion',50);
 else if(it==='clausulas'){for(const d of [-0.14,0,0.14])proj(k.a+d,'clausula',46);}
 else if(it==='ticket'){const tgt=R.order.find(q=>q.place===k.place-1&&q!==k)||R.order.find(q=>q!==k&&!q.done);proj(k.a,'ticket',42,{target:tgt,life:4});}
 else if(it==='formulario'||it==='bot')R.objs.push({type:'trap',kind:it,x:k.x-fx*3,z:k.z-fz*3,owner:k,arm:0.5,life:it==='bot'?25:40});
 else if(it==='kpi'){k.boost=Math.max(k.boost,1.6);k.boostLvl=4;}
 else if(it==='firewall'){k.shield=7;}
 else if(it==='default'){const lead=R.order.find(q=>q!==k&&!q.done);if(lead)R.objs.push({type:'rain',target:lead,t:1.1,owner:k});}
 else if(it==='prompt'){const j=(k.idx+28)%T.N;R.ev.push({t:'tele',k,x0:k.x,z0:k.z});k.x=T.px[j];k.z=T.pz[j];k.a=k.va=Math.atan2(T.tx[j],T.tz[j]);const dI=j-k.idx;if(dI<-T.N/2)k.lap++;k.idx=j;k.prog=k.lap*T.N+j;k.boost=Math.max(k.boost,0.6);}}
function objsStep(R,dt){const T=R.T,ks=R.karts;for(const o of R.objs){o.life-=dt;if(o.life<=0){o.dead=true;continue;}
  if(o.type==='proj'){if(o.kind==='ticket'&&o.target&&!o.target.done){const want=Math.atan2(o.target.x-o.x,o.target.z-o.z);o.a+=ANG(want,o.a)*Math.min(1,dt*5);}
   else{o.idx=nearest(T,o.x,o.z,o.idx);const j=(o.idx+8)%T.N;const want=Math.atan2(T.px[j]-o.x,T.pz[j]-o.z);o.a+=ANG(want,o.a)*Math.min(1,dt*2.2);}
   o.x+=Math.sin(o.a)*o.v*dt;o.z+=Math.cos(o.a)*o.v*dt;o.idx=nearest(T,o.x,o.z,o.idx);if(Math.abs(lateral(T,o.idx,o.x,o.z))>T.w[o.idx]+2.2){o.dead=true;R.ev.push({t:'pop',x:o.x,z:o.z,kind:o.kind});continue;}
   for(const k of ks){if(k===o.owner&&o.life>2.9)continue;if(Math.hypot(k.x-o.x,k.z-o.z)<1.9){hitKart(k,o.kind==='ticket'?'freeze':'spin',R,o.owner);o.dead=true;R.ev.push({t:'boom',x:o.x,z:o.z,kind:o.kind});break;}}}
  else if(o.type==='trap'){o.arm-=dt;o.age=(o.age||0)+dt;if(o.arm>0)continue;for(const k of ks){if(k===o.owner&&o.age<1.5)continue;const r=o.kind==='bot'?3.2:1.8;if(Math.hypot(k.x-o.x,k.z-o.z)<r){if(o.kind==='bot'){for(const q of ks)if(Math.hypot(q.x-o.x,q.z-o.z)<4.5)hitKart(q,'spin',R,o.owner);}else hitKart(k,'spin',R,o.owner);o.dead=true;R.ev.push({t:'boom',x:o.x,z:o.z,kind:o.kind});break;}}}
  else if(o.type==='rain'){o.t-=dt;if(o.t<=0){hitKart(o.target,'spin',R,o.owner);o.dead=true;R.ev.push({t:'boom',x:o.target.x,z:o.target.z,kind:'default'});}}}
 R.objs=R.objs.filter(o=>!o.dead);
 for(const b of T.boxes){if(b.t>0){b.t-=dt;continue;}for(const k of ks){if(Math.hypot(k.x-b.x,k.z-b.z)<2.0){b.t=2.5;R.ev.push({t:'box',x:b.x,z:b.z,k});if(!k.item&&!(k.roul>0)){k.roul=0.9;k.item=rollItem(k,R);}break;}}}
 for(const k of ks){if(k.roul>0)k.roul-=dt;if(k.shield>0)k.shield-=dt;}}
function aiItems(k,R){if(!k.item||k.roul>0)return;const A=k.ai;A.itT=(A.itT||0)+1/60/(KDIFF[R.diff??1].it);const it=k.item,T=R.T;const ahead=R.karts.find(q=>q!==k&&!q.done&&((q.prog-k.prog+T.N*10)%T.N)<45&&q.prog>k.prog);const behind=R.karts.find(q=>q!==k&&k.prog-q.prog>3&&k.prog-q.prog<25);
 if(['kpi','firewall','default','prompt'].includes(it)){if(T.curv[k.idx]<0.4||A.itT>3)useItem(k,R);}else if(['objecion','clausulas','ticket'].includes(it)){if(ahead||A.itT>6)useItem(k,R);}else if(behind||A.itT>5)useItem(k,R);if(!k.item)A.itT=0;}
function collide(ks){for(let a=0;a<ks.length;a++)for(let b=a+1;b<ks.length;b++){const A=ks[a],B=ks[b],dx=B.x-A.x,dz=B.z-A.z,d2=dx*dx+dz*dz,r=2.3;if(d2<r*r&&d2>0.0001){if(Math.abs((A.y||0)-(B.y||0))>1.4)continue;const d=Math.sqrt(d2),wa=(A.st||{}).peso||3,wb=(B.st||{}).peso||3,fa=wb/(wa+wb),fb=wa/(wa+wb),o=(r-d),nx=dx/d,nz=dz/d;A.x-=nx*o*fa;A.z-=nz*o*fa;B.x+=nx*o*fb;B.z+=nz*o*fb;const dv=(A.v-B.v)*0.15;A.v-=dv*fa*2;B.v+=dv*fb*2;if(!(A.cT>0)&&!(B.cT>0)){A.cT=B.cT=0.3;(ks.R&&ks.R.ev.push({t:'crash',x:(A.x+B.x)/2,z:(A.z+B.z)/2,a:A,b:B}));}A.bump=B.bump=0.6;}}for(const k of ks)if(k.cT>0)k.cT-=1/60;}
const KDIFF=[{n:'FÁCIL',v:[0.84,0.89],sk:[0.3,0.55],rbA:0.88,rbB:1.03,it:1.8,cor:0.84,wob:1.0},{n:'NORMAL',v:[0.93,0.98],sk:[0.6,0.95],rbA:0.95,rbB:1.06,it:1,cor:0.97,wob:0.3},{n:'DIFÍCIL',v:[0.99,1.03],sk:[0.85,1.0],rbA:0.99,rbB:1.08,it:0.6,cor:1.06,wob:0.15}];
function applyDiff(R,d){R.diff=d;const D=KDIFF[d];for(const k of R.karts)if(k.ai){k.ai.vmul=D.v[0]+Math.random()*(D.v[1]-D.v[0]);k.ai.skill=D.sk[0]+Math.random()*(D.sk[1]-D.sk[0]);}}
function raceNew(T,karts,laps){laps=T.def.laps||laps;T.boxes.forEach(b=>b.t=0);const R={T,karts,laps:laps||3,t:-3.6,fin:0,player:karts.find(k=>!k.ai)||null,objs:[],ev:[]};karts.R=R;return R;}
function raceStep(R,dt){const was=R.t;R.t+=dt;const go=R.t>=0;if(was<0&&go){for(const k of R.karts){if(k.startT>0.15&&k.startT<1.5){k.boost=1.0;k.boostLvl=2;R.ev.push({t:'mt',k,lvl:2,start:true});}else if(k.startT>=2.4){k.v=0;k.spin=0.6;R.ev.push({t:'stall',k});}}}
 for(const k of R.karts){if(k.ai){aiInput(k,R.T,R);if(go)aiItems(k,R);}if(!go){k.v=0;if(k.ai&&R.t>-0.8&&Math.random()<0.02)k.startT=0.5;if(!k.ai)k.startT=k.inp.acc?(k.startT||0)+dt:0;continue;}if(k.useItem){k.useItem=false;useItem(k,R);}kartStep(k,R.T,dt,R);}if(go){collide(R.karts);objsStep(R,dt);}
 const order=R.karts.slice().sort((a,b)=>(a.done&&b.done)?a.place-b.place:(a.done?-1:(b.done?1:(b.prog||0)-(a.prog||0))));order.forEach((k,i)=>{if(!k.done)k.place=i+1;});R.order=order;}
if(typeof module!=='undefined')module.exports={KSTATS,KDIFF,applyDiff,KTRACKS,buildTrack,newKart,raceNew,raceStep,nearest,lateral,KPHYS,respawn,ITEMS,ITEM_N,useItem,hitKart,driftLvl};

// ======================= DEATHKART · efectos 3D (partículas, brillos, ítems) =======================
const KFX={pool:[],live:[],glowT:null,starT:null,
 init(S){this.S=S;this.live=[];if(!this.glowT){this.glowT=ktex(64,64,x=>{const g2=x.createRadialGradient(32,32,0,32,32,32);g2.addColorStop(0,'rgba(255,255,255,1)');g2.addColorStop(0.25,'rgba(255,255,255,0.8)');g2.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g2;x.fillRect(0,0,64,64);});this.glowT.magFilter=THREE.LinearFilter;this.glowT.minFilter=THREE.LinearFilter;
   this.starT=ktex(16,16,x=>{x.fillStyle='#fff';x.fillRect(7,0,2,16);x.fillRect(0,7,16,2);x.fillRect(5,5,6,6);});this.sqT=ktex(4,4,x=>{x.fillStyle='#fff';x.fillRect(0,0,4,4);});}
  this.pool=[];for(let i=0;i<500;i++){const m=new THREE.SpriteMaterial({map:this.glowT,color:0xffffff,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;S.add(s);this.pool.push({s,life:0});}},
 emit(x,y,z,vx,vy,vz,life,size,color,o={}){const p=this.pool.find(q=>q.life<=0);if(!p)return;p.s.visible=true;p.s.position.set(x,y,z);p.v=[vx,vy,vz];p.life=p.max=life;p.size=size;p.grow=o.grow||0;p.grav=o.grav||0;p.s.material.color.setHex(color);p.s.material.map=o.tex==='star'?this.starT:(o.tex==='sq'?this.sqT:this.glowT);p.s.material.blending=o.normal?THREE.NormalBlending:THREE.AdditiveBlending;p.s.material.rotation=o.rot||0;p.spin=o.spin||0;p.s.scale.set(size,size,1);},
 burst(x,y,z,n,sp,life,size,colors,o={}){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,e=(Math.random()-0.2)*1.2,v=sp*(0.4+Math.random()*0.6);this.emit(x,y,z,Math.cos(a)*v,Math.abs(e)*v*(o.up||1),Math.sin(a)*v,life*(0.6+Math.random()*0.6),size*(0.6+Math.random()*0.8),colors[i%colors.length],o);}},
 update(dt){for(const p of this.pool){if(p.life<=0)continue;p.life-=dt;if(p.life<=0){p.s.visible=false;continue;}const s=p.s;s.position.x+=p.v[0]*dt;s.position.y+=p.v[1]*dt;s.position.z+=p.v[2]*dt;p.v[1]-=p.grav*dt;if(s.position.y<0.05){s.position.y=0.05;p.v[1]*=-0.3;}const k=p.life/p.max;const sz=p.size*(1+p.grow*(1-k));s.scale.set(sz,sz,1);s.material.opacity=Math.min(1,k*1.6);s.material.rotation+=p.spin*dt;}}};
const ICOL={objecion:0x29ADFF,clausula:0xFF3355,ticket:0xFFD000,formulario:0x33FF88,bot:0xFF77A8,default:0xFFD86A,prompt:0xB99CFF};
function itemTex(kind){return ktex(16,16,x=>{x.clearRect(0,0,16,16);
 if(kind==='objecion'){x.fillStyle='#F4F2E8';x.fillRect(4,3,8,10);x.fillStyle='#8A8A96';for(let i=0;i<3;i++)x.fillRect(5,5+i*2,6,1);x.fillStyle='#C8102E';x.fillRect(5,11,6,2);}
 else if(kind==='clausula'){x.fillStyle='#F4F2E8';x.fillRect(4,3,8,10);x.strokeStyle='#E0102E';x.lineWidth=2;x.beginPath();x.moveTo(5,4);x.lineTo(11,12);x.moveTo(11,4);x.lineTo(5,12);x.stroke();}
 else if(kind==='ticket'){x.fillStyle='#FFD000';x.fillRect(2,4,12,8);x.fillStyle='#1A1A1A';x.fillRect(6,6,1,4);x.fillRect(9,6,1,4);x.fillRect(5,7,6,1);x.fillRect(5,9,6,1);}
 else if(kind==='formulario'){x.fillStyle='#F4F2E8';x.fillRect(3,2,10,12);x.fillStyle='#2A8A4A';x.fillRect(3,2,10,3);x.fillStyle='#22B05A';for(let i=0;i<3;i++)x.fillRect(5,7+i*2,2,1);}
 else if(kind==='bot'){x.fillStyle='#C8C8D0';x.fillRect(3,4,10,9);x.fillStyle='#1A1A24';x.fillRect(4,6,8,3);x.fillStyle='#FF3355';x.fillRect(5,7,2,1);x.fillRect(9,7,2,1);x.fillStyle='#FF004D';x.fillRect(7,1,2,3);}
 else if(kind==='box'){const gg=x.createLinearGradient(0,0,16,16);gg.addColorStop(0,'#FF77A8');gg.addColorStop(0.5,'#FFEC27');gg.addColorStop(1,'#29ADFF');x.fillStyle=gg;x.fillRect(0,0,16,16);x.fillStyle='rgba(255,255,255,0.6)';x.fillRect(0,0,16,2);x.fillStyle='#FFFFFF';x.font='bold 12px monospace';x.fillText('?',4,13);}});}
const KITEX={};function itexOf(k){return KITEX[k]||(KITEX[k]=itemTex(k));}
// íconos del HUD (pixel)
function itemIcon(it,x,y){R(x,y,22,22,'rgba(0,0,0,0.6)');BOXL(x,y,22,22,7);const cx=x+11,cy=y+11;
 if(it==='objecion'){disc(cx,cy,7,12);disc(cx,cy,4,7);R(cx-2,cy-3,4,5,'#F4F2E8');}
 else if(it==='clausulas'){for(let i=0;i<3;i++){R(x+3+i*6,y+5,5,12,'#F4F2E8');LN(x+3+i*6,y+6,x+7+i*6,y+15,8);}}
 else if(it==='formulario'){R(x+6,y+3,10,15,'#F4F2E8');R(x+6,y+3,10,3,'#2A8A4A');for(let i=0;i<3;i++)R(x+8,y+8+i*3,2,1,11);}
 else if(it==='kpi'){R(x+4,y+4,14,14,'#0A1A12');for(let i=0;i<3;i++)R(x+6+i*4,y+15-i*3,3,2+i*3,11);}
 else if(it==='ticket'){R(x+3,y+6,16,10,'#FFD000');T('#',x+8,y+8,0);}
 else if(it==='bot'){R(x+5,y+6,12,11,'#C8C8D0');R(x+7,y+9,8,3,'#1A1A24');R(x+8,y+10,2,1,8);R(x+12,y+10,2,1,8);R(x+10,y+3,2,3,8);}
 else if(it==='default'){disc(cx,cy,7,'#FFD86A');T('$',cx-2,cy-3,'#8A5A00');}
 else if(it==='firewall'){for(let i=0;i<3;i++)for(let j=0;j<3;j++)BOXL(x+4+i*5,y+4+j*5,4,4,12);}
 else if(it==='prompt'){R(x+3,y+5,16,12,'#0A1A12');BOXL(x+3,y+5,16,12,11);T('>',x+5,y+8,11);R(x+11,y+13,4,1,11);}}

// ======================= DEATHKART · juego =======================
let state='title',BOT=false;
const KG={diff:1,sel:0,trk:0,R:null,T:null,ren:null,scene:null,cam:null,spr:[],keys:{},auto:false,t:0,msg:'',msgT:0,camP:null,wrongT:0,eng:null};
const KTHEME={legal:{sky:['#F4EFE4','#D8D2C4'],fog:0xE6E0D2,road:'#5C667C',line:'#F4F4F0',curb:['#C8102E','#F4F4F0'],ground:0xB0AA9C,amb:0.95},
 dc:{sky:['#03060C','#0A1830'],fog:0x081428,road:'#1A1F2C',line:'#29ADFF',curb:['#29ADFF','#0A2A60'],ground:0x070A12,amb:0.55},
 roof:{sky:['#140A2A','#5A2A5A'],fog:0x2A1840,road:'#34343E',line:'#FFFFFF',curb:['#FF77A8','#F4F4F0'],ground:0x15151E,amb:0.65}};
function ktex(w,h,f,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');f(x,c);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;}t._c=c;return t;}
const KLOGO={};function klogo(w){if(!KLOGO[w]){const im=new Image();im.src=LOGO_SRC[w];KLOGO[w]=im;}return KLOGO[w];}
function logoTex(w,bg){return ktex(64,40,(x,c)=>{const paint=()=>{x.fillStyle=bg||'#F4F4F0';x.fillRect(0,0,64,40);x.fillStyle=w==='datco'?'#250A6B':'#4E7A1E';x.fillRect(0,0,64,4);x.fillRect(0,36,64,4);const im=klogo(w);if(im.complete)x.drawImage(im,18,6,28,28);};paint();const im=klogo(w);if(!im.complete)im.addEventListener('load',()=>{paint();if(c._t)c._t.needsUpdate=true;});});}
function kartTex(id){const C=DMC.find(c=>c.id===id);return ktex(48,40,x=>{x.imageSmoothingEnabled=false;kartBack(x,id,0,14,C.look);});}
const KM=c=>new THREE.MeshLambertMaterial({color:c}),KMB=c=>new THREE.MeshBasicMaterial({color:c});
function kbox(S,w,h,d,m,x,y,z,ry){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.rotation.y=ry||0;S.add(o);return o;}
function kplane(S,w,h,map,x,y,z,ry,opts){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial(Object.assign({map,side:THREE.DoubleSide,transparent:true},opts||{})));o.position.set(x,y,z);o.rotation.y=ry||0;S.add(o);if(map&&map._c)map._c._t=map;return o;}
function textTex(lines,bg,fg,w=96,h=28){return ktex(w,h,x=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=fg;x.font='bold 11px monospace';x.textAlign='center';lines.forEach((l,i)=>x.fillText(l,w/2,h/2+4+(i-(lines.length-1)/2)*12));});}
function kClear(T,x,z,r){for(let i=0;i<T.N;i+=1){const dx=x-T.px[i],dz=z-T.pz[i];const lim=T.w[i]+1.5+r;if(dx*dx+dz*dz<lim*lim){if(Math.abs(dx*T.tz[i]-dz*T.tx[i])<lim&&Math.abs(dx*T.tx[i]+dz*T.tz[i])<1.1)return false;}}return true;}
function kClearBox(T,x,z,w,d,ry){const c=Math.cos(ry),s=Math.sin(ry);for(const [lx,lz] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2],[0,0]]){const wx=x+lx*c+lz*s,wz=z-lx*s+lz*c;if(!kClear(T,wx,wz,0.15))return false;}return true;}
function buildScene(T){const th=KTHEME[T.def.theme],S=new THREE.Scene();
 S.background=ktex(4,64,x=>{const g2=x.createLinearGradient(0,0,0,64);g2.addColorStop(0,th.sky[0]);g2.addColorStop(1,th.sky[1]);x.fillStyle=g2;x.fillRect(0,0,4,64);});S.fog=new THREE.Fog(th.fog,25,T.def.theme==='roof'?160:110);
 S.add(new THREE.AmbientLight(0xffffff,th.amb));const dl=new THREE.DirectionalLight(0xffffff,0.55);dl.position.set(30,60,20);S.add(dl);
 const G0=Math.min(0,...T.h)-0.08;const gr=new THREE.Mesh(new THREE.PlaneGeometry(900,900),KM(th.ground));gr.rotation.x=-Math.PI/2;gr.position.y=G0;S.add(gr);
 // pista (ancho variable) y bordes
 const N=T.N,pos=[],uv=[],idx=[],cp=[],cuv=[],cid=[];for(let i=0;i<=N;i++){const k=i%N,hw=T.w[k],nx=T.tz[k],nz=-T.tx[k],v=i/3;const hy=T.h[k];pos.push(T.px[k]+nx*hw,hy,T.pz[k]+nz*hw,T.px[k]-nx*hw,hy,T.pz[k]-nz*hw);uv.push(0,v,1,v);
  for(const s of [1,-1]){const a=hw,b=hw+1.1;cp.push(T.px[k]+nx*a*s,hy+0.02,T.pz[k]+nz*a*s,T.px[k]+nx*b*s,hy+0.02,T.pz[k]+nz*b*s);cuv.push(0,i/2,1,i/2);}
  if(i<N){idx.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2);const b0=i*4,b1=(i+1)*4;cid.push(b0,b0+1,b1,b0+1,b1+1,b1,b0+2,b0+3,b1+2,b0+3,b1+3,b1+2);}}
 const g1=new THREE.BufferGeometry();g1.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g1.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g1.setIndex(idx);g1.computeVertexNormals();
 const rt=ktex(32,32,x=>{x.fillStyle=th.road;x.fillRect(0,0,32,32);for(let i=0;i<60;i++){x.fillStyle=`rgba(${Math.random()<0.5?0:255},${Math.random()<0.5?0:255},255,0.05)`;x.fillRect(Math.random()*32,Math.random()*32,1,1);}x.fillStyle=th.line;x.fillRect(15,0,2,12);},true);
 {const mm=new THREE.Mesh(g1,new THREE.MeshLambertMaterial({map:rt,side:THREE.DoubleSide}));mm.userData.track=1;S.add(mm);}
 const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(cp,3));g2.setAttribute('uv',new THREE.Float32BufferAttribute(cuv,2));g2.setIndex(cid);
 {const sk=[],si=[];for(let i=0;i<=N;i++){const k=i%N,hw=T.w[k]+1.1,nx=T.tz[k],nz=-T.tx[k],hy=T.h[k];for(const s of [1,-1])sk.push(T.px[k]+nx*hw*s,hy,T.pz[k]+nz*hw*s,T.px[k]+nx*hw*s,G0,T.pz[k]+nz*hw*s);if(i<N){const b0=i*4,b1=(i+1)*4;si.push(b0,b0+1,b1,b0+1,b1+1,b1,b0+2,b0+3,b1+2,b0+3,b1+3,b1+2);}}const gs=new THREE.BufferGeometry();gs.setAttribute('position',new THREE.Float32BufferAttribute(sk,3));gs.setIndex(si);gs.computeVertexNormals();{const mm=new THREE.Mesh(gs,new THREE.MeshLambertMaterial({color:new THREE.Color(th.road).multiplyScalar(0.55),side:THREE.DoubleSide}));mm.userData.track=1;S.add(mm);}}
 // rampas de salto con franjas de advertencia
 for(const ji of T.jumpI){const a0=(ji-9+N)%N;const p0=new THREE.Vector3(T.px[a0],T.h[a0]+0.06,T.pz[a0]),p1=new THREE.Vector3(T.px[ji],T.h[ji]+0.06,T.pz[ji]);const L=p0.distanceTo(p1),hw=T.w[ji];const rm=new THREE.Mesh(new THREE.PlaneGeometry(hw*2,L),new THREE.MeshBasicMaterial({map:ktex(16,16,x=>{for(let i2=0;i2<4;i2++){x.fillStyle=i2%2?'#111':'#FFD000';x.fillRect(0,i2*4,16,4);}x.fillStyle='#FF8A00';x.beginPath();x.moveTo(3,14);x.lineTo(8,4);x.lineTo(13,14);x.fill();}),side:THREE.DoubleSide}));const mid=p0.clone().add(p1).multiplyScalar(0.5);rm.position.copy(mid);rm.lookAt(p1);rm.rotateX(-Math.PI/2);rm.userData.track=1;S.add(rm);
  const nx=T.tz[ji],nz=-T.tx[ji];for(const s of [1,-1])kbox(S,0.3,T.h[ji]+0.2,0.3,KMB(0xFFD000),T.px[ji]+nx*(hw+1.8)*s,(T.h[ji]+0.2)/2,T.pz[ji]+nz*(hw+1.8)*s,0);}
 S.add(Object.assign(new THREE.Mesh(g2,new THREE.MeshBasicMaterial({map:ktex(4,8,x=>{x.fillStyle=th.curb[0];x.fillRect(0,0,4,4);x.fillStyle=th.curb[1];x.fillRect(0,4,4,4);},true),side:THREE.DoubleSide})),{userData:{track:1}}));
 // meta: línea a cuadros + arco con logos de Datco y Silica
 {const i=0,a=Math.atan2(T.tx[i],T.tz[i]),hw=T.w[i];const ln=new THREE.Mesh(new THREE.PlaneGeometry(hw*2,1.6),new THREE.MeshBasicMaterial({map:ktex(16,2,x=>{for(let k=0;k<16;k++)for(let j=0;j<2;j++){x.fillStyle=(k+j)%2?'#111':'#fff';x.fillRect(k,j,1,1);}})}));ln.rotation.x=-Math.PI/2;ln.rotation.z=a;ln.position.set(T.px[i],T.h[i]+0.03,T.pz[i]);ln.userData.track=1;S.add(ln);
  const nx=T.tz[i],nz=-T.tx[i];for(const s of [1,-1])kbox(S,0.8,6,0.8,KM(0x2A2A3A),T.px[i]+nx*(hw+2.0)*s,3+T.h[i],T.pz[i]+nz*(hw+2.0)*s,a);
  const beam=kbox(S,hw*2+4.8,1.6,0.6,KM(0x1A1A2A),T.px[i],6+T.h[i],T.pz[i],a);
  kplane(S,hw*2+3.4,1.4,ktex(128,14,x=>{x.fillStyle='#0B1020';x.fillRect(0,0,128,14);x.fillStyle='#FFEC27';x.font='bold 11px monospace';x.textAlign='center';x.fillText('DEATHKART · GRAN PREMIO',64,11);}),T.px[i]-T.tx[i]*0.35,6,T.pz[i]-T.tz[i]*0.35,a+Math.PI);
  kplane(S,2.2,1.4,logoTex('datco'),T.px[i]+nx*(hw+2.0)-T.tx[i]*0.45,4.2+T.h[i],T.pz[i]+nz*(hw+2.0)-T.tz[i]*0.45,a+Math.PI);kplane(S,2.2,1.4,logoTex('silica'),T.px[i]-nx*(hw+2.0)-T.tx[i]*0.45,4.2+T.h[i],T.pz[i]-nz*(hw+2.0)-T.tz[i]*0.45,a+Math.PI);}
 // flechas de turbo
 for(const p of T.pads){const i=p.i,a=Math.atan2(T.tx[i],T.tz[i]);const m=new THREE.Mesh(new THREE.PlaneGeometry(3.2,4.2),new THREE.MeshBasicMaterial({map:ktex(16,16,x=>{x.fillStyle='#FF8A00';x.fillRect(0,0,16,16);x.fillStyle='#FFEC27';for(let k=0;k<3;k++){x.beginPath();x.moveTo(2,15-k*5);x.lineTo(8,10-k*5);x.lineTo(14,15-k*5);x.lineTo(14,13-k*5);x.lineTo(8,8-k*5);x.lineTo(2,13-k*5);x.fill();}}),transparent:true}));m.rotation.x=-Math.PI/2;m.rotation.z=a+Math.PI;m.position.set(T.px[i]+T.tz[i]*p.off,T.h[i]+0.04,T.pz[i]-T.tx[i]*p.off);m.userData.track=1;S.add(m);}
 // decoración por tema + carteles con logos de la empresa
 const signs={legal:[['CONTRATOS'],['NDA POR','REVISAR: 999'],['LEGAL'],['¡FIRMA AQUÍ!']],dc:[['SALA 1'],['NO TOCAR','CABLES'],['NOC'],['ERROR 500']],roof:[['DIRECTORIO'],['META 2030'],['HELIPUERTO'],['VISIÓN 2050']]}[T.def.theme];
 const monT=[0x29ADFF,0x33FF88,0xFFEC27].map(c=>KMB(c));let sg=0;
 for(let i=0;i<N;i+=5){const a=Math.atan2(T.tx[i],T.tz[i]),nx=T.tz[i],nz=-T.tx[i],hw=T.w[i],H0=T.h[i];const kbox=(S2,w2,h2,d2,m2,x2,y2,z2,ry2)=>{const o2=new THREE.Mesh(new THREE.BoxGeometry(w2,h2,d2),m2);o2.position.set(x2,y2+H0,z2);o2.rotation.y=ry2||0;if(y2-h2/2>3.2||kClearBox(T,x2,z2,w2,d2,ry2||0))S2.add(o2);return o2;};const kplane=(S2,w2,h2,map2,x2,y2,z2,ry2,op2)=>{const o2=new THREE.Mesh(new THREE.PlaneGeometry(w2,h2),new THREE.MeshBasicMaterial(Object.assign({map:map2,side:THREE.DoubleSide,transparent:true},op2||{})));o2.position.set(x2,y2+H0,z2);o2.rotation.y=ry2||0;if(y2-h2/2>3.2||kClearBox(T,x2,z2,w2,0.1,ry2||0))S2.add(o2);if(map2&&map2._c)map2._c._t=map2;return o2;};
  for(const s of [1,-1]){const ox=T.px[i]+nx*(hw+3.8)*s,oz=T.pz[i]+nz*(hw+3.8)*s;
   if(T.def.theme==='legal'){kbox(S,0.5,2.4,5.2,KM(0x8A9AB8),ox,1.2,oz,a);if(i%15===0){kbox(S,0.9,0.6,0.05,KMB(0x0A1A2A),ox-nx*s*0.4,1.9,oz-nz*s*0.4,a+Math.PI/2);kbox(S,0.75,0.45,0.06,monT[(i/15)%3],ox-nx*s*0.42,1.9,oz-nz*s*0.42,a+Math.PI/2);}if(i%20===0)kbox(S,3.5,0.12,0.5,KMB(0xFFFFF0),T.px[i]+nx*hw*0.5*s,5.5,T.pz[i]+nz*hw*0.5*s,a);if(i%35===0&&s>0){kbox(S,0.7,1.1,0.7,KM(0x6B3A1E),ox+nx*1.4,0.55,oz+nz*1.4,0);const pl=new THREE.Mesh(new THREE.IcosahedronGeometry(0.8,0),KM(0x3C8C4A));pl.position.set(ox+nx*1.4,1.6,oz+nz*1.4);S.add(pl);}}
   else if(T.def.theme==='dc'){kbox(S,1.4,4.2,4.6,KM(0x20242E),ox,2.1,oz,a);if(i%5===0)for(let j=0;j<6;j++){const led=kbox(S,0.12,0.12,0.06,KMB([0x33FF88,0xFF3355,0x29ADFF][(i+j)%3]),ox-nx*s*0.72,0.6+j*0.6,oz-nz*s*0.72,a+Math.PI/2);led.userData.blink=Math.random()*6;(KG.blinks=KG.blinks||[]).push(led);}if(i%10===0)kbox(S,0.12,0.12,5.2,KMB(0x29ADFF),T.px[i]+nx*(hw+1.7)*s,0.15,T.pz[i]+nz*(hw+1.7)*s,a);}
   else{kbox(S,0.3,0.9,5.2,KM(0x55556A),ox,0.45,oz,a);if(i%30===0&&s>0){const h=10+((i*7)%22);kbox(S,8,h,8,KM(0x141428),ox+nx*30,h/2-1,oz+nz*30,a);const wt=ktex(8,16,x=>{x.fillStyle='#141428';x.fillRect(0,0,8,16);for(let r=0;r<16;r+=2)for(let c2=0;c2<8;c2+=2)if(Math.random()<0.55){x.fillStyle=Math.random()<0.8?'#FFE27A':'#29ADFF';x.fillRect(c2,r,1,1);}});kplane(S,8,h,wt,ox+nx*26,h/2-1,oz+nz*26,a+Math.PI/2,{transparent:false});}}}
  // carteles y banderas de Datco / Silica
  if(i%40===0){const s=(sg%2)?1:-1,ox=T.px[i]+nx*(hw+2.2)*s,oz=T.pz[i]+nz*(hw+2.2)*s;kbox(S,0.12,3.4,0.12,KM(0xC9A227),ox,1.7,oz,0);kplane(S,3.6,2.25,logoTex(sg%2?'silica':'datco'),ox,3.2,oz,a+Math.PI/2);sg++;}
  if(i%55===0){const s=(sg%2)?-1:1,ox=T.px[i]+nx*(hw+2.8)*s,oz=T.pz[i]+nz*(hw+2.8)*s;const L=signs[(i/55)%signs.length|0];kplane(S,3.2,1.0,textTex(L,T.def.theme==='dc'?'#0A1A2A':'#1D2B53',T.def.theme==='dc'?'#33FF88':'#FFEC27'),ox,2.6,oz,a+Math.PI/2);}}
 return S;}
// ---------------- carrera ----------------
function setupGL(){if(KG.ren)return;KG.ren=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});KG.q=1;const el=KG.ren.domElement;const wrap=document.createElement('div');wrap.style.cssText='position:relative;display:inline-block;line-height:0';cv.parentNode.insertBefore(wrap,cv);wrap.appendChild(el);wrap.appendChild(cv);el.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;z-index:0;display:none;image-rendering:auto;box-shadow:none';cv.style.position='relative';cv.style.zIndex='1';sizeGL();addEventListener('resize',()=>setTimeout(sizeGL,30));}
function sizeGL(){if(!KG.ren)return;const r=cv.getBoundingClientRect();const dpr=Math.min(2,devicePixelRatio||1);const w=Math.max(480,Math.min(1280,Math.round(r.width*dpr*(KG.q||1)))),h=Math.round(w*9/16);KG.ren.setSize(w,h,false);}
function startRace(){setupGL();const T=buildTrack(KTRACKS[KG.trk]);KG.T=T;KG.blinks=[];KG.scene=buildScene(T);KFX.init(KG.scene);
 const me=DMC[KG.sel];let all,human=new Set([me]);if(KG.roster){all=KG.roster.map(id=>DMC.find(c=>c.id===id));for(const id of (KG.humans||[]))human.add(DMC.find(c=>c.id===id));}else{all=[...shuffle(DMC.filter(c=>c!==me)),me];}
 if(KG.mode==='tt'){all=[me];T.boxes=[];}
 const ks=all.map((C,s)=>{const k=newKart(C,T,s,!human.has(C)||(C===me&&KG.auto));if(KG.net&&C!==me&&human.has(C))k.remote=true;return k;});KG.R=raceNew(T,ks,3);applyDiff(KG.R,KG.diff??1);if(KG.mode==='tt'){const m0=ks[0];m0.item='kpi';m0.kpiN=3;TT.rec=[];TT._fin=null;KG.gsp=null;}KG.R.id=(KG.raceId||0);KG.mm=null;KG.endT=0;KG.msgT=0;KG.cd=null;KG.paused=false;KG.me=ks.find(k=>k.C===me)||ks[ks.length-1];if(KG.auto)KG.R.player=KG.me;KG.shake=0;
 KG.spr=ks.map(k=>{const views=kartViews(k.C,upperOf(k.C)).map(c2=>{const t2=new THREE.CanvasTexture(c2);t2.magFilter=THREE.NearestFilter;t2.minFilter=THREE.NearestFilter;return t2;});const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:views[0]}));sp.userData.views=views;sp.scale.set(3.4,2.55,1);KG.scene.add(sp);const sh=new THREE.Mesh(new THREE.CircleGeometry(1.1,10),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35}));sh.rotation.x=-Math.PI/2;KG.scene.add(sh);
  const bub=new THREE.Mesh(new THREE.SphereGeometry(2.0,16,10),new THREE.MeshBasicMaterial({color:0x29ADFF,transparent:true,opacity:0.22,wireframe:false,blending:THREE.AdditiveBlending,depthWrite:false}));bub.visible=false;KG.scene.add(bub);
  const ice=new THREE.Mesh(new THREE.BoxGeometry(3,2.8,3),new THREE.MeshBasicMaterial({color:0x9FE6FF,transparent:true,opacity:0.35,depthWrite:false}));ice.visible=false;KG.scene.add(ice);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:KFX.glowT,color:0xFFA300,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));glow.visible=false;KG.scene.add(glow);return {sp,sh,bub,ice,glow};});
 KG.boxM=T.boxes.map(b=>{const m=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5),new THREE.MeshBasicMaterial({map:itexOf('box'),transparent:true,opacity:0.95}));m.position.set(b.x,1.3,b.z);KG.scene.add(m);const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:KFX.glowT,color:0xFFEC27,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0.5}));gl.scale.set(3.4,3.4,1);gl.position.copy(m.position);KG.scene.add(gl);return {m,gl};});
 KG.camA=null;KG.camY=null;KG.objM=new Map();KG.cam=new THREE.PerspectiveCamera(66,16/9,0.1,500);KG.camP=null;KG.myTex=kartTexCanvas(me.id);state='race';KG.t=0;KG.ren.domElement.style.display='block';engineOn();if(KG.mode==='tt'){TT.ghost=null;TT.loadGhost();}}
function kartTexCanvas(id){const c=document.createElement('canvas');c.width=48;c.height=40;const x=c.getContext('2d');x.imageSmoothingEnabled=false;kartBack(x,id,0,14,DMC.find(d=>d.id===id).look);return c;}
function playerInput(){const k=KG.me,I=k.inp,K=KG.keys;if(KG.auto)return;if(KG.itemPress){KG.itemPress=false;if(k.item&&!(k.roul>0))k.useItem=true;}const L=K.ArrowLeft||K.KeyA||KG.tl,Rr=K.ArrowRight||K.KeyD||KG.tr;I.steer=(Rr?1:0)-(L?1:0);I.acc=!!(K.ArrowUp||K.KeyW||K.KeyX||TOUCHUI);I.brake=!!(K.ArrowDown||K.KeyS||KG.tb);I.drift=!!(K.Space||K.ShiftLeft||K.ShiftRight||KG.td);}
function raceUpdate(dt){const RC=KG.R,k=KG.me;if(KG.net&&KG.net.role==='guest'){NETK.guestUpdate(dt);return;}if(KG.net&&KG.net.role==='host')NETK.hostPre(dt);if(KG.paused){engineSet({v:0,boost:0});if(M.on){M.on=false;KG.mPaused=true;}return;}if(KG.mPaused){KG.mPaused=false;M.on=true;M.next=AT()+0.05;}playerInput();const before=k.lap;raceStep(RC,dt);KG.t+=dt;
 if(RC.t<0){const s=Math.ceil(-RC.t);if(s!==KG.cd&&s<=3){KG.cd=s;blip(72,AT(),0.12);}}else if(KG.cd!==0){KG.cd=0;blip(84,AT(),0.14);blip(91,AT()+0.08,0.14);kMusic();}
 if(KG.mcfg&&M.on){M.bpm=KG.mcfg.bpm*(k.lap>=RC.laps?1.12:1);}
 if(k.lap!==before&&k.lap>=2&&k.lap<=RC.laps){KG.msg=k.lap===RC.laps?'¡ÚLTIMA VUELTA!':'VUELTA '+k.lap;KG.msgT=2;S.ok();}
 kEvents(RC,k);
 RC.ev.length=0;
 kContinuous(RC,k,dt);if(KG.mode==='tt'){TT.sample(k,RC.t);if(!k.item&&k.kpiN>1&&!(k.boost>1.2)){k.kpiN--;k.item='kpi';}}
 if(KG.net&&KG.net.role==='host')NETK.hostPost();
 if(k.done&&!KG.endT){KG.endT=0.01;S.win();}if(KG.endT){KG.endT+=dt;if(KG.endT>3.2||RC.fin>=4&&KG.endT>1.2){state=KG.mode==='tt'?'ttres':'results';if(KG.mode==='tt')TT.finish(k);if(KG.mode==='cup')CUP.tally();engineOff();musicStop();KG.ren.domElement.style.display='none';}}}
function kEvents(RC,k){if(KG.net&&KG.net.role==='host')NETK.queue(RC.ev);
 // eventos de la simulación -> efectos 3D y sonido
 const near=e=>{const q=e.k||e.a;return q===k;};for(const e of RC.ev){const x=e.x??(e.k&&e.k.x),z=e.z??(e.k&&e.k.z);
  if(e.t==='mt'){const cc=[0,0x29ADFF,0xFFA300,0xB06BFF][e.lvl];if(e.trick&&near(e)){KG.msg='¡TURBO DE TRUCO!';KG.msgT=0.8;}KFX.burst(e.k.x,0.6,e.k.z,18,7,0.45,0.7,[cc,0xffffff]);if(near(e)){tone('sawtooth',260+e.lvl*90,AT(),0.35,0.06,null,900+e.lvl*200);KG.msg=e.start?'¡SALIDA PERFECTA!':['','MINI-TURBO','SÚPER TURBO','ULTRA TURBO'][e.lvl];KG.msgT=0.9;}}
  else if(e.t==='jump'){if(near(e))tone('sine',300,AT(),0.25,0.06,null,700);}
  else if(e.t==='trick'){KFX.burst(e.k.x,1.6+(e.k.y||0),e.k.z,14,5,0.4,0.5,[0xFFEC27,0xFFFFFF],{tex:'star',normal:true,spin:6});if(near(e)){KG.msg='¡TRUCO!';KG.msgT=0.7;blip(96,AT(),0.08);}}
  else if(e.t==='land'){KFX.burst(e.k.x,0.3+(e.k.y||0),e.k.z,10,4,0.5,0.9,[0xBBBBAA],{normal:true,grow:1});if(near(e)){KG.shake=0.15;noise(AT(),0.12,0.08,'lowpass',400);}}
  else if(e.t==='stall'&&near(e)){KG.msg='¡SE AHOGÓ EL MOTOR!';KG.msgT=1.2;noise(AT(),0.4,0.1,'lowpass',300);}
  else if(e.t==='wall'){KFX.burst(x,0.5,z,10,6,0.35,0.35,[0xFFEC27,0xFFFFFF],{grav:9});if(near(e)){KG.shake=0.25;}}
  else if(e.t==='crash'){KFX.burst(x,0.8,z,14,7,0.4,0.4,[0xFFEC27,0xFFFFFF,0xFF8A00],{grav:8});if(e.a===k||e.b===k){KG.shake=0.3;noise(AT(),0.15,0.12,'bandpass',900);}}
  else if(e.t==='box'){KFX.burst(x,1.3,z,16,6,0.5,0.5,[0xFF77A8,0xFFEC27,0x29ADFF,0x33FF88],{tex:'sq',normal:true,grav:6,spin:6});if(near(e)){KG.roulT=0;tone('square',660,AT(),0.05,0.05);}}
  else if(e.t==='use'){if(near(e)){tone(e.it==='kpi'?'sawtooth':'square',e.it==='kpi'?200:520,AT(),0.25,0.07,null,e.it==='kpi'?900:260);}if(e.it==='firewall')KFX.burst(e.k.x,1.2,e.k.z,20,5,0.5,0.6,[0x29ADFF,0x9FE6FF]);}
  else if(e.t==='hit'){KFX.burst(e.k.x,1.0,e.k.z,22,8,0.6,0.7,e.how==='freeze'?[0x9FE6FF,0xFFFFFF]:[0xFF8A00,0xFFEC27,0xFF3355]);for(let i=0;i<5;i++)KFX.emit(e.k.x,2.4,e.k.z,Math.cos(i*1.25)*1.5,0.5,Math.sin(i*1.25)*1.5,1.0,0.6,0xFFEC27,{tex:'star',spin:5,normal:true});if(e.k===k){KG.shake=0.5;noise(AT(),0.35,0.18,'bandpass',600);KG.msg=e.how==='freeze'?'¡CONGELADO!':'¡AUCH!';KG.msgT=0.8;}else if(e.src===k){S.ok();}}
  else if(e.t==='block'){KFX.burst(e.k.x,1.2,e.k.z,26,7,0.5,0.6,[0x29ADFF,0xFFFFFF]);if(near(e))tone('sine',1320,AT(),0.2,0.07,null,660);}
  else if(e.t==='boom'){KFX.burst(x,1.0,z,30,9,0.7,1.0,[0xFF8A00,0xFFEC27,0xFF3355,0xFFFFFF],{grav:5});KFX.burst(x,1.0,z,8,2,1.2,2.4,[0x444455],{normal:true,grow:1});if(Math.hypot(x-k.x,z-k.z)<30)noise(AT(),0.3,0.12,'lowpass',700);}
  else if(e.t==='pop'){KFX.burst(x,1.0,z,10,5,0.35,0.5,[ICOL[e.kind]||0xffffff]);}
  else if(e.t==='tele'){KFX.burst(e.x0,1.2,e.z0,30,6,0.6,0.5,[0x33FF88,0xB99CFF,0x29ADFF],{tex:'sq',normal:true});KFX.burst(e.k.x,1.2,e.k.z,30,6,0.6,0.5,[0x33FF88,0xB99CFF,0x29ADFF],{tex:'sq',normal:true});if(near(e))tone('sine',300,AT(),0.3,0.07,null,1800);}}
}
function kContinuous(RC,k,dt){
 if(k.boost>0&&!KG.wasBoost){tone('sawtooth',300,AT(),0.4,0.06,null,900);}KG.wasBoost=k.boost>0;
 if(k.drift&&Math.random()<0.25)noise(AT(),0.06,0.03,'bandpass',2600+k.drift.t*600);
 if(k.roul>0){KG.roulT=(KG.roulT||0)+dt;if(Math.floor(KG.roulT*14)!==Math.floor((KG.roulT-dt)*14))blip(88+Math.floor(KG.roulT*14)%5,AT(),0.04);}
 const ta=Math.atan2(RC.T.tx[k.idx],RC.T.tz[k.idx]);KG.wrong=RC.t>0&&Math.cos(ANG(k.va,ta))<-0.3&&!k.done&&!(k.spin>0)&&!k.drift;KG.wrongT=KG.wrong?KG.wrongT+dt:0;if(KG.wrongT>3){respawn(k,RC.T);KG.wrongT=0;}
 engineSet(k);KG.msgT=Math.max(0,KG.msgT-dt);KG.shake=Math.max(0,(KG.shake||0)-dt);KFX.update(dt);
 // emisores continuos: chispas de derrape, llamas de turbo, estelas de proyectiles, estrellas
 for(const q of RC.karts){const fx=Math.sin(q.a),fz=Math.cos(q.a),rx=Math.cos(q.a),rz=-Math.sin(q.a);
  if(q.drift&&Math.random()<0.9){const lv=driftLvl(q.drift.t),cc=[0xDDDDDD,0x29ADFF,0xFFA300,0xB06BFF][lv],sz=[0.25,0.45,0.6,0.75][lv];for(const sd of [-1,1])KFX.emit(q.x-fx*0.9+rx*sd*1.0,0.25+(q.y||0),q.z-fz*0.9+rz*sd*1.0,(-fx+rx*sd*0.6)*3+(Math.random()-0.5)*2,1.5+Math.random()*2,(-fz+rz*sd*0.6)*3+(Math.random()-0.5)*2,0.25,sz,cc,{grav:12});}
  if(q.boost>0){const cc=q.boostLvl===4?0x33FF88:(q.boostLvl===3?0xB06BFF:0xFF8A00);for(let n=0;n<2;n++)KFX.emit(q.x-fx*1.4+(Math.random()-0.5)*0.4,0.55+(q.y||0),q.z-fz*1.4,-fx*6,0.6,-fz*6,0.25,0.7,n?0xFFEC27:cc,{grow:0.8});}
  if(q.spin>0&&Math.random()<0.2)KFX.emit(q.x,2.6,q.z,(Math.random()-0.5)*2,0.6,(Math.random()-0.5)*2,0.6,0.5,0xFFEC27,{tex:'star',spin:6,normal:true});}
 for(const o of RC.objs)if(o.type==='proj'&&Math.random()<0.8)KFX.emit(o.x,1.0,o.z,(Math.random()-0.5),0.4,(Math.random()-0.5),0.35,0.6,ICOL[o.kind]||0xffffff);
}
function raceRender(t){const RC=KG.R,k=KG.me,c=KG.cam;KG.fpsN=(KG.fpsN||0)+1;KG.fpsT=(KG.fpsT||t);if(t-KG.fpsT>2){const fps=KG.fpsN/(t-KG.fpsT);KG.fpsN=0;KG.fpsT=t;if(fps<40&&(KG.q||1)>0.5){KG.q=Math.max(0.5,(KG.q||1)-0.2);sizeGL();}}
 const want=k.spin>0?k.va:(k.drift?k.a+ANG(k.va,k.a)*0.5:k.a);if(KG.camA==null)KG.camA=want;const fr=Math.min(4,(KG.lastDt||1/60)*60);KG.camA+=ANG(want,KG.camA)*(1-Math.pow(0.88,fr));const ca=KG.camA,back=6.2+(k.boost>0?1.2:0);const tx=k.x-Math.sin(ca)*back,tz=k.z-Math.cos(ca)*back;if(!KG.camP)KG.camP={x:tx,z:tz};const cf=1-Math.pow(0.75,fr);KG.camP.x+=(tx-KG.camP.x)*cf;KG.camP.z+=(tz-KG.camP.z)*cf;
 {const Tt=RC.T,ci=nearest(Tt,KG.camP.x,KG.camP.z,k.idx),lt=lateral(Tt,ci,KG.camP.x,KG.camP.z),lim=Tt.w[ci]+1.2;if(Math.abs(lt)>lim){const ex=Math.abs(lt)-lim,sg=Math.sign(lt);KG.camP.x-=Tt.tz[ci]*sg*ex;KG.camP.z+=Tt.tx[ci]*sg*ex;}}
 const sh=KG.shake>0?(Math.random()-0.5)*KG.shake*0.8:0;KG.camY=(KG.camY??(k.y||0))+(((k.y||0))-(KG.camY??0))*(1-Math.pow(0.85,fr));c.position.set(KG.camP.x+sh,2.8+KG.camY+sh*0.5,KG.camP.z);c.lookAt(k.x+Math.sin(ca)*6,1.0+(k.y||0),k.z+Math.cos(ca)*6);c.fov=66+(k.boost>0?10:0)+Math.min(6,Math.abs(k.v)*0.12);c.updateProjectionMatrix();
 RC.karts.forEach((q,i)=>{const o=KG.spr[i];const gyy=RC.T.h[q.idx]||0;const y=1.15+(q.y||0)+q.hop*4+(q.respawnT>0?2:0);o.sp.position.set(q.x,y,q.z);o.sh.position.set(q.x,gyy+0.03,q.z);{const sc=q.air?Math.max(0.4,1-((q.y||0)-gyy)*0.15):1;o.sh.scale.set(sc,sc,sc);}o.sp.material.opacity=q.respawnT>0?0.5:1;q.respawnT=Math.max(0,(q.respawnT||0)-1/60);
  {const cdir=Math.atan2(q.x-c.position.x,q.z-c.position.z);let rel=ANG(q.a,cdir);if(q.spin>0)rel+=q.spin*14;const vi=((Math.round(rel/(Math.PI/4))%8)+8)%8;const mp=o.sp.userData.views[KG.viewFlip?(8-vi)%8:vi];if(o.sp.material.map!==mp){o.sp.material.map=mp;o.sp.material.needsUpdate=true;}}o.sp.material.rotation=q===k&&!(q.spin>0)?-k.inp.steer*0.06:0;o.bub.visible=q.shield>0;if(o.bub.visible){o.bub.position.set(q.x,1.3+(q.y||0),q.z);o.bub.material.opacity=0.16+0.08*Math.sin(t*10)+(q.shield<1.5&&Math.floor(t*8)%2?-0.12:0);}
  o.ice.visible=q.frozen>0;if(o.ice.visible)o.ice.position.set(q.x,1.3+(q.y||0),q.z);o.glow.visible=q.boost>0;if(o.glow.visible){o.glow.position.set(q.x-Math.sin(q.a)*1.4,0.7+(q.y||0),q.z-Math.cos(q.a)*1.4);const s2=1.6+Math.sin(t*40)*0.3;o.glow.scale.set(s2,s2,1);o.glow.material.color.setHex(q.boostLvl===4?0x33FF88:(q.boostLvl===3?0xB06BFF:0xFF8A00));}});
 RC.T.boxes.forEach((b,i)=>{const M_=KG.boxM[i];M_.m.visible=M_.gl.visible=b.t<=0;M_.m.rotation.set(t*1.2,t*1.6,0);M_.m.position.y=1.3+(RC.T.h[b.i]||0)+Math.sin(t*3+i)*0.2;M_.gl.position.y=M_.m.position.y;});
 const seen=new Set();for(const o of RC.objs){let m=KG.objM.get(o);if(!m){if(o.type==='rain'){m={rain:true};}else{const kind=o.kind==='clausula'?'clausula':o.kind;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:itexOf(kind)}));sp.scale.set(1.6,1.6,1);KG.scene.add(sp);const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:KFX.glowT,color:ICOL[kind]||0xffffff,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));gl.scale.set(3,3,1);KG.scene.add(gl);m={sp,gl};}KG.objM.set(o,m);}seen.add(o);
  if(m.rain){if(Math.random()<0.8)KFX.emit(o.target.x+(Math.random()-0.5)*3,6,o.target.z+(Math.random()-0.5)*3,0,-9,0,0.7,0.5,0xFFD86A,{tex:'sq',normal:true});continue;}
  if(o._h==null||o.type==='proj')o._h=RC.T.h[nearest(RC.T,o.x,o.z,o.idx??null)]||0;const yy=o._h+(o.type==='trap'?0.6:1.0+Math.sin(t*12)*0.1);m.sp.position.set(o.x,yy,o.z);m.gl.position.set(o.x,yy,o.z);m.gl.material.opacity=o.type==='trap'?(o.arm>0?0.3:0.5+0.3*Math.sin(t*8)):0.9;m.sp.material.rotation=o.type==='proj'?t*8:0;}
 for(const [o,m] of KG.objM){if(!seen.has(o)){if(m.sp){KG.scene.remove(m.sp);KG.scene.remove(m.gl);}KG.objM.delete(o);}}
 for(const b of KG.blinks||[])b.visible=Math.sin(t*5+b.userData.blink)>-0.3;
 if(KG.mode==='tt')ghostUpdate(c);KG.ren.render(KG.scene,c);g.clearRect(0,0,W,H);
 if(k.boost>0&&!KG.paused){const inten=Math.min(1,k.boost/0.4),cx=W/2,cy=H*0.46,cc=k.boostLvl===4?'120,255,160':(k.boostLvl===3?'200,150,255':'255,255,255');g.save();g.lineCap='round';
  for(let i=0;i<18;i++){const a=(i*2.399+Math.floor(i/3))%(Math.PI*2),ph=((t*3.2+i*0.137)%1),r0=58+ph*70,len=10+ph*22;const ex=Math.cos(a),ey=Math.sin(a)*0.62;
   const x1=cx+ex*r0,y1=cy+ey*r0,x2=cx+ex*(r0+len),y2=cy+ey*(r0+len);if(Math.abs(x1-cx)<40&&Math.abs(y1-cy)<24)continue;const al=(0.2+0.55*ph)*inten;g.lineWidth=ph>0.6?1.6:1;g.strokeStyle=`rgba(20,30,60,${al*0.45})`;g.beginPath();g.moveTo(x1+0.6,y1+0.6);g.lineTo(x2+0.6,y2+0.6);g.stroke();g.strokeStyle=`rgba(${cc},${al})`;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}g.restore();}
 kartHUD(t);}
function ordinal(n){return n+(['RO','DO','RO','TO','TO','TO','MO','VO'][n-1]||'');}
function kartHUD(t){const RC=KG.R,k=KG.me;
 T(ordinal(k.place),6,6,k.place===1?10:7,3,0);T('/'+RC.karts.length,6+TW(ordinal(k.place))*3+2,16,6,1,0);
 const lap=Math.min(RC.laps,Math.max(1,k.lap));T('VUELTA '+lap+'/'+RC.laps,W-70,5,7,1,0);const tt=Math.max(0,RC.t);T(fmtK(k.done?k.time:tt),W-70,15,10,1,0);
 // velocímetro
 R(6,H-10,50,4,'rgba(0,0,0,0.5)');R(6,H-10,Math.round(50*Math.min(1,Math.abs(k.v)/34)),4,k.boost>0?'#FFA300':'#29ADFF');T(Math.round(Math.abs(k.v)*4.3)+' KM/H',6,H-18,7,1,0);
 // minimapa
 const mm=KG.mm||(KG.mm=miniMap(RC.T,44));const mx=W-50,my=H-52;R(mx-2,my-2,48,48,'rgba(0,0,0,0.45)');g.drawImage(mm.c,mx,my);for(const q of RC.karts){const p=mm.pt(q.x,q.z);R(mx+p[0]-1,my+p[1]-1,q===k?3:2,q===k?3:2,q===k?(Math.floor(t*6)%2?'#FFFFFF':'#FFEC27'):col(q.C.look.glove));}
 {const it=k.roul>0?['objecion','clausulas','formulario','kpi','ticket','bot','default','firewall','prompt'][Math.floor(t*14)%9]:k.item;R(W/2-14,3,28,28,'rgba(0,0,0,0.35)');if(it)itemIcon(it,W/2-11,6);else{BOXL(W/2-11,6,22,22,5);}if(k.item&&!(k.roul>0)){const nm=ITEM_N[k.item];R(W/2-TW(nm)/2-2,30,TW(nm)+4,9,'rgba(0,0,0,0.5)');TC(nm,31,10,1,null,W/2);if(!TOUCHUI)TC('Z: USAR',40,6,1,null,W/2);}}
 if(KG.mode==='tt'){const mb=TT.mine();const ms='MEJOR '+(mb&&mb.total?fmtK(mb.total):'--');T(ms,W-4-TW(ms),25,6,1,0);if(TT.ghost)T('FANTASMA: '+TT.ghost.name.slice(0,18),6,30,12,1,0);if(k.kpiN&&k.item)T('x'+k.kpiN,W/2+14,4,11,1,0);}
 if(RC.t<0.8){const s=RC.t<0?Math.ceil(-RC.t):0;if(s<=3)TC(s?String(s):'¡YA!',52,s?7:10,4,0);}
 if(RC.t<-0.3&&!TOUCHUI){kControls(H-40);TC('ACELERA JUSTO DESPUÉS DEL 2: SALIDA TURBO',H-48,10,1,0);}if(KG.paused){R(0,0,W,H,'rgba(5,6,12,0.85)');TC('PAUSA',30,10,2,0);kControls(56);TC('ESC: SEGUIR · Q: SALIR',H-14,7,1,0);}
 if(KG.msgT>0&&!KG.paused)TC(KG.msg,78,KG.msg.startsWith('¡Ú')?8:(KG.msg.includes('TURBO')||KG.msg.includes('PERFECTA')?10:7),2,0);if(KG.wrong&&Math.floor(t*4)%2&&!KG.paused)TC('¡AL REVÉS!',78,8,2,0);if(k.done)TC('¡META! '+ordinal(k.place)+' LUGAR',44,10,2,0);
 if(TOUCHUI){BTNS.push({id:'tl',x:0,y:H-46,w:44,h:46},{id:'tr',x:46,y:H-46,w:44,h:46},{id:'td',x:W-96,y:H-46,w:46,h:46},{id:'tb',x:W-48,y:H-46-50,w:46,h:22});BTNS.push({id:'ti',x:W-48,y:H-46,w:46,h:46});for(const [id,lab,x0,y0,w0,h0] of [['tl','◀',0,H-46,44,46],['tr','▶',46,H-46,44,46],['td','DERRAPE',W-96,H-46,46,46],['ti','ÍTEM',W-48,H-46,46,46]]){R(x0+1,y0+1,w0-2,h0-2,KG[id]?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.3)');TC(lab,y0+h0/2-3,7,1,null,x0+w0/2);}}}
function kStar(x,y,c){R(x,y-3,1,7,c);R(x-3,y,7,1,c);R(x-1,y-1,3,3,c);R(x-2,y+2,1,1,c);R(x+2,y+2,1,1,c);}
function kControls(y){const L=[['↑','ACELERAR'],['↓','FRENAR'],['← →','GIRAR'],['ESPACIO','DERRAPE+TURBO'],['Z','USAR ÍTEM'],['ESC','PAUSA']];const w=236,h=34;R(W/2-w/2,y,w,h,'rgba(0,0,0,0.65)');BOXL(W/2-w/2,y,w,h,12);L.forEach(([a,b],i)=>{const cx=W/2-w/2+4+(i>2?116:0),cy=y+4+(i%3)*10;T(a,cx,cy,10);T(b,cx+(i>2?48:30),cy,7);});}
function fmtK(s){const m=Math.floor(s/60),r=s-m*60;return m+':'+(r<10?'0':'')+r.toFixed(1);}
function miniMap(T,sz){let a=1e9,b=-1e9,c1=1e9,d=-1e9;for(let i=0;i<T.N;i++){a=Math.min(a,T.px[i]);b=Math.max(b,T.px[i]);c1=Math.min(c1,T.pz[i]);d=Math.max(d,T.pz[i]);}const sc=(sz-4)/Math.max(b-a,d-c1);const cv2=document.createElement('canvas');cv2.width=sz;cv2.height=sz;const x=cv2.getContext('2d');x.strokeStyle='#C2C3C7';x.lineWidth=2;x.beginPath();for(let i=0;i<=T.N;i++){const k=i%T.N;const px=2+(T.px[k]-a)*sc,py=2+(T.pz[k]-c1)*sc;i?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();return {c:cv2,pt:(X,Z)=>[Math.round(2+(X-a)*sc),Math.round(2+(Z-c1)*sc)]};}
// ---------------- sonido de motor ----------------
function kMusic(){const tid=KTRACKS[KG.trk].theme;const cfg={legal:{bpm:132,roots:[48,53,55,52],lead:[0,4,7,12,7,4,9,7]},dc:{bpm:150,roots:[45,45,48,43],lead:[0,3,7,10,12,10,7,3]},roof:{bpm:140,roots:[50,46,48,45],lead:[0,7,12,14,12,7,5,7]}}[tid];KG.mcfg=cfg;musicStart(cfg.bpm,(st,t,s16)=>{const bar=Math.floor(st/16)%4,root=cfg.roots[bar],b=st%16;
  if(b%4===0)kick(t,0.7);if(b%8===4)snare(t,0.28);hat(t,b%4===2,0.06);
  if(b%2===0)tone('sawtooth',hz(root-12+(b%8===6?7:0)),t,s16*1.6,0.07,A.mus,null,{lp:900});
  if(b%2===1||(KG.R&&KG.me&&KG.me.lap>=KG.R.laps))tone('pulse',hz(root+12+cfg.lead[(st>>1)%8]),t,s16*0.9,0.035,A.mus);
  if(b===0)tone('triangle',hz(root+24),t,s16*6,0.03,A.mus);});}
function engineOn(){audioInit();if(!A.ctx||KG.eng)return;const c=A.ctx,o=c.createOscillator(),o2=c.createOscillator(),lp=c.createBiquadFilter(),gn=c.createGain();o.type='sawtooth';o2.type='square';lp.type='lowpass';lp.frequency.value=700;gn.gain.value=0.0;o.connect(lp);o2.connect(lp);lp.connect(gn);gn.connect(A.master);o.start();o2.start();KG.eng={o,o2,gn,lp};}
function engineSet(k){const e=KG.eng;if(!e)return;const v=Math.abs(k.v),f=48+v*5.2+(k.boost>0?40:0);e.o.frequency.setTargetAtTime(f,AT(),0.05);e.o2.frequency.setTargetAtTime(f*0.5,AT(),0.05);e.gn.gain.setTargetAtTime(KG.R.t<0?0.025:0.05,AT(),0.1);e.lp.frequency.setTargetAtTime(500+v*30,AT(),0.1);}
function engineOff(){const e=KG.eng;if(!e)return;try{e.gn.gain.setTargetAtTime(0,AT(),0.05);e.o.stop(AT()+0.3);e.o2.stop(AT()+0.3);}catch(err){}KG.eng=null;}
// ---------------- pantallas ----------------
function upperOf(C){const key='u'+C.id;if(KG[key])return KG[key];g.save();g.clearRect(0,0,W,H);L8.drawF({C,look:C.look,st:'idle',t:0,face:1,x:32,y:124,alpha:1,cd:[0,0]},0);const s=document.createElement('canvas');s.width=64;s.height=48;const x=s.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(cv,8,64,48,40,6,-6,48,40);kartSide(x,C.id,6,12);g.restore();KG[key]=s;return s;}
function bgGrad(){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#1A1036');gr.addColorStop(1,'#0B1020');g.fillStyle=gr;g.fillRect(0,0,W,H);for(let i=0;i<W;i+=16)R(i,H-20+((i/16)%2?0:2),8,2,'#2A3A60');}
function drawTitle(t){bgGrad();for(let i=0;i<8;i++){const sx=((t*40+i*36)%(W+64))-48;g.drawImage(upperOf(DMC[i]),0,0,64,48,sx,H-58,64,48);}TC('DEATHKART',22,8,3,2);TC('GRAN PREMIO DE LA OFICINA',48,10,1,0);
 if(Math.floor(t*2.5)%2===0)TC(TOUCHUI?'TOCA PARA EMPEZAR':'ENTER PARA EMPEZAR',64,7,1,0);TC('PROTOTIPO V0.1',H-8,5,1,0);}
function kMenuGo(i){if(i===5){ARCADE.back();return;}KG.net=null;KG.roster=null;KG.humans=null;KG.mode=['quick','cup','tt','online','rank'][i];if(i===3){NETK.init();state='online';}else if(i===4){TT.init();KG.rtrk=KG.trk||0;state='rank';}else{if(i===2)TT.init();state='select';}}
function drawMenuK(t){bgGrad();TC('DEATHKART',12,8,2,2);const L=['1. CARRERA RÁPIDA','2. COPA DE LA OFICINA (3 PISTAS)','3. CONTRARRELOJ + FANTASMA','4. ONLINE · HASTA 4 PERSONAS','5. RANKING DE LA OFICINA','← CAMBIAR DE JUEGO'];L.forEach((l,i)=>{const y=31+i*15,s=i===(KG.mi||0);R(26,y-3,204,13,s?'#2A3A70':'#16203A');if(s)BOXL(26,y-3,204,13,10);TC(l,y,s?10:7,1,0);});TC(DMC.length+' PILOTOS · 3 PISTAS · ÍTEMS',H-10,6,1,0);}
function drawSelect(t){bgGrad();hud('ELIGE TU PILOTO','');DMC.forEach((C,i)=>{const x=4+(i%5)*50,y=15+Math.floor(i/5)*50,s=i===KG.sel;R(x,y,48,48,s?'#2A3A70':'#16203A');if(s)BOXL(x,y,48,48,Math.floor(t*6)%2?10:12);g.drawImage(upperOf(C),0,0,64,48,x-6,y+2,60,45);T(({jl:'J. LUIS',brandan:'BRANDAN',fran:'FRAN',seba:'SEBA'}[C.id]||C.n.split(' ')[0]).slice(0,8),x+2,y+41,s?10:7,1,0);});
 const C=DMC[KG.sel];R(0,H-26,W,26,'#0B1020');T(KT[C.id].n,4,H-24,12,1,0);T(TOUCHUI?'TOCA DOS VECES':'ENTER',W-4-TW(TOUCHUI?'TOCA DOS VECES':'ENTER'),H-24,6,1,0);const st=KSTATS[C.id];[['VEL',st.vel,12],['ACEL',st.acel,11],['MANEJO',st.man,10],['PESO',st.peso,8]].forEach(([l,val,cc],i)=>{const x0=[4,58,120,196][i];T(l,x0,H-12,6,1,0);for(let s2=0;s2<5;s2++)R(x0+(l.length*6)+3+s2*5,H-12,4,6,s2<val?cc:'#2A3050');});}
function drawTracks(t){bgGrad();hud('ELIGE LA PISTA','');KTRACKS.forEach((d,i)=>{const x=6+i*84,y=18,s=i===KG.trk;R(x,y,80,88,s?'#2A3A70':'#16203A');if(s)BOXL(x,y,80,88,Math.floor(t*6)%2?10:12);const T0=KG['tb'+i]||(KG['tb'+i]=buildTrack(d));const mm=KG['mm'+i]||(KG['mm'+i]=miniMap(T0,50));g.drawImage(mm.c,x+15,y+4);
  const NL=[['PASILLOS','DE LEGAL'],['DATACENTER','TURBO'],['AZOTEA DEL','DIRECTORIO']][i];T(NL[0],x+3,y+57,s?10:7,1,0);T(NL[1],x+3,y+66,s?10:7,1,0);for(let k=0;k<3;k++)kStar(x+6+k*8,y+80,k<d.diff?10:5);T(['FÁCIL','MEDIA','DIFÍCIL'][d.diff-1],x+30,y+77,6,1,0);});
 if(KG.mode!=='tt'){const dy=H-34,D=KDIFF[KG.diff];R(0,dy-2,W,16,'#0B1020');T('DIFICULTAD',6,dy+3,6,1,0);const bx=W/2-46;R(bx,dy,92,12,'#16203A');BOXL(bx,dy,92,12,[11,10,8][KG.diff]);TC('← '+D.n+' →',dy+3,[11,10,8][KG.diff],1,null,W/2);T(TOUCHUI?'TOCA PARA CAMBIAR':'↑ ↓ CAMBIA',W-6-TW(TOUCHUI?'TOCA PARA CAMBIAR':'↑ ↓ CAMBIA'),dy+3,5,1,0);BTNS.push({id:'diff',x:bx,y:dy,w:92,h:12});}
 R(0,H-18,W,18,'#0B1020');T('3 VUELTAS · '+DMC.length+' PILOTOS · ÍTEMS',4,H-14,7,1,0);T('← → · ENTER',W-4-TW('← → · ENTER'),H-14,6,1,0);}
function drawResults(t){bgGrad();hud('RESULTADOS · '+KTRACKS[KG.trk].n,KDIFF[KG.R.diff??1].n);const R0=KG.R;R0.order.forEach((k,i)=>{const y=15+i*13,me=k===KG.me;R(6,y,W-12,12,me?'#2A3A70':(k.remote?'#3A1A40':'#16203A'));T(ordinal(i+1),9,y+3,i===0?10:7,1,0);L8.portrait(k.C,34,y+1,11,11,1,1,52);T(k.C.n+(k.remote?' (ONLINE)':''),48,y+3,me?10:7,1,0);T(k.done?fmtK(k.time):'--',170,y+3,6,1,0);if(k.bestLap)T(fmtK(k.bestLap),214,y+3,5,1,0);});
 if(KG.mode==='cup'){R0.order.forEach((k,i)=>{T('+'+(KPTS[i]||0),236,15+i*13+3,11,1,0);});TC(Math.floor(t*2)%2?'ENTER: VER CLASIFICACIÓN':'',H-9,7,1,0);return;}
 TC(KG.net?(KG.net.role==='host'?(Math.floor(t*2)%2?'ENTER: REVANCHA · ESC: SALIR':''):'ESPERANDO AL ANFITRIÓN · ESC: SALIR'):(Math.floor(t*2)%2?'ENTER: REVANCHA · ESC: MENÚ':''),H-9,7,1,0);}
// ---------------- entrada ----------------
addEventListener('keydown',e=>{const k=e.code;KG.keys[k]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(k))e.preventDefault();if(e.repeat)return;audioInit();
 if(state==='title'&&(k==='Enter'||k==='Space')){state='menu';KG.mi=0;S.ok();}
 else if(state==='title'&&k==='Escape')ARCADE.back();
 else if(state==='menu'){if(k==='ArrowDown'){KG.mi=((KG.mi||0)+1)%6;S.move();}if(k==='ArrowUp'){KG.mi=((KG.mi||0)+5)%6;S.move();}if(k==='Enter'||k==='Space'){S.ok();kMenuGo(KG.mi||0);}if(k==='Escape')state='title';}
 else if(state==='cupintro'){if(k==='ArrowUp'||k==='ArrowDown'){KG.diff=(KG.diff+(k==='ArrowUp'?1:2))%3;S.move();}if(k==='Enter'||k==='Space'){S.ok();CUP.start();}if(k==='Escape')state='menu';}
 else if(state==='cupstand'){if(k==='Enter'||k==='Space'){S.ok();CUP.next();}}
 else if(state==='cupfinal'){if(k==='Enter'||k==='Escape'){state='menu';}}
 else if(state==='ttres'){if(k==='Enter'||k==='Space'){startRace();}if(k==='KeyR'){KG.rtrk=KG.trk;state='rank';}if(k==='Escape')state='menu';}
 else if(state==='rank'){if(k==='ArrowRight'){KG.rtrk=((KG.rtrk||0)+1)%3;S.move();}if(k==='ArrowLeft'){KG.rtrk=((KG.rtrk||0)+2)%3;S.move();}if(k==='Escape'||k==='Enter')state='menu';}
 else if(state==='online'||state==='room'){NETK.key(k);}
 else if(state==='select'){const NN=DMC.length;if(k==='ArrowRight')KG.sel=(KG.sel+1)%NN;if(k==='ArrowLeft')KG.sel=(KG.sel+NN-1)%NN;if(k==='ArrowDown')KG.sel=Math.min(NN-1,KG.sel+5);if(k==='ArrowUp')KG.sel=Math.max(0,KG.sel-5);if(k.startsWith('Arrow'))S.move();if(k==='Enter'||k==='Space'){if(KG.toLobby){KG.toLobby=false;state='online';NETK.lobby();}else state=KG.mode==='cup'?'cupintro':'tracks';S.ok();}if(k==='Escape')state='title';}
 else if(state==='tracks'){if(k==='ArrowUp'||k==='ArrowDown'){KG.diff=(KG.diff+(k==='ArrowUp'?1:2))%3;S.move();}if(k==='ArrowRight'){KG.trk=(KG.trk+1)%3;S.move();}if(k==='ArrowLeft'){KG.trk=(KG.trk+2)%3;S.move();}if(k==='Enter'||k==='Space'){S.ok();startRace();}if(k==='Escape')state='select';}
 else if(state==='race'){if(k==='Escape'||k==='KeyP'){KG.paused=!KG.paused;S.move();}else if(KG.paused&&k==='KeyQ'){KG.paused=false;engineOff();musicStop();if(KG.net){NETK.end();return;}KG.ren.domElement.style.display='none';state='tracks';}else if(k==='KeyZ'||k==='KeyE'||k==='ControlLeft'){KG.itemPress=true;}}
 else if(state==='netwait'){if(k==='Escape')NETK.end();}
 else if(state==='results'&&KG.mode==='cup'){if(k==='Enter'||k==='Space'){state='cupstand';S.ok();}}
 else if(state==='results'){if(KG.net){if(k==='Enter'&&KG.net.role==='host')NETK.rematch();if(k==='Escape')NETK.end();return;}if(k==='Enter'){startRace();}if(k==='Escape'){state='title';}}});
addEventListener('keyup',e=>{KG.keys[e.code]=false;});
function cvPos(e){const r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H];}
const KTOUCH={};cv.addEventListener('pointerdown',e=>{audioInit();const [x,y]=cvPos(e);if(state==='race'){const id=hitBtn(x,y);if(id==='ti'){KG.itemPress=true;return;}if(id){KTOUCH[e.pointerId]=id;KG[id]=true;}return;}
 if(state==='title'){state='menu';KG.mi=0;S.ok();return;}if(state==='menu'){const i=Math.floor((y-28)/15);if(i>=0&&i<6){KG.mi=i;S.ok();kMenuGo(i);}return;}if(state==='cupintro'){if(hitBtn(x,y)==='diff'){KG.diff=(KG.diff+1)%3;S.move();}else{S.ok();CUP.start();}return;}if(state==='cupstand'){CUP.next();return;}if(state==='cupfinal'){state='menu';return;}if(state==='ttres'){if(y<H-20)startRace();else state='menu';return;}if(state==='rank'){if(x<W/3){KG.rtrk=((KG.rtrk||0)+2)%3;}else if(x>W*2/3){KG.rtrk=((KG.rtrk||0)+1)%3;}else state='menu';return;}if(state==='online'||state==='room'){NETK.tap(x,y);return;}if(state==='select'){const i=Math.floor((x-4)/50)+(y>65?5:0);if(i>=0&&i<DMC.length&&x<254&&y<115){if(i===KG.sel){state=KG.toLobby?'online':(KG.mode==='cup'?'cupintro':'tracks');KG.toLobby=false;S.ok();}else{KG.sel=i;S.move();}}return;}
 if(state==='tracks'){if(hitBtn(x,y)==='diff'){KG.diff=(KG.diff+1)%3;S.move();return;}const i=Math.floor((x-6)/84);if(i>=0&&i<3){if(i===KG.trk){S.ok();startRace();}else{KG.trk=i;S.move();}}return;}if(state==='results'){if(y<H-20)startRace();else state='title';}});
for(const ev of ['pointerup','pointercancel'])cv.addEventListener(ev,e=>{const id=KTOUCH[e.pointerId];if(id){KG[id]=false;delete KTOUCH[e.pointerId];}});
// ---------------- bucle ----------------
let lastT=0;function kloop(now){requestAnimationFrame(kloop);try{kloopBody(now);}catch(e){console.error(e);if(NETK.m)NETK.end('ERROR EN LA PARTIDA ONLINE');}}
function kloopBody(now){const dt=Math.min(0.05,(now-lastT)/1000||0);lastT=now;KG.lastDt=dt;musicTick();const t=now/1000;BTNS=[];
 if(state==='title')drawTitle(t);else if(state==='menu')drawMenuK(t);else if(state==='cupintro')drawCupIntro(t);else if(state==='cupstand')drawCupStand(t,false);else if(state==='cupfinal')drawCupStand(t,true);else if(state==='ttres')drawTTRes(t);else if(state==='rank')drawRankK(t);else if(state==='online'||state==='room')NETK.draw(t);else if(state==='netwait'){bgGrad();TC('CONECTANDO CON EL ANFITRIÓN...',64,7);if(NETK.m){const o=NETK.other();const s=NETK.vS(o&&o.presence&&o.presence.s);if(s)NETK.guestStart(s);}}else if(state==='select')drawSelect(t);else if(state==='tracks')drawTracks(t);else if(state==='race'){raceUpdate(dt);if(state==='race')raceRender(t);else drawResults(t);}else if(state==='results'){drawResults(t);if(KG.net&&KG.net.role==='host'&&NETK.m){NETK.hostPre(dt);NETK.hostPost();}if(KG.net&&KG.net.role==='guest'&&NETK.m){const o=NETK.other();const s=NETK.vS(o&&o.presence&&o.presence.s);if(s&&s.r!==KG.raceId)NETK.guestStart(s);}}
}
window.__k={KG,get state(){return state},set state(v){state=v},startRace};
fit();requestAnimationFrame(kloop);cv.focus();

// ======================= DEATHKART · ONLINE CON SALAS (hasta 4 personas) =======================
const NETK={st:'off',room:null,user:null,uid:null,myPeer:null,peers:[],names:{},sel:0,msg:'',msgT:0,m:null,MAX:4,
 async init(){if(this.started){this.lobby();return;}this.started=true;try{if(!window.claude||!window.claude.use){this.st='off';return;}const [room,user]=await Promise.all([window.claude.use('room'),window.claude.use('user')]);if(!room||!user){this.st='off';return;}
  this.room=room;this.user=user;try{this.uid=await user.id();}catch(e){}this.st='on';
  room.onPeers(ch=>{this.peers=ch.peers;const me=ch.peers.find(p=>p.isMe);if(me)this.myPeer=me.peer;this.resolve();});this.lobby();}catch(e){this.st='off';}},
 say(t){this.msg=t;this.msgT=performance.now();},
 vS(s){s=ARCADE.cleanOnce(s);if(!s||typeof s!=='object')return null;const ok=id=>DMC.some(c=>c.id===id);if(!Number.isInteger(s.trk)||s.trk<0||s.trk>=KTRACKS.length)return null;if(s.diff!=null&&!(s.diff>=0&&s.diff<=2))return null;if(!Array.isArray(s.k)||!Array.isArray(s.o)||!Array.isArray(s.bx)||!Array.isArray(s.ro)||!s.ro.every(ok))return null;if(!s.asg||typeof s.asg!=='object'||!Object.values(s.asg).every(ok))return null;if(!s.k.every(Array.isArray)||!s.o.every(Array.isArray))return null;return s;},
 lobby(){if(!this.room)return;const m=this.m;const p={game:'kart',uid:this.uid||null,ch:DMC[KG.sel].id};if(m&&m.role==='host')Object.assign(p,{st:m.racing?'busy':'room',id:m.id,n:Object.keys(m.asg).length,trk:KG.trk});else p.st=m?'busy':'lobby';this.room.presence(p).catch(()=>{});},
 async resolve(){const ids=[...new Set(this.peers.map(p=>p.by||(p.presence&&p.presence.uid)).filter(Boolean))].filter(i=>!(i in this.names));if(!ids.length||!this.user)return;try{const ps=await this.user.profiles(ids);for(const i of ids)this.names[i]=((ps&&ps[i]&&ps[i].name)||'').toUpperCase();}catch(e){}},
 nameOf(p){const id=p&&(p.by||(p.presence&&(p.presence.uid||p.presence.u)));return (id&&this.names[id])||'COMPAÑERO';},
 rooms(){return this.peers.filter(p=>!p.isMe&&p.presence&&p.presence.game==='kart'&&p.presence.st==='room'&&(p.presence.n||1)<this.MAX);},
 online(){return this.peers.filter(p=>!p.isMe&&p.presence&&p.presence.game==='kart');},
 // ---- crear / unirse / salir
 async create(){if(this.m)return;const id=Math.random().toString(36).slice(2,9);const m={role:'host',id,mr:null,asg:{},names:{},racing:false,raceId:0,evQ:0,evBuf:[],evT:0,seenIt:{},gone:{}};this.m=m;
  try{m.mr=await this.room.join('dkr-'+id);}catch(e){this.m=null;this.say('NO SE PUDO CREAR LA SALA');return;}m.asg[this.myPeerIn()||'host']=DMC[KG.sel].id;this.wire();state='room';this.lobby();},
 async join(p){if(this.m)return;const m={role:'guest',id:p.presence.id,hostPeer:p.peer,mr:null,rx:performance.now(),cur:null,prev:null,curT:0,prevT:0,lastEvQ:-1,evIn:[],it:0,raceId:0,joinT:performance.now()};this.m=m;
  try{m.mr=await this.room.join('dkr-'+m.id);}catch(e){this.m=null;this.say('NO SE PUDO UNIR');return;}this.wire();m.mr.presence({p:{want:DMC[KG.sel].id,u:this.uid||null}}).catch(()=>{});KG.trk=p.presence.trk||0;state='room';this.lobby();},
 myPeerIn(){const m=this.m;const me=m&&m.mr&&m.mr.peers().find(p=>p.isMe);return me?me.peer:null;},
 wire(){const m=this.m;m.mr.on('ev',msg=>{if(msg.isMe||m.role!=='guest')return;{const d=ARCADE.clean(msg.data||{});for(const x of (Array.isArray(d.e)?d.e.slice(-40):[])){if(!Array.isArray(x)||!x[1]||typeof x[1]!=='object')continue;const [q,e]=x;if(typeof q==='number'&&q>m.lastEvQ){m.lastEvQ=q;m.evIn.push(e);}}if(m.evIn.length>120)m.evIn.splice(0,m.evIn.length-120);}});
  m.mr.on('ctl',msg=>{if(msg.isMe)return;const d=msg.data||{};if(d.close&&m.role==='guest')this.end('EL ANFITRIÓN CERRÓ LA SALA');});},
 end(msg){const m=this.m;if(m){this.m=null;try{if(m.role==='host')m.mr.emit('ctl',{close:true}).catch(()=>{});m.mr.leave().catch(()=>{});}catch(e){}}if(msg)this.say(msg);KG.net=null;KG.roster=null;KG.humans=null;try{engineOff();musicStop();}catch(e){}if(KG.ren)KG.ren.domElement.style.display='none';state='online';this.lobby();},
 // ---- anfitrión: asignar pilotos sin repetir y empezar
 hostSync(){const m=this.m;if(!m||m.role!=='host'||!m.mr)return;const ps=m.mr.peers();const me=ps.find(p=>p.isMe);const myKey=me?me.peer:'host';if(m.asg.host&&myKey!=='host'){m.asg[myKey]=m.asg.host;delete m.asg.host;}m.asg[myKey]=DMC[KG.sel].id;
  for(const k of Object.keys(m.asg))if(k!==myKey&&!ps.find(p=>p.peer===k)){if(!m.racing)delete m.asg[k];}
  for(const p of ps){if(p.isMe||m.asg[p.peer]||!p.presence||!p.presence.p)continue;if(Object.keys(m.asg).length>=this.MAX)continue;let want=p.presence.p.want;const used=new Set(Object.values(m.asg));if(used.has(want)||!DMC.some(c=>c.id===want))want=DMC.map(c=>c.id).find(id=>!used.has(id));m.asg[p.peer]=want;m.names[p.peer]=p.by||p.presence.p.u;}
  if(!m.racing)m.mr.presence({lobby:{asg:m.asg,trk:KG.trk,diff:KG.diff,names:m.names}}).catch(()=>{});this.lobby();},
 startRace_(){const m=this.m;if(!m||m.role!=='host')return;const humans=Object.values(m.asg);const me=DMC[KG.sel].id;KG.roster=[...shuffle(DMC.filter(c=>!humans.includes(c.id))).map(c=>c.id),...humans.filter(h=>h!==me),me];KG.humans=humans.filter(h=>h!==me);KG.net={role:'host'};KG.mode='online';m.racing=true;m.raceId++;KG.raceId=m.raceId;KG.endT=0;startRace();this.lobby();},
 rematch(){if(this.m&&this.m.role==='host')this.startRace_();},
 queue(evs){const m=this.m;if(!m)return;const R0=KG.R,ix=k=>R0.karts.indexOf(k);for(const e of evs){const o={t:e.t};for(const kk of ['x','z','lvl','how','it','kind','start','x0','z0','trick'])if(e[kk]!==undefined)o[kk]=typeof e[kk]==='number'?Math.round(e[kk]*100)/100:e[kk];if(e.k)o.k=ix(e.k);if(e.a)o.a=ix(e.a);if(e.b)o.b=ix(e.b);if(e.src)o.src=ix(e.src);m.evBuf.push([++m.evQ,o]);}if(m.evBuf.length>80)m.evBuf.splice(0,m.evBuf.length-80);},
 hostPre(dt){const m=this.m;if(!m||!m.mr)return;const R0=KG.R,ps=m.mr.peers();for(const [peer,ch] of Object.entries(m.asg)){const p=ps.find(q=>q.peer===peer);if(p&&p.isMe)continue;const k=R0.karts.find(q=>q.id===ch);if(!k)continue;
   if(!p){m.gone[peer]=(m.gone[peer]||0)+dt;if(m.gone[peer]>5&&!k.ai){k.ai={vmul:0.95,lane:0,seed:Math.random()*9,skill:0.7,driftT:0};k.remote=false;delete m.asg[peer];}continue;}m.gone[peer]=0;
   const pi=p.presence&&p.presence.i;if(!pi||pi.r!==m.raceId)continue;k.inp.steer=ARCADE.num(pi.s,-1,1,0);k.inp.acc=!!pi.a;k.inp.brake=!!pi.b;k.inp.drift=!!pi.d;if(m.seenIt[peer]==null)m.seenIt[peer]=pi.it;if(pi.it>m.seenIt[peer]){m.seenIt[peer]=pi.it;if(k.item&&!(k.roul>0))k.useItem=true;}}},
 hostPost(){const m=this.m;if(!m||!m.mr)return;const R0=KG.R,r2=v=>Math.round(v*100)/100;
  const snap={r:m.raceId,t:r2(R0.t),fin:R0.fin,trk:KG.trk,diff:KG.diff,ro:R0.karts.map(k=>k.id),asg:m.asg,
   k:R0.karts.map(k=>[r2(k.x),r2(k.z),r2(k.a),r2(k.va),r2(k.v),k.drift?r2(k.drift.t)*(k.drift.dir):0,r2(k.boost),k.boostLvl||0,r2(k.hop),r2(k.spin||0),r2(k.frozen||0),r2(k.shield||0),k.item||'',r2(k.roul||0),k.lap,k.place,k.done?1:0,r2(k.time||0),k.idx,r2(k.bestLap||0),r2(k.respawnT||0),r2(k.y||0),k.air?1:0]),
   o:R0.objs.slice(-14).map(o=>[o.type[0],o.kind||'',r2(o.x||(o.target&&o.target.x)||0),r2(o.z||(o.target&&o.target.z)||0),r2(o.arm||0),R0.karts.indexOf(o.target)]),bx:R0.T.boxes.map(b=>b.t>0?1:0),end:state==='results'?1:0};
  m.mr.presence({s:snap}).catch(()=>{});const now=performance.now();if(now-m.evT>90){m.evT=now;const fresh=m.evBuf.filter(([q])=>q>(m.sentQ||0)).slice(-30);if(fresh.length){m.sentQ=fresh[fresh.length-1][0];m.mr.emit('ev',{e:fresh}).catch(()=>{});}}},
 other(){const m=this.m;if(!m||!m.mr)return null;if(m.role==='guest')return m.mr.peers().find(p=>p.peer===m.hostPeer)||null;return m.mr.peers().find(p=>!p.isMe)||null;},
 // ---- invitado
 guestUpdate(dt){const m=this.m,RC=KG.R;if(!m)return;const now=performance.now();const o=this.other();const s=NETK.vS(o&&o.presence&&o.presence.s);
  if(s){m.rx=now;if(s!==m.cur){m.prev=m.cur;m.prevT=m.curT;m.cur=s;m.curT=now;}}else if(now-m.rx>8000){this.end('SE PERDIÓ LA CONEXIÓN CON EL ANFITRIÓN');return;}
  if(!m.cur)return;if(m.cur.r!==KG.raceId){this.guestStart(m.cur);return;}
  const S0=m.cur,P0=m.prev&&m.prev.r===S0.r?m.prev:null,iv=Math.max(20,(m.curT-m.prevT)||40),a=Math.min(1,(now-m.curT)/iv);
  RC.t=S0.t;RC.fin=S0.fin;RC.karts.forEach((k,i)=>{const q=S0.k[i];if(!q)return;const p=P0&&P0.k[i];const L=(j)=>p?p[j]+(q[j]-p[j])*a:q[j];k.x=L(0);k.z=L(1);k.a=p?p[2]+ANG(q[2],p[2])*a:q[2];k.va=q[3];k.v=q[4];k.drift=q[5]?{t:Math.abs(q[5]),dir:Math.sign(q[5])}:null;k.boost=q[6];k.boostLvl=q[7];k.hop=q[8];k.spin=q[9];k.frozen=q[10];k.shield=q[11];k.item=q[12]||null;k.roul=q[13];const lb=k.lap;k.lap=q[14];k.place=q[15];k.done=!!q[16];k.time=q[17];k.idx=q[18];k.bestLap=q[19];k.respawnT=q[20];k.y=L(21)||0;k.air=!!q[22];
   if(k===KG.me&&k.lap!==lb&&k.lap>=2&&k.lap<=RC.laps){KG.msg=k.lap===RC.laps?'¡ÚLTIMA VUELTA!':'VUELTA '+k.lap;KG.msgT=2;S.ok();}});
  RC.order=RC.karts.slice().sort((x,y)=>x.place-y.place);RC.T.boxes.forEach((b,i)=>{b.t=S0.bx[i]?1:0;});
  RC.objs=S0.o.map(q=>({type:q[0]==='p'?'proj':(q[0]==='t'?'trap':'rain'),kind:q[1],x:q[2],z:q[3],arm:q[4],target:RC.karts[q[5]]||RC.karts[0],a:0}));
  for(const e of m.evIn){const ev=Object.assign({},e);for(const kk of ['k','a','b','src'])if(e[kk]!==undefined)ev[kk]=RC.karts[e[kk]];RC.ev.push(ev);}m.evIn=[];
  const k=KG.me;if(RC.t<0){const sc=Math.ceil(-RC.t);if(sc!==KG.cd&&sc<=3){KG.cd=sc;blip(72,AT(),0.12);}}else if(KG.cd!==0){KG.cd=0;blip(84,AT(),0.14);blip(91,AT()+0.08,0.14);kMusic();}
  kEvents(RC,k);RC.ev.length=0;kContinuous(RC,k,dt);
  playerInput();const I=k.inp;if(k.useItem){k.useItem=false;m.it++;}m.mr.presence({p:{want:DMC[KG.sel].id,u:this.uid||null},i:{r:KG.raceId,s:I.steer,a:I.acc?1:0,b:I.brake?1:0,d:I.drift?1:0,it:m.it}}).catch(()=>{});
  if(S0.end&&!KG.endT){KG.endT=0.01;}if(KG.endT){KG.endT+=dt;if(KG.endT>0.8){state='results';engineOff();musicStop();KG.ren.domElement.style.display='none';}}},
 guestStart(s){const m=this.m;const me=this.myPeerIn();const ch=s.asg&&s.asg[me];if(!ch)return;KG.raceId=s.r;KG.trk=s.trk;KG.diff=s.diff??1;KG.roster=s.ro;KG.humans=Object.values(s.asg);KG.sel=DMC.findIndex(c=>c.id===ch);KG.net={role:'guest'};KG.mode='online';m.it=0;m.evIn=[];KG.endT=0;startRace();},
 // ---- pantallas
 key(k){if(state==='room')return this.roomKey(k);if(k==='Escape'){state='menu';return;}const L=this.listItems();
  if(k==='ArrowUp'){this.sel=Math.max(0,this.sel-1);S.move();}if(k==='ArrowDown'){this.sel=Math.min(L.length-1,this.sel+1);S.move();}if(k==='KeyP'){KG.toLobby=true;state='select';}
  if(k==='Enter'||k==='Space'){const it=L[this.sel];if(!it)return;if(it.create)this.create();else this.join(it.p);S.ok();}},
 listItems(){return [{create:true},...this.rooms().map(p=>({p}))];},
 roomKey(k){const m=this.m;if(!m)return;if(k==='Escape'){this.end();return;}if(m.role==='host'){if(k==='KeyT'){KG.trk=(KG.trk+1)%3;S.move();}if(k==='KeyY'){KG.diff=(KG.diff+1)%3;S.move();}if((k==='Enter'||k==='Space')&&Object.keys(m.asg).length>=2){S.ok();this.startRace_();}else if(k==='Enter')S.no();}},
 tap(x,y){if(state==='room'){const m=this.m;if(!m)return;if(y<14&&x<60){this.end();return;}if(m.role==='host'&&y>H-30){if(x<W/3){KG.trk=(KG.trk+1)%3;}else if(x>W*2/3){KG.diff=(KG.diff+1)%3;}else if(Object.keys(m.asg).length>=2)this.startRace_();}return;}
  if(y<14&&x<60){state='menu';return;}if(x<80&&y<100){KG.toLobby=true;state='select';return;}const i=Math.floor((y-24)/12),L=this.listItems();if(i>=0&&i<L.length){if(i===this.sel){const it=L[i];if(it.create)this.create();else this.join(it.p);}this.sel=i;S.move();}},
 draw(t){if(state==='room')return this.drawRoom(t);bgGrad();hud('ONLINE · SALAS (HASTA 4)','');if(this.st!=='on'){TC(this.started?'CONECTANDO...':'',60,7);if(this.started&&this.st==='off'){TC('EL ONLINE FUNCIONA SOLO EN EL LINK',56,7);TC('DE CLAUDE.AI CON TU SESIÓN.',68,7);}return;}
  const C=DMC[KG.sel];R(4,17,74,82,'#16203A');BOXL(4,17,74,82,12);g.drawImage(upperOf(C),0,0,64,48,7,22,68,51);TC('TU PILOTO',78,6,1,null,41);TC(C.n.split(' ')[0],87,10,1,null,41);TC('P: CAMBIAR',96,5,1,null,41);
  const L=this.listItems();this.sel=Math.max(0,Math.min(this.sel,L.length-1));L.slice(0,8).forEach((it,i)=>{const y=24+i*12,s=i===this.sel;R(82,y-2,170,11,s?1:'#121A30');if(it.create){T((s?'▶ ':'  ')+'+ CREAR UNA SALA',84,y,s?10:11);return;}const p=it.p;T((s?'▶ ':'  ')+('SALA DE '+this.nameOf(p)).slice(0,22),84,y,s?10:7);const lb=(p.presence.n||1)+'/'+this.MAX;T(lb,W-6-TW(lb),y,12);});
  if(L.length===1){T('NO HAY SALAS ABIERTAS.',84,40,6);T('CREA UNA Y QUE SE UNAN.',84,50,6);}
  R(0,H-24,W,24,'#0B1020');R(0,H-24,W,1,12);const msg=this.msg&&performance.now()-this.msgT<5000?this.msg:'↑ ↓ ELIGE · ENTER: CREAR O UNIRSE';TC(msg,H-20,7);TC('CONECTADOS CON DEATHKART ABIERTO: '+this.online().length,H-10,5);},
 drawRoom(t){const m=this.m;bgGrad();hud(m&&m.role==='host'?'TU SALA':'SALA','');if(!m)return;if(m.role==='host')this.hostSync();
  let asg=m.asg||{},names=m.names||{},trk=KG.trk,diff=KG.diff;if(m.role==='guest'){const o=this.other();const lb=ARCADE.cleanOnce(o&&o.presence&&(o.presence.lobby||(o.presence.s&&{asg:o.presence.s.asg,trk:o.presence.s.trk})));if(lb){asg=lb.asg&&typeof lb.asg==='object'?lb.asg:{};names=lb.names&&typeof lb.names==='object'?lb.names:{};trk=ARCADE.num(lb.trk,0,KTRACKS.length-1,0)|0;diff=ARCADE.num(lb.diff,0,2,1)|0;KG.trk=trk;}const s=NETK.vS(o&&o.presence&&o.presence.s);if(s&&s.r!==KG.raceId){this.guestStart(s);return;}if(!asg[this.myPeerIn()]&&performance.now()-m.joinT>4000&&Object.keys(asg).length>=this.MAX){this.end('LA SALA ESTÁ LLENA');return;}m.mr.presence({p:{want:DMC[KG.sel].id,u:this.uid||null}}).catch(()=>{});}
  const ps=m.mr?m.mr.peers():[];const ents=Object.entries(asg);{const ids=ps.map(p=>p.by||(p.presence&&p.presence.p&&p.presence.p.u)).filter(i=>i&&!(i in this.names));if(ids.length&&this.user&&!this._rs){this._rs=true;this.user.profiles(ids).then(r=>{for(const i of ids)this.names[i]=((r&&r[i]&&r[i].name)||'').toUpperCase();}).catch(()=>{}).finally(()=>{this._rs=false;});}}TC('PILOTOS ('+ents.length+'/'+this.MAX+')',17,10,1,0);
  ents.forEach(([peer,ch],i)=>{const C=DMC.find(c=>c.id===ch),x=8+i*62,y=28;R(x,y,58,62,'#16203A');BOXL(x,y,58,62,peer===this.myPeerIn()?10:12);if(C)g.drawImage(upperOf(C),0,0,64,48,x-3,y+2,64,48);const p=ps.find(q=>q.peer===peer);const nm=p?(p.isMe?'TÚ':this.nameOf(p)):(names[peer]&&this.names[names[peer]])||'COMPAÑERO';T(nm.slice(0,9),x+3,y+52,7,1,0);});
  for(let i=ents.length;i<this.MAX;i++){const x=8+i*62;R(x,28,58,62,'#0E1426');TC('LIBRE',56,5,1,null,x+29);}
  R(0,H-30,W,30,'#0B1020');T('PISTA: '+KTRACKS[trk].n,6,H-26,10);T('IA: '+KDIFF[diff].n,W-6-TW('IA: '+KDIFF[diff].n),H-26,[11,10,8][diff]);
  TC(m.role==='host'?(ents.length>=2?(Math.floor(t*3)%2?'ENTER: ¡A CORRER!':'T: PISTA · Y: DIFICULTAD'):'ESPERANDO... T: PISTA · Y: IA'):'ESPERANDO QUE EL ANFITRIÓN INICIE...',H-14,m.role==='host'&&ents.length>=2?10:7);}
};

// ======================= DEATHKART · COPA, CONTRARRELOJ Y RANKING =======================
const KPTS=[15,12,10,8,6,4,3,2,1];
const CUP={i:0,pts:{},roster:null,done:false,
 start(){this.i=0;this.pts={};this.roster=null;KG.trk=0;KG.roster=null;KG.humans=null;startRace();},
 tally(){const R=KG.R;if(R._cup)return;R._cup=true;R.order.forEach((k,i)=>{k.cupPts=KPTS[i]||0;this.pts[k.id]=(this.pts[k.id]||0)+k.cupPts;});this.roster=R.karts.map(k=>k.id);},
 next(){this.i++;if(this.i>=KTRACKS.length){state='cupfinal';S.win();return;}KG.trk=this.i;KG.roster=this.roster;KG.humans=null;startRace();},
 table(){return Object.entries(this.pts).sort((a,b)=>b[1]-a[1]);}};
const TT={db:null,user:null,me:null,rows:{},names:{},status:'off',rec:[],ghost:null,saved:'',
 async init(){if(this.started)return;this.started=true;try{if(!window.claude||!window.claude.use){this.status='off';return;}const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);if(!db||!user){this.status='off';return;}
  this.db=db;this.user=user;try{this.me=await user.id();}catch(e){}this.status='cargando';
  db.collection('tt').onSnapshot(s=>{this.rows={};for(const d of s.docs)if(d.exists)this.rows[d.id]=d.data();this.status='ok';this.names_();},()=>{this.status='err';});}catch(e){this.status='off';}},
 async names_(){const ids=Object.keys(this.rows).filter(i=>!(i in this.names));if(!ids.length||!this.user)return;try{const ps=await this.user.profiles(ids);for(const i of ids)this.names[i]=((ps&&ps[i]&&ps[i].name)||'').toUpperCase();}catch(e){}},
 tid(){return KTRACKS[KG.trk].id;},
 mine(){return (this.me&&this.rows[this.me]&&this.rows[this.me][this.tid()])||null;},
 table(trk,by){const id=KTRACKS[trk].id;return Object.entries(this.rows).filter(([u,r])=>r[id]&&r[id][by]).map(([u,r])=>Object.assign({u},r[id])).sort((a,b)=>a[by]-b[by]).slice(0,10);},
 async loadGhost(){this.ghost=null;if(!this.db)return;const tid=this.tid();let src=this.me;if(!(this.mine()&&this.mine().total)){const top=this.table(KG.trk,'total')[0];src=top?top.u:null;}if(!src)return;
  try{const s=await this.db.doc('ttg/'+src).get();if(s.exists){const d=(s.data()||{})[tid];if(d&&d.s&&d.s.length){this.ghost={ch:d.ch,s:d.s,dt:d.dt||0.05,own:src===this.me,name:src===this.me?'TU MEJOR TIEMPO':'RÉCORD: '+(this.names[src]||'COMPAÑERO')};if(state==='race'&&KG.mode==='tt')ghostSprite();}}}catch(e){}},
 sample(k,t){if(t<0||k.done)return;const n=Math.floor(t/0.05);if(n>=this.rec.length/4)this.rec.push(Math.round(k.x*10),Math.round(k.z*10),Math.round(k.a*100),Math.round((k.y||0)*10));},
 async finish(k){if(this._fin===KG.R)return;this._fin=KG.R;this.saved='';if(!this.db||!this.me){this.saved='off';return;}const tid=this.tid(),ref=this.db.doc('tt/'+this.me);let cur={};try{const s=await ref.get();if(s.exists)cur=s.data()||{};}catch(e){}
  const old=cur[tid]||{},better=!old.total||k.time<old.total,lapB=!old.lap||k.bestLap<old.lap;const n=Object.assign({},cur);n[tid]={lap:lapB?Math.round(k.bestLap*1000)/1000:old.lap,total:better?Math.round(k.time*1000)/1000:old.total,ch:better?k.id:(old.ch||k.id),at:Date.now()};
  try{await ref.set(n);this.saved=better?'record':(lapB?'vuelta':'ok');}catch(e){this.saved='no';return;}
  if(better){try{const gr=this.db.doc('ttg/'+this.me);let g={};try{const s=await gr.get();if(s.exists)g=s.data()||{};}catch(e){}g[tid]={ch:k.id,dt:0.05,s:this.rec.slice(0,12000)};await gr.set(g);}catch(e){}}}};
function ghostSprite(){const G=TT.ghost;if(!G||!KG.scene)return;if(KG.gsp){KG.scene.remove(KG.gsp);}const C=DMC.find(c=>c.id===G.ch)||DMC[0];const views=kartViews(C,upperOf(C)).map(c2=>{const t2=new THREE.CanvasTexture(c2);t2.magFilter=THREE.NearestFilter;return t2;});const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:views[0],transparent:true,opacity:0.45,color:0x9FE6FF}));sp.userData.views=views;sp.scale.set(3.4,2.55,1);KG.scene.add(sp);KG.gsp=sp;}
function ghostUpdate(c){const G=TT.ghost,sp=KG.gsp;if(!G||!sp)return;const t=KG.R.t;if(t<0){sp.visible=false;return;}const f=t/G.dt,i=Math.floor(f),u=f-i,s=G.s;if(i*4+7>=s.length){sp.visible=false;return;}sp.visible=true;const L=(o)=>(s[i*4+o]+(s[i*4+4+o]-s[i*4+o])*u);const x=L(0)/10,z=L(1)/10,a=s[i*4+2]/100,y=L(3)/10;sp.position.set(x,1.15+y,z);const cdir=Math.atan2(x-c.position.x,z-c.position.z);const vi=((Math.round(ANG(a,cdir)/(Math.PI/4))%8)+8)%8;if(sp.material.map!==sp.userData.views[vi]){sp.material.map=sp.userData.views[vi];sp.material.needsUpdate=true;}}
// ---------------- pantallas ----------------
function drawCupIntro(t){bgGrad();hud('COPA DE LA OFICINA','');TC('3 PISTAS SEGUIDAS · PUNTAJE ACUMULADO',20,10,1,0);KTRACKS.forEach((d,i)=>{const y=34+i*16;R(30,y-3,196,13,'#16203A');T((i+1)+'. '+d.n,36,y,7,1,0);for(let k=0;k<3;k++)kStar(196+k*8,y+3,k<d.diff?10:5);});
 TC('PUNTOS POR LUGAR: 15-12-10-8-6-4-3-2-1',88,6,1,0);const D=KDIFF[KG.diff],dy=100,bx=W/2-46;R(bx,dy,92,12,'#16203A');BOXL(bx,dy,92,12,[11,10,8][KG.diff]);TC('← '+D.n+' →',dy+3,[11,10,8][KG.diff],1,null,W/2);TC('↑ ↓ DIFICULTAD · ENTER: COMENZAR',H-12,7,1,0);BTNS.push({id:'diff',x:bx,y:dy,w:92,h:12});}
function drawCupStand(t,final){bgGrad();hud(final?'¡COPA TERMINADA!':'CLASIFICACIÓN · CARRERA '+(CUP.i+1)+'/3','');const tb=CUP.table();
 if(final){const pod=[[1,W/2-20,60],[0,W/2-60,70],[2,W/2+20,78]];const hts={0:44,1:34,2:26};for(const [rk,x,y] of [[0,W/2-20,56],[1,W/2-62,66],[2,W/2+22,74]]){const e=tb[rk];if(!e)continue;const C=DMC.find(c=>c.id===e[0]);R(x,y+22,40,H-30-(y+22),['#C9A227','#A8A8B8','#B8733A'][rk]);TC(String(rk+1),y+26,0,2,null,x+20);g.drawImage(upperOf(C),0,0,64,48,x-6,y-14,52,39);}
  const mePos=tb.findIndex(e=>e[0]===KG.me.id)+1;TC(mePos===1?'¡GANASTE LA COPA!':'TERMINASTE '+ordinal(mePos)+' DE '+tb.length,20,mePos===1?10:7,mePos===1?2:1,0);TC('ENTER: MENÚ',H-10,7,1,0);return;}
 tb.forEach(([id,p],i)=>{const y=16+i*13,C=DMC.find(c=>c.id===id),me=id===KG.me.id;R(10,y,W-20,12,me?'#2A3A70':'#16203A');T(ordinal(i+1),14,y+3,i===0?10:7,1,0);L8.portrait(C,40,y+1,10,10,1,1,52);T(C.n,54,y+3,me?10:7,1,0);const add=(KG.R.karts.find(k=>k.id===id)||{}).cupPts||0;T('+'+add,170,y+3,11,1,0);T(String(p),W-30,y+3,10,1,0);});
 TC(Math.floor(t*2)%2?'ENTER: SIGUIENTE CARRERA':'',H-9,7,1,0);}
function drawTTRes(t){bgGrad();hud('CONTRARRELOJ · '+KTRACKS[KG.trk].n,'');const k=KG.me;TC('TIEMPO TOTAL',20,6,1,0);TC(fmtK(k.time),30,10,2,0);(k.laps||[]).forEach((l,i)=>{T('VUELTA '+(i+1)+': '+fmtK(l),70,52+i*10,l===k.bestLap?11:7,1,0);});
 const msg={record:'¡NUEVO MEJOR TIEMPO! FANTASMA GUARDADO',vuelta:'¡NUEVA MEJOR VUELTA!',ok:'TIEMPO REGISTRADO',off:'RANKING SOLO EN EL LINK DE CLAUDE.AI',no:'NO SE PUDO GUARDAR'}[TT.saved]||'GUARDANDO...';TC(msg,86,TT.saved==='record'?10:7,1,0);
 const tb=TT.table(KG.trk,'lap');const pos=tb.findIndex(r=>r.u===TT.me)+1;if(pos)TC('PUESTO EN LA OFICINA (MEJOR VUELTA): '+pos+' DE '+tb.length,98,12,1,0);TC('ENTER: REINTENTAR · R: RANKING · ESC: MENÚ',H-10,7,1,0);}
function drawRankK(t){bgGrad();hud('RANKING DE LA OFICINA','');const trk=KG.rtrk||0;TC('← '+KTRACKS[trk].n+' →',17,10,1,0);if(TT.status!=='ok'){TC(TT.status==='cargando'?'CARGANDO...':'DISPONIBLE SOLO EN EL LINK DE CLAUDE.AI',60,7);return;}
 const tb=TT.table(trk,'lap');if(!tb.length){TC('AÚN NO HAY TIEMPOS EN ESTA PISTA.',60,7);TC('¡JUEGA EL CONTRARRELOJ!',72,6);}T('PILOTO',14,28,5);T('KART',96,28,5);T('VUELTA',156,28,5);T('TOTAL',214,28,5);
 tb.forEach((r,i)=>{const y=38+i*9,me=r.u===TT.me;if(me)R(8,y-1,W-16,9,1);T((i+1)+'. '+(TT.names[r.u]||'COMPAÑERO').slice(0,10),12,y,i===0?10:(me?12:7),1,0);const C=DMC.find(c=>c.id===r.ch);if(C)T(C.n.split(' ')[0].slice(0,8),96,y,6,1,0);T(fmtK(r.lap),156,y,i===0?10:7,1,0);T(r.total?fmtK(r.total):'--',214,y,6,1,0);});TC('ESC: VOLVER',H-9,6,1,0);}


// ---- DeathKart · ajustes del online para la versión independiente (salas por código o link)
(function(){if(typeof ARCADE_SA==='undefined')return;const SA=ARCADE_SA,NAMES=SA.NAMES,myUid=SA.myUid;
 const N=NETK;N.standalone=true;
 N.nameOf=function(p){const pp=p&&p.presence;const nm=pp&&((pp.p&&pp.p.nm)||pp.nm);if(nm)return ARCADE.nick(nm);if(p&&p.isMe)return NAMES[myUid]||'TÚ';return 'JUGADOR';};
 N.create=async function(){if(this.m)return;SA.ensureName();const id=SA.code();const m={role:'host',id,mr:null,asg:{},names:{},racing:false,raceId:0,evQ:0,evBuf:[],evT:0,seenIt:{},gone:{}};this.m=m;this.say('CREANDO SALA...');
  try{m.mr=await this.room.join('dkr-'+id,{host:true});}catch(e){this.m=null;this.say(String(e.message||'NO SE PUDO CREAR LA SALA').toUpperCase());return;}
  m.asg[this.myPeerIn()||'host']=DMC[KG.sel].id;m.mr.presence({nm:NAMES[myUid]});this.wire();state='room';try{history.replaceState(null,'','#sala='+id);}catch(e){}
  const ok=await SA.copy(SA.link('sala',id));this.say(ok?'LINK COPIADO: PÉGALO EN TEAMS':'COMPARTE EL CÓDIGO '+id.toUpperCase());};
 N.joinCode=async function(raw){if(this.m)return;const code=SA.validCode(raw);if(!code){this.say('CÓDIGO INVÁLIDO');return;}SA.ensureName();
  const m={role:'guest',id:code,hostPeer:'deathkart-'+code,mr:null,rx:performance.now(),cur:null,prev:null,curT:0,prevT:0,lastEvQ:-1,evIn:[],it:0,raceId:0,joinT:performance.now()};this.m=m;this.say('CONECTANDO...');
  try{m.mr=await this.room.join('dkr-'+code,{host:false});}catch(e){this.m=null;this.say(String(e.message||'NO SE PUDO UNIR').toUpperCase());try{history.replaceState(null,'',location.pathname);}catch(_){}return;}
  this.wire();m.mr.on('ctl',msg=>{if((msg.data||{}).full)this.end('LA SALA ESTÁ LLENA');});m.mr.presence({p:{want:DMC[KG.sel].id,u:myUid,nm:NAMES[myUid]}});state='room';};
 N.listItems=function(){return [{create:true},{code:true}];};
 const doItem=it=>{if(it.create)N.create();else if(it.code){let c='';try{c=prompt('Pega el link o escribe el código de la sala:','')||'';}catch(e){}if(c)N.joinCode(c);}};
 N.key=function(k){if(state==='room')return this.roomKey(k);if(k==='Escape'){state='menu';return;}if(k==='ArrowUp'||k==='ArrowDown'){this.sel=1-this.sel;S.move();}if(k==='KeyP'){KG.toLobby=true;state='select';}if(k==='Enter'||k==='Space'){doItem(this.listItems()[this.sel]);S.ok();}};
 const _roomKey=N.roomKey.bind(N);N.roomKey=function(k){if(k==='KeyL'&&this.m&&this.m.role==='host'){SA.copy(SA.link('sala',this.m.id)).then(ok=>this.say(ok?'LINK COPIADO':'CÓDIGO: '+this.m.id.toUpperCase()));return;}return _roomKey(k);};
 N.tap=function(x,y){if(state==='room'){const m=this.m;if(m&&m.role==='host'&&y>14&&y<28){this.roomKey('KeyL');return;}if(y<14&&x<60){this.end();return;}if(m&&m.role==='host'&&y>H-30){if(x<W/3)KG.trk=(KG.trk+1)%3;else if(x>W*2/3)KG.diff=(KG.diff+1)%3;else if(Object.keys(m.asg).length>=2)this.startRace_();}return;}
  if(y<14&&x<60){state='menu';return;}if(x<80&&y<100){KG.toLobby=true;state='select';return;}const i=Math.floor((y-27)/16);if(i>=0&&i<2){if(i===this.sel)doItem(this.listItems()[i]);this.sel=i;S.move();}};
 N.draw=function(t){if(state==='room')return this.drawRoomSA(t);bgGrad();hud('ONLINE · SALAS CON AMIGOS','');if(this.st!=='on'){TC('CONECTANDO...',60,7);return;}
  const C=DMC[KG.sel];R(4,17,74,82,'#16203A');BOXL(4,17,74,82,12);g.drawImage(upperOf(C),0,0,64,48,7,22,68,51);TC('TU PILOTO',78,6,1,null,41);TC(C.n.split(' ')[0],87,10,1,null,41);TC('P: CAMBIAR',96,5,1,null,41);
  ['+ CREAR UNA SALA','UNIRSE CON CÓDIGO O LINK'].forEach((l,i)=>{const y=30+i*16,s=i===this.sel;R(82,y-3,170,13,s?1:'#121A30');T((s?'▶ ':'  ')+l,86,y,s?10:7);});
  T('1. CREA LA SALA',86,66,6);T('2. EL LINK SE COPIA SOLO',86,76,6);T('3. PÉGALO EN TEAMS (HASTA 4)',86,86,6);
  R(0,H-24,W,24,'#0B1020');R(0,H-24,W,1,12);const msg=this.msg&&performance.now()-this.msgT<6000?this.msg:'↑ ↓ ELIGE · ENTER';TC(msg,H-18,7);TC('APODO: '+(NAMES[myUid]||'(SE PIDE AL ENTRAR)'),H-9,5);};
 N.drawRoomSA=function(t){this.drawRoom(t);const m=this.m;if(m&&m.role==='host'){R(0,15,W,12,'#0B1020');TC('CÓDIGO: '+m.id.toUpperCase()+' · L O TOCA: COPIAR LINK',18,10,1,0);}if(this.msg&&performance.now()-this.msgT<3500)TC(this.msg,100,11,1,0);};
 N.names=new Proxy({},{get:(t,k)=>k in t?t[k]:(typeof k==='string'?k:undefined),has:()=>true});
 const _hs=N.hostSync.bind(N);N.hostSync=function(){_hs();const m=this.m;if(!m||!m.mr)return;for(const p of m.mr.peers()){const nm=p.isMe?NAMES[myUid]:(p.presence&&p.presence.p&&p.presence.p.nm);if(nm&&m.asg[p.peer])m.names[p.peer]=ARCADE.nick(nm);}};
 // entrar directo si el link trae #sala=CODIGO
 const mm=(location.hash||'').match(/sala=([a-z0-9]{4,12})/i);if(mm)setTimeout(async()=>{await N.init();state='online';N.joinCode(mm[1]);},300);
})();
};

ARCADE.start();
