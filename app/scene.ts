// Original ray-marched sculpture: interlocking, twisted tori with a procedural studio environment.
// Geometry is evaluated in three dimensions; no image assets or third-party scene code are used.
export function startScene(canvas:HTMLCanvasElement, reduced:()=>boolean) {
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:'low-power'});
 if(!gl)return ()=>{};
 const vertex=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
 const fragment=`precision highp float;
 uniform vec2 res;uniform vec2 pointer;uniform float time;uniform float scroll;uniform float dark;
 mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
 float torus(vec3 p,float radius,float tube){return length(vec2(length(p.xz)-radius,p.y))-tube;}
 float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
 float map(vec3 p){
  p.xz=rot(time*.13+pointer.x*.45+scroll*.8)*p.xz;
  p.yz=rot(.58+pointer.y*.32+scroll*.2)*p.yz;
  p.xy=rot(.35+sin(time*.16)*.12)*p.xy;
  p.xz=rot(p.y*(.38+scroll*.2))*p.xz;
  float a=torus(p,1.04,.285);
  vec3 q=p;q.xy=rot(1.5708)*q.xy;
  float b=torus(q,1.04,.285);
  q=p;q.yz=rot(1.5708)*q.yz;
  float c=torus(q,1.04,.285);
  return smin(smin(a,b,.32),c,.32)+sin(p.x*8.+time*.5)*sin(p.y*8.)*sin(p.z*8.)*.013;
 }
 vec3 normal(vec3 p){vec2 e=vec2(.0015,0);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
 vec3 environment(vec3 r){
  vec3 col=mix(vec3(.13,.15,.14),vec3(.68,.73,.67),smoothstep(-.7,1.,r.y));
  float strip=pow(max(0.,1.-abs(r.x*.8+r.y*.2-.12)),45.);
  float soft=pow(max(dot(r,normalize(vec3(-1.,1.5,1.))),0.),14.);
  float lime=pow(max(dot(r,normalize(vec3(1.,.1,-1.))),0.),8.);
  col+=strip*vec3(1.8,1.95,1.7)+soft*vec3(2.1)+lime*vec3(.75,1.2,.08);
  col*=.5+.5*smoothstep(-.15,.2,r.z);
  return col;
 }
 void main(){
  vec2 uv=(gl_FragCoord.xy-.5*res)/res.y;
  vec3 ro=vec3(0.,0.,4.4+scroll*.3);vec3 rd=normalize(vec3(uv*2.8,-4.));
  float t=0.;float d=0.;bool hit=false;
  for(int i=0;i<76;i++){vec3 p=ro+rd*t;d=map(p);if(d<.0015){hit=true;break;}t+=d*.82;if(t>8.)break;}
  vec3 color=vec3(0.);float alpha=0.;
  if(hit){vec3 p=ro+rd*t;vec3 n=normal(p);vec3 r=reflect(rd,n);
   float fres=pow(1.-max(dot(n,-rd),0.),3.);
   float ao=clamp(map(p+n*.17)/.17,.1,1.);
   color=environment(r)*(.58+.42*ao);
   color=mix(color,color*vec3(.88,1.,.62),.22);
   color+=fres*vec3(.24,.34,.055);
   float seam=pow(.5+.5*sin((p.x+p.y+p.z)*28.+time*.3),28.);
   color+=seam*.018; color=color/(color+vec3(.72));color=pow(color,vec3(.85));
   alpha=1.;
  }else{
   float halo=exp(-length(uv)*3.2)*.16;
   float ring=1.-smoothstep(.001,.003,abs(length(uv*vec2(1.,1.7))-.65));
   color=mix(vec3(.3,.44,.09),vec3(.68,.9,.26),dark);alpha=halo+ring*.14;
  }
  gl_FragColor=vec4(color,alpha);
 }`;
 function shader(type:number,source:string){const s=gl!.createShader(type)!;gl!.shaderSource(s,source);gl!.compileShader(s);if(!gl!.getShaderParameter(s,gl!.COMPILE_STATUS)){console.warn('3D scene shader unavailable',gl!.getShaderInfoLog(s));gl!.deleteShader(s);return null;}return s;}
 const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
 if(!vs||!fs)return ()=>{};
 const program=gl.createProgram()!;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))return ()=>{};
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['res','pointer','time','scroll','dark'].map(k=>[k,gl.getUniformLocation(program,k)]));
 let mx=0,my=0,x=0,y=0,raf=0,visible=true,alive=true,last=0,elapsed=0,dirty=true;
 function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,innerWidth<700?1:1.35);canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));gl!.viewport(0,0,canvas.width,canvas.height);dirty=true;}
 function move(e:PointerEvent){mx=(e.clientX/innerWidth-.5)*2;my=-(e.clientY/innerHeight-.5)*2;}
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 const intersection=new IntersectionObserver(([e])=>{visible=e.isIntersecting;dirty=true;});intersection.observe(canvas);
 const themeObserver=new MutationObserver(()=>{dirty=true;});themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-motion']});
 function frame(now:number){if(!alive)return;raf=requestAnimationFrame(frame);const delta=Math.min(now-last,50);last=now;if(document.hidden||!visible)return;if(reduced()&&!dirty)return;if(!reduced()){elapsed+=delta/1000;x+=(mx-x)*.04;y+=(my-y)*.04;}
  gl!.useProgram(program);gl!.uniform2f(uniforms.res,canvas.width,canvas.height);gl!.uniform2f(uniforms.pointer,x,y);gl!.uniform1f(uniforms.time,reduced()?1.5:elapsed);gl!.uniform1f(uniforms.scroll,reduced()?0:Math.min(scrollY/innerHeight,2));gl!.uniform1f(uniforms.dark,document.documentElement.dataset.theme==='dark'?1:0);gl!.drawArrays(gl!.TRIANGLES,0,3);dirty=false;canvas.parentElement?.classList.add('has-webgl');
 }
 const lost=(e:Event)=>{e.preventDefault();alive=false;cancelAnimationFrame(raf);canvas.parentElement?.classList.remove('has-webgl');};
 canvas.addEventListener('webglcontextlost',lost);window.addEventListener('pointermove',move,{passive:true});resize();raf=requestAnimationFrame(frame);
 return ()=>{alive=false;cancelAnimationFrame(raf);observer.disconnect();intersection.disconnect();themeObserver.disconnect();window.removeEventListener('pointermove',move);canvas.removeEventListener('webglcontextlost',lost);canvas.parentElement?.classList.remove('has-webgl');gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);};
}
