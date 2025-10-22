(function () {
  const TOGGLE_ID = 'theme-toggle';
  const STORAGE_KEY = 'site-theme';
  const toggle = document.getElementById(TOGGLE_ID);
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (toggle) toggle.textContent = '☀️';
      if (toggle) toggle.setAttribute('aria-pressed', 'true');
    } else {
      root.removeAttribute('data-theme');
      if (toggle) toggle.textContent = '🌙';
      if (toggle) toggle.setAttribute('aria-pressed', 'false');
    }
  }

  // init from storage or prefers-color-scheme
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
    });
  }
})();