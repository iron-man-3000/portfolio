# Kanan Gupta — Developer Portfolio

Welcome to the personal portfolio of **Kanan Gupta** — student, open-source enthusiast, competitive programmer in Python, and volleyball player.

This site is built as a dark, futuristic "coding universe" using vanilla web technologies (HTML, CSS, JavaScript). It requires **no build step, no npm packages, and no frameworks** — it runs directly in any modern browser.

---

## 🌟 Quick Overview

- **Live Website**: [https://iron-man-3000.github.io/portfolio/](https://iron-man-3000.github.io/portfolio/)
- **GitHub Repository**: [https://github.com/iron-man-3000/portfolio](https://github.com/iron-man-3000/portfolio)
- **Local Preview**: `http://localhost:8000`
- **Primary Languages**: Python (competitive programming & math), JavaScript (currently learning)
- **Daily Driver**: macOS (Zsh & Terminal)
- **Current Obsession**: Open-source software architecture
- **Hobbies**: Playing volleyball & solving discrete math puzzles
- **Codeforces**: [`kanan.g26172`](https://codeforces.com/profile/kanan.g26172) (Live API connected)
- **Email**: [`kanan.gupta10114@gmail.com`](mailto:kanan.gupta10114@gmail.com)

---

## 📁 File Guide (What Every File Does)

The codebase is kept clean, modular, and organized into small, single-purpose files:

```
portfolio/
├── index.html          # The main webpage & document structure
├── css/
│   ├── base.css        # Palette variables, typography, custom cursor, film grain
│   ├── intro.css       # CRT scanlines & rocket boot sequence styling
│   ├── hero.css        # 3D floating name, tech chips & constellation layout
│   └── sections.css    # About grid, skill rings, terminal card & contact form
├── js/
│   ├── config.js       # Central control room (edit all your info & links here)
│   ├── intro.js        # Rocket launch audio synthesizer & GSAP intro timeline
│   ├── starfield.js    # Canvas starfield, parallax tilt & shooting stars
│   ├── hero.js         # Spring letter repulsion, chip fling physics & constellation
│   └── main.js         # App orchestrator, live IST clock, Codeforces API & CLI
└── README.md           # Documentation and guide
```

### 📄 HTML
* **[`index.html`](file:///Users/kanangupta/Desktop/portfollio/index.html)**: The single entry point of the entire site. It lays out the semantic structure — from the boot overlay and navigation bar down to the hero, about editorial grid, skills cards, interactive open-source terminal, and transmission form.

### 🎨 CSS Stylesheets
* **[`css/base.css`](file:///Users/kanangupta/Desktop/portfollio/css/base.css)**: The visual foundation. Defines the strict 3-color palette variables (`#07080A`, `#FFFFFF`, `#B6FF3B`), font pairings (Unbounded, JetBrains Mono, Inter), the 8px spacing scale, the smooth custom cursor, and the subtle SVG film-grain texture.
* **[`css/intro.css`](file:///Users/kanangupta/Desktop/portfollio/css/intro.css)**: Controls the look of the fast-paced cinematic boot sequence — CRT television scanline overlays, blinking terminal cursors, 3D morphing wireframe boxes, and white-out flash transitions.
* **[`css/hero.css`](file:///Users/kanangupta/Desktop/portfollio/css/hero.css)**: Powers the top hero section. Styles the giant 3D floating typography ("KANAN GUPTA"), soft floor reflections, orbiting tech chip pills, and the constellation canvas.
* **[`css/sections.css`](file:///Users/kanangupta/Desktop/portfollio/css/sections.css)**: Styles the rest of the site — the asymmetric 2-column About section, animated SVG circular skill rings, the Codeforces telemetry arena card, the macOS terminal card, and the contact message composer.

### ⚡ JavaScript Modules
* **[`js/config.js`](file:///Users/kanangupta/Desktop/portfollio/js/config.js)**: **The single file you edit.** Contains all profile data, roles, social URLs, email address, Codeforces handle, and tech chip tags. Changing values here automatically updates the entire site without touching HTML or CSS.
* **[`js/intro.js`](file:///Users/kanangupta/Desktop/portfollio/js/intro.js)**: Orchestrates the fast 8.5-second intro animation using GSAP. It also includes the **Rocket Sound Engine** (built with Web Audio API) which synthesizes engine thrust rumble, a rising pitch turbine, accelerating speed pulses, and a sonic boom reveal.
* **[`js/starfield.js`](file:///Users/kanangupta/Desktop/portfollio/js/starfield.js)**: Powers the background starry canvas. Renders twinkling stars, responsive parallax mouse-tilt, and occasional electric lime shooting stars, with an automatic FPS throttle that keeps performance locked at 60 FPS.
* **[`js/hero.js`](file:///Users/kanangupta/Desktop/portfollio/js/hero.js)**: The interactive physics engine. Breaks the name into individual letter elements that float on mathematical sine waves and push away from your mouse cursor using spring damping. It also enables clicking and flinging tech chips with inertia and draws dynamic constellation lines.
* **[`js/main.js`](file:///Users/kanangupta/Desktop/portfollio/js/main.js)**: The application coordinator. Manages the live IST clock (`Asia/Kolkata`), connects to the public Codeforces API to sync your rating live, runs the interactive terminal card CLI, and listens for the Konami code easter egg.

---

## 🎮 Interactive Features to Try

1. **Accelerated Rocket Intro**: Loads when you open the page (8.5s). Click anywhere on the screen to hear the accelerating rocket thrust sound. Replay it anytime with the `[↻ INTRO]` button in the top menu.
2. **Interactive 3D Name**: Move your cursor over **KANAN GUPTA** to watch the letters repel your pointer and see the entire section tilt in 3D perspective.
3. **Flingable Tech Chips**: Click, drag, and throw any chip (`Python`, `PyPy3`, `macOS`, etc.) across the screen — it will fly with momentum and spring back to its orbital path.
4. **Interactive Terminal Card**: In the Open Source section, type commands into the terminal prompt:
   - `help` — displays command directory
   - `status` — current open-source mission
   - `stack` — current programming stack
   - `cp` — live Codeforces rating & runtime
   - `hobbies` — shows volleyball, maths & CP
   - `contact` — shows direct email link
5. **Overclock Easter Egg**: Press `↑ ↑ ↓ ↓ ← → ← → B A` on your keyboard (or type `overclock()` in the browser console) for a visual surprise.

---

## 🎨 Design Discipline & Palette

| Color | Hex | Role |
| :--- | :--- | :--- |
| **Midnight Black** | `#07080A` | Deep canvas background |
| **Raised Surface** | `#0E1014` | Cards, terminal window, and HUD bars |
| **Pure White** | `#FFFFFF` | Primary text and structural 1px rules |
| **Electric Lime** | `#B6FF3B` | Single accent: glowing highlights, cursor, and interactive states |

*Strict rule: Only `0px` (sharp architectural edges) and `999px` (clean pills) border radii are used across the entire site.*

---

## 🚀 How to Run Locally

Because the project is built with standard web technologies, **no build process is needed**.

### Option 1: Python One-Liner (Recommended)
Open a terminal inside the project folder and run:
```bash
python3 -m http.server 8000
```
Then visit **`http://localhost:8000`** in your browser.

### Option 2: VS Code Live Server
1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` → **Open with Live Server**.

---

## 🌐 Free 1-Click Deployment

* **GitHub Pages**: Push this folder to a GitHub repository, head to **Settings** → **Pages**, choose the `main` branch, and click **Save**.
* **Netlify Drop**: Drag and drop the whole folder directly into [app.netlify.com/drop](https://app.netlify.com/drop) for an instant live URL.

---

## 📄 License

MIT License © 2026 Kanan Gupta.
