// Theme toggle with persistence
const themeToggleButton = document.getElementById('themeToggle');
const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
const savedTheme = localStorage.getItem('theme') || (prefersLight ? 'light' : 'dark');

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
}

applyTheme(savedTheme);

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

themeToggleButton?.addEventListener('click', toggleTheme);
window.addEventListener('keydown', (e) => {
  if ((e.key === 't' || e.key === 'T') && !e.metaKey && !e.ctrlKey && !e.altKey) {
    toggleTheme();
  }
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Easter eggs (English-only)
// 1) Konami code reveals toast and toggles a hidden gallery grid outline
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;

const egg = document.getElementById('easter-egg');
const eggClose = document.getElementById('eggClose');
eggClose?.addEventListener('click', () => egg.classList.remove('show'));

window.addEventListener('keydown', (e) => {
  if (e.key === konami[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === konami.length) {
      konamiIdx = 0;
      egg.classList.add('show');
      document.body.classList.toggle('grid-mode');
    }
  } else {
    konamiIdx = 0;
  }
});

// 2) Press G to toggle gallery grid borders
window.addEventListener('keydown', (e) => {
  if ((e.key === 'g' || e.key === 'G') && !e.metaKey && !e.ctrlKey && !e.altKey) {
    egg.classList.add('show');
    document.body.classList.toggle('grid-mode');
  }
});

// Accessibility: focus outline when tabbing
function handleFirstTab(e) {
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
  }
}
window.addEventListener('keydown', handleFirstTab);

// Optional: styles for grid-mode and tabbing
const style = document.createElement('style');
style.textContent = `
  body.grid-mode .gallery img { outline: 2px dashed var(--accent-2); }
  .user-is-tabbing :focus { outline: 2px solid var(--accent); outline-offset: 2px; }
`;
document.head.appendChild(style);

