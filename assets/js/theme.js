// Gestion du thème
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Récupérer le thème sauvegardé ou utiliser la préférence système
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Appliquer le thème initial
if (savedTheme) {
  html.setAttribute('data-theme', savedTheme);
} else {
  html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
}

// Gérer le changement de thème
themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}); 