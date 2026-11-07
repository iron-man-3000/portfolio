/**
 * CONFIG.JS
 * Central configuration object for Kanan Gupta's portfolio.
 * Modify links, profile data, tech stack, and visual thresholds here.
 */

export const CONFIG = {
  profile: {
    name: 'KANAN GUPTA',
    role: 'Student',
    subtitlePhrases: [
      'student',
      'open-source nerd',
      'volleyball player',
      'python cp',
      'maths for fun'
    ],
    location: 'India',
    timezone: 'Asia/Kolkata',
    dailyDriver: 'macOS',
    currentObsession: 'Open Source',
    hobbies: 'Volleyball · Competitive Programming · Solving Maths',
    currentlySolving: 'Open Source Architecture · Codeforces in Python',
    openSourceStatus: 'first open-source contribution: loading...',
  },

  // Social & professional profiles - update '#' with your real URLs
  links: {
    github: 'https://github.com/iron-man-3000',
    linkedin: '#',
    codeforces: 'https://codeforces.com/profile/kanan.g26172',
    email: 'mailto:kanan.gupta10114@gmail.com'
  },

  // Competitive Programming & Learning Stats (100% honest, zero fluff)
  cpStats: {
    codeforces: {
      handle: 'kanan.g26172',
      rating: 'Unrated',
      title: 'Newbie',
      maxRating: 'Unrated',
      runtime: 'Python 3 / PyPy'
    },
    learning: {
      active: 'Modern JavaScript (ES6+, DOM, Web APIs)'
    }
  },

  // Tech stack chips drifting in the hero section
  // layer: 1 (fast/sharp), 2 (mid/clear), 3 (slow/slight blur)
  tech: [
    { name: 'Python', layer: 1, tip: 'Core language: learning deeply, doing CP & solving maths' },
    { name: 'PyPy3', layer: 2, tip: 'Fast JIT engine for competitive programming in Python' },
    { name: 'JavaScript', layer: 1, tip: 'Currently learning: DOM, Canvas API, events & ES6+' },
    { name: 'HTML', layer: 3, tip: 'Semantic, accessible, clean document structure' },
    { name: 'CSS', layer: 2, tip: 'Sub-pixel layout, keyframes & fluid typography' },
    { name: 'Git', layer: 1, tip: 'Branching discipline & clean atomic commits' },
    { name: 'GitHub', layer: 2, tip: 'Open source hub, issues & collaborative PRs' },
    { name: 'macOS', layer: 1, tip: 'Daily driver & UNIX terminal workflow' },
    { name: 'Algorithms', layer: 1, tip: 'Binary search, number theory & O(n log n) thinking' },
    { name: 'Data Structures', layer: 2, tip: 'Hash maps, stacks, trees & recursion' },
    { name: 'Maths', layer: 1, tip: 'Discrete maths, combinatorics & number theory' }
  ],

  // Visual palette (Strict 3-color theme: Black, White, Lime)
  colors: {
    bg: '#07080A',
    surface: '#0E1014',
    primary: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.60)',
    border: 'rgba(255, 255, 255, 0.15)',
    borderStrong: 'rgba(255, 255, 255, 0.35)',
    accent: '#B6FF3B',
    accentDim: 'rgba(182, 255, 59, 0.15)',
    accentGlow: 'rgba(182, 255, 59, 0.45)'
  },

  // Fast-forwarded cinematic intro configuration (8.5s accelerated rocket sequence)
  intro: {
    totalDuration: 8.5, // seconds (accelerated)
    storageKey: 'kg_universe_intro_seen_v2', // refreshed storage flag
    forceSkipOnReducedMotion: true
  }
};
