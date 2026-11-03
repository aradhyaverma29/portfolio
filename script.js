/**
 * ARADHYA VERMA — PORTFOLIO SCRIPT
 * Award-winning, 60 FPS Zero-Ghosting Canvas Character Renderer,
 * Custom Magnetic Cursor, and Smooth Scroll Interactions.
 * Plain Vanilla JavaScript — Zero Frameworks / Build Steps.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCharacterCanvas();
  initMagneticCursor();
  initScrollReveal();
  initPlaceholderLinks();
});

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

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('is-revealed');
        }, idx * 40);
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   4. PLACEHOLDER LINK SAFETY HANDLER
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
