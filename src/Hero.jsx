import { useEffect } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import "./Hero.css";

export default function Hero() {
  useEffect(() => {
    document.body.classList.add("hero-mode");
    let rafId = 0;

    // ======== YOUR ORIGINAL JS START (UNCHANGED LOGIC) ========

function makeFlagTex() {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('/images/brazil-flag.png');
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function makeDarkRioTex(cb){
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load('/images/rio.webp', (baseTexture) => {
    const c = document.createElement('canvas');
    c.width = 1920; c.height = 1080;
    const ctx = c.getContext('2d');
    const img = baseTexture.image;
    const w = c.width, h = c.height;
    const iAR = img.width / img.height, cAR = w / h;
    let sw, sh, sx, sy;
    if(iAR > cAR) { sh = h; sw = sh * iAR; sx = -(sw - w) / 2; sy = 0; }
    else { sw = w; sh = sw / iAR; sy = -(sh - h) / 2; sx = 0; }
    ctx.drawImage(img, sx, sy, sw, sh);
    ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0, 0, w, h);
    const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter; cb(tex);
  });
}

let W=window.innerWidth, H=window.innerHeight;
const canvas3d=document.getElementById('webgl-canvas');
const renderer=new THREE.WebGLRenderer({canvas:canvas3d,antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(W,H);
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const clock=new THREE.Clock();

const vert=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`;

// Trail stored as array of points passed to shader
// We metaball-blend N trail points — each contributes a soft field
// The tip is sharp (small radius), older points are wider and fade
// Organic noise warps the field so edges are never smooth
const frag=`
precision highp float;
uniform sampler2D uBase;
uniform sampler2D uReveal;
uniform vec2  uTrail[24];    // trail history, [0]=tip
uniform float uTrailR[24];   // radius per point
uniform float uTrailW[24];   // weight per point (fades toward tail)
uniform int   uTrailLen;
uniform float uTime;
uniform float uAspect;
varying vec2 vUv;

// Hash noise for organic warping
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  return noise(p)*0.5+noise(p*2.1+vec2(1.3,4.7))*0.25+noise(p*4.3+vec2(9.1,2.3))*0.125;
}

void main(){
  vec2 uv=vUv;
  float aspect=uAspect;

  // Warp UV with animated fbm noise — makes edges fluid and organic
  float warpAmt = 0.018 + 0.012*sin(uTime*0.4);
  vec2 warpUv = uv * vec2(aspect, 1.0) * 3.5 + vec2(uTime*0.07, uTime*0.05);
  float wx = fbm(warpUv);
  float wy = fbm(warpUv + vec2(5.2, 1.3));
  vec2 warp = vec2(wx - 0.5, wy - 0.5) * warpAmt;

  vec2 p = vec2(uv.x*aspect, uv.y) + warp;

  // Metaball field: sum influence of all trail points
  float field = 0.0;
  for(int i=0; i<24; i++){
    if(i >= uTrailLen) break;
    vec2 tp = vec2(uTrail[i].x * aspect, uTrail[i].y);
    float d = length(p - tp);
    float r = uTrailR[i];
    // Metaball falloff: weight / (d^2 + epsilon)
    field += uTrailW[i] * (r*r) / (d*d + 0.0001);
  }

  // Threshold the field — metaball iso-surface
  float threshold = 1.0;
  float blur = 0.35;
  float mask = smoothstep(threshold - blur, threshold + blur*0.3, field);

  // Glow just outside the surface
  float glow = smoothstep(threshold*0.4, threshold, field) * (1.0 - mask);
  vec4 glowCol = vec4(1.0,0.87,0.1,1.0) * glow * 0.5;

  vec4 base   = texture2D(uBase,   uv);
  vec4 reveal = texture2D(uReveal, uv);

  gl_FragColor = mix(base, reveal, mask) + glowCol;
}
`;

const TRAIL_LEN = 24;
const trailUVs   = new Array(TRAIL_LEN).fill(null).map(()=>new THREE.Vector2(2,2));
const trailR     = new Array(TRAIL_LEN).fill(0.0);
const trailW     = new Array(TRAIL_LEN).fill(0.0);

const uniforms={
  uBase:     {value:null},
  uReveal:   {value:makeFlagTex()},
  uTrail:    {value:trailUVs},
  uTrailR:   {value:trailR},
  uTrailW:   {value:trailW},
  uTrailLen: {value:0},
  uTime:     {value:0.0},
  uAspect:   {value:W/H},
};

const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),
  new THREE.ShaderMaterial({vertexShader:vert,fragmentShader:frag,uniforms}));
scene.add(mesh);
makeDarkRioTex(t=>{uniforms.uBase.value=t;});

// ── Trail history ──
// Store smoothed positions over time
const HIST = 60; // history buffer
const histX = new Array(HIST).fill(-2);
const histY = new Array(HIST).fill(0.5);
let histHead = 0;

// ── Mouse ──
let rawX=-2, rawY=0.5;
let smoothX=-2, smoothY=0.5;
let prevSX=-2, prevSY=0.5;
let speed=0, smoothSpeed=0;
const IDLE_HIDE_DELAY_MS = 3000;
let lastMoveAt = 0;
let revealFade = 0;

const onMouseMove=(e)=>{
  rawX=e.clientX/window.innerWidth;
  rawY=1-e.clientY/window.innerHeight;
  lastMoveAt=performance.now();
};
const onMouseLeave=()=>{ lastMoveAt=0; };
document.addEventListener('mousemove',onMouseMove);
document.addEventListener('mouseleave',onMouseLeave);

// ── Cursor canvas ──
const cursorCvs=document.getElementById('cursor-canvas');
cursorCvs.width=W; cursorCvs.height=H;
const ctx2=cursorCvs.getContext('2d');

function drawCursorTrail(){
  ctx2.clearRect(0,0,cursorCvs.width,cursorCvs.height);
  if(smoothX<-1 || revealFade < 0.01) return;

  // Draw the same metaball shape as an outline on 2D canvas
  // Sample grid is too slow; instead draw each trail circle as a stacked semi-transparent path
  ctx2.save();
  ctx2.globalCompositeOperation='source-over';

  for(let i=0;i<TRAIL_LEN;i++){
    const tv=trailUVs[i];
    if(tv.x<-1) continue;
    const px=tv.x*cursorCvs.width;
    const py=(1-tv.y)*cursorCvs.height;
    const r=trailR[i]*cursorCvs.height;
    const alpha=trailW[i]*0.18;
    if(alpha<0.01||r<1) continue;
    ctx2.beginPath();
    ctx2.arc(px,py,r,0,Math.PI*2);
    ctx2.strokeStyle=`rgba(255,223,0,${Math.min(alpha,0.22)})`;
    ctx2.lineWidth=1.2;
    ctx2.stroke();
  }

  // Sharp tip dot
  const tx2=smoothX*cursorCvs.width;
  const ty2=(1-smoothY)*cursorCvs.height;
  ctx2.beginPath(); ctx2.arc(tx2,ty2,3.5,0,Math.PI*2);
  ctx2.fillStyle=`rgba(255,223,0,${Math.min(0.95, revealFade)})`;
  ctx2.fill();
  ctx2.restore();
}

function lerp(a,b,t){return a+(b-a)*t;}

function animate(){
  rafId=requestAnimationFrame(animate);
  const t=clock.getElapsedTime();
  const isIdle=(performance.now()-lastMoveAt)>IDLE_HIDE_DELAY_MS;
  const revealTarget = isIdle ? 0 : 1;
  revealFade = lerp(revealFade, revealTarget, isIdle ? 0.055 : 0.2);

  // Smooth cursor
  smoothX=lerp(smoothX,rawX,0.16);
  smoothY=lerp(smoothY,rawY,0.16);

  // Velocity
  const dvx=(smoothX-prevSX)*(W/H), dvy=smoothY-prevSY;
  speed=Math.sqrt(dvx*dvx+dvy*dvy);
  smoothSpeed=lerp(smoothSpeed,speed,0.12);
  prevSX=smoothX; prevSY=smoothY;

  // Push to history every frame
  histX[histHead]=smoothX;
  histY[histHead]=smoothY;
  histHead=(histHead+1)%HIST;

  // Build trail array for shader:
  // Sample TRAIL_LEN evenly-spaced points from history
  // Tip = newest, tail = oldest sample
  const activeLen = (smoothX < -1 || revealFade < 0.02) ? 0 : TRAIL_LEN;
  uniforms.uTrailLen.value = activeLen;

  const tailPoints  = Math.max(6, Math.min(TRAIL_LEN, Math.round(6 + smoothSpeed * 400)));

  for(let i=0;i<TRAIL_LEN;i++){
    if(i >= activeLen){ trailW[i]=0; continue; }

    // t=0 → tip (newest), t=1 → tail (oldest)
    const frac = i / (TRAIL_LEN - 1);

    // Index into history buffer — tip=head-1, further back = older
    const offset = Math.floor(frac * tailPoints);
    const idx = ((histHead - 1 - offset) % HIST + HIST) % HIST;

    trailUVs[i].set(histX[idx], histY[idx]);

    // Radius: tiny at tip, grows toward tail, then shrinks at very end
    const rampUp   = Math.pow(frac, 0.5);           // grows fast
    const rampDown = 1.0 - Math.pow(frac, 3.5);      // fades tail end
    const baseR    = 0.1 + smoothSpeed * 0.38;
    trailR[i] = baseR * rampUp * rampDown * (0.4 + frac * 0.6);

    // Weight: strong at tip, fades toward tail
    trailW[i] = Math.pow(1.0 - frac, 0.6) * (0.9 + smoothSpeed * 3.5) * revealFade;
  }

  uniforms.uTrail.value  = trailUVs;
  uniforms.uTrailR.value = trailR;
  uniforms.uTrailW.value = trailW;
  uniforms.uTime.value   = t;

  drawCursorTrail();
  renderer.render(scene,camera);
}
animate();

const onResize=()=>{
  W=window.innerWidth;
  H=window.innerHeight;
  renderer.setSize(window.innerWidth,window.innerHeight);
  cursorCvs.width=window.innerWidth; cursorCvs.height=window.innerHeight;
  uniforms.uAspect.value=window.innerWidth/window.innerHeight;
};
window.addEventListener('resize',onResize);

    // ======== YOUR ORIGINAL JS END ========

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove',onMouseMove);
      document.removeEventListener('mouseleave',onMouseLeave);
      window.removeEventListener('resize',onResize);
      mesh.geometry.dispose();
      mesh.material.dispose();
      if (uniforms.uBase.value) uniforms.uBase.value.dispose();
      if (uniforms.uReveal.value) uniforms.uReveal.value.dispose();
      renderer.dispose();
      document.body.classList.remove("hero-mode");
    };
  }, []);

  return (
    <>
      <canvas id="webgl-canvas"></canvas>
      <canvas id="cursor-canvas"></canvas>

      <div className="corner-tl">Brasil · 2003-2022</div>

      <div className="hero-content">
        <div className="eyebrow">República Federativa do</div>
        <h1 className="hero-title">BRAZIL</h1>
      </div>

      <div className="cta-row">
        <Link to="/docs" className="btn">Documentation</Link>
        <Link to="/dashboard" className="btn">Dashboard</Link>
      </div>

      <div className="corner-br">
        22°57′S 43°10′W<br />Rio de Janeiro
      </div>
    </>
  );
}
