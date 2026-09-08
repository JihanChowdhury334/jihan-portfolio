'use client';
import {useEffect} from 'react';
import {startScene} from './scene';
import {startConstellation} from './constellation';
export default function Effects(){
 useEffect(()=>{
  const root=document.documentElement,body=document.body;
  const abort=new AbortController(),signal=abort.signal;
  const motionQuery=matchMedia('(prefers-reduced-motion: reduce)'),pointerQuery=matchMedia('(pointer:fine)');
  let userPaused=false;try{userPaused=localStorage.getItem('jc-motion')==='paused';}catch{}
  const reduced=()=>motionQuery.matches||userPaused;
  const $=<T extends Element=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
  const all=<T extends Element=HTMLElement>(s:string)=>Array.from(document.querySelectorAll<T>(s));
  const theme=$<HTMLButtonElement>('#themeBtn'),dialog=$<HTMLDialogElement>('#lb');
  function themeLabel(){theme.setAttribute('aria-label',root.dataset.theme==='dark'?'Switch to light theme':'Switch to dark theme');}
  themeLabel();theme.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('jc-theme',root.dataset.theme);}catch{}themeLabel();},{signal});
  const pause=document.createElement('button');pause.className='motion-btn';pause.type='button';theme.parentNode!.insertBefore(pause,theme);
  function motionLabel(){root.dataset.motion=reduced()?'paused':'running';pause.textContent=reduced()?'Motion off':'Motion on';pause.setAttribute('aria-label',userPaused?'Resume animations':'Pause animations');pause.setAttribute('aria-pressed',String(userPaused));if(reduced())body.classList.remove('has-cur');all('.will-reveal').forEach(e=>e.classList.add('in'));}
  motionLabel();pause.addEventListener('click',()=>{userPaused=!userPaused;try{localStorage.setItem('jc-motion',userPaused?'paused':'running');}catch{}motionLabel();},{signal});motionQuery.addEventListener('change',motionLabel,{signal});
  let mx=0,my=0,rx=0,ry=0,hasPointer=false,frameId=0;
  const dot=$('#curDot'),ring=$('#curRing'),progress=$('#prog'),top=$('#top');
  function clearCursor(){body.classList.remove('has-cur','cur-lg');hasPointer=false;}
  window.addEventListener('pointermove',(e)=>{if(e.pointerType==='touch'||!pointerQuery.matches||reduced()||dialog.open)return;mx=e.clientX;my=e.clientY;if(!hasPointer){rx=mx;ry=my;hasPointer=true;}body.classList.add('has-cur');dot.style.transform=`translate3d(${mx}px,${my}px,0)`;},{passive:true,signal});
  document.addEventListener('pointerout',e=>{if(!e.relatedTarget)clearCursor();},{signal});window.addEventListener('blur',clearCursor,{signal});
  document.addEventListener('pointerover',e=>{const el=e.target as Element;body.classList.toggle('cur-lg',!!el.closest('a,button,summary,.shot img,.shots img'));},{signal});
  function cursorFrame(){if(hasPointer&&!reduced()&&!document.hidden){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;}frameId=requestAnimationFrame(cursorFrame);}cursorFrame();
  let scrollQueued=false;
  function updateScroll(){scrollQueued=false;const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;top.classList.toggle('stuck',scrollY>30);if(!reduced()){const t=Math.min(scrollY/innerHeight,1);$('#nm').style.translate=`0 ${t*24}px`;}}
  const onScroll=()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}};window.addEventListener('scroll',onScroll,{passive:true,signal});window.addEventListener('resize',onScroll,{signal});updateScroll();
  const reveal=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');reveal.unobserve(e.target);}});},{threshold:.06});
  all('.rv').forEach(el=>{if(!reduced()&&el.getBoundingClientRect().top>innerHeight){el.classList.add('will-reveal');el.classList.remove('in');}reveal.observe(el);});
  all<HTMLElement>('.mag').forEach(el=>{el.addEventListener('pointermove',e=>{if(reduced()||e.pointerType==='touch')return;const r=el.getBoundingClientRect();el.style.translate=`${(e.clientX-r.left-r.width/2)*.12}px ${(e.clientY-r.top-r.height/2)*.2}px`;},{signal});el.addEventListener('pointerleave',()=>{el.style.translate='0 0';},{signal});});
  all<HTMLElement>('.proj,.mini').forEach(el=>{el.addEventListener('pointermove',e=>{if(reduced()||e.pointerType==='touch')return;const r=el.getBoundingClientRect();el.style.setProperty('--px',`${e.clientX-r.left}px`);el.style.setProperty('--py',`${e.clientY-r.top}px`);},{signal});});
  all<HTMLElement>('.shot,.shots,.fig').forEach(el=>{el.addEventListener('pointermove',e=>{if(reduced()||e.pointerType==='touch')return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(1100px) rotateX(${-y*4}deg) rotateY(${x*4}deg)`;},{signal});el.addEventListener('pointerleave',()=>{el.style.transform='';},{signal});});
  const railLinks=all<HTMLAnchorElement>('.rail a');
  const railObserver=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)railLinks.forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('on',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});});},{rootMargin:'-15% 0px -65% 0px'});railLinks.forEach(a=>{const el=document.querySelector(a.hash);if(el)railObserver.observe(el);});
  const shots=all<HTMLImageElement>('.shot img,.shots img'),image=$<HTMLImageElement>('#lbImg');let index=0,returnFocus:HTMLElement|null=null;
  function show(n:number){index=(n+shots.length)%shots.length;image.src=shots[index].src;image.alt=shots[index].alt;$('#lbCap').textContent=shots[index].closest('figure')?.querySelector('figcaption')?.textContent||shots[index].alt;$('#lbNum').textContent=`${index+1} / ${shots.length}`;}
  function open(n:number){returnFocus=shots[n];show(n);dialog.showModal();body.style.overflow='hidden';clearCursor();$('#lbX').focus();}
  shots.forEach((img,n)=>{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','Enlarge: '+img.alt);img.addEventListener('click',()=>open(n),{signal});img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(n);}},{signal});});
  $('#lbX').addEventListener('click',()=>dialog.close(),{signal});$('#lbPrev').addEventListener('click',()=>show(index-1),{signal});$('#lbNext').addEventListener('click',()=>show(index+1),{signal});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}},{signal});dialog.addEventListener('click',e=>{if(e.target===dialog||(e.target as Element).classList.contains('lb-stage'))dialog.close();},{signal});
  dialog.addEventListener('close',()=>{body.style.overflow='';image.removeAttribute('src');clearCursor();returnFocus?.focus({preventScroll:true});},{signal});
  const cleanScene=startScene($<HTMLCanvasElement>('#field'),reduced);
  const cleanConstellation=startConstellation(reduced);
  if(!reduced()){all<HTMLElement>('.hero-eyebrow,.name,.lede,.hero-links').forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:900,delay:i*110,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));}
  return ()=>{abort.abort();cancelAnimationFrame(frameId);cleanScene();cleanConstellation();reveal.disconnect();railObserver.disconnect();pause.remove();body.style.overflow='';body.classList.remove('has-cur','cur-lg');if(dialog.open)dialog.close();};
 },[]);return null;
}
