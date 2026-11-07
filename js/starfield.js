/**
 * STARFIELD.JS
 * Canvas-based sci-fi coding universe background.
 * Sparse white starfield, mouse parallax, occasional lime shooting stars,
 * and adaptive FPS management (throttles star count if FPS < 40).
 */

export class Starfield {
  constructor(canvasId = 'starfield-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.shootingStars = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.mouse = { x: this.width / 2, y: this.height / 2, targetX: this.width / 2, targetY: this.height / 2 };
    this.isRunning = false;
    this.rafId = null;

    // Performance & FPS tracking
    this.targetStars = 120;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.fps = 60;
    this.lastFpsCheck = performance.now();

    this.init();
  }

  init() {
    this.resize();
    this.createStars();

    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });

    // Handle tab visibility to save CPU and battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);

    // Adjust star density according to screen area
    const area = this.width * this.height;
    this.targetStars = Math.floor(Math.min(180, Math.max(60, area / 9000)));
    this.createStars();
  }

  createStars() {
    this.stars = [];
    for (let i = 0; i < this.targetStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.4 + 0.4,
        baseAlpha: Math.random() * 0.7 + 0.2,
        alpha: 0.5,
        twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        depth: Math.random() * 0.8 + 0.2 // Depth for parallax
      });
    }
  }

  onMouseMove(e) {
    this.mouse.targetX = e.clientX;
    this.mouse.targetY = e.clientY;
  }

  spawnShootingStar() {
    // Only spawn occasionally (every ~5-8 seconds or random roll)
    if (Math.random() < 0.006 && this.shootingStars.length < 2) {
      const startX = Math.random() * this.width;
      const startY = Math.random() * (this.height * 0.4);
      const angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1);
      const speed = Math.random() * 10 + 12;

      this.shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 90 + 60,
        alpha: 1,
        life: 1.0,
        decay: Math.random() * 0.018 + 0.015
      });
    }
  }

  update(now) {
    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    const offsetX = (this.mouse.x - this.width / 2) * 0.03;
    const offsetY = (this.mouse.y - this.height / 2) * 0.03;

    // Twinkle & wrap stars
    for (let star of this.stars) {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > star.baseAlpha || star.alpha < 0.1) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }
    }

    // Update shooting stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life -= ss.decay;
      if (ss.life <= 0 || ss.x > this.width + 100 || ss.y > this.height + 100) {
        this.shootingStars.splice(i, 1);
      }
    }

    this.spawnShootingStar();

    // FPS Performance Monitor
    this.frameCount++;
    if (now - this.lastFpsCheck >= 1000) {
      this.fps = (this.frameCount * 1000) / (now - this.lastFpsCheck);
      this.frameCount = 0;
      this.lastFpsCheck = now;

      // Auto-reduce star count if FPS drops below 40
      if (this.fps < 40 && this.stars.length > 40) {
        this.stars.splice(0, 15);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const offsetX = (this.mouse.x - this.width / 2) * 0.03;
    const offsetY = (this.mouse.y - this.height / 2) * 0.03;

    // Draw static stars with parallax
    for (let star of this.stars) {
      const px = star.x - offsetX * star.depth;
      const py = star.y - offsetY * star.depth;

      this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, star.alpha))})`;
      this.ctx.beginPath();
      this.ctx.arc(px, py, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw lime shooting stars
    for (let ss of this.shootingStars) {
      const tailX = ss.x - (ss.vx / 10) * ss.length;
      const tailY = ss.y - (ss.vy / 10) * ss.length;

      const gradient = this.ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(182, 255, 59, ${ss.life})`);
      gradient.addColorStop(1, 'rgba(182, 255, 59, 0)');

      this.ctx.beginPath();
      this.ctx.moveTo(ss.x, ss.y);
      this.ctx.lineTo(tailX, tailY);
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // Glowing head
      this.ctx.fillStyle = `rgba(255, 255, 255, ${ss.life})`;
      this.ctx.beginPath();
      this.ctx.arc(ss.x, ss.y, 1.8, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  loop(now) {
    if (!this.isRunning) return;
    this.update(now);
    this.draw();
    this.rafId = requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.rafId = requestAnimationFrame((now) => this.loop(now));
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
