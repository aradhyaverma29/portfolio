/**
 * ARADHYA VERMA — PORTFOLIO SCRIPT
 * Award-winning, 60 FPS Zero-Ghosting Canvas Character Renderer,
 * Custom Magnetic Cursor, and Smooth Scroll Interactions.
 * Plain Vanilla JavaScript — Zero Frameworks / Build Steps.
 */

const LINKEDIN_URL = "";

const CONTACT_VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const CONTACT_FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_grain;
uniform vec3  u_colors[4];
uniform vec3  u_bg;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float ratio = u_resolution.x / u_resolution.y;
  vec2 p = uv - 0.5;
  p.x *= ratio;

  float t = u_time * 0.1;

  float n1 = snoise(p * 0.4 + vec2(t * 0.2, -t * 0.3));
  float n2 = snoise(p * 0.55 + vec2(-t * 0.15, t * 0.25) + n1 * 0.25);
  float n3 = snoise(p * 0.75 + vec2(t * 0.1, -t * 0.2) + n2 * 0.2);

  vec3 col = u_bg;

  float dist = length(p) * 1.5;
  float vignette = 1.0 - smoothstep(0.3, 1.2, dist);

  col = mix(col, u_colors[0], smoothstep(-0.2, 0.5, n1) * 0.85);
  col = mix(col, u_colors[1], smoothstep(-0.1, 0.6, n2) * 0.7);
  col = mix(col, u_colors[2], smoothstep(-0.3, 0.4, n3) * 0.6);
  col = mix(col, u_colors[3], smoothstep(0.0, 0.7, n1 * n2) * 0.5);

  float glow = smoothstep(0.8, 0.0, dist) * 0.3;
  col += u_colors[1] * glow;

  col = mix(col * 0.2, col, vignette);

  float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453 + u_time);
  col += (grain - 0.5) * u_grain * 0.1;

  gl_FragColor = vec4(col, 1.0);
}
`;

document.addEventListener('DOMContentLoaded', () => {
  initLiquidNavbar();
  initCharacterCanvas();
  initMagneticCursor();
  initScrollReveal();
  initScrollStack();
  initGlassFolders();
  initExpandableCapabilityCards();
  initBeyondCardSwap();
  initPlaceholderLinks();
  try { initMoltenBackground(); } catch (error) { console.warn('Molten background unavailable.', error); }
  initContactSection();
});

function initMoltenBackground() {
  const zone = document.getElementById('molten-zone');
  if (!zone) return;
  const root = document.createElement('div');
  root.className = 'molten-bg';
  root.setAttribute('aria-hidden', 'true');
  const stage = document.createElement('div');
  stage.className = 'molten-bg__stage';
  root.appendChild(stage);
  zone.insertBefore(root, zone.firstChild);

  const config = { colors: ['--secondary', '--primary', '--soft'], coreColor: '--text', speed: 0.2, scale: 3.2, detail: 3, opacity: 0.78, dpr: 1 };
  const style = getComputedStyle(document.documentElement);
  const color = (name) => style.getPropertyValue(name).trim();
  const rgb = (value) => {
    const probe = document.createElement('canvas').getContext('2d');
    if (!probe) return [1, 1, 1];
    probe.fillStyle = color(value);
    const match = /\d+/g.exec(probe.fillStyle);
    if (probe.fillStyle.startsWith('#')) {
      const n = parseInt(probe.fillStyle.slice(1), 16);
      return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
    }
    const nums = probe.fillStyle.match(/[\d.]+/g);
    return nums ? nums.slice(0, 3).map((n) => Number(n) / 255) : [1, 1, 1];
  };
  const small = matchMedia('(max-width: 899px)').matches || matchMedia('(pointer: coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const settings = { palette: [...config.colors, config.coreColor].map(rgb), speed: config.speed, scale: config.scale, detail: small ? 2 : config.detail, opacity: config.opacity, dpr: small ? 0.75 : config.dpr, mouse: !small && !reduced, flare: !small && !reduced, reduced };
  const fallback = () => { root.classList.add('molten-bg-fallback'); stage.replaceChildren(); };
  const canvas = document.createElement('canvas');
  stage.appendChild(canvas);
  let gl;
  try { gl = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'high-performance' }); } catch (_) { gl = null; }
  if (!gl) { fallback(); return; }

  const vertex = `#version 300 es\nin vec2 aPosition; void main(){gl_Position=vec4(aPosition,0.,1.);}`;
  const fragment = `#version 300 es
precision highp float; uniform vec2 uResolution; uniform float uTime; uniform float uScale; uniform float uOpacity; uniform vec3 uColors[4]; uniform vec2 uMouse; uniform float uPresence; out vec4 outColor;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){vec2 uv=gl_FragCoord.xy/uResolution; vec2 p=(gl_FragCoord.xy-.5*uResolution)/uResolution.y; p*=uScale; float t=uTime; float d=0.; vec2 q=p; for(int i=0;i<4;i++){q=vec2(sin(q.y*1.7+t*.6)+cos(q.x*1.3-t*.4),sin(q.x*1.5-t*.35)+cos(q.y*1.8+t*.5))*.48+q*.42; d+=.018/max(.025,abs(length(q)-.72));} float m=exp(-dot((uv-uMouse)*vec2(uResolution.x/uResolution.y,1.),(uv-uMouse)*vec2(uResolution.x/uResolution.y,1.))*12.)*uPresence; d+=m*.08; float v=clamp(d*.12,0.,1.); vec3 c=mix(uColors[0],uColors[1],smoothstep(.15,.65,v)); c=mix(c,uColors[2],smoothstep(.55,.95,v)); c=mix(c,uColors[3],smoothstep(.82,1.,v)); float a=clamp(v*.8,0.,.75)*uOpacity; float grain=(hash(gl_FragCoord.xy+fract(t)*97.)-.5)*.025; outColor=vec4(max(c+grain,0.)*a,a);}`;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!vs || !fs || !program) { fallback(); return; }
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.bindAttribLocation(program, 0, 'aPosition'); gl.linkProgram(program); gl.deleteShader(vs); gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); fallback(); return; }
  const loc = Object.fromEntries(['uResolution','uTime','uScale','uOpacity','uColors','uMouse','uPresence'].map((n) => [n, gl.getUniformLocation(program, n)]));
  const vao = gl.createVertexArray(), buffer = gl.createBuffer();
  gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.useProgram(program);
  const palette = new Float32Array(12); settings.palette.forEach((c,i) => palette.set(c,i*3)); gl.uniform3fv(loc.uColors,palette); gl.uniform1f(loc.uScale,settings.scale); gl.uniform1f(loc.uOpacity,settings.opacity);
  const state = { w:1,h:1,t:0,last:0,raf:0,visible:false,mouse:[.5,.5],presence:0,inside:false };
  const resize = () => { const d=Math.min(devicePixelRatio||1,settings.dpr); state.w=Math.max(1,Math.round(stage.clientWidth*d)); state.h=Math.max(1,Math.round(stage.clientHeight*d)); if(canvas.width!==state.w||canvas.height!==state.h){canvas.width=state.w;canvas.height=state.h;} };
  const draw = () => { gl.viewport(0,0,state.w,state.h); gl.uniform2f(loc.uResolution,state.w,state.h); gl.uniform1f(loc.uTime,state.t); gl.uniform2f(loc.uMouse,state.mouse[0],1-state.mouse[1]); gl.uniform1f(loc.uPresence,state.presence); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES,0,3); };
  const tick = (now) => { state.raf=0; if(!state.visible||document.hidden)return; const dt=state.last?Math.min((now-state.last)/1000,.1):0; state.last=now; if(!settings.reduced)state.t+=dt*settings.speed; const target=settings.mouse&&state.inside?1:0; state.presence+=(target-state.presence)*(1-Math.exp(-dt/.25)); draw(); if(!settings.reduced||state.presence>.005)state.raf=requestAnimationFrame(tick); };
  const wake=()=>{if(state.visible&&!document.hidden&&!state.raf)state.raf=requestAnimationFrame(tick);};
  const io=new IntersectionObserver(([entry])=>{state.visible=entry.isIntersecting;if(state.visible){resize();draw();wake();}else{cancelAnimationFrame(state.raf);state.raf=0;}},{rootMargin:'100px'}); io.observe(root);
  const ro=new ResizeObserver(()=>{resize();wake();}); ro.observe(stage); resize();
  const local=(e)=>{const r=root.getBoundingClientRect();state.inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;if(state.inside)state.mouse=[(e.clientX-r.left)/Math.max(1,r.width),(e.clientY-r.top)/Math.max(1,r.height)];wake();};
  const down=(e)=>{if(!settings.flare||e.button!==0||e.target.closest('a,button,input,textarea,select,label,[role="button"]'))return;local(e);wake();};
  const leave=()=>{state.inside=false;wake();};
  window.addEventListener('pointermove',local,{passive:true}); window.addEventListener('pointerdown',down); document.documentElement.addEventListener('pointerleave',leave);
  document.addEventListener('visibilitychange',wake);
  canvas.addEventListener('webglcontextlost',(e)=>{e.preventDefault();cancelAnimationFrame(state.raf);io.disconnect();ro.disconnect();window.removeEventListener('pointermove',local);window.removeEventListener('pointerdown',down);document.documentElement.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',wake);gl.deleteProgram(program);gl.deleteBuffer(buffer);gl.deleteVertexArray(vao);fallback();});
  if(settings.reduced){state.t=.4;draw();}
}

function initScrollStack() {
  const root = document.querySelector('#projects .projects-list');
  if (!root || root.dataset.scrollStackReady === 'true') return;
  root.dataset.scrollStackReady = 'true';
  const config = { itemDistance: 80, itemStackDistance: 28, stackPosition: '16%', itemScale: 0.05, baseScale: 0.85, dimAmount: 0.25, blurAmount: 0, tiltAmount: 0, rotationAmount: 0, holdDistance: 160 };
  const widthQuery = window.matchMedia('(min-width: 900px)');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('#projects .section-header');
  const originalNodes = Array.from(root.childNodes);
  const items = originalNodes.filter((node) => node.nodeType === Node.ELEMENT_NODE && node.matches('.project-card'));
  if (!items.length) { delete root.dataset.scrollStackReady; return; }

  let active = false;
  let frame = 0;
  let observer = null;
  let cache = null;
  let inner = null;
  let end = null;
  let scrollHandler = null;
  let resizeHandler = null;
  let schedule = null;

  const resolveOffset = (value, size) => {
    if (typeof value === 'number') return value;
    const text = String(value).trim();
    if (text.endsWith('%')) return (parseFloat(text) / 100) * size;
    return parseFloat(text) || 0;
  };
  const toLength = (value) => typeof value === 'number' ? `${value}px` : value;
  const write = (key, value, apply) => {
    if (cache.get(key) === value) return false;
    cache.set(key, value);
    apply(value);
    return true;
  };

  const setup = () => {
    if (active || !widthQuery.matches || motionQuery.matches) return;
    active = true;
    cache = new Map();
    root.classList.add('scroll-stack', 'scroll-stack--window', 'is-stacked');
    inner = document.createElement('div');
    inner.className = 'scroll-stack__inner';

    items.forEach((item, index) => {
      if (index > 0) {
        const gap = config.itemDistance - (items.length - index) * config.itemStackDistance;
        const spacer = document.createElement('div');
        spacer.setAttribute('aria-hidden', 'true');
        spacer.style.height = `${Math.max(0, gap)}px`;
        spacer.style.marginTop = `${Math.min(0, gap)}px`;
        inner.appendChild(spacer);
      }
      const slot = document.createElement('div');
      slot.className = 'scroll-stack__slot';
      slot.setAttribute('data-stack-slot', '');
      slot.style.top = `calc(${toLength(config.stackPosition)} + ${index * config.itemStackDistance}px)`;
      slot.style.marginBottom = `${(items.length - 1 - index) * config.itemStackDistance}px`;
      slot.style.zIndex = String(index + 1);

      const card = document.createElement('div');
      card.className = 'scroll-stack-card';
      const shade = document.createElement('span');
      shade.className = 'scroll-stack-card__shade';
      shade.setAttribute('aria-hidden', 'true');
      card.append(item, shade);
      slot.appendChild(card);
      inner.appendChild(slot);
    });

    end = document.createElement('div');
    end.className = 'scroll-stack__end';
    end.setAttribute('aria-hidden', 'true');
    inner.appendChild(end);
    root.replaceChildren(inner);

    const update = () => {
      frame = 0;
      if (!active || !inner || !end) return;
      const slots = Array.from(inner.children).filter((child) => child.hasAttribute('data-stack-slot'));
      if (!slots.length) return;
      const viewHeight = window.innerHeight;
      const stackTop = resolveOffset(config.stackPosition, viewHeight);
      const offset = config.itemStackDistance;
      const heights = slots.map((slot) => slot.offsetHeight);
      const tops = slots.map((slot) => slot.getBoundingClientRect().top);
      const lastPin = stackTop + (slots.length - 1) * offset;
      const padTop = 0;
      const endHeight = config.holdDistance;
      let moved = write('padTop', padTop, (value) => { inner.style.paddingTop = `${value}px`; });
      moved = write('endHeight', endHeight, (value) => { end.style.height = `${value}px`; }) || moved;
      const depths = slots.map(() => 0);
      let lastCover = 0;
      for (let j = 1; j < slots.length; j += 1) {
        const pinBefore = stackTop + (j - 1) * offset;
        const start = pinBefore + heights[j - 1];
        const span = Math.max(1, start - pinBefore - offset);
        const cover = Math.min(1, Math.max(0, (start - tops[j]) / span));
        for (let i = 0; i < j; i += 1) depths[i] += cover;
        lastCover = cover;
      }
      void lastPin;
      void lastCover;

      const dimStep = Math.min(Math.max(config.dimAmount, 0), 1);
      slots.forEach((slot, index) => {
        const card = slot.firstElementChild;
        if (!card) return;
        const depth = depths[index];
        const lean = Math.min(depth, 1);
        const scale = Math.max(Math.min(config.baseScale, 1), 1 - depth * config.itemScale);
        const tilt = -lean * config.tiltAmount;
        const turn = lean * config.rotationAmount * (index % 2 ? -1 : 1);
        const blur = depth * config.blurAmount;
        const dim = 1 - Math.pow(1 - dimStep, depth);
        const transform = depth < 0.0005 ? '' : `perspective(1200px) rotateX(${tilt.toFixed(2)}deg) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        write(`transform${index}`, transform, (value) => { card.style.transform = value; });
        write(`filter${index}`, blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : '', (value) => { card.style.filter = value; });
        write(`dim${index}`, dim.toFixed(3), (value) => { card.style.setProperty('--scroll-stack-dim', value); });
      });
      if (moved) schedule();
    };
    schedule = () => {
      if (!active || frame) return;
      frame = window.requestAnimationFrame(update);
    };
    scrollHandler = schedule;
    resizeHandler = schedule;
    observer = 'ResizeObserver' in window ? new ResizeObserver(schedule) : null;
    observer?.observe(root);
    observer?.observe(inner);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', resizeHandler);
    schedule();
  };

  const teardown = () => {
    if (!active) return;
    active = false;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    observer?.disconnect();
    observer = null;
    window.removeEventListener('scroll', scrollHandler);
    window.removeEventListener('resize', resizeHandler);
    scrollHandler = null;
    resizeHandler = null;
    schedule = null;
    inner = null;
    end = null;
    root.replaceChildren();
    originalNodes.forEach((node) => root.appendChild(node));
    root.classList.remove('scroll-stack', 'scroll-stack--window', 'is-stacked');
    cache = null;
  };

  const sync = () => {
    if (widthQuery.matches && !motionQuery.matches) setup();
    else teardown();
  };
  if (header && !header.querySelector('.scroll-stack__hint')) {
    const hint = document.createElement('p');
    hint.className = 'scroll-stack__hint';
    hint.textContent = 'Scroll to explore the projects; each card stacks as the next arrives.';
    header.appendChild(hint);
  }
  const listen = (query) => {
    if (query.addEventListener) query.addEventListener('change', sync);
    else query.addListener(sync);
  };
  listen(widthQuery);
  listen(motionQuery);
  sync();
}

function initContactSection() {
  const section = document.getElementById('contact');
  const canvas = section && section.querySelector('.contact-bg');
  if (!section || !canvas) return;

  if (LINKEDIN_URL) {
    const linkedin = section.querySelector('.contact-linkedin');
    linkedin.href = LINKEDIN_URL;
    linkedin.hidden = false;
  }

  const copyButton = section.querySelector('#copy-email');
  const status = section.querySelector('#copy-status');
  const email = 'emailtoaradhya29@gmail.com';
  const copyWithFallback = () => {
    const field = document.createElement('textarea');
    field.value = email;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    if (!copied) throw new Error('Clipboard copy failed');
  };
  let copiedTimer;
  copyButton.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(email); }
        catch (_) { copyWithFallback(); }
      } else {
        copyWithFallback();
      }
      copyButton.textContent = 'Copied';
      status.textContent = 'Email address copied to clipboard.';
      window.clearTimeout(copiedTimer);
      copiedTimer = window.setTimeout(() => { copyButton.textContent = 'Copy email'; }, 2000);
    } catch (error) {
      status.textContent = 'Could not copy the email address. Please use Say hello instead.';
    }
  });

  const staticBackground = () => { section.classList.add('contact-bg-fallback'); };
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) { staticBackground(); return; }

  const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Contact background shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };
  const vertexShader = compileShader(gl.VERTEX_SHADER, CONTACT_VERTEX_SHADER);
  const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  const fragmentSource = precision && precision.precision > 0
    ? CONTACT_FRAGMENT_SHADER
    : CONTACT_FRAGMENT_SHADER.replace('precision highp float;', 'precision mediump float;');
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) { staticBackground(); return; }

  const program = gl.createProgram();
  if (!program) { staticBackground(); return; }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Contact background program link error:', gl.getProgramInfoLog(program));
    staticBackground();
    return;
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = {
    resolution: gl.getUniformLocation(program, 'u_resolution'),
    time: gl.getUniformLocation(program, 'u_time'),
    grain: gl.getUniformLocation(program, 'u_grain'),
    colors: gl.getUniformLocation(program, 'u_colors[0]'),
    bg: gl.getUniformLocation(program, 'u_bg')
  };
  const hexRgb = (hex) => [0, 2, 4].map((index) => parseInt(hex.slice(index + 1, index + 3), 16) / 255);
  const palette = ['#641E2B', '#9E3948', '#D7A5A1', '#30151C'].flatMap(hexRgb);
  const bg = hexRgb('#30151C');
  const paletteUniform = new Float32Array(palette);
  const bgUniform = new Float32Array(bg);
  let frame = 0;
  let active = false;
  let inView = false;
  let destroyed = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = () => Math.min(window.devicePixelRatio || 1, window.matchMedia('(max-width: 600px)').matches ? 1.5 : 2);
  const resize = () => {
    const ratio = dpr();
    const width = Math.max(1, Math.round(section.clientWidth * ratio));
    const height = Math.max(1, Math.round(section.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    if (reducedMotion) draw(0);
  };
  const draw = (time) => {
    if (destroyed || gl.isContextLost()) return;
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, time * 0.001 * 2.0);
    gl.uniform1f(uniforms.grain, 0.3);
    gl.uniform3fv(uniforms.colors, paletteUniform);
    gl.uniform3fv(uniforms.bg, bgUniform);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const render = (time) => { if (!active || reducedMotion || destroyed) return; draw(time); frame = requestAnimationFrame(render); };
  const sync = () => {
    const shouldRun = inView && !document.hidden && !reducedMotion && !destroyed;
    if (shouldRun && !active) { active = true; frame = requestAnimationFrame(render); }
    else if (!shouldRun && active) { active = false; cancelAnimationFrame(frame); }
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(section);
  resize();
  const visibilityObserver = new IntersectionObserver((entries) => { inView = entries.some((entry) => entry.isIntersecting); sync(); });
  visibilityObserver.observe(section);
  document.addEventListener('visibilitychange', sync);
  canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); active = false; cancelAnimationFrame(frame); staticBackground(); });
  window.addEventListener('pagehide', () => {
    destroyed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange', sync);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  }, { once: true });
  if (reducedMotion) draw(0);
  else sync();
}

/* ==========================================================================
   1. ZERO-GHOSTING 60 FPS CANVAS CHARACTER RENDERER (Discrete Pose Mapping)
   ========================================================================== */
function initCharacterCanvas() {
  const canvas = document.getElementById('character-canvas');
  const loader = document.getElementById('canvas-loader');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const FRAME_DIR = 'assets/frames/';
  const HERO_BG_COLOR = '#321216';

  // Source image natural dimensions after horizontal black-bar crop (x in [147, 1132))
  const IMG_W = 985;
  const IMG_H = 720;
  // Character face position in cropped source frame
  const FACE_SRC_X = 490.0;
  const FACE_SRC_Y = 310.0;

  // 64 evenly spaced frames: index 0 is UP; indices increase clockwise.
  let posesList = Array.from({ length: 64 }, (_, index) => ({
    file: `frame_${String(index).padStart(2, '0')}.webp`,
    angle: index * (360 / 64),
    label: `FRAME ${String(index).padStart(2, '0')}`
  }));
  let centerFrame = null;
  let loadedCount = 0;
  let totalToLoad = 0;

  // Animation & tracking state
  let isReady = false;
  let isTabVisible = true;
  let currentAngle = 0; // radians: 0 = UP, clockwise
  let targetAngle = 0;
  let inDeadzone = true; // start with direct eye contact
  let lastDrawnKey = null; // Key: 'center' or pose file name
  let animationFrameId = null;

  // Screen layout metrics (computed on resize)
  let canvasW = 0;
  let canvasH = 0;
  let drawX = 0;
  let drawY = 0;
  let drawW = 0;
  let drawH = 0;
  let faceScreenX = 0;
  let faceScreenY = 0;
  let shorterSide = 0;
  let deadzoneEnter = 0;
  let deadzoneExit = 0;
  let needsRedraw = true;

  // Cursor & touch positions
  let pointerX = -1000;
  let pointerY = -1000;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  let isTouching = false;
  let lastInteractionTime = performance.now();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Preload all 64 directional frames and the neutral eye-contact frame.
  function initLoad() {
    preloadImages();
  }

  function preloadImages() {
    totalToLoad = posesList.length + 1; // poses + center neutral
    loadedCount = 0;

    function onImageLoaded() {
      loadedCount++;
      if (loadedCount >= totalToLoad) {
        onAllLoaded();
      }
    }

    // Load center neutral frame
    centerFrame = new Image();
    centerFrame.onload = onImageLoaded;
    centerFrame.onerror = onImageLoaded;
    centerFrame.src = `${FRAME_DIR}center.webp`;

    // Load discrete pose frames
    posesList.forEach((pose) => {
      const img = new Image();
      img.onload = onImageLoaded;
      img.onerror = onImageLoaded;
      img.src = `${FRAME_DIR}${pose.file}`;
      pose.img = img;
    });
  }

  function onAllLoaded() {
    isReady = true;
    updateLayout();

    // Start with Center eye contact
    inDeadzone = true;
    currentAngle = 0;
    targetAngle = 0;

    // Fade out loader, fade in canvas
    if (loader) {
      loader.classList.add('is-hidden');
    }
    canvas.classList.add('is-ready');

    // Force initial clean paint
    renderFrame();

    // Launch 60 FPS requestAnimationFrame loop
    if (!prefersReducedMotion) {
      startLoop();
    }
  }

  // 2. High-DPI Canvas Resize with Contain Math & Desktop/Mobile Layout
  function updateLayout() {
    const rect = canvas.getBoundingClientRect();
    canvasW = rect.width;
    canvasH = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    canvas.width = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isMobilePortrait = window.innerWidth <= 768 && canvasH > canvasW;

    if (!isMobilePortrait) {
      // Desktop / Landscape:
      // Contain character by height (100svh) so full head, hair and shoulders are always visible. Never crop.
      let scale = canvasH / IMG_H;
      drawH = canvasH;
      drawW = IMG_W * scale;

      // If drawW exceeds canvasW, scale down to fit canvasW
      if (drawW > canvasW) {
        scale = canvasW / IMG_W;
        drawW = canvasW;
        drawH = IMG_H * scale;
        drawX = (canvasW - drawW) / 2;
        drawY = (canvasH - drawH) / 2;
      } else {
        // Place character slightly right of center, leaving generous free space on the left for text
        const remainingW = canvasW - drawW;
        drawX = Math.round(remainingW * 0.72);
        drawY = 0;
      }
    } else {
      // Mobile Portrait:
      // Character at ~115% screen width, centered (sides clip slightly, face/head never clipped).
      // Anchored to top of canvas — shoulders extend down behind text overlay.
      // CSS mask-image on .character-canvas handles the bottom fade seamlessly.
      const mobileScale = (canvasW * 1.15) / IMG_W;
      drawW = IMG_W * mobileScale;
      drawH = IMG_H * mobileScale;
      // Center horizontally: left/right sides may clip equally
      drawX = Math.round((canvasW - drawW) / 2);
      // Anchor to top — no vertical gap above head
      drawY = 0;
    }

    // Face-center point in cursor-tracking math tied directly to the actual drawn rectangle
    faceScreenX = drawX + (FACE_SRC_X / IMG_W) * drawW;
    faceScreenY = drawY + (FACE_SRC_Y / IMG_H) * drawH;

    // Deadzone: 12% enter, 14% exit tied to the drawn frame size (never full screen)
    shorterSide = Math.min(canvasW, canvasH);
    deadzoneEnter = 0.12 * shorterSide;
    deadzoneExit = 0.14 * shorterSide;

    // If pointer not yet introduced, default near face for initial direct eye contact
    if (pointerX < 0) {
      pointerX = faceScreenX;
      pointerY = faceScreenY;
    }

    needsRedraw = true;
    lastDrawnKey = null; // force fresh repaint on layout resize
  }

  window.addEventListener('resize', () => {
    updateLayout();
    if (!animationFrameId) renderFrame();
  }, { passive: true });

  // 3. Shortest-Path Circular Angular Lerp
  function lerpAngle(current, target, factor) {
    let diff = target - current;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    return current + diff * factor;
  }

  // Circular angular distance helper (in degrees)
  function circularAngularDist(deg1, deg2) {
    const diff = Math.abs(deg1 - deg2) % 360;
    return Math.min(diff, 360 - diff);
  }

  // Find closest discrete pose by circular angular distance
  function findNearestPose(deg) {
    let best = posesList[0];
    let bestDist = 360;
    for (let i = 0; i < posesList.length; i++) {
      const p = posesList[i];
      const d = circularAngularDist(deg, p.angle);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return best;
  }

  // 4. Pointer & Touch Listeners
  window.addEventListener('mousemove', (e) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    lastInteractionTime = performance.now();
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      pointerX = e.touches[0].clientX;
      pointerY = e.touches[0].clientY;
      isTouching = true;
      lastInteractionTime = performance.now();
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      pointerX = e.touches[0].clientX;
      pointerY = e.touches[0].clientY;
      isTouching = true;
      lastInteractionTime = performance.now();
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isTouching = false;
    lastInteractionTime = performance.now();
  }, { passive: true });

  // 5. Render Logic (Zero-Ghosting, Contain Fit, 12% Edge Fade Gradient Mask)
  function renderFrame() {
    if (!isReady) return;

    let imgToDraw = null;
    let currentKey = null;

    if (prefersReducedMotion || inDeadzone) {
      imgToDraw = centerFrame;
      currentKey = 'center';
    } else {
      // Normalize angle to degrees [0, 360) where 0 = UP, clockwise
      const currentDeg = ((currentAngle * 180 / Math.PI) % 360 + 360) % 360;
      const nearest = findNearestPose(currentDeg);
      imgToDraw = nearest.img;
      currentKey = nearest.file;
    }

    // Only repaint if frame changed or resize requested
    if (currentKey !== lastDrawnKey || needsRedraw) {
      // Fill entire canvas with hero background color so leftover sides blend seamlessly
      ctx.fillStyle = HERO_BG_COLOR;
      ctx.fillRect(0, 0, canvasW, canvasH);

      if (imgToDraw && imgToDraw.complete && imgToDraw.naturalWidth > 0) {
        // Draw contained frame (full height on desktop, 115%-width on mobile, never crops head)
        ctx.drawImage(imgToDraw, drawX, drawY, drawW, drawH);

        // Soft gradient mask on left and right edges to seamlessly melt into hero background.
        // On mobile drawX < 0 (image wider than canvas), fades paint from canvas edge inward.
        const fadeWidth = Math.round(Math.min(drawW, canvasW) * 0.1);
        if (fadeWidth > 4) {
          const clampedLeft = Math.max(0, drawX);
          const clampedRight = Math.min(canvasW, drawX + drawW);

          // Left edge soft gradient mask
          const leftGrad = ctx.createLinearGradient(clampedLeft, 0, clampedLeft + fadeWidth, 0);
          leftGrad.addColorStop(0, HERO_BG_COLOR);
          leftGrad.addColorStop(1, 'rgba(50, 18, 22, 0)');
          ctx.fillStyle = leftGrad;
          ctx.fillRect(clampedLeft, drawY, fadeWidth, drawH);

          // Right edge soft gradient mask
          const rightGrad = ctx.createLinearGradient(clampedRight - fadeWidth, 0, clampedRight, 0);
          rightGrad.addColorStop(0, 'rgba(50, 18, 22, 0)');
          rightGrad.addColorStop(1, HERO_BG_COLOR);
          ctx.fillStyle = rightGrad;
          ctx.fillRect(clampedRight - fadeWidth, drawY, fadeWidth, drawH);
        }

        lastDrawnKey = currentKey;
        needsRedraw = false;
      }
    }
  }

  // 6. 60 FPS Animation Loop
  function tick(timestamp) {
    if (!isTabVisible) {
      animationFrameId = null;
      return;
    }

    if (isReady && !prefersReducedMotion) {
      const now = timestamp || performance.now();
      const idleTime = now - lastInteractionTime;

      // On touch devices or idle cursor: gentle subtle life sweep
      if (isTouchDevice && !isTouching && idleTime > 2500) {
        // Natural gentle idle sweep looking around
        const t = (idleTime - 2500) * 0.0008;
        targetAngle = Math.PI + Math.sin(t) * 0.65;
        inDeadzone = false;
      } else {
        // Calculate angle relative to character's face center
        const dx = pointerX - faceScreenX;
        const dy = pointerY - faceScreenY;
        const dist = Math.hypot(dx, dy);

        // Deadzone with hysteresis (12% enter, 14% exit)
        if (inDeadzone) {
          if (dist > deadzoneExit) {
            inDeadzone = false;
          }
        } else {
          if (dist < deadzoneEnter) {
            inDeadzone = true;
          }
        }

        if (!inDeadzone) {
          // Angle converted so that UP = 0, increasing clockwise
          let ang = Math.atan2(dx, -dy);
          if (ang < 0) ang += 2 * Math.PI;
          targetAngle = ang;
        }
      }

      // Smooth circular lerp (response factor: 0.26 per frame)
      currentAngle = lerpAngle(currentAngle, targetAngle, 0.26);

      renderFrame();
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!animationFrameId && isTabVisible) {
      animationFrameId = requestAnimationFrame(tick);
    }
  }

  function stopLoop() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  // Pause loop when tab is hidden to save GPU/battery
  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible) {
      needsRedraw = true;
      startLoop();
    } else {
      stopLoop();
    }
  });

  // Start initialization
  initLoad();
}

/* ==========================================================================
   2. CUSTOM MAGNETIC CURSOR (Zero-Lag, Centered, Tactile Physics)
   ========================================================================== */
function initMagneticCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let isInitialized = false;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let targetRingX = mouseX;
  let targetRingY = mouseY;
  let currentRingScale = 1.0;
  let targetRingScale = 1.0;
  let currentDotScale = 1.0;
  let targetDotScale = 1.0;
  let isMouseDown = false;
  let activeTarget = null;

  // Track pointer movements
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isInitialized) {
      ringX = mouseX;
      ringY = mouseY;
      targetRingX = mouseX;
      targetRingY = mouseY;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      isInitialized = true;
    }
  }, { passive: true });

  // Hide on touch device interaction, restore on mouse
  window.addEventListener('touchstart', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  }, { passive: true });

  // Tactile click scale feedback
  window.addEventListener('mousedown', () => {
    isMouseDown = true;
  });
  window.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  // Event delegation for magnetic targets & hover highlights
  const interactiveSelector = 'a, button, [data-magnetic], .nav-pill-item, .hero-btn, .project-card, .skill-pill, .badge-tag, .contact-link-pill, .social-icon-btn, .project-link, .download-resume-btn';

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest(interactiveSelector);
    if (el) {
      activeTarget = el;
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const el = e.target.closest(interactiveSelector);
    if (el && el === activeTarget) {
      activeTarget = null;
      document.body.classList.remove('cursor-hover');
    }
  });

  // 60/120 FPS cursor render loop with smooth spring lerp
  function renderCursor() {
    if (isInitialized) {
      if (activeTarget && activeTarget.isConnected) {
        const rect = activeTarget.getBoundingClientRect();
        // Magnetic pull toward center for buttons, pills & links (compact elements)
        if (rect.width <= 320 && rect.height <= 140) {
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          targetRingX = centerX + (mouseX - centerX) * 0.35;
          targetRingY = centerY + (mouseY - centerY) * 0.35;
        } else {
          targetRingX = mouseX;
          targetRingY = mouseY;
        }
        targetRingScale = isMouseDown ? 1.25 : 1.6;
        targetDotScale = isMouseDown ? 0.6 : 0.85;
      } else {
        targetRingX = mouseX;
        targetRingY = mouseY;
        targetRingScale = isMouseDown ? 0.82 : 1.0;
        targetDotScale = isMouseDown ? 0.65 : 1.0;
      }

      // Smooth interpolation for aura ring (lerp factor 0.22)
      ringX += (targetRingX - ringX) * 0.22;
      ringY += (targetRingY - ringY) * 0.22;
      currentRingScale += (targetRingScale - currentRingScale) * 0.2;
      currentDotScale += (targetDotScale - currentDotScale) * 0.25;

      // Always maintain translate(-50%, -50%) for perfect pointer tip alignment
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${currentDotScale.toFixed(3)})`;
      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%) scale(${currentRingScale.toFixed(3)})`;
    }

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Window edge visibility handling
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (isInitialized) {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }
  });
}

/* ==========================================================================
   3. SCROLL REVEAL ANIMATIONS (IntersectionObserver for sections below Hero)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-item');
  if (!revealElements.length) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        const reveal = () => {
          entry.target.classList.add('is-revealed');
        };
        if (prefersReducedMotion) {
          reveal();
        } else {
          setTimeout(reveal, idx * 40);
        }
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   4. VANILLA GLASS SKILL FOLDERS
   ========================================================================== */
function initGlassFolders() {
  const folders = Array.from(document.querySelectorAll('.gf-root'));
  if (!folders.length) return;

  const W = 340;
  const H = 272;
  const HEADROOM = 20;
  const FRONT_TOP = 74;
  const FRONT_H = H - FRONT_TOP;
  const SHEET_W = 272;
  const SHEET_H = 184;
  const BACK_PATH = 'M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z';
  const FRONT_PATH = 'M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 ' + (FRONT_H - 22) + 'A22 22 0 0 1 318 ' + FRONT_H + 'L22 ' + FRONT_H + 'A22 22 0 0 1 0 ' + (FRONT_H - 22) + 'Z';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const jitterX = [-3.2, 1.8, -1.1, 3.4, 0.4];
  const jitterR = [-1.1, 0.65, -0.4, 1.3, 0];
  let openFolder = null;

  function setFolderOpen(root, open, returnFocus = false) {
    const button = root.querySelector('.gf-hit');
    const files = root.querySelector('.gf-files');
    const label = root.dataset.folder;
    const count = root.dataset.count;

    if (open) {
      folders.forEach((other) => {
        if (other !== root && other.hasAttribute('data-open')) setFolderOpen(other, false);
      });
      root.setAttribute('data-open', '');
      openFolder = root;
    } else {
      root.removeAttribute('data-open');
      if (openFolder === root) openFolder = null;
    }

    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', `${open ? 'Close' : 'Open'} ${label}, ${count} skills`);
    files.inert = !open;
    if (returnFocus) button.focus();
  }

  folders.forEach((root, folderIndex) => {
    const label = root.dataset.folder;
    const skills = (root.dataset.files || '').split('|').filter(Boolean);
    const button = root.querySelector('.gf-hit');
    const files = root.querySelector('.gf-files');

    root.dataset.count = String(skills.length);
    const syncScale = () => {
      const measuredWidth = root.getBoundingClientRect().width || root.clientWidth;
      const scale = Math.max(0.01, Math.min(1, (measuredWidth || W) / W));
      root.style.setProperty('--k', scale.toFixed(4));
      root.style.setProperty('--gf-headroom-scaled', `${HEADROOM * scale}px`);
      root.style.height = `${(H + HEADROOM) * scale}px`;
    };
    syncScale();
    root.style.setProperty('--gf-sheet-width', `${SHEET_W}px`);
    root.style.setProperty('--gf-sheet-height', `${SHEET_H}px`);
    root.querySelector('.gf-back-path').setAttribute('d', BACK_PATH);
    root.querySelector('.gf-front-path').setAttribute('d', FRONT_PATH);
    files.setAttribute('aria-label', `${label} skills`);

    skills.forEach((skill, index) => {
      const slot = skills.length <= 1 ? 0 : (index / (skills.length - 1)) * 2 - 1;
      const sheet = document.createElement('div');
      sheet.className = 'gf-sheet';
      sheet.setAttribute('role', 'listitem');
      sheet.setAttribute('aria-label', skill);
      sheet.style.setProperty('--gf-slot', slot.toFixed(3));
      sheet.style.setProperty('--gf-depth', String(skills.length - 1 - index));
      sheet.style.setProperty('--gf-jx', `${jitterX[index % jitterX.length]}px`);
      sheet.style.setProperty('--gf-jr', `${jitterR[index % jitterR.length]}deg`);

      const lines = document.createElement('span');
      lines.className = 'gf-lines';
      lines.setAttribute('aria-hidden', 'true');
      for (let line = 0; line < 5; line += 1) lines.appendChild(document.createElement('i'));

      const heading = document.createElement('span');
      heading.className = 'gf-sheet-head';
      const name = document.createElement('span');
      name.className = 'gf-sheet-name';
      name.textContent = skill;
      heading.appendChild(name);
      sheet.append(lines, heading);
      files.appendChild(sheet);
    });

    button.setAttribute('aria-label', `Open ${label}, ${skills.length} skills`);
    button.addEventListener('click', () => setFolderOpen(root, !root.hasAttribute('data-open')));

    if (reducedMotion || !('IntersectionObserver' in window)) root.setAttribute('data-entered', '');

    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const updateParallax = () => {
      pointerFrame = 0;
      root.style.setProperty('--gf-px', pointerX.toFixed(3));
      root.style.setProperty('--gf-py', pointerY.toFixed(3));
    };
    root.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const rect = root.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updateParallax);
    }, { passive: true });
    root.addEventListener('pointerleave', () => {
      pointerX = 0;
      pointerY = 0;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updateParallax);
    }, { passive: true });

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        syncScale();
      });
      resizeObserver.observe(root);
    }

    if (!reducedMotion && 'IntersectionObserver' in window) {
      const entranceObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(root);
          window.setTimeout(() => root.setAttribute('data-entered', ''), folderIndex * 140);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
      entranceObserver.observe(root);
    }

    window.setTimeout(() => {
      const rect = root.getBoundingClientRect();
      const hasZeroSize = rect.width === 0 || rect.height === 0;
      const inViewport = rect.bottom > 0 && rect.top < window.innerHeight;
      if (hasZeroSize || inViewport) {
        root.setAttribute('data-entered', '');
        root.classList.add('is-revealed');
      }
    }, 1500);
  });

  document.addEventListener('pointerdown', (event) => {
    if (openFolder && !openFolder.contains(event.target)) setFolderOpen(openFolder, false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && openFolder) setFolderOpen(openFolder, false, true);
  });
}

/* ==========================================================================
   5. PLACEHOLDER LINK SAFETY HANDLER
   ========================================================================== */
function initPlaceholderLinks() {
  const placeholderLinks = document.querySelectorAll('a[href="#"]');
  placeholderLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      console.info('Placeholder link clicked: configure URL in index.html when available.');
    });
  });
}

function initExpandableCapabilityCards() {
  const row = document.querySelector('.capabilities-grid');
  const panels = Array.from(document.querySelectorAll('[data-capability]'));
  if (!row || !panels.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = Math.max(0, panels.findIndex((panel) => panel.getAttribute('aria-expanded') === 'true'));
  let stoppedByUser = false;
  let hovered = false;
  let focused = false;
  let inView = true;
  let timer = 0;

  const activate = (index) => {
    active = (index + panels.length) % panels.length;
    panels.forEach((panel, i) => panel.setAttribute('aria-expanded', String(i === active)));
  };
  const schedule = () => {
    window.clearTimeout(timer);
    if (reduced || stoppedByUser || hovered || focused || !inView || document.hidden) return;
    timer = window.setTimeout(() => { activate(active + 1); schedule(); }, 3500);
  };

  panels.forEach((panel, index) => {
    panel.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') activate(index);
    });
    panel.addEventListener('focus', () => { focused = true; activate(index); schedule(); });
    panel.addEventListener('blur', () => { window.setTimeout(() => { focused = row.contains(document.activeElement); schedule(); }, 0); });
    panel.addEventListener('click', () => { stoppedByUser = true; window.clearTimeout(timer); activate(index); });
    panel.addEventListener('keydown', (event) => {
      const mobile = window.matchMedia('(max-width: 600px)').matches;
      const forward = mobile ? 'ArrowDown' : 'ArrowRight';
      const backward = mobile ? 'ArrowUp' : 'ArrowLeft';
      if (event.key !== forward && event.key !== backward) return;
      event.preventDefault();
      const next = (index + (event.key === forward ? 1 : -1) + panels.length) % panels.length;
      panels[next].focus();
    });
  });
  row.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') { hovered = true; schedule(); } });
  row.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }, { threshold: 0.15 }).observe(row);
  }
  document.addEventListener('visibilitychange', schedule);
  schedule();
}

function initBeyondCardSwap() {
  const region = document.querySelector('.beyond-swap');
  if (!region) return;
  const cards = Array.from(region.querySelectorAll('[data-swap-card]'));
  if (cards.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let inView = !('IntersectionObserver' in window);
  let hovered = false;
  let focused = false;
  let timer = 0;

  const paint = () => {
    cards.forEach((card, index) => {
      card.dataset.swapPosition = String(index);
      card.setAttribute('aria-pressed', String(index === 0));
    });
  };
  const schedule = () => {
    window.clearTimeout(timer);
    if (reducedMotion || hovered || focused || !inView || document.hidden) return;
    timer = window.setTimeout(() => {
      cards.push(cards.shift());
      paint();
      schedule();
    }, 4000);
  };
  const promote = (card) => {
    const index = cards.indexOf(card);
    if (index <= 0) return;
    cards.unshift(cards.splice(index, 1)[0]);
    paint();
    schedule();
  };

  cards.forEach((card, index) => {
    card.dataset.swapPosition = String(index);
    card.addEventListener('click', () => promote(card));
  });
  paint();
  region.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch') { hovered = true; schedule(); }
  });
  region.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  region.addEventListener('focusin', () => { focused = true; schedule(); });
  region.addEventListener('focusout', () => {
    window.setTimeout(() => { focused = region.contains(document.activeElement); schedule(); }, 0);
  });
  region.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      cards.push(cards.shift());
      paint();
      schedule();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      cards.unshift(cards.pop());
      paint();
      schedule();
    } else if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('[data-swap-card]')) {
      event.preventDefault();
      promote(event.target.closest('[data-swap-card]'));
    }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }, { threshold: 0.1 }).observe(region);
  }
  document.addEventListener('visibilitychange', schedule);
  schedule();
}

/* ==========================================================================
   6. LIQUID WATER NAVIGATION (isolated from the hero canvas)
   ========================================================================== */
function initLiquidNavbar() {
  const nav = document.querySelector('.liquid-nav');
  if (!nav) return;
  const canvas = nav.querySelector('.liquid-nav-water');
  const fallback = nav.querySelector('.nimbus-drop');
  const links = Array.from(nav.querySelectorAll('.liquid-nav-item'));
  const PAD = 14;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 600px)').matches;
  const state = { a:{x:0,v:0}, b:{x:0,v:0}, sy:1, syv:0, lead:0, lagFrom:0, sats:[], rips:[], target:{x:0,y:0,q:0,r:20}, q:0, moving:false, split:false, ready:false, w:0,h:0, visible:true, raf:0,last:0,time:0, gl:null, mouse:{x:0,y:0,s:0,on:false} };
  const vertex = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const fragment = `precision highp float;uniform vec2 uRes;uniform float uDpr,uTime;uniform vec4 uPill;uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform vec3 uTint,uDeep;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5)d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}return d;}float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}float waves(vec2 p){float w=0.;for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}void main(){vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;float dp=pillD(p),dd=dropD(p);float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),vec3(0.,0.,1.)),0.),70.);float fres=clamp((1.-n.z)*4.,0.,1.);float pm=smoothstep(1.,-1.,dp),dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*.16;vec3 c=uDeep*sh;float a=sh;float pa=clamp(pm*(fres*.5+spec),0.,1.);c=mix(vec3(1.),uTint,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);float rim=dm*(1.-smoothstep(0.,8.,-dd));float body=.5+.5*clamp(-n.y*3.,-1.,1.);float da=dm*(.26+.14*body);vec3 dc=mix(uTint,vec3(1.),body*.6);float la=rim*.22;dc=mix(uDeep,uTint,.55)*la+dc*da*(1.-la);da=la+da*(1.-la);la=clamp(dm*spec*1.2,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);c=dc+c*(1.-da);a=da+a*(1.-da);gl_FragColor=vec4(c,a);}`;
  function initGL() {
    const gl = canvas.getContext('webgl', {alpha:true,premultipliedAlpha:true,antialias:false}); if (!gl) return null;
    const compile=(type,src)=>{const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){gl.deleteShader(sh);return null;}return sh;};
    const vs=compile(gl.VERTEX_SHADER,vertex), fs=compile(gl.FRAGMENT_SHADER,fragment); if(!vs||!fs)return null;
    const p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))return null;gl.useProgram(p);
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(p,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    const u={};['uRes','uDpr','uTime','uPill','uBlob','uSy','uRip','uMouse','uTint','uDeep','uAmb'].forEach(n=>u[n]=gl.getUniformLocation(p,n));return {gl,u};
  }
  state.gl=initGL(); if(!state.gl)nav.dataset.gl='off';
  function measure(){state.w=nav.offsetWidth;state.h=nav.offsetHeight;const link=links.find(x=>x.getAttribute('aria-current')==='page')||links[0];if(!link)return;const nx=PAD+link.offsetLeft+link.offsetWidth/2;state.target={x:nx,y:PAD+link.offsetTop+link.offsetHeight/2,q:Math.max(0,link.offsetWidth/2-link.offsetHeight/2),r:link.offsetHeight/2};if(!state.ready||reduced){state.a.x=state.b.x=nx;state.q=state.target.q;state.ready=true;}else if(Math.abs(nx-state.target.x)>.5){state.lead=Math.abs(nx-state.a.x)<=Math.abs(nx-state.b.x)?0:1;state.lagFrom=performance.now()+70;state.moving=true;state.split=false;}const dpr=Math.min(devicePixelRatio||1,mobile?1.5:2);canvas.width=Math.round((state.w+PAD*2)*dpr);canvas.height=Math.round((state.h+PAD*2)*dpr);canvas.style.width=`${state.w+PAD*2}px`;canvas.style.height=`${state.h+PAD*2}px`;run();}
  function draw(){const s=state,T=s.target,sep=Math.abs(s.a.x-s.b.x),thin=Math.min(sep/(2*(s.q+T.r)||1),1),r=T.r*(1-.3*thin);if(s.gl){const {gl:g,u}=s.gl,dpr=Math.min(devicePixelRatio||1,mobile?1.5:2);g.viewport(0,0,canvas.width,canvas.height);g.uniform2f(u.uRes,s.w+PAD*2,s.h+PAD*2);g.uniform1f(u.uDpr,dpr);g.uniform1f(u.uTime,s.time);g.uniform4f(u.uPill,PAD,PAD,s.w,s.h);const blobs=new Float32Array(24),sy=new Float32Array(6).fill(1),head=s.lead===0?s.a:s.b,tail=s.lead===0?s.b:s.a;blobs.set([head.x,T.y,s.q*(1-.25*thin),T.r*(1-.12*thin),tail.x,T.y,s.q*(1-.8*thin),T.r*(1-.5*thin)]);sy[0]=sy[1]=s.sy;s.sats.slice(0,4).forEach((d,i)=>blobs.set([d.x,d.y,0,d.r],8+i*4));g.uniform4fv(u.uBlob,blobs);g.uniform1fv(u.uSy,sy);const rip=new Float32Array(24);s.rips.slice(-6).forEach((x,i)=>rip.set([x.x,x.y,x.age,x.amp],i*4));g.uniform4fv(u.uRip,rip);g.uniform3f(u.uMouse,s.mouse.x,s.mouse.y,s.mouse.s);g.uniform3f(u.uTint,215/255,165/255,161/255);g.uniform3f(u.uDeep,158/255,57/255,72/255);g.uniform1f(u.uAmb,s.visible&&!reduced?1:0);g.clear(g.COLOR_BUFFER_BIT);g.drawArrays(g.TRIANGLES,0,3);}else{const left=Math.min(s.a.x,s.b.x)-s.q-r-PAD;fallback.style.width=`${sep+2*(s.q+r)}px`;fallback.style.transform=`translateX(${left}px) scaleY(${s.sy})`;}}
  function step(dt,now){const s=state,T=s.target;s.time+=dt;s.q+=(T.q-s.q)*Math.min(1,dt*12);let still=true;if(reduced){s.a.x=s.b.x=T.x;s.a.v=s.b.v=0;s.sy=1;s.sats=[];}else{[s.a,s.b].forEach((b,i)=>{const lead=i===s.lead,k=lead?210:72,c=lead?25:13,f=!lead&&now<s.lagFrom ? .08 : 1;b.v+=(k*(T.x-b.x)-c*b.v)*dt*f;b.x+=b.v*dt;const lo=PAD+6+s.q+T.r-3,hi=PAD+s.w-6-s.q-T.r+3;if(b.x<lo||b.x>hi){s.syv-=Math.min(Math.abs(b.v),900)*.0016;b.x=Math.max(lo,Math.min(hi,b.x));b.v*=-.25;}if(Math.abs(T.x-b.x)>.3||Math.abs(b.v)>3)still=false;});const L=[s.a,s.b][s.lead], syT=1-.2*Math.min(Math.abs(L.v)/1500,1);s.syv+=(280*(syT-s.sy)-9*s.syv)*dt;s.sy+=s.syv*dt;if(Math.abs(s.sy-1)>.002||Math.abs(s.syv)>.02)still=false;const sep=Math.abs(s.a.x-s.b.x),r=T.r*(1-.3*Math.min(sep/(2*(T.q+T.r)||1),1));if(!s.split&&s.moving&&sep-2*T.q-2*r>-6){s.split=true;[.3,.5,.72].forEach((t,j)=>{const lo=[s.a,s.b][1-s.lead],hi=[s.a,s.b][s.lead];s.sats.push({x:lo.x+(hi.x-lo.x)*t,y:T.y,vx:(lo.v+hi.v)*.45,vy:(Math.random()-.5)*60,r:5+Math.random()*3-j*.5,k:70+Math.random()*90});});}s.sats=s.sats.filter(d=>{d.vx+=(d.k*(T.x-d.x)-9*d.vx)*dt;d.vy+=(90*(T.y-d.y)-7*d.vy)*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.x=Math.max(PAD+8+d.r,Math.min(PAD+s.w-8-d.r,d.x));d.y=Math.max(T.y-T.r+d.r,Math.min(T.y+T.r-d.r,d.y));if(Math.abs(T.x-d.x)<T.q+T.r*.5)d.r-=dt*26;return d.r>.6;});if(s.sats.length)still=false;}if(s.moving&&still){s.moving=false;s.rips.push({x:T.x,y:T.y,age:0,amp:s.split?1.2:.7});}s.rips.forEach(x=>x.age+=dt);s.rips=s.rips.filter(x=>x.age<2.4);s.mouse.s+=((s.mouse.on?1:0)-s.mouse.s)*Math.min(1,dt*7);}
  function run(){const s=state;if(s.raf||!s.visible||document.hidden)return;s.last=performance.now();const tick=now=>{const dt=Math.min((now-s.last)/1000,1/30);s.last=now;step(dt,now);draw();const busy=s.moving||s.rips.length||s.sats.length||s.mouse.s>.01;if(s.visible&&!document.hidden&&(!reduced||busy))s.raf=requestAnimationFrame(tick);else s.raf=0;};s.raf=requestAnimationFrame(tick);}
  function setActive(i){links.forEach((link,n)=>{if(n===i)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});if(state.ready){const link=links[i],x=PAD+link.offsetLeft+link.offsetWidth/2;if(Math.abs(x-state.target.x)>.5){state.lead=Math.abs(x-state.a.x)<=Math.abs(x-state.b.x)?0:1;state.lagFrom=performance.now()+70;state.moving=true;state.split=false;}state.target.x=x;state.target.y=PAD+link.offsetTop+link.offsetHeight/2;state.target.q=Math.max(0,link.offsetWidth/2-link.offsetHeight/2);state.target.r=link.offsetHeight/2;run();}}
  links.forEach((link,i)=>link.addEventListener('click',e=>{const target=document.querySelector(link.getAttribute('href'));if(!target)return;e.preventDefault();setActive(i);target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});const rect=nav.getBoundingClientRect();state.rips.push({x:e.clientX-rect.left+PAD,y:e.clientY-rect.top+PAD,age:0,amp:.8});run();}));
  nav.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;e.preventDefault();const active=Math.max(0,links.findIndex(x=>x.getAttribute('aria-current')==='page'));const next=(active+(e.key==='ArrowRight'?1:-1)+links.length)%links.length;setActive(next);links[next].focus();});
  nav.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced)return;const r=nav.getBoundingClientRect();state.mouse.x=e.clientX-r.left+PAD;state.mouse.y=e.clientY-r.top+PAD;state.mouse.on=true;run();});nav.addEventListener('pointerleave',()=>{state.mouse.on=false;run();});nav.addEventListener('pointerdown',e=>{const r=nav.getBoundingClientRect();state.rips.push({x:e.clientX-r.left+PAD,y:e.clientY-r.top+PAD,age:0,amp:.8});run();});
  const sectionObserver=new IntersectionObserver(entries=>{const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible){const i=links.findIndex(x=>x.hash===`#${visible.target.id}`);if(i>=0)setActive(i);}}, {rootMargin:'-25% 0px -55% 0px',threshold:[0,.1,.25,.5]});links.forEach(link=>{const section=document.querySelector(link.hash);if(section)sectionObserver.observe(section);});
  const visibility=new IntersectionObserver(([entry])=>{state.visible=entry.isIntersecting;if(state.visible)run();else{cancelAnimationFrame(state.raf);state.raf=0;} });visibility.observe(nav);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(state.raf);state.raf=0;}else run();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();state.gl=null;nav.dataset.gl='off';draw();});window.addEventListener('resize',measure,{passive:true});if('ResizeObserver'in window)new ResizeObserver(measure).observe(nav);setActive(0);measure();
}
