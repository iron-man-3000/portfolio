/**
 * HERO.JS
 * 3D Floating Name with Letter Physics, Typewriter Subtitle,
 * Orbiting Tech Chips with Fling Physics, and Constellation Canvas.
 */

import { CONFIG } from './config.js';

export class HeroController {
  constructor() {
    this.heroSection = document.getElementById('hero');
    this.nameContainer = document.getElementById('floating-name');
    this.stage = document.querySelector('.hero-stage');
    this.chipsContainer = document.getElementById('chips-container');
    this.tooltip = document.getElementById('chip-tooltip');
    this.constellationCanvas = document.getElementById('constellation-canvas');
    this.cCtx = this.constellationCanvas ? this.constellationCanvas.getContext('2d') : null;

    this.mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      prevX: window.innerWidth / 2,
      prevY: window.innerHeight / 2,
      vx: 0,
      vy: 0,
      isDown: false
    };

    this.letters = [];
    this.chips = [];
    this.isDraggingChip = null;
    this.dragOffset = { x: 0, y: 0 };
    this.rafId = null;

    this.init();
  }

  init() {
    this.setupFloatingName();
    this.setupTypewriter();
    this.setupTechChips();
    this.setupConstellation();
    this.bindEvents();

    this.rafId = requestAnimationFrame((now) => this.tick(now));
  }

  // =========================================================================
  // PART 2: FLOATING NAME SETUP & LETTER PHYSICS
  // =========================================================================
  setupFloatingName() {
    if (!this.nameContainer) return;

    const words = CONFIG.profile.name.split(' ');
    this.nameContainer.innerHTML = '';

    let globalCharIndex = 0;
    words.forEach((word) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'name-word';

      for (let char of word) {
        const charSpan = document.createElement('span');
        charSpan.className = 'name-char';
        charSpan.textContent = char;
        charSpan.dataset.index = globalCharIndex;

        wordSpan.appendChild(charSpan);

        this.letters.push({
          el: charSpan,
          index: globalCharIndex,
          baseX: 0,
          baseY: 0,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          rx: 0,
          ry: 0,
          phase: globalCharIndex * 0.45
        });

        globalCharIndex++;
      }

      this.nameContainer.appendChild(wordSpan);
    });

    // Occasional subtle glitch accent
    setInterval(() => {
      if (Math.random() < 0.25) {
        this.triggerGlitch();
      }
    }, 4500);
  }

  triggerGlitch() {
    if (!this.nameContainer) return;
    this.nameContainer.classList.add('glitch-active');
    setTimeout(() => {
      this.nameContainer.classList.remove('glitch-active');
    }, 180);
  }

  // =========================================================================
  // TYPEWRITER SUBTITLE
  // =========================================================================
  setupTypewriter() {
    const typewriterEl = document.getElementById('typewriter-target');
    if (!typewriterEl) return;

    const phrases = CONFIG.profile.subtitlePhrases;
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 80;
    const deleteSpeed = 40;
    const pauseDelay = 1800;

    const tickTypewriter = () => {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        charIndex--;
        typewriterEl.textContent = currentPhrase.substring(0, charIndex);
      } else {
        charIndex++;
        typewriterEl.textContent = currentPhrase.substring(0, charIndex);
      }

      let timeout = isDeleting ? deleteSpeed : typeSpeed;

      if (!isDeleting && charIndex === currentPhrase.length) {
        timeout = pauseDelay;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        timeout = 400;
      }

      setTimeout(tickTypewriter, timeout);
    };

    tickTypewriter();
  }

  // =========================================================================
  // PART 3: FLOATING TECH STACK CHIPS & FLING PHYSICS
  // =========================================================================
  setupTechChips() {
    if (!this.chipsContainer) return;
    this.chipsContainer.innerHTML = '';
    const rect = this.heroSection.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const techList = CONFIG.tech;
    const count = techList.length;

    techList.forEach((item, i) => {
      const chipEl = document.createElement('div');
      chipEl.className = 'tech-chip';
      chipEl.dataset.layer = item.layer;
      chipEl.setAttribute('tabindex', '0');
      chipEl.setAttribute('role', 'button');
      chipEl.setAttribute('aria-label', `${item.name}: ${item.tip}`);

      const dot = document.createElement('span');
      dot.className = 'chip-dot';

      const label = document.createElement('span');
      label.className = 'chip-label';
      label.textContent = item.name;

      chipEl.appendChild(dot);
      chipEl.appendChild(label);
      this.chipsContainer.appendChild(chipEl);

      // Distribute in an elliptical orbit around the hero center
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.2 - 0.1);
      const rx = Math.min(rect.width * 0.38, 460) + (item.layer === 1 ? 40 : item.layer === 3 ? -30 : 0);
      const ry = Math.min(rect.height * 0.32, 280) + (item.layer === 1 ? 30 : item.layer === 3 ? -20 : 0);

      const targetX = centerX + Math.cos(angle) * rx;
      const targetY = centerY + Math.sin(angle) * ry;

      const chipObj = {
        el: chipEl,
        name: item.name,
        tip: item.tip,
        layer: item.layer,
        homeX: targetX,
        homeY: targetY,
        x: targetX,
        y: targetY,
        vx: 0,
        vy: 0,
        baseAngle: angle,
        driftSpeed: (0.0008 + item.layer * 0.0003) * (i % 2 === 0 ? 1 : -1),
        radiusX: rx,
        radiusY: ry,
        width: 100,
        height: 36,
        isHovered: false
      };

      this.chips.push(chipObj);

      // Mouse Hover for Tooltip
      chipEl.addEventListener('mouseenter', (e) => {
        chipObj.isHovered = true;
        this.showTooltip(item.name, item.tip, e.clientX, e.clientY);
      });

      chipEl.addEventListener('mouseleave', () => {
        chipObj.isHovered = false;
        this.hideTooltip();
      });

      // Pointer drag/fling support
      chipEl.addEventListener('pointerdown', (e) => {
        this.onChipPointerDown(e, chipObj);
      });
    });

    // Update chip dimensions after DOM paint
    requestAnimationFrame(() => {
      this.chips.forEach(c => {
        const bounds = c.el.getBoundingClientRect();
        c.width = bounds.width || 100;
        c.height = bounds.height || 36;
      });
    });
  }

  showTooltip(name, tip, x, y) {
    if (!this.tooltip) return;
    this.tooltip.innerHTML = `<strong>${name}</strong>: ${tip}`;
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y - 12}px`;
    this.tooltip.style.opacity = '1';
  }

  hideTooltip() {
    if (!this.tooltip) return;
    this.tooltip.style.opacity = '0';
  }

  onChipPointerDown(e, chip) {
    this.isDraggingChip = chip;
    chip.el.setPointerCapture(e.pointerId);
    this.dragOffset.x = e.clientX - chip.x;
    this.dragOffset.y = e.clientY - chip.y;
    chip.vx = 0;
    chip.vy = 0;
  }

  // =========================================================================
  // CONSTELLATION CANVAS
  // =========================================================================
  setupConstellation() {
    if (!this.constellationCanvas) return;
    this.resizeConstellation();
    window.addEventListener('resize', () => this.resizeConstellation(), { passive: true });
  }

  resizeConstellation() {
    if (!this.constellationCanvas) return;
    const rect = this.heroSection.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.constellationCanvas.width = rect.width * dpr;
    this.constellationCanvas.height = rect.height * dpr;
    this.constellationCanvas.style.width = `${rect.width}px`;
    this.constellationCanvas.style.height = `${rect.height}px`;
    if (this.cCtx) this.cCtx.scale(dpr, dpr);
  }

  drawConstellation() {
    if (!this.cCtx) return;
    const rect = this.heroSection.getBoundingClientRect();
    this.cCtx.clearRect(0, 0, rect.width, rect.height);

    const maxDist = 220;

    // Connect nearby chips
    for (let i = 0; i < this.chips.length; i++) {
      const c1 = this.chips[i];
      for (let j = i + 1; j < this.chips.length; j++) {
        const c2 = this.chips[j];
        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.22;
          this.cCtx.beginPath();
          this.cCtx.moveTo(c1.x, c1.y);
          this.cCtx.lineTo(c2.x, c2.y);
          this.cCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          this.cCtx.lineWidth = 1;
          this.cCtx.stroke();

          // Draw tiny lime node at midpoint if close
          if (dist < 130) {
            const mx = (c1.x + c2.x) / 2;
            const my = (c1.y + c2.y) / 2;
            this.cCtx.fillStyle = 'rgba(182, 255, 59, 0.45)';
            this.cCtx.beginPath();
            this.cCtx.arc(mx, my, 1.5, 0, Math.PI * 2);
            this.cCtx.fill();
          }
        }
      }
    }
  }

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================
  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.vx = e.clientX - this.mouse.prevX;
      this.mouse.vy = e.clientY - this.mouse.prevY;
      this.mouse.prevX = e.clientX;
      this.mouse.prevY = e.clientY;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      if (this.isDraggingChip) {
        this.isDraggingChip.x = e.clientX - this.dragOffset.x;
        this.isDraggingChip.y = e.clientY - this.dragOffset.y;
        this.isDraggingChip.vx = this.mouse.vx * 0.7;
        this.isDraggingChip.vy = this.mouse.vy * 0.7;
      }
    }, { passive: true });

    window.addEventListener('pointerup', () => {
      if (this.isDraggingChip) {
        this.isDraggingChip = null;
      }
    });

    // Device orientation support for mobile tilt
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          const tiltX = Math.min(30, Math.max(-30, e.gamma));
          const tiltY = Math.min(30, Math.max(-30, e.beta - 45));
          this.mouse.x = (window.innerWidth / 2) + (tiltX / 30) * (window.innerWidth * 0.3);
          this.mouse.y = (window.innerHeight / 2) + (tiltY / 30) * (window.innerHeight * 0.3);
        }
      }, { passive: true });
    }
  }

  // =========================================================================
  // MAIN PHYSICS LOOP
  // =========================================================================
  tick(now) {
    const t = now * 0.0015;
    const heroRect = this.heroSection.getBoundingClientRect();
    const centerX = heroRect.width / 2;
    const centerY = heroRect.height / 2;

    // --- 1. 3D Tilt of Hero Stage toward Pointer ---
    const normX = (this.mouse.x - window.innerWidth / 2) / (window.innerWidth / 2);
    const normY = (this.mouse.y - window.innerHeight / 2) / (window.innerHeight / 2);

    const tiltAngleX = -normY * 7;
    const tiltAngleY = normX * 9;

    if (this.stage) {
      this.stage.style.transform = `perspective(1000px) rotateX(${tiltAngleX}deg) rotateY(${tiltAngleY}deg)`;
    }

    // --- 2. Floating Letters Sine Offset & Pointer Repulsion ---
    const mouseHeroX = this.mouse.x;
    const mouseHeroY = this.mouse.y;

    for (let l of this.letters) {
      const rect = l.el.getBoundingClientRect();
      const lx = rect.left + rect.width / 2;
      const ly = rect.top + rect.height / 2;

      const dx = lx - mouseHeroX;
      const dy = ly - mouseHeroY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Spring repulsion from cursor
      let repX = 0;
      let repY = 0;
      const repThreshold = 140;
      if (dist < repThreshold && dist > 1) {
        const force = (1 - dist / repThreshold) * 22;
        repX = (dx / dist) * force;
        repY = (dy / dist) * force;
      }

      // Sine wave offset float
      const sineY = Math.sin(t * 1.8 + l.phase) * 6;
      const rotX = Math.cos(t * 1.4 + l.phase) * 4;
      const rotY = Math.sin(t * 1.2 + l.phase) * 5;

      l.vx = (l.vx + (repX - l.x) * 0.12) * 0.82;
      l.vy = (l.vy + (repY - l.y) * 0.12) * 0.82;
      l.x += l.vx;
      l.y += l.vy;

      l.el.style.transform = `translate3d(${l.x.toFixed(2)}px, ${(l.y + sineY).toFixed(2)}px, 0px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg)`;
    }

    // --- 3. Floating Tech Chips Physics ---
    for (let i = 0; i < this.chips.length; i++) {
      const chip = this.chips[i];

      if (chip !== this.isDraggingChip) {
        // Natural gentle orbit drift
        chip.baseAngle += chip.driftSpeed;
        const targetHomeX = centerX + Math.cos(chip.baseAngle) * chip.radiusX;
        const targetHomeY = centerY + Math.sin(chip.baseAngle) * chip.radiusY;

        // Spring force returning to orbital position
        const springK = 0.025;
        const damping = 0.88;
        const fx = (targetHomeX - chip.x) * springK;
        const fy = (targetHomeY - chip.y) * springK;

        chip.vx = (chip.vx + fx) * damping;
        chip.vy = (chip.vy + fy) * damping;

        // Soft cursor magnetic pull / subtle repulsion
        const cdx = chip.x - mouseHeroX;
        const cdy = chip.y - mouseHeroY;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

        if (cdist < 180 && cdist > 10) {
          // Push gently away so pointer clears a path
          const pushForce = (1 - cdist / 180) * 1.2;
          chip.vx += (cdx / cdist) * pushForce;
          chip.vy += (cdy / cdist) * pushForce;
        }

        // Inter-chip soft repulsion to prevent awkward clumping
        for (let j = i + 1; j < this.chips.length; j++) {
          const other = this.chips[j];
          const ox = chip.x - other.x;
          const oy = chip.y - other.y;
          const odist = Math.sqrt(ox * ox + oy * oy);
          const minSep = 90;
          if (odist < minSep && odist > 0.1) {
            const rep = ((minSep - odist) / minSep) * 0.5;
            const rx = (ox / odist) * rep;
            const ry = (oy / odist) * rep;
            chip.vx += rx;
            chip.vy += ry;
            other.vx -= rx;
            other.vy -= ry;
          }
        }

        chip.x += chip.vx;
        chip.y += chip.vy;
      }

      // Render chip position
      const left = chip.x - chip.width / 2;
      const top = chip.y - chip.height / 2;
      chip.el.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0px)`;
    }

    // --- 4. Render Constellation Lines ---
    this.drawConstellation();

    this.rafId = requestAnimationFrame((timestamp) => this.tick(timestamp));
  }
}
