/**
 * INTRO.JS
 * Accelerated 8.5-Second Cinematic Intro powered by GSAP & Rocket Sound Engine.
 * Features an accelerating rocket game audio sequence (pitch + speed multiplier increase)
 * culminating in a sonic boom impact reveal.
 */

import { CONFIG } from './config.js';

class RocketSoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false; // Enabled by default; resumes on user gesture
    this.rocketNodes = [];
    this.hasStarted = false;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopRocketSequence();
    }
    return this.isMuted;
  }

  // Soft mechanical keyboard tick
  playKeyTick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900 + Math.random() * 300, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch (e) {}
  }

  // Accelerating rocket engine launch sequence
  startRocketSequence(durationSec) {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.stopRocketSequence();

    try {
      const now = this.ctx.currentTime;
      const end = now + durationSec;

      // 1. Heavy rocket thrust noise (rumble that opens up in frequency)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.2;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(120, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(3600, end - 0.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.02, now);
      noiseGain.gain.linearRampToValueAtTime(0.22, end - 0.8);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, end + 0.1);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noiseSource.start(now);
      noiseSource.stop(end + 0.2);
      this.rocketNodes.push(noiseSource);

      // 2. Accelerating Turbine Synth (pitch ramps up from low rumble to sonic scream)
      const rocketOsc = this.ctx.createOscillator();
      const rocketGain = this.ctx.createGain();
      const rocketFilter = this.ctx.createBiquadFilter();

      rocketOsc.type = 'sawtooth';
      // Pitch climbs exponentially like a rocket gaining escape velocity: 75Hz -> 1350Hz
      rocketOsc.frequency.setValueAtTime(75, now);
      rocketOsc.frequency.exponentialRampToValueAtTime(1350, end - 0.3);

      rocketFilter.type = 'lowpass';
      rocketFilter.frequency.setValueAtTime(180, now);
      rocketFilter.frequency.exponentialRampToValueAtTime(2800, end - 0.3);

      rocketGain.gain.setValueAtTime(0.02, now);
      rocketGain.gain.linearRampToValueAtTime(0.15, end - 0.6);
      rocketGain.gain.exponentialRampToValueAtTime(0.001, end + 0.1);

      rocketOsc.connect(rocketFilter);
      rocketFilter.connect(rocketGain);
      rocketGain.connect(this.ctx.destination);
      rocketOsc.start(now);
      rocketOsc.stop(end + 0.2);
      this.rocketNodes.push(rocketOsc);

      // 3. Accelerating Speedometer Pulse Beeps (Rocket Game Acceleration Cue)
      this.scheduleAcceleratingPulses(now, durationSec);

    } catch (e) {
      console.warn('Rocket sound engine:', e);
    }
  }

  // Rapidly accelerating telemetry pulse bursts (time intervals shrink exponentially)
  scheduleAcceleratingPulses(startTime, durationSec) {
    if (!this.ctx) return;
    let timeOffset = 0.2;
    let interval = 0.38; // Initial interval between speed bursts

    while (timeOffset < durationSec - 0.5) {
      const pulseTime = startTime + timeOffset;
      const progress = timeOffset / durationSec;
      const freq = 280 + Math.pow(progress, 2.2) * 1300; // Pitch ascends with speed

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, pulseTime);
        gain.gain.setValueAtTime(0.05 + progress * 0.08, pulseTime);
        gain.gain.exponentialRampToValueAtTime(0.001, pulseTime + Math.max(0.025, interval * 0.45));

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(pulseTime);
        osc.stop(pulseTime + Math.max(0.025, interval * 0.45));
      } catch (e) {}

      timeOffset += interval;
      interval *= 0.86; // Accelerate pulse frequency
      if (interval < 0.035) interval = 0.035;
    }
  }

  // Sonic boom impact at hero reveal
  playSonicBoom() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Deep sub-bass boom
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(160, now);
      subOsc.frequency.exponentialRampToValueAtTime(26, now + 0.9);

      subGain.gain.setValueAtTime(0.45, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.9);

      // Rocket explosive release blast
      const bufferSize = this.ctx.sampleRate * 0.5;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const out = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        out[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.5);

      const blastGain = this.ctx.createGain();
      blastGain.gain.setValueAtTime(0.35, now);
      blastGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      noise.connect(filter);
      filter.connect(blastGain);
      blastGain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.5);
    } catch (e) {}
  }

  stopRocketSequence() {
    for (let node of this.rocketNodes) {
      try { node.stop(); } catch (e) {}
    }
    this.rocketNodes = [];
  }
}

