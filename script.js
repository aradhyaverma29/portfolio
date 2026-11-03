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
  initCharacterCanvas();
  initMagneticCursor();
  initScrollReveal();
  initGlassFolders();
  initPlaceholderLinks();
  initContactSection();
});

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
  const HERO_BG_COLOR = '#f20601';

  // Source image natural dimensions after horizontal black-bar crop (x in [147, 1132))
  const IMG_W = 985;
  const IMG_H = 720;
  // Character face position in cropped source frame
  const FACE_SRC_X = 490.0;
  const FACE_SRC_Y = 310.0;

  // Fallback discrete poses config (16 clean open-eye compass angles, safe from hand intrusion)
  // pose_04 and pose_05 removed (blink frames); pose_02 -> F50, pose_03 -> F68, pose_06 -> F72
  const FALLBACK_POSES = [
    { file: "pose_00.webp", angle: 1.4,   label: "UP" },
    { file: "pose_01.webp", angle: 24.3,  label: "NNE" },
    { file: "pose_02.webp", angle: 52.4,  label: "UP-RIGHT" },
    { file: "pose_03.webp", angle: 121.0, label: "ESE-DR" },
    { file: "pose_06.webp", angle: 135.0, label: "DOWN-RIGHT" },
    { file: "pose_07.webp", angle: 156.6, label: "SSE" },
    { file: "pose_08.webp", angle: 182.3, label: "DOWN" },
    { file: "pose_09.webp", angle: 205.8, label: "SSW" },
    { file: "pose_10.webp", angle: 213.2, label: "DOWN-LEFT" },
    { file: "pose_11.webp", angle: 270.0, label: "LEFT" },
    { file: "pose_12.webp", angle: 282.1, label: "WNW" },
    { file: "pose_13.webp", angle: 298.3, label: "UP-LEFT-1" },
    { file: "pose_14.webp", angle: 309.8, label: "UP-LEFT-2" },
    { file: "pose_15.webp", angle: 324.5, label: "UP-LEFT-3" },
    { file: "pose_16.webp", angle: 348.3, label: "NNW" },
    { file: "pose_17.webp", angle: 356.9, label: "NNW-UP" }
  ];

  let posesList = FALLBACK_POSES;
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

  // 1. Fetch poses.json (with fallback to embedded config) and preload WebP frames
  function initLoad() {
    fetch(`${FRAME_DIR}poses.json`)
      .then((res) => {
        if (!res.ok) throw new Error('poses.json fetch returned status ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.poses) && data.poses.length > 0) {
          posesList = data.poses;
        }
        preloadImages();
      })
      .catch(() => {
        // Fallback for file:// offline preview or network restrictions
        posesList = FALLBACK_POSES;
        preloadImages();
      });
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
    const drawnFrameSize = Math.min(drawW, drawH);
    deadzoneEnter = 0.12 * drawnFrameSize;
    deadzoneExit = 0.14 * drawnFrameSize;

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
          leftGrad.addColorStop(1, 'rgba(242, 6, 1, 0)');
          ctx.fillStyle = leftGrad;
          ctx.fillRect(clampedLeft, drawY, fadeWidth, drawH);

          // Right edge soft gradient mask
          const rightGrad = ctx.createLinearGradient(clampedRight - fadeWidth, 0, clampedRight, 0);
          rightGrad.addColorStop(0, 'rgba(242, 6, 1, 0)');
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
  const HEADROOM = 54;
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
      const scale = Math.min(1, root.clientWidth / W);
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
      }, { threshold: 0.25 });
      entranceObserver.observe(root);
    }
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
