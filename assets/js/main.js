// Gestion du menu mobile
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  const menuButton = document.createElement('button');
  menuButton.classList.add('menu-button');
  menuButton.innerHTML = `
    <span class="menu-icon"></span>
    <span class="menu-icon"></span>
    <span class="menu-icon"></span>
  `;

  // Ajouter le bouton de menu sur mobile
  if (window.innerWidth <= 768) {
    nav.insertBefore(menuButton, nav.firstChild);
    const menu = nav.querySelector('ul');
    menu.style.display = 'none';

    menuButton.addEventListener('click', () => {
      menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
    });
  }

  // Gestion du scroll
  let lastScroll = 0;
  const header = document.querySelector('header');

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
      header.classList.remove('scroll-up');
      return;
    }

    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
      // Scroll vers le bas
      header.classList.remove('scroll-up');
      header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
      // Scroll vers le haut
      header.classList.remove('scroll-down');
      header.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
  });

  // Gestion des liens actifs
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('nav a');

  links.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // Gestion des images lazy loading
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.dataset.src;
    });
  } else {
    // Fallback pour les navigateurs qui ne supportent pas le lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }

  // Gestion du mode sombre
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const darkModeToggle = document.createElement('button');
  darkModeToggle.classList.add('dark-mode-toggle');
  darkModeToggle.innerHTML = '🌙';
  document.body.appendChild(darkModeToggle);

  const setDarkMode = (isDark) => {
    document.documentElement.classList.toggle('dark-mode', isDark);
    darkModeToggle.innerHTML = isDark ? '☀️' : '🌙';
  };

  darkModeMediaQuery.addListener((e) => setDarkMode(e.matches));
  setDarkMode(darkModeMediaQuery.matches);

  darkModeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    darkModeToggle.innerHTML = isDark ? '☀️' : '🌙';
  });
}); 