export class CinematicIntro {
  constructor(onComplete) {
    this.overlay = document.getElementById('intro-overlay');
    this.canvas = document.getElementById('intro-canvas');
    this.onComplete = onComplete;
    this.sound = new RocketSoundEngine();
    this.timeline = null;
    this.activeDrawLoop = null;
    this.totalDuration = CONFIG.intro.totalDuration || 8.5;

    if (!this.overlay) return;

    // Check prefers-reduced-motion or sessionStorage
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeenIntro = sessionStorage.getItem(CONFIG.intro.storageKey);

    if (prefersReducedMotion || hasSeenIntro) {
      this.skip(true);
      return;
    }

    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.bindEvents();
    this.startSequence();
  }

  bindEvents() {
    const skipBtn = document.getElementById('intro-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.skip(false);
      });
    }

    const audioToggle = document.getElementById('intro-audio-toggle');
    if (audioToggle) {
      audioToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isMuted = this.sound.toggleMute();
        audioToggle.classList.toggle('is-active', !isMuted);
        const text = audioToggle.querySelector('.audio-text');
        if (text) text.textContent = isMuted ? 'AUDIO: OFF' : 'ROCKET AUDIO: ON';
      });
    }

    // Auto-resume audio on first user touch/click anywhere on screen
    const userInteractionHandler = () => {
      this.sound.init();
      if (!this.sound.isMuted) {
        const audioToggle = document.getElementById('intro-audio-toggle');
        if (audioToggle) {
          audioToggle.classList.add('is-active');
          const text = audioToggle.querySelector('.audio-text');
          if (text) text.textContent = 'ROCKET AUDIO: ON';
        }
      }
      window.removeEventListener('pointerdown', userInteractionHandler);
      window.removeEventListener('keydown', userInteractionHandler);
    };
    window.addEventListener('pointerdown', userInteractionHandler, { once: true });
    window.addEventListener('keydown', userInteractionHandler, { once: true });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.isSkipped) {
        this.skip(false);
      }
    });

    window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });
    this.resizeCanvas();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    if (this.ctx) this.ctx.scale(this.dpr, this.dpr);
  }

  clearCanvas() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  startSequence() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not loaded, skipping intro.');
      this.skip(true);
      return;
    }

    // Trigger accelerating rocket audio sequence
    this.sound.startRocketSequence(this.totalDuration);

    const tl = gsap.timeline({
      onUpdate: () => {
        const prog = tl.progress() * 100;
        const bar = document.getElementById('intro-progress-bar');
        const timer = document.getElementById('intro-timer');
        if (bar) bar.style.width = `${prog}%`;
        if (timer) {
          const currentSec = (tl.time()).toFixed(2);
          timer.textContent = `${currentSec.padStart(5, '0')}s / ${this.totalDuration.toFixed(2)}s [ACCEL]`;
        }
      },
      onComplete: () => {
        this.complete();
      }
    });

    this.timeline = tl;

    // =========================================================================
    // 0.0 - 1.4s : FAST BOOT SEQUENCE (Binary Rain + Terminal Typing)
    // =========================================================================
    const bootTerm = document.getElementById('boot-terminal');
    const bootLine = document.getElementById('boot-line');

    tl.to(bootTerm, { display: 'block', opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.05);

    // Fast binary rain
    tl.add(() => {
      this.runBinaryRain(1.3);
    }, 0.1);

    // Accelerated typing: "python universe.py"
    const textToType = 'python universe.py';
    tl.to({}, {
      duration: 0.75,
      onUpdate: function() {
        const progress = this.progress();
        const chars = Math.floor(progress * textToType.length);
        if (bootLine) bootLine.textContent = textToType.substring(0, chars);
      },
      ease: 'steps(' + textToType.length + ')'
    }, 0.3);

    tl.call(() => {
      let clicks = 0;
      const interval = setInterval(() => {
        this.sound.playKeyTick();
        clicks++;
        if (clicks > 15) clearInterval(interval);
      }, 45);
    }, null, 0.3);

    tl.to(bootTerm, { opacity: 0, scale: 0.95, duration: 0.25, ease: 'power3.in' }, 1.3);
    tl.set(bootTerm, { display: 'none' }, 1.4);

    // =========================================================================
    // 1.4 - 3.4s : PYTHON RUNTIME (Fibonacci, Number Pop, SVG Snake)
    // =========================================================================
    const pyStage = document.getElementById('python-stage');
    const snakePath = document.getElementById('snake-path');

    tl.set(pyStage, { display: 'block', opacity: 0 }, 1.4);
    tl.to(pyStage, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 1.45);

    if (snakePath) {
      tl.fromTo(snakePath, 
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' },
        1.5
      );
    }

    tl.add(() => {
      this.runPoppingNumbers(1.8);
    }, 1.55);

    tl.to(pyStage, { opacity: 0, y: -20, duration: 0.25, ease: 'power3.in' }, 3.25);
    tl.set(pyStage, { display: 'none' }, 3.4);

    // =========================================================================
    // 3.4 - 5.0s : CSS DESIGN LAB (3D morphing wireframe + snapping tags)
    // =========================================================================
    const cssStage = document.getElementById('css-stage');
    const morphBox = document.getElementById('morph-box');
    const cssTags = document.querySelectorAll('.css-pill-tag');

    tl.set(cssStage, { display: 'block', opacity: 0 }, 3.4);
    tl.to(cssStage, { opacity: 1, duration: 0.25 }, 3.45);

    tl.to(morphBox, {
      rotateX: 180,
      rotateY: 45,
      borderRadius: '999px',
      borderColor: '#B6FF3B',
      duration: 0.8,
      ease: 'expo.inOut'
    }, 3.55);

    tl.to(morphBox, {
      rotateX: 360,
      rotateY: 0,
      borderRadius: '0px',
      borderColor: '#FFFFFF',
      boxShadow: '0 0 35px rgba(182, 255, 59, 0.5)',
      duration: 0.7,
      ease: 'expo.inOut'
    }, 4.25);

    cssTags.forEach((tag, idx) => {
      const positions = [
        { x: -160, y: -85 },
        { x: 160, y: -85 },
        { x: -170, y: 75 },
        { x: 170, y: 75 }
      ];
      const targetPos = positions[idx % positions.length];
      tl.fromTo(tag,
        { opacity: 0, scale: 0.5, x: 0, y: 0 },
        { opacity: 1, scale: 1, x: targetPos.x, y: targetPos.y, duration: 0.35, ease: 'back.out(1.8)' },
        3.8 + idx * 0.1
      );
    });

    tl.to(cssStage, { opacity: 0, scale: 0.8, duration: 0.25, ease: 'power3.in' }, 4.9);
    tl.set(cssStage, { display: 'none' }, 5.0);

    // =========================================================================
    // 5.0 - 7.0s : MATHS SHOWSTOPPER (Accelerated Lorenz, Fourier, Euler)
    // =========================================================================
    const mathsStage = document.getElementById('maths-stage');
    const eulerFormula = document.getElementById('maths-euler');
    const cpFlash1 = document.getElementById('cp-flash-1');
    const cpFlash2 = document.getElementById('cp-flash-2');

    tl.set(mathsStage, { display: 'block', opacity: 1 }, 5.0);

    tl.add(() => {
      this.runLorenzAndFourier(1.9);
    }, 5.0);

    if (cpFlash1) {
      tl.fromTo(cpFlash1, 
        { opacity: 0, scale: 0.8 }, 
        { opacity: 1, scale: 1, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 
        5.3
      );
    }
    if (cpFlash2) {
      tl.fromTo(cpFlash2, 
        { opacity: 0, scale: 0.8 }, 
        { opacity: 1, scale: 1, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 
        5.8
      );
    }

    tl.to(eulerFormula, {
      opacity: 1,
      scale: 1.05,
      duration: 0.7,
      ease: 'power3.out'
    }, 6.1);

    tl.to(eulerFormula, {
      opacity: 0,
      scale: 1.25,
      duration: 0.25,
      ease: 'power2.in'
    }, 6.9);

    // =========================================================================
    // 7.0 - 8.0s : CONVERGENCE & ROCKET HYPERDRIVE
    // =========================================================================
    const convergencePoint = document.getElementById('convergence-point');
    const flashOverlay = document.getElementById('flash-overlay');

    tl.set(convergencePoint, { opacity: 1, scale: 0 }, 7.0);

    tl.add(() => {
      this.runConvergenceCollapse(1.0);
    }, 7.0);

    tl.to(convergencePoint, {
      scale: 18,
      duration: 0.95,
      ease: 'power4.in'
    }, 7.05);

    // Hyperdrive white flash implosion
    tl.to(flashOverlay, {
      opacity: 1,
      duration: 0.09,
      ease: 'power4.in'
    }, 7.95);

    // =========================================================================
    // 8.0 - 8.5s : SONIC BOOM REVEAL & HERO TRANSITION
    // =========================================================================
    tl.call(() => {
      this.sound.playSonicBoom();
    }, null, 8.02);

    tl.to(flashOverlay, {
      opacity: 0,
      duration: 0.38,
      ease: 'power2.out'
    }, 8.05);

    tl.to(this.overlay, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.out',
      onComplete: () => {
        this.complete();
      }
    }, 8.15);
  }

  // --- CANVAS ANIMATIONS (High-speed rendering) ---
  runBinaryRain(durationSec) {
    if (!this.ctx) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const chars = '0101010101<>+=[]{}λπΣ';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    const startTime = performance.now();
    const loop = (now) => {
      const elapsed = (now - startTime) / 1000;
      if (elapsed > durationSec || this.isSkipped) {
        this.clearCanvas();
        return;
      }

      this.ctx.fillStyle = 'rgba(7, 8, 10, 0.3)';
      this.ctx.fillRect(0, 0, width, height);

      this.ctx.font = `${fontSize}px JetBrains Mono`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const isLime = Math.random() > 0.82;
        this.ctx.fillStyle = isLime ? '#B6FF3B' : 'rgba(255, 255, 255, 0.45)';
        this.ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.95) {
          drops[i] = 0;
        }
        drops[i] += 2; // Double drop speed
      }

      this.activeDrawLoop = requestAnimationFrame(loop);
    };

    this.activeDrawLoop = requestAnimationFrame(loop);
  }

  runPoppingNumbers(durationSec) {
    if (!this.ctx) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const fibs = ['0', '1', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '144', '233', 'O(1)'];
    const particles = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        text: fibs[Math.floor(Math.random() * fibs.length)],
        x: width / 2 + (Math.random() - 0.5) * 440,
        y: height / 2 + (Math.random() - 0.5) * 220,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5 - 2,
        alpha: 1,
        size: Math.random() * 10 + 14
      });
    }

    const startTime = performance.now();
    const loop = (now) => {
      const elapsed = (now - startTime) / 1000;
      if (elapsed > durationSec || this.isSkipped) {
        this.clearCanvas();
        return;
      }

      this.ctx.clearRect(0, 0, width, height);
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.022;

        if (p.alpha > 0) {
          this.ctx.fillStyle = `rgba(182, 255, 59, ${Math.max(0, p.alpha)})`;
          this.ctx.font = `600 ${p.size}px JetBrains Mono`;
          this.ctx.fillText(p.text, p.x, p.y);
        }
      }

      this.activeDrawLoop = requestAnimationFrame(loop);
    };

    this.activeDrawLoop = requestAnimationFrame(loop);
  }

  runLorenzAndFourier(durationSec) {
    if (!this.ctx) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const cx = width / 2;
    const cy = height / 2;

    let lx = 0.1, ly = 0, lz = 0;
    const a = 10, b = 28, c = 8 / 3;
    const dt = 0.012;
    const points = [];
    let angle = 0;

    const startTime = performance.now();
    const loop = (now) => {
      const elapsed = (now - startTime) / 1000;
      if (elapsed > durationSec || this.isSkipped) {
        this.clearCanvas();
        return;
      }

      this.ctx.fillStyle = 'rgba(7, 8, 10, 0.22)';
      this.ctx.fillRect(0, 0, width, height);

      // Fast calculations: 18 Lorenz iterations per frame
      for (let i = 0; i < 18; i++) {
        const dx = a * (ly - lx) * dt;
        const dy = (lx * (b - lz) - ly) * dt;
        const dz = (lx * ly - c * lz) * dt;
        lx += dx; ly += dy; lz += dz;
        points.push({ x: lx, y: ly, z: lz });
        if (points.length > 550) points.shift();
      }

      angle += 0.025; // Faster rotation
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const scale = Math.min(width, height) / 55;

      this.ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const rx = p.x * cosA - p.z * sinA;
        const px = cx + rx * scale;
        const py = cy + (p.y - 25) * scale;

        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.strokeStyle = 'rgba(182, 255, 59, 0.85)';
      this.ctx.lineWidth = 1.6;
      this.ctx.shadowColor = '#B6FF3B';
      this.ctx.shadowBlur = 10;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      this.activeDrawLoop = requestAnimationFrame(loop);
    };

    this.activeDrawLoop = requestAnimationFrame(loop);
  }

  runConvergenceCollapse(durationSec) {
    if (!this.ctx) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const cx = width / 2;
    const cy = height / 2;

    const particles = [];
    for (let i = 0; i < 160; i++) {
      const dist = Math.random() * Math.min(width, height) * 0.5 + 40;
      const ang = Math.random() * Math.PI * 2;
      particles.push({
        dist: dist,
        angle: ang,
        speed: Math.random() * 12 + 8,
        size: Math.random() * 2.5 + 1
      });
    }

    const startTime = performance.now();
    const loop = (now) => {
      const elapsed = (now - startTime) / 1000;
      if (elapsed > durationSec || this.isSkipped) {
        this.clearCanvas();
        return;
      }

      this.ctx.fillStyle = 'rgba(7, 8, 10, 0.4)';
      this.ctx.fillRect(0, 0, width, height);

      // Violent rocket camera shake during hyperdrive
      const shakeX = (Math.random() - 0.5) * (elapsed * 10);
      const shakeY = (Math.random() - 0.5) * (elapsed * 10);
      this.overlay.style.transform = `translate(${shakeX}px, ${shakeY}px)`;

      for (let p of particles) {
        p.dist -= p.speed;
        p.angle += 0.12;
        const px = cx + Math.cos(p.angle) * Math.max(0, p.dist);
        const py = cy + Math.sin(p.angle) * Math.max(0, p.dist);

        this.ctx.fillStyle = '#B6FF3B';
        this.ctx.beginPath();
        this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.activeDrawLoop = requestAnimationFrame(loop);
    };

    this.activeDrawLoop = requestAnimationFrame(loop);
  }

  skip(immediate = false) {
    if (this.isSkipped) return;
    this.isSkipped = true;

    if (this.timeline) {
      this.timeline.pause();
    }
    if (this.activeDrawLoop) {
      cancelAnimationFrame(this.activeDrawLoop);
    }
    this.sound.stopRocketSequence();
    this.clearCanvas();

    if (immediate) {
      if (this.overlay) this.overlay.classList.add('intro-hidden');
      sessionStorage.setItem(CONFIG.intro.storageKey, 'true');
      if (this.onComplete) this.onComplete();
    } else {
      if (this.overlay) {
        gsap.to(this.overlay, {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
          onComplete: () => {
            this.overlay.classList.add('intro-hidden');
            sessionStorage.setItem(CONFIG.intro.storageKey, 'true');
            if (this.onComplete) this.onComplete();
          }
        });
      }
    }
  }

  complete() {
    if (this.isSkipped) return;
    this.isSkipped = true;
    if (this.overlay) this.overlay.classList.add('intro-hidden');
    sessionStorage.setItem(CONFIG.intro.storageKey, 'true');
    if (this.onComplete) this.onComplete();
  }
}
