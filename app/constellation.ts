// A lightweight projected 3D point field connects the full page without another WebGL context.
export function startConstellation(reduced:()=>boolean){
 const canvas=document.createElement('canvas');canvas.className='constellation';canvas.setAttribute('aria-hidden','true');document.body.insertBefore(canvas,document.body.firstChild);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return ()=>{};}
 let width=innerWidth,height=innerHeight,raf=0,last=0,phase=0,px=.5,py=.5,visible=true;
 const points=Array.from({length:72},(_,i)=>{const y=1-i/71*2,r=Math.sqrt(1-y*y),a=i*2.39996;return [Math.cos(a)*r,y,Math.sin(a)*r];});
 function size(){width=innerWidth;height=innerHeight;canvas.width=width;canvas.height=height;}
 const move=(e:PointerEvent)=>{px=e.clientX/width;py=e.clientY/height;};
 const visibility=()=>{visible=!document.hidden;};window.addEventListener('resize',size);window.addEventListener('pointermove',move,{passive:true});document.addEventListener('visibilitychange',visibility);size();
 function draw(now:number){raf=requestAnimationFrame(draw);if(now-last<40||!visible)return;last=now;ctx!.clearRect(0,0,width,height);if(reduced())return;phase+=.003;const c=getComputedStyle(document.documentElement).getPropertyValue('--a');ctx!.strokeStyle=c;ctx!.fillStyle=c;
  const a=phase+scrollY*.00018,cosa=Math.cos(a),sina=Math.sin(a),scale=Math.min(width,height)*.48;
  const projected=points.map(([x,y,z])=>{const nx=x*cosa-z*sina,nz=x*sina+z*cosa,depth=3/(3+nz);return [width*.8+(nx+(px-.5)*.08)*scale*depth,height*.5+(y+(py-.5)*.08)*scale*depth,depth];});
  projected.forEach(([x,y,d],i)=>{ctx!.globalAlpha=.18*d;ctx!.beginPath();ctx!.arc(x,y,1.4*d,0,Math.PI*2);ctx!.fill();for(let j=i+1;j<projected.length;j++){const [x2,y2]=projected[j],dist=Math.hypot(x-x2,y-y2);if(dist<100){ctx!.globalAlpha=(1-dist/100)*.07;ctx!.beginPath();ctx!.moveTo(x,y);ctx!.lineTo(x2,y2);ctx!.stroke();}}});
 }raf=requestAnimationFrame(draw);
 return ()=>{cancelAnimationFrame(raf);canvas.remove();window.removeEventListener('resize',size);window.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',visibility);};
}
