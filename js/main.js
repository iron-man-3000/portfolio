/**
 * MAIN.JS
 * Application orchestrator:
 * - Boot & Cinematic Intro coordination
 * - Live IST Clock & HUD status
 * - Interactive custom cursor with lime trail
 * - Scroll reveals & animated skill rings
 * - Interactive Open Source terminal CLI
 * - Konami code & DevTools console easter eggs
 */

import { CONFIG } from './config.js';
import { Starfield } from './starfield.js';
import { CinematicIntro } from './intro.js';
import { HeroController } from './hero.js';

class App {
  constructor() {
    this.starfield = null;
    this.hero = null;
    this.intro = null;
    this.cursor = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2
    };
    this.lastScrollY = window.scrollY;

    this.init();
  }

  init() {
    this.applyConfig();
    this.setupISTClock();
    this.setupCursor();
    this.setupScrollProgress();
    this.setupStickyNav();
    this.setupScrollReveals();
    this.setupOpenSourceTerminal();
    this.setupEasterEggs();

    // Replay intro button in nav
    const replayBtn = document.getElementById('replay-intro-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        sessionStorage.removeItem(CONFIG.intro.storageKey);
        window.location.reload();
      });
    }

    // Start background canvas
    this.starfield = new Starfield('starfield-canvas');

    // Run or skip Cinematic Intro
    this.intro = new CinematicIntro(() => {
      this.onIntroComplete();
    });
  }

  // Populate dynamic DOM fields from CONFIG object
  applyConfig() {
    // Dynamic year in footer
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Currently solving HUD text
    const solvingEl = document.getElementById('hud-solving-text');
    if (solvingEl) solvingEl.textContent = CONFIG.profile.currentlySolving;

    // Open source loading status
    const osStatusEl = document.getElementById('os-status-text');
    if (osStatusEl) osStatusEl.textContent = CONFIG.profile.openSourceStatus;

    // CF Rating placeholders
    const cfRatingEl = document.getElementById('cf-rating-val');
    if (cfRatingEl) cfRatingEl.textContent = CONFIG.cpStats.codeforces.rating;

    const cfHandleEl = document.getElementById('cf-handle-val');
    if (cfHandleEl) cfHandleEl.textContent = CONFIG.cpStats.codeforces.handle;

    const cfTitleEl = document.getElementById('cf-title-val');
    if (cfTitleEl) cfTitleEl.textContent = CONFIG.cpStats.codeforces.title;

    // Apply social links from config
    const cfProfileUrl = CONFIG.links.codeforces !== '#' 
      ? CONFIG.links.codeforces 
      : (CONFIG.cpStats.codeforces.handle ? `https://codeforces.com/profile/${CONFIG.cpStats.codeforces.handle}` : '#');

    const socialLinks = {
      'social-link-github': CONFIG.links.github,
      'social-link-linkedin': CONFIG.links.linkedin,
      'social-link-codeforces': cfProfileUrl,
      'social-link-email': CONFIG.links.email
    };

    for (let [id, url] of Object.entries(socialLinks)) {
      const el = document.getElementById(id);
      if (el) {
        el.href = url;
        if (url.startsWith('http')) {
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
        }
      }
    }

    // Trigger live Codeforces API sync
    this.syncCodeforcesLive();
  }

  // Live Codeforces API Sync
  async syncCodeforcesLive() {
    const handle = CONFIG.cpStats.codeforces.handle;
    if (!handle || handle === '#' || handle === 'kanan_g_placeholder') return;

    try {
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === 'OK' && data.result && data.result.length > 0) {
        const user = data.result[0];

        const ratingEl = document.getElementById('cf-rating-val');
        const handleEl = document.getElementById('cf-handle-val');
        const titleEl = document.getElementById('cf-title-val');
        const badgeEl = document.querySelector('.cp-badge');
        const cfLink = document.getElementById('social-link-codeforces');

        if (handleEl) handleEl.textContent = user.handle;
        if (ratingEl) {
          ratingEl.textContent = user.rating !== undefined ? user.rating : 'Unrated';
        }
        if (titleEl) {
          titleEl.textContent = user.rank 
            ? (user.rank.charAt(0).toUpperCase() + user.rank.slice(1)) 
            : 'Newbie / Active';
        }
        if (badgeEl) {
          badgeEl.textContent = 'API SYNCED';
          badgeEl.style.borderColor = '#B6FF3B';
          badgeEl.style.boxShadow = '0 0 8px rgba(182, 255, 59, 0.4)';
        }
        if (cfLink) {
          cfLink.href = `https://codeforces.com/profile/${user.handle}`;
          cfLink.target = '_blank';
          cfLink.rel = 'noopener noreferrer';
        }

        // Update in-memory config for interactive terminal
        CONFIG.cpStats.codeforces.rating = user.rating || CONFIG.cpStats.codeforces.rating;
        CONFIG.cpStats.codeforces.title = user.rank || CONFIG.cpStats.codeforces.title;
        CONFIG.cpStats.codeforces.handle = user.handle;
      }
    } catch (err) {
      console.info('Codeforces API offline or rate-limited; using cached config stats.');
    }
  }

  // Called after intro finishes or is skipped
  onIntroComplete() {
    // Initialize hero letter physics & tech chips orbit
    if (!this.hero) {
      this.hero = new HeroController();
    }

    // Hero letter assembly reveal animation
    if (typeof gsap !== 'undefined') {
      gsap.from('.name-char', {
        y: 60,
        opacity: 0,
        rotateX: -45,
        duration: 0.9,
        stagger: 0.04,
        ease: 'power3.out'
      });

      gsap.from('.tech-chip', {
        scale: 0.5,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'back.out(1.5)',
        delay: 0.2
      });
    }
  }

  // Live IST Clock
  setupISTClock() {
    const clockEl = document.getElementById('live-ist-clock');
    if (!clockEl) return;

    const updateClock = () => {
      const now = new Date();
      // Format time in Asia/Kolkata
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const timeStr = new Intl.DateTimeFormat('en-GB', options).format(now);
      clockEl.textContent = `${timeStr} IST`;
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  // Context-aware Custom Cursor
  setupCursor() {
    const cursorEl = document.getElementById('custom-cursor');
    const ringEl = cursorEl ? cursorEl.querySelector('.cursor-ring') : null;
    if (!cursorEl || !ringEl) return;

    document.body.classList.add('custom-cursor-active');

    window.addEventListener('mousemove', (e) => {
      this.cursor.targetX = e.clientX;
      this.cursor.targetY = e.clientY;
    }, { passive: true });

    // Smooth cursor follower loop
    const cursorLoop = () => {
      this.cursor.x += (this.cursor.targetX - this.cursor.x) * 0.25;
      this.cursor.y += (this.cursor.targetY - this.cursor.y) * 0.25;

      cursorEl.style.transform = `translate3d(${this.cursor.x}px, ${this.cursor.y}px, 0)`;
      requestAnimationFrame(cursorLoop);
    };
    requestAnimationFrame(cursorLoop);

    // Expand cursor over interactive elements
    const interactiveSelectors = 'a, button, input, textarea, .tech-chip, .skill-ring-card, .name-char';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => cursorEl.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorEl.classList.remove('hovering'));
    });
  }

  // Scroll Progress Bar
  setupScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0;
      bar.style.width = `${progress}%`;
    }, { passive: true });
  }

  // Sticky HUD Nav (Hides on scroll-down, reveals on scroll-up)
  setupStickyNav() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > this.lastScrollY) {
        nav.classList.add('nav-hidden');
      } else {
        nav.classList.remove('nav-hidden');
      }
      this.lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // Split-text line reveals & SVG skill progress rings
  setupScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-inner');
    const ringFills = document.querySelectorAll('.ring-fill');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    revealElements.forEach(el => observer.observe(el));

    // Skill SVG Ring animation
    const ringObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const circle = entry.target;
          const percent = parseInt(circle.dataset.percent || '0', 10);
          const circumference = 251.2; // 2 * pi * 40
          const offset = circumference - (circumference * percent) / 100;
          circle.style.strokeDashoffset = offset;
          ringObserver.unobserve(circle);
        }
      });
    }, { threshold: 0.3 });

    ringFills.forEach(ring => ringObserver.observe(ring));
  }

  // Interactive Open Source Terminal CLI Card
  setupOpenSourceTerminal() {
    const cliInput = document.getElementById('terminal-cli-input');
    const cliOutput = document.getElementById('terminal-cli-output');
    if (!cliInput || !cliOutput) return;

    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const rawCmd = cliInput.value.trim();
        cliInput.value = '';
        if (!rawCmd) return;

        this.handleTerminalCommand(rawCmd, cliOutput);
      }
    });
  }

  handleTerminalCommand(cmd, outputContainer) {
    const commandLower = cmd.toLowerCase();

    // Print command entered
    const cmdEcho = document.createElement('div');
    cmdEcho.className = 'cmd-line';
    cmdEcho.innerHTML = `<span class="cmd-prefix">$</span><span class="cmd-text">${cmd}</span>`;
    outputContainer.appendChild(cmdEcho);

    let reply = '';
    switch (commandLower) {
      case 'help':
        reply = 'Available commands: <span class="log-lime">status</span>, <span class="log-lime">stack</span>, <span class="log-lime">cp</span>, <span class="log-lime">hobbies</span>, <span class="log-lime">contact</span>, <span class="log-lime">clear</span>, <span class="log-lime">whoami</span>';
        break;
      case 'status':
        reply = `Status: <span class="log-lime">Focusing on Open Source architecture</span> &amp; Codeforces in Python.`;
        break;
      case 'stack':
        reply = 'Core Stack: Python (CP &amp; Scripting), JavaScript (Learning), HTML, CSS, Git, macOS, Algorithms, Number Theory.';
        break;
      case 'cp':
        reply = `Codeforces: <span class="log-lime">${CONFIG.cpStats.codeforces.rating}</span> (${CONFIG.cpStats.codeforces.title}) · Runtime: Python 3 / PyPy`;
        break;
      case 'hobbies':
        reply = 'Hobbies: <span class="log-lime">Playing Volleyball</span> · Solving Discrete Maths · Competitive Programming.';
        break;
      case 'contact':
        reply = `Mail me directly at <a href="${CONFIG.links.email}" style="color: #B6FF3B; text-decoration: underline;">kanan.gupta10114@gmail.com</a>`;
        break;
      case 'clear':
        outputContainer.innerHTML = '';
        return;
      case 'whoami':
        reply = 'kanan-gupta: student, volleyball player, open source enthusiast &amp; competitive programmer in Python.';
        break;
      case 'sudo':
        reply = 'Permission denied: no sudo needed in a meritocracy.';
        break;
      default:
        reply = `command not found: "${cmd}". Type <span class="log-lime">help</span> for command list.`;
    }

    const logEntry = document.createElement('div');
    logEntry.className = 'terminal-log';
    logEntry.innerHTML = reply;
    outputContainer.appendChild(logEntry);

    // Scroll to bottom of terminal card
    const card = document.getElementById('open-source-terminal');
    if (card) card.scrollTop = card.scrollHeight;
  }

  // Konami Code & Console Easter Eggs
  setupEasterEggs() {
    // 1. Console ASCII Banner & Secret commands
    console.log(
      `%c
   __ __ ___   _  _____   _  __  ______  ______  _________
  / //_// _ | / |/ / _ | / |/ / / ____/ / / / / /_  __/ _ |
 / ,<  / __ |/    / __ |/    / / /_  _ / /_/ /   / / / __ |
/_/|_|/_/ |_/_/|_/_/ |_/_/|_/  \\____/(_)____/   /_/ /_/ |_|
                                                           
>> Kanan Gupta Portfolio OS [Version 2.0]
>> Dark, Sci-Fi Coding Universe loaded.
>> Type "overclock()" or press the Konami code for overclock mode.
      `,
      'color: #B6FF3B; font-family: monospace; font-size: 11px; font-weight: bold;'
    );

    window.overclock = () => this.activateOverclockMode();

    // 2. Konami Code: Up Up Down Down Left Right Left Right B A
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];
    let konamiIndex = 0;

    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === konamiSequence[konamiIndex].toLowerCase()) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
          konamiIndex = 0;
          this.activateOverclockMode();
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  activateOverclockMode() {
    document.body.style.filter = 'invert(1) hue-rotate(180deg)';
    console.log('%c[SYSTEM] OVERCLOCK MODE ACTIVATED. Welcome to the machine.', 'color: #B6FF3B; font-weight: bold; font-size: 14px;');

    const alertBanner = document.createElement('div');
    alertBanner.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 20px;
      background: #B6FF3B;
      color: #07080A;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: bold;
      z-index: 100000;
      box-shadow: 0 0 20px #B6FF3B;
    `;
    alertBanner.textContent = '[SYSTEM OVERCLOCKED: 100% MERITOCRACY]';
    document.body.appendChild(alertBanner);

    setTimeout(() => {
      document.body.style.filter = '';
      setTimeout(() => alertBanner.remove(), 2500);
    }, 3000);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